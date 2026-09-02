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

def initiate_payment(
    db: Session,
    user_id: int,
    package_name: Optional[str] = None,
    amount: Optional[int] = None,
    payment_method: str = "UPI",
    parking_id: Optional[int] = None
) -> dict:
    if package_name:
        package = next((p for p in CREDIT_PACKAGES if p["name"].lower() == package_name.lower() or p["id"] == package_name.lower()), None)
        if package:
            credits_to_add = package["credits"]
            amount_paid = package["price_inr"]
            pkg_display_name = package["name"]
        elif amount and amount > 0:
            credits_to_add = int(amount)
            amount_paid = float(amount)
            pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
        else:
            try:
                num_amt = int(package_name)
                credits_to_add = num_amt
                amount_paid = float(num_amt)
                pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
            except ValueError:
                raise BadRequestException(f"Invalid credit package: {package_name}")
    elif amount and amount > 0:
        credits_to_add = int(amount)
        amount_paid = float(amount)
        pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
    else:
        credits_to_add = 100
        amount_paid = 100.0
        pkg_display_name = "Starter Top-Up"

    tx_id = f"PAY-{uuid.uuid4().hex[:10].upper()}"
    qr_token = f"UPITX-{uuid.uuid4().hex}"

    payment = Payment(
        user_id=user_id,
        amount=amount_paid,
        credits=credits_to_add,
        package_name=pkg_display_name,
        payment_method=payment_method,
        transaction_id=tx_id,
        qr_token=qr_token,
        status="PENDING_APPROVAL",
        parking_id=parking_id
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "payment": payment
    }

def verify_manager_payment(
    db: Session,
    qr_token: str,
    manager_id: int,
    manager_role: str,
    action: str = "APPROVE",
    parking_id: Optional[int] = None
) -> dict:
    from app.models.user import User, UserRole
    from datetime import datetime

    payment = db.query(Payment).filter(Payment.qr_token == qr_token).first()
    if not payment:
        payment = db.query(Payment).filter(Payment.transaction_id == qr_token).first()
    
    if not payment:
        raise NotFoundException("Payment record or QR token not found")

    if payment.status == "COMPLETED":
        return {
            "success": True,
            "message": "Payment has already been approved and credited.",
            "transaction_id": payment.transaction_id,
            "credits_added": payment.credits,
            "user_id": payment.user_id,
            "user_name": payment.user.full_name if payment.user else "User",
            "new_balance": payment.user.wallet.balance if payment.user and payment.user.wallet else 0
        }

    if action.upper() == "REJECT":
        payment.status = "REJECTED"
        payment.manager_id = manager_id
        payment.approved_at = datetime.utcnow()
        db.commit()
        return {
            "success": False,
            "message": "Payment was rejected by the manager.",
            "transaction_id": payment.transaction_id,
            "credits_added": 0,
            "user_id": payment.user_id,
            "user_name": payment.user.full_name if payment.user else "User",
            "new_balance": payment.user.wallet.balance if payment.user and payment.user.wallet else 0
        }

    # Approve payment and allocate credits
    wallet = get_or_create_wallet(db, payment.user_id)
    wallet.balance += payment.credits
    payment.status = "COMPLETED"
    payment.manager_id = manager_id
    payment.approved_at = datetime.utcnow()
    if parking_id:
        payment.parking_id = parking_id

    # Create completed wallet transaction
    tx = WalletTransaction(
        wallet_id=wallet.id,
        type=TransactionType.CREDIT_PURCHASE.value,
        credits=payment.credits,
        description=f"Payment verified by Manager #{manager_id} ({payment.package_name})",
        reference_id=payment.transaction_id,
        status=TransactionStatus.COMPLETED.value
    )
    db.add(tx)

    user = db.query(User).filter(User.id == payment.user_id).first()
    manager = db.query(User).filter(User.id == manager_id).first()
    mgr_name = manager.full_name if manager else f"Manager #{manager_id}"
    user_name = user.full_name if user else f"User #{payment.user_id}"

    # 1. Notify the User
    notif_user = Notification(
        user_id=payment.user_id,
        title="Payment Verified & Credits Added",
        message=f"✅ Your payment of ₹{payment.amount} has been verified by {mgr_name}. +{payment.credits} credits have been added to your wallet!",
        type="WALLET"
    )
    db.add(notif_user)

    # 2. Notify all Administrators
    admins = db.query(User).filter(User.role == UserRole.ADMIN.value).all()
    for admin_user in admins:
        notif_admin = Notification(
            user_id=admin_user.id,
            title="💰 Manager Payment Approval Alert",
            message=f"Manager {mgr_name} verified payment #{payment.transaction_id} of ₹{payment.amount} (+{payment.credits} credits) for user {user_name}.",
            type="SYSTEM"
        )
        db.add(notif_admin)

    db.commit()
    db.refresh(wallet)
    db.refresh(payment)

    return {
        "success": True,
        "message": f"Successfully verified payment! {payment.credits} credits allocated to {user_name}.",
        "transaction_id": payment.transaction_id,
        "credits_added": payment.credits,
        "user_id": payment.user_id,
        "user_name": user_name,
        "new_balance": wallet.balance
    }

def purchase_credits(
    db: Session,
    user_id: int,
    package_name: Optional[str] = None,
    amount: Optional[int] = None,
    payment_method: str = "SIMULATED_RAZORPAY"
) -> dict:
    if package_name:
        package = next((p for p in CREDIT_PACKAGES if p["name"].lower() == package_name.lower() or p["id"] == package_name.lower()), None)
        if package:
            credits_to_add = package["credits"]
            amount_paid = package["price_inr"]
            pkg_display_name = package["name"]
        elif amount and amount > 0:
            credits_to_add = int(amount)
            amount_paid = float(amount)
            pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
        else:
            try:
                num_amt = int(package_name)
                credits_to_add = num_amt
                amount_paid = float(num_amt)
                pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
            except ValueError:
                raise BadRequestException(f"Invalid credit package: {package_name}")
    elif amount and amount > 0:
        credits_to_add = int(amount)
        amount_paid = float(amount)
        pkg_display_name = f"Custom Recharge ({credits_to_add} Credits)"
    else:
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
