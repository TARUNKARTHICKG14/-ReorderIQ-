import math
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.database import engine, Base, SessionLocal
from app.models.supplier import Supplier
from app.models.component import Component
from app.models.demand import DemandHistory
from app.models.purchase_order import PurchaseOrder
from app.models.reorder_plan import ReorderPlan
from app.models.audit_log import AuditLog

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        print("Seeding database with realistic manufacturing data...")

        # 1. Seed 10 Suppliers
        suppliers_data = [
            ("SUP-001", "Apex Precision Components", 0.96, 0.98, 5.0, 1.0, 450.0, "ACTIVE"),
            ("SUP-002", "Titan Dynamics & Hydraulics", 0.88, 0.92, 10.0, 2.5, 820.0, "ACTIVE"),
            ("SUP-003", "ElectroTech Micro-Systems", 0.94, 0.97, 7.0, 1.5, 310.0, "ACTIVE"),
            ("SUP-004", "Global Fastener Solutions", 0.92, 0.95, 4.0, 0.8, 150.0, "ACTIVE"),
            ("SUP-005", "Vanguard Metalworks", 0.78, 0.85, 14.0, 3.5, 1100.0, "ACTIVE"),
            ("SUP-006", "Nexus Sensors & Controls", 0.95, 0.99, 6.0, 1.2, 280.0, "ACTIVE"),
            ("SUP-007", "Omni Rubber & Gaskets", 0.90, 0.94, 5.0, 1.0, 220.0, "ACTIVE"),
            ("SUP-008", "Starlight Electric Motors", 0.85, 0.90, 12.0, 3.0, 950.0, "ACTIVE"),
            ("SUP-009", "Precision Die-Cast Supply", 0.93, 0.96, 8.0, 1.8, 540.0, "ACTIVE"),
            ("SUP-010", "AeroPlex Composites", 0.82, 0.88, 11.0, 2.8, 760.0, "ACTIVE")
        ]

        suppliers = []
        for s in suppliers_data:
            sup = Supplier(
                supplier_id=s[0],
                supplier_name=s[1],
                reliability=s[2],
                fill_rate=s[3],
                avg_lead_time=s[4],
                lead_time_std=s[5],
                distance_km=s[6],
                status=s[7]
            )
            db.add(sup)
            suppliers.append(sup)
        
        db.commit()

        # 2. Seed 50 Components with Variable Pack Sizes
        categories = ["Electronics", "Hydraulics", "Fasteners", "Machined Parts", "Electrical"]
        pack_sizes = [10, 50, 100, 250, 500, 1000]

        components = []
        for i in range(1, 51):
            comp_id = f"COMP-{i:03d}"
            cat = categories[(i - 1) % len(categories)]
            sup = suppliers[(i - 1) % len(suppliers)]
            pack = pack_sizes[(i - 1) % len(pack_sizes)]
            
            unit_c = round(random.uniform(15.0, 350.0), 2)
            hold_c = round(unit_c * 0.20, 2) # 20% annual holding cost rate
            stockout_c = round(unit_c * 2.5, 2) # 2.5x penalty per stockout

            comp = Component(
                component_id=comp_id,
                component_name=f"{cat[:4].upper()} Module - Series {100+i}",
                category=cat,
                unit_cost=unit_c,
                holding_cost=hold_c,
                stockout_cost=stockout_c,
                order_cost=150.0,
                pack_size=pack,
                current_inventory=random.randint(200, 1500),
                supplier_id=sup.supplier_id
            )
            db.add(comp)
            components.append(comp)

        db.commit()

        # 3. Seed 365 Days Demand History per Component (~18,250 records)
        start_date = datetime.now().date() - timedelta(days=365)
        demand_entries = []

        random.seed(42)
        for comp in components:
            base_demand = random.uniform(40.0, 180.0)
            demand_std = base_demand * 0.25
            
            for day_idx in range(365):
                cur_date = start_date + timedelta(days=day_idx)
                # Introduce slight seasonality + random noise
                seasonal_factor = 1.0 + 0.15 * math.sin(2 * math.pi * day_idx / 365)
                daily_q = max(0.0, random.gauss(base_demand * seasonal_factor, demand_std))
                
                demand_entries.append(
                    DemandHistory(
                        component_id=comp.component_id,
                        date=cur_date,
                        demand_quantity=round(daily_q, 1)
                    )
                )

        db.bulk_save_objects(demand_entries)
        db.commit()

        # 4. Seed Initial Reorder Plans & Audit History
        for i, comp in enumerate(components[:15]):
            plan_id = f"PLAN-SEED-{i+1:03d}"
            rop = int(comp.current_inventory * 0.8)
            order_q = comp.pack_size * random.randint(2, 5)
            
            plan = ReorderPlan(
                plan_id=plan_id,
                component_id=comp.component_id,
                reorder_point=rop,
                order_quantity=order_q,
                service_target=0.95,
                stockout_probability=0.042,
                expected_cost=round(comp.unit_cost * order_q * 0.15, 2),
                estimated_emissions=round(order_q * 0.05, 2),
                version=1,
                status="RECOMMENDED" if i % 2 == 0 else "APPROVED",
                created_by="probabilistic_ai_engine"
            )
            db.add(plan)
            db.commit()

            audit = AuditLog(
                plan_id=plan_id,
                component_id=comp.component_id,
                user_id="probabilistic_ai_engine",
                action="CREATED",
                old_value=None,
                new_value=f'{{"reorder_point": {rop}, "order_quantity": {order_q}, "pack_size": {comp.pack_size}}}',
                reason="Initial seed probabilistic policy calculation",
                version=1
            )
            db.add(audit)
            db.commit()

        print("Database seeding completed successfully! 50 components, 10 suppliers, 365-day demand history created.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
