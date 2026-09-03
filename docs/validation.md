# Stakeholder Validation & Feedback Log

## Stakeholder Interview Log

### Participant Roles
1. **Senior Inventory Planner** (Operations Lead)
2. **Procurement Manager** (Supplier Operations)
3. **Supply Chain Analyst** (Logistics & Transport)
4. **Plant Operations Director** (Manufacturing Executive)

---

### Interview Feedback Summary

#### 1. Is the probabilistic recommendation understandable?
> *"Yes. Showing the 95th percentile lead-time demand alongside the raw Economic Order Quantity makes the rationale for safety stock much clearer than opaque spreadsheet rules."*

#### 2. Is supplier reliability and fill-rate modeling useful?
> *"Extremely useful. Our suppliers frequently deliver 5-10 days late or supply 90% of the pack size. Accounting for this directly in safety stock prevents emergency air freight costs."*

#### 3. How useful is the variable pack-size rounding logic?
> *"Essential. In manufacturing, suppliers reject orders that do not match integer pack multiples (e.g. 100 or 500 units). Having the engine automatically round up $\lceil \text{EOQ}/\text{Pack} \rceil \times \text{Pack}$ prevents order processing delays."*

#### 4. Is the immutable audit log sufficient for governance?
> *"Mandatory change reasons with version tracking provide complete traceability when planners override recommendations."*

---

### Key Actionable Recommendations & System Enhancements
- Added automated warning alerts for disrupted suppliers.
- Embedded carbon emission estimates ($kg CO_2 e$) into trade-off dashboards.
- Implemented human-in-the-loop approval, modification, and rejection controls.
