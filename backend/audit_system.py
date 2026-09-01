import sys
import os
import json
from datetime import datetime, timedelta

def run_comprehensive_audit():
    print("="*70)
    print("  PARKEASE COMPREHENSIVE END-TO-END SYSTEM AUDIT & TEST SUITE")
    print("="*70)

    from fastapi.testclient import TestClient
    from app.main import app
    from app.database.session import SessionLocal
    from app.models.user import User, EmailOTP
    from app.models.parking import ParkingLocation, ParkingSlot
    from app.models.booking import Booking
    from app.models.wallet import Wallet

    client = TestClient(app)
    db = SessionLocal()

    results = []

    def record(name, success, detail):
        status = "PASSED" if success else "FAILED"
        print(f"[{status:6}] {name} -> {detail}")
        results.append({"name": name, "success": success, "detail": detail})

    # -------------------------------------------------------------
    # 1. AUTHENTICATION & REGISTRATION FLOWS
    # -------------------------------------------------------------
    print("\n--- [1] TESTING AUTHENTICATION & USER REGISTRATION ---")
    
    # 1.1 Send OTP
    test_email = f"audit.user.{int(datetime.now().timestamp())}@gmail.com"
    res_otp = client.post("/api/v1/auth/send-otp", json={"email": test_email})
    if res_otp.status_code == 200:
        record("Send OTP API", True, f"Status 200 for {test_email}")
    else:
        record("Send OTP API", False, f"Status {res_otp.status_code}: {res_otp.text}")

    # Fetch generated OTP from DB
    otp_record = db.query(EmailOTP).filter(EmailOTP.email == test_email, EmailOTP.is_used == False).order_by(EmailOTP.created_at.desc()).first()
    otp_code = otp_record.otp_code if otp_record else "000000"

    # 1.2 Register User with OTP
    reg_payload = {
        "full_name": "Audit Test Driver",
        "email": test_email,
        "phone": "+91 91234 56789",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "vehicle_number": "AP16TEST99",
        "vehicle_type": "Car",
        "otp": otp_code
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    user_token = None
    if res_reg.status_code == 200:
        user_token = res_reg.json().get("access_token")
        record("User Registration with OTP", True, f"Created user {test_email} with JWT token")
    else:
        record("User Registration with OTP", False, f"Status {res_reg.status_code}: {res_reg.text}")

    # 1.3 Verify Welcome Credits
    new_user = db.query(User).filter(User.email == test_email).first()
    if new_user:
        wallet = db.query(Wallet).filter(Wallet.user_id == new_user.id).first()
        if wallet and wallet.balance >= 100:
            record("Welcome Credits Allocation", True, f"Wallet initialized with {wallet.balance} credits")
        else:
            record("Welcome Credits Allocation", False, f"Wallet balance is {getattr(wallet, 'balance', None)}")
    else:
        record("Welcome Credits Allocation", False, "User not found in DB")

    # 1.4 Admin Sign-In (admin@gmail.com / 12345678)
    res_admin_login = client.post("/api/v1/auth/login", json={"email": "admin@gmail.com", "password": "12345678"})
    admin_token = None
    if res_admin_login.status_code == 200:
        admin_token = res_admin_login.json().get("access_token")
        record("Admin Direct Sign-In", True, "Signed in as admin@gmail.com")
    else:
        record("Admin Direct Sign-In", False, f"Status {res_admin_login.status_code}: {res_admin_login.text}")

    # 1.5 Manager 1 Sign-In (manager1@gmail.com / 12345678)
    res_mgr_login = client.post("/api/v1/auth/login", json={"email": "manager1@gmail.com", "password": "12345678"})
    manager_token = None
    if res_mgr_login.status_code == 200:
        manager_token = res_mgr_login.json().get("access_token")
        record("Manager Direct Sign-In", True, "Signed in as manager1@gmail.com")
    else:
        record("Manager Direct Sign-In", False, f"Status {res_mgr_login.status_code}: {res_mgr_login.text}")

    # 1.6 User Profile /me
    if user_token:
        res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        if res_me.status_code == 200 and res_me.json().get("email") == test_email:
            record("Get Current User Profile (/me)", True, f"Retrieved profile for {test_email}")
        else:
            record("Get Current User Profile (/me)", False, f"Status {res_me.status_code}: {res_me.text}")

    # -------------------------------------------------------------
    # 2. PARKING DISCOVERY & BOOKING FLOWS
    # -------------------------------------------------------------
    print("\n--- [2] TESTING PARKING DISCOVERY & BOOKING SYSTEM ---")

    # 2.1 List Parking Locations
    res_parkings = client.get("/api/v1/parking/")
    parkings_list = []
    if res_parkings.status_code == 200:
        parkings_list = res_parkings.json()
        record("Parking Discovery API", True, f"Found {len(parkings_list)} parking locations")
    else:
        record("Parking Discovery API", False, f"Status {res_parkings.status_code}: {res_parkings.text}")

    # 2.2 Get Parking Detail & Available Slots
    target_parking_id = parkings_list[0]["id"] if parkings_list else None
    if target_parking_id:
        res_pdetail = client.get(f"/api/v1/parking/{target_parking_id}")
        if res_pdetail.status_code == 200:
            record("Parking Details & Slot Layout", True, f"Loaded info for parking ID {target_parking_id}")
        else:
            record("Parking Details & Slot Layout", False, f"Status {res_pdetail.status_code}: {res_pdetail.text}")

    # 2.3 Create Slot Booking
    created_booking_id = None
    created_qr_token = None
    if user_token and target_parking_id:
        start_time = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        booking_payload = {
            "parking_id": target_parking_id,
            "vehicle_number": "AP16TEST99",
            "vehicle_type": "Car",
            "start_time": start_time,
            "duration_hours": 2,
            "notes": "Automated audit booking"
        }
        res_book = client.post("/api/v1/bookings", json=booking_payload, headers={"Authorization": f"Bearer {user_token}"})
        if res_book.status_code == 200:
            b_data = res_book.json()
            created_booking_id = b_data.get("id")
            created_qr_token = b_data.get("qr_token")
            record("Driver Slot Booking & Credit Deduction", True, f"Booking #{b_data.get('booking_number')} created, QR: {created_qr_token}")
        else:
            record("Driver Slot Booking & Credit Deduction", False, f"Status {res_book.status_code}: {res_book.text}")


    # 2.4 Get Driver Bookings List
    if user_token:
        res_my_b = client.get("/api/v1/bookings/my-bookings", headers={"Authorization": f"Bearer {user_token}"})
        if res_my_b.status_code == 200 and len(res_my_b.json()) > 0:
            record("Driver Bookings Ledger", True, f"Retrieved {len(res_my_b.json())} active passes")
        else:
            record("Driver Bookings Ledger", False, f"Status {res_my_b.status_code}: {res_my_b.text}")

    # -------------------------------------------------------------
    # 3. WALLET & RECHARGE FLOWS
    # -------------------------------------------------------------
    print("\n--- [3] TESTING WALLET & TRANSACTIONS ---")
    if user_token:
        res_wallet = client.get("/api/v1/wallets/me", headers={"Authorization": f"Bearer {user_token}"})
        if res_wallet.status_code == 200:
            record("Driver Wallet Balance", True, f"Balance: {res_wallet.json().get('balance')} Credits")
        else:
            record("Driver Wallet Balance", False, f"Status {res_wallet.status_code}: {res_wallet.text}")

        res_topup = client.post("/api/v1/wallets/top-up", json={"amount": 200, "payment_method": "UPI"}, headers={"Authorization": f"Bearer {user_token}"})
        if res_topup.status_code == 200:
            record("Wallet Credit Recharge", True, f"Top-up of 200 credits successful. New balance: {res_topup.json().get('new_balance')}")
        else:
            record("Wallet Credit Recharge", False, f"Status {res_topup.status_code}: {res_topup.text}")

    # -------------------------------------------------------------
    # 4. FACILITY MANAGER OPERATIONS & GATE SCANNER
    # -------------------------------------------------------------
    print("\n--- [4] TESTING FACILITY MANAGER OPERATIONS & QR GATE SCANNER ---")
    if manager_token:
        res_m_dash = client.get("/api/v1/manager/dashboard", headers={"Authorization": f"Bearer {manager_token}"})
        if res_m_dash.status_code == 200:
            record("Manager Dashboard Metrics", True, f"Loaded manager operational stats")
        else:
            record("Manager Dashboard Metrics", False, f"Status {res_m_dash.status_code}: {res_m_dash.text}")

        # Test QR Gate Scan Entry
        if created_qr_token:
            res_entry = client.post("/api/v1/manager/scan-entry", json={"qr_token": created_qr_token}, headers={"Authorization": f"Bearer {manager_token}"})
            if res_entry.status_code == 200 and res_entry.json().get("success"):
                record("Gate QR Entry Scan & Slot Check-In", True, f"Check-in approved for pass #{res_entry.json().get('booking', {}).get('booking_number')}")
            else:
                record("Gate QR Entry Scan & Slot Check-In", False, f"Status {res_entry.status_code}: {res_entry.text}")

            # Test QR Gate Scan Exit
            res_exit = client.post("/api/v1/manager/scan-exit", json={"qr_token": created_qr_token}, headers={"Authorization": f"Bearer {manager_token}"})
            if res_exit.status_code == 200 and res_exit.json().get("success"):
                record("Gate QR Exit Scan & Slot Check-Out", True, f"Check-out approved & slot released")
            else:
                record("Gate QR Exit Scan & Slot Check-Out", False, f"Status {res_exit.status_code}: {res_exit.text}")

    # -------------------------------------------------------------
    # 5. ADMIN CONSOLE & USER ROLE CONTROLS
    # -------------------------------------------------------------
    print("\n--- [5] TESTING ADMIN CONSOLE & CONTROLS ---")
    if admin_token:
        res_a_dash = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
        if res_a_dash.status_code == 200:
            record("Admin Master Dashboard Stats", True, "Global stats retrieved")
        else:
            record("Admin Master Dashboard Stats", False, f"Status {res_a_dash.status_code}: {res_a_dash.text}")

        res_a_users = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
        if res_a_users.status_code == 200 and len(res_a_users.json()) > 0:
            record("Admin User Management Ledger", True, f"Listed {len(res_a_users.json())} system users")
        else:
            record("Admin User Management Ledger", False, f"Status {res_a_users.status_code}: {res_a_users.text}")

        res_a_tx = client.get("/api/v1/admin/transactions", headers={"Authorization": f"Bearer {admin_token}"})
        if res_a_tx.status_code == 200:
            record("Admin Financial Ledger", True, f"Listed {len(res_a_tx.json())} system transactions")
        else:
            record("Admin Financial Ledger", False, f"Status {res_a_tx.status_code}: {res_a_tx.text}")

        res_a_analytics = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
        if res_a_analytics.status_code == 200:
            record("Admin Advanced Analytics", True, "Analytics report generated")
        else:
            record("Admin Advanced Analytics", False, f"Status {res_a_analytics.status_code}: {res_a_analytics.text}")

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n" + "="*70)
    passed_count = sum(1 for r in results if r["success"])
    total_count = len(results)
    print(f"  AUDIT SUMMARY: {passed_count}/{total_count} WORKFLOWS PASSED ({(passed_count/total_count)*100:.1f}%)")
    print("="*70)

    if passed_count < total_count:
        print("\nFailed Workflows:")
        for r in results:
            if not r["success"]:
                print(f"  - {r['name']}: {r['detail']}")
        sys.exit(1)
    else:
        print("\nALL SYSTEM FLOWS ARE HEALTHY AND FULLY OPERATIONAL!")
        sys.exit(0)

if __name__ == "__main__":
    run_comprehensive_audit()
