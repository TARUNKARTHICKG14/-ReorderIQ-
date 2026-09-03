import json
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.reorder_plan import ReorderPlan

class AuditService:
    @staticmethod
    def log_plan_action(
        db: Session,
        plan_id: str,
        component_id: str,
        user_id: str,
        action: str,
        old_value: dict,
        new_value: dict,
        reason: str,
        version: int
    ):
        audit_entry = AuditLog(
            plan_id=plan_id,
            component_id=component_id,
            user_id=user_id,
            action=action,
            old_value=json.dumps(old_value) if old_value else None,
            new_value=json.dumps(new_value),
            reason=reason,
            version=version
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry

    @staticmethod
    def get_audit_logs(db: Session, component_id: str = None, plan_id: str = None):
        query = db.query(AuditLog)
        if component_id:
            query = query.filter(AuditLog.component_id == component_id)
        if plan_id:
            query = query.filter(AuditLog.plan_id == plan_id)
        return query.order_by(AuditLog.timestamp.desc()).all()

    @staticmethod
    def get_plan_history(db: Session, plan_id: str):
        return db.query(AuditLog).filter(AuditLog.plan_id == plan_id).order_by(AuditLog.version.asc()).all()
