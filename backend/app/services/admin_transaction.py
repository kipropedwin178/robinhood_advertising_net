from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def get_all_transactions(
    db: Session
):
    return (
        db.query(Transaction)
        .order_by(Transaction.id.desc())
        .all()
    )


def get_user_transactions(
    db: Session,
    user_id: int
):
    return (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id
        )
        .order_by(Transaction.id.desc())
        .all()
    )