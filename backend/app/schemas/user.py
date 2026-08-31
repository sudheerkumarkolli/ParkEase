from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "USER"
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = "Car"
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    password: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    wallet_balance: Optional[int] = 0

    class Config:
        from_attributes = True
