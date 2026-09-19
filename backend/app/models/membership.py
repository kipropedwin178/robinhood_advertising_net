from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Membership(Base):
    __tablename__ = "memberships"

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

    level: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    product_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    product_photo: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    product_price: Mapped[float | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    release_date: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    activation_fee: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    earnings: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    advertisement_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    advertisement_link: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False
    )