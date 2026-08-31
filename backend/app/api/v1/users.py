from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import get_current_active_user
from app.services.wallet_service import get_or_create_wallet
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, current_user.id)
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "vehicle_number": current_user.vehicle_number,
        "vehicle_type": current_user.vehicle_type,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "wallet_balance": wallet.balance
    }

@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone is not None:
        current_user.phone = req.phone
    if req.vehicle_number is not None:
        current_user.vehicle_number = req.vehicle_number.upper()
    if req.vehicle_type is not None:
        current_user.vehicle_type = req.vehicle_type
    if req.password:
        current_user.password_hash = get_password_hash(req.password)

    db.commit()
    db.refresh(current_user)

    wallet = get_or_create_wallet(db, current_user.id)
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "vehicle_number": current_user.vehicle_number,
        "vehicle_type": current_user.vehicle_type,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "wallet_balance": wallet.balance
    }
