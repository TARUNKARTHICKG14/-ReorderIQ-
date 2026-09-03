from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database.database import Base

class DemandHistory(Base):
    __tablename__ = "demand_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    component_id = Column(String, ForeignKey("components.component_id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    demand_quantity = Column(Float, nullable=False)
