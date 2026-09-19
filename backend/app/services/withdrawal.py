from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.models.withdrawal import Withdrawal


MIN_WITHDRAWAL = Decimal("10.00")
MAX_WITHDRAWAL = Decimal("10000.00")
WITHDRAWAL_FEE = Decimal("0.00")


def create_withdrawal(
    db: Session,
    user_id: int,
    amount: Decimal,
    phone_number: str,
    payment_method: str = "MPESA"
):
    amount = Decimal(str(amount)).quantize(
        Decimal("0.01")
    )

    # ---------------------------------------------------------
    # Validate amount
    # ---------------------------------------------------------

    if amount < MIN_WITHDRAWAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Minimum withdrawal amount is "
                f"KES {MIN_WITHDRAWAL:.2f}"
            )
        )

    if amount > MAX_WITHDRAWAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Maximum withdrawal amount is "
                f"KES {MAX_WITHDRAWAL:.2f}"
            )
        )

    # ---------------------------------------------------------
    # Validate payment method
    # ---------------------------------------------------------

    payment_method = payment_method.upper().strip()

    if payment_method != "MPESA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only MPESA withdrawals are currently supported"
        )

    # ---------------------------------------------------------
    # Validate phone number
    # ---------------------------------------------------------

    phone_number = phone_number.strip()

    if not phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is required"
        )

    if len(phone_number) < 10 or len(phone_number) > 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number"
        )

    # ---------------------------------------------------------
    # Lock wallet
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
    # Check balance
    # ---------------------------------------------------------

    if wallet.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient wallet balance. "
                f"Available balance: KES "
                f"{wallet.balance:.2f}"
            )
        )

    # ---------------------------------------------------------
    # Calculate fee
    # ---------------------------------------------------------

    withdrawal_fee = WITHDRAWAL_FEE

    net_amount = (
        amount - withdrawal_fee
    )

    # ---------------------------------------------------------
    # Reserve the withdrawal amount
    # ---------------------------------------------------------

    wallet.balance -= amount

    # IMPORTANT:
    # total_withdrawn is updated when the withdrawal is
    # requested, because the amount has already been removed
    # from the available wallet balance.
    wallet.total_withdrawn += amount

    # ---------------------------------------------------------
    # Create withdrawal
    # ---------------------------------------------------------

    withdrawal = Withdrawal(
        user_id=user_id,
        amount=amount,
        withdrawal_fee=withdrawal_fee,
        net_amount=net_amount,
        payment_method=payment_method,
        phone_number=phone_number,
        status="PENDING",
        created_at=datetime.utcnow()
    )

    db.add(withdrawal)

    # Flush so withdrawal.id is available.
    db.flush()

    # ---------------------------------------------------------
    # Create PENDING transaction
    # ---------------------------------------------------------

    transaction = Transaction(
        user_id=user_id,
        transaction_type="WITHDRAWAL",
        amount=-amount,
        description=(
            f"Withdrawal via {payment_method}"
        ),
        status="PENDING",
        reference_type="WITHDRAWAL",
        reference_id=withdrawal.id,
        created_at=datetime.utcnow()
    )

    db.add(transaction)

    # ---------------------------------------------------------
    # Save everything
    # ---------------------------------------------------------

    try:

        db.commit()

        db.refresh(withdrawal)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Withdrawal could not be processed"
        )

    return withdrawal