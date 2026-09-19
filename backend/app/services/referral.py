from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.membership import Membership
from app.models.transaction import Transaction
from app.models.user import User


def get_referral_summary(
    db: Session,
    user_id: int
):
    # =====================================================
    # TOTAL REFERRALS
    # =====================================================

    total_referrals = (
        db.query(func.count(User.id))
        .filter(
            User.referred_by == user_id
        )
        .scalar()
    ) or 0

    # =====================================================
    # ACTIVE REFERRALS
    #
    # A referral is considered active when the referred
    # user has at least one active membership.
    # =====================================================

    active_referrals = (
        db.query(func.count(func.distinct(User.id)))
        .join(
            Membership,
            Membership.user_id == User.id
        )
        .filter(
            User.referred_by == user_id,
            Membership.is_active.is_(True)
        )
        .scalar()
    ) or 0

    # =====================================================
    # REFERRAL EARNINGS
    #
    # Includes:
    # 1. 6% first-deposit referral bonuses
    # 2. 5% daily-task referral commissions
    # =====================================================

    referral_earnings = (
        db.query(
            func.coalesce(
                func.sum(Transaction.amount),
                0
            )
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type.in_([
                "REFERRAL_DEPOSIT_BONUS",
                "REFERRAL_TASK_COMMISSION"
            ])
        )
        .scalar()
    )

    return {
        "total_referrals": int(
            total_referrals
        ),
        "active_referrals": int(
            active_referrals
        ),
        "referral_earnings": Decimal(
            str(referral_earnings)
        )
    }