import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base, SessionLocal
from app.database.seed_data import seed_database
from app.models.component import Component
from app.api import (
    auth,
    components,
    suppliers,
    recommendations,
    simulations,
    comparisons,
    audit,
    failure_cases,
    tracking,
    data_import
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Probabilistic Smart Reorder System",
    description="A full-stack, field-ready prototype for manufacturers managing components supplied in variable pack sizes under demand and lead-time uncertainty.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Vite React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-seed database if empty on startup
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        count = db.query(Component).count()
        if count == 0:
            print("Database empty. Auto-seeding initial manufacturing data...")
            seed_database()
    except Exception as e:
        print(f"Startup DB check error: {e}")
    finally:
        db.close()

# Register API Routers
app.include_router(auth.router)
app.include_router(components.router)
app.include_router(suppliers.router)
app.include_router(recommendations.router)
app.include_router(simulations.router)
app.include_router(comparisons.router)
app.include_router(audit.router)
app.include_router(failure_cases.router)
app.include_router(tracking.router)
app.include_router(data_import.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Probabilistic Smart Reorder System",
        "documentation": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
