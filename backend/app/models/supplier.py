from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.database.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    supplier_id = Column(String, primary_key=True, index=True)
    supplier_name = Column(String, nullable=False)
    reliability = Column(Float, default=0.95)  # 0.0 to 1.0 (on-time rate)
    fill_rate = Column(Float, default=0.98)    # 0.0 to 1.0 (quantity fulfilled rate)
    avg_lead_time = Column(Float, default=7.0)  # in days
    lead_time_std = Column(Float, default=1.5)  # in days
    unit_price_factor = Column(Float, default=1.0)
    distance_km = Column(Float, default=350.0)
    emission_factor = Column(Float, default=0.00015) # kg CO2e per unit-km
    status = Column(String, default="ACTIVE") # ACTIVE, DISRUPTED, INACTIVE
    
    # Location GPS Coordinates
    origin_city = Column(String, default="Bengaluru Hub")
    origin_lat = Column(Float, default=12.9716)
    origin_lng = Column(Float, default=77.5946)
    dest_city = Column(String, default="Hyderabad Manufacturing Plant")
    dest_lat = Column(Float, default=17.3850)
    dest_lng = Column(Float, default=78.4867)

    created_at = Column(DateTime, default=datetime.utcnow)
