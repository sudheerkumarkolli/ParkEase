from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database.session import get_db
from app.models.parking import ParkingLocation, ParkingSlot, ParkingStatus, SlotStatus
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingStatus
from app.schemas.parking import (
    ParkingLocationResponse,
    ParkingLocationCreate,
    ParkingLocationUpdate,
    ParkingDetailResponse,
    NearbyParkingResponse
)
from app.schemas.slot import SlotResponse
from app.services.auth_service import get_current_active_user, require_manager_or_admin
from app.services.geo_service import filter_and_sort_by_distance, haversine_distance
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.core.config import settings

router = APIRouter()

@router.get("", response_model=List[ParkingLocationResponse])
def get_all_parkings(
    query: Optional[str] = Query(None, description="Search by name, address, state, or city"),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    status: Optional[str] = Query("ACTIVE"),
    sort_by: Optional[str] = Query("name", pattern="^(price_asc|price_desc|slots_desc|rating_desc|name)$"),
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
                ParkingLocation.state.ilike(pattern),
                ParkingLocation.city.ilike(pattern)
            )
        )

    if state and state != "ALL":
        q = q.filter(ParkingLocation.state.ilike(f"%{state}%"))

    if city and city != "ALL":
        q = q.filter(ParkingLocation.city.ilike(f"%{city}%"))

    if vehicle_type:
        q = q.filter(ParkingLocation.supported_vehicle_types.ilike(f"%{vehicle_type}%"))

    if min_price is not None:
        q = q.filter(ParkingLocation.price_per_hour >= min_price)

    if max_price is not None:
        q = q.filter(ParkingLocation.price_per_hour <= max_price)

    # Sorting
    if sort_by == "price_asc":
        q = q.order_by(asc(ParkingLocation.price_per_hour))
    elif sort_by == "price_desc":
        q = q.order_by(desc(ParkingLocation.price_per_hour))
    elif sort_by == "slots_desc":
        q = q.order_by(desc(ParkingLocation.available_slots))
    elif sort_by == "rating_desc":
        q = q.order_by(desc(ParkingLocation.rating))
    else:
        q = q.order_by(ParkingLocation.name)

    parkings = q.all()
    results = []
    for p in parkings:
        occupied = (p.total_slots - p.available_slots) if p.total_slots >= p.available_slots else 0
        p_dict = {
            "id": p.id,
            "manager_id": p.manager_id,
            "name": p.name,
            "address": p.address,
            "state": p.state,
            "city": p.city,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "total_slots": p.total_slots,
            "available_slots": p.available_slots,
            "occupied_slots": occupied,
            "price_per_hour": p.price_per_hour,
            "opening_time": p.opening_time,
            "closing_time": p.closing_time,
            "supported_vehicle_types": p.supported_vehicle_types,
            "facilities": p.facilities,
            "description": p.description,
            "image_url": p.image_url,
            "status": p.status,
            "rating": p.rating,
            "review_count": p.review_count,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        }
        results.append(p_dict)
    return results

@router.get("/nearby", response_model=List[NearbyParkingResponse])
def get_nearby_parkings(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(10.0, ge=0.5, le=100.0, description="Radius in KM"),
    vehicle_type: Optional[str] = Query(None),
    max_price: Optional[int] = Query(None),
    status: Optional[str] = Query("ACTIVE"),
    db: Session = Depends(get_db)
):
    q = db.query(ParkingLocation)
    if status and status != "ALL":
        q = q.filter(ParkingLocation.status == status)

    if vehicle_type:
        q = q.filter(ParkingLocation.supported_vehicle_types.ilike(f"%{vehicle_type}%"))

    if max_price is not None:
        q = q.filter(ParkingLocation.price_per_hour <= max_price)

    parkings = q.all()
    loc_dicts = []
    for p in parkings:
        occupied = (p.total_slots - p.available_slots) if p.total_slots >= p.available_slots else 0
        loc_dicts.append({
            "id": p.id,
            "manager_id": p.manager_id,
            "name": p.name,
            "address": p.address,
            "state": p.state,
            "city": p.city,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "total_slots": p.total_slots,
            "available_slots": p.available_slots,
            "occupied_slots": occupied,
            "price_per_hour": p.price_per_hour,
            "opening_time": p.opening_time,
            "closing_time": p.closing_time,
            "supported_vehicle_types": p.supported_vehicle_types,
            "facilities": p.facilities,
            "description": p.description,
            "image_url": p.image_url,
            "status": p.status,
            "rating": p.rating,
            "review_count": p.review_count,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        })

    nearby = filter_and_sort_by_distance(
        user_lat=lat,
        user_lon=lng,
        locations=loc_dicts,
        max_radius_km=radius_km
    )
    return nearby

@router.get("/{parking_id}", response_model=ParkingDetailResponse)
def get_parking_by_id(parking_id: int, db: Session = Depends(get_db)):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    slots = db.query(ParkingSlot).filter(ParkingSlot.parking_id == parking_id).order_by(ParkingSlot.slot_number).all()
    occupied = (parking.total_slots - parking.available_slots) if parking.total_slots >= parking.available_slots else 0

    return {
        "id": parking.id,
        "manager_id": parking.manager_id,
        "name": parking.name,
        "address": parking.address,
        "state": parking.state,
        "city": parking.city,
        "latitude": parking.latitude,
        "longitude": parking.longitude,
        "total_slots": parking.total_slots,
        "available_slots": parking.available_slots,
        "occupied_slots": occupied,
        "price_per_hour": parking.price_per_hour,
        "opening_time": parking.opening_time,
        "closing_time": parking.closing_time,
        "supported_vehicle_types": parking.supported_vehicle_types,
        "facilities": parking.facilities,
        "description": parking.description,
        "image_url": parking.image_url,
        "status": parking.status,
        "rating": parking.rating,
        "review_count": parking.review_count,
        "created_at": parking.created_at,
        "updated_at": parking.updated_at,
        "slots": slots
    }

@router.post("", response_model=ParkingLocationResponse)
def create_parking(
    req: ParkingLocationCreate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    manager_id = current_user.id if current_user.role == UserRole.PARKING_MANAGER.value else None
    
    # Non-admins create with status PENDING for admin approval; admins create ACTIVE directly
    initial_status = ParkingStatus.ACTIVE.value if current_user.role == UserRole.ADMIN.value else ParkingStatus.PENDING.value

    parking = ParkingLocation(
        manager_id=manager_id,
        name=req.name,
        address=req.address,
        state=req.state or "Andhra Pradesh",
        city=req.city,
        latitude=req.latitude,
        longitude=req.longitude,
        total_slots=req.total_slots or 0,
        available_slots=req.total_slots or 0,
        price_per_hour=req.price_per_hour,
        opening_time=req.opening_time,
        closing_time=req.closing_time,
        supported_vehicle_types=req.supported_vehicle_types or "Car,Bike,SUV,EV",
        facilities=req.facilities or "CCTV,Covered Parking",
        description=req.description,
        image_url=req.image_url or "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60",
        status=initial_status
    )
    db.add(parking)
    db.commit()
    db.refresh(parking)

    # Automatically generate initial parking slots if total_slots provided
    if req.total_slots and req.total_slots > 0:
        slots = []
        for i in range(1, req.total_slots + 1):
            slot_num = f"A{i:02d}"
            v_type = "Bike" if i <= max(2, int(req.total_slots * 0.2)) else "Car"
            slots.append(
                ParkingSlot(
                    parking_id=parking.id,
                    slot_number=slot_num,
                    vehicle_type=v_type,
                    status=SlotStatus.AVAILABLE.value
                )
            )
        db.add_all(slots)
        db.commit()
        db.refresh(parking)

    return parking

@router.put("/{parking_id}", response_model=ParkingLocationResponse)
def update_parking(
    parking_id: int,
    req: ParkingLocationUpdate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    if current_user.role != UserRole.ADMIN.value and parking.manager_id != current_user.id:
        raise ForbiddenException("You can only manage your own parking locations")

    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(parking, key, value)

    db.commit()
    db.refresh(parking)
    return parking

@router.delete("/{parking_id}")
def delete_parking(
    parking_id: int,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == parking_id).first()
    if not parking:
        raise NotFoundException("Parking location not found")

    if current_user.role != UserRole.ADMIN.value and parking.manager_id != current_user.id:
        raise ForbiddenException("You can only delete your own parking location")

    # Check for active bookings
    active_booking = db.query(Booking).filter(
        Booking.parking_id == parking_id,
        Booking.status.in_([BookingStatus.UPCOMING.value, BookingStatus.ACTIVE.value])
    ).first()

    if active_booking:
        raise BadRequestException("Cannot delete parking location with active or upcoming bookings")

    db.delete(parking)
    db.commit()
    return {"message": "Parking location deleted successfully"}
