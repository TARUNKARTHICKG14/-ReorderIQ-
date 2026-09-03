from sqlalchemy.orm import Session
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate

class SupplierService:
    @staticmethod
    def get_all_suppliers(db: Session):
        return db.query(Supplier).all()

    @staticmethod
    def get_supplier_by_id(db: Session, supplier_id: str):
        return db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()

    @staticmethod
    def create_supplier(db: Session, supplier_data: SupplierCreate):
        db_supplier = Supplier(**supplier_data.dict())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

    @staticmethod
    def update_supplier(db: Session, supplier_id: str, update_data: SupplierUpdate):
        db_supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
        if not db_supplier:
            return None
        
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(db_supplier, key, value)
        
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
