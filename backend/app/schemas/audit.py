from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    audit_id: int
    plan_id: str
    component_id: str
    user_id: str
    action: str
    old_value: Optional[str] = None
    new_value: str
    reason: str
    version: int
    timestamp: datetime

    class Config:
        from_attributes = True
