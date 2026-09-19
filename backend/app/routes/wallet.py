from datetime import datetime, time
from decimal import Decimal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.models.wallet import Wallet
from app.models.withdrawal import Withdrawal


router = APIRouter(
    prefix="/api/wallet",
    tags=["Wallet"]
)


KENYA_TIMEZONE = ZoneInfo("Africa/Nairobi")


def get_today_utc_range():
    """
    Return today's Kenya-time range converted to
    naive UTC datetimes.

    Database timestamps are stored as naive UTC
    datetime values.
    """

    now_kenya = datetime.now(
        KENYA_TIMEZONE
    )

    today_kenya = now_kenya.date()

    start_kenya = datetime.combine(
        today_kenya,
        time.min,
        tzinfo=KENYA_TIMEZONE
    )

    tomorrow_kenya = (
        today_kenya
        .fromordinal(today_kenya.toordinal() + 1)
    )

    end_kenya = datetime.combine(
        tomorrow_kenya,
        time.min,
        tzinfo=KENYA_TIMEZONE
    )

    start_utc = (
        start_kenya
        .astimezone(ZoneInfo("UTC"))
        .replace(tzinfo=None)
    )

    end_utc = (
        end_kenya
        .astimezone(ZoneInfo("UTC"))
        .replace(tzinfo=None)
    )

    return start_utc, end_utc


@router.get("")
def get_my_wallet(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    # =====================================================
    # GET WALLET
    # =====================================================

    wallet = (
        db.query(Wallet)
        .filter(
            Wallet.user_id == current_user.id
        )
        .first()
    )

    if not wallet:
        return {
            "balance": 0.00,
            "total_earned": 0.00,
            "total_withdrawn": 0.00,
            "today_income": 0.00,
            "today_withdrawals": 0.00
        }

    # =====================================================
    # TODAY'S DATE RANGE
    # KENYA TIME -> UTC
    # =====================================================

    start_utc, end_utc = (
        get_today_utc_range()
    )

    # =====================================================
    # TODAY'S INCOME
    #
    # Only completed earning transactions count.
    #
    # TASK_REWARD
    # REFERRAL_TASK_COMMISSION
    # REFERRAL_DEPOSIT_BONUS
    # =====================================================

    today_income = (
        db.query(
            Transaction.amount
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type.in_([
                "TASK_REWARD",
                "REFERRAL_TASK_COMMISSION",
                "REFERRAL_DEPOSIT_BONUS"
            ]),
            Transaction.status == "COMPLETED",
            Transaction.created_at >= start_utc,
            Transaction.created_at < end_utc
        )
        .all()
    )

    today_income_total = sum(
        (
            Decimal(str(row[0]))
            for row in today_income
        ),
        Decimal("0.00")
    )

    # =====================================================
    # TODAY'S WITHDRAWALS
    #
    # Only COMPLETED withdrawals count.
    # =====================================================

    today_withdrawals = (
        db.query(
            Withdrawal.amount
        )
        .filter(
            Withdrawal.user_id == current_user.id,
            Withdrawal.status == "COMPLETED",
            Withdrawal.created_at >= start_utc,
            Withdrawal.created_at < end_utc
        )
        .all()
    )

    today_withdrawals_total = sum(
        (
            Decimal(str(row[0]))
            for row in today_withdrawals
        ),
        Decimal("0.00")
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "balance": float(
            wallet.balance
        ),
        "total_earned": float(
            wallet.total_earned
        ),
        "total_withdrawn": float(
            wallet.total_withdrawn
        ),
        "today_income": float(
            today_income_total
        ),
        "today_withdrawals": float(
            today_withdrawals_total
        )
    }