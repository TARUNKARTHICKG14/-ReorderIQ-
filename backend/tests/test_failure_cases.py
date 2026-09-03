import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import SessionLocal
from app.database.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    db = SessionLocal()
    seed_database()
    db.close()

def test_invalid_pack_size_rejection():
    # Attempting to calculate recommendation or update with pack_size <= 0 should fail
    response = client.post("/api/failure-cases/invalid-pack-size?invalid_pack_size=0")
    assert response.status_code == 422
    assert "Invalid pack size" in response.json()["detail"]

def test_supplier_delay_scenario():
    response = client.post("/api/failure-cases/supplier-delay?component_id=COMP-001&actual_lead_time=15")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "WARNING_TRIGGERED"
    assert data["adjusted_reorder_point"] > 0

def test_partial_delivery_scenario():
    response = client.post("/api/failure-cases/partial-delivery?component_id=COMP-001&fill_rate=0.6")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "DEFENSIVE_ADJUSTMENT"

def test_demand_spike_scenario():
    response = client.post("/api/failure-cases/demand-spike?component_id=COMP-001&spike_demand=250")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ABNORMAL_DEMAND_DETECTED"
