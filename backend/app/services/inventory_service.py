from sqlalchemy.orm import Session
from app.models.component import Component
from app.models.demand import DemandHistory
from app.schemas.component import ComponentCreate, ComponentUpdate

class InventoryService:
    @staticmethod
    def get_all_components(db: Session):
        return db.query(Component).all()

    @staticmethod
    def get_component_by_id(db: Session, component_id: str):
        return db.query(Component).filter(Component.component_id == component_id).first()

    @staticmethod
    def create_component(db: Session, component_data: ComponentCreate):
        db_component = Component(**component_data.dict())
        db.add(db_component)
        db.commit()
        db.refresh(db_component)
        return db_component

    @staticmethod
    def update_component(db: Session, component_id: str, update_data: ComponentUpdate):
        db_component = db.query(Component).filter(Component.component_id == component_id).first()
        if not db_component:
            return None
        
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(db_component, key, value)
        
        db.commit()
        db.refresh(db_component)
        return db_component

    @staticmethod
    def get_demand_history(db: Session, component_id: str):
        records = db.query(DemandHistory).filter(DemandHistory.component_id == component_id).order_by(DemandHistory.date.asc()).all()
        return [r.demand_quantity for r in records]
