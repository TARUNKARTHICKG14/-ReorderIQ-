from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.demand import DemandHistory
import pandas as pd
import io
from datetime import datetime

router = APIRouter(prefix="/api/import", tags=["Data Import"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/sales-history")
async def upload_sales_history(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        required_cols = {"component_id", "date", "demand_quantity"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_cols}")
        
        records = []
        for _, row in df.iterrows():
            d = DemandHistory(
                component_id=row["component_id"],
                date=datetime.strptime(str(row["date"]), "%Y-%m-%d").date(),
                demand_quantity=float(row["demand_quantity"])
            )
            records.append(d)
        
        db.bulk_save_objects(records)
        db.commit()
        return {"message": f"Successfully imported {len(records)} sales history records."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
