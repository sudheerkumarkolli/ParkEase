# Implementation Plan - ParkEase (Smart Parking Availability & Location Full-Stack Platform)

ParkEase ("Find. Reserve. Park.") is an end-to-end full-stack smart parking booking and management system. It provides real-time parking discovery with interactive Leaflet/OpenStreetMap geo-queries, slot visualization and reservation with database concurrency locking, credit-based wallet transactions, QR code generation and live camera-based verification for parking entry/exit, full user/manager/admin dashboards, and containerized deployment with Docker and PostgreSQL.

---

## User Review Required

> [!IMPORTANT]
> - **Database Support**: PostgreSQL is configured as the primary production database with Docker Compose. For maximum flexibility during local testing, SQLite fallback support will also be provided in the SQLAlchemy engine configuration if PostgreSQL is not running locally outside Docker.
> - **Default Development Accounts**:
>   - Admin: `admin@parkease.local` / `Admin@12345`
>   - Manager 1: `manager@parkease.local` / `Manager@12345`
>   - Manager 2: `manager2@parkease.local` / `Manager@12345`
>   - User: `user@parkease.local` / `User@12345`
> - **Simulated Payment Gateway**: The credit purchase system features a payment modal designed with Razorpay-like payload abstractions, ready for plug-and-play webhook/gateway integration while supporting direct development simulation.

---

## Proposed Architecture & File Structure

```text
parkease/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py          # Login, Register, Refresh, Forgot/Reset Password
│   │   │   │   ├── users.py         # Profile, vehicle update, user info
│   │   │   │   ├── parking.py       # Search, Nearby (Haversine), Details, CRUD
│   │   │   │   ├── slots.py         # Slot layout, visual matrix, maintenance toggles
│   │   │   │   ├── bookings.py      # Concurrency-safe slot booking, cancellation, details
│   │   │   │   ├── wallet.py        # Balance, simulated packages, transaction history
│   │   │   │   ├── notifications.py # Real-time user alert list & read marks
│   │   │   │   ├── reviews.py       # Post-stay reviews, verified booking validation
│   │   │   │   ├── manager.py       # Manager metrics, revenue, scanner verify & entry/exit
│   │   │   │   ├── admin.py         # Global stats, user role/ban control, parking approvals
│   │   │   │   └── router.py        # Master API router
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings (.env handling)
│   │   │   ├── security.py          # JWT, Passlib/Bcrypt, Token validation
│   │   │   └── exceptions.py        # Centralized HTTP & Business rule handlers
│   │   ├── database/
│   │   │   ├── session.py           # SQLAlchemy Engine, SessionLocal, Base
│   │   │   └── init_db.py           # Auto-table creation
│   │   ├── models/
│   │   │   ├── user.py              # User, RefreshToken
│   │   │   ├── wallet.py            # Wallet, WalletTransaction, Payment
│   │   │   ├── parking.py           # ParkingLocation, ParkingSlot
│   │   │   ├── booking.py           # Booking, Review
│   │   │   └── notification.py      # Notification
│   │   ├── schemas/
│   │   │   ├── auth.py, user.py, parking.py, slot.py, booking.py, wallet.py, review.py, notification.py, manager.py, admin.py
│   │   ├── services/
│   │   │   ├── auth_service.py      # Auth & tokens logic
│   │   │   ├── geo_service.py       # Haversine distance and spatial filtering
│   │   │   ├── booking_service.py   # Row-locking atomic booking & slot state transitions
│   │   │   └── wallet_service.py    # Atomic balance changes & transaction tracking
│   │   └── main.py                  # FastAPI application setup, CORS, lifespan
│   ├── seed.py                      # Realistic Indian cities seed script (Hyderabad, Vijayawada, etc.)
│   ├── requirements.txt             # FastAPI, uvicorn, sqlalchemy, psycopg2-binary, passlib, etc.
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx & page.tsx (Landing page)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── reset-password/page.tsx
│   │   │   ├── (user)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── map/page.tsx
│   │   │   │   ├── parking/page.tsx
│   │   │   │   ├── parking/[id]/page.tsx
│   │   │   │   ├── booking/page.tsx
│   │   │   │   ├── bookings/page.tsx
│   │   │   │   ├── bookings/[id]/page.tsx
│   │   │   │   ├── wallet/page.tsx
│   │   │   │   ├── wallet/transactions/page.tsx
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── (manager)/
│   │   │   │   ├── manager/dashboard/page.tsx
│   │   │   │   ├── manager/parking/page.tsx
│   │   │   │   ├── manager/parking/add/page.tsx
│   │   │   │   ├── manager/slots/page.tsx
│   │   │   │   ├── manager/bookings/page.tsx
│   │   │   │   ├── manager/scanner/page.tsx
│   │   │   │   └── manager/revenue/page.tsx
│   │   │   └── (admin)/
│   │   │       ├── admin/dashboard/page.tsx
│   │   │       ├── admin/users/page.tsx
│   │   │       ├── admin/parking/page.tsx
│   │   │       ├── admin/bookings/page.tsx
│   │   │       ├── admin/transactions/page.tsx
│   │   │       └── admin/analytics/page.tsx
│   │   ├── components/
│   │   │   ├── ui/ (Navbar, Sidebar, Button, Modal, Card, Input, Badge, Toast, Table, Dropdown)
│   │   │   ├── map/ (LeafletMap with client-side dynamic import, custom markers, user geo-tracking)
│   │   │   ├── parking/ (ParkingCard, SlotMatrix, FilterBar, ReviewList)
│   │   │   ├── booking/ (BookingSummary, QRCodeDisplay, QRScannerModal)
│   │   │   └── wallet/ (CreditPackages, PaymentModal, BalanceCard)
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Auth state, login/logout, role guard, token refresh
│   │   │   └── NotificationContext.tsx # Live unread badge count
│   │   ├── lib/
│   │   │   ├── api.ts               # Axios instance with interceptors for JWT tokens
│   │   │   └── utils.ts             # Date formatters, currency, styling helpers
│   │   └── types/
│   │       └── index.ts             # TypeScript interfaces matching backend schemas
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Key Backend Implementation Details

1. **Database Models**:
   - `User`: id, full_name, email, phone, password_hash, role (`USER`, `PARKING_MANAGER`, `ADMIN`), vehicle_number, vehicle_type (`Car`, `Bike`, `SUV`, `EV`), is_active, timestamps.
   - `RefreshToken`: id, user_id, token, expires_at, revoked.
   - `Wallet`: id, user_id, balance.
   - `WalletTransaction`: id, wallet_id, type (`WELCOME_CREDIT`, `CREDIT_PURCHASE`, `BOOKING_PAYMENT`, `BOOKING_REFUND`, `ADMIN_ADJUSTMENT`), credits, description, reference_id, status.
   - `Payment`: id, user_id, amount, credits, package_name, payment_method, transaction_id, status.
   - `ParkingLocation`: id, manager_id, name, address, latitude, longitude, total_slots, available_slots, price_per_hour, opening_time, closing_time, status (`ACTIVE`, `PENDING`, `INACTIVE`), rating.
   - `ParkingSlot`: id, parking_id, slot_number, vehicle_type, status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`).
   - `Booking`: id, booking_number, user_id, parking_id, slot_id, vehicle_number, start_time, end_time, duration_hours, credits, status (`UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`), qr_token, entry_time, exit_time.
   - `Notification`: id, user_id, title, message, type, is_read.
   - `Review`: id, user_id, parking_id, booking_id, rating, comment.

2. **Atomic Booking Logic with Row-Level Locking**:
   - In `booking_service.py`, start a DB transaction.
   - Query `ParkingSlot` with `with_for_update()` to lock the row.
   - Check if slot is `AVAILABLE` and verify time overlap against active/upcoming bookings.
   - Check user's `Wallet` balance. If `< total_credits`, raise `400 Insufficient Credits`.
   - Deduct credits from `Wallet.balance`, create `WalletTransaction`, update slot status to `RESERVED`, decrement `ParkingLocation.available_slots`, generate secure UUID4 `qr_token`, create `Booking` and `Notification`.
   - Commit transaction.

3. **QR Entry / Exit Flow**:
   - Manager scans QR code or enters `qr_token`.
   - **Entry**: Validates booking is `UPCOMING`, updates booking to `ACTIVE`, slot to `OCCUPIED`, sets `entry_time`.
   - **Exit**: Validates booking is `ACTIVE`, updates booking to `COMPLETED`, slot to `AVAILABLE`, increments `ParkingLocation.available_slots`, sets `exit_time`, triggers notification for user to write a review.

4. **Haversine Distance**:
   - Calculates distance in KM from given `(user_lat, user_lng)` to each parking location, returning sorted results within the configurable radius (default 10 KM).

---

## Key Frontend Implementation Details

1. **Next.js 15 UI System**:
   - Rich dark & modern theme with vibrant emerald/teal and indigo accents, glassmorphism cards, responsive navigation with mobile drawer, notifications popover, wallet credit chip, and role-based redirect/navigation bars.
   - Client-side Leaflet integration via dynamic imports (SSR disabled) with custom pin badges (🟢 Green for >30% available, 🟡 Amber for <30%, 🔴 Red for 0), user location locator, and quick-action popups.
2. **QR Code Generation & Scanning**:
   - Generates high-res QR codes using `qrcode.react` or SVG canvas for every confirmed booking.
   - Camera QR scanner in `/manager/scanner` utilizing `@zxing/browser` or HTML5 canvas video stream with fallback manual token entry.
3. **Interactive Slot Grid**:
   - Visual slot map (A01-A05, B01-B05, etc.) with clickable badges, vehicle icons, color codes, and live slot selection during the 10-step booking flow.
4. **Credit Packages & Wallet**:
   - Starter (100 credits / ₹100), Standard (500 credits / ₹450), Premium (1000 credits / ₹850), Pro (2500 credits / ₹2000) with simulated checkout modal and real-time transaction ledger.

---

## Verification Plan

### Automated & Sanity Tests:
1. **Backend Verification**:
   - Verify Python syntax & imports across all modules.
   - Run seed script `python seed.py` to populate users, parking locations, slots, reviews, and bookings.
   - Test FastAPI OpenAPI documentation schema generation at `/docs`.
   - Test Auth (register welcome 100 credits, login JWT tokens), Nearby Search (Haversine), and Slot Booking endpoints.
2. **Frontend Verification**:
   - Run `npm run build` in `frontend/` to ensure 0 TypeScript or Next.js build errors.
   - Test frontend responsiveness, routing, and role guards.

### Manual Verification:
- Log in as User (`user@parkease.local`): Check wallet balance, find nearby parking, select slot, book with credits, view QR code.
- Log in as Manager (`manager@parkease.local`): Scan/verify QR code, approve entry, approve exit, manage slot maintenance.
- Log in as Admin (`admin@parkease.local`): View global KPIs, toggle user status, approve pending locations.
