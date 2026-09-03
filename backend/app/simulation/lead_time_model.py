import numpy as np

class LeadTimeModel:
    """
    Models lead-time distribution accounting for standard variation and potential supplier delays.
    """
    def __init__(self, avg_lead_time=7.0, lead_time_std=1.5, min_lead_time=1.0):
        self.avg_lead_time = float(avg_lead_time)
        self.lead_time_std = float(lead_time_std)
        self.min_lead_time = float(min_lead_time)

    def sample_lead_times(self, n_samples=10000, reliability=1.0, rng=None):
        """
        Samples lead times (in days).
        If supplier reliability < 1.0, delayed deliveries suffer additional delay days.
        """
        if rng is None:
            rng = np.random.default_rng()

        # Normal lead times sampled from normal/gamma distribution truncated at min_lead_time
        base_lt = rng.normal(self.avg_lead_time, max(0.1, self.lead_time_std), size=n_samples)
        base_lt = np.maximum(self.min_lead_time, base_lt)

        # Apply delay penalty for unreliable supplier events
        if reliability < 1.0:
            is_delayed = rng.random(size=n_samples) > reliability
            # Delay duration exponential with mean = avg_lead_time * 0.8
            delay_days = rng.exponential(scale=max(1.0, self.avg_lead_time * 0.8), size=n_samples)
            base_lt[is_delayed] += delay_days[is_delayed]

        return base_lt
