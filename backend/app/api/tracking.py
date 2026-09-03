from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.tracking import TrackingResponse
from app.services.tracking_service import TrackingService

router = APIRouter(prefix="/api/tracking", tags=["Live Product & Shipment GPS Tracking"])

@router.get("/active", response_model=List[TrackingResponse])
def get_all_active_shipments(db: Session = Depends(get_db)):
    return TrackingService.get_all_active_shipments(db)

@router.get("/{component_id}", response_model=TrackingResponse)
def get_live_tracking(component_id: str, db: Session = Depends(get_db)):
    try:
        return TrackingService.get_live_tracking(db, component_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
