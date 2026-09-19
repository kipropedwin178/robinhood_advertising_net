from decimal import Decimal, InvalidOperation
from sqlalchemy import func
from datetime import datetime, date

from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal
from app.schemas.admin_transaction import AdminTransactionResponse
from app.schemas.admin_deposit import (
    AdminDepositAction,
    AdminDepositResponse
)

from app.services.admin_deposit import (
    get_all_deposits,
    get_pending_deposits,
    approve_deposit,
    reject_deposit
)
from app.models.membership import Membership
from app.schemas.admin_dashboard import AdminDashboardResponse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.admin_dependencies import (
    require_admin,
    require_super_admin
)
from app.schemas.admin_withdrawal import (
    AdminWithdrawalAction,
    AdminWithdrawalResponse
)

from app.services.admin_withdrawal import (
    get_all_withdrawals,
    get_pending_withdrawals,
    approve_withdrawal,
    reject_withdrawal
)
from app.services.admin_transaction import (
    get_all_transactions,
    get_user_transactions
)
from app.core.security import pwd_context
from app.database.connection import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.admin import (
    AdminBalanceUpdate,
    AdminPasswordReset,
    AdminUserResponse,
    AdminUserDetailResponse,
    AdminUserUpdate
)
from app.services.audit_log import create_audit_log


router = APIRouter(
    prefix="/api/edutech",
    tags=["Edutech Admin"]
)


# =========================================================
# GET ALL USERS
# =========================================================

@router.get(
    "/users",
    response_model=list[AdminUserResponse]
)
def get_all_users(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    result = []

    for user in users:
        wallet = (
            db.query(Wallet)
            .filter(Wallet.user_id == user.id)
            .first()
        )

        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "referral_code": user.referral_code,
            "referred_by": user.referred_by,
            "role": user.role,
            "is_active": user.is_active,
            "balance": float(wallet.balance) if wallet else 0.0,
        })

    return result


# =========================================================
# GET ONE USER
# =========================================================

@router.get(
    "/users/{user_id}",
    response_model=AdminUserDetailResponse
)
def get_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # -----------------------------------------------------
    # Find user
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Find user's wallet
    # -----------------------------------------------------

    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user.id)
        .first()
    )

    # -----------------------------------------------------
    # Find active memberships
    # -----------------------------------------------------

    memberships = (
        db.query(Membership)
        .filter(
            Membership.user_id == user.id,
            Membership.is_active == True
        )
        .order_by(Membership.started_at.desc())
        .all()
    )

    # -----------------------------------------------------
    # Return detailed user information
    # -----------------------------------------------------

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "referral_code": user.referral_code,
        "referred_by": user.referred_by,
        "role": user.role,
        "is_active": user.is_active,

        "balance": float(wallet.balance) if wallet else 0.0,
        "total_earned": (
            float(wallet.total_earned)
            if wallet
            else 0.0
        ),
        "total_withdrawn": (
            float(wallet.total_withdrawn)
            if wallet
            else 0.0
        ),

        "active_memberships": memberships
    }
# =========================================================
# SUSPEND USER
# ADMIN + SUPER ADMIN
# =========================================================

@router.patch(
    "/users/{user_id}/suspend"
)
def suspend_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Prevent admin from suspending themselves
    # -----------------------------------------------------

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot suspend your own account"
        )

    # -----------------------------------------------------
    # ADMIN cannot suspend SUPER_ADMIN
    # -----------------------------------------------------

    if (
        current_admin.role != "SUPER_ADMIN"
        and user.role == "SUPER_ADMIN"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a super admin can suspend a super admin"
        )

    # -----------------------------------------------------
    # Already suspended
    # -----------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already suspended"
        )

    old_status = user.is_active

    user.is_active = False

    create_audit_log(
        db=db,
        admin_user_id=current_admin.id,
        action="SUSPEND_USER",
        target_user_id=user.id,
        old_value=str(old_status),
        new_value="False"
    )

    db.commit()
    db.refresh(user)

    return {
        "message": "User suspended successfully",
        "user_id": user.id,
        "is_active": user.is_active
    }


# =========================================================
# UNSUSPEND USER
# ADMIN + SUPER ADMIN
# =========================================================

@router.patch(
    "/users/{user_id}/unsuspend"
)
def unsuspend_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # ADMIN cannot modify SUPER_ADMIN
    # -----------------------------------------------------

    if (
        current_admin.role != "SUPER_ADMIN"
        and user.role == "SUPER_ADMIN"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a super admin can unsuspend a super admin"
        )

    # -----------------------------------------------------
    # Already active
    # -----------------------------------------------------

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active"
        )

    old_status = user.is_active

    user.is_active = True

    create_audit_log(
        db=db,
        admin_user_id=current_admin.id,
        action="UNSUSPEND_USER",
        target_user_id=user.id,
        old_value=str(old_status),
        new_value="True"
    )

    db.commit()
    db.refresh(user)

    return {
        "message": "User unsuspended successfully",
        "user_id": user.id,
        "is_active": user.is_active
    }


# =========================================================
# DELETE USER
# SUPER ADMIN ONLY
# =========================================================

@router.delete(
    "/users/{user_id}"
)
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Prevent deleting your own account
    # -----------------------------------------------------

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account"
        )

    # -----------------------------------------------------
    # Protect SUPER_ADMIN accounts
    # -----------------------------------------------------

    if user.role == "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A SUPER_ADMIN account cannot be deleted"
        )

    # -----------------------------------------------------
    # Save information for audit log
    # -----------------------------------------------------

    deleted_user_id = user.id
    deleted_username = user.username
    deleted_email = user.email

    # -----------------------------------------------------
    # Delete user
    # -----------------------------------------------------

    db.delete(user)

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This user cannot be deleted because related "
                "records still exist. Suspend the user instead."
            )
        )

    return {
        "message": "User deleted successfully",
        "user_id": deleted_user_id,
        "username": deleted_username,
        "email": deleted_email
    }
# =========================================================
# EDIT USER DETAILS
# =========================================================

@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse
)
def update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Prevent an ADMIN from modifying privileged roles
    # -----------------------------------------------------

    if current_admin.role != "SUPER_ADMIN":

        if user_data.role is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only a super admin can change user roles"
            )

        if user.role == "SUPER_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only a super admin can modify a super admin"
            )

    # -----------------------------------------------------
    # Validate role
    # -----------------------------------------------------

    allowed_roles = {
        "USER",
        "ADMIN",
        "SUPER_ADMIN"
    }

    if (
        user_data.role is not None
        and user_data.role not in allowed_roles
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid role. Allowed roles: "
                "USER, ADMIN, SUPER_ADMIN"
            )
        )

    # -----------------------------------------------------
    # Prevent changing own SUPER_ADMIN role
    # -----------------------------------------------------

    if (
        user.id == current_admin.id
        and user_data.role is not None
        and user_data.role != "SUPER_ADMIN"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot remove your own SUPER_ADMIN role"
        )

    changes = []

    # -----------------------------------------------------
    # Username
    # -----------------------------------------------------

    if user_data.username is not None:

        if user_data.username != user.username:

            existing_username = (
                db.query(User)
                .filter(
                    User.username == user_data.username,
                    User.id != user.id
                )
                .first()
            )

            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )

            changes.append(
                (
                    "username",
                    user.username,
                    user_data.username
                )
            )

            user.username = user_data.username

    # -----------------------------------------------------
    # Email
    # -----------------------------------------------------

    if user_data.email is not None:

        new_email = str(user_data.email)

        if new_email != user.email:

            existing_email = (
                db.query(User)
                .filter(
                    User.email == new_email,
                    User.id != user.id
                )
                .first()
            )

            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )

            changes.append(
                (
                    "email",
                    user.email,
                    new_email
                )
            )

            user.email = new_email

    # -----------------------------------------------------
    # Phone number
    # -----------------------------------------------------

    if user_data.phone_number is not None:

        if user_data.phone_number != user.phone_number:

            existing_phone = (
                db.query(User)
                .filter(
                    User.phone_number == user_data.phone_number,
                    User.id != user.id
                )
                .first()
            )

            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already exists"
                )

            changes.append(
                (
                    "phone_number",
                    user.phone_number,
                    user_data.phone_number
                )
            )

            user.phone_number = user_data.phone_number

    # -----------------------------------------------------
    # Role
    # -----------------------------------------------------

    if user_data.role is not None:

        if user_data.role != user.role:

            changes.append(
                (
                    "role",
                    user.role,
                    user_data.role
                )
            )

            user.role = user_data.role

    # -----------------------------------------------------
    # Active status
    # -----------------------------------------------------

    if user_data.is_active is not None:

        if user_data.is_active != user.is_active:

            changes.append(
                (
                    "is_active",
                    str(user.is_active),
                    str(user_data.is_active)
                )
            )

            user.is_active = user_data.is_active

    # -----------------------------------------------------
    # Create audit records
    # -----------------------------------------------------

    for field, old_value, new_value in changes:

        create_audit_log(
            db=db,
            admin_user_id=current_admin.id,
            action=f"UPDATE_USER_{field.upper()}",
            target_user_id=user.id,
            old_value=(
                str(old_value)
                if old_value is not None
                else None
            ),
            new_value=(
                str(new_value)
                if new_value is not None
                else None
            )
        )

    # -----------------------------------------------------
    # Save changes
    # -----------------------------------------------------

    db.commit()
    db.refresh(user)

    # -----------------------------------------------------
    # Get user's wallet
    # -----------------------------------------------------

    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user.id)
        .first()
    )

    # -----------------------------------------------------
    # Return response including balance
    # -----------------------------------------------------

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "referral_code": user.referral_code,
        "referred_by": user.referred_by,
        "role": user.role,
        "is_active": user.is_active,
        "balance": (
            float(wallet.balance)
            if wallet
            else 0.0
        )
    }

# =========================================================
# RESET USER PASSWORD
# SUPER ADMIN ONLY
# =========================================================

@router.post(
    "/users/{user_id}/reset-password",
    response_model=AdminUserResponse
)
def reset_user_password(
    user_id: int,
    password_data: AdminPasswordReset,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Hash the new password
    # -----------------------------------------------------

    user.password_hash = pwd_context.hash(
        password_data.new_password
    )

    # -----------------------------------------------------
    # Create audit log
    # -----------------------------------------------------

    create_audit_log(
        db=db,
        admin_user_id=current_admin.id,
        action="RESET_USER_PASSWORD",
        target_user_id=user.id,
        old_value="[PASSWORD_HASH_CHANGED]",
        new_value="[PASSWORD_RESET]"
    )

    # -----------------------------------------------------
    # Save changes
    # -----------------------------------------------------

    db.commit()
    db.refresh(user)

    # -----------------------------------------------------
    # Get user's wallet
    # -----------------------------------------------------

    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user.id)
        .first()
    )

    # -----------------------------------------------------
    # Return user with balance
    # -----------------------------------------------------

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "referral_code": user.referral_code,
        "referred_by": user.referred_by,
        "role": user.role,
        "is_active": user.is_active,
        "balance": (
            float(wallet.balance)
            if wallet
            else 0.0
        )
    }


# =========================================================
# ADJUST USER BALANCE
# SUPER ADMIN ONLY
# =========================================================

@router.patch(
    "/users/{user_id}/balance",
)
def update_user_balance(
    user_id: int,
    balance_data: AdminBalanceUpdate,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Validate amount
    # -----------------------------------------------------

    try:
        amount = Decimal(
            str(balance_data.amount)
        ).quantize(
            Decimal("0.01")
        )

    except (InvalidOperation, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid balance amount"
        )

    if amount == Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Balance adjustment cannot be zero"
        )

    # -----------------------------------------------------
    # Lock wallet
    # -----------------------------------------------------

    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user_id)
        .with_for_update()
        .first()
    )

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User wallet not found"
        )

    old_balance = Decimal(
        str(wallet.balance)
    )

    new_balance = (
        old_balance + amount
    ).quantize(
        Decimal("0.01")
    )

    # -----------------------------------------------------
    # Prevent negative balance
    # -----------------------------------------------------

    if new_balance < Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Balance cannot become negative"
        )

    # -----------------------------------------------------
    # Update wallet
    # -----------------------------------------------------

    wallet.balance = new_balance

    # Only positive manual adjustments increase
    # total earned.

    if amount > Decimal("0.00"):
        wallet.total_earned += amount

    # -----------------------------------------------------
    # Audit log
    # -----------------------------------------------------

    create_audit_log(
        db=db,
        admin_user_id=current_admin.id,
        action="ADJUST_USER_BALANCE",
        target_user_id=user.id,
        old_value=(
            f"Balance: KES {old_balance:.2f}"
        ),
        new_value=(
            f"Balance: KES {new_balance:.2f}; "
            f"Adjustment: KES {amount:.2f}; "
            f"Reason: {balance_data.reason}"
        )
    )

    db.commit()
    db.refresh(wallet)

    return {
        "message": "User balance updated successfully",
        "user_id": user.id,
        "old_balance": float(old_balance),
        "adjustment": float(amount),
        "new_balance": float(new_balance),
        "reason": balance_data.reason
    }
# =========================================================
# ADMIN DASHBOARD STATISTICS
# =========================================================

@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse
)
def get_admin_dashboard(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
    
):
    today = date.today()
    
    # -----------------------------------------------------
    # USER STATISTICS
    # -----------------------------------------------------

    total_users = (
        db.query(func.count(User.id))
        .scalar()
        or 0
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active == True)
        .scalar()
        or 0
    )

    inactive_users = (
        db.query(func.count(User.id))
        .filter(User.is_active == False)
        .scalar()
        or 0
    )

    # -----------------------------------------------------
    # DEPOSIT STATISTICS
    # -----------------------------------------------------

    total_deposits = (
    db.query(func.count(Deposit.id))
    .filter(
        Deposit.status == "COMPLETED"
    )
    .scalar()
    or 0
)

    total_deposit_amount = (
    db.query(func.sum(Deposit.amount))
    .filter(
        Deposit.status == "COMPLETED"
    )
    .scalar()
    or 0
)
    today_deposits = (
    db.query(func.sum(Deposit.amount))
    .filter(
        Deposit.status == "COMPLETED",
        func.date(Deposit.created_at) == today
    )
    .scalar()
    or 0
)
    # -----------------------------------------------------
    # WITHDRAWAL STATISTICS
    # -----------------------------------------------------

    pending_withdrawals = (
        db.query(func.count(Withdrawal.id))
        .filter(
            Withdrawal.status == "PENDING"
        )
        .scalar()
        or 0
    )

    total_withdrawals = (
    db.query(func.count(Withdrawal.id))
    .filter(
        Withdrawal.status == "COMPLETED"
    )
    .scalar()
    or 0
)

    total_withdrawn_amount = (
    db.query(func.sum(Withdrawal.amount))
    .filter(
        Withdrawal.status == "COMPLETED"
    )
    .scalar()
    or 0
)
    today_withdrawals = (
    db.query(func.sum(Withdrawal.amount))
    .filter(
        Withdrawal.status == "COMPLETED",
        func.date(Withdrawal.created_at) == today
    )
    .scalar()
    or 0
)

    # -----------------------------------------------------
    # MEMBERSHIP STATISTICS
    # -----------------------------------------------------

    active_memberships = (
        db.query(func.count(Membership.id))
        .filter(
            Membership.is_active == True
        )
        .scalar()
        or 0
    )

    # -----------------------------------------------------
    # USER EARNINGS
    # -----------------------------------------------------

    total_user_earnings = (
        db.query(func.sum(Wallet.total_earned))
        .scalar()
        or 0
    )

    # -----------------------------------------------------
    # RETURN DASHBOARD DATA
    # -----------------------------------------------------

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,

        "total_deposits": total_deposits,
        "total_deposit_amount": float(
            total_deposit_amount
        ),
        "today_deposits": float(today_deposits),

        "pending_withdrawals": pending_withdrawals,
        "total_withdrawals": total_withdrawals,
        "total_withdrawn_amount": float(
            total_withdrawn_amount
        ),
        "today_withdrawals": float(today_withdrawals),

        "active_memberships": active_memberships,

        "total_user_earnings": float(
            total_user_earnings
        )
    }
# =========================================================
# GET ALL WITHDRAWALS
# =========================================================

@router.get(
    "/withdrawals",
    response_model=list[AdminWithdrawalResponse]
)
def admin_get_all_withdrawals(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_all_withdrawals(db)


# =========================================================
# GET PENDING WITHDRAWALS
# =========================================================

@router.get(
    "/withdrawals/pending",
    response_model=list[AdminWithdrawalResponse]
)
def admin_get_pending_withdrawals(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_pending_withdrawals(db)


# =========================================================
# APPROVE WITHDRAWAL
# =========================================================

@router.patch(
    "/withdrawals/{withdrawal_id}/approve",
    response_model=AdminWithdrawalResponse
)
def admin_approve_withdrawal(
    withdrawal_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    withdrawal = approve_withdrawal(
        db=db,
        withdrawal_id=withdrawal_id,
        admin_user_id=current_admin.id
    )
    user = (
    db.query(User)
    .filter(User.id == withdrawal.user_id)
    .first()
    )
    return {
        "id": withdrawal.id,
        "user_id": withdrawal.user_id,
        "amount": withdrawal.amount,
        "rbh_number": user.referral_code if user else "N/A",
        "withdrawal_fee": withdrawal.withdrawal_fee,
        "net_amount": withdrawal.net_amount,
        "payment_method": withdrawal.payment_method,
        "phone_number": withdrawal.phone_number,
        "status": withdrawal.status,
        "created_at": withdrawal.created_at,
    }

# =========================================================
# REJECT WITHDRAWAL
# =========================================================

@router.patch(
    "/withdrawals/{withdrawal_id}/reject",
    response_model=AdminWithdrawalResponse
)
def admin_reject_withdrawal(
    withdrawal_id: int,
    action_data: AdminWithdrawalAction,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    withdrawal = reject_withdrawal(
        db=db,
        withdrawal_id=withdrawal_id,
        admin_user_id=current_admin.id,
        reason=action_data.reason
    )
    user = (
    db.query(User)
    .filter(User.id == withdrawal.user_id)
    .first()
    )

    return {
        "id": withdrawal.id,
        "user_id": withdrawal.user_id,
        "amount": withdrawal.amount,
        "rbh_number": user.referral_code if user else "N/A",
        "withdrawal_fee": withdrawal.withdrawal_fee,
        "net_amount": withdrawal.net_amount,
        "payment_method": withdrawal.payment_method,
        "phone_number": withdrawal.phone_number,
        "status": withdrawal.status,
        "created_at": withdrawal.created_at,
    }
# =========================================================
# GET ALL DEPOSITS
# ADMIN + SUPER ADMIN
# =========================================================

@router.get(
    "/deposits",
    response_model=list[AdminDepositResponse]
)
def get_admin_deposits(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_all_deposits(db)


# =========================================================
# GET PENDING DEPOSITS
# ADMIN + SUPER ADMIN
# =========================================================

@router.get(
    "/deposits/pending",
    response_model=list[AdminDepositResponse]
)
def get_admin_pending_deposits(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_pending_deposits(db)


# =========================================================
# APPROVE DEPOSIT
# SUPER ADMIN ONLY
# =========================================================

@router.patch(
    "/deposits/{deposit_id}/approve",
    response_model=AdminDepositResponse
)
def approve_admin_deposit(
    deposit_id: int,
    action_data: AdminDepositAction,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    result = approve_deposit(
        db=db,
        deposit_id=deposit_id,
        admin_user_id=current_admin.id,
        reason=action_data.reason
    )

    deposit = result["deposit"]

    return {
    "id": deposit.id,
    "user_id": deposit.user_id,
    "rbh_number": deposit.user.referral_code,
    "amount": deposit.amount,
    "payment_method": deposit.payment_method,
    "status": deposit.status,
    "created_at": deposit.created_at,
}

# =========================================================
# REJECT DEPOSIT
# SUPER ADMIN ONLY
# =========================================================

@router.patch(
    "/deposits/{deposit_id}/reject",
    response_model=AdminDepositResponse
)
def reject_admin_deposit(
    deposit_id: int,
    action_data: AdminDepositAction,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    deposit = reject_deposit(
    db=db,
    deposit_id=deposit_id,
    admin_user_id=current_admin.id,
    reason=action_data.reason
)

    return {
    "id": deposit.id,
    "user_id": deposit.user_id,
    "rbh_number": deposit.user.referral_code,
    "amount": deposit.amount,
    "payment_method": deposit.payment_method,
    "status": deposit.status,
    "created_at": deposit.created_at,
}
# =========================================================
# GET ALL TRANSACTIONS
# ADMIN ONLY
# =========================================================

@router.get(
    "/transactions",
    response_model=list[AdminTransactionResponse]
)
def get_admin_transactions(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_all_transactions(db)


# =========================================================
# GET USER TRANSACTIONS
# ADMIN ONLY
# =========================================================

@router.get(
    "/users/{user_id}/transactions",
    response_model=list[AdminTransactionResponse]
)
def get_admin_user_transactions(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # -----------------------------------------------------
    # Make sure the user exists
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return get_user_transactions(
        db=db,
        user_id=user_id
    )