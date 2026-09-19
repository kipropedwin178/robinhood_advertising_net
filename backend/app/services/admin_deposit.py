from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.deposit import Deposit
from app.models.transaction import Transaction
from app.models.user import User
from app.models.wallet import Wallet
from app.services.audit_log import create_audit_log


# =========================================================
# GET ALL DEPOSITS
# =========================================================

def get_all_deposits(
    db: Session
):
    deposits = (
        db.query(Deposit)
        .order_by(Deposit.id.desc())
        .all()
    )

    return [
        {
            "id": deposit.id,
            "user_id": deposit.user_id,
            "rbh_number": deposit.user.referral_code,
            "amount": deposit.amount,
            "payment_method": deposit.payment_method,
            "status": deposit.status,
            "created_at": deposit.created_at,
        }
        for deposit in deposits
    ]


# =========================================================
# GET PENDING DEPOSITS
# =========================================================

def get_pending_deposits(
    db: Session
):
    return (
        db.query(Deposit)
        .filter(
            Deposit.status == "PENDING"
        )
        .order_by(Deposit.id.asc())
        .all()
    )


# =========================================================
# APPROVE DEPOSIT
# =========================================================

def approve_deposit(
    db: Session,
    deposit_id: int,
    admin_user_id: int,
    reason: str | None = None
):
    deposit = (
        db.query(Deposit)
        .filter(
            Deposit.id == deposit_id
        )
        .with_for_update()
        .first()
    )

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    if deposit.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Deposit has already been "
                f"{deposit.status.lower()}"
            )
        )

    user = (
        db.query(User)
        .filter(
            User.id == deposit.user_id
        )
        .with_for_update()
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    wallet = (
        db.query(Wallet)
        .filter(
            Wallet.user_id == deposit.user_id
        )
        .with_for_update()
        .first()
    )

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User wallet not found"
        )

    amount = Decimal(
        str(deposit.amount)
    ).quantize(
        Decimal("0.01")
    )

    # ---------------------------------------------------------
    # Check whether this is the user's first completed deposit
    # ---------------------------------------------------------

    previous_completed_deposit = (
        db.query(Deposit)
        .filter(
            Deposit.user_id == deposit.user_id,
            Deposit.status == "COMPLETED",
            Deposit.id != deposit.id
        )
        .first()
    )

    is_first_deposit = (
        previous_completed_deposit is None
    )

    # ---------------------------------------------------------
    # Wallet balance before approval
    # ---------------------------------------------------------

    old_balance = Decimal(
        str(wallet.balance)
    )

    # ---------------------------------------------------------
    # Credit user's wallet
    # ---------------------------------------------------------

    wallet.balance += amount

    # ---------------------------------------------------------
    # Mark deposit as completed
    # ---------------------------------------------------------

    deposit.status = "COMPLETED"
    deposit.completed_at = datetime.utcnow()

    # ---------------------------------------------------------
    # Find the EXISTING pending deposit transaction
    # ---------------------------------------------------------

    deposit_transaction = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == deposit.user_id,
            Transaction.transaction_type == "DEPOSIT",
            Transaction.reference_type == "DEPOSIT",
            Transaction.reference_id == deposit.id
        )
        .with_for_update()
        .first()
    )

    # ---------------------------------------------------------
    # Update existing transaction
    # ---------------------------------------------------------

    if deposit_transaction:

        deposit_transaction.status = "COMPLETED"

        deposit_transaction.description = (
            "Deposit via MPESA"
        )

    else:

        # This fallback protects deposits that were created
        # before the new transaction system was introduced.
        deposit_transaction = Transaction(
            user_id=deposit.user_id,
            transaction_type="DEPOSIT",
            amount=amount,
            description="Deposit via MPESA",
            status="COMPLETED",
            reference_type="DEPOSIT",
            reference_id=deposit.id,
            created_at=datetime.utcnow()
        )

        db.add(deposit_transaction)

    # ---------------------------------------------------------
    # Referral bonus
    # ---------------------------------------------------------

    referral_bonus = Decimal("0.00")

    if is_first_deposit and user.referred_by:

        referrer_wallet = (
            db.query(Wallet)
            .filter(
                Wallet.user_id == user.referred_by
            )
            .with_for_update()
            .first()
        )

        if referrer_wallet:

            referral_bonus = (
                amount * Decimal("0.06")
            ).quantize(
                Decimal("0.01")
            )

            referrer_wallet.balance += (
                referral_bonus
            )

            referrer_wallet.total_earned += (
                referral_bonus
            )

            referral_transaction = Transaction(
                user_id=user.referred_by,
                transaction_type="REFERRAL_DEPOSIT_BONUS",
                amount=referral_bonus,
                description=(
                    f"6% first-deposit referral bonus "
                    f"from user {user.username}"
                ),
                status="COMPLETED",
                reference_type="REFERRAL",
                reference_id=deposit.id,
                created_at=datetime.utcnow()
            )

            db.add(referral_transaction)

    # ---------------------------------------------------------
    # Audit log
    # ---------------------------------------------------------

    create_audit_log(
        db=db,
        admin_user_id=admin_user_id,
        action="APPROVE_DEPOSIT",
        target_user_id=deposit.user_id,
        old_value=(
            f"Deposit #{deposit.id}; "
            f"Status: PENDING"
        ),
        new_value=(
            f"Deposit #{deposit.id}; "
            f"Status: COMPLETED; "
            f"Amount: KES {amount:.2f}; "
            f"Wallet before: KES {old_balance:.2f}; "
            f"Wallet after: KES "
            f"{Decimal(str(wallet.balance)):.2f}; "
            f"Referral bonus: KES "
            f"{referral_bonus:.2f}; "
            f"Reason: {reason or 'Approved'}"
        )
    )

    try:

        db.commit()

        db.refresh(deposit)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deposit approval failed"
        )

    return {
        "deposit": deposit,
        "referral_bonus": referral_bonus,
        "is_first_deposit": is_first_deposit
    }


# =========================================================
# REJECT DEPOSIT
# =========================================================

def reject_deposit(
    db: Session,
    deposit_id: int,
    admin_user_id: int,
    reason: str | None = None
):
    deposit = (
        db.query(Deposit)
        .filter(
            Deposit.id == deposit_id
        )
        .with_for_update()
        .first()
    )

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    if deposit.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Deposit has already been "
                f"{deposit.status.lower()}"
            )
        )

    # ---------------------------------------------------------
    # Mark deposit as rejected
    # ---------------------------------------------------------

    deposit.status = "REJECTED"
    deposit.completed_at = datetime.utcnow()

    # ---------------------------------------------------------
    # Update existing pending transaction
    # ---------------------------------------------------------

    deposit_transaction = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == deposit.user_id,
            Transaction.transaction_type == "DEPOSIT",
            Transaction.reference_type == "DEPOSIT",
            Transaction.reference_id == deposit.id
        )
        .with_for_update()
        .first()
    )

    if deposit_transaction:

        deposit_transaction.status = "REJECTED"

    # ---------------------------------------------------------
    # Audit log
    # ---------------------------------------------------------

    create_audit_log(
        db=db,
        admin_user_id=admin_user_id,
        action="REJECT_DEPOSIT",
        target_user_id=deposit.user_id,
        old_value=(
            f"Deposit #{deposit.id}; "
            f"Status: PENDING"
        ),
        new_value=(
            f"Deposit #{deposit.id}; "
            f"Status: REJECTED; "
            f"Amount: KES "
            f"{Decimal(str(deposit.amount)):.2f}; "
            f"Reason: {reason or 'Rejected'}"
        )
    )

    try:

        db.commit()

        db.refresh(deposit)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deposit rejection failed"
        )

    return deposit