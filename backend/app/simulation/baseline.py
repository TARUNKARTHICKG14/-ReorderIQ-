import math

class BaselinePolicy:
    """
    Fixed Reorder Point Baseline policy.
    Ignores supplier reliability, lead-time standard deviation, fill rate deficit,
    and demand volatility.
    
    ROP = Mean Daily Demand * Mean Lead Time
    Order Quantity = 30-day mean demand rounded to pack size
    """
    @staticmethod
    def calculate_policy(
        demand_mean: float,
        avg_lead_time: float,
        pack_size: int
    ):
        if pack_size <= 0:
            raise ValueError(f"Invalid pack size: {pack_size}")

        # Simple deterministic formula
        deterministic_rop = int(round(demand_mean * avg_lead_time))
        
        # Standard order quantity: 30 days of average demand rounded to pack size
        raw_quantity = demand_mean * 30.0
        num_packs = math.ceil(raw_quantity / pack_size)
        baseline_order_qty = int(max(pack_size, num_packs * pack_size))

        return {
            "reorder_point": deterministic_rop,
            "order_quantity": baseline_order_qty
        }
