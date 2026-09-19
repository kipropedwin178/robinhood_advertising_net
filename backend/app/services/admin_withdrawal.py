from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.models.wallet import Wallet
from app.models.withdrawal import Withdrawal
from app.services.audit_log import create_audit_log


# =========================================================
# GET ALL WITHDRAWALS
# =========================================================

def get_all_withdrawals(
    db: Session
):
    withdrawals = (
        db.query(Withdrawal)
        .order_by(
            Withdrawal.id.desc()
        )
        .all()
    )

    return [
        {
            "id": withdrawal.id,
            "user_id": withdrawal.user_id,
            "rbh_number": withdrawal.user.referral_code,
            "amount": withdrawal.amount,
            "withdrawal_fee": withdrawal.withdrawal_fee,
            "net_amount": withdrawal.net_amount,
            "payment_method": withdrawal.payment_method,
            "phone_number": withdrawal.phone_number,
            "status": withdrawal.status,
            "created_at": withdrawal.created_at,
            "completed_at": withdrawal.completed_at,
        }
        for withdrawal in withdrawals
    ]


# =========================================================
# GET PENDING WITHDRAWALS
# =========================================================

def get_pending_withdrawals(
    db: Session
):
    return (
        db.query(Withdrawal)
        .filter(
            Withdrawal.status == "PENDING"
        )
        .order_by(
            Withdrawal.id.asc()
        )
        .all()
    )


# =========================================================
# APPROVE WITHDRAWAL
# =========================================================

def approve_withdrawal(
    db: Session,
    withdrawal_id: int,
    admin_user_id: int,
    reason: str | None = None
):
    withdrawal = (
        db.query(Withdrawal)
        .filter(
            Withdrawal.id == withdrawal_id
        )
        .with_for_update()
        .first()
    )

    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal not found"
        )

    if withdrawal.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Withdrawal has already been "
                f"{withdrawal.status.lower()}"
            )
        )

    # ---------------------------------------------------------
    # Find the existing withdrawal transaction
    # ---------------------------------------------------------

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == withdrawal.user_id,
            Transaction.transaction_type == "WITHDRAWAL",
            Transaction.reference_type == "WITHDRAWAL",
            Transaction.reference_id == withdrawal.id
        )
        .with_for_update()
        .first()
    )

    # ---------------------------------------------------------
    # Mark withdrawal as completed
    # ---------------------------------------------------------

    withdrawal.status = "COMPLETED"
    withdrawal.completed_at = datetime.utcnow()

    # ---------------------------------------------------------
    # Update existing transaction
    # ---------------------------------------------------------

    if transaction:

        transaction.status = "COMPLETED"

        transaction.description = (
            f"Withdrawal via "
            f"{withdrawal.payment_method}"
        )

    else:

        # Fallback for withdrawals created before the
        # new transaction-reference system.
        transaction = Transaction(
            user_id=withdrawal.user_id,
            transaction_type="WITHDRAWAL",
            amount=-Decimal(
                str(withdrawal.amount)
            ),
            description=(
                f"Withdrawal via "
                f"{withdrawal.payment_method}"
            ),
            status="COMPLETED",
            reference_type="WITHDRAWAL",
            reference_id=withdrawal.id,
            created_at=datetime.utcnow()
        )

        db.add(transaction)

    # ---------------------------------------------------------
    # Audit log
    # ---------------------------------------------------------

    create_audit_log(
        db=db,
        admin_user_id=admin_user_id,
        action="APPROVE_WITHDRAWAL",
        target_user_id=withdrawal.user_id,
        old_value=(
            f"Withdrawal #{withdrawal.id}; "
            f"Status: PENDING"
        ),
        new_value=(
            f"Withdrawal #{withdrawal.id}; "
            f"Status: COMPLETED; "
            f"Amount: KES "
            f"{Decimal(str(withdrawal.amount)):.2f}; "
            f"Net amount: KES "
            f"{Decimal(str(withdrawal.net_amount)):.2f}; "
            f"Reason: {reason or 'Approved'}"
        )
    )

    try:

        db.commit()

        db.refresh(withdrawal)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Withdrawal approval failed"
        )

    return withdrawal


# =========================================================
# REJECT WITHDRAWAL
# =========================================================

def reject_withdrawal(
    db: Session,
    withdrawal_id: int,
    admin_user_id: int,
    reason: str | None = None
):
    withdrawal = (
        db.query(Withdrawal)
        .filter(
            Withdrawal.id == withdrawal_id
        )
        .with_for_update()
        .first()
    )

    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal not found"
        )

    if withdrawal.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Withdrawal has already been "
                f"{withdrawal.status.lower()}"
            )
        )

    # ---------------------------------------------------------
    # Lock user's wallet
    # ---------------------------------------------------------

    wallet = (
        db.query(Wallet)
        .filter(
            Wallet.user_id == withdrawal.user_id
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
        str(withdrawal.amount)
    ).quantize(
        Decimal("0.01")
    )

    # ---------------------------------------------------------
    # Refund wallet
    # ---------------------------------------------------------

    wallet.balance += amount

    # The amount was counted as withdrawn when the request
    # was created, so remove it when the request is rejected.
    wallet.total_withdrawn -= amount

    # ---------------------------------------------------------
    # Mark withdrawal as rejected
    # ---------------------------------------------------------

    withdrawal.status = "REJECTED"
    withdrawal.completed_at = datetime.utcnow()

    # ---------------------------------------------------------
    # Find original withdrawal transaction
    # ---------------------------------------------------------

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == withdrawal.user_id,
            Transaction.transaction_type == "WITHDRAWAL",
            Transaction.reference_type == "WITHDRAWAL",
            Transaction.reference_id == withdrawal.id
        )
        .with_for_update()
        .first()
    )

    # ---------------------------------------------------------
    # Mark original transaction as rejected
    # ---------------------------------------------------------

    if transaction:

        transaction.status = "REJECTED"

    # ---------------------------------------------------------
    # Create refund transaction
    # ---------------------------------------------------------

    refund_transaction = Transaction(
        user_id=withdrawal.user_id,
        transaction_type="WITHDRAWAL_REFUND",
        amount=amount,
        description="Withdrawal refund",
        status="COMPLETED",
        reference_type="WITHDRAWAL",
        reference_id=withdrawal.id,
        created_at=datetime.utcnow()
    )

    db.add(refund_transaction)

    # ---------------------------------------------------------
    # Audit log
    # ---------------------------------------------------------

    create_audit_log(
        db=db,
        admin_user_id=admin_user_id,
        action="REJECT_WITHDRAWAL",
        target_user_id=withdrawal.user_id,
        old_value=(
            f"Withdrawal #{withdrawal.id}; "
            f"Status: PENDING"
        ),
        new_value=(
            f"Withdrawal #{withdrawal.id}; "
            f"Status: REJECTED; "
            f"Refund: KES {amount:.2f}; "
            f"Reason: {reason or 'Rejected'}"
        )
    )

    try:

        db.commit()

        db.refresh(withdrawal)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Withdrawal rejection failed"
        )

    return withdrawal