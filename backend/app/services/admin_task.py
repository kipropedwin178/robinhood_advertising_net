from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task


MAX_ACTIVE_TASKS = 12


def get_all_tasks(db: Session):
    return (
        db.query(Task)
        .filter(Task.is_deleted == False)
        .order_by(Task.id.desc())
        .all()
    )


def get_active_tasks(db: Session):
    return (
        db.query(Task)
        .filter(
            Task.is_active == True,
            Task.is_deleted == False
        )
        .order_by(Task.id.desc())
        .all()
    )


def create_task(
    db: Session,
    title: str,
    description: str,
    advertisement_link: str,
    membership_level: int,
    reward_amount: float
):
    active_task_count = (
        db.query(Task)
        .filter(
            Task.is_active == True,
            Task.is_deleted == False
        )
        .count()
    )

    if active_task_count >= MAX_ACTIVE_TASKS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Maximum of 12 active tasks "
                "has been reached."
            )
        )

    task = Task(
        title=title,
        description=description,
        advertisement_link=advertisement_link,
        membership_level=membership_level,
        reward_amount=reward_amount,
        is_active=True,
        is_deleted=False
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def get_task_by_id(
    db: Session,
    task_id: int
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )

    return task


def update_task(
    db: Session,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    advertisement_link: str | None = None,
    membership_level: int | None = None,
    reward_amount: float | None = None
):
    task = get_task_by_id(
        db=db,
        task_id=task_id
    )

    if title is not None:
        task.title = title

    if description is not None:
        task.description = description

    if advertisement_link is not None:
        task.advertisement_link = advertisement_link

    if membership_level is not None:
        task.membership_level = membership_level

    if reward_amount is not None:
        task.reward_amount = reward_amount

    db.commit()
    db.refresh(task)

    return task


def set_task_status(
    db: Session,
    task_id: int,
    is_active: bool
):
    task = get_task_by_id(
        db=db,
        task_id=task_id
    )

    if is_active and not task.is_active:

        active_task_count = (
            db.query(Task)
            .filter(
                Task.is_active == True,
                Task.is_deleted == False,
                Task.id != task.id
            )
            .count()
        )

        if active_task_count >= MAX_ACTIVE_TASKS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Maximum of 12 active tasks "
                    "has been reached."
                )
            )

    task.is_active = is_active

    db.commit()
    db.refresh(task)

    return task


def archive_task(
    db: Session,
    task_id: int
):
    task = get_task_by_id(
        db=db,
        task_id=task_id
    )

    task.is_active = False
    task.is_deleted = True

    db.commit()
    db.refresh(task)

    return task