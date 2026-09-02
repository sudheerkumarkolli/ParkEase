from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SlotBase(BaseModel):
    slot_number: str
    vehicle_type: str = "Car"
    status: str = "AVAILABLE"  # AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    floor_level: Optional[str] = "Level 1"
    description: Optional[str] = None
    image_url: Optional[str] = None

class SlotCreate(SlotBase):
    pass

class SlotBatchCreate(BaseModel):
    prefix: str = "A"
    count: int = 10
    vehicle_type: str = "Car"
    floor_level: Optional[str] = "Level 1"
    image_url: Optional[str] = None

class SlotUpdate(BaseModel):
    slot_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: Optional[str] = None
    floor_level: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class SlotResponse(SlotBase):
    id: int
    parking_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
