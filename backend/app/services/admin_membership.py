from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.membership_level import MembershipLevel
from app.schemas.admin_membership import (
    AdminMembershipLevelCreate,
    AdminMembershipLevelUpdate,
)


def get_all_membership_levels(
    db: Session
):
    return (
        db.query(MembershipLevel)
        .filter(
            MembershipLevel.is_deleted == False
        )
        .order_by(MembershipLevel.level)
        .all()
    )


def get_membership_level(
    db: Session,
    level: int
):
    membership_level = (
        db.query(MembershipLevel)
        .filter(
            MembershipLevel.level == level,
            MembershipLevel.is_deleted == False
        )
        .first()
    )

    if not membership_level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership level not found"
        )

    return membership_level


def create_membership_level(
    db: Session,
    data: AdminMembershipLevelCreate
):
    # ---------------------------------------------------------
    # 1. Check level range
    # ---------------------------------------------------------

    if data.level < 1 or data.level > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership level must be between 1 and 12"
        )

    # ---------------------------------------------------------
    # 2. Check whether this level already exists
    # ---------------------------------------------------------
    #
    # If the level exists but was soft-deleted, we restore and
    # reuse that database row instead of creating a duplicate.
    #

    existing_level = (
        db.query(MembershipLevel)
        .filter(
            MembershipLevel.level == data.level
        )
        .first()
    )

    if existing_level:

        # -----------------------------------------------------
        # Level exists and is still active/visible
        # -----------------------------------------------------

        if not existing_level.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Membership Level {data.level} "
                    f"already exists"
                )
            )

        # -----------------------------------------------------
        # Level was soft-deleted.
        #
        # Restore the existing row and replace its information.
        # -----------------------------------------------------

        existing_level.product_name = data.product_name
        existing_level.product_photo = data.product_photo
        existing_level.description = data.description
        existing_level.product_price = data.product_price
        existing_level.release_date = data.release_date
        existing_level.activation_fee = data.activation_fee
        existing_level.daily_reward = data.daily_reward
        existing_level.cycle_days = data.cycle_days
        existing_level.advertisement_message = (
            data.advertisement_message
        )

        existing_level.is_active = True
        existing_level.is_deleted = False

        db.commit()
        db.refresh(existing_level)

        return existing_level

    # ---------------------------------------------------------
    # 3. Create a completely new membership level
    # ---------------------------------------------------------

    membership_level = MembershipLevel(
        level=data.level,
        product_name=data.product_name,
        product_photo=data.product_photo,
        description=data.description,
        product_price=data.product_price,
        release_date=data.release_date,
        activation_fee=data.activation_fee,
        daily_reward=data.daily_reward,
        cycle_days=data.cycle_days,
        advertisement_message=data.advertisement_message,
        is_active=True,
        is_deleted=False
    )

    db.add(membership_level)
    db.commit()
    db.refresh(membership_level)

    return membership_level


def update_membership_level(
    db: Session,
    level: int,
    data: AdminMembershipLevelUpdate
):
    membership_level = get_membership_level(
        db=db,
        level=level
    )

    # ---------------------------------------------------------
    # Update only fields actually supplied by the admin
    # ---------------------------------------------------------

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            membership_level,
            field,
            value
        )

    db.commit()
    db.refresh(membership_level)

    return membership_level


def deactivate_membership_level(
    db: Session,
    level: int
):
    membership_level = get_membership_level(
        db=db,
        level=level
    )

    membership_level.is_active = False

    db.commit()
    db.refresh(membership_level)

    return membership_level


def activate_membership_level(
    db: Session,
    level: int
):
    membership_level = get_membership_level(
        db=db,
        level=level
    )

    membership_level.is_active = True

    db.commit()
    db.refresh(membership_level)

    return membership_level


def delete_membership_level(
    db: Session,
    level: int
):
    membership_level = get_membership_level(
        db=db,
        level=level
    )

    # ---------------------------------------------------------
    # Soft delete
    # ---------------------------------------------------------

    membership_level.is_deleted = True
    membership_level.is_active = False

    db.commit()
    db.refresh(membership_level)

    return membership_level