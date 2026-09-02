from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class CreditPackage(BaseModel):
    id: str
    name: str
    credits: int
    price_inr: float
    popular: bool = False
    badge: Optional[str] = None

class AddCreditsRequest(BaseModel):
    package_name: Optional[str] = None
    amount: Optional[int] = None
    payment_method: str = "SIMULATED_RAZORPAY"


class WalletTransactionResponse(BaseModel):
    id: int
    wallet_id: int
    type: str
    credits: int
    description: Optional[str] = None
    reference_id: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: int
    created_at: datetime
    updated_at: datetime
    recent_transactions: List[WalletTransactionResponse] = []

    class Config:
        from_attributes = True

class InitiatePaymentRequest(BaseModel):
    package_name: Optional[str] = None
    amount: Optional[int] = None
    payment_method: str = "UPI"
    parking_id: Optional[int] = None

class InitiatePaymentResponse(BaseModel):
    payment_id: int
    transaction_id: str
    qr_token: str
    amount: float
    credits: int
    package_name: str
    payment_method: str
    status: str
    created_at: datetime

class VerifyPaymentRequest(BaseModel):
    qr_token: str
    parking_id: Optional[int] = None
    action: str = "APPROVE"  # APPROVE or REJECT

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    transaction_id: str
    credits_added: int
    user_id: int
    user_name: str
    new_balance: int

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    credits: int
    package_name: str
    payment_method: str
    transaction_id: str
    qr_token: Optional[str] = None
    status: str
    manager_id: Optional[int] = None
    parking_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
