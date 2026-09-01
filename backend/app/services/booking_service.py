import uuid
import math
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.booking import Booking, BookingStatus
from app.models.parking import ParkingLocation, ParkingSlot, ParkingStatus, SlotStatus
from app.models.user import User
from app.models.notification import Notification
from app.models.wallet import Wallet
from app.services.wallet_service import deduct_credits, refund_credits, get_or_create_wallet
from app.core.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    InsufficientCreditsException
)

def create_booking(
    db: Session,
    user_id: int,
    parking_id: int,
    slot_id: Optional[int],
    vehicle_number: str,
    vehicle_type: str,
    start_time: datetime,
    duration_hours: float
) -> Booking:
    # 1. Verify User
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise ForbiddenException("User account is inactive or not found")

    # 2. Verify Parking exists & is ACTIVE
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")
    if parking.status != ParkingStatus.ACTIVE.value:
        raise BadRequestException(f"Parking location is currently {parking.status.lower()} and not accepting bookings")

    # 3. Auto-allocate slot if not explicitly provided
    if not slot_id or slot_id == 0:
        available_slot = db.query(ParkingSlot).filter(
            ParkingSlot.parking_id == parking_id,
            ParkingSlot.status == SlotStatus.AVAILABLE.value
        ).first()
        if not available_slot:
            raise BadRequestException("No available parking slots in this location")
        slot = available_slot
        slot_id = slot.id
    else:
        # Lock and Verify Slot
        try:
            slot_query = db.query(ParkingSlot).filter(
                ParkingSlot.id == slot_id,
                ParkingSlot.parking_id == parking_id
            )
            if db.bind.dialect.name == "postgresql":
                slot = slot_query.with_for_update().first()
            else:
                slot = slot_query.first()
        except Exception:
            slot = db.query(ParkingSlot).filter(
                ParkingSlot.id == slot_id,
                ParkingSlot.parking_id == parking_id
            ).first()

    if not slot:
        raise NotFoundException("Selected parking slot was not found in this location")


    if slot.status == SlotStatus.MAINTENANCE.value:
        raise BadRequestException("This parking slot is currently under maintenance")

    if slot.status == SlotStatus.OCCUPIED.value:
        raise ConflictException("This parking slot is currently occupied")

    # 4. Check time overlap
    end_time = start_time + timedelta(hours=duration_hours)
    
    # Check if slot already has overlapping active/upcoming reservation
    overlapping_booking = db.query(Booking).filter(
        Booking.slot_id == slot_id,
        Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value]),
        or_(
            and_(Booking.start_time <= start_time, Booking.end_time > start_time),
            and_(Booking.start_time < end_time, Booking.end_time >= end_time),
            and_(Booking.start_time >= start_time, Booking.end_time <= end_time)
        )
    ).first()

    if overlapping_booking:
        raise ConflictException("This slot is already reserved for the selected time duration")

    # 5. Calculate Total Credits
    total_credits = math.ceil(parking.price_per_hour * duration_hours)

    # 6. Check & Deduct Wallet Balance
    wallet = get_or_create_wallet(db, user_id)
    if wallet.balance < total_credits:
        raise InsufficientCreditsException(
            f"Insufficient credits! Required: {total_credits} Credits, Available: {wallet.balance} Credits. Please top up your wallet."
        )

    # 7. Generate IDs and QR token
    booking_no = f"PE-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    qr_token = f"QR-{uuid.uuid4().hex}"

    # Deduct credits
    deduct_credits(
        db=db,
        user_id=user_id,
        credits=total_credits,
        description=f"Booking {booking_no} at {parking.name} ({duration_hours} hrs)",
        reference_id=booking_no
    )

    # 8. Create Booking
    booking = Booking(
        booking_number=booking_no,
        user_id=user_id,
        parking_id=parking_id,
        slot_id=slot_id,
        vehicle_number=vehicle_number.upper(),
        vehicle_type=vehicle_type,
        start_time=start_time,
        end_time=end_time,
        duration_hours=duration_hours,
        credits=total_credits,
        status=BookingStatus.UPCOMING.value,
        qr_token=qr_token
    )
    db.add(booking)

    # 9. Update Slot & Parking stats
    slot.status = SlotStatus.RESERVED.value
    if parking.available_slots > 0:
        parking.available_slots -= 1

    # 10. Create Notification
    notif = Notification(
        user_id=user_id,
        title="Parking Reserved!",
        message=f"Your booking #{booking_no} for slot {slot.slot_number} at {parking.name} is confirmed. Show the QR code upon arrival.",
        type="BOOKING"
    )
    db.add(notif)

    db.commit()
    db.refresh(booking)
    return booking

def cancel_booking(db: Session, booking_id: int, user_id: int) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundException("Booking not found")

    if booking.user_id != user_id:
        raise ForbiddenException("You cannot cancel someone else's booking")

    if booking.status != BookingStatus.UPCOMING.value:
        raise BadRequestException(f"Cannot cancel a booking with status '{booking.status}'. Only UPCOMING bookings can be cancelled.")

    # Mark booking as cancelled
    booking.status = BookingStatus.CANCELLED.value

    # Free up the slot
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == booking.slot_id).first()
    if slot:
        slot.status = SlotStatus.AVAILABLE.value

    # Increment available slots in parking
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == booking.parking_id).first()
    if parking and parking.available_slots < parking.total_slots:
        parking.available_slots += 1

    # Full refund of credits
    refund_credits(
        db=db,
        user_id=user_id,
        credits=booking.credits,
        description=f"Refund for cancelled booking #{booking.booking_number}",
        reference_id=booking.booking_number
    )

    # Create Notification
    notif = Notification(
        user_id=user_id,
        title="Booking Cancelled",
        message=f"Booking #{booking.booking_number} has been cancelled. {booking.credits} credits have been refunded to your wallet.",
        type="BOOKING"
    )
    db.add(notif)

    db.commit()
    db.refresh(booking)

    return {
        "message": f"Booking #{booking.booking_number} cancelled successfully. {booking.credits} credits refunded.",
        "refunded_credits": booking.credits,
        "booking": booking
    }

def process_qr_scan(
    db: Session,
    qr_token: str,
    manager_id: int,
    manager_role: str,
    parking_id: Optional[int] = None
) -> dict:
    booking = db.query(Booking).filter(Booking.qr_token == qr_token).first()
    if not booking:
        raise NotFoundException("Invalid QR Code or Booking token not found")

    # If manager is restricted to their parking location
    if manager_role != "ADMIN" and parking_id:
        if booking.parking_id != parking_id:
            raise BadRequestException("This booking is for a different parking location")

    parking = db.query(ParkingLocation).filter(ParkingLocation.id == booking.parking_id).first()
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == booking.slot_id).first()

    # Determine Entry or Exit
    if booking.status == BookingStatus.UPCOMING.value:
        # Process Entry
        booking.status = BookingStatus.ACTIVE.value
        booking.entry_time = datetime.utcnow()
        if slot:
            slot.status = SlotStatus.OCCUPIED.value

        notif = Notification(
            user_id=booking.user_id,
            title="Vehicle Checked In (Entry Approved)",
            message=f"Welcome to {parking.name if parking else 'Parking'}! Slot: {slot.slot_number if slot else ''}. Your parking session has started.",
            type="ENTRY"
        )
        db.add(notif)
        db.commit()
        db.refresh(booking)

        return {
            "success": True,
            "action": "ENTRY_APPROVED",
            "message": f"ENTRY APPROVED for vehicle {booking.vehicle_number} at Slot {slot.slot_number if slot else 'N/A'}",
            "booking": booking
        }

    elif booking.status == BookingStatus.ACTIVE.value:
        # Process Exit
        booking.status = BookingStatus.COMPLETED.value
        booking.exit_time = datetime.utcnow()
        if slot:
            slot.status = SlotStatus.AVAILABLE.value
        if parking and parking.available_slots < parking.total_slots:
            parking.available_slots += 1

        notif = Notification(
            user_id=booking.user_id,
            title="Parking Completed (Exit Approved)",
            message=f"Thank you for using ParkEase at {parking.name if parking else 'Parking'}! Please leave a review of your experience.",
            type="EXIT"
        )
        db.add(notif)
        db.commit()
        db.refresh(booking)

        return {
            "success": True,
            "action": "EXIT_APPROVED",
            "message": f"EXIT APPROVED for vehicle {booking.vehicle_number}. Parking session completed successfully.",
            "booking": booking
        }

    elif booking.status == BookingStatus.CANCELLED.value:
        raise BadRequestException("INVALID BOOKING: This booking has been cancelled and cannot be used.")
    elif booking.status == BookingStatus.COMPLETED.value:
        raise BadRequestException("INVALID BOOKING: This booking has already completed its exit.")
    else:
        raise BadRequestException(f"INVALID BOOKING: Booking status is {booking.status}.")
