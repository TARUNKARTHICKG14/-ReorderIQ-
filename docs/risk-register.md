# System Risk Register & ISO 31000 Alignment

| Risk ID | Vulnerability / Scenario | Probability | Impact | Mitigation Strategy | Status |
|---|---|---|---|---|---|
| **RSK-001** | Demand Spike | MEDIUM | HIGH | Probabilistic safety stock quantile matching 95%+ SLA target. | MITIGATED |
| **RSK-002** | Supplier Lead Time Delay | MEDIUM | HIGH | Lead-time distribution sampling with supplier delay penalties. | MITIGATED |
| **RSK-003** | Partial Delivery (Fill Deficit) | MEDIUM | MEDIUM | Fill-rate beta distribution modeling & replenishment multiplier. | MITIGATED |
| **RSK-004** | Bad Historical Data | MEDIUM | HIGH | Data validation rules & empirical bootstrap smoothing. | MONITORED |
| **RSK-005** | Invalid Pack Size Input (`pack_size <= 0`) | LOW | MEDIUM | FastAPI Pydantic strict validation (HTTP 422 rejection guard). | PREVENTED |
| **RSK-006** | Supplier Complete Disruption | LOW | HIGH | Halt automated ordering & dispatch alert for planner human review. | ESCALATED |
| **RSK-007** | Unnecessary Excess Inventory | MEDIUM | MEDIUM | Cost-aware optimization balancing holding cost vs stockout penalty. | OPTIMIZED |
| **RSK-008** | Audit Trail Tampering | LOW | HIGH | Immutable versioned audit log schema in database. | PROTECTED |
