from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.models.parking import ParkingLocation, ParkingSlot
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingCancelResponse
)
from app.services.auth_service import get_current_active_user
from app.services.booking_service import create_booking, cancel_booking
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()

@router.post("", response_model=BookingResponse)
def make_booking(
    req: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    booking = create_booking(
        db=db,
        user_id=current_user.id,
        parking_id=req.parking_id,
        slot_id=req.slot_id,
        vehicle_number=req.vehicle_number,
        vehicle_type=req.vehicle_type,
        start_time=req.start_time,
        duration_hours=req.duration_hours
    )
    return booking

@router.get("", response_model=List[BookingResponse])
@router.get("/my-bookings", response_model=List[BookingResponse])
@router.get("/user", response_model=List[BookingResponse])
def get_user_bookings(
    status: Optional[str] = Query(None, description="Filter by booking status: UPCOMING, ACTIVE, COMPLETED, CANCELLED"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    q = db.query(Booking).filter(Booking.user_id == current_user.id)
    if status and status != "ALL":
        q = q.filter(Booking.status == status)

    bookings = q.order_by(desc(Booking.created_at)).limit(limit).all()
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_details(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundException("Booking not found")

    # Allow booking owner, manager of that parking, or admin
    if booking.user_id != current_user.id and current_user.role not in ["ADMIN", "PARKING_MANAGER"]:
        raise ForbiddenException("You cannot view this booking")

    return booking

@router.post("/{booking_id}/cancel", response_model=BookingCancelResponse)
def cancel_user_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    result = cancel_booking(db=db, booking_id=booking_id, user_id=current_user.id)
    return result
