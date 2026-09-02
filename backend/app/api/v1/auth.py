import uuid
import random
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, RefreshToken, EmailOTP, UserRole
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.core.config import settings
from app.core.exceptions import BadRequestException, UnauthorizedException, ConflictException
from app.services.wallet_service import add_welcome_credits, get_or_create_wallet
from app.services.auth_service import get_current_user
from app.services.email_service import send_email_otp
from app.database.mongodb import get_users_collection, get_otps_collection


logger = logging.getLogger(__name__)

router = APIRouter()


# In-memory token store for dev password resets (or can use DB/Redis)
PASSWORD_RESET_TOKENS = {}

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise BadRequestException("Passwords do not match")
    
    email_clean = req.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise ConflictException("An account with this email already exists")

    # If OTP is provided, verify it against the EmailOTP table
    if req.otp:
        otp_record = db.query(EmailOTP).filter(
            EmailOTP.email == email_clean,
            EmailOTP.otp_code == req.otp.strip(),
            EmailOTP.is_used == False
        ).order_by(EmailOTP.created_at.desc()).first()

        if not otp_record:
            raise UnauthorizedException("Invalid email verification code. Please check and try again.")

        if otp_record.expires_at < datetime.utcnow():
            otp_record.is_used = True
            db.commit()
            raise UnauthorizedException("Verification code has expired. Please request a new code.")

        otp_record.is_used = True
        db.commit()

    # Determine user role based on role_token
    assigned_role = UserRole.USER.value
    if req.role_token:
        token_clean = req.role_token.strip().upper()
        if token_clean in ["ADMIN", "ADMIN2026", "ADMIN-SECRET", "ADMIN-TOKEN", "ADMIN-SECRET-2026"]:
            assigned_role = UserRole.ADMIN.value
        elif token_clean in ["MANAGER", "MANAGER2026", "MANAGER-HUB", "MANAGER-TOKEN", "MANAGER-HUB-2026", "PARKING_MANAGER"]:
            assigned_role = UserRole.PARKING_MANAGER.value
        else:
            assigned_role = UserRole.USER.value

    # Create User
    new_user = User(
        full_name=req.full_name,
        email=email_clean,
        phone=req.phone,
        password_hash=get_password_hash(req.password),
        role=assigned_role,
        vehicle_number=req.vehicle_number.upper() if req.vehicle_number else None,
        vehicle_type=req.vehicle_type or "Car",
        is_active=True
    )
    db.add(new_user)

    db.commit()
    db.refresh(new_user)

    # Add 100 Welcome credits & create initial wallet
    wallet = add_welcome_credits(db, new_user.id, credits=settings.WELCOME_CREDITS)

    # Issue Tokens
    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    refresh_token = create_refresh_token(subject=new_user.id)

    # Store refresh token
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(user_id=new_user.id, token=refresh_token, expires_at=expires_at)
    db.add(db_refresh)
    db.commit()

    user_data = {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "role": new_user.role,
        "phone": new_user.phone,
        "vehicle_number": new_user.vehicle_number,
        "vehicle_type": new_user.vehicle_type,
        "wallet_balance": wallet.balance
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled. Please contact support.")

    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)

    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at)
    db.add(db_refresh)
    db.commit()

    wallet = get_or_create_wallet(db, user.id)

    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "vehicle_number": user.vehicle_number,
        "vehicle_type": user.vehicle_type,
        "wallet_balance": wallet.balance
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/refresh")
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_refresh_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid refresh token")

    user_id = payload.get("sub")
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == req.refresh_token,
        RefreshToken.revoked == False
    ).first()

    if not db_token or db_token.expires_at < datetime.utcnow():
        raise UnauthorizedException("Refresh token has expired or been revoked")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise UnauthorizedException("User account is inactive or not found")

    new_access_token = create_access_token(subject=user.id, role=user.role)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(req: RefreshRequest, db: Session = Depends(get_db)):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == req.refresh_token).first()
    if db_token:
        db_token.revoked = True
        db.commit()
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid user enumeration by returning standard success message
        return {"message": "If this email is registered, a password reset token has been generated."}

    token = f"RST-{uuid.uuid4().hex[:8].upper()}"
    PASSWORD_RESET_TOKENS[req.email.lower()] = {
        "token": token,
        "expires_at": datetime.utcnow() + timedelta(minutes=30)
    }

    print("\n" + "="*60)
    print(f"[DEV PASSWORD RESET] Email: {req.email} | Token: {token}")
    print("="*60 + "\n")

    return {
        "message": "Password reset token generated. Check console for development token.",
        "dev_token": token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = PASSWORD_RESET_TOKENS.get(req.email.lower())
    if not record or record["token"] != req.reset_token:
        raise BadRequestException("Invalid reset token or email")

    if record["expires_at"] < datetime.utcnow():
        del PASSWORD_RESET_TOKENS[req.email.lower()]
        raise BadRequestException("Reset token has expired")

    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise BadRequestException("User not found")

    user.password_hash = get_password_hash(req.new_password)
    db.commit()

    del PASSWORD_RESET_TOKENS[req.email.lower()]
    return {"message": "Password reset successfully. You can now log in with your new password."}

@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    
    # Generate 6-digit numeric OTP code
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate prior unused OTPs for this email
    db.query(EmailOTP).filter(
        EmailOTP.email == email_clean,
        EmailOTP.is_used == False
    ).update({"is_used": True})

    # Store OTP in database
    otp_record = EmailOTP(
        email=email_clean,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    # Sync to MongoDB database
    try:
        mongo_otps = get_otps_collection()
        if mongo_otps is not None:
            mongo_otps.update_many({"email": email_clean, "is_used": False}, {"$set": {"is_used": True}})
            mongo_otps.insert_one({
                "email": email_clean,
                "otp_code": otp_code,
                "expires_at": expires_at,
                "is_used": False,
                "created_at": datetime.utcnow()
            })
    except Exception as me:
        logger.warning(f"MongoDB OTP sync notice: {me}")

    # Dispatch OTP directly to user's real email inbox
    email_sent = send_email_otp(email_clean, otp_code)

    # High-visibility terminal output for the OTP code
    print("\n" + "#"*64)
    print("  >>> REAL-TIME EMAIL VERIFICATION CODE (OTP) <<<")
    print(f"  Target User Email : {email_clean}")
    print(f"  6-DIGIT OTP CODE  : >>> [ {otp_code} ] <<<")
    print(f"  Email Delivered   : {'YES (Sent to inbox)' if email_sent else 'NO (Check SMTP config)'}")
    print(f"  Expiration Time   : {expires_at.strftime('%Y-%m-%d %H:%M:%S')} UTC (10 mins)")
    print("#"*64 + "\n", flush=True)

    return {
        "message": f"Verification code sent to {email_clean}",
        "email": email_clean,
        "dev_otp": None
    }




@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    code_clean = req.otp.strip()

    # Verify against Database
    otp_record = db.query(EmailOTP).filter(
        EmailOTP.email == email_clean,
        EmailOTP.otp_code == code_clean,
        EmailOTP.is_used == False
    ).order_by(EmailOTP.created_at.desc()).first()

    if not otp_record:
        raise UnauthorizedException("Invalid verification code. Please check and try again.")

    if otp_record.expires_at < datetime.utcnow():
        otp_record.is_used = True
        db.commit()
        raise UnauthorizedException("Verification code has expired. Please request a new code.")

    # Mark OTP as used
    otp_record.is_used = True
    db.commit()

    # Look up user or auto-provision if not existing
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        # Auto-provision user account for email-first login
        name_part = email_clean.split("@")[0].replace(".", " ").replace("_", " ").title()
        user = User(
            full_name=name_part or "ParkEase User",
            email=email_clean,
            password_hash=get_password_hash(uuid.uuid4().hex),
            role=UserRole.USER.value,
            vehicle_type="Car",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Give welcome credits & wallet
        wallet = add_welcome_credits(db, user.id, credits=settings.WELCOME_CREDITS)
    else:
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled. Please contact support.")
        wallet = get_or_create_wallet(db, user.id)

    # Issue JWT tokens
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)

    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at)
    db.add(db_refresh)
    db.commit()

    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "vehicle_number": user.vehicle_number,
        "vehicle_type": user.vehicle_type,
        "wallet_balance": wallet.balance
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }


@router.get("/me")
def get_current_authenticated_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, current_user.id)
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "phone": current_user.phone,
        "vehicle_number": current_user.vehicle_number,
        "vehicle_type": current_user.vehicle_type,
        "is_active": current_user.is_active,
        "wallet_balance": wallet.balance,
        "created_at": current_user.created_at
    }


