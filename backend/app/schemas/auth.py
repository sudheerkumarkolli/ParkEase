from typing import Optional
from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    vehicle_number: Optional[str] = Field(None, max_length=20)
    vehicle_type: Optional[str] = Field("Car", max_length=20)
    otp: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    reset_token: str
    new_password: str = Field(..., min_length=6)

class SendOTPRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)

class SendOTPResponse(BaseModel):
    message: str
    email: str
    dev_otp: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    otp: str = Field(..., min_length=4, max_length=10)


