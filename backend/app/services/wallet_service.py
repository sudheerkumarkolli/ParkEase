import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.wallet import Wallet, WalletTransaction, Payment, TransactionType, TransactionStatus
from app.models.notification import Notification
from app.core.exceptions import InsufficientCreditsException, NotFoundException, BadRequestException

CREDIT_PACKAGES = [
    {"id": "starter", "name": "Starter", "credits": 100, "price_inr": 100.0, "popular": False, "badge": "Essential"},
    {"id": "standard", "name": "Standard", "credits": 500, "price_inr": 450.0, "popular": True, "badge": "Most Popular (10% Off)"},
    {"id": "premium", "name": "Premium", "credits": 1000, "price_inr": 850.0, "popular": False, "badge": "Best Value (15% Off)"},
    {"id": "pro", "name": "Pro", "credits": 2500, "price_inr": 2000.0, "popular": False, "badge": "Mega Saver (20% Off)"},
]

def get_or_create_wallet(db: Session, user_id: int) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

def add_welcome_credits(db: Session, user_id: int, credits: int = 100) -> Wallet:
    wallet = get_or_create_wallet(db, user_id)
    wallet.balance += credits
    
    # Create transaction
    tx = WalletTransaction(
        wallet_id=wallet.id,
        type=TransactionType.WELCOME_CREDIT.value,
        credits=credits,
        description="Welcome to ParkEase! Bonus credits granted.",
        reference_id=f"WELCOME-{user_id}",
        status=TransactionStatus.COMPLETED.value
    )
    db.add(tx)
    
    # Create notification
    notif = Notification(
        user_id=user_id,
        title="Welcome Credits Added",
        message=f"🎉 {credits} welcome credits have been credited to your wallet. Happy parking!",
        type="WALLET"
    )
    db.add(notif)
    db.commit()
    db.refresh(wallet)
    return wallet

def purchase_credits(
    db: Session,
    user_id: int,
    package_name: Optional[str] = None,
    amount: Optional[int] = None,
    payment_method: str = "SIMULATED_RAZORPAY"
) -> dict:
    if amount and amount > 0:
        credits_to_add = int(amount)
        amount_paid = float(amount)
        pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
    elif package_name:
        package = next((p for p in CREDIT_PACKAGES if p["name"].lower() == package_name.lower() or p["id"] == package_name.lower()), None)
        if not package:
            # Fallback if package_name is a numeric amount
            try:
                num_amt = int(package_name)
                credits_to_add = num_amt
                amount_paid = float(num_amt)
                pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
            except ValueError:
                raise BadRequestException(f"Invalid credit package: {package_name}")
        else:
            credits_to_add = package["credits"]
            amount_paid = package["price_inr"]
            pkg_display_name = package["name"]
    else:
        # Default top-up 100 credits
        credits_to_add = 100
        amount_paid = 100.0
        pkg_display_name = "Starter Top-Up"

    wallet = get_or_create_wallet(db, user_id)

    
    tx_id = f"PAY-{uuid.uuid4().hex[:10].upper()}"
    
    # Create payment record
    payment = Payment(
        user_id=user_id,
        amount=amount_paid,
        credits=credits_to_add,
        package_name=pkg_display_name,
        payment_method=payment_method,
        transaction_id=tx_id,
        status=TransactionStatus.COMPLETED.value
    )
    db.add(payment)
    
    # Update wallet balance
    wallet.balance += credits_to_add
    
    # Create wallet transaction
    tx = WalletTransaction(
        wallet_id=wallet.id,
        type=TransactionType.CREDIT_PURCHASE.value,
        credits=credits_to_add,
        description=f"Purchased {pkg_display_name} ({credits_to_add} Credits for ₹{amount_paid})",
        reference_id=tx_id,
        status=TransactionStatus.COMPLETED.value
    )
    db.add(tx)

    
    # Create notification
    notif = Notification(
        user_id=user_id,
        title="Credits Added Successfully",
        message=f"Successfully added {credits_to_add} credits to your wallet via {payment_method}. New balance: {wallet.balance} credits.",
        type="WALLET"
    )
    db.add(notif)
    db.commit()
    db.refresh(wallet)
    
    return {
        "wallet": wallet,
        "payment": payment,
        "transaction": tx
    }

def deduct_credits(
    db: Session,
    user_id: int,
    credits: int,
    description: str,
    reference_id: str
) -> Wallet:
    wallet = get_or_create_wallet(db, user_id)
    if wallet.balance < credits:
        raise InsufficientCreditsException(
            f"You need {credits} credits, but your current balance is {wallet.balance} credits. Please add credits."
        )
    
    wallet.balance -= credits
    tx = WalletTransaction(
        wallet_id=wallet.id,
        type=TransactionType.BOOKING_PAYMENT.value,
        credits=-credits,
        description=description,
        reference_id=reference_id,
        status=TransactionStatus.COMPLETED.value
    )
    db.add(tx)
    return wallet

def refund_credits(
    db: Session,
    user_id: int,
    credits: int,
    description: str,
    reference_id: str
) -> Wallet:
    wallet = get_or_create_wallet(db, user_id)
    wallet.balance += credits
    tx = WalletTransaction(
        wallet_id=wallet.id,
        type=TransactionType.BOOKING_REFUND.value,
        credits=credits,
        description=description,
        reference_id=reference_id,
        status=TransactionStatus.COMPLETED.value
    )
    db.add(tx)
    
    notif = Notification(
        user_id=user_id,
        title="Booking Refund Processed",
        message=f"Refund of {credits} credits for {reference_id} has been added back to your wallet.",
        type="WALLET"
    )
    db.add(notif)
    return wallet
