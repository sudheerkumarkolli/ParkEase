from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.parking import ParkingLocation, ParkingSlot, ParkingStatus
from app.models.booking import Booking, BookingStatus
from app.models.wallet import Wallet, WalletTransaction, Payment, TransactionType
from app.schemas.user import UserResponse, UserRoleUpdate, UserStatusUpdate
from app.schemas.parking import ParkingLocationResponse
from app.schemas.booking import BookingResponse
from app.schemas.wallet import WalletTransactionResponse, PaymentResponse
from app.schemas.admin import AdminDashboardResponse
from app.services.auth_service import require_admin
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter()

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).filter(User.role == UserRole.USER.value).scalar() or 0
    total_managers = db.query(func.count(User.id)).filter(User.role == UserRole.PARKING_MANAGER.value).scalar() or 0
    total_parkings = db.query(func.count(ParkingLocation.id)).scalar() or 0
    total_slots = db.query(func.count(ParkingSlot.id)).scalar() or 0
    
    active_bookings = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.ACTIVE.value).scalar() or 0
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_bookings = db.query(func.count(Booking.id)).filter(Booking.created_at >= today_start).scalar() or 0
    today_revenue = db.query(func.sum(Booking.credits)).filter(
        Booking.created_at >= today_start,
        Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value, BookingStatus.COMPLETED.value])
    ).scalar() or 0

    total_credits_issued = db.query(func.sum(WalletTransaction.credits)).filter(
        WalletTransaction.credits > 0
    ).scalar() or 0

    total_credits_spent = db.query(func.abs(func.sum(WalletTransaction.credits))).filter(
        WalletTransaction.type == TransactionType.BOOKING_PAYMENT.value
    ).scalar() or 0

    # Recent lists
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(8).all()
    recent_bookings = db.query(Booking).order_by(desc(Booking.created_at)).limit(8).all()

    # Time series (last 7 days)
    user_growth_chart = []
    revenue_chart = []
    occupancy_chart = []

    for i in range(6, -1, -1):
        day_date = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        day_label = day_date.strftime("%b %d")

        u_count = db.query(func.count(User.id)).filter(
            User.created_at <= day_end
        ).scalar() or 0

        rev_sum = db.query(func.sum(Booking.credits)).filter(
            Booking.created_at >= day_start,
            Booking.created_at <= day_end,
            Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value, BookingStatus.COMPLETED.value])
        ).scalar() or 0

        b_count = db.query(func.count(Booking.id)).filter(
            Booking.created_at >= day_start,
            Booking.created_at <= day_end
        ).scalar() or 0

        user_growth_chart.append({"date": day_label, "total_users": u_count})
        revenue_chart.append({"date": day_label, "revenue": int(rev_sum)})
        occupancy_chart.append({"date": day_label, "occupancy_percent": min(100.0, round((b_count / max(1, total_slots)) * 100, 1))})

    # Popular parkings
    popular_parkings = []
    top_parkings = db.query(
        ParkingLocation.id,
        ParkingLocation.name,
        ParkingLocation.city,
        ParkingLocation.rating,
        func.count(Booking.id).label("booking_count")
    ).outerjoin(Booking, Booking.parking_id == ParkingLocation.id)\
     .group_by(ParkingLocation.id, ParkingLocation.name, ParkingLocation.city, ParkingLocation.rating)\
     .order_by(desc("booking_count"))\
     .limit(5).all()

    for p in top_parkings:
        popular_parkings.append({
            "id": p.id,
            "name": p.name,
            "city": p.city,
            "rating": p.rating,
            "bookings": p.booking_count
        })

    return {
        "stats": {
            "total_users": total_users,
            "total_managers": total_managers,
            "total_parking_locations": total_parkings,
            "total_parking_slots": total_slots,
            "active_bookings": active_bookings,
            "today_bookings": today_bookings,
            "today_revenue": int(today_revenue),
            "total_credits_issued": int(total_credits_issued),
            "total_credits_spent": int(total_credits_spent)
        },
        "recent_users": recent_users,
        "recent_bookings": recent_bookings,
        "user_growth_chart": user_growth_chart,
        "revenue_chart": revenue_chart,
        "occupancy_chart": occupancy_chart,
        "popular_parkings": popular_parkings
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    query: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(User)
    if role and role != "ALL":
        q = q.filter(User.role == role)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
                User.phone.ilike(pattern)
            )
        )
    users = q.order_by(desc(User.created_at)).limit(limit).all()
    return users

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    req: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found")

    # Safety check: prevent removing the last admin
    if user.role == UserRole.ADMIN.value and req.role != UserRole.ADMIN.value:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN.value, User.is_active == True).count()
        if admin_count <= 1:
            raise BadRequestException("Cannot demote the last active Administrator")

    user.role = req.role
    db.commit()
    return {"message": f"User role updated to {req.role}"}

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    req: UserStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found")

    # Safety check: prevent blocking the last admin
    if user.role == UserRole.ADMIN.value and not req.is_active:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN.value, User.is_active == True).count()
        if admin_count <= 1:
            raise BadRequestException("Cannot disable the last active Administrator")

    user.is_active = req.is_active
    db.commit()
    status_str = "activated" if req.is_active else "suspended"
    return {"message": f"User account has been {status_str}"}

@router.get("/parking", response_model=List[ParkingLocationResponse])
def get_all_parkings_admin(
    status: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(ParkingLocation)
    if status and status != "ALL":
        q = q.filter(ParkingLocation.status == status)
    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                ParkingLocation.name.ilike(pattern),
                ParkingLocation.address.ilike(pattern),
                ParkingLocation.city.ilike(pattern)
            )
        )
    return q.order_by(desc(ParkingLocation.created_at)).all()

@router.put("/parking/{parking_id}/status")
def update_parking_status(
    parking_id: int,
    status: str = Query(..., pattern="^(ACTIVE|PENDING|INACTIVE)$"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    parking.status = status
    db.commit()
    return {"message": f"Parking location status updated to {status}"}

@router.delete("/parking/{parking_id}")
def delete_parking_admin(
    parking_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    db.delete(parking)
    db.commit()
    return {"message": "Parking location deleted successfully"}

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings_admin(
    status: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Booking)
    if status and status != "ALL":
        q = q.filter(Booking.status == status)
    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                Booking.booking_number.ilike(pattern),
                Booking.vehicle_number.ilike(pattern)
            )
        )
    return q.order_by(desc(Booking.created_at)).limit(limit).all()

@router.get("/transactions")
def get_all_transactions_admin(
    tx_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(WalletTransaction)
    if tx_type and tx_type != "ALL":
        q = q.filter(WalletTransaction.type == tx_type)
    
    txs = q.order_by(desc(WalletTransaction.created_at)).limit(limit).all()
    
    payments = db.query(Payment).order_by(desc(Payment.created_at)).limit(limit).all()

    return {
        "wallet_transactions": txs,
        "payment_purchases": payments
    }
