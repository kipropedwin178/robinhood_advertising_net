from datetime import date, datetime
from decimal import Decimal
from urllib.parse import quote

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import FRONTEND_URL
from app.models.daily_task import DailyTask
from app.models.membership import Membership
from app.models.transaction import Transaction
from app.models.user import User
from app.models.wallet import Wallet


REFERRAL_COMMISSION_RATE = Decimal("0.05")


def get_release_status(released_date: str) -> str:
    """
    Determine whether a product has already been released.

    Expected format:
    - January 2026
    - September 2026
    - October 2026
    """

    try:
        release_date = datetime.strptime(
            released_date,
            "%B %Y"
        )

        current_date = datetime.now()

        release_month = (
            release_date.year * 12
            + (release_date.month - 1)
        )

        current_month = (
            current_date.year * 12
            + (current_date.month - 1)
        )

        if release_month <= current_month:
            return f"Released: {released_date}"

        return f"Expected release: {released_date}"

    except ValueError:
        return f"Release date: {released_date}"


# =========================================================
# START ADVERTISEMENT
# =========================================================

def start_advertisement(
    db: Session,
    user_id: int,
    membership_id: int
):
    """
    Mark today's advertisement as started.

    The reward is NOT given here.
    """

    membership = (
        db.query(Membership)
        .filter(
            Membership.id == membership_id,
            Membership.user_id == user_id
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )

    if not membership.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership is inactive"
        )

    if membership.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership has expired"
        )

    today = date.today()

    existing_task = (
        db.query(DailyTask)
        .filter(
            DailyTask.user_id == user_id,
            DailyTask.membership_id == membership_id,
            DailyTask.task_date == today
        )
        .first()
    )

    if existing_task and existing_task.completed_at:
        return {
            "message": "Task already completed today",
            "task_started": True,
            "task_completed_today": True
        }

    if existing_task:
        return {
            "message": "Advertisement started",
            "task_started": True,
            "task_completed_today": False
        }

    task = DailyTask(
        user_id=user_id,
        membership_id=membership_id,
        task_date=today,
        reward_amount=Decimal(
            str(membership.earnings)
        ),
        completed_at=None
    )

    db.add(task)

    db.commit()

    return {
        "message": "Advertisement started",
        "task_started": True,
        "task_completed_today": False
    }


# =========================================================
# GET ADVERTISEMENT
# =========================================================

def get_whatsapp_advertisement(
    db: Session,
    user_id: int,
    membership_id: int
):
    membership = (
        db.query(Membership)
        .filter(
            Membership.id == membership_id,
            Membership.user_id == user_id
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )

    if not membership.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership is inactive"
        )

    if membership.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership has expired"
        )

    if not membership.product_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Membership product information "
                "is unavailable"
            )
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # ---------------------------------------------------------
    # USER REFERRAL LINK
    # ---------------------------------------------------------

    frontend_url = FRONTEND_URL.rstrip("/")

    referral_link = (
        f"{frontend_url}/register"
        f"?ref={user.referral_code}"
    )

    # ---------------------------------------------------------
    # RELEASE STATUS
    # ---------------------------------------------------------

    release_status = get_release_status(
        membership.release_date or "Unknown"
    )

    # ---------------------------------------------------------
    # ADVERTISEMENT MESSAGE
    # ---------------------------------------------------------

    advertisement_message = (
        membership.advertisement_message
        or ""
    )

    message = (
        f"{advertisement_message}\n\n"
        f"🔗 Join RBH:\n"
        f"{referral_link}"
    )

    # ---------------------------------------------------------
    # WHATSAPP SHARE LINK
    # ---------------------------------------------------------

    whatsapp_link = (
        "https://wa.me/"
        f"?text={quote(message)}"
    )

    # ---------------------------------------------------------
    # CHECK TODAY'S TASK
    # ---------------------------------------------------------

    today = date.today()

    existing_task = (
        db.query(DailyTask)
        .filter(
            DailyTask.user_id == user_id,
            DailyTask.membership_id == membership_id,
            DailyTask.task_date == today
        )
        .first()
    )

    task_started = (
        existing_task is not None
    )

    task_completed_today = (
        existing_task is not None
        and existing_task.completed_at is not None
    )

    return {
        "membership_id": membership.id,
        "level": membership.level,
        "product_name": membership.product_name,
        "product_photo": membership.product_photo,
        "description": membership.description,
        "product_price": (
            float(membership.product_price)
            if membership.product_price is not None
            else None
        ),
        "release_date": membership.release_date,
        "release_status": release_status,
        "advertisement_message": advertisement_message,
        "advertisement_link": whatsapp_link,
        "message": message,
        "task_started": task_started,
        "task_completed_today": task_completed_today
    }


# =========================================================
# COMPLETE DAILY TASK
# =========================================================

def complete_daily_task(
    db: Session,
    user_id: int,
    membership_id: int
):
    # ---------------------------------------------------------
    # 1. FIND MEMBERSHIP
    # ---------------------------------------------------------

    membership = (
        db.query(Membership)
        .filter(
            Membership.id == membership_id,
            Membership.user_id == user_id
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )

    # ---------------------------------------------------------
    # 2. CHECK MEMBERSHIP STATUS
    # ---------------------------------------------------------

    if not membership.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership is inactive"
        )

    if membership.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership has expired"
        )

    # ---------------------------------------------------------
    # 3. FIND TODAY'S TASK
    # ---------------------------------------------------------

    today = date.today()

    existing_task = (
        db.query(DailyTask)
        .filter(
            DailyTask.user_id == user_id,
            DailyTask.membership_id == membership_id,
            DailyTask.task_date == today
        )
        .first()
    )

    if not existing_task:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Please click 'Advertise Now' "
                "before completing this task."
            )
        )

    # ---------------------------------------------------------
    # TASK ALREADY COMPLETED
    # ---------------------------------------------------------

    if existing_task.completed_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task already completed today"
        )

    # ---------------------------------------------------------
    # 4. GET LOCKED REWARD
    # ---------------------------------------------------------

    reward = Decimal(
        str(existing_task.reward_amount)
    ).quantize(
        Decimal("0.01")
    )

    # ---------------------------------------------------------
    # 5. LOCK USER WALLET
    # ---------------------------------------------------------

    wallet = (
        db.query(Wallet)
        .filter(
            Wallet.user_id == user_id
        )
        .with_for_update()
        .first()
    )

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )

    # ---------------------------------------------------------
    # 6. CREDIT REWARD
    # ---------------------------------------------------------

    wallet.balance += reward

    wallet.total_earned += reward

    # ---------------------------------------------------------
    # 7. MARK TASK AS COMPLETED
    # ---------------------------------------------------------

    existing_task.completed_at = datetime.utcnow()

    # ---------------------------------------------------------
    # 8. CREATE REWARD TRANSACTION
    # ---------------------------------------------------------

    task_transaction = Transaction(
        user_id=user_id,
        transaction_type="TASK_REWARD",
        amount=reward,
        description=(
            f"Daily reward for Level "
            f"{membership.level}"
        ),
        status="COMPLETED",
        reference_type="TASK",
        reference_id=existing_task.id
    )

    db.add(task_transaction)

    # ---------------------------------------------------------
    # 9. REFERRAL COMMISSION
    # ---------------------------------------------------------

    referral_commission = Decimal("0.00")

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user and user.referred_by:

        referrer_wallet = (
            db.query(Wallet)
            .filter(
                Wallet.user_id == user.referred_by
            )
            .with_for_update()
            .first()
        )

        if referrer_wallet:

            referral_commission = (
                reward * REFERRAL_COMMISSION_RATE
            ).quantize(
                Decimal("0.01")
            )

            referrer_wallet.balance += (
                referral_commission
            )

            referrer_wallet.total_earned += (
                referral_commission
            )

            referral_transaction = Transaction(
                user_id=user.referred_by,
                transaction_type=(
                    "REFERRAL_TASK_COMMISSION"
                ),
                amount=referral_commission,
                description=(
                    f"5% commission from "
                    f"{user.username}'s reward"
                ),
                status="COMPLETED",
                reference_type="REFERRAL",
                reference_id=existing_task.id
            )

            db.add(referral_transaction)

    # ---------------------------------------------------------
    # 10. SAVE EVERYTHING
    # ---------------------------------------------------------

    db.commit()

    return {
        "reward": reward,
        "referral_commission": referral_commission,
        "balance": wallet.balance,
        "total_earned": wallet.total_earned
    }