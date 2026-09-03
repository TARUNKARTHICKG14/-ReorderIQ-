# Probabilistic Smart Reorder System

## A Full-Stack, Field-Ready Prototype for Manufacturers Managing Components Supplied in Variable Pack Sizes

------------------------------------------------------------------------

## 1. Project Overview

The **Probabilistic Smart Reorder System** is a full-stack inventory
management prototype designed for manufacturers that purchase components
from suppliers using **variable pack sizes**.

Traditional fixed reorder rules often use only average demand and
average lead time. This can cause:

-   Stockouts when demand increases unexpectedly
-   Excess inventory when demand is lower than expected
-   Poor decisions when suppliers are unreliable
-   Incorrect reorder quantities because of variable pack sizes
-   Higher emergency-order and holding costs
-   Higher transportation emissions
-   Lack of traceability when a reorder plan is changed

This system solves the problem by using a **probabilistic reorder
policy** that considers:

1.  Demand uncertainty
2.  Lead-time uncertainty
3.  Supplier reliability
4.  Supplier fill rate
5.  Variable pack sizes
6.  Target service level
7.  Inventory and stockout costs
8.  Transportation emissions
9.  Human approval
10. Complete audit history

The system compares the probabilistic policy against a simple fixed
reorder-point baseline and reports the trade-offs between **cost,
service, inventory, emissions, and supplier reliability**.

------------------------------------------------------------------------

# 2. Problem Statement

A manufacturer manages components supplied in variable pack sizes.
Existing reorder rules do not sufficiently account for supplier
reliability and lead-time uncertainty.

The proposed solution must:

-   Implement a probabilistic reorder policy
-   Incorporate demand and lead-time distributions
-   Incorporate supplier reliability and fill rate
-   Handle variable supplier pack sizes
-   Compare against a simple fixed reorder rule
-   Measure stockouts and excess inventory
-   Measure service level and fill rate
-   Measure ordering, holding and stockout costs
-   Estimate emissions
-   Test realistic failure and edge cases
-   Preserve an auditable history of every plan change
-   Provide a functioning end-to-end MVP
-   Provide reproducible experiments
-   Include stakeholder validation
-   Document architecture, data schema, user flow and risks

------------------------------------------------------------------------

# 3. Solution Summary

The application calculates a reorder recommendation using historical
demand and supplier performance.

Instead of saying:

> "Reorder when stock reaches a fixed number."

the system asks:

> "Given the expected demand, possible demand variation, supplier
> reliability, possible delivery delays, fill rate and desired service
> level, what reorder point and order quantity provide an acceptable
> balance between service, cost, inventory and emissions?"

The system uses **Monte Carlo simulation** to model many possible future
demand and lead-time scenarios.

The recommendation is then rounded to a valid supplier pack size.

A planner can:

-   Approve the recommendation
-   Modify it
-   Reject it
-   Record a reason

Every change is stored in the audit history.

------------------------------------------------------------------------

# 4. Main Objectives

## Primary Objectives

-   Reduce stockouts
-   Maintain the required service level
-   Reduce unnecessary excess inventory
-   Account for supplier reliability
-   Account for lead-time uncertainty
-   Support variable pack sizes
-   Reduce emergency orders
-   Control inventory costs
-   Quantify emissions
-   Maintain an auditable decision history

## Secondary Objectives

-   Provide an easy-to-use dashboard
-   Support scenario simulation
-   Compare baseline and proposed policies
-   Provide failure-state testing
-   Support reproducible experiments
-   Provide a stakeholder validation workflow

------------------------------------------------------------------------

# 5. Recommended Full Tech Stack

## Frontend

  Technology         Purpose
  ------------------ -------------------------
  React.js           User interface
  Vite               Frontend build tool
  JavaScript / JSX   Application development
  Tailwind CSS       UI styling
  React Router       Page navigation
  Axios              API communication
  Recharts           Charts and analytics
  Lucide React       Icons
  React Hook Form    Form management
  Zod                Client-side validation

## Backend

  Technology   Purpose
  ------------ ------------------------------------
  Python       Backend and simulation development
  FastAPI      REST API framework
  Uvicorn      ASGI server
  Pydantic     Request/response validation
  SQLAlchemy   Database ORM
  Alembic      Database migrations

## Data Science and Simulation

  Technology               Purpose
  ------------------------ -------------------------------------
  NumPy                    Numerical calculations
  Pandas                   Data processing
  SciPy                    Probability distributions
  scikit-learn             Optional forecasting/anomaly models
  Monte Carlo Simulation   Uncertainty modelling
  Matplotlib               Experiment visualization

## Database

### Development

-   SQLite

### Production

-   PostgreSQL

## Authentication

-   JWT authentication for the MVP
-   Optional Firebase Authentication if required

## API Documentation

-   OpenAPI
-   Swagger UI
-   FastAPI `/docs`

## Testing

### Backend

-   Pytest
-   HTTPX

### Frontend

-   Vitest
-   React Testing Library

### API Testing

-   Postman

## DevOps

-   Docker
-   Docker Compose
-   Git
-   GitHub

## Development Tools

-   VS Code
-   Python virtual environment
-   Node.js
-   npm
-   Postman

------------------------------------------------------------------------

# 6. High-Level Architecture

``` text
                    ┌─────────────────────────┐
                    │       React Frontend    │
                    │                         │
                    │ Dashboard               │
                    │ Components              │
                    │ Suppliers               │
                    │ Recommendations         │
                    │ Simulation               │
                    │ Comparison              │
                    │ Audit History            │
                    └────────────┬────────────┘
                                 │
                                 │ REST API / JSON
                                 ▼
                    ┌─────────────────────────┐
                    │       FastAPI Backend   │
                    │                         │
                    │ Authentication          │
                    │ Component API            │
                    │ Supplier API             │
                    │ Inventory API            │
                    │ Recommendation API       │
                    │ Simulation API            │
                    │ Audit API                │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
    ┌────────────────┐ ┌─────────────────┐ ┌────────────────┐
    │ Reorder Engine │ │ Simulation      │ │ Audit Service  │
    │                │ │ Engine          │ │                │
    │ Demand model   │ │ Monte Carlo     │ │ Plan versions  │
    │ Lead-time      │ │ Baseline        │ │ User           │
    │ Reliability    │ │ Proposed policy │ │ Reason         │
    │ Pack size      │ │ Metrics         │ │ Timestamp      │
    └────────────────┘ └─────────────────┘ └────────────────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ SQLite / PostgreSQL     │
                    │                         │
                    │ Components              │
                    │ Demand History          │
                    │ Suppliers               │
                    │ Purchase Orders         │
                    │ Reorder Plans           │
                    │ Audit Logs               │
                    └─────────────────────────┘
```

------------------------------------------------------------------------

# 7. System Architecture Layers

## Presentation Layer

React provides:

-   Dashboard
-   Inventory tables
-   Supplier information
-   Recommendations
-   Simulation results
-   Comparison reports
-   Audit history
-   Risk register

## API Layer

FastAPI handles:

-   Authentication
-   CRUD operations
-   Recommendation requests
-   Simulation requests
-   Comparison requests
-   Audit operations

## Business Logic Layer

Python services handle:

-   Demand analysis
-   Lead-time analysis
-   Supplier reliability
-   Reorder-point calculation
-   Order-quantity calculation
-   Pack-size rounding
-   Cost calculation
-   Emission estimation

## Simulation Layer

The simulation engine handles:

-   Demand distributions
-   Lead-time distributions
-   Supplier delays
-   Partial deliveries
-   Monte Carlo scenarios
-   Baseline comparison
-   Service-level calculation

## Persistence Layer

SQLAlchemy connects the application to:

-   SQLite
-   PostgreSQL

------------------------------------------------------------------------

# 8. Core Features

## 8.1 Inventory Management

Track:

-   Component ID
-   Component name
-   Category
-   Current inventory
-   Unit cost
-   Pack size
-   Supplier
-   Reorder status

## 8.2 Supplier Management

Track:

-   Supplier name
-   Reliability
-   On-time delivery
-   Fill rate
-   Average lead time
-   Lead-time variability
-   Distance
-   Emission factor
-   Supplier status

## 8.3 Probabilistic Reorder Recommendation

The system calculates:

-   Reorder point
-   Recommended order quantity
-   Stockout probability
-   Expected service level
-   Expected inventory
-   Holding cost
-   Stockout cost
-   Ordering cost
-   Estimated emissions

## 8.4 Variable Pack Size

If the supplier sells components in packs of 100 units and the
calculated requirement is 230:

``` text
Required quantity = 230
Pack size = 100

Rounded quantity =
ceil(230 / 100) × 100

= 300 units
```

The final recommendation therefore always respects the supplier's
pack-size constraint.

## 8.5 Supplier Reliability

Example:

``` text
Total deliveries = 100
On-time deliveries = 92

Reliability = 92 / 100
            = 0.92
            = 92%
```

## 8.6 Supplier Fill Rate

Example:

``` text
Ordered = 1,000
Received = 950

Fill Rate = 950 / 1,000
          = 95%
```

------------------------------------------------------------------------

# 9. Probabilistic Reorder Policy

The main idea is to model uncertainty instead of relying only on
averages.

## Inputs

``` text
Historical Demand
        +
Lead-Time History
        +
Supplier Reliability
        +
Supplier Fill Rate
        +
Pack Size
        +
Service Target
        +
Cost Parameters
        ↓
Probabilistic Reorder Engine
        ↓
Reorder Point + Order Quantity
```

------------------------------------------------------------------------

# 10. Demand Model

Historical daily demand is used to estimate the demand distribution.

Example:

``` text
Mean daily demand = 100 units
Demand standard deviation = 20 units
```

A demand sample can be generated from a suitable distribution.

For an MVP, a normal distribution can be used where appropriate:

``` text
Demand ~ Normal(mean_demand, demand_std)
```

For non-negative demand, the implementation should prevent negative
simulated quantities or use a distribution better suited to the data.

------------------------------------------------------------------------

# 11. Lead-Time Model

Historical supplier lead times are used to estimate:

``` text
Average lead time
Lead-time standard deviation
Minimum lead time
Maximum lead time
```

Example:

``` text
Average lead time = 7 days
Standard deviation = 2 days
```

The simulation samples different possible lead times instead of assuming
that every delivery takes exactly seven days.

------------------------------------------------------------------------

# 12. Supplier Reliability Model

Supplier reliability affects the probability of receiving the expected
delivery on time.

Example:

``` text
Supplier reliability = 90%
```

The simulation can model:

``` text
90% probability → normal/on-time delivery
10% probability → delayed delivery
```

The exact delay distribution should be estimated from historical
supplier data where available.

------------------------------------------------------------------------

# 13. Monte Carlo Simulation

Monte Carlo simulation repeatedly generates possible future scenarios.

Example:

``` text
Simulation 1 → Demand 710 → Lead time 6 days → No delay
Simulation 2 → Demand 830 → Lead time 8 days → Delay
Simulation 3 → Demand 760 → Lead time 7 days → Partial delivery
...
Simulation 10,000 → ...
```

The system then calculates:

-   Probability of stockout
-   Expected demand during lead time
-   Expected inventory
-   Expected costs
-   Service level
-   Expected emergency orders

------------------------------------------------------------------------

# 14. Reorder Point Concept

A simple probabilistic representation is:

``` text
Reorder Point =
Quantile of simulated demand during lead time
```

For example, with a 95% service target:

``` text
ROP = 95th percentile of simulated lead-time demand
```

This naturally increases safety stock when uncertainty is higher.

------------------------------------------------------------------------

# 15. Service Level

Service level represents the percentage of demand that can be satisfied
without a stockout under the selected measurement definition.

Example:

``` text
Demand periods = 1,000
Periods without stockout = 960

Service Level = 960 / 1,000
              = 96%
```

Target:

``` text
95%
```

Measured:

``` text
96%
```

Status:

``` text
Target achieved
```

------------------------------------------------------------------------

# 16. Fill Rate

Fill rate measures the percentage of requested quantity fulfilled
immediately.

``` text
Fill Rate =
Units supplied immediately / Units demanded
```

This should be tracked separately from cycle service level because the
two metrics answer different questions.

------------------------------------------------------------------------

# 17. Baseline Policy

The baseline should remain intentionally simple.

Example:

``` text
Baseline ROP =
Average Daily Demand × Average Lead Time
```

Example:

``` text
Average daily demand = 100
Average lead time = 7 days

ROP = 100 × 7
    = 700 units
```

A fixed order quantity can be used as the baseline order quantity.

This provides a clear comparison against the probabilistic approach.

------------------------------------------------------------------------

# 18. Proposed Policy vs Baseline

Both policies must be tested using:

-   Same demand data
-   Same supplier data
-   Same initial inventory
-   Same cost assumptions
-   Same simulation horizon
-   Same random seed where appropriate

This makes the comparison fair.

------------------------------------------------------------------------

# 19. Key Comparison Metrics

## Service

-   Cycle service level
-   Fill rate
-   Stockout probability

## Inventory

-   Average inventory
-   Safety stock
-   Excess inventory
-   Inventory turnover

## Cost

-   Ordering cost
-   Holding cost
-   Stockout cost
-   Emergency order cost
-   Total cost

## Reliability

-   Supplier reliability
-   Lead-time variability
-   Partial delivery frequency
-   Delayed delivery frequency

## Environmental

-   Transportation emissions
-   Emergency shipment emissions
-   Total estimated emissions

------------------------------------------------------------------------

# 20. Cost Model

A basic cost model can be:

``` text
Total Cost =
Ordering Cost
+
Holding Cost
+
Stockout Cost
+
Emergency Cost
+
Transportation Cost
```

The exact weights should be configurable.

This prevents the system from optimizing only inventory or only service.

------------------------------------------------------------------------

# 21. Emissions Model

A simple MVP emission estimate can use:

``` text
Emissions =
Shipment Distance
×
Shipment Weight
×
Emission Factor
```

For more accurate production use, the project can later incorporate:

-   Transport mode
-   Vehicle type
-   Shipment weight
-   Load utilization
-   Supplier location
-   Emergency shipment emissions

The prototype should clearly label emissions as **estimates** unless
verified environmental data is available.

------------------------------------------------------------------------

# 22. Trade-Off Analysis

The system should not optimize a single metric.

Example:

  Metric               Baseline   Probabilistic Desired Direction
  ------------------ ---------- --------------- -------------------
  Service Level             89%             96% Higher
  Stockouts                  18               7 Lower
  Excess Inventory        1,200             950 Lower
  Total Cost               100%             94% Lower
  Emergency Orders           15               6 Lower
  Emissions                100%             92% Lower

These numbers are examples only. Final project results must come from
the actual experiment.

------------------------------------------------------------------------

# 23. Failure and Edge Cases

The MVP must test at least three realistic failure cases.

## Case 1: Supplier Delay

``` text
Normal lead time = 7 days
Actual lead time = 15 days
```

Expected system behavior:

-   Increase stockout risk
-   Trigger warning
-   Recalculate recommendation
-   Record the changed plan

## Case 2: Partial Delivery

``` text
Ordered = 1,000
Received = 600
```

Expected behavior:

-   Record received quantity
-   Calculate fill rate
-   Recalculate inventory
-   Update risk
-   Recalculate recommendation if required

## Case 3: Demand Spike

``` text
Normal demand = 100/day
Spike demand = 250/day
```

Expected behavior:

-   Detect abnormal demand
-   Increase stockout risk
-   Display warning
-   Recommend additional safety stock if justified

## Case 4: Invalid Pack Size

``` text
Pack size = 0
```

Expected behavior:

``` text
Reject request
Return validation error
Do not create reorder plan
```

## Case 5: Supplier Unavailable

Expected behavior:

-   Mark supplier unavailable
-   Prevent automatic ordering
-   Suggest human review or alternative supplier

------------------------------------------------------------------------

# 24. Audit History

The system must preserve an auditable history of every reorder-plan
change.

The application must never simply overwrite important planning decisions
without keeping the previous version.

Example:

``` text
Plan Version 1
ROP = 700
Order Quantity = 300

        ↓

Planner changes plan

        ↓

Plan Version 2
ROP = 800
Order Quantity = 400
Reason = Supplier delay risk
User = planner01
Timestamp = 2026-09-03 10:30
```

The audit record should contain:

-   Plan ID
-   Component ID
-   User ID
-   Action
-   Old value
-   New value
-   Reason
-   Timestamp
-   Version number

------------------------------------------------------------------------

# 25. Human-in-the-Loop Workflow

``` text
System calculates recommendation
             ↓
        Risk check
             ↓
       Planner review
        /     |      \
       /      |       \
   Approve  Modify   Reject
      |        |        |
      |        ↓        |
      |   New plan      |
      |        ↓        |
      └───────┬─────────┘
              ↓
        Audit history
```

Consequential inventory decisions should remain reviewable by an
authorized human.

------------------------------------------------------------------------

# 26. User Flow

``` text
Login
  ↓
Dashboard
  ↓
Inventory / Components
  ↓
Select Component
  ↓
View Supplier Performance
  ↓
Analyze Demand
  ↓
Analyze Lead Time
  ↓
Run Probabilistic Simulation
  ↓
Calculate Reorder Point
  ↓
Calculate Order Quantity
  ↓
Round to Pack Size
  ↓
Display Cost / Service / Emission Trade-Off
  ↓
Planner Approval
  ↓
Save Plan
  ↓
Audit Log
```

------------------------------------------------------------------------

# 27. Application Pages

## 1. Login

-   Email
-   Password
-   Authentication

## 2. Dashboard

Show:

-   Total components
-   Components at risk
-   Stockout risk
-   Average service level
-   Average inventory
-   Total estimated cost
-   Estimated emissions
-   Pending recommendations

## 3. Components

Show:

-   Component ID
-   Component name
-   Current inventory
-   Supplier
-   Pack size
-   Risk
-   Reorder status

## 4. Component Details

Show:

-   Demand history
-   Demand distribution
-   Current stock
-   Supplier performance
-   Lead-time distribution
-   Reorder point
-   Recommended quantity

## 5. Suppliers

Show:

-   Supplier reliability
-   Fill rate
-   Average lead time
-   Lead-time variability
-   Status

## 6. Recommendations

Show:

-   Recommended reorder point
-   Order quantity
-   Stockout probability
-   Service target
-   Expected cost
-   Emissions
-   Approve / Modify / Reject

## 7. Simulation

Allow:

-   Number of simulation runs
-   Service target
-   Demand assumptions
-   Lead-time assumptions
-   Supplier reliability

## 8. Comparison

Show:

-   Baseline
-   Probabilistic policy
-   Before/after charts
-   Cost
-   Service
-   Stockouts
-   Excess inventory
-   Emissions

## 9. Audit History

Show:

-   Plan version
-   User
-   Change
-   Old value
-   New value
-   Reason
-   Timestamp

## 10. Risk Register

Show:

-   Risk
-   Probability
-   Impact
-   Mitigation
-   Status

------------------------------------------------------------------------

# 28. Frontend Project Structure

``` text
frontend/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── KPIcard.jsx
│   │   ├── ComponentTable.jsx
│   │   ├── SupplierCard.jsx
│   │   ├── RecommendationCard.jsx
│   │   ├── RiskBadge.jsx
│   │   ├── AuditTimeline.jsx
│   │   └── LoadingSpinner.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Components.jsx
│   │   ├── ComponentDetails.jsx
│   │   ├── Suppliers.jsx
│   │   ├── Recommendations.jsx
│   │   ├── Simulation.jsx
│   │   ├── Comparison.jsx
│   │   ├── AuditHistory.jsx
│   │   └── RiskRegister.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── hooks/
│   │   └── useApi.js
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   └── calculations.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env
```

------------------------------------------------------------------------

# 29. Backend Project Structure

``` text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── components.py
│   │   ├── suppliers.py
│   │   ├── inventory.py
│   │   ├── recommendations.py
│   │   ├── simulations.py
│   │   ├── comparisons.py
│   │   └── audit.py
│   │
│   ├── models/
│   │   ├── component.py
│   │   ├── supplier.py
│   │   ├── inventory.py
│   │   ├── demand.py
│   │   ├── purchase_order.py
│   │   ├── reorder_plan.py
│   │   └── audit_log.py
│   │
│   ├── schemas/
│   │   ├── component.py
│   │   ├── supplier.py
│   │   ├── recommendation.py
│   │   ├── simulation.py
│   │   └── audit.py
│   │
│   ├── services/
│   │   ├── inventory_service.py
│   │   ├── supplier_service.py
│   │   ├── reorder_service.py
│   │   ├── cost_service.py
│   │   ├── emission_service.py
│   │   └── audit_service.py
│   │
│   ├── simulation/
│   │   ├── demand_model.py
│   │   ├── lead_time_model.py
│   │   ├── supplier_model.py
│   │   ├── monte_carlo.py
│   │   ├── baseline.py
│   │   ├── probabilistic_policy.py
│   │   └── metrics.py
│   │
│   ├── database/
│   │   └── database.py
│   │
│   └── utils/
│       ├── security.py
│       └── validators.py
│
├── tests/
│   ├── test_components.py
│   ├── test_reorder.py
│   ├── test_simulation.py
│   └── test_audit.py
│
├── requirements.txt
├── Dockerfile
└── .env
```

------------------------------------------------------------------------

# 30. Database Schema

## Components

``` text
components
-----------
component_id
component_name
category
unit_cost
holding_cost
stockout_cost
pack_size
current_inventory
supplier_id
created_at
updated_at
```

## Demand History

``` text
demand_history
--------------
id
component_id
date
demand_quantity
```

## Suppliers

``` text
suppliers
---------
supplier_id
supplier_name
reliability
fill_rate
avg_lead_time
lead_time_std
unit_price
distance_km
emission_factor
status
created_at
```

## Purchase Orders

``` text
purchase_orders
---------------
order_id
component_id
supplier_id
order_quantity
order_date
expected_delivery
actual_delivery
received_quantity
status
```

## Reorder Plans

``` text
reorder_plans
------------
plan_id
component_id
reorder_point
order_quantity
service_target
stockout_probability
expected_cost
estimated_emissions
version
status
created_by
created_at
```

## Audit Logs

``` text
audit_logs
----------
audit_id
plan_id
component_id
user_id
action
old_value
new_value
reason
timestamp
version
```

------------------------------------------------------------------------

# 31. REST API

## Components

``` http
GET    /api/components
GET    /api/components/{id}
POST   /api/components
PUT    /api/components/{id}
DELETE /api/components/{id}
```

## Suppliers

``` http
GET  /api/suppliers
GET  /api/suppliers/{id}
POST /api/suppliers
PUT  /api/suppliers/{id}
```

## Inventory

``` http
GET /api/inventory
GET /api/inventory/{component_id}
```

## Recommendations

``` http
POST /api/recommendations/calculate
GET  /api/recommendations
GET  /api/recommendations/{component_id}
POST /api/recommendations/{component_id}/approve
POST /api/recommendations/{component_id}/reject
POST /api/recommendations/{component_id}/modify
```

## Simulation

``` http
POST /api/simulation/run
GET  /api/simulation/{simulation_id}
```

## Comparison

``` http
POST /api/comparison/run
GET  /api/comparison/latest
```

## Audit

``` http
GET  /api/audit
GET  /api/audit/{plan_id}
POST /api/audit
```

------------------------------------------------------------------------

# 32. Recommendation API Example

## Request

``` json
{
  "component_id": "COMP-001",
  "service_target": 0.95,
  "simulation_runs": 10000
}
```

## Response

``` json
{
  "component_id": "COMP-001",
  "stockout_probability": 0.041,
  "service_level": 0.959,
  "reorder_point": 780,
  "recommended_order_quantity": 300,
  "pack_size": 100,
  "expected_holding_cost": 4200,
  "expected_stockout_cost": 1100,
  "estimated_emissions": 18.2
}
```

These values are example response values only.

------------------------------------------------------------------------

# 33. Experiment Design

A realistic MVP experiment can use:

``` text
Components       = 100
Suppliers        = 10
Demand horizon   = 365 days
Demand records   = 36,500+
Purchase orders  = 5,000+
Simulation runs  = 10,000
Service target   = 95%
```

The exact dataset can be real, synthetic, or a combination, but the
repository must include enough information to reproduce the experiment.

------------------------------------------------------------------------

# 34. Experimental Process

``` text
Load Dataset
     ↓
Clean and Validate Data
     ↓
Calculate Demand Statistics
     ↓
Calculate Supplier Statistics
     ↓
Calculate Lead-Time Statistics
     ↓
Run Baseline Policy
     ↓
Run Probabilistic Policy
     ↓
Run Failure Scenarios
     ↓
Calculate Metrics
     ↓
Compare Results
     ↓
Generate Report
```

------------------------------------------------------------------------

# 35. Required Experiment Metrics

## Baseline

Measure:

-   Stockouts
-   Service level
-   Fill rate
-   Average inventory
-   Excess inventory
-   Ordering cost
-   Holding cost
-   Stockout cost
-   Emergency cost
-   Emissions

## Probabilistic Policy

Measure the same metrics.

The comparison must use the same evaluation period and assumptions.

------------------------------------------------------------------------

# 36. Before-and-After Comparison

The final report should include a table similar to:

  Metric                Baseline   Proposed       Change
  ------------------- ---------- ---------- ------------
  Service Level           Actual     Actual   Difference
  Fill Rate               Actual     Actual   Difference
  Stockouts               Actual     Actual   Difference
  Average Inventory       Actual     Actual   Difference
  Excess Inventory        Actual     Actual   Difference
  Total Cost              Actual     Actual   Difference
  Emergency Orders        Actual     Actual   Difference
  Emissions               Actual     Actual   Difference

Do not hard-code these values. Generate them from the experiment.

------------------------------------------------------------------------

# 37. Error Analysis

After the experiment, analyze why the policy still fails.

Recommended categories:

1.  Demand spike
2.  Supplier delay
3.  Partial delivery
4.  Supplier unavailability
5.  Large pack size
6.  Incorrect demand distribution
7.  Incorrect lead-time distribution
8.  Insufficient safety stock
9.  Unexpected supplier behavior
10. Data quality problems

Example:

``` text
Total stockout events = 100

Demand spike             = 35
Supplier delay           = 30
Partial delivery         = 15
Supplier unavailable     = 10
Pack-size limitation     = 5
Other                    = 5
```

These are illustrative only.

------------------------------------------------------------------------

# 38. Risk Register

  Risk                     Probability   Impact   Mitigation
  ------------------------ ------------- -------- ----------------------------
  Demand spike             Medium        High     Probabilistic safety stock
  Supplier delay           Medium        High     Lead-time distribution
  Partial delivery         Medium        Medium   Fill-rate modelling
  Bad historical data      Medium        High     Validation and cleaning
  Incorrect pack size      Low           Medium   Input validation
  Supplier unavailable     Low           High     Human review
  Excess inventory         Medium        Medium   Cost-aware optimization
  Simulation assumptions   Medium        Medium   Sensitivity analysis
  Audit failure            Low           High     Immutable/versioned logs

------------------------------------------------------------------------

# 39. Stakeholder Validation

Conduct a short validation with 3--5 representative users such as:

-   Inventory planner
-   Procurement user
-   Operations manager
-   Supply-chain analyst
-   Authorized reviewer

Ask:

1.  Is the recommendation understandable?
2.  Is supplier reliability useful?
3.  Is the lead-time risk clearly shown?
4.  Is the pack-size adjustment understandable?
5.  Is the comparison with the baseline useful?
6.  Is the audit history sufficient?
7.  Would you trust the recommendation with human approval?
8.  What additional information is required before production use?

Record:

-   Participant role
-   Feedback
-   Issue
-   Proposed improvement
-   Final action

Do not fabricate stakeholder results. Record actual feedback.

------------------------------------------------------------------------

# 40. Reproducibility

The repository should preserve:

-   Dataset
-   Data dictionary
-   Simulation parameters
-   Service target
-   Cost assumptions
-   Emission assumptions
-   Supplier assumptions
-   Random seed
-   Number of simulation runs
-   Experiment code
-   Results
-   Environment versions

Recommended default:

``` text
random_seed = 42
simulation_runs = 10000
service_target = 0.95
```

------------------------------------------------------------------------

# 41. Environment Variables

## Backend `.env`

``` env
DATABASE_URL=sqlite:///./reorder.db
SECRET_KEY=change-this-secret
SIMULATION_RUNS=10000
DEFAULT_SERVICE_TARGET=0.95
```

For PostgreSQL:

``` env
DATABASE_URL=postgresql://username:password@localhost:5432/reorder_db
```

## Frontend `.env`

``` env
VITE_API_BASE_URL=http://localhost:8000/api
```

Never commit real secrets to GitHub.

------------------------------------------------------------------------

# 42. Backend Installation

## 1. Clone Repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd probabilistic-smart-reorder
```

## 2. Create Virtual Environment

### macOS / Linux

``` bash
python3 -m venv venv
source venv/bin/activate
```

### Windows

``` bash
python -m venv venv
venv\Scripts\activate
```

## 3. Install Dependencies

``` bash
cd backend
pip install -r requirements.txt
```

## 4. Start Backend

``` bash
uvicorn app.main:app --reload
```

Backend:

``` text
http://localhost:8000
```

Swagger:

``` text
http://localhost:8000/docs
```

------------------------------------------------------------------------

# 43. Frontend Installation

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 44. Example Frontend Package Dependencies

Recommended dependencies:

``` json
{
  "dependencies": {
    "axios": "^1.0.0",
    "lucide-react": "^0.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.0.0",
    "react-router-dom": "^7.0.0",
    "recharts": "^2.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

Use current compatible package versions when installing.

------------------------------------------------------------------------

# 45. Backend Requirements

Recommended `requirements.txt`:

``` text
fastapi
uvicorn[standard]
pydantic
sqlalchemy
alembic
numpy
pandas
scipy
scikit-learn
matplotlib
python-dotenv
python-jose
passlib
httpx
pytest
```

Pin exact versions for a production/reproducible release after testing
the environment.

------------------------------------------------------------------------

# 46. Docker Architecture

``` text
                 Docker Compose
                       │
          ┌────────────┴────────────┐
          │                         │
     Frontend Container        Backend Container
       React + Vite              FastAPI
          │                         │
          └────────────┬────────────┘
                       │
                  PostgreSQL
                    Container
```

------------------------------------------------------------------------

# 47. Docker Compose

Example:

``` yaml
services:

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/reorder_db
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: reorder_db
    ports:
      - "5432:5432"
```

Start:

``` bash
docker compose up --build
```

------------------------------------------------------------------------

# 48. Testing Strategy

## Backend Unit Tests

Test:

-   Demand calculations
-   Lead-time calculations
-   Reliability calculations
-   Fill-rate calculations
-   Pack-size rounding
-   Reorder point
-   Order quantity
-   Cost calculation
-   Emission calculation

## Simulation Tests

Test:

-   Normal demand
-   High demand
-   Delayed supplier
-   Partial delivery
-   Supplier unavailable
-   Invalid parameters

## API Tests

Test:

-   POST recommendation
-   GET recommendations
-   POST simulation
-   POST comparison
-   Audit endpoints

## Frontend Tests

Test:

-   Dashboard rendering
-   Recommendation card
-   Approve button
-   Modify form
-   Audit history
-   Error states
-   Loading states

------------------------------------------------------------------------

# 49. Data Validation Rules

Examples:

``` text
pack_size > 0
unit_cost >= 0
current_inventory >= 0
service_target between 0 and 1
reliability between 0 and 1
fill_rate between 0 and 1
lead_time > 0
simulation_runs > 0
```

Invalid values should return clear API errors.

------------------------------------------------------------------------

# 50. Security

The MVP should include:

-   JWT authentication
-   Password hashing
-   Role-based authorization
-   Input validation
-   Environment-based secrets
-   CORS configuration
-   Audit logging
-   No secrets in Git

Suggested roles:

``` text
ADMIN
PLANNER
PROCUREMENT
REVIEWER
VIEWER
```

Example permission:

``` text
VIEWER     → Read-only
PLANNER    → Create/modify recommendations
REVIEWER   → Approve/reject
ADMIN      → Full access
```

------------------------------------------------------------------------

# 51. Recommended Dashboard KPIs

``` text
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Service Level  │ │ Stockout Risk  │ │ Avg Inventory  │
│     96%        │ │      4%        │ │     950        │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total Cost     │ │ Fill Rate      │ │ Emissions      │
│     ₹...       │ │      95%       │ │     ... kg     │
└────────────────┘ └────────────────┘ └────────────────┘
```

Charts:

-   Demand trend
-   Lead-time distribution
-   Supplier reliability
-   Stock level
-   Baseline vs proposed
-   Cost breakdown
-   Stockout events
-   Emission comparison

------------------------------------------------------------------------

# 52. Recommendation Screen

Example:

``` text
Component: COMP-001
Current Stock: 420 units

Supplier: Supplier A
Reliability: 92%
Fill Rate: 95%

Average Demand: 100/day
Average Lead Time: 7 days
Lead-Time Std: 2 days

Service Target: 95%

--------------------------------
Recommended Reorder Point
780 units
--------------------------------

Recommended Order Quantity
300 units

Pack Size
100 units

Stockout Probability
4.1%

Expected Cost
₹5,300

Estimated Emissions
18.2 kg CO₂e

[ Approve ] [ Modify ] [ Reject ]
```

------------------------------------------------------------------------

# 53. Comparison Dashboard

Show:

``` text
                 Baseline       Probabilistic

Service Level      89%              96%
Stockouts           18                7
Avg Inventory      1200              950
Emergency Orders    15                6
Total Cost          ...               ...
Emissions           ...               ...
```

Use charts to make the trade-offs easy to understand.

------------------------------------------------------------------------

# 54. Why This Approach Is Appropriate

The problem is fundamentally about **uncertainty**.

The manufacturer does not know exactly:

-   How much customers will demand
-   How long suppliers will take
-   Whether a supplier will deliver on time
-   Whether the supplier will deliver the full quantity

A fixed rule cannot represent all of these uncertainties well.

Monte Carlo simulation is appropriate for an MVP because it allows the
system to estimate the probability of different outcomes.

The system can therefore answer:

> "What is the probability that we will run out of stock before the
> supplier delivery arrives?"

This is more useful for risk-aware inventory planning than using only
average values.

------------------------------------------------------------------------

# 55. Why Not Use ML as the Main Solution?

Machine learning can be added later for demand forecasting.

However, the core problem requires modelling:

-   Demand uncertainty
-   Lead-time uncertainty
-   Supplier reliability
-   Service-level risk
-   Cost trade-offs

A probabilistic simulation is transparent and easier for planners to
understand and audit.

ML can be introduced later for:

-   Demand forecasting
-   Anomaly detection
-   Supplier risk prediction
-   Dynamic parameter estimation

------------------------------------------------------------------------

# 56. Optional ML Extension

Future architecture:

``` text
Historical Data
      ↓
Demand Forecasting Model
      ↓
Forecast Distribution
      ↓
Probabilistic Reorder Engine
      ↓
Monte Carlo Simulation
      ↓
Recommendation
```

Possible models:

-   Random Forest
-   Gradient Boosting
-   XGBoost
-   Time-series models
-   LSTM
-   Transformer-based forecasting

The MVP does not require deep learning.

------------------------------------------------------------------------

# 57. Sensitivity Analysis

The system should test how recommendations change when assumptions
change.

Example variables:

``` text
Service Target:
90% → 95% → 99%

Supplier Reliability:
95% → 90% → 75%

Lead Time:
5 days → 7 days → 12 days

Demand Volatility:
Low → Medium → High
```

This helps stakeholders understand how robust the recommendation is.

------------------------------------------------------------------------

# 58. Example Scenario

Suppose:

``` text
Component = Motor Bearing
Average Demand = 100/day
Demand Std = 20/day

Average Lead Time = 7 days
Lead-Time Std = 2 days

Supplier Reliability = 90%
Fill Rate = 95%

Pack Size = 100
Service Target = 95%
```

The simulation produces a distribution of lead-time demand.

Suppose:

``` text
95th percentile = 780 units
```

Therefore:

``` text
Reorder Point = 780
```

Suppose the raw recommended order quantity is:

``` text
230 units
```

Pack size:

``` text
100
```

Final order quantity:

``` text
ceil(230 / 100) × 100
= 300 units
```

The planner sees the recommendation and approves, modifies or rejects
it.

The decision is stored in the audit history.

------------------------------------------------------------------------

# 59. Project Directory

``` text
probabilistic-smart-reorder/
│
├── frontend/
│
├── backend/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── sample/
│
├── experiments/
│   ├── baseline/
│   ├── probabilistic/
│   ├── failure_cases/
│   └── results/
│
├── docs/
│   ├── architecture.md
│   ├── data-schema.md
│   ├── user-flow.md
│   ├── risk-register.md
│   ├── validation.md
│   └── experiment-report.md
│
├── tests/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

# 60. Git Workflow

Recommended branches:

``` text
main
develop
feature/frontend
feature/backend
feature/simulation
feature/audit
feature/testing
```

Example:

``` bash
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin <YOUR_REPOSITORY_URL>
git push -u origin main
```

------------------------------------------------------------------------

# 61. `.gitignore`

Recommended:

``` gitignore
# Python
__pycache__/
*.py[cod]
venv/
.env

# Node
node_modules/
dist/

# Database
*.db
*.sqlite
*.sqlite3

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Test
.pytest_cache/
.coverage

# Logs
*.log
```

------------------------------------------------------------------------

# 62. MVP Definition

The MVP is considered complete when a user can:

1.  Log in
2.  View inventory
3.  View supplier information
4.  Select a component
5.  View demand history
6.  View lead-time statistics
7.  View supplier reliability
8.  Run a simulation
9.  Receive a reorder recommendation
10. Apply variable pack-size rounding
11. See stockout probability
12. See service-level target
13. See cost estimates
14. See emission estimates
15. Compare with baseline
16. Approve/modify/reject the recommendation
17. View the complete audit history
18. Run failure scenarios
19. View experiment results

This makes the solution more than a concept presentation or isolated
notebook.

------------------------------------------------------------------------

# 63. Success Criteria

The project should demonstrate:

### Functional

-   End-to-end working web application
-   Working backend API
-   Working database
-   Working simulation
-   Working recommendation engine
-   Working audit system

### Analytical

-   Baseline comparison
-   Probabilistic policy
-   Demand uncertainty
-   Lead-time uncertainty
-   Supplier reliability
-   Fill rate
-   Pack-size handling
-   Cost analysis
-   Service analysis
-   Emission analysis

### Operational

-   Failure-state handling
-   Human approval
-   Audit history
-   Risk register
-   Stakeholder validation

### Reproducibility

-   Dataset
-   Configuration
-   Random seed
-   Experiment code
-   Results
-   Documentation

------------------------------------------------------------------------

# 64. Final Deliverables

The final repository should contain:

``` text
✓ React frontend
✓ FastAPI backend
✓ Database
✓ Authentication
✓ Inventory module
✓ Supplier module
✓ Probabilistic reorder engine
✓ Monte Carlo simulation
✓ Baseline policy
✓ Comparison dashboard
✓ Cost model
✓ Emission model
✓ Failure-case testing
✓ Audit history
✓ Risk register
✓ User guide
✓ Architecture document
✓ Data schema
✓ Experiment results
✓ Stakeholder validation
✓ Automated tests
✓ Docker configuration
✓ README
```

------------------------------------------------------------------------

# 65. Final Outcome

The completed system provides manufacturers with a transparent and
auditable way to decide:

> **When should we reorder, how much should we order, and what is the
> risk if the supplier is late or demand changes?**

Instead of using only a fixed reorder rule, the system considers:

``` text
Demand
+
Demand Uncertainty
+
Lead-Time Uncertainty
+
Supplier Reliability
+
Supplier Fill Rate
+
Variable Pack Size
+
Service Target
+
Inventory Cost
+
Stockout Cost
+
Emissions
        ↓
Probabilistic Recommendation
        ↓
Human Approval
        ↓
Auditable Plan History
```

The final evaluation compares the probabilistic policy with the fixed
baseline and quantifies the resulting trade-offs in:

-   Stockouts
-   Excess inventory
-   Service level
-   Fill rate
-   Cost
-   Supplier reliability
-   Emissions

------------------------------------------------------------------------

# 66. Recommended Technology Stack Summary

``` text
Frontend
├── React
├── Vite
├── Tailwind CSS
├── React Router
├── Axios
├── Recharts
├── Lucide React
├── React Hook Form
└── Zod

Backend
├── Python
├── FastAPI
├── Uvicorn
├── Pydantic
├── SQLAlchemy
└── Alembic

Data / Simulation
├── NumPy
├── Pandas
├── SciPy
├── scikit-learn (optional)
├── Matplotlib
└── Monte Carlo Simulation

Database
├── SQLite
└── PostgreSQL

Authentication
└── JWT

Testing
├── Pytest
├── HTTPX
├── Vitest
└── React Testing Library

DevOps
├── Docker
├── Docker Compose
├── Git
└── GitHub

API Documentation
└── OpenAPI / Swagger
```

------------------------------------------------------------------------

# 67. Conclusion

The **Probabilistic Smart Reorder System** is designed as a practical
full-stack prototype rather than only a machine-learning notebook.

Its key strength is that it connects:

**real inventory data → supplier behaviour → uncertainty modelling →
probabilistic simulation → reorder recommendation → human decision →
audit trail → measurable comparison.**

This architecture provides a strong foundation for a manufacturer pilot
while keeping the MVP understandable, testable, reproducible and
extensible.
