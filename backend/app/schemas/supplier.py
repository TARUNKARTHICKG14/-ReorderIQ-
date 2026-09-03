from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class SupplierBase(BaseModel):
    supplier_name: str
    reliability: float = Field(ge=0.0, le=1.0, description="On-time delivery probability [0..1]")
    fill_rate: float = Field(ge=0.0, le=1.0, description="Average order quantity fulfillment [0..1]")
    avg_lead_time: float = Field(gt=0, description="Mean lead time in days")
    lead_time_std: float = Field(ge=0, description="Standard deviation of lead time in days")
    unit_price_factor: float = Field(default=1.0, gt=0)
    distance_km: float = Field(default=350.0, ge=0)
    emission_factor: float = Field(default=0.00015, ge=0)
    status: str = Field(default="ACTIVE")

class SupplierCreate(SupplierBase):
    supplier_id: str

class SupplierUpdate(BaseModel):
    supplier_name: Optional[str] = None
    reliability: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    fill_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    avg_lead_time: Optional[float] = Field(default=None, gt=0)
    lead_time_std: Optional[float] = Field(default=None, ge=0)
    status: Optional[str] = None

class SupplierResponse(SupplierBase):
    supplier_id: str
    created_at: datetime

    class Config:
        from_attributes = True
