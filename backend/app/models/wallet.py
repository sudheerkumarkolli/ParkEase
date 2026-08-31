import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class TransactionType(str, enum.Enum):
    WELCOME_CREDIT = "WELCOME_CREDIT"
    CREDIT_PURCHASE = "CREDIT_PURCHASE"
    BOOKING_PAYMENT = "BOOKING_PAYMENT"
    BOOKING_REFUND = "BOOKING_REFUND"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"

class TransactionStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    PENDING = "PENDING"
    FAILED = "FAILED"

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan", order_by="desc(WalletTransaction.created_at)")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    credits = Column(Integer, nullable=False)  # positive for credits added, negative for deductions
    description = Column(String(255), nullable=True)
    reference_id = Column(String(100), nullable=True)  # booking_number or payment transaction_id
    status = Column(String(50), default="COMPLETED", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    wallet = relationship("Wallet", back_populates="transactions")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)  # Currency (e.g., INR)
    credits = Column(Integer, nullable=False)
    package_name = Column(String(50), nullable=False)
    payment_method = Column(String(50), default="SIMULATED_RAZORPAY", nullable=False)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(50), default="COMPLETED", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="payments")
