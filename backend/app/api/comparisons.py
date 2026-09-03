from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.component import Component
from app.models.supplier import Supplier
from app.simulation.probabilistic_policy import ProbabilisticPolicy
from app.simulation.baseline import BaselinePolicy
from app.simulation.monte_carlo import MonteCarloSimulator

router = APIRouter(prefix="/api/comparison", tags=["Comparison Engine"])

@router.get("/latest")
def get_portfolio_comparison(db: Session = Depends(get_db)):
    components = db.query(Component).all()
    
    total_baseline_cost = 0.0
    total_probabilistic_cost = 0.0
    total_baseline_stockouts = 0
    total_probabilistic_stockouts = 0
    total_baseline_emissions = 0.0
    total_probabilistic_emissions = 0.0
    
    component_comparisons = []

    for comp in components[:10]: # benchmark top 10 components
        supplier = db.query(Supplier).filter(Supplier.supplier_id == comp.supplier_id).first()
        if not supplier or comp.pack_size <= 0:
            continue

        base_pol = BaselinePolicy.calculate_policy(
            demand_mean=100.0,
            avg_lead_time=supplier.avg_lead_time,
            pack_size=comp.pack_size
        )

        prob_pol = ProbabilisticPolicy.calculate_policy(
            demand_mean=100.0,
            demand_std=20.0,
            avg_lead_time=supplier.avg_lead_time,
            lead_time_std=supplier.lead_time_std,
            reliability=supplier.reliability,
            fill_rate=supplier.fill_rate,
            pack_size=comp.pack_size,
            unit_cost=comp.unit_cost,
            holding_cost=comp.holding_cost,
            order_cost=comp.order_cost,
            service_target=0.95
        )

        simulator = MonteCarloSimulator(
            demand_mean=100.0,
            demand_std=20.0,
            avg_lead_time=supplier.avg_lead_time,
            lead_time_std=supplier.lead_time_std,
            reliability=supplier.reliability,
            fill_rate=supplier.fill_rate,
            pack_size=comp.pack_size,
            unit_cost=comp.unit_cost,
            holding_cost=comp.holding_cost,
            stockout_cost=comp.stockout_cost,
            order_cost=comp.order_cost,
            initial_inventory=comp.current_inventory,
            distance_km=supplier.distance_km,
            emission_factor=supplier.emission_factor
        )

        res = simulator.run_comparison(
            baseline_rop=base_pol["reorder_point"],
            baseline_order_qty=base_pol["order_quantity"],
            prob_rop=prob_pol["reorder_point"],
            prob_order_qty=prob_pol["recommended_order_quantity"],
            days=365
        )

        base_m = res["baseline_metrics"]
        prob_m = res["probabilistic_metrics"]

        total_baseline_cost += base_m["total_cost"]
        total_probabilistic_cost += prob_m["total_cost"]
        total_baseline_stockouts += base_m["stockout_count"]
        total_probabilistic_stockouts += prob_m["stockout_count"]
        total_baseline_emissions += base_m["emissions_kg"]
        total_probabilistic_emissions += prob_m["emissions_kg"]

        component_comparisons.append({
            "component_id": comp.component_id,
            "component_name": comp.component_name,
            "pack_size": comp.pack_size,
            "baseline_rop": base_pol["reorder_point"],
            "probabilistic_rop": prob_pol["reorder_point"],
            "baseline_stockouts": base_m["stockout_count"],
            "probabilistic_stockouts": prob_m["stockout_count"],
            "baseline_cost": base_m["total_cost"],
            "probabilistic_cost": prob_m["total_cost"],
            "cost_savings": round(base_m["total_cost"] - prob_m["total_cost"], 2),
            "baseline_service": base_m["service_level"],
            "probabilistic_service": prob_m["service_level"]
        })

    return {
        "summary": {
            "total_baseline_cost": round(total_baseline_cost, 2),
            "total_probabilistic_cost": round(total_probabilistic_cost, 2),
            "total_cost_savings": round(total_baseline_cost - total_probabilistic_cost, 2),
            "savings_percentage": round(((total_baseline_cost - total_probabilistic_cost) / total_baseline_cost * 100.0), 1) if total_baseline_cost > 0 else 0.0,
            "total_baseline_stockouts": total_baseline_stockouts,
            "total_probabilistic_stockouts": total_probabilistic_stockouts,
            "stockout_reduction_pct": round(((total_baseline_stockouts - total_probabilistic_stockouts) / total_baseline_stockouts * 100.0), 1) if total_baseline_stockouts > 0 else 0.0,
            "total_baseline_emissions": round(total_baseline_emissions, 2),
            "total_probabilistic_emissions": round(total_probabilistic_emissions, 2)
        },
        "components": component_comparisons
    }
