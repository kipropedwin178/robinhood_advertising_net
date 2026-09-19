
from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models.user import User


def require_admin(
    current_user: User = Depends(get_current_user)
):
    allowed_roles = [
        "ADMIN",
        "SUPER_ADMIN"
    ]

    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user


def require_super_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )

    return current_user
