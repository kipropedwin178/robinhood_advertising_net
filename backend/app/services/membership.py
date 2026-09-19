from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.membership import Membership
from app.models.membership_level import MembershipLevel
from app.models.transaction import Transaction
from app.models.wallet import Wallet


def activate_membership(
    db: Session,
    user_id: int,
    level: int
):
    # ---------------------------------------------------------
    # 1. Get the membership level from the database
    # ---------------------------------------------------------

    level_data = (
        db.query(MembershipLevel)
        .filter(
            MembershipLevel.level == level,
            MembershipLevel.is_deleted == False
        )
        .first()
    )

    if not level_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid membership level"
        )

    # ---------------------------------------------------------
    # 2. Check whether the membership level is active
    #
    #    This only affects NEW activations.
    #    Existing user memberships are not changed.
    # ---------------------------------------------------------

    if not level_data.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This membership level is currently unavailable"
        )

    # ---------------------------------------------------------
    # 3. Convert financial values to Decimal
    # ---------------------------------------------------------

    activation_fee = Decimal(
        str(level_data.activation_fee)
    )

    daily_reward = Decimal(
        str(level_data.daily_reward)
    )

    # ---------------------------------------------------------
    # 4. Get and lock the user's wallet
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
            detail="User wallet not found"
        )

    # ---------------------------------------------------------
    # 5. Check wallet balance
    # ---------------------------------------------------------

    if wallet.balance < activation_fee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient wallet balance. "
                f"You need KES {activation_fee:.2f} "
                f"to activate this level."
            )
        )

    # ---------------------------------------------------------
    # 6. Check existing membership
    # ---------------------------------------------------------

    existing_membership = (
        db.query(Membership)
        .filter(
            Membership.user_id == user_id,
            Membership.level == level
        )
        .order_by(Membership.id.desc())
        .first()
    )

    # ---------------------------------------------------------
    # 7. Prevent duplicate active membership
    #
    #    If the previous cycle has expired, deactivate it
    #    and allow the user to renew.
    # ---------------------------------------------------------

    now = datetime.utcnow()

    if existing_membership:

        if (
            existing_membership.is_active
            and existing_membership.expires_at > now
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This membership level is already active"
            )

        if (
            existing_membership.is_active
            and existing_membership.expires_at <= now
        ):
            existing_membership.is_active = False

    # ---------------------------------------------------------
    # 8. Deduct activation fee from wallet
    # ---------------------------------------------------------

    wallet.balance -= activation_fee

    # ---------------------------------------------------------
    # 9. Calculate membership dates
    # ---------------------------------------------------------

    started_at = now

    expires_at = started_at + timedelta(
        days=level_data.cycle_days
    )

    # ---------------------------------------------------------
    # 10. Create the user's membership
    #
    #     Package information is copied here as a snapshot.
    #     Future admin edits will NOT change this membership.
    # ---------------------------------------------------------

    membership = Membership(
        user_id=user_id,
        level=level,

        product_name=level_data.product_name,
        product_photo=level_data.product_photo,
        description=level_data.description,
        product_price=level_data.product_price,
        release_date=level_data.release_date,

        activation_fee=activation_fee,
        earnings=daily_reward,

        advertisement_message=(
            level_data.advertisement_message
        ),
        advertisement_link=(
            level_data.advertisement_link
        ),

        started_at=started_at,
        expires_at=expires_at,
        is_active=True
    )

    db.add(membership)

    # ---------------------------------------------------------
    # 11. Record the activation transaction
    #
    #     Membership activation is a DEBIT.
    #     Therefore the transaction amount must be negative.
    # ---------------------------------------------------------

    transaction = Transaction(
    user_id=user_id,
    transaction_type="MEMBERSHIP_ACTIVATION",
    amount=-activation_fee,
    description=(
        f"Activated Level {level} membership"
    )
)

    db.add(transaction)

    # ---------------------------------------------------------
    # 12. Save everything together
    # ---------------------------------------------------------

    try:
        db.commit()
        db.refresh(membership)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Membership activation could not be completed"
        )

    return membership