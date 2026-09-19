from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class MembershipLevel(Base):
    __tablename__ = "membership_levels"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    level: Mapped[int] = mapped_column(
        Integer,
        unique=True,
        nullable=False,
        index=True
    )

    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    product_photo: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    product_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    release_date: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    activation_fee: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    daily_reward: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    cycle_days: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    advertisement_message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Legacy field.
    # WhatsApp advertisement links are now generated automatically
    # from advertisement_message, so this field is no longer required.
    advertisement_link: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )