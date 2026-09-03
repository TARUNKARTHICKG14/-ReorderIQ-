import os
import json
import numpy as np
from datetime import datetime
from app.database.database import SessionLocal, engine, Base
from app.database.seed_data import seed_database
from app.models.component import Component
from app.models.supplier import Supplier
from app.simulation.probabilistic_policy import ProbabilisticPolicy
from app.simulation.baseline import BaselinePolicy
from app.simulation.monte_carlo import MonteCarloSimulator

def run_reproducible_experiments():
    print("=" * 60)
    print("PROBABILISTIC REORDER ENGINE - REPRODUCIBLE BENCHMARK")
    print("=" * 60)

    # 1. Initialize tables & seed database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Component).count() == 0:
            seed_database()

        components = db.query(Component).all()
        print(f"Loaded {len(components)} components and {db.query(Supplier).count()} suppliers.")

        seed = 42
        simulation_runs = 10000
        days = 365

        total_base_cost = 0.0
        total_prob_cost = 0.0
        total_base_stockouts = 0
        total_prob_stockouts = 0
        total_base_emissions = 0.0
        total_prob_emissions = 0.0

        component_results = []

        # Benchmark top components
        for comp in components[:15]:
            supplier = db.query(Supplier).filter(Supplier.supplier_id == comp.supplier_id).first()
            if not supplier or comp.pack_size <= 0:
                continue

            # Demand parameters
            demand_mean = 100.0
            demand_std = 25.0

            # 1. Fixed Baseline Policy
            base_pol = BaselinePolicy.calculate_policy(
                demand_mean=demand_mean,
                avg_lead_time=supplier.avg_lead_time,
                pack_size=comp.pack_size
            )

            # 2. Probabilistic Policy with 95% SLA Target
            prob_pol = ProbabilisticPolicy.calculate_policy(
                demand_mean=demand_mean,
                demand_std=demand_std,
                avg_lead_time=supplier.avg_lead_time,
                lead_time_std=supplier.lead_time_std,
                reliability=supplier.reliability,
                fill_rate=supplier.fill_rate,
                pack_size=comp.pack_size,
                unit_cost=comp.unit_cost,
                holding_cost=comp.holding_cost,
                order_cost=comp.order_cost,
                service_target=0.95,
                n_simulations=simulation_runs,
                seed=seed
            )

            # 3. Monte Carlo Simulator
            simulator = MonteCarloSimulator(
                demand_mean=demand_mean,
                demand_std=demand_std,
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
                days=days,
                seed=seed
            )

            base_m = res["baseline_metrics"]
            prob_m = res["probabilistic_metrics"]

            total_base_cost += base_m["total_cost"]
            total_prob_cost += prob_m["total_cost"]
            total_base_stockouts += base_m["stockout_count"]
            total_prob_stockouts += prob_m["stockout_count"]
            total_base_emissions += base_m["emissions_kg"]
            total_prob_emissions += prob_m["emissions_kg"]

            component_results.append({
                "component_id": comp.component_id,
                "component_name": comp.component_name,
                "category": comp.category,
                "pack_size": comp.pack_size,
                "baseline_rop": base_pol["reorder_point"],
                "baseline_order_qty": base_pol["order_quantity"],
                "probabilistic_rop": prob_pol["reorder_point"],
                "probabilistic_order_qty": prob_pol["recommended_order_quantity"],
                "baseline_stockouts": base_m["stockout_count"],
                "probabilistic_stockouts": prob_m["stockout_count"],
                "baseline_service_level": base_m["service_level"],
                "probabilistic_service_level": prob_m["service_level"],
                "baseline_cost": base_m["total_cost"],
                "probabilistic_cost": prob_m["total_cost"],
                "cost_savings": round(base_m["total_cost"] - prob_m["total_cost"], 2),
                "baseline_emissions_kg": base_m["emissions_kg"],
                "probabilistic_emissions_kg": prob_m["emissions_kg"]
            })

        cost_savings_pct = round(((total_base_cost - total_prob_cost) / total_base_cost) * 100.0, 1) if total_base_cost > 0 else 0.0
        stockout_reduction_pct = round(((total_base_stockouts - total_prob_stockouts) / total_base_stockouts) * 100.0, 1) if total_base_stockouts > 0 else 0.0
        emissions_reduction_pct = round(((total_base_emissions - total_prob_emissions) / total_base_emissions) * 100.0, 1) if total_base_emissions > 0 else 0.0

        summary = {
            "timestamp": datetime.now().isoformat(),
            "random_seed": seed,
            "horizon_days": days,
            "simulation_runs": simulation_runs,
            "components_evaluated": len(component_results),
            "aggregate_metrics": {
                "total_baseline_cost": round(total_base_cost, 2),
                "total_probabilistic_cost": round(total_prob_cost, 2),
                "total_cost_savings": round(total_base_cost - total_prob_cost, 2),
                "savings_percentage": cost_savings_pct,
                "total_baseline_stockouts": total_base_stockouts,
                "total_probabilistic_stockouts": total_prob_stockouts,
                "stockout_reduction_pct": stockout_reduction_pct,
                "total_baseline_emissions_kg": round(total_base_emissions, 2),
                "total_probabilistic_emissions_kg": round(total_prob_emissions, 2),
                "emissions_reduction_pct": emissions_reduction_pct
            },
            "component_details": component_results
        }

        # Save JSON output
        results_dir = os.path.join(os.path.dirname(__file__), "results")
        os.makedirs(results_dir, exist_ok=True)
        out_path = os.path.join(results_dir, "experiment_summary.json")

        with open(out_path, "w") as f:
            json.dump(summary, f, indent=2)

        print("-" * 60)
        print(f"EXPERIMENT RESULTS SUMMARY:")
        print(f"Total Cost Savings:      ₹{summary['aggregate_metrics']['total_cost_savings']:,.2f} ({cost_savings_pct}%)")
        print(f"Stockout Incident Cut:   {total_base_stockouts} -> {total_prob_stockouts} ({stockout_reduction_pct}%)")
        print(f"Carbon Footprint Cut:    {total_base_emissions:.1f} kg -> {total_prob_emissions:.1f} kg ({emissions_reduction_pct}%)")
        print(f"Saved JSON Report to:   {out_path}")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    run_reproducible_experiments()
