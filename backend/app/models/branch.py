from sqlalchemy import Column, String, Integer, Float, DateTime
from datetime import datetime
from app.database.database import Base

class Branch(Base):
    __tablename__ = "branches"

    branch_id = Column(String, primary_key=True, index=True)
    branch_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    region = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
