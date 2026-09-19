
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    admin_user_id: int,
    action: str,
    target_user_id: int | None = None,
    old_value: str | None = None,
    new_value: str | None = None
) -> AuditLog:
    """
    Create an audit log entry for an administrative action.
    """

    audit_log = AuditLog(
        admin_user_id=admin_user_id,
        action=action,
        target_user_id=target_user_id,
        old_value=old_value,
        new_value=new_value
    )

    db.add(audit_log)

    return audit_log