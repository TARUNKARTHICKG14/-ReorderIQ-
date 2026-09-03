from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/api/audit", tags=["Audit & Governance"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    component_id: Optional[str] = Query(None),
    plan_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AuditService.get_audit_logs(db, component_id=component_id, plan_id=plan_id)

@router.get("/{plan_id}", response_model=List[AuditLogResponse])
def get_plan_history(plan_id: str, db: Session = Depends(get_db)):
    return AuditService.get_plan_history(db, plan_id=plan_id)
