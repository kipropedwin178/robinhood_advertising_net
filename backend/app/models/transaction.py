from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

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

    transaction_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # ---------------------------------------------------------
    # Transaction status
    #
    # PENDING   = waiting for admin action
    # COMPLETED = successfully completed
    # REJECTED  = rejected by admin
    # ---------------------------------------------------------

    status: Mapped[str] = mapped_column(
        String(30),
        default="COMPLETED",
        nullable=False
    )

    # ---------------------------------------------------------
    # Reference information
    #
    # reference_type:
    #     DEPOSIT
    #     WITHDRAWAL
    #     MEMBERSHIP
    #     TASK
    #     REFERRAL
    #
    # reference_id:
    #     ID of the related record
    # ---------------------------------------------------------

    reference_type: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        index=True
    )

    reference_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )