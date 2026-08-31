# ParkEase — Smart Parking Availability & Location Platform

> **"Find. Reserve. Park."**

ParkEase is a complete, production-ready full-stack Smart Parking Availability & Location Web Application. It enables drivers to discover parking spots in real-time, view visual slot maps (Car, Bike, SUV, EV), lock reservations with PostgreSQL concurrency row-locking, pay with credit packages in an atomic wallet, and enter/exit through secure QR-code scanning verified by facility managers.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS & Modern Glassmorphism Theme
- **Maps**: OpenStreetMap + Leaflet (GPS proximity & Haversine formula)
- **Icons**: Lucide React
- **QR Engine**: `qrcode.react` (Generator) & `html5-qrcode` (Live Camera Scanner)
- **Charts**: Recharts (Occupancy, Revenue, Growth telemetry)
- **HTTP Client**: Axios with JWT refresh token interceptors

### Backend
- **Framework**: Python 3.11+ / FastAPI
- **Database ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Database**: PostgreSQL (with automatic SQLite fallback for lightweight local dev)
- **Authentication**: JWT access & refresh tokens with Bcrypt password hashing
- **Concurrency**: Row-level locking (`with_for_update`) to eliminate race conditions and double bookings

### Infrastructure
- **Docker** & **Docker Compose**
- **PostgreSQL 15 Container** with healthchecks

---

## Default Development Accounts (Pre-Seeded)

The database seed script automatically populates the following accounts:

| Role | Email | Password | Initial Balance |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@parkease.local` | `Admin@12345` | 5,000 Credits |
| **Facility Manager 1** | `manager@parkease.local` | `Manager@12345` | 100 Credits |
| **Facility Manager 2** | `manager2@parkease.local` | `Manager@12345` | 100 Credits |
| **Default User** | `user@parkease.local` | `User@12345` | 450 Credits |

---

## Quick Start with Docker (Recommended)

Run the entire platform (PostgreSQL + FastAPI Backend + Next.js Frontend) with a single command:

```bash
# 1. Start all containers
docker compose up --build

# 2. Seed database in the running backend container
docker compose exec backend python seed.py
```

### Access URLs:
- **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`postgres` / `postgres`)

---

## Local Development (Without Docker)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Database Seeder (creates tables and realistic Indian parking locations)
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory in a new terminal
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Features & User Flows

### 1. Driver Experience
- **Discovery**: Search by location, address, vehicle type, and price range. Click **"Find Parking Near Me"** to trigger HTML5 Geolocation and calculate Haversine distances to nearby multi-level parking facilities.
- **Visual Slot Selection**: Choose exact bays (e.g. `A01`, `B04`) categorized by **Car, Bike, SUV, EV**.
- **Wallet & Credits**: Receive 100 free welcome credits upon registration. Top up with simulated Starter, Standard, Premium, or Pro packages.
- **Pass Verification**: Generate a cryptographically signed QR Smart Pass upon confirmed reservation.
- **Cancellation & Refund**: 1-click cancellation prior to start time refunds 100% of credits back to your wallet.

### 2. Facility Manager Hub (`/manager/dashboard`)
- **Live Camera QR Scanner** (`/manager/scanner`): Scan driver passes directly using phone/laptop camera or manual token search.
  - **Entry Approval**: Updates booking from `UPCOMING` to `ACTIVE`, bay to `OCCUPIED`, and sets entry timestamp.
  - **Exit Approval**: Updates booking from `ACTIVE` to `COMPLETED`, releases bay to `AVAILABLE`, and sends completion notification.
- **Slot Maintenance**: Toggle bays in and out of maintenance mode.
- **Batch Slot Generator**: Create new sections (e.g. `C01` to `C20`) in one click.

### 3. System Administrator Center (`/admin/dashboard`)
- **KPI Metrics**: Real-time user count, active parkings, slot occupancy rates, and platform credit turnover.
- **User & Role Management** (`/admin/users`): Promote users to facility managers, demote, or suspend accounts (with built-in protection against removing the last active administrator).
- **Facility Approvals** (`/admin/parking`): Approve new manager submissions, activate, or deactivate facilities.
- **Ledger Audit** (`/admin/transactions`): Review immutable wallet adjustments and simulated gateway top-up receipts.

---

## Project Structure

```text
parkease/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular API routes (auth, users, parking, slots, bookings, wallet, manager, admin)
│   │   ├── core/            # Config, security (bcrypt & JWT), centralized exceptions
│   │   ├── database/        # Session, engine, table initialization
│   │   ├── models/          # SQLAlchemy models (User, Wallet, ParkingLocation, ParkingSlot, Booking, Review, Notification)
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # Business logic: geo distance, atomic booking with row locking, credit transactions
│   │   └── main.py          # FastAPI application entry point
│   ├── seed.py              # Seeder with Vijayawada, Hyderabad, Guntur, Tirupati, Vizag locations
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 15 App Router pages
│   │   ├── components/      # Reusable UI, Leaflet map, Slot matrix, QR display/scanner, Wallet modals
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── lib/             # Axios client with JWT refresh interceptor & formatting utils
│   │   └── types/           # TypeScript interfaces matching backend models
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .env
├── .gitignore
└── README.md
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register user + 100 welcome credits |
| `POST` | `/api/auth/login` | Authenticate & issue access/refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh expired access token |
| `GET` | `/api/users/me` | Fetch active user profile and wallet balance |
| `GET` | `/api/parking` | Search & filter active parking locations |
| `GET` | `/api/parking/nearby` | Haversine GPS proximity parking query |
| `GET` | `/api/parking/{id}` | Detailed facility view with visual slot matrix |
| `POST` | `/api/bookings` | Atomic row-locked slot reservation & credit payment |
| `POST` | `/api/bookings/{id}/cancel`| Cancel booking and trigger immediate credit refund |
| `GET` | `/api/wallet` | Query wallet balance and recent transactions |
| `POST` | `/api/wallet/add-credits` | Purchase credit package via simulated payment gateway |
| `POST` | `/api/manager/scan-entry` | Verify QR token and approve facility entry |
| `POST` | `/api/manager/scan-exit` | Verify QR token and approve facility exit |
| `GET` | `/api/admin/dashboard` | Platform statistics, growth analytics, and telemetry |

---

## License

This project is licensed under the MIT License.
