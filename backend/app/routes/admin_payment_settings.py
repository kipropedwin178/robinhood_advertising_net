from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.admin_dependencies import require_admin
from app.database.connection import get_db
from app.models.user import User
from app.schemas.payment_settings import (
    PaymentSettingsResponse,
    PaymentSettingsUpdate,
)
from app.services.payment_settings import (
    get_payment_settings,
    update_payment_settings,
)


router = APIRouter(
    prefix="/api/edutech/payment-settings",
    tags=["Admin Payment Settings"]
)


@router.get(
    "",
    response_model=PaymentSettingsResponse
)
def get_admin_payment_settings(
    current_admin: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db)
):

    return get_payment_settings(
        db=db
    )


@router.put(
    "",
    response_model=PaymentSettingsResponse
)
def update_admin_payment_settings(
    data: PaymentSettingsUpdate,
    current_admin: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db)
):

    return update_payment_settings(
        db=db,
        data=data
    )