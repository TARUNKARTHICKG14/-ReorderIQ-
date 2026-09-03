import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.models.supplier import Supplier
from app.models.component import Component
from app.services.reorder_service import ReorderService
from app.services.audit_service import AuditService

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Create dummy supplier & component
    sup = Supplier(supplier_id="SUP-TEST", supplier_name="Test Supplier", reliability=0.95, fill_rate=0.98, avg_lead_time=7.0, lead_time_std=1.0)
    comp = Component(component_id="COMP-TEST", component_name="Test Component", category="Fasteners", unit_cost=50.0, holding_cost=10.0, stockout_cost=125.0, pack_size=100, current_inventory=500, supplier_id="SUP-TEST")
    
    db.add(sup)
    db.add(comp)
    db.commit()
    yield db
    db.close()

def test_audit_history_immutability(test_db):
    # 1. Calculate recommendation (version 1)
    rec = ReorderService.calculate_recommendation(test_db, "COMP-TEST", service_target=0.95, simulation_runs=100)
    assert rec["version"] == 1
    assert rec["status"] == "RECOMMENDED"

    # 2. Modify recommendation (version 2) with mandatory reason
    mod = ReorderService.modify_recommendation(
        db=test_db,
        component_id="COMP-TEST",
        user_id="planner01",
        reason="Anticipating supplier maintenance delay",
        new_rop=900,
        new_order_qty=300
    )
    assert mod.version == 2
    assert mod.status == "MODIFIED"

    # 3. Verify audit history contains BOTH version 1 and version 2
    history = AuditService.get_audit_logs(test_db, component_id="COMP-TEST")
    assert len(history) == 2
    assert history[0].version == 2
    assert history[0].action == "MODIFIED"
    assert "supplier maintenance delay" in history[0].reason
    assert history[1].version == 1
    assert history[1].action == "CREATED"
