from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.parking import ParkingLocation, ParkingSlot, SlotStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.schemas.slot import SlotResponse, SlotCreate, SlotUpdate, SlotBatchCreate
from app.services.auth_service import require_manager_or_admin
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException

router = APIRouter()

@router.get("/parking/{parking_id}/slots", response_model=List[SlotResponse])
def get_parking_slots(parking_id: int, db: Session = Depends(get_db)):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")
    
    slots = db.query(ParkingSlot).filter(ParkingSlot.parking_id == parking_id).order_by(ParkingSlot.slot_number).all()
    return slots

@router.post("/parking/{parking_id}/slots", response_model=SlotResponse)
def add_parking_slot(
    parking_id: int,
    req: SlotCreate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    if current_user.role != UserRole.ADMIN.value and parking.manager_id != current_user.id:
        raise ForbiddenException("You can only manage slots for your own parking location")

    # Check slot duplicate
    existing = db.query(ParkingSlot).filter(
        ParkingSlot.parking_id == parking_id,
        ParkingSlot.slot_number == req.slot_number.upper()
    ).first()
    if existing:
        raise BadRequestException(f"Slot number {req.slot_number} already exists in this parking location")

    slot = ParkingSlot(
        parking_id=parking_id,
        slot_number=req.slot_number.upper(),
        vehicle_type=req.vehicle_type,
        status=req.status or SlotStatus.AVAILABLE.value
    )
    db.add(slot)

    parking.total_slots += 1
    if slot.status == SlotStatus.AVAILABLE.value:
        parking.available_slots += 1

    db.commit()
    db.refresh(slot)
    return slot

@router.post("/parking/{parking_id}/slots/batch", response_model=List[SlotResponse])
def add_batch_slots(
    parking_id: int,
    req: SlotBatchCreate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    if current_user.role != UserRole.ADMIN.value and parking.manager_id != current_user.id:
        raise ForbiddenException("You can only manage slots for your own parking location")

    created_slots = []
    prefix = req.prefix.upper()
    for i in range(1, req.count + 1):
        slot_num = f"{prefix}{i:02d}"
        existing = db.query(ParkingSlot).filter(
            ParkingSlot.parking_id == parking_id,
            ParkingSlot.slot_number == slot_num
        ).first()
        if not existing:
            slot = ParkingSlot(
                parking_id=parking_id,
                slot_number=slot_num,
                vehicle_type=req.vehicle_type,
                status=SlotStatus.AVAILABLE.value
            )
            db.add(slot)
            created_slots.append(slot)
            parking.total_slots += 1
            parking.available_slots += 1

    db.commit()
    for s in created_slots:
        db.refresh(s)
    return created_slots

@router.put("/slots/{slot_id}", response_model=SlotResponse)
def update_slot(
    slot_id: int,
    req: SlotUpdate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise NotFoundException("Parking slot not found")

    parking = db.query(ParkingLocation).filter(ParkingLocation.id == slot.parking_id).first()
    if current_user.role != UserRole.ADMIN.value and parking.manager_id != current_user.id:
        raise ForbiddenException("You can only update slots for your own parking location")

    old_status = slot.status

    if req.slot_number:
        slot.slot_number = req.slot_number.upper()
    if req.vehicle_type:
        slot.vehicle_type = req.vehicle_type
    if req.status:
        slot.status = req.status

        # Adjust parking available_slots
        if old_status == SlotStatus.AVAILABLE.value and req.status != SlotStatus.AVAILABLE.value:
            if parking.available_slots > 0:
                parking.available_slots -= 1
        elif old_status != SlotStatus.AVAILABLE.value and req.status == SlotStatus.AVAILABLE.value:
            if parking.available_slots < parking.total_slots:
                parking.available_slots += 1

    db.commit()
    db.refresh(slot)
    return slot

@router.delete("/slots/{slot_id}")
def delete_slot(
    slot_id: int,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise NotFoundException("Parking slot not found")

    parking = db.query(ParkingLocation).filter(ParkingLocation.id == slot.parking_id).first()
    if current_user.role != UserRole.ADMIN.value and parking.manager_id != current_user.id:
        raise ForbiddenException("You can only delete slots for your own parking location")

    # Prevent deletion if active or upcoming booking on this slot
    active_booking = db.query(Booking).filter(
        Booking.slot_id == slot_id,
        Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value])
    ).first()

    if active_booking:
        raise BadRequestException("Cannot delete slot with active or upcoming bookings")

    if slot.status == SlotStatus.AVAILABLE.value and parking.available_slots > 0:
        parking.available_slots -= 1
    if parking.total_slots > 0:
        parking.total_slots -= 1

    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted successfully"}
