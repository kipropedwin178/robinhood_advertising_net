from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PaymentSettings(Base):
    __tablename__ = "payment_settings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # =====================================================
    # M-PESA STK PUSH
    # =====================================================

    enable_stk_push: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    stk_business_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    stk_shortcode: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    # =====================================================
    # BUY GOODS TILL
    # =====================================================

    enable_till: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    till_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    till_number: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    # =====================================================
    # PAYBILL
    # =====================================================

    enable_paybill: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    paybill_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    paybill_number: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    paybill_account: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    # =====================================================
    # BANK TRANSFER
    # =====================================================

    enable_bank: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    bank_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    bank_account_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    bank_account_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    bank_branch: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )