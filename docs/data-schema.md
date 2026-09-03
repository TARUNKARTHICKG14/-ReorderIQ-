# Database Schema & Entity Relationships

## Database Entities

### 1. `suppliers`
- `supplier_id` (VARCHAR, PK): Unique identifier.
- `supplier_name` (VARCHAR): Supplier legal business name.
- `reliability` (FLOAT): On-time delivery probability [0.0 to 1.0].
- `fill_rate` (FLOAT): Average quantity fulfillment ratio [0.0 to 1.0].
- `avg_lead_time` (FLOAT): Mean lead time in days.
- `lead_time_std` (FLOAT): Standard deviation of lead time.
- `distance_km` (FLOAT): Distance from manufacturing facility.
- `emission_factor` (FLOAT): kg CO₂e per unit-km transport factor.
- `status` (VARCHAR): `ACTIVE`, `DISRUPTED`, or `INACTIVE`.

### 2. `components`
- `component_id` (VARCHAR, PK): Unique component SKU code.
- `component_name` (VARCHAR): Description.
- `category` (VARCHAR): Subsystem category.
- `unit_cost` (FLOAT): Unit purchase price (₹).
- `holding_cost` (FLOAT): Annual inventory holding cost per unit (₹).
- `stockout_cost` (FLOAT): Stockout penalty cost per unit (₹).
- `order_cost` (FLOAT): Administrative order placement fee (₹).
- `pack_size` (INTEGER, NOT NULL > 0): **Variable supplier pack size constraint**.
- `current_inventory` (INTEGER): Current stock balance.
- `supplier_id` (VARCHAR, FK -> `suppliers.supplier_id`).

### 3. `demand_history`
- `id` (INTEGER, PK): Primary key.
- `component_id` (VARCHAR, FK -> `components.component_id`).
- `date` (DATE): Daily demand date.
- `demand_quantity` (FLOAT): Observed daily component usage.

### 4. `reorder_plans`
- `id` (INTEGER, PK): Version row ID.
- `plan_id` (VARCHAR, Index): Persistent plan reference string.
- `component_id` (VARCHAR, FK -> `components.component_id`).
- `reorder_point` (INTEGER): Calculated or modified Reorder Point.
- `order_quantity` (INTEGER): Calculated or modified Order Quantity (Pack-rounded).
- `service_target` (FLOAT): Target service level (e.g. 0.95).
- `stockout_probability` (FLOAT): Simulated stockout risk.
- `expected_cost` (FLOAT): Expected financial cost.
- `estimated_emissions` (FLOAT): Estimated carbon emissions.
- `version` (INTEGER): Version number (1, 2, 3...).
- `status` (VARCHAR): `RECOMMENDED`, `APPROVED`, `MODIFIED`, or `REJECTED`.
- `created_by` (VARCHAR): Planner or system user ID.

### 5. `audit_logs`
- `audit_id` (INTEGER, PK): Audit log entry ID.
- `plan_id` (VARCHAR, FK -> `reorder_plans.plan_id`).
- `component_id` (VARCHAR, FK -> `components.component_id`).
- `user_id` (VARCHAR): Planner who authorized action.
- `action` (VARCHAR): `CREATED`, `APPROVED`, `MODIFIED`, or `REJECTED`.
- `old_value` (TEXT): JSON summary of prior state.
- `new_value` (TEXT): JSON summary of committed state.
- `reason` (TEXT, MANDATORY): Change justification.
- `version` (INTEGER): Plan version number.
- `timestamp` (DATETIME): Immutable timestamp.
