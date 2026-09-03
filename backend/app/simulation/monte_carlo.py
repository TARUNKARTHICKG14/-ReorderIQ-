import numpy as np
from app.simulation.demand_model import DemandModel
from app.simulation.lead_time_model import LeadTimeModel
from app.simulation.supplier_model import SupplierModel
from app.simulation.metrics import PolicyMetrics

class MonteCarloSimulator:
    """
    Executes multi-run Monte Carlo simulation to compare Baseline vs Probabilistic Reorder Policies
    over a daily inventory planning horizon (e.g., 365 days).
    """
    def __init__(
        self,
        demand_mean: float,
        demand_std: float,
        avg_lead_time: float,
        lead_time_std: float,
        reliability: float,
        fill_rate: float,
        pack_size: int,
        unit_cost: float,
        holding_cost: float,
        stockout_cost: float,
        order_cost: float,
        initial_inventory: int = 500,
        distance_km: float = 350.0,
        emission_factor: float = 0.00015
    ):
        self.demand_mean = demand_mean
        self.demand_std = demand_std
        self.avg_lead_time = avg_lead_time
        self.lead_time_std = lead_time_std
        self.reliability = reliability
        self.fill_rate = fill_rate
        self.pack_size = pack_size
        self.unit_cost = unit_cost
        self.holding_cost = holding_cost
        self.stockout_cost = stockout_cost
        self.order_cost = order_cost
        self.initial_inventory = initial_inventory
        self.distance_km = distance_km
        self.emission_factor = emission_factor

    def run_single_trajectory(self, reorder_point: int, order_quantity: int, days: int = 365, seed: int = 42):
        """
        Simulates 1 trajectory of length `days` for a given reorder_point & order_quantity.
        """
        rng = np.random.default_rng(seed)
        demand_mod = DemandModel(mean_demand=self.demand_mean, std_demand=self.demand_std)
        lead_mod = LeadTimeModel(avg_lead_time=self.avg_lead_time, lead_time_std=self.lead_time_std)
        sup_mod = SupplierModel(reliability=self.reliability, fill_rate=self.fill_rate)

        current_inventory = self.initial_inventory
        pending_orders = [] # list of dicts: {"arrival_day": int, "quantity": int}
        
        inventory_history = []
        demand_history = []
        order_events = []

        for day in range(1, days + 1):
            # 1. Receive deliveries arriving today
            arrived_qty = 0
            remaining_orders = []
            for order in pending_orders:
                if order["arrival_day"] <= day:
                    arrived_qty += order["quantity"]
                else:
                    remaining_orders.append(order)
            pending_orders = remaining_orders

            current_inventory += arrived_qty

            # 2. Sample today's demand
            daily_demand = float(demand_mod.sample_daily_demand(num_days=1, rng=rng)[0])
            demand_history.append(daily_demand)

            # 3. Satisfy demand
            current_inventory -= daily_demand
            inventory_history.append(current_inventory)

            # 4. Check reorder logic
            on_order_qty = sum(o["quantity"] for o in pending_orders)
            effective_inventory = current_inventory + on_order_qty

            if effective_inventory <= reorder_point:
                # Trigger purchase order
                sampled_lt = lead_mod.sample_lead_times(n_samples=1, reliability=self.reliability, rng=rng)[0]
                arrival_day = day + int(np.ceil(sampled_lt))
                
                fulfilled_qty = sup_mod.sample_delivery_fulfillment(order_quantity, rng=rng)
                
                is_emergency = (current_inventory <= 0)
                pending_orders.append({"arrival_day": arrival_day, "quantity": fulfilled_qty})
                order_events.append({
                    "day": day,
                    "quantity": fulfilled_qty,
                    "is_emergency": is_emergency,
                    "lead_time": sampled_lt
                })

        metrics = PolicyMetrics.calculate_summary(
            inventory_history=inventory_history,
            demand_history=demand_history,
            order_events=order_events,
            unit_cost=self.unit_cost,
            holding_cost=self.holding_cost,
            stockout_cost=self.stockout_cost,
            order_cost=self.order_cost,
            distance_km=self.distance_km,
            emission_factor=self.emission_factor
        )

        return metrics, inventory_history, demand_history

    def run_comparison(self, baseline_rop: int, baseline_order_qty: int, prob_rop: int, prob_order_qty: int, days: int = 365, seed: int = 42):
        """
        Runs identical trajectory simulations for both Baseline and Probabilistic policy under exact same random seed.
        """
        base_metrics, base_inv, demand_hist = self.run_single_trajectory(
            reorder_point=baseline_rop,
            order_quantity=baseline_order_qty,
            days=days,
            seed=seed
        )

        prob_metrics, prob_inv, _ = self.run_single_trajectory(
            reorder_point=prob_rop,
            order_quantity=prob_order_qty,
            days=days,
            seed=seed
        )

        # Tradeoff comparison percentages
        stockout_reduction = round((base_metrics["stockout_count"] - prob_metrics["stockout_count"]), 1)
        cost_savings = round(base_metrics["total_cost"] - prob_metrics["total_cost"], 2)
        cost_savings_pct = round((cost_savings / base_metrics["total_cost"]) * 100.0, 1) if base_metrics["total_cost"] > 0 else 0.0
        emissions_reduction_pct = round(((base_metrics["emissions_kg"] - prob_metrics["emissions_kg"]) / base_metrics["emissions_kg"]) * 100.0, 1) if base_metrics["emissions_kg"] > 0 else 0.0

        tradeoff = {
            "stockout_reduction_days": stockout_reduction,
            "cost_savings_amount": cost_savings,
            "cost_savings_pct": cost_savings_pct,
            "service_improvement_pct": round((prob_metrics["service_level"] - base_metrics["service_level"]) * 100.0, 1),
            "emissions_reduction_pct": emissions_reduction_pct
        }

        return {
            "baseline_metrics": base_metrics,
            "probabilistic_metrics": prob_metrics,
            "tradeoff_comparison": tradeoff,
            "daily_trajectory_sample": {
                "days": list(range(1, days + 1)),
                "baseline_inventory": [round(x, 1) for x in base_inv],
                "probabilistic_inventory": [round(x, 1) for x in prob_inv],
                "demand": [round(x, 1) for x in demand_hist]
            }
        }
