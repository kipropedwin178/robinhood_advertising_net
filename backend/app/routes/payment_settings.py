from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.services.payment_settings import get_payment_settings


router = APIRouter(
    prefix="/api/payment-settings",
    tags=["Payment Settings"]
)


@router.get("")
def get_user_payment_settings(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    settings = get_payment_settings(
        db=db
    )

    return {
        # =================================================
        # M-PESA STK PUSH
        # =================================================

        "enable_stk_push": (
            settings.enable_stk_push
        ),

        "stk_business_name": (
            settings.stk_business_name
            if settings.enable_stk_push
            else None
        ),

        "stk_shortcode": (
            settings.stk_shortcode
            if settings.enable_stk_push
            else None
        ),

        # =================================================
        # BUY GOODS TILL
        # =================================================

        "enable_till": settings.enable_till,

        "till_name": (
            settings.till_name
            if settings.enable_till
            else None
        ),

        "till_number": (
            settings.till_number
            if settings.enable_till
            else None
        ),

        # =================================================
        # PAYBILL
        # =================================================

        "enable_paybill": (
            settings.enable_paybill
        ),

        "paybill_name": (
            settings.paybill_name
            if settings.enable_paybill
            else None
        ),

        "paybill_number": (
            settings.paybill_number
            if settings.enable_paybill
            else None
        ),

        "paybill_account": (
            settings.paybill_account
            if settings.enable_paybill
            else None
        ),

        # =================================================
        # BANK TRANSFER
        # =================================================

        "enable_bank": settings.enable_bank,

        "bank_name": (
            settings.bank_name
            if settings.enable_bank
            else None
        ),

        "bank_account_name": (
            settings.bank_account_name
            if settings.enable_bank
            else None
        ),

        "bank_account_number": (
            settings.bank_account_number
            if settings.enable_bank
            else None
        ),

        "bank_branch": (
            settings.bank_branch
            if settings.enable_bank
            else None
        )
    }