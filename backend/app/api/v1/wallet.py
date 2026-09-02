from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.wallet import Wallet, WalletTransaction, Payment
from app.models.user import User
from app.schemas.wallet import (
    WalletResponse,
    WalletTransactionResponse,
    AddCreditsRequest,
    CreditPackage,
    PaymentResponse,
    InitiatePaymentRequest,
    InitiatePaymentResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse
)
from app.services.auth_service import get_current_active_user, require_manager_or_admin
from app.services.wallet_service import (
    get_or_create_wallet,
    purchase_credits,
    initiate_payment,
    verify_manager_payment,
    CREDIT_PACKAGES
)

router = APIRouter()

@router.get("", response_model=WalletResponse)
@router.get("/me", response_model=WalletResponse)
def get_user_wallet(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, current_user.id)
    recent_txs = db.query(WalletTransaction).filter(
        WalletTransaction.wallet_id == wallet.id
    ).order_by(desc(WalletTransaction.created_at)).limit(10).all()

    return {
        "id": wallet.id,
        "user_id": wallet.user_id,
        "balance": wallet.balance,
        "created_at": wallet.created_at,
        "updated_at": wallet.updated_at,
        "recent_transactions": recent_txs
    }


@router.get("/packages", response_model=List[CreditPackage])
def list_credit_packages():
    return CREDIT_PACKAGES

@router.get("/transactions", response_model=List[WalletTransactionResponse])
def get_wallet_transactions(
    tx_type: Optional[str] = Query(None, description="Filter by type: WELCOME_CREDIT, CREDIT_PURCHASE, BOOKING_PAYMENT, BOOKING_REFUND"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, current_user.id)
    q = db.query(WalletTransaction).filter(WalletTransaction.wallet_id == wallet.id)
    if tx_type and tx_type != "ALL":
        q = q.filter(WalletTransaction.type == tx_type)

    transactions = q.order_by(desc(WalletTransaction.created_at)).limit(limit).all()
    return transactions

@router.post("/initiate", response_model=InitiatePaymentResponse)
def initiate_wallet_payment(
    req: InitiatePaymentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    res = initiate_payment(
        db=db,
        user_id=current_user.id,
        package_name=req.package_name,
        amount=req.amount,
        payment_method=req.payment_method,
        parking_id=req.parking_id
    )
    p = res["payment"]
    return {
        "payment_id": p.id,
        "transaction_id": p.transaction_id,
        "qr_token": p.qr_token,
        "amount": p.amount,
        "credits": p.credits,
        "package_name": p.package_name,
        "payment_method": p.payment_method,
        "status": p.status,
        "created_at": p.created_at
    }

@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment_route(
    req: VerifyPaymentRequest,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    return verify_manager_payment(
        db=db,
        qr_token=req.qr_token,
        manager_id=current_user.id,
        manager_role=current_user.role,
        action=req.action,
        parking_id=req.parking_id
    )

@router.get("/status/{tx_or_token}")
def check_payment_status(
    tx_or_token: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        (Payment.transaction_id == tx_or_token) | (Payment.qr_token == tx_or_token)
    ).first()
    if not payment:
        return {"status": "NOT_FOUND"}
    
    return {
        "transaction_id": payment.transaction_id,
        "qr_token": payment.qr_token,
        "status": payment.status,
        "amount": payment.amount,
        "credits": payment.credits,
        "approved_at": payment.approved_at
    }

@router.post("/add-credits")
@router.post("/top-up")
def add_credits_to_wallet(
    req: AddCreditsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    result = purchase_credits(
        db=db,
        user_id=current_user.id,
        package_name=req.package_name,
        amount=req.amount,
        payment_method=req.payment_method
    )
    return {
        "message": f"Successfully purchased {result['payment'].credits} credits!",
        "new_balance": result["wallet"].balance,
        "transaction_id": result["payment"].transaction_id,
        "amount_paid": result["payment"].amount
    }

