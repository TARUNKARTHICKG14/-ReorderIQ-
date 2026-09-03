import numpy as np

class SupplierModel:
    """
    Models supplier execution performance:
    - Reliability: Probability of deliver on time vs delayed.
    - Fill Rate: Percentage of ordered quantity fulfilled immediately.
    """
    def __init__(self, reliability=0.95, fill_rate=0.98):
        self.reliability = float(np.clip(reliability, 0.0, 1.0))
        self.fill_rate = float(np.clip(fill_rate, 0.0, 1.0))

    def sample_delivery_fulfillment(self, order_quantity, rng=None):
        """
        Calculates received quantity for a given purchase order quantity based on fill rate.
        """
        if rng is None:
            rng = np.random.default_rng()

        if self.fill_rate >= 0.999:
            return order_quantity

        # Beta distribution around mean = fill_rate
        # alpha, beta parameters for Beta distribution
        alpha = max(1.0, self.fill_rate * 20.0)
        beta_param = max(0.5, (1.0 - self.fill_rate) * 20.0)
        
        actual_fill_ratio = rng.beta(alpha, beta_param)
        received_qty = int(round(order_quantity * actual_fill_ratio))
        return max(0, min(order_quantity, received_qty))
