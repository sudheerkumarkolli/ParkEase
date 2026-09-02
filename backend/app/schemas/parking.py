from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.slot import SlotResponse

class ParkingLocationBase(BaseModel):
    name: str
    address: str
    state: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: float
    longitude: float
    total_slots: Optional[int] = 0
    price_per_hour: int = 20  # Credits
    opening_time: str = "06:00"
    closing_time: str = "23:00"
    supported_vehicle_types: Optional[str] = "Car,Bike,SUV,EV"
    facilities: Optional[str] = "CCTV,EV Charging,Covered Parking,Security Guard"
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = "ACTIVE"  # ACTIVE, PENDING, INACTIVE

class ParkingLocationCreate(ParkingLocationBase):
    pass

class ParkingLocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_hour: Optional[int] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    supported_vehicle_types: Optional[str] = None
    facilities: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class ParkingLocationResponse(ParkingLocationBase):
    id: int
    manager_id: Optional[int] = None
    available_slots: int
    occupied_slots: Optional[int] = 0
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NearbyParkingResponse(ParkingLocationResponse):
    distance_km: float

class ParkingDetailResponse(ParkingLocationResponse):
    slots: List[SlotResponse] = []
