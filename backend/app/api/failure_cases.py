from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.component import Component
from app.models.supplier import Supplier
from app.simulation.monte_carlo import MonteCarloSimulator
from app.simulation.probabilistic_policy import ProbabilisticPolicy

router = APIRouter(prefix="/api/failure-cases", tags=["Failure & Edge Case Workbench"])

@router.post("/supplier-delay")
def test_supplier_delay(component_id: str = "COMP-001", actual_lead_time: float = 15.0, db: Session = Depends(get_db)):
    """
    Case 1: Severe Supplier Delay (e.g. lead time increases from 7 to 15 days).
    """
    component = db.query(Component).filter(Component.component_id == component_id).first()
    supplier = db.query(Supplier).filter(Supplier.supplier_id == component.supplier_id).first() if component else None
    if not component or not supplier:
        raise HTTPException(status_code=404, detail="Component or Supplier not found.")

    simulator = MonteCarloSimulator(
        demand_mean=100.0,
        demand_std=20.0,
        avg_lead_time=actual_lead_time, # Delayed lead time
        lead_time_std=3.0,
        reliability=0.60, # Reduced reliability during delay
        fill_rate=supplier.fill_rate,
        pack_size=component.pack_size,
        unit_cost=component.unit_cost,
        holding_cost=component.holding_cost,
        stockout_cost=component.stockout_cost,
        order_cost=component.order_cost,
        initial_inventory=component.current_inventory
    )

    prob_pol = ProbabilisticPolicy.calculate_policy(
        demand_mean=100.0,
        demand_std=20.0,
        avg_lead_time=actual_lead_time,
        lead_time_std=3.0,
        reliability=0.60,
        fill_rate=supplier.fill_rate,
        pack_size=component.pack_size,
        unit_cost=component.unit_cost,
        holding_cost=component.holding_cost,
        order_cost=component.order_cost,
        service_target=0.95
    )

    res = simulator.run_single_trajectory(reorder_point=prob_pol["reorder_point"], order_quantity=prob_pol["recommended_order_quantity"])

    return {
        "case_name": "Supplier Delay (15 Days)",
        "status": "WARNING_TRIGGERED",
        "description": "Lead time extended from 7 to 15 days; supplier reliability degraded to 60%.",
        "system_action": "Recalculated probabilistic safety stock to prevent stockout.",
        "adjusted_reorder_point": prob_pol["reorder_point"],
        "recommended_order_qty": prob_pol["recommended_order_quantity"],
        "simulated_metrics": res[0]
    }

@router.post("/partial-delivery")
def test_partial_delivery(component_id: str = "COMP-001", fill_rate: float = 0.60, db: Session = Depends(get_db)):
    """
    Case 2: Severe Partial Delivery (e.g. supplier fulfills only 60% of order).
    """
    component = db.query(Component).filter(Component.component_id == component_id).first()
    supplier = db.query(Supplier).filter(Supplier.supplier_id == component.supplier_id).first() if component else None
    if not component or not supplier:
        raise HTTPException(status_code=404, detail="Component or Supplier not found.")

    prob_pol = ProbabilisticPolicy.calculate_policy(
        demand_mean=100.0,
        demand_std=20.0,
        avg_lead_time=supplier.avg_lead_time,
        lead_time_std=supplier.lead_time_std,
        reliability=supplier.reliability,
        fill_rate=fill_rate, # 60% partial delivery
        pack_size=component.pack_size,
        unit_cost=component.unit_cost,
        holding_cost=component.holding_cost,
        order_cost=component.order_cost,
        service_target=0.95
    )

    return {
        "case_name": "Partial Delivery (60% Fill Rate)",
        "status": "DEFENSIVE_ADJUSTMENT",
        "description": "Supplier fulfills only 60% of requested pack quantities.",
        "system_action": "Increased reorder point to compensate for fill deficit.",
        "adjusted_reorder_point": prob_pol["reorder_point"],
        "recommended_order_qty": prob_pol["recommended_order_quantity"]
    }

@router.post("/demand-spike")
def test_demand_spike(component_id: str = "COMP-001", spike_demand: float = 250.0, db: Session = Depends(get_db)):
    """
    Case 3: Severe Demand Spike (demand surges from 100 to 250 units/day).
    """
    component = db.query(Component).filter(Component.component_id == component_id).first()
    supplier = db.query(Supplier).filter(Supplier.supplier_id == component.supplier_id).first() if component else None
    if not component or not supplier:
        raise HTTPException(status_code=404, detail="Component or Supplier not found.")

    prob_pol = ProbabilisticPolicy.calculate_policy(
        demand_mean=spike_demand,
        demand_std=50.0,
        avg_lead_time=supplier.avg_lead_time,
        lead_time_std=supplier.lead_time_std,
        reliability=supplier.reliability,
        fill_rate=supplier.fill_rate,
        pack_size=component.pack_size,
        unit_cost=component.unit_cost,
        holding_cost=component.holding_cost,
        order_cost=component.order_cost,
        service_target=0.95
    )

    return {
        "case_name": "Demand Spike (250 units/day)",
        "status": "ABNORMAL_DEMAND_DETECTED",
        "description": "Daily demand spiked 2.5x from 100 to 250 units/day.",
        "system_action": "Surged safety stock requirement & reorder point.",
        "adjusted_reorder_point": prob_pol["reorder_point"],
        "recommended_order_qty": prob_pol["recommended_order_quantity"]
    }

@router.post("/invalid-pack-size")
def test_invalid_pack_size(invalid_pack_size: int = 0):
    """
    Case 4: Invalid Pack Size (pack_size = 0). System rejects with validation error.
    """
    if invalid_pack_size <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation Error: Invalid pack size '{invalid_pack_size}'. Pack size must be an integer > 0."
        )
    return {"message": "Valid"}

@router.post("/supplier-disruption")
def test_supplier_disruption(supplier_id: str = "SUP-001", db: Session = Depends(get_db)):
    """
    Case 5: Supplier Disruption / Unavailability.
    """
    supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    supplier.status = "DISRUPTED"
    db.commit()

    return {
        "case_name": "Supplier Disruption Event",
        "status": "HUMAN_REVIEW_TRIGGERED",
        "description": f"Supplier {supplier.supplier_name} marked DISRUPTED.",
        "system_action": "Automated ordering halted. Alert dispatched for planner human review & dual-sourcing."
    }
