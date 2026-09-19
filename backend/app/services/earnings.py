from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.transaction import Transaction


EARNING_TRANSACTION_TYPES = [
    "TASK_REWARD",
    "REFERRAL_DEPOSIT_BONUS",
    "REFERRAL_TASK_COMMISSION",
]


def get_lifetime_earnings(
    db: Session,
    user_id: int
):
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type.in_(
                EARNING_TRANSACTION_TYPES
            ),
            Transaction.status == "COMPLETED",
        )
        .order_by(
            Transaction.created_at.asc(),
            Transaction.id.asc()
        )
        .all()
    )

    cumulative = Decimal("0.00")
    earnings = []

    for transaction in transactions:
        cumulative += Decimal(
            str(transaction.amount)
        )

        earnings.append({
            "date": transaction.created_at,
            "amount": float(
                transaction.amount
            ),
            "cumulative": float(
                cumulative
            ),
        })

    return earnings