from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    parking,
    slots,
    bookings,
    wallet,
    notifications,
    reviews,
    manager,
    admin
)

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# User routes
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Parking & Slot routes
api_router.include_router(parking.router, prefix="/parking", tags=["Parking Locations"])
api_router.include_router(slots.router, tags=["Parking Slots"])

# Bookings routes
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])

# Wallet & Credit routes
api_router.include_router(wallet.router, prefix="/wallet", tags=["Wallet & Credits"])
api_router.include_router(wallet.router, prefix="/wallets", tags=["Wallet & Credits"])


# Notifications
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# Reviews
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])

# Manager Dashboard & Operations
api_router.include_router(manager.router, prefix="/manager", tags=["Parking Manager"])

# Admin Dashboard & System Operations
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
