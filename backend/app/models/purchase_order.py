from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from app.database.database import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    order_id = Column(String, primary_key=True, index=True)
    component_id = Column(String, ForeignKey("components.component_id"), nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.supplier_id"), nullable=False)
    order_quantity = Column(Integer, nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(DateTime, nullable=False)
    actual_delivery = Column(DateTime, nullable=True)
    received_quantity = Column(Integer, default=0)
    status = Column(String, default="PENDING") # PENDING, DELIVERED, PARTIAL, DELAYED, CANCELLED
