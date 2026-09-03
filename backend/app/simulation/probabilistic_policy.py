import math
import numpy as np
from app.simulation.demand_model import DemandModel
from app.simulation.lead_time_model import LeadTimeModel

class ProbabilisticPolicy:
    """
    Probabilistic Reorder Policy taking into account:
    - Demand uncertainty
    - Lead-time uncertainty
    - Supplier reliability & delays
    - Supplier fill-rate deficit
    - Target service level
    - Variable pack size rounding constraints
    """
    @staticmethod
    def round_to_pack_size(unrounded_quantity: float, pack_size: int) -> int:
        """
        Rounds required quantity up to the next integer multiple of supplier pack size.
        If pack_size is invalid (<= 0), raises ValueError.
        """
        if pack_size <= 0:
            raise ValueError(f"Invalid pack size: {pack_size}. Must be greater than 0.")
        
        if unrounded_quantity <= 0:
            return pack_size

        num_packs = math.ceil(unrounded_quantity / pack_size)
        return int(num_packs * pack_size)

    @classmethod
    def calculate_policy(
        cls,
        demand_mean: float,
        demand_std: float,
        avg_lead_time: float,
        lead_time_std: float,
        reliability: float,
        fill_rate: float,
        pack_size: int,
        unit_cost: float,
        holding_cost: float,
        order_cost: float,
        service_target: float = 0.95,
        n_simulations: int = 10000,
        seed: int = 42
    ):
        """
        Calculates optimal Probabilistic Reorder Point and Recommended Order Quantity (rounded to pack size).
        """
        if pack_size <= 0:
            raise ValueError(f"Pack size must be > 0, got {pack_size}")

        rng = np.random.default_rng(seed)
        demand_mod = DemandModel(mean_demand=demand_mean, std_demand=demand_std)
        lead_mod = LeadTimeModel(avg_lead_time=avg_lead_time, lead_time_std=lead_time_std)

        # 1. Sample lead times considering supplier reliability delays
        sampled_lts = lead_mod.sample_lead_times(n_samples=n_simulations, reliability=reliability, rng=rng)

        # 2. Simulate lead time demand
        simulated_lt_demands = demand_mod.simulate_lead_time_demand(sampled_lts, rng=rng)

        # 3. Adjust for supplier fill rate deficit (if supplier fills only 90%, we need 1/0.90 safety margin)
        effective_fill_factor = max(0.5, fill_rate)
        adjusted_lt_demands = simulated_lt_demands / effective_fill_factor

        # 4. Probabilistic ROP = Quantile at target service level (e.g. 95th percentile)
        percentile = float(np.clip(service_target * 100.0, 50.0, 99.9))
        probabilistic_rop = int(np.ceil(np.percentile(adjusted_lt_demands, percentile)))

        # 5. Calculate base EOQ (Economic Order Quantity)
        annual_demand = demand_mean * 365.0
        h_cost = max(0.1, holding_cost)
        s_cost = max(10.0, order_cost)
        
        raw_eoq = math.sqrt((2.0 * annual_demand * s_cost) / h_cost)
        
        # 6. Apply variable pack-size rounding
        recommended_order_qty = cls.round_to_pack_size(raw_eoq, pack_size)

        # 7. Estimated metrics
        stockout_prob = float(np.mean(simulated_lt_demands > probabilistic_rop))
        expected_simulated_service = float(1.0 - stockout_prob)

        return {
            "reorder_point": probabilistic_rop,
            "recommended_order_quantity": recommended_order_qty,
            "raw_unrounded_quantity": float(raw_eoq),
            "pack_size": pack_size,
            "stockout_probability": round(stockout_prob, 4),
            "simulated_service_level": round(expected_simulated_service, 4),
            "simulated_lt_demands": adjusted_lt_demands.tolist()
        }
