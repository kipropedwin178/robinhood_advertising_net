from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.daily_task import DailyTask
from app.models.membership import Membership
from app.models.membership_level import MembershipLevel
from app.models.user import User
from app.schemas.membership import MembershipResponse
from app.services.membership import activate_membership


router = APIRouter(
    prefix="/api/memberships",
    tags=["Memberships"]
)

# =========================================================
# AVAILABLE MEMBERSHIP LEVELS
# =========================================================

@router.get("/levels")
def get_available_membership_levels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership_levels = (
        db.query(MembershipLevel)
        .filter(
            MembershipLevel.is_active == True,
            MembershipLevel.is_deleted == False
        )
        .order_by(MembershipLevel.level)
        .all()
    )

    # Get memberships currently active for this user.
    # Expired memberships are treated as available again.
    now = datetime.utcnow()

    user_memberships = (
        db.query(Membership)
        .filter(
            Membership.user_id == current_user.id,
            Membership.is_active == True,
            Membership.expires_at > now
        )
        .all()
    )

    activated_levels = {
        membership.level
        for membership in user_memberships
    }

    return [
        {
            "id": membership.id,
            "level": membership.level,
            "product_name": membership.product_name,
            "product_photo": membership.product_photo,
            "description": membership.description,
            "product_price": float(
                membership.product_price
            ),
            "release_date": membership.release_date,
            "activation_fee": float(
                membership.activation_fee
            ),
            "daily_reward": float(
                membership.daily_reward
            ),
            "cycle_days": membership.cycle_days,
            "advertisement_message": (
                membership.advertisement_message
            ),
            "advertisement_link": (
                membership.advertisement_link
            ),

            # User-specific activation status
            "is_activated": membership.level in activated_levels,
        }
        for membership in membership_levels
    ]
# =========================================================
# ACTIVATE MEMBERSHIP
# =========================================================

@router.post("/activate/{level}")
def activate_user_membership(
    level: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership = activate_membership(
        db=db,
        user_id=current_user.id,
        level=level
    )

    return {
        "message": "Membership activated successfully",
        "membership": {
            "id": membership.id,
            "user_id": membership.user_id,
            "level": membership.level,
            "name": membership.product_name,
            "description": membership.description,
            "price": (
                float(membership.product_price)
                if membership.product_price is not None
                else None
            ),
            "released_date": membership.release_date,
            "activation_fee": float(
                membership.activation_fee
            ),
            "daily_reward": float(
                membership.earnings
            ),
            "started_at": membership.started_at,
            "expires_at": membership.expires_at,
            "is_active": membership.is_active
        }
    }


# =========================================================
# USER'S MEMBERSHIPS
# =========================================================

@router.get(
    "/my",
    response_model=list[MembershipResponse]
)
def get_my_memberships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = (
        db.query(Membership)
        .filter(
            Membership.user_id == current_user.id
        )
        .order_by(Membership.level)
        .all()
    )

    today = date.today()

    response = []

    for membership in memberships:

        task_completed = (
            db.query(DailyTask)
            .filter(
                DailyTask.membership_id == membership.id,
                DailyTask.task_date == today
            )
            .first()
            is not None
        )

        response.append(
            MembershipResponse(
                id=membership.id,
                user_id=membership.user_id,
                level=membership.level,
                name=membership.product_name or "",
                description=membership.description or "",
                price=(
                    float(membership.product_price)
                    if membership.product_price is not None
                    else 0.0
                ),
                released_date=membership.release_date or "",
                activation_fee=float(
                    membership.activation_fee
                ),
                daily_reward=float(
                    membership.earnings
                ),
                started_at=membership.started_at,
                expires_at=membership.expires_at,
                is_active=membership.is_active,
                task_completed_today=task_completed
            )
        )

    return response