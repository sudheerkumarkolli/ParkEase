from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.parking import ParkingLocationResponse
from app.schemas.slot import SlotResponse

class BookingCreate(BaseModel):
    parking_id: int
    slot_id: Optional[int] = None
    vehicle_number: str = Field(..., min_length=2, max_length=20)
    vehicle_type: str = Field("Car", max_length=20)
    start_time: datetime
    duration_hours: float = Field(..., gt=0, le=72)
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    booking_number: str
    user_id: int
    parking_id: int
    slot_id: int
    vehicle_number: str
    vehicle_type: str
    start_time: datetime
    end_time: datetime
    duration_hours: float
    credits: int
    status: str
    qr_token: str
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Optional nested details
    parking: Optional[ParkingLocationResponse] = None
    slot: Optional[SlotResponse] = None

    class Config:
        from_attributes = True

class BookingCancelResponse(BaseModel):
    message: str
    refunded_credits: int
    within_5_mins: bool = True
    booking: BookingResponse
