from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ComponentBase(BaseModel):
    component_name: str
    category: str
    unit_cost: float = Field(gt=0)
    holding_cost: float = Field(ge=0)
    stockout_cost: float = Field(ge=0)
    order_cost: float = Field(default=150.0, ge=0)
    pack_size: int = Field(gt=0, description="Supplier pack size constraint (must be > 0)")
    current_inventory: int = Field(ge=0)
    supplier_id: str

class ComponentCreate(ComponentBase):
    component_id: str

class ComponentUpdate(BaseModel):
    component_name: Optional[str] = None
    category: Optional[str] = None
    unit_cost: Optional[float] = Field(default=None, gt=0)
    holding_cost: Optional[float] = Field(default=None, ge=0)
    stockout_cost: Optional[float] = Field(default=None, ge=0)
    order_cost: Optional[float] = Field(default=None, ge=0)
    pack_size: Optional[int] = Field(default=None, gt=0)
    current_inventory: Optional[int] = Field(default=None, ge=0)
    supplier_id: Optional[str] = None

class ComponentResponse(ComponentBase):
    component_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
