from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.wallet import Wallet


def add_wallet_transaction(
    db: Session,
    user_id: int,
    amount: Decimal,
    transaction_type: str,
    description: str
):
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

    amount = Decimal(
        str(amount)
    ).quantize(
        Decimal("0.01")
    )

    if (
        amount < 0
        and wallet.balance + amount < 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient wallet balance"
        )

    wallet.balance += amount

    if amount > 0:
        wallet.total_earned += amount

    transaction = Transaction(
        user_id=user_id,
        transaction_type=transaction_type,
        amount=amount,
        description=description,
        status="COMPLETED"
    )

    db.add(transaction)

    db.commit()

    db.refresh(transaction)

    return transaction