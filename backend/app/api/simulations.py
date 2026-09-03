import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.simulation import SimulationRunRequest, SimulationResultResponse
from app.models.component import Component
from app.models.supplier import Supplier
from app.models.demand import DemandHistory
from app.simulation.probabilistic_policy import ProbabilisticPolicy
from app.simulation.baseline import BaselinePolicy
from app.simulation.monte_carlo import MonteCarloSimulator

router = APIRouter(prefix="/api/simulation", tags=["Simulation Engine"])

@router.post("/run", response_model=SimulationResultResponse)
def run_simulation(req: SimulationRunRequest, db: Session = Depends(get_db)):
    component = db.query(Component).filter(Component.component_id == req.component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail=f"Component '{req.component_id}' not found.")

    supplier = db.query(Supplier).filter(Supplier.supplier_id == component.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier '{component.supplier_id}' not found.")

    if component.pack_size <= 0:
        raise HTTPException(status_code=422, detail=f"Invalid pack size {component.pack_size}. Must be > 0.")

    # Fetch demand or use override
    demands = [d.demand_quantity for d in db.query(DemandHistory).filter(DemandHistory.component_id == req.component_id).all()]
    d_mean = req.override_demand_mean if req.override_demand_mean is not None else (float(np.mean(demands)) if demands else 100.0)
    d_std = req.override_demand_std if req.override_demand_std is not None else (float(np.std(demands)) if len(demands) > 1 else d_mean * 0.2)

    lt_mean = req.override_lead_time_mean if req.override_lead_time_mean is not None else supplier.avg_lead_time
    lt_std = req.override_lead_time_std if req.override_lead_time_std is not None else supplier.lead_time_std

    rel = req.override_reliability if req.override_reliability is not None else supplier.reliability
    fr = req.override_fill_rate if req.override_fill_rate is not None else supplier.fill_rate

    # Calculate baseline and probabilistic policies
    base_policy = BaselinePolicy.calculate_policy(
        demand_mean=d_mean,
        avg_lead_time=lt_mean,
        pack_size=component.pack_size
    )

    prob_policy = ProbabilisticPolicy.calculate_policy(
        demand_mean=d_mean,
        demand_std=d_std,
        avg_lead_time=lt_mean,
        lead_time_std=lt_std,
        reliability=rel,
        fill_rate=fr,
        pack_size=component.pack_size,
        unit_cost=component.unit_cost,
        holding_cost=component.holding_cost,
        order_cost=component.order_cost,
        service_target=req.service_target,
        n_simulations=req.simulation_runs
    )

    # Run Monte Carlo head-to-head comparison
    simulator = MonteCarloSimulator(
        demand_mean=d_mean,
        demand_std=d_std,
        avg_lead_time=lt_mean,
        lead_time_std=lt_std,
        reliability=rel,
        fill_rate=fr,
        pack_size=component.pack_size,
        unit_cost=component.unit_cost,
        holding_cost=component.holding_cost,
        stockout_cost=component.stockout_cost,
        order_cost=component.order_cost,
        initial_inventory=component.current_inventory,
        distance_km=supplier.distance_km,
        emission_factor=supplier.emission_factor
    )

    sim_res = simulator.run_comparison(
        baseline_rop=base_policy["reorder_point"],
        baseline_order_qty=base_policy["order_quantity"],
        prob_rop=prob_policy["reorder_point"],
        prob_order_qty=prob_policy["recommended_order_quantity"],
        days=365,
        seed=42
    )

    return SimulationResultResponse(
        component_id=req.component_id,
        service_target=req.service_target,
        simulation_runs=req.simulation_runs,
        baseline_rop=base_policy["reorder_point"],
        baseline_order_qty=base_policy["order_quantity"],
        probabilistic_rop=prob_policy["reorder_point"],
        probabilistic_order_qty=prob_policy["recommended_order_quantity"],
        pack_size=component.pack_size,
        baseline_metrics=sim_res["baseline_metrics"],
        probabilistic_metrics=sim_res["probabilistic_metrics"],
        tradeoff_comparison=sim_res["tradeoff_comparison"],
        lead_time_demand_samples=prob_policy["simulated_lt_demands"][:100], # subset for chart rendering
        daily_trajectory_sample=sim_res["daily_trajectory_sample"]
    )
