from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import FRONTEND_URL
from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.services.referral import get_referral_summary


router = APIRouter(
    prefix="/api/referrals",
    tags=["Referrals"]
)


@router.get("/summary")
def referral_summary(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    summary = get_referral_summary(
        db=db,
        user_id=current_user.id
    )

    return {
        "total_referrals": summary[
            "total_referrals"
        ],
        "active_referrals": summary[
            "active_referrals"
        ],
        "referral_earnings": float(
            summary["referral_earnings"]
        )
    }


@router.get("/link")
def get_referral_link(
    current_user: User = Depends(
        get_current_user
    )
):
    return {
        "referral_code": current_user.referral_code,
        "referral_link":
            f"{FRONTEND_URL}/register?ref={current_user.referral_code}"
    }