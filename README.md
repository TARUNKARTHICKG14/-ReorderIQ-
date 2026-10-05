# Probabilistic Smart Reorder System

## A Full-Stack, Field-Ready Prototype for Manufacturers Managing Components Supplied in Variable Pack Sizes

---

### 1. Executive Summary & Problem Statement

Traditional fixed reorder rules (such as $ROP = \text{Average Daily Demand} \times \text{Average Lead Time}$) assume deterministic conditions. In manufacturing environments where components are supplied in **variable pack sizes**, these static rules lead to:
- Frequent stockout events when lead times vary or suppliers deliver late.
- Excessive holding costs when demand fluctuates downward.
- Reorder quantity rejections due to supplier pack size constraints.
- Unnecessary carbon emissions from emergency air freight orders.
- Absence of an auditable history when planners override reorder recommendations.

The **Probabilistic Smart Reorder System** resolves these challenges by combining:
1. **Demand Uncertainty Modeling** (Daily demand statistical distributions).
2. **Lead-Time Uncertainty Modeling** ($\mu_{LT}, \sigma_{LT}$ lead-time distributions).
3. **Supplier Reliability & Fill Rate** (On-time probabilities & delivery deficit penalties).
4. **Variable Pack Size Rounding** ($\text{Order Qty} = \lceil \frac{\text{Unrounded Qty}}{\text{Pack Size}} \rceil \times \text{Pack Size}$).
5. **Monte Carlo Simulation Engine** (10,000 discrete-time daily trajectory runs).
6. **Immutable Auditable Plan Change History** (Versioned plans & mandatory planner justification logs).
7. **Quantified Multi-Objective Trade-Off Evaluation** (Service level %, stockout count, holding cost, penalty costs, carbon emissions).

---

### 2. Architecture & Tech Stack

#### Architecture Overview
```
                    ┌─────────────────────────────────────────┐
                    │            React 19 Frontend            │
                    │   (Vite, Tailwind CSS, Recharts)        │
                    │ - Dashboard & Executive Overview        │
                    │ - Component Catalog & Supplier Cards    │
                    │ - Reorder Recommendation Workbench      │
                    │ - Monte Carlo Simulation Sandbox        │
                    │ - Before-and-After Policy Comparison    │
                    │ - Immutable Audit History Timeline      │
                    │ - Failure & Stress Test Workbench       │
                    └────────────────────┬────────────────────┘
                                         │ REST API / HTTP
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │             FastAPI Backend             │
                    │ - JWT Auth & Role Authorization         │
                    │ - Component & Supplier Management APIs  │
                    │ - SciPy / NumPy Probabilistic Engine    │
                    │ - Monte Carlo Simulation Engine         │
                    │ - Versioned Plan & Audit Service        │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │         SQLAlchemy + SQLite / Postgres  │
                    │ - Components, Suppliers, Orders         │
                    │ - 365-Day Daily Demand Records          │
                    │ - Versioned Plans & Immutable Audits    │
                    └─────────────────────────────────────────┘
```

#### Stack Details
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic, SQLAlchemy, SciPy, NumPy, Pandas, Pytest, HTTPX.
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts, React Router.
- **Database**: SQLite (Development) / PostgreSQL (Production).

---

### 3. Quickstart & Installation Guide

#### Step 1: Clone Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd probabilistic-smart-reorder
```

#### Step 2: Backend Setup & Execution
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run FastAPI Server (auto-seeds database on first launch)
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

#### Step 3: Frontend Setup & Execution
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Web Application UI: `http://localhost:5173`

---

### 4. Running Reproducible Benchmark Experiments

To execute the 10,000-iteration Monte Carlo benchmark script comparing the Fixed Baseline against the Probabilistic Policy:

```bash
# Run from repository root
PYTHONPATH=backend ./backend/venv/bin/python experiments/run_experiments.py
```
This updates `/experiments/results/experiment_summary.json` with empirical cost, service level, stockout reduction, and carbon footprint metrics.

---

### 5. Automated Testing Suite

#### Run Backend Unit & Integration Tests
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests
```
The pytest suite validates:
- Integer pack size ceiling rounding logic.
- Safety stock quantile calculation.
- 365-day Monte Carlo trajectory simulation.
- Audit history immutability & plan version incrementing.
- Defensive handling for supplier delay, partial delivery, demand spike, and invalid pack size.

#### Run Frontend Build Verification
```bash
cd frontend
npm run build
```

---

### 6. Docker Compose Deployment

```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

### 7. Core Deliverables & Documentation

- [docs/architecture.md](./docs/architecture.md): System design & component layer specification.
- [docs/data-schema.md](./docs/data-schema.md): Entity schemas & versioned database structures.
- [docs/user-flow.md](./docs/user-flow.md): End-to-end planner walkthrough.
- [docs/risk-register.md](./docs/risk-register.md): Risk assessment & mitigation matrix.
- [docs/validation.md](./docs/validation.md): Stakeholder validation interview logs.
- [docs/experiment-report.md](./docs/experiment-report.md): Quantified benchmarking results & root-cause error analysis.
