import uuid
from datetime import datetime
import numpy as np
from sqlalchemy.orm import Session
from app.models.component import Component
from app.models.supplier import Supplier
from app.models.demand import DemandHistory
from app.models.reorder_plan import ReorderPlan
from app.simulation.probabilistic_policy import ProbabilisticPolicy
from app.simulation.baseline import BaselinePolicy
from app.simulation.monte_carlo import MonteCarloSimulator
from app.services.audit_service import AuditService

class ReorderService:
    @staticmethod
    def calculate_recommendation(
        db: Session,
        component_id: str,
        service_target: float = 0.95,
        simulation_runs: int = 10000
    ):
        component = db.query(Component).filter(Component.component_id == component_id).first()
        if not component:
            raise ValueError(f"Component '{component_id}' not found.")

        supplier = db.query(Supplier).filter(Supplier.supplier_id == component.supplier_id).first()
        if not supplier:
            raise ValueError(f"Supplier '{component.supplier_id}' not found for component '{component_id}'.")

        # Check pack size validity
        if component.pack_size <= 0:
            raise ValueError(f"Invalid pack size ({component.pack_size}) for component '{component_id}'. Must be > 0.")

        # Fetch demand history
        demands = [d.demand_quantity for d in db.query(DemandHistory).filter(DemandHistory.component_id == component_id).all()]
        if len(demands) > 0:
            demand_mean = float(np.mean(demands))
            demand_std = float(np.std(demands)) if len(demands) > 1 else demand_mean * 0.2
        else:
            demand_mean = 100.0
            demand_std = 20.0

        # Calculate probabilistic policy
        policy_result = ProbabilisticPolicy.calculate_policy(
            demand_mean=demand_mean,
            demand_std=demand_std,
            avg_lead_time=supplier.avg_lead_time,
            lead_time_std=supplier.lead_time_std,
            reliability=supplier.reliability,
            fill_rate=supplier.fill_rate,
            pack_size=component.pack_size,
            unit_cost=component.unit_cost,
            holding_cost=component.holding_cost,
            order_cost=component.order_cost,
            service_target=service_target,
            n_simulations=simulation_runs
        )

        # Expected cost & emissions calculations
        annual_holding = (policy_result["reorder_point"] / 2.0) * component.holding_cost
        expected_stockout = policy_result["stockout_probability"] * component.stockout_cost * demand_mean * 30.0
        expected_order_cost = (demand_mean * 365.0 / policy_result["recommended_order_quantity"]) * component.order_cost
        expected_total_cost = annual_holding + expected_stockout + expected_order_cost

        estimated_emissions_kg = (policy_result["recommended_order_quantity"] * 1.0 * supplier.distance_km * supplier.emission_factor)

        # Save or update plan in db
        existing_plan = db.query(ReorderPlan).filter(
            ReorderPlan.component_id == component_id,
            ReorderPlan.status.in_(["RECOMMENDED", "APPROVED", "MODIFIED"])
        ).order_by(ReorderPlan.version.desc()).first()

        plan_id = existing_plan.plan_id if existing_plan else f"PLAN-{uuid.uuid4().hex[:8].upper()}"
        version = (existing_plan.version + 1) if existing_plan else 1

        db_plan = ReorderPlan(
            plan_id=plan_id,
            component_id=component_id,
            reorder_point=policy_result["reorder_point"],
            order_quantity=policy_result["recommended_order_quantity"],
            service_target=service_target,
            stockout_probability=policy_result["stockout_probability"],
            expected_cost=round(expected_total_cost, 2),
            estimated_emissions=round(estimated_emissions_kg, 2),
            version=version,
            status="RECOMMENDED",
            created_by="probabilistic_ai_engine"
        )
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)

        # Log initial creation audit
        AuditService.log_plan_action(
            db=db,
            plan_id=plan_id,
            component_id=component_id,
            user_id="probabilistic_ai_engine",
            action="CREATED",
            old_value=None,
            new_value={
                "reorder_point": policy_result["reorder_point"],
                "order_quantity": policy_result["recommended_order_quantity"],
                "pack_size": component.pack_size,
                "status": "RECOMMENDED"
            },
            reason=f"Generated probabilistic recommendation matching target service level {service_target*100}%",
            version=version
        )

        return {
            "plan_id": plan_id,
            "component_id": component_id,
            "component_name": component.component_name,
            "supplier_id": supplier.supplier_id,
            "supplier_name": supplier.supplier_name,
            "current_inventory": component.current_inventory,
            "pack_size": component.pack_size,
            "reorder_point": policy_result["reorder_point"],
            "recommended_order_quantity": policy_result["recommended_order_quantity"],
            "raw_unrounded_quantity": policy_result["raw_unrounded_quantity"],
            "service_target": service_target,
            "simulated_service_level": policy_result["simulated_service_level"],
            "stockout_probability": policy_result["stockout_probability"],
            "expected_holding_cost": round(annual_holding, 2),
            "expected_stockout_cost": round(expected_stockout, 2),
            "expected_order_cost": round(expected_order_cost, 2),
            "expected_total_cost": round(expected_total_cost, 2),
            "estimated_emissions_kg": round(estimated_emissions_kg, 2),
            "supplier_reliability": supplier.reliability,
            "supplier_fill_rate": supplier.fill_rate,
            "status": "RECOMMENDED",
            "version": version,
            "created_by": "probabilistic_ai_engine",
            "created_at": db_plan.created_at
        }

    @staticmethod
    def approve_recommendation(db: Session, component_id: str, user_id: str, reason: str):
        plan = db.query(ReorderPlan).filter(
            ReorderPlan.component_id == component_id
        ).order_by(ReorderPlan.version.desc()).first()

        if not plan:
            raise ValueError(f"No recommendation found for component '{component_id}'.")

        old_state = {"status": plan.status, "reorder_point": plan.reorder_point, "order_quantity": plan.order_quantity}
        
        new_version = plan.version + 1
        new_plan = ReorderPlan(
            plan_id=plan.plan_id,
            component_id=component_id,
            reorder_point=plan.reorder_point,
            order_quantity=plan.order_quantity,
            service_target=plan.service_target,
            stockout_probability=plan.stockout_probability,
            expected_cost=plan.expected_cost,
            estimated_emissions=plan.estimated_emissions,
            version=new_version,
            status="APPROVED",
            created_by=user_id
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        AuditService.log_plan_action(
            db=db,
            plan_id=plan.plan_id,
            component_id=component_id,
            user_id=user_id,
            action="APPROVED",
            old_value=old_state,
            new_value={"status": "APPROVED", "reorder_point": plan.reorder_point, "order_quantity": plan.order_quantity},
            reason=reason,
            version=new_version
        )
        return new_plan

    @staticmethod
    def modify_recommendation(
        db: Session,
        component_id: str,
        user_id: str,
        reason: str,
        new_rop: int = None,
        new_order_qty: int = None
    ):
        plan = db.query(ReorderPlan).filter(
            ReorderPlan.component_id == component_id
        ).order_by(ReorderPlan.version.desc()).first()

        if not plan:
            raise ValueError(f"No recommendation found for component '{component_id}'.")

        component = db.query(Component).filter(Component.component_id == component_id).first()

        old_state = {
            "status": plan.status,
            "reorder_point": plan.reorder_point,
            "order_quantity": plan.order_quantity
        }

        updated_rop = new_rop if new_rop is not None else plan.reorder_point
        raw_order_qty = new_order_qty if new_order_qty is not None else plan.order_quantity

        # Ensure modified order quantity still respects supplier pack size
        final_order_qty = ProbabilisticPolicy.round_to_pack_size(raw_order_qty, component.pack_size)

        new_version = plan.version + 1
        new_plan = ReorderPlan(
            plan_id=plan.plan_id,
            component_id=component_id,
            reorder_point=updated_rop,
            order_quantity=final_order_qty,
            service_target=plan.service_target,
            stockout_probability=plan.stockout_probability,
            expected_cost=plan.expected_cost,
            estimated_emissions=plan.estimated_emissions,
            version=new_version,
            status="MODIFIED",
            created_by=user_id
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        AuditService.log_plan_action(
            db=db,
            plan_id=plan.plan_id,
            component_id=component_id,
            user_id=user_id,
            action="MODIFIED",
            old_value=old_state,
            new_value={
                "status": "MODIFIED",
                "reorder_point": updated_rop,
                "order_quantity": final_order_qty,
                "pack_size_applied": component.pack_size
            },
            reason=reason,
            version=new_version
        )
        return new_plan

    @staticmethod
    def reject_recommendation(db: Session, component_id: str, user_id: str, reason: str):
        plan = db.query(ReorderPlan).filter(
            ReorderPlan.component_id == component_id
        ).order_by(ReorderPlan.version.desc()).first()

        if not plan:
            raise ValueError(f"No recommendation found for component '{component_id}'.")

        old_state = {"status": plan.status, "reorder_point": plan.reorder_point, "order_quantity": plan.order_quantity}
        
        new_version = plan.version + 1
        new_plan = ReorderPlan(
            plan_id=plan.plan_id,
            component_id=component_id,
            reorder_point=plan.reorder_point,
            order_quantity=plan.order_quantity,
            service_target=plan.service_target,
            stockout_probability=plan.stockout_probability,
            expected_cost=plan.expected_cost,
            estimated_emissions=plan.estimated_emissions,
            version=new_version,
            status="REJECTED",
            created_by=user_id
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        AuditService.log_plan_action(
            db=db,
            plan_id=plan.plan_id,
            component_id=component_id,
            user_id=user_id,
            action="REJECTED",
            old_value=old_state,
            new_value={"status": "REJECTED"},
            reason=reason,
            version=new_version
        )
        return new_plan
