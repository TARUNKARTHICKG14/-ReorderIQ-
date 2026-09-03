from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(String, ForeignKey("reorder_plans.plan_id"), nullable=False, index=True)
    component_id = Column(String, ForeignKey("components.component_id"), nullable=False, index=True)
    user_id = Column(String, nullable=False)
    action = Column(String, nullable=False) # CREATED, APPROVED, MODIFIED, REJECTED
    old_value = Column(String, nullable=True) # JSON or summary string of previous state
    new_value = Column(String, nullable=False) # JSON or summary string of new state
    reason = Column(String, nullable=False) # Mandatory explanation for changes/rejections
    version = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
