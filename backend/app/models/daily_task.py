from datetime import datetime, date

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class DailyTask(Base):
    __tablename__ = "daily_tasks"

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

    membership_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("memberships.id"),
        nullable=False,
        index=True
    )

    task_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True
    )

    reward_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    # ---------------------------------------------------------
    # This is NULL until the user actually completes the task.
    #
    # When the user clicks "Advertise Now", a DailyTask record
    # is created with completed_at = NULL.
    #
    # When the user clicks "Complete Task", the reward is given
    # and completed_at is filled with the completion time.
    # ---------------------------------------------------------

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )