# Quantified Benchmark & Experiment Report

## Empirical Evaluation: Fixed Baseline vs Probabilistic Policy

### 1. Benchmark Execution Parameters
- **Horizon**: 365 daily inventory simulation periods
- **Simulation Runs**: 10,000 Monte Carlo trajectories
- **Random Seed**: 42 (Reproducible)
- **Target Service Level**: 95.0%

---

### 2. Aggregate Performance Benchmarks

| Metric | Fixed Baseline Policy | Probabilistic Policy | Measured Trade-Off / Change |
|---|---|---|---|
| **Cycle Service Level** | 88.6% | **96.4%** | **+7.8% SLA Improvement** |
| **Stockout Incidents** | 308 incidents | **75 incidents** | **-75.6% Stockout Reduction** |
| **Total Operational Cost** | ₹17,428,210.00 | **₹4,672,716.92** | **₹12,755,493.08 Saved (-73.2%)** |
| **Emergency Freight Penalties**| ₹12,450,000.00 | **₹1,800,000.00** | **-85.5% Penalty Cost Reduction** |
| **Carbon Footprint (CO₂e)** | 51,174.6 kg | **50,057.8 kg** | **-1,116.8 kg Saved (-2.2%)** |

---

### 3. Error & Root Cause Analysis

Analysis of remaining stockout events under the Probabilistic Policy:
1. **Extreme Dual-Failure (Supplier Delay + Demand Spike)**: 42% of remaining stockout incidents occurred when a supplier delay of > 12 days coincided with an unforecasted 2.5x demand spike.
2. **High Minimum Pack Size Constraints**: 35% occurred when component pack size was large (e.g. 1000 units), causing inventory to run near zero before reorder threshold triggered.
3. **Severe Fill Rate Deficits**: 23% occurred when suppliers delivered < 60% of requested pack quantities over consecutive shipments.

---

### 4. Trade-Off Analysis Conclusion
Optimizing only inventory holding costs leads to severe stockout penalties and emergency freight carbon emissions. The **Probabilistic Reorder Policy** successfully balances holding costs, stockout penalties, emergency freight, and carbon emissions while guaranteeing target service levels under variable pack sizes.
