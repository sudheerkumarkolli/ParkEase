from datetime import datetime, timezone
from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.models.wallet import Wallet, WalletTransaction, TransactionType, TransactionStatus
from app.core.security import get_password_hash
from app.database.mongodb import get_users_collection

def setup_exact_accounts():
    db = SessionLocal()
    mongo_users = get_users_collection()

    # 1. Clean up legacy admin and manager accounts
    db.query(User).filter(User.role == "ADMIN", User.email != "admin@gmail.com").delete()
    db.query(User).filter(User.role == "PARKING_MANAGER", ~User.email.in_(["manager1@gmail.com", "manager2@gmail.com"])).delete()
    db.commit()

    # 2. Setup Single Admin (admin@gmail.com / 12345678)
    admin = db.query(User).filter(User.email == "admin@gmail.com").first()
    if not admin:
        admin = User(
            full_name="Master Administrator",
            email="admin@gmail.com",
            phone="+91 98765 00001",
            password_hash=get_password_hash("12345678"),
            role=UserRole.ADMIN.value,
            vehicle_number="AP16AB1001",
            vehicle_type="SUV",
            is_active=True
        )
        db.add(admin)
        db.flush()
        w = Wallet(user_id=admin.id, balance=5000)
        db.add(w)
        db.flush()
        db.add(WalletTransaction(
            wallet_id=w.id,
            type=TransactionType.ADMIN_ADJUSTMENT.value,
            credits=5000,
            description="Admin initial balance",
            reference_id="ADMIN-INIT",
            status=TransactionStatus.COMPLETED.value
        ))
    else:
        admin.password_hash = get_password_hash("12345678")
        admin.role = UserRole.ADMIN.value
        admin.is_active = True
    db.commit()

    # 3. Setup Manager 1 (manager1@gmail.com / 12345678)
    mgr1 = db.query(User).filter(User.email == "manager1@gmail.com").first()
    if not mgr1:
        mgr1 = User(
            full_name="Hub Manager 1",
            email="manager1@gmail.com",
            phone="+91 98765 00002",
            password_hash=get_password_hash("12345678"),
            role=UserRole.PARKING_MANAGER.value,
            vehicle_number="AP16CD2002",
            vehicle_type="Car",
            is_active=True
        )
        db.add(mgr1)
        db.flush()
        w = Wallet(user_id=mgr1.id, balance=100)
        db.add(w)
    else:
        mgr1.password_hash = get_password_hash("12345678")
        mgr1.role = UserRole.PARKING_MANAGER.value
        mgr1.is_active = True
    db.commit()

    # 4. Setup Manager 2 (manager2@gmail.com / 12345678)
    mgr2 = db.query(User).filter(User.email == "manager2@gmail.com").first()
    if not mgr2:
        mgr2 = User(
            full_name="Hub Manager 2",
            email="manager2@gmail.com",
            phone="+91 98765 00003",
            password_hash=get_password_hash("12345678"),
            role=UserRole.PARKING_MANAGER.value,
            vehicle_number="AP16EF3003",
            vehicle_type="Car",
            is_active=True
        )
        db.add(mgr2)
        db.flush()
        w = Wallet(user_id=mgr2.id, balance=100)
        db.add(w)
    else:
        mgr2.password_hash = get_password_hash("12345678")
        mgr2.role = UserRole.PARKING_MANAGER.value
        mgr2.is_active = True
    db.commit()

    # 5. Sync to MongoDB
    if mongo_users is not None:
        try:
            mongo_users.delete_many({"role": "ADMIN", "email": {"$ne": "admin@gmail.com"}})
            mongo_users.delete_many({"role": "PARKING_MANAGER", "email": {"$nin": ["manager1@gmail.com", "manager2@gmail.com"]}})
            for u in [admin, mgr1, mgr2]:
                mongo_users.update_one(
                    {"email": u.email},
                    {"$set": {
                        "full_name": u.full_name,
                        "email": u.email,
                        "role": u.role,
                        "is_active": True,
                        "updated_at": datetime.now(timezone.utc)
                    }},
                    upsert=True
                )
        except Exception as me:
            print("MongoDB sync notice:", me)

    print("\n" + "="*60)
    print("=== FINAL ACTIVE USERS & ROLES IN DATABASE ===")
    print("="*60)
    for u in db.query(User).all():
        print(f"[{u.role:15}] ID: {u.id:<3} | Email: {u.email:<30} | Name: {u.full_name}")
    print("="*60 + "\n")

if __name__ == "__main__":
    setup_exact_accounts()
