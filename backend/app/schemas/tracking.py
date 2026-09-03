from typing import List, Optional
from pydantic import BaseModel, Field

class GPSCoordinate(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None

class TrackingResponse(BaseModel):
    tracking_id: str
    component_id: str
    component_name: str
    supplier_id: str
    supplier_name: str
    carrier_name: str
    vehicle_id: str
    driver_name: str
    driver_phone: str
    origin: GPSCoordinate
    destination: GPSCoordinate
    current_location: GPSCoordinate
    transit_progress_pct: float
    speed_kmh: float
    temperature_c: float
    status: str # IN_TRANSIT, DELAYED, DELIVERED, DISRUPTED
    eta_hours_remaining: float
    estimated_arrival: str
    waypoints: List[GPSCoordinate]
