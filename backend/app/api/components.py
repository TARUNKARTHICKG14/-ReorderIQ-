from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.component import ComponentCreate, ComponentUpdate, ComponentResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/api/components", tags=["Components"])

@router.get("", response_model=List[ComponentResponse])
def list_components(db: Session = Depends(get_db)):
    return InventoryService.get_all_components(db)

@router.get("/{component_id}", response_model=ComponentResponse)
def get_component(component_id: str, db: Session = Depends(get_db)):
    comp = InventoryService.get_component_by_id(db, component_id)
    if not comp:
        raise HTTPException(status_code=404, detail=f"Component '{component_id}' not found.")
    return comp

@router.post("", response_model=ComponentResponse, status_code=status.HTTP_201_CREATED)
def create_component(component: ComponentCreate, db: Session = Depends(get_db)):
    if component.pack_size <= 0:
        raise HTTPException(status_code=422, detail="Pack size must be > 0.")
    return InventoryService.create_component(db, component)

@router.put("/{component_id}", response_model=ComponentResponse)
def update_component(component_id: str, update: ComponentUpdate, db: Session = Depends(get_db)):
    if update.pack_size is not None and update.pack_size <= 0:
        raise HTTPException(status_code=422, detail="Pack size must be > 0.")
    comp = InventoryService.update_component(db, component_id, update)
    if not comp:
        raise HTTPException(status_code=404, detail=f"Component '{component_id}' not found.")
    return comp
