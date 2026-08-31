from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, RefreshToken, UserRole
from app.core.security import decode_access_token, verify_password, get_password_hash
from app.core.exceptions import UnauthorizedException, ForbiddenException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Authentication token required")
    
    payload = decode_access_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired authentication token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise UnauthorizedException("User not found")
    
    if not user.is_active:
        raise ForbiddenException("User account is suspended")
    
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise ForbiddenException("User account is inactive")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise ForbiddenException(
                f"Access forbidden: requires one of {self.allowed_roles} role, current role: {current_user.role}"
            )
        return current_user

require_admin = RoleChecker([UserRole.ADMIN.value])
require_manager_or_admin = RoleChecker([UserRole.PARKING_MANAGER.value, UserRole.ADMIN.value])
require_user = RoleChecker([UserRole.USER.value, UserRole.PARKING_MANAGER.value, UserRole.ADMIN.value])
