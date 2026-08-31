from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from app.database.session import get_db
from app.models.parking import ParkingLocation, ParkingSlot, SlotStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.schemas.manager import (
    ManagerDashboardResponse,
    ScanRequest,
    ScanResponse
)
from app.schemas.booking import BookingResponse
from app.services.auth_service import require_manager_or_admin
from app.services.booking_service import process_qr_scan
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter()

def get_manager_parking_ids(db: Session, current_user: User) -> List[int]:
    if current_user.role == UserRole.ADMIN.value:
        return [p.id for p in db.query(ParkingLocation.id).all()]
    return [p.id for p in db.query(ParkingLocation.id).filter(ParkingLocation.manager_id == current_user.id).all()]

@router.get("/dashboard", response_model=ManagerDashboardResponse)
def get_manager_dashboard(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking_ids = get_manager_parking_ids(db, current_user)

    if not parking_ids:
        return {
            "stats": {
                "total_slots": 0,
                "available_slots": 0,
                "occupied_slots": 0,
                "reserved_slots": 0,
                "maintenance_slots": 0,
                "today_bookings": 0,
                "today_revenue": 0,
                "current_occupancy_percent": 0.0
            },
            "parking_locations_count": 0,
            "recent_bookings": [],
            "daily_bookings_chart": [],
            "revenue_chart": [],
            "occupancy_chart": []
        }

    # Slot metrics
    total_slots = db.query(func.count(ParkingSlot.id)).filter(ParkingSlot.parking_id.in_(parking_ids)).scalar() or 0
    available_slots = db.query(func.count(ParkingSlot.id)).filter(
        ParkingSlot.parking_id.in_(parking_ids),
        ParkingSlot.status == SlotStatus.AVAILABLE.value
    ).scalar() or 0
    occupied_slots = db.query(func.count(ParkingSlot.id)).filter(
        ParkingSlot.parking_id.in_(parking_ids),
        ParkingSlot.status == SlotStatus.OCCUPIED.value
    ).scalar() or 0
    reserved_slots = db.query(func.count(ParkingSlot.id)).filter(
        ParkingSlot.parking_id.in_(parking_ids),
        ParkingSlot.status == SlotStatus.RESERVED.value
    ).scalar() or 0
    maintenance_slots = db.query(func.count(ParkingSlot.id)).filter(
        ParkingSlot.parking_id.in_(parking_ids),
        ParkingSlot.status == SlotStatus.MAINTENANCE.value
    ).scalar() or 0

    occupancy_pct = round((occupied_slots / total_slots * 100), 1) if total_slots > 0 else 0.0

    # Today's metrics
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_bookings = db.query(func.count(Booking.id)).filter(
        Booking.parking_id.in_(parking_ids),
        Booking.created_at >= today_start
    ).scalar() or 0

    today_revenue = db.query(func.sum(Booking.credits)).filter(
        Booking.parking_id.in_(parking_ids),
        Booking.created_at >= today_start,
        Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value, BookingStatus.COMPLETED.value])
    ).scalar() or 0

    # Recent bookings
    recent_bookings = db.query(Booking).filter(
        Booking.parking_id.in_(parking_ids)
    ).order_by(desc(Booking.created_at)).limit(10).all()

    # 7-day charts data
    daily_bookings_chart = []
    revenue_chart = []
    occupancy_chart = []

    for i in range(6, -1, -1):
        day_date = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        day_label = day_date.strftime("%b %d")

        b_count = db.query(func.count(Booking.id)).filter(
            Booking.parking_id.in_(parking_ids),
            Booking.created_at >= day_start,
            Booking.created_at <= day_end
        ).scalar() or 0

        rev_sum = db.query(func.sum(Booking.credits)).filter(
            Booking.parking_id.in_(parking_ids),
            Booking.created_at >= day_start,
            Booking.created_at <= day_end,
            Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value, BookingStatus.COMPLETED.value])
        ).scalar() or 0

        daily_bookings_chart.append({"date": day_label, "bookings": b_count})
        revenue_chart.append({"date": day_label, "revenue": int(rev_sum)})
        occupancy_chart.append({"date": day_label, "occupancy_percent": min(100.0, round((b_count / max(1, total_slots)) * 100, 1))})

    return {
        "stats": {
            "total_slots": total_slots,
            "available_slots": available_slots,
            "occupied_slots": occupied_slots,
            "reserved_slots": reserved_slots,
            "maintenance_slots": maintenance_slots,
            "today_bookings": today_bookings,
            "today_revenue": int(today_revenue),
            "current_occupancy_percent": occupancy_pct
        },
        "parking_locations_count": len(parking_ids),
        "recent_bookings": recent_bookings,
        "daily_bookings_chart": daily_bookings_chart,
        "revenue_chart": revenue_chart,
        "occupancy_chart": occupancy_chart
    }

@router.get("/bookings", response_model=List[BookingResponse])
def get_manager_bookings(
    query: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    parking_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking_ids = get_manager_parking_ids(db, current_user)
    if parking_id:
        if parking_id not in parking_ids and current_user.role != UserRole.ADMIN.value:
            raise BadRequestException("You do not manage this parking location")
        target_ids = [parking_id]
    else:
        target_ids = parking_ids

    q = db.query(Booking).filter(Booking.parking_id.in_(target_ids))

    if status and status != "ALL":
        q = q.filter(Booking.status == status)

    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                Booking.booking_number.ilike(pattern),
                Booking.vehicle_number.ilike(pattern),
                Booking.qr_token.ilike(pattern)
            )
        )

    bookings = q.order_by(desc(Booking.created_at)).limit(limit).all()
    return bookings

@router.post("/scan-entry", response_model=ScanResponse)
def scan_and_approve_entry(
    req: ScanRequest,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    result = process_qr_scan(
        db=db,
        qr_token=req.qr_token,
        manager_id=current_user.id,
        manager_role=current_user.role,
        parking_id=req.parking_id
    )
    return result

@router.post("/scan-exit", response_model=ScanResponse)
def scan_and_approve_exit(
    req: ScanRequest,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    result = process_qr_scan(
        db=db,
        qr_token=req.qr_token,
        manager_id=current_user.id,
        manager_role=current_user.role,
        parking_id=req.parking_id
    )
    return result

@router.get("/revenue")
def get_manager_revenue_stats(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking_ids = get_manager_parking_ids(db, current_user)
    
    total_rev = db.query(func.sum(Booking.credits)).filter(
        Booking.parking_id.in_(parking_ids),
        Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value, BookingStatus.COMPLETED.value])
    ).scalar() or 0

    per_parking = []
    for pid in parking_ids:
        p = db.query(ParkingLocation).filter(ParkingLocation.id == pid).first()
        if p:
            rev = db.query(func.sum(Booking.credits)).filter(
                Booking.parking_id == pid,
                Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value, BookingStatus.COMPLETED.value])
            ).scalar() or 0
            count = db.query(func.count(Booking.id)).filter(Booking.parking_id == pid).scalar() or 0
            per_parking.append({
                "parking_id": p.id,
                "parking_name": p.name,
                "city": p.city,
                "total_bookings": count,
                "revenue_credits": int(rev)
            })

    return {
        "total_revenue_credits": int(total_rev),
        "parking_breakdown": per_parking
    }
