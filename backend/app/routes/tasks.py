from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.services.task import (
    complete_daily_task,
    get_whatsapp_advertisement,
    start_advertisement
)


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


# =========================================================
# GET ADVERTISEMENT
# =========================================================

@router.get("/advertise/{membership_id}")
def get_advertisement(
    membership_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_whatsapp_advertisement(
        db=db,
        user_id=current_user.id,
        membership_id=membership_id
    )


# =========================================================
# START ADVERTISEMENT
# =========================================================
#
# This endpoint is called when the user clicks
# "Advertise Now".
#
# It does NOT give the reward.
#
# It only records that the advertisement was started.
# =========================================================

@router.post("/start/{membership_id}")
def start_task_advertisement(
    membership_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return start_advertisement(
        db=db,
        user_id=current_user.id,
        membership_id=membership_id
    )


# =========================================================
# COMPLETE TASK
# =========================================================

@router.post("/complete/{membership_id}")
def complete_task(
    membership_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = complete_daily_task(
        db=db,
        user_id=current_user.id,
        membership_id=membership_id
    )

    return {
        "message": "Task completed successfully",
        "reward": float(
            result["reward"]
        ),
        "referral_commission": float(
            result["referral_commission"]
        ),
        "balance": float(
            result["balance"]
        ),
        "total_earned": float(
            result["total_earned"]
        )
    }