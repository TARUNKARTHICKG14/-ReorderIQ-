import numpy as np

class DemandModel:
    """
    Models daily demand distribution from historical demand data or specified parameters.
    Ensures non-negative demand quantities.
    """
    def __init__(self, historical_demand=None, mean_demand=None, std_demand=None):
        if historical_demand is not None and len(historical_demand) > 0:
            self.mean = float(np.mean(historical_demand))
            self.std = float(np.std(historical_demand)) if len(historical_demand) > 1 else self.mean * 0.2
            self.historical_data = np.array(historical_demand)
        else:
            self.mean = float(mean_demand) if mean_demand is not None else 100.0
            self.std = float(std_demand) if std_demand is not None else 20.0
            self.historical_data = None

        # Prevent non-positive standard deviation
        if self.std <= 0:
            self.std = max(1.0, self.mean * 0.1)

    def sample_daily_demand(self, num_days=1, rng=None):
        """
        Samples non-negative daily demand.
        """
        if rng is None:
            rng = np.random.default_rng()

        if self.historical_data is not None and len(self.historical_data) >= 30:
            # Empirical bootstrap sampling with small noise
            indices = rng.choice(len(self.historical_data), size=num_days, replace=True)
            samples = self.historical_data[indices] + rng.normal(0, self.std * 0.1, size=num_days)
        else:
            # Truncated normal (non-negative)
            samples = rng.normal(self.mean, self.std, size=num_days)

        return np.maximum(0.0, samples)

    def simulate_lead_time_demand(self, lead_times, rng=None):
        """
        For a given array of sampled lead times (days), generates cumulative demand over each lead time.
        """
        if rng is None:
            rng = np.random.default_rng()

        n_samples = len(lead_times)
        lead_time_demands = np.zeros(n_samples)

        for i, lt in enumerate(lead_times):
            days = max(1, int(round(lt)))
            daily_demands = self.sample_daily_demand(days, rng=rng)
            lead_time_demands[i] = np.sum(daily_demands)

        return lead_time_demands
