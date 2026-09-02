import asyncio
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.session import SessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.parking import ParkingLocation, ParkingSlot
from app.models.user import User

async def test_cancellation_rules():
    print("\n--- TESTING 5-MINUTE CANCELLATION & NOTIFICATION RULES ---")
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        # 1. Login user
        u_login = await client.post("/api/v1/auth/login", json={"email": "user@gmail.com", "password": "12345678"})
        assert u_login.status_code == 200
        u_token = u_login.json()["access_token"]
        u_headers = {"Authorization": f"Bearer {u_token}"}

        # Check balance
        w_res = await client.get("/api/v1/wallet/me", headers=u_headers)
        bal_start = w_res.json()["balance"]
        print(f"Driver initial wallet balance: {bal_start} credits")

        # Top up if needed
        if bal_start < 100:
            await client.post("/api/v1/wallet/add-credits", json={"package_name": "Starter", "payment_method": "UPI"}, headers=u_headers)
            w_res = await client.get("/api/v1/wallet/me", headers=u_headers)
            bal_start = w_res.json()["balance"]

        # Find parking and slot
        p_res = await client.get("/api/v1/parking")
        parkings = p_res.json()
        assert len(parkings) > 0
        parking_id = parkings[0]["id"]
        slots_res = await client.get(f"/api/v1/parking/{parking_id}/slots")
        slots = [s for s in slots_res.json() if s["status"] == "AVAILABLE"]
        assert len(slots) > 0
        slot_id = slots[0]["id"]

        # ============================================================
        # CASE 1: CANCELLATION WITHIN 5 MINUTES -> FULL REFUND + MANAGER NOTIFIED
        # ============================================================
        print("\n[CASE 1] Booking and immediate cancellation (<= 5 mins)...")
        start_t = (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z"
        b1_res = await client.post("/api/v1/bookings", json={
            "parking_id": parking_id,
            "slot_id": slot_id,
            "vehicle_number": "AP16AB9999",
            "vehicle_type": "Car",
            "start_time": start_t,
            "duration_hours": 2
        }, headers=u_headers)
        assert b1_res.status_code in [200, 201], f"Booking 1 failed: {b1_res.text}"
        b1 = b1_res.json()
        print(f"Created Booking #{b1['booking_number']} for {b1['credits']} credits")

        # Cancel immediately
        c1_res = await client.post(f"/api/v1/bookings/{b1['id']}/cancel", headers=u_headers)
        assert c1_res.status_code == 200, f"Cancel 1 failed: {c1_res.text}"
        c1_data = c1_res.json()
        print(f"Cancel Response: {c1_data['message']}")
        assert c1_data["within_5_mins"] is True
        assert c1_data["refunded_credits"] == b1["credits"]

        # Verify wallet refunded
        w_after1 = await client.get("/api/v1/wallet/me", headers=u_headers)
        assert w_after1.json()["balance"] == bal_start
        print(f"[PASSED] Wallet fully refunded: {w_after1.json()['balance']} credits")

        # Verify Manager received cancellation refund notification
        m_login = await client.post("/api/v1/auth/login", json={"email": "manager1@gmail.com", "password": "12345678"})
        m_token = m_login.json()["access_token"]
        m_headers = {"Authorization": f"Bearer {m_token}"}
        m_notifs = await client.get("/api/v1/notifications", headers=m_headers)
        mgr_refund_notifs = [n for n in m_notifs.json() if "Slot Cancellation & Refund Processed" in n["title"]]
        assert len(mgr_refund_notifs) > 0
        print(f"[PASSED] Manager received refund notification: {mgr_refund_notifs[0]['message']}")

        # ============================================================
        # CASE 2: CANCELLATION AFTER 5 MINUTES -> NO REFUND + ADMIN NOTIFIED
        # ============================================================
        print("\n[CASE 2] Booking and cancellation after 5 minutes (> 5 mins)...")
        b2_res = await client.post("/api/v1/bookings", json={
            "parking_id": parking_id,
            "slot_id": slot_id,
            "vehicle_number": "AP16CD8888",
            "vehicle_type": "Car",
            "start_time": start_t,
            "duration_hours": 2
        }, headers=u_headers)
        assert b2_res.status_code in [200, 201]
        b2 = b2_res.json()
        print(f"Created Booking #{b2['booking_number']} for {b2['credits']} credits")

        # Artificially shift booking created_at to 10 minutes ago
        db = SessionLocal()
        db_b2 = db.query(Booking).filter(Booking.id == b2["id"]).first()
        db_b2.created_at = datetime.utcnow() - timedelta(minutes=10)
        db.commit()
        db.close()

        # Cancel now (10 minutes elapsed)
        c2_res = await client.post(f"/api/v1/bookings/{b2['id']}/cancel", headers=u_headers)
        assert c2_res.status_code == 200
        c2_data = c2_res.json()
        print(f"Cancel Response: {c2_data['message']}")
        assert c2_data["within_5_mins"] is False
        assert c2_data["refunded_credits"] == 0

        # Verify wallet NOT refunded
        w_after2 = await client.get("/api/v1/wallet/me", headers=u_headers)
        assert w_after2.json()["balance"] == bal_start - b2["credits"]
        print(f"[PASSED] Non-refundable: Balance remains {w_after2.json()['balance']} (No refund issued)")

        # Verify Admin received non-refundable cancellation alert
        a_login = await client.post("/api/v1/auth/login", json={"email": "admin@gmail.com", "password": "12345678"})
        a_token = a_login.json()["access_token"]
        a_headers = {"Authorization": f"Bearer {a_token}"}
        a_notifs = await client.get("/api/v1/notifications", headers=a_headers)
        admin_notifs = [n for n in a_notifs.json() if "Non-Refundable Cancellation Alert" in n["title"]]
        assert len(admin_notifs) > 0
        print(f"[PASSED] Admin received non-refundable cancellation alert: {admin_notifs[0]['message']}")

    print("\nALL CANCELLATION RULES (5-MIN GRACE, MANAGER REFUND MSG, ADMIN RETENTION MSG) PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_cancellation_rules())
