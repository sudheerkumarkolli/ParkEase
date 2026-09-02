import uuid
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine, Base
from app.database.init_db import init_db
from app.models.user import User, UserRole, VehicleType
from app.models.wallet import Wallet, WalletTransaction, Payment, TransactionType, TransactionStatus
from app.models.parking import ParkingLocation, ParkingSlot, ParkingStatus, SlotStatus
from app.models.booking import Booking, Review, BookingStatus
from app.models.notification import Notification
from app.core.security import get_password_hash
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

def get_locations_data(mgr1_id: int, mgr2_id: int):
    return [
        # Vijayawada (NTR)
        {
            "manager_id": mgr1_id,
            "name": "MG Road Central Smart Parking",
            "address": "MG Road, Opposite PVP Square Mall, Governorpet",
            "city": "Vijayawada",
            "latitude": 16.5062,
            "longitude": 80.6480,
            "price_per_hour": 25,
            "opening_time": "06:00",
            "closing_time": "23:30",
            "facilities": "CCTV,EV Charging,Covered Parking,Security Guard,Automated Boom Barrier",
            "description": "Multi-tier automated smart parking right on MG Road with ultra-fast access to shopping and commercial hubs.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Benz Circle Express Park",
            "address": "Near Benz Circle Flyover, Ring Road Junction",
            "city": "Vijayawada",
            "latitude": 16.4981,
            "longitude": 80.6558,
            "price_per_hour": 20,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "24/7 Access,CCTV,Valet Assistance,EV Rapid Charger",
            "description": "24/7 accessible smart lot situated at the premier commercial intersection of Benz Circle.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Vijayawada Junction Multi-Level Parking",
            "address": "Railway Station West Gate, Tarapet",
            "city": "Vijayawada",
            "latitude": 16.5181,
            "longitude": 80.6195,
            "price_per_hour": 15,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "Covered Multi-level,CCTV,Luggage Trolleys,Security Guard",
            "description": "Dedicated multi-level station parking facility offering effortless transit connection and long-stay security.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        # Guntur
        {
            "manager_id": mgr1_id,
            "name": "Lakshmipuram Commercial Hub Parking",
            "address": "Main Road, Lakshmipuram",
            "city": "Guntur",
            "latitude": 16.3067,
            "longitude": 80.4365,
            "price_per_hour": 20,
            "opening_time": "07:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Bays,EV Charging,Disabled Access",
            "description": "Spacious commercial parking in the bustling retail area of Lakshmipuram Guntur.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Brodipet City Center Parking",
            "address": "Brodipet Main Road, Near Market",
            "city": "Guntur",
            "latitude": 16.3005,
            "longitude": 80.4410,
            "price_per_hour": 15,
            "opening_time": "06:00",
            "closing_time": "22:00",
            "facilities": "CCTV,Covered Parking,Security Guard",
            "description": "Affordable city center parking in Brodipet retail zone.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        # Hyderabad
        {
            "manager_id": mgr2_id,
            "name": "HITEC City Cyber Towers Smart Bay",
            "address": "Cyber Towers Quad, HITEC City, Madhapur",
            "city": "Hyderabad",
            "latitude": 17.4504,
            "longitude": 78.3808,
            "price_per_hour": 35,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "Fast EV Superchargers,CCTV,Shuttle Cart,24/7 Security,Covered Multi-tier",
            "description": "High-tech smart parking for IT professionals and corporate visitors in the heart of Hyderabad Cyber City.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "Gachibowli Financial District Hub",
            "address": "ISB Road, Near WaveRock, Financial District",
            "city": "Hyderabad",
            "latitude": 17.4200,
            "longitude": 78.3378,
            "price_per_hour": 30,
            "opening_time": "06:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Parking,EV Charging,Security Guard",
            "description": "Premium paved parking slots designed for daily office commutes and enterprise visitors.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "Banjara Hills Road No 12 Plaza Parking",
            "address": "Road No. 12, Banjara Hills",
            "city": "Hyderabad",
            "latitude": 17.4140,
            "longitude": 78.4380,
            "price_per_hour": 30,
            "opening_time": "08:00",
            "closing_time": "23:00",
            "facilities": "Valet Service,CCTV,Covered Bays,Luxury Vehicle Support",
            "description": "High-end parking for restaurants, medical centres, and boutiques on Banjara Hills Road 12.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        # Tirupati
        {
            "manager_id": mgr2_id,
            "name": "Alipiri Transit & Pilgrim Parking",
            "address": "Alipiri Foothills, Bypass Road",
            "city": "Tirupati",
            "latitude": 13.6510,
            "longitude": 79.3995,
            "price_per_hour": 15,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "24/7 Security,CCTV,Restrooms,Battery Top-Up,Covered Sheds",
            "description": "Expansive safe pilgrim parking hub located at the Alipiri check-point with 24/7 security patrol.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "Tirumala Hills View Parking",
            "address": "Srinivasa Mangapuram Road, Near Temple Junction",
            "city": "Tirupati",
            "latitude": 13.6290,
            "longitude": 79.4100,
            "price_per_hour": 20,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "CCTV,Security Guard,Covered Bays,Rest Areas",
            "description": "Convenient and secure parking near the pilgrim hills corridor.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        # Visakhapatnam
        {
            "manager_id": mgr2_id,
            "name": "Beach Road Coastal Parking",
            "address": "RK Beach Promenade, Pandurangapuram",
            "city": "Visakhapatnam",
            "latitude": 17.7126,
            "longitude": 83.3181,
            "price_per_hour": 20,
            "opening_time": "05:00",
            "closing_time": "23:30",
            "facilities": "CCTV,Lighting,Sea View,Bike Dedicated Bays,EV Points",
            "description": "Scenic beachside parking lot with automated entry and dedicated motorcycle & EV bays.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "MVP Colony Hub",
            "address": "MVP Double Road, Sector 3",
            "city": "Visakhapatnam",
            "latitude": 17.7424,
            "longitude": 83.3323,
            "price_per_hour": 25,
            "opening_time": "06:00",
            "closing_time": "23:00",
            "facilities": "CCTV,EV Charging,Covered Multi-tier,Security Guard",
            "description": "Modern smart facility serving MVP Colony's vibrant dining and commercial district.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        # Kurnool
        {
            "manager_id": mgr1_id,
            "name": "Raj Vihar Center Smart Parking",
            "address": "Raj Vihar Circle, Main Commercial Road",
            "city": "Kurnool",
            "latitude": 15.8281,
            "longitude": 78.0373,
            "price_per_hour": 15,
            "opening_time": "06:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Parking,Security Guard,Automated Entry",
            "description": "Centrally located parking at the premier commercial intersection in Kurnool.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Kurnool Junction Railway Parking",
            "address": "Station Road, Old Town",
            "city": "Kurnool",
            "latitude": 15.8340,
            "longitude": 78.0460,
            "price_per_hour": 15,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "24/7 Access,CCTV,Luggage Assistance,EV Points",
            "description": "24/7 accessible station parking with round-the-clock security.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        # Nellore
        {
            "manager_id": mgr1_id,
            "name": "Trunk Road Plaza Parking",
            "address": "Trunk Road, Gandhi Nagar",
            "city": "Nellore",
            "latitude": 14.4426,
            "longitude": 79.9865,
            "price_per_hour": 20,
            "opening_time": "06:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Parking,EV Charging",
            "description": "Modern plaza parking on Trunk Road with easy access to banks and shopping centers.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Magunta Layout Express Park",
            "address": "Magunta Layout Main Road",
            "city": "Nellore",
            "latitude": 14.4320,
            "longitude": 79.9750,
            "price_per_hour": 15,
            "opening_time": "07:00",
            "closing_time": "22:30",
            "facilities": "CCTV,Security Guard,Spacious Bays",
            "description": "Convenient neighborhood smart parking in upscale Magunta Layout.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        # Rajahmundry (East Godavari)
        {
            "manager_id": mgr1_id,
            "name": "Godavari Pushkar Ghat Parking",
            "address": "Pushkar Ghat Road, Kotilingala",
            "city": "Rajahmundry",
            "latitude": 17.0005,
            "longitude": 81.7774,
            "price_per_hour": 15,
            "opening_time": "05:00",
            "closing_time": "23:30",
            "facilities": "CCTV,Riverside View,EV Charging,Security Guard",
            "description": "Scenic parking near the sacred Godavari River ghats and temples.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Danavaipeta Commercial Smart Bay",
            "address": "Danavaipeta Main Road, Near Municipal Complex",
            "city": "Rajahmundry",
            "latitude": 17.0050,
            "longitude": 81.7850,
            "price_per_hour": 20,
            "opening_time": "07:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Bays,Automated Barrier",
            "description": "Primary commercial smart parking in the Danavaipeta business zone.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        # Kakinada
        {
            "manager_id": mgr1_id,
            "name": "Cinema Road Smart Hub",
            "address": "Cinema Road, Near Jagadamba Junction",
            "city": "Kakinada",
            "latitude": 16.9891,
            "longitude": 82.2475,
            "price_per_hour": 20,
            "opening_time": "08:00",
            "closing_time": "23:59",
            "facilities": "CCTV,EV Fast Charger,Valet Service",
            "description": "High-traffic parking near Kakinada entertainment and shopping centers.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr1_id,
            "name": "Jagannaickpur Transit Lot",
            "address": "Port Road, Jagannaickpur",
            "city": "Kakinada",
            "latitude": 16.9450,
            "longitude": 82.2350,
            "price_per_hour": 15,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "24/7 Security,CCTV,Heavy Vehicle Support",
            "description": "Spacious and secured lot close to Kakinada port and commercial corridors.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        # Kadapa (YSR District)
        {
            "manager_id": mgr2_id,
            "name": "Seven Roads Junction Smart Park",
            "address": "Seven Roads Circle, Nagarajupeta",
            "city": "Kadapa",
            "latitude": 14.4673,
            "longitude": 78.8242,
            "price_per_hour": 15,
            "opening_time": "06:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Bays,Security Guard",
            "description": "Centrally located smart facility at the prominent Seven Roads intersection.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "Kadapa Central Bus Stand Lot",
            "address": "RTC Bus Stand Road, Rims Colony",
            "city": "Kadapa",
            "latitude": 14.4750,
            "longitude": 78.8320,
            "price_per_hour": 15,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "24/7 Security,CCTV,EV Charging",
            "description": "Round-the-clock transit parking located directly opposite the Central Bus Stand.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        # Anantapur
        {
            "manager_id": mgr2_id,
            "name": "Clock Tower Square Smart Parking",
            "address": "Clock Tower Center, Main Bazaar",
            "city": "Anantapur",
            "latitude": 14.6819,
            "longitude": 77.6006,
            "price_per_hour": 15,
            "opening_time": "06:00",
            "closing_time": "22:30",
            "facilities": "CCTV,Automated Entry,Security Guard",
            "description": "Premier parking at the historical Clock Tower marketplace.",
            "image_url": "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "Subhash Road Bay Parking",
            "address": "Subhash Road, Near Govt Hospital",
            "city": "Anantapur",
            "latitude": 14.6750,
            "longitude": 77.5950,
            "price_per_hour": 15,
            "opening_time": "07:00",
            "closing_time": "23:00",
            "facilities": "CCTV,Covered Bays,EV Points",
            "description": "Spacious parking bays on Subhash Road supporting hospital and market visitors.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        },
        # Warangal
        {
            "manager_id": mgr2_id,
            "name": "Hanamkonda City Center Parking",
            "address": "Nakkalagutta Main Road, Hanamkonda",
            "city": "Warangal",
            "latitude": 17.9995,
            "longitude": 79.5550,
            "price_per_hour": 20,
            "opening_time": "06:00",
            "closing_time": "23:00",
            "facilities": "CCTV,EV Fast Charger,Covered Bays",
            "description": "Smart facility in the prime shopping and commercial hub of Hanamkonda.",
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        },
        {
            "manager_id": mgr2_id,
            "name": "Kazipet Junction Railway Parking",
            "address": "Kazipet Railway Station Complex",
            "city": "Warangal",
            "latitude": 17.9750,
            "longitude": 79.5150,
            "price_per_hour": 15,
            "opening_time": "00:00",
            "closing_time": "23:59",
            "facilities": "24/7 Security,CCTV,Luggage Assistance",
            "description": "24/7 accessible transit parking serving Kazipet Junction passengers.",
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        }
    ]

def seed_database():
    logger.info("Initializing database tables for seed...")
    init_db()
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_admin = db.query(User).filter(User.email == settings.SEED_ADMIN_EMAIL).first()
        if existing_admin:
            logger.info("Database already seeded with default admin. Syncing any missing parking locations...")
            mgr1_user = db.query(User).filter(User.role == UserRole.PARKING_MANAGER.value).first() or existing_admin
            mgr2_user = db.query(User).filter(User.email == "manager2@parkease.com").first() or mgr1_user
            locations_data = get_locations_data(mgr1_user.id, mgr2_user.id)
            for loc in locations_data:
                existing_loc = db.query(ParkingLocation).filter(ParkingLocation.name == loc["name"]).first()
                if not existing_loc:
                    total_slots = 24
                    p = ParkingLocation(
                        manager_id=loc["manager_id"],
                        name=loc["name"],
                        address=loc["address"],
                        city=loc["city"],
                        latitude=loc["latitude"],
                        longitude=loc["longitude"],
                        total_slots=total_slots,
                        available_slots=total_slots,
                        price_per_hour=loc["price_per_hour"],
                        opening_time=loc["opening_time"],
                        closing_time=loc["closing_time"],
                        supported_vehicle_types="Car,Bike,SUV,EV",
                        facilities=loc["facilities"],
                        description=loc["description"],
                        image_url=loc["image_url"],
                        status=ParkingStatus.ACTIVE.value,
                        rating=4.7,
                        review_count=3
                    )
                    db.add(p)
                    db.flush()
                    slots = []
                    for i in range(1, 13):
                        v_type = "Bike" if i in [1, 2, 3] else ("EV" if i == 4 else "Car")
                        slots.append(ParkingSlot(
                            parking_id=p.id,
                            slot_number=f"A{i:02d}",
                            vehicle_type=v_type,
                            status=SlotStatus.AVAILABLE.value
                        ))
                    for i in range(1, 13):
                        v_type = "SUV" if i in [1, 2, 3] else "Car"
                        slots.append(ParkingSlot(
                            parking_id=p.id,
                            slot_number=f"B{i:02d}",
                            vehicle_type=v_type,
                            status=SlotStatus.AVAILABLE.value
                        ))
                    db.add_all(slots)
                    db.flush()
                    logger.info(f"Added missing parking location: {loc['name']} ({loc['city']})")
            db.commit()
            logger.info("Sync complete. All district locations verified.")
            return

        logger.info("Seeding users, wallets, parking locations, slots, bookings, reviews...")

        # 1. Admin
        admin_user = User(
            full_name="System Administrator",
            email=settings.SEED_ADMIN_EMAIL,
            phone="+91 98765 43210",
            password_hash=get_password_hash(settings.SEED_ADMIN_PASSWORD),
            role=UserRole.ADMIN.value,
            vehicle_number="AP16AB1001",
            vehicle_type="SUV",
            is_active=True
        )
        db.add(admin_user)
        db.flush()

        admin_wallet = Wallet(user_id=admin_user.id, balance=5000)
        db.add(admin_wallet)
        db.flush()
        db.add(WalletTransaction(
            wallet_id=admin_wallet.id,
            type=TransactionType.ADMIN_ADJUSTMENT.value,
            credits=5000,
            description="Admin initial balance grant",
            reference_id="ADMIN-INIT",
            status=TransactionStatus.COMPLETED.value
        ))

        # 2. Managers
        mgr1 = User(
            full_name="Kiran Kumar (Vijayawada Hub Manager)",
            email=settings.SEED_MANAGER_EMAIL,
            phone="+91 94401 23456",
            password_hash=get_password_hash(settings.SEED_MANAGER_PASSWORD),
            role=UserRole.PARKING_MANAGER.value,
            vehicle_number="AP16CD2002",
            vehicle_type="Car",
            is_active=True
        )
        mgr2 = User(
            full_name="Rajesh Varma (Hyderabad & Vizag Manager)",
            email="manager2@parkease.com",
            phone="+91 98480 11223",
            password_hash=get_password_hash("Manager@12345"),
            role=UserRole.PARKING_MANAGER.value,
            vehicle_number="TS09EF3003",
            vehicle_type="Car",
            is_active=True
        )
        db.add_all([mgr1, mgr2])
        db.flush()

        for mgr in [mgr1, mgr2]:
            w = Wallet(user_id=mgr.id, balance=100)
            db.add(w)
            db.flush()
            db.add(WalletTransaction(
                wallet_id=w.id,
                type=TransactionType.WELCOME_CREDIT.value,
                credits=100,
                description="Welcome to ParkEase!",
                reference_id=f"WELCOME-{mgr.id}",
                status=TransactionStatus.COMPLETED.value
            ))

        # 3. Regular Users
        users_data = [
            ("Suresh Kumar (Default User)", settings.SEED_USER_EMAIL, settings.SEED_USER_PASSWORD, "AP16BQ7788", "Car", 450),
            ("Rahul Sharma", "rahul.sharma@example.com", "User@12345", "TS07JK4567", "SUV", 250),
            ("Priya Patel", "priya.patel@example.com", "User@12345", "AP39DF1234", "EV", 600),
            ("Anand Reddy", "anand.reddy@example.com", "User@12345", "AP16ZZ9900", "Bike", 150),
            ("Sneha Rao", "sneha.rao@example.com", "User@12345", "TS08EE8899", "Car", 320)
        ]

        created_users = []
        for name, email, pwd, v_num, v_type, balance in users_data:
            u = User(
                full_name=name,
                email=email,
                phone="+91 99887 76655",
                password_hash=get_password_hash(pwd),
                role=UserRole.USER.value,
                vehicle_number=v_num,
                vehicle_type=v_type,
                is_active=True
            )
            db.add(u)
            db.flush()
            created_users.append(u)

            w = Wallet(user_id=u.id, balance=balance)
            db.add(w)
            db.flush()

            # Welcome credit transaction
            db.add(WalletTransaction(
                wallet_id=w.id,
                type=TransactionType.WELCOME_CREDIT.value,
                credits=100,
                description="Welcome to ParkEase bonus",
                reference_id=f"WELCOME-{u.id}",
                status=TransactionStatus.COMPLETED.value
            ))

            if balance > 100:
                # Top-up purchase
                db.add(WalletTransaction(
                    wallet_id=w.id,
                    type=TransactionType.CREDIT_PURCHASE.value,
                    credits=balance - 100,
                    description=f"Purchased credit top-up",
                    reference_id=f"PAY-{uuid.uuid4().hex[:8].upper()}",
                    status=TransactionStatus.COMPLETED.value
                ))

        # 4. Realistic Parking Locations across all districts (minimum 2 places per district)
        locations_data = get_locations_data(mgr1.id, mgr2.id)

        created_parkings = []
        for loc in locations_data:
            total_slots = 24
            p = ParkingLocation(
                manager_id=loc["manager_id"],
                name=loc["name"],
                address=loc["address"],
                city=loc["city"],
                latitude=loc["latitude"],
                longitude=loc["longitude"],
                total_slots=total_slots,
                available_slots=total_slots,
                price_per_hour=loc["price_per_hour"],
                opening_time=loc["opening_time"],
                closing_time=loc["closing_time"],
                supported_vehicle_types="Car,Bike,SUV,EV",
                facilities=loc["facilities"],
                description=loc["description"],
                image_url=loc["image_url"],
                status=ParkingStatus.ACTIVE.value,
                rating=4.7,
                review_count=3
            )
            db.add(p)
            db.flush()
            created_parkings.append(p)

            # Generate 24 slots: A01..A12, B01..B12
            slots = []
            for i in range(1, 13):
                v_type = "Bike" if i in [1, 2, 3] else ("EV" if i == 4 else "Car")
                slots.append(ParkingSlot(
                    parking_id=p.id,
                    slot_number=f"A{i:02d}",
                    vehicle_type=v_type,
                    status=SlotStatus.AVAILABLE.value
                ))
            for i in range(1, 13):
                v_type = "SUV" if i in [1, 2, 3] else "Car"
                slots.append(ParkingSlot(
                    parking_id=p.id,
                    slot_number=f"B{i:02d}",
                    vehicle_type=v_type,
                    status=SlotStatus.AVAILABLE.value
                ))
            db.add_all(slots)
            db.flush()

        # 5. Create Sample Bookings & Reviews
        default_user = created_users[0]
        p1 = created_parkings[0]
        p1_slots = db.query(ParkingSlot).filter(ParkingSlot.parking_id == p1.id).all()

        # Completed Booking 1 (with review)
        completed_bk = Booking(
            booking_number=f"PE-{datetime.utcnow().strftime('%Y%m%d')}-A101",
            user_id=default_user.id,
            parking_id=p1.id,
            slot_id=p1_slots[0].id,
            vehicle_number=default_user.vehicle_number or "AP16BQ7788",
            vehicle_type="Car",
            start_time=datetime.utcnow() - timedelta(days=2, hours=3),
            end_time=datetime.utcnow() - timedelta(days=2, hours=1),
            duration_hours=2.0,
            credits=50,
            status=BookingStatus.COMPLETED.value,
            qr_token=f"QR-{uuid.uuid4().hex}",
            entry_time=datetime.utcnow() - timedelta(days=2, hours=3),
            exit_time=datetime.utcnow() - timedelta(days=2, hours=1)
        )
        db.add(completed_bk)
        db.flush()

        # Review for completed booking
        db.add(Review(
            user_id=default_user.id,
            parking_id=p1.id,
            booking_id=completed_bk.id,
            rating=5,
            comment="Seamless entry using the QR scanner. Very clean multi-level lot with good security!"
        ))

        # Active Booking 2
        p1_slots[1].status = SlotStatus.OCCUPIED.value
        p1.available_slots -= 1
        active_bk = Booking(
            booking_number=f"PE-{datetime.utcnow().strftime('%Y%m%d')}-B202",
            user_id=default_user.id,
            parking_id=p1.id,
            slot_id=p1_slots[1].id,
            vehicle_number=default_user.vehicle_number or "AP16BQ7788",
            vehicle_type="Car",
            start_time=datetime.utcnow() - timedelta(hours=1),
            end_time=datetime.utcnow() + timedelta(hours=2),
            duration_hours=3.0,
            credits=75,
            status=BookingStatus.ACTIVE.value,
            qr_token=f"QR-{uuid.uuid4().hex}",
            entry_time=datetime.utcnow() - timedelta(hours=1)
        )
        db.add(active_bk)

        # Upcoming Booking 3
        p1_slots[2].status = SlotStatus.RESERVED.value
        p1.available_slots -= 1
        upcoming_bk = Booking(
            booking_number=f"PE-{datetime.utcnow().strftime('%Y%m%d')}-C303",
            user_id=default_user.id,
            parking_id=p1.id,
            slot_id=p1_slots[2].id,
            vehicle_number=default_user.vehicle_number or "AP16BQ7788",
            vehicle_type="Car",
            start_time=datetime.utcnow() + timedelta(hours=3),
            end_time=datetime.utcnow() + timedelta(hours=6),
            duration_hours=3.0,
            credits=75,
            status=BookingStatus.UPCOMING.value,
            qr_token=f"QR-{uuid.uuid4().hex}"
        )
        db.add(upcoming_bk)

        # Sample Reviews across locations
        for i, user in enumerate(created_users[1:4]):
            p = created_parkings[i + 1]
            bk = Booking(
                booking_number=f"PE-{datetime.utcnow().strftime('%Y%m%d')}-SMP{i}",
                user_id=user.id,
                parking_id=p.id,
                slot_id=db.query(ParkingSlot).filter(ParkingSlot.parking_id == p.id).first().id,
                vehicle_number=user.vehicle_number or "TS07JK1234",
                vehicle_type=user.vehicle_type or "Car",
                start_time=datetime.utcnow() - timedelta(days=1, hours=4),
                end_time=datetime.utcnow() - timedelta(days=1, hours=2),
                duration_hours=2.0,
                credits=40,
                status=BookingStatus.COMPLETED.value,
                qr_token=f"QR-{uuid.uuid4().hex}",
                entry_time=datetime.utcnow() - timedelta(days=1, hours=4),
                exit_time=datetime.utcnow() - timedelta(days=1, hours=2)
            )
            db.add(bk)
            db.flush()

            db.add(Review(
                user_id=user.id,
                parking_id=p.id,
                booking_id=bk.id,
                rating=5 if i % 2 == 0 else 4,
                comment="Great location, easily found parking during peak rush hours using the ParkEase app!"
            ))

        db.commit()
        logger.info("Database seeding completed successfully!")
        logger.info("Accounts created:")
        logger.info(f"  Admin: {settings.SEED_ADMIN_EMAIL} / {settings.SEED_ADMIN_PASSWORD}")
        logger.info(f"  Manager: {settings.SEED_MANAGER_EMAIL} / {settings.SEED_MANAGER_PASSWORD}")
        logger.info(f"  User: {settings.SEED_USER_EMAIL} / {settings.SEED_USER_PASSWORD}")

    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
