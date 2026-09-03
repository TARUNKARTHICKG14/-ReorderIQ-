import math
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.component import Component
from app.models.supplier import Supplier
from app.schemas.tracking import TrackingResponse, GPSCoordinate

# Indian Industrial Cities Coordinates for realistic manufacturing supply chain routes
CITY_COORDINATES = {
    "SUP-001": {"city": "Bengaluru Tech Park", "lat": 12.9716, "lng": 77.5946},
    "SUP-002": {"city": "Chennai Automotive Port", "lat": 13.0827, "lng": 80.2707},
    "SUP-003": {"city": "Pune Engineering Hub", "lat": 18.5204, "lng": 73.8567},
    "SUP-004": {"city": "Coimbatore Precision Cluster", "lat": 11.0168, "lng": 76.9558},
    "SUP-005": {"city": "Mumbai Port Terminal", "lat": 18.9438, "lng": 72.8360},
    "SUP-006": {"city": "Ahmedabad Electronics Zone", "lat": 23.0225, "lng": 72.5714},
    "SUP-007": {"city": "Hosur Industrial Estate", "lat": 12.7409, "lng": 77.8253},
    "SUP-008": {"city": "Vadodara Electrical Park", "lat": 22.3072, "lng": 73.1812},
    "SUP-009": {"city": "Nagpur Central Hub", "lat": 21.1458, "lng": 79.0882},
    "SUP-010": {"city": "Visakhapatnam Freight Dock", "lat": 17.6868, "lng": 83.2185}
}

FACTORY_DESTINATION = {"city": "Hyderabad HQ Manufacturing Complex", "lat": 17.3850, "lng": 78.4867}

CARRIERS = [
    ("Apex Logistics Transit", "APX-8821", "Ramesh Kumar", "+91 98765 43210"),
    ("Titan Heavy Haulage", "TTN-4019", "Suresh Patel", "+91 98123 76543"),
    ("Vanguard Freight Express", "VNG-9102", "Vikram Singh", "+91 97654 32109"),
    ("Swift Air & Ground Express", "SWF-1029", "Anil Reddy", "+91 99887 66554"),
    ("Starlight Fleet Services", "STL-6632", "Deepak Verma", "+91 98450 11223")
]

class TrackingService:
    @staticmethod
    def get_live_tracking(db: Session, component_id: str) -> TrackingResponse:
        component = db.query(Component).filter(Component.component_id == component_id).first()
        if not component:
            raise ValueError(f"Component '{component_id}' not found.")

        supplier = db.query(Supplier).filter(Supplier.supplier_id == component.supplier_id).first()
        
        # Origin & Destination coordinates
        sup_loc = CITY_COORDINATES.get(component.supplier_id, {"city": "Bengaluru Hub", "lat": 12.9716, "lng": 77.5946})
        origin_lat, origin_lng = sup_loc["lat"], sup_loc["lng"]
        dest_lat, dest_lng = FACTORY_DESTINATION["lat"], FACTORY_DESTINATION["lng"]

        # Deterministic seed based on component_id for consistent simulation
        seed_val = sum(ord(c) for c in component_id)
        rng = random.Random(seed_val)

        # Progress % along the journey (e.g. 45% to 85%)
        progress_pct = round(rng.uniform(35.0, 88.0), 1)

        # Calculate current live GPS position along geodesic interpolation
        curr_lat = origin_lat + (progress_pct / 100.0) * (dest_lat - origin_lat) + rng.uniform(-0.02, 0.02)
        curr_lng = origin_lng + (progress_pct / 100.0) * (dest_lng - origin_lng) + rng.uniform(-0.02, 0.02)

        # Generate 6 route waypoints
        waypoints = []
        for step in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]:
            wp_lat = origin_lat + step * (dest_lat - origin_lat) + (rng.uniform(-0.05, 0.05) if 0 < step < 1 else 0)
            wp_lng = origin_lng + step * (dest_lng - origin_lng) + (rng.uniform(-0.05, 0.05) if 0 < step < 1 else 0)
            waypoints.append(GPSCoordinate(lat=round(wp_lat, 4), lng=round(wp_lng, 4)))

        carrier = CARRIERS[seed_val % len(CARRIERS)]
        eta_hours = round((1.0 - progress_pct / 100.0) * (supplier.avg_lead_time * 24.0), 1)
        est_arrival = (datetime.now() + timedelta(hours=eta_hours)).strftime("%b %d, %Y - %I:%M %p")

        status = "DELAYED" if supplier.reliability < 0.85 else "IN_TRANSIT"

        return TrackingResponse(
            tracking_id=f"TRK-{component_id}-{seed_val}",
            component_id=component.component_id,
            component_name=component.component_name,
            supplier_id=supplier.supplier_id,
            supplier_name=supplier.supplier_name,
            carrier_name=carrier[0],
            vehicle_id=carrier[1],
            driver_name=carrier[2],
            driver_phone=carrier[3],
            origin=GPSCoordinate(lat=origin_lat, lng=origin_lng, name=sup_loc["city"]),
            destination=GPSCoordinate(lat=dest_lat, lng=dest_lng, name=FACTORY_DESTINATION["city"]),
            current_location=GPSCoordinate(lat=round(curr_lat, 4), lng=round(curr_lng, 4), name=f"Highway Segment en route to {FACTORY_DESTINATION['city']}"),
            transit_progress_pct=progress_pct,
            speed_kmh=round(rng.uniform(55.0, 78.0), 1),
            temperature_c=round(rng.uniform(18.5, 23.0), 1),
            status=status,
            eta_hours_remaining=eta_hours,
            estimated_arrival=est_arrival,
            waypoints=waypoints
        )

    @staticmethod
    def get_all_active_shipments(db: Session):
        components = db.query(Component).all()
        active_shipments = []
        for comp in components[:12]:
            try:
                trk = TrackingService.get_live_tracking(db, comp.component_id)
                active_shipments.append(trk)
            except Exception:
                pass
        return active_shipments
