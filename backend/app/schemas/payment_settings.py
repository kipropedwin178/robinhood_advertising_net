from pydantic import BaseModel, Field


class PaymentSettingsUpdate(BaseModel):

    # =====================================================
    # M-PESA STK PUSH
    # =====================================================

    enable_stk_push: bool = True

    stk_business_name: str | None = Field(
        default=None,
        max_length=100
    )

    stk_shortcode: str | None = Field(
        default=None,
        max_length=30
    )

    # =====================================================
    # BUY GOODS TILL
    # =====================================================

    enable_till: bool = False

    till_name: str | None = Field(
        default=None,
        max_length=100
    )

    till_number: str | None = Field(
        default=None,
        max_length=30
    )

    # =====================================================
    # PAYBILL
    # =====================================================

    enable_paybill: bool = False

    paybill_name: str | None = Field(
        default=None,
        max_length=100
    )

    paybill_number: str | None = Field(
        default=None,
        max_length=30
    )

    paybill_account: str | None = Field(
        default=None,
        max_length=100
    )

    # =====================================================
    # BANK TRANSFER
    # =====================================================

    enable_bank: bool = False

    bank_name: str | None = Field(
        default=None,
        max_length=100
    )

    bank_account_name: str | None = Field(
        default=None,
        max_length=100
    )

    bank_account_number: str | None = Field(
        default=None,
        max_length=100
    )

    bank_branch: str | None = Field(
        default=None,
        max_length=100
    )


class PaymentSettingsResponse(BaseModel):

    id: int

    # =====================================================
    # M-PESA STK PUSH
    # =====================================================

    enable_stk_push: bool
    stk_business_name: str | None
    stk_shortcode: str | None

    # =====================================================
    # BUY GOODS TILL
    # =====================================================

    enable_till: bool
    till_name: str | None
    till_number: str | None

    # =====================================================
    # PAYBILL
    # =====================================================

    enable_paybill: bool
    paybill_name: str | None
    paybill_number: str | None
    paybill_account: str | None

    # =====================================================
    # BANK TRANSFER
    # =====================================================

    enable_bank: bool
    bank_name: str | None
    bank_account_name: str | None
    bank_account_number: str | None
    bank_branch: str | None

    model_config = {
        "from_attributes": True
    }