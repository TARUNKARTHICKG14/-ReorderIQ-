from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from app.database.database import Base

class ReorderPlan(Base):
    __tablename__ = "reorder_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(String, index=True, nullable=False)
    component_id = Column(String, ForeignKey("components.component_id"), nullable=False, index=True)
    reorder_point = Column(Integer, nullable=False)
    order_quantity = Column(Integer, nullable=False)
    service_target = Column(Float, nullable=False, default=0.95)
    stockout_probability = Column(Float, nullable=False)
    expected_cost = Column(Float, nullable=False)
    estimated_emissions = Column(Float, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    status = Column(String, default="RECOMMENDED") # RECOMMENDED, APPROVED, MODIFIED, REJECTED
    created_by = Column(String, default="system_ai")
    created_at = Column(DateTime, default=datetime.utcnow)
