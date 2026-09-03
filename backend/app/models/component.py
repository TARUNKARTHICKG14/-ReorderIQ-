from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from app.database.database import Base

class Component(Base):
    __tablename__ = "components"

    component_id = Column(String, primary_key=True, index=True)
    component_name = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g., Electronics, Hydraulics, Fasteners
    unit_cost = Column(Float, nullable=False)
    holding_cost = Column(Float, nullable=False) # annual holding cost per unit
    stockout_cost = Column(Float, nullable=False) # cost per stockout unit
    order_cost = Column(Float, default=150.0) # fixed administrative order cost
    pack_size = Column(Integer, nullable=False, default=100) # Variable pack size!
    current_inventory = Column(Integer, nullable=False, default=500)
    supplier_id = Column(String, ForeignKey("suppliers.supplier_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
