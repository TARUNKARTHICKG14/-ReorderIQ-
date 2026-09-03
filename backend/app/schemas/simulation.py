from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SimulationRunRequest(BaseModel):
    component_id: str
    service_target: float = Field(default=0.95, ge=0.5, le=0.999)
    simulation_runs: int = Field(default=10000, ge=100, le=50000)
    override_demand_mean: Optional[float] = Field(default=None, ge=0)
    override_demand_std: Optional[float] = Field(default=None, ge=0)
    override_lead_time_mean: Optional[float] = Field(default=None, ge=0)
    override_lead_time_std: Optional[float] = Field(default=None, ge=0)
    override_reliability: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    override_fill_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)

class PolicyMetricSummary(BaseModel):
    service_level: float
    fill_rate: float
    stockout_count: int
    avg_inventory: float
    excess_inventory: float
    holding_cost: float
    stockout_cost: float
    order_cost: float
    emergency_cost: float
    total_cost: float
    emissions_kg: float

class SimulationResultResponse(BaseModel):
    component_id: str
    service_target: float
    simulation_runs: int
    baseline_rop: int
    baseline_order_qty: int
    probabilistic_rop: int
    probabilistic_order_qty: int
    pack_size: int
    baseline_metrics: PolicyMetricSummary
    probabilistic_metrics: PolicyMetricSummary
    tradeoff_comparison: Dict[str, Any]
    lead_time_demand_samples: List[float]
    daily_trajectory_sample: Dict[str, List[float]]
