# System Architecture Document

## Probabilistic Smart Reorder System for Variable Pack-Size Manufacturing

### 1. High-Level System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │            React 19 Frontend            │
                    │   (Vite, Tailwind CSS, Recharts)        │
                    │                                         │
                    │ - Executive Dashboard                   │
                    │ - Component & Supplier Catalog          │
                    │ - Probabilistic Reorder Workbench       │
                    │ - Monte Carlo Simulation Sandbox        │
                    │ - Baseline vs Proposed Benchmarking     │
                    │ - Auditable Decision History            │
                    │ - Failure Workbench & Risk Matrix       │
                    └────────────────────┬────────────────────┘
                                         │ REST API (JSON / HTTP)
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │             FastAPI Backend             │
                    │                                         │
                    │ - JWT Auth & Role-Based Authorization   │
                    │ - Component & Supplier REST APIs        │
                    │ - Probabilistic Engine (SciPy/NumPy)    │
                    │ - Monte Carlo Simulator (10,000 runs)   │
                    │ - Versioned Plan & Audit Service        │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │         SQLAlchemy + SQLite / Postgres  │
                    │ - Components & Variable Pack Sizes      │
                    │ - Suppliers & Reliability Parameters    │
                    │ - Daily Demand History (365 days)       │
                    │ - Immutable Versioned Reorder Plans     │
                    │ - Immutable Audit Logs                  │
                    └─────────────────────────────────────────┘
```

### 2. Layered Responsibilities

#### Presentation Layer (React + Vite)
- User interface for inventory planners, procurement teams, and reviewers.
- Real-time visual trajectory rendering with Recharts.
- Human approval workflow requiring mandatory change reasons.

#### API & Business Logic Layer (FastAPI)
- Handles request validation via Pydantic schemas.
- Implements strict pack-size integer ceiling rounding: $\text{Order Qty} = \lceil \frac{\text{Unrounded Qty}}{\text{Pack Size}} \rceil \times \text{Pack Size}$.
- Computes lead-time demand quantiles matching target Service Level Agreement (SLA).
- Executes 10,000-iteration Monte Carlo discrete-time daily trajectory simulations.

#### Data Persistence & Audit Layer (SQLAlchemy ORM)
- Stores components, suppliers, purchase orders, demand history, reorder plans, and audit logs.
- Enforces version incrementing and immutable audit trails for every decision override.
