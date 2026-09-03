from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CalculateRecommendationRequest(BaseModel):
    component_id: str
    service_target: float = Field(default=0.95, ge=0.5, le=0.999)
    simulation_runs: int = Field(default=10000, ge=100, le=100000)

class RecommendationActionRequest(BaseModel):
    user_id: str
    reason: str = Field(min_length=3, description="Mandatory reason for decision audit log")
    modified_reorder_point: Optional[int] = Field(default=None, ge=0)
    modified_order_quantity: Optional[int] = Field(default=None, ge=0)

class RecommendationResponse(BaseModel):
    plan_id: str
    component_id: str
    component_name: str
    supplier_id: str
    supplier_name: str
    current_inventory: int
    pack_size: int
    reorder_point: int
    recommended_order_quantity: int
    raw_unrounded_quantity: float
    service_target: float
    simulated_service_level: float
    stockout_probability: float
    expected_holding_cost: float
    expected_stockout_cost: float
    expected_order_cost: float
    expected_total_cost: float
    estimated_emissions_kg: float
    supplier_reliability: float
    supplier_fill_rate: float
    status: str
    version: int
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True
