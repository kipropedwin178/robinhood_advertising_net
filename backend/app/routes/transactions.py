from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionResponse


router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"]
)


@router.get(
    "/my",
    response_model=list[TransactionResponse]
)
def get_my_transactions(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id ==
            current_user.id
        )
        .order_by(
            Transaction.created_at.desc(),
            Transaction.id.desc()
        )
        .all()
    )

    return transactions