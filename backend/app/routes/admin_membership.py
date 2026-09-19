from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.admin_dependencies import require_admin
from app.database.connection import get_db
from app.models.user import User
from app.schemas.admin_membership import (
    AdminMembershipLevelCreate,
    AdminMembershipLevelResponse,
    AdminMembershipLevelUpdate,
)
from app.services.admin_membership import (
    activate_membership_level,
    create_membership_level,
    deactivate_membership_level,
    delete_membership_level,
    get_all_membership_levels,
    get_membership_level,
    update_membership_level,
)


router = APIRouter(
    prefix="/api/edutech/memberships",
    tags=["Admin Memberships"]
)


@router.get(
    "/",
    response_model=list[AdminMembershipLevelResponse]
)
def list_membership_levels(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_all_membership_levels(db=db)


@router.get(
    "/{level}",
    response_model=AdminMembershipLevelResponse
)
def get_membership_level_details(
    level: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_membership_level(
        db=db,
        level=level
    )


@router.post(
    "/",
    response_model=AdminMembershipLevelResponse,
    status_code=status.HTTP_201_CREATED
)
def create_membership(
    data: AdminMembershipLevelCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return create_membership_level(
        db=db,
        data=data
    )


@router.put(
    "/{level}",
    response_model=AdminMembershipLevelResponse
)
def update_membership(
    level: int,
    data: AdminMembershipLevelUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return update_membership_level(
        db=db,
        level=level,
        data=data
    )


@router.patch(
    "/{level}/deactivate",
    response_model=AdminMembershipLevelResponse
)
def deactivate_membership(
    level: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return deactivate_membership_level(
        db=db,
        level=level
    )


@router.patch(
    "/{level}/activate",
    response_model=AdminMembershipLevelResponse
)
def activate_membership(
    level: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return activate_membership_level(
        db=db,
        level=level
    )


@router.delete(
    "/{level}",
    response_model=AdminMembershipLevelResponse
)
def delete_membership(
    level: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return delete_membership_level(
        db=db,
        level=level
    )