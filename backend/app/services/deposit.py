from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.deposit import Deposit
from app.models.transaction import Transaction
from app.models.user import User


def create_deposit(
    db: Session,
    user_id: int,
    amount: Decimal,
    payment_method: str = "MPESA"
):
    """
    Create a PENDING deposit request.

    The user's wallet is NOT credited here.

    The wallet is credited only after an admin
    approves the deposit.
    """

    amount = Decimal(str(amount)).quantize(
        Decimal("0.01")
    )

    if amount <= Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit amount must be greater than zero"
        )

    payment_method = payment_method.upper().strip()

    if payment_method != "MPESA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only MPESA deposits are currently supported"
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
    # Create deposit request
    # ---------------------------------------------------------

    deposit = Deposit(
        user_id=user_id,
        amount=amount,
        payment_method=payment_method,
        status="PENDING",
        created_at=datetime.utcnow()
    )

    db.add(deposit)

    # Flush so the deposit receives its ID before creating
    # the related transaction.
    db.flush()

    # ---------------------------------------------------------
    # Create pending transaction
    # ---------------------------------------------------------

    transaction = Transaction(
        user_id=user_id,
        transaction_type="DEPOSIT",
        amount=amount,
        description="Deposit via MPESA",
        status="PENDING",
        reference_type="DEPOSIT",
        reference_id=deposit.id,
        created_at=datetime.utcnow()
    )

    db.add(transaction)

    try:
        db.commit()

        db.refresh(deposit)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deposit request could not be created"
        )

    return {
        "deposit": deposit,
        "referral_bonus": Decimal("0.00"),
        "is_first_deposit": False
    }