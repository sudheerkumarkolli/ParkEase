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
    package_name: str
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

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    credits: int
    package_name: str
    payment_method: str
    transaction_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
