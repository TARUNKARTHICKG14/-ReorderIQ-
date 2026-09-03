# Planner User Flow & Operational Guide

## End-to-End User Flow

```
1. Login & Role Authentication
   └─ Select Role: Planner, Reviewer, Admin, or Viewer.

2. Executive Dashboard Overview
   └─ Review Portfolio Service Level %, Stockout Risk %, Cost Optimization, and Carbon Footprint.

3. Component Deep Dive & Supplier Scorecard
   └─ Select Component SKU (e.g. COMP-001).
   └─ Inspect Historical Demand Trajectory & Supplier Reliability Metrics.

4. Probabilistic Recommendation Workbench
   └─ System calculates Probabilistic Reorder Point (ROP) & Order Quantity (Pack-Size Rounded).
   └─ Planner selects Action:
        ├─ [ Approve ]: Accepts recommendation as-is.
        ├─ [ Modify ]: Adjusts ROP/Qty with mandatory override justification.
        └─ [ Reject ]: Rejects plan with mandatory explanation reason.

5. Immutable Audit Log Recording
   └─ System commits new plan version and immutable audit entry to database.

6. Monte Carlo Scenario Simulation & Benchmarking
   └─ Test parameter sensitivity (Demand Std, Lead Time Std, Reliability %, Fill Rate %).
   └─ Compare head-to-head against Fixed Reorder Baseline.

7. Failure & Stress Workbench
   └─ Run Supplier Delay (15d), Partial Delivery (60%), Demand Spike (250u), Invalid Pack Size, and Disruption events.
```
