from app.models.user import User

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Deposit(Base):
    __tablename__ = "deposits"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    user: Mapped["User"] = relationship(
        "User"
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    payment_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # ---------------------------------------------------------
    # PHONE USED FOR M-PESA PAYMENT
    # ---------------------------------------------------------

    phone_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    # ---------------------------------------------------------
    # DARAJA STK PUSH IDENTIFIERS
    # ---------------------------------------------------------

    merchant_request_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    checkout_request_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        unique=True,
        index=True
    )

    # ---------------------------------------------------------
    # M-PESA RECEIPT
    # ---------------------------------------------------------

    mpesa_receipt_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # ---------------------------------------------------------
    # DEPOSIT STATUS
    # ---------------------------------------------------------

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )