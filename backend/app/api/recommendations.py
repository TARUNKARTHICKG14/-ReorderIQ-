from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.recommendation import (
    CalculateRecommendationRequest,
    RecommendationActionRequest,
    RecommendationResponse
)
from app.services.reorder_service import ReorderService

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("/calculate", response_model=RecommendationResponse)
def calculate_recommendation(req: CalculateRecommendationRequest, db: Session = Depends(get_db)):
    try:
        return ReorderService.calculate_recommendation(
            db=db,
            component_id=req.component_id,
            service_target=req.service_target,
            simulation_runs=req.simulation_runs
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{component_id}/approve")
def approve_recommendation(component_id: str, req: RecommendationActionRequest, db: Session = Depends(get_db)):
    try:
        plan = ReorderService.approve_recommendation(
            db=db,
            component_id=component_id,
            user_id=req.user_id,
            reason=req.reason
        )
        return {"message": "Plan approved successfully", "plan_id": plan.plan_id, "version": plan.version, "status": plan.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{component_id}/modify")
def modify_recommendation(component_id: str, req: RecommendationActionRequest, db: Session = Depends(get_db)):
    try:
        plan = ReorderService.modify_recommendation(
            db=db,
            component_id=component_id,
            user_id=req.user_id,
            reason=req.reason,
            new_rop=req.modified_reorder_point,
            new_order_qty=req.modified_order_quantity
        )
        return {"message": "Plan modified successfully", "plan_id": plan.plan_id, "version": plan.version, "status": plan.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{component_id}/reject")
def reject_recommendation(component_id: str, req: RecommendationActionRequest, db: Session = Depends(get_db)):
    try:
        plan = ReorderService.reject_recommendation(
            db=db,
            component_id=component_id,
            user_id=req.user_id,
            reason=req.reason
        )
        return {"message": "Plan rejected", "plan_id": plan.plan_id, "version": plan.version, "status": plan.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
