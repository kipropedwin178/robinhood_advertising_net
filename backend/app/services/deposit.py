
import logging
import smtplib
from datetime import datetime
from decimal import Decimal
from email.message import EmailMessage

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import (
    DEPOSIT_NOTIFICATION_EMAIL,
    SMTP_FROM_EMAIL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USERNAME,
)
from app.models.deposit import Deposit
from app.models.transaction import Transaction
from app.models.user import User


logger = logging.getLogger(__name__)


def _send_deposit_notification(
    username: str,
    rbh_number: str,
    amount: Decimal,
    confirmation_code: str,
    submitted_at: datetime,
    deposit_id: int,
) -> bool:
    """Send an email notification without blocking deposit creation."""

    if not all([
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USERNAME,
        SMTP_PASSWORD,
        SMTP_FROM_EMAIL,
        DEPOSIT_NOTIFICATION_EMAIL,
    ]):
        logger.warning(
            "Deposit #%s saved, but email notification is not configured.",
            deposit_id,
        )
        return False

    message = EmailMessage()
    message["Subject"] = (
        f"New M-PESA Deposit Submission - Deposit #{deposit_id}"
    )
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = DEPOSIT_NOTIFICATION_EMAIL

    message.set_content(
        f"""A new M-PESA deposit has been submitted.

Deposit ID: {deposit_id}
Username: {username}
RBH number: {rbh_number}
Amount: KES {amount:.2f}
M-PESA confirmation code: {confirmation_code}
Submission time (UTC): {submitted_at.strftime("%Y-%m-%d %H:%M:%S")}
Status: PENDING

Please verify the payment before approving the deposit.
The user's wallet must only be credited through admin approval.
"""
    )

    try:
        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=20,
        ) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)

        return True

    except Exception:
        # Do not log SMTP credentials or email contents.
        logger.exception(
            "Email notification failed for deposit #%s.",
            deposit_id,
        )
        return False


def create_deposit(
    db: Session,
    user_id: int,
    amount: Decimal,
    payment_method: str = "MPESA",
    mpesa_confirmation_code: str | None = None,
):
    """
    Create a pending manual deposit.

    Only one pending deposit is allowed per user.
    Email failure does not prevent saving the deposit.
    Wallet credit remains exclusively in the admin approval workflow.
    """

    amount = Decimal(str(amount)).quantize(Decimal("0.01"))

    if amount <= Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit amount must be greater than zero",
        )

    payment_method = payment_method.upper().strip()

    if payment_method != "MPESA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only MPESA deposits are currently supported",
        )

    code = (mpesa_confirmation_code or "").strip().upper()

    if not code or not code.isalnum() or not 5 <= len(code) <= 20:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Enter a valid M-PESA confirmation code",
        )

    # Lock the user's row to help prevent simultaneous requests
    # from creating multiple pending deposits for the same user.
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .with_for_update()
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Allow only one pending deposit per user.
    pending_deposit = (
        db.query(Deposit)
        .filter(
            Deposit.user_id == user_id,
            Deposit.status == "PENDING",
        )
        .first()
    )

    if pending_deposit:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "You already have a pending deposit. "
                "Please wait until it is approved or rejected "
                "before submitting another."
            ),
        )

    # Prevent reuse of an M-PESA confirmation code.
    existing_code = (
        db.query(Deposit)
        .filter(
            func.upper(Deposit.mpesa_receipt_number) == code
        )
        .first()
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This M-PESA confirmation code has already been submitted",
        )

    submitted_at = datetime.utcnow()

    deposit = Deposit(
        user_id=user_id,
        amount=amount,
        payment_method=payment_method,
        mpesa_receipt_number=code,
        status="PENDING",
        created_at=submitted_at,
    )

    try:
        db.add(deposit)
        db.flush()

        transaction = Transaction(
            user_id=user_id,
            transaction_type="DEPOSIT",
            amount=amount,
            description="Deposit via MPESA",
            status="PENDING",
            reference_type="DEPOSIT",
            reference_id=deposit.id,
            created_at=submitted_at,
        )
        db.add(transaction)

        # Save the deposit and transaction first.
        db.commit()
        db.refresh(deposit)

    except Exception as exc:
        db.rollback()
        logger.exception("Failed to create a deposit request.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deposit request could not be created",
        ) from exc

    # Email failure cannot undo the saved deposit.
    notification_sent = _send_deposit_notification(
        username=user.username,
        rbh_number=user.referral_code,
        amount=amount,
        confirmation_code=code,
        submitted_at=submitted_at,
        deposit_id=deposit.id,
    )

    return {
        "deposit": deposit,
        "referral_bonus": Decimal("0.00"),
        "is_first_deposit": False,
        "notification_sent": notification_sent,
        "message": (
            "Deposit request submitted successfully. Pending verification."
        ),
    }
