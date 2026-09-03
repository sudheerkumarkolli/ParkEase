from datetime import datetime
from typing import Optional, List
import re
from pydantic import BaseModel, field_validator
from app.schemas.slot import SlotResponse

class ParkingLocationRequest(BaseModel):
    latitude: float
    longitude: float

class ParkingLocationBase(BaseModel):
    name: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
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
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Facility name cannot be empty")
        if not re.match(r"^[a-zA-Z\s]+$", v_clean):
            raise ValueError("Facility name must contain only alphabets (letters and spaces)")
        return v_clean

class ParkingLocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
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

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            if not v_clean:
                raise ValueError("Facility name cannot be empty")
            if not re.match(r"^[a-zA-Z\s]+$", v_clean):
                raise ValueError("Facility name must contain only alphabets (letters and spaces)")
            return v_clean
        return v

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
