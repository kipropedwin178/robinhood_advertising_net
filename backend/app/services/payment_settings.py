from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.payment_settings import PaymentSettings
from app.schemas.payment_settings import PaymentSettingsUpdate


def get_payment_settings(
    db: Session
):
    settings = (
        db.query(PaymentSettings)
        .first()
    )

    if not settings:
        settings = PaymentSettings(
            enable_stk_push=True,
            enable_till=False,
            enable_paybill=False,
            enable_bank=False
        )

        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def update_payment_settings(
    db: Session,
    data: PaymentSettingsUpdate
):
    settings = get_payment_settings(
        db=db
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if isinstance(value, str):
            value = value.strip()

        setattr(
            settings,
            field,
            value
        )

    # At least one payment method
    # must remain enabled.
    if (
        not settings.enable_stk_push
        and not settings.enable_till
        and not settings.enable_paybill
        and not settings.enable_bank
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "At least one payment method "
                "must be enabled"
            )
        )

    db.commit()
    db.refresh(settings)

    return settings