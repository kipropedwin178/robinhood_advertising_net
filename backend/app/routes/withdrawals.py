from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.models.withdrawal import Withdrawal
from app.schemas.withdrawal import (
    WithdrawalCreate,
    WithdrawalResponse,
)
from app.services.withdrawal import create_withdrawal


router = APIRouter(
    prefix="/api/withdrawals",
    tags=["Withdrawals"]
)


# =========================================================
# CREATE WITHDRAWAL
# =========================================================

@router.post(
    "",
    response_model=WithdrawalResponse,
    status_code=status.HTTP_201_CREATED
)
def request_withdrawal(
    withdrawal_data: WithdrawalCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    withdrawal = create_withdrawal(
        db=db,
        user_id=current_user.id,
        amount=withdrawal_data.amount,
        phone_number=withdrawal_data.phone_number,
        payment_method=withdrawal_data.payment_method
    )

    return withdrawal


# =========================================================
# GET MY WITHDRAWALS
# =========================================================

@router.get(
    "",
    response_model=list[WithdrawalResponse]
)
def get_my_withdrawals(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    withdrawals = (
        db.query(Withdrawal)
        .filter(
            Withdrawal.user_id ==
            current_user.id
        )
        .order_by(
            Withdrawal.id.desc()
        )
        .all()
    )

    return withdrawals