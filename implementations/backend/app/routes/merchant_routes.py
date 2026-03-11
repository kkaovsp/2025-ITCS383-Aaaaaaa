from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Annotated
import datetime
import uuid

from ..database.db_connection import SessionLocal
from ..models.merchant import Merchant, ApprovalStatus
from ..services.dependencies import get_current_user, require_role
from ..models.user import User, UserRole
from ..models.notification import Notification, NotificationType

router = APIRouter()

MERCHANT_NOT_FOUND = "Merchant not found"
USER_NOT_FOUND = "User not found"
INVALID_STATUS = "Invalid status"
NOT_ALLOWED = "Not allowed"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/merchants/{merchant_id}",
    responses={
        404: {"description": MERCHANT_NOT_FOUND},
        403: {"description": NOT_ALLOWED},
    },
)
def get_merchant(
    merchant_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()

    if not merchant:
        raise HTTPException(status_code=404, detail=MERCHANT_NOT_FOUND)

    if user.role != "BOOTH_MANAGER" and merchant.user_id != user.id:
        raise HTTPException(status_code=403, detail=NOT_ALLOWED)

    return merchant


@router.patch(
    "/merchants/{merchant_id}/approve",
    responses={404: {"description": MERCHANT_NOT_FOUND}},
)
def approve_merchant(
    merchant_id: str,
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()

    if not merchant:
        raise HTTPException(status_code=404, detail=MERCHANT_NOT_FOUND)

    merchant.approval_status = ApprovalStatus.APPROVED
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.now(datetime.timezone.utc)

    usr = db.query(User).filter(User.id == merchant.user_id).first()
    if usr:
        usr.role = UserRole.MERCHANT
        db.add(usr)

    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=merchant.user_id,
        title="Merchant approved",
        message="Your merchant application has been approved",
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(note)
    db.commit()

    return {
        "merchant_id": merchant.merchant_id,
        "approval_status": getattr(merchant.approval_status, "value", merchant.approval_status),
    }


@router.patch(
    "/merchants/{merchant_id}/reject",
    responses={404: {"description": MERCHANT_NOT_FOUND}},
)
def reject_merchant(
    merchant_id: str,
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()

    if not merchant:
        raise HTTPException(status_code=404, detail=MERCHANT_NOT_FOUND)

    merchant.approval_status = ApprovalStatus.REJECTED
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.now(datetime.timezone.utc)

    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=merchant.user_id,
        title="Merchant application rejected",
        message="Your merchant application has been rejected",
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(note)
    db.commit()

    return merchant


@router.get("/merchants/pending")
def list_pending_merchants(
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    rows = db.query(Merchant).filter(Merchant.approval_status == ApprovalStatus.PENDING).all()

    out = []
    for m in rows:
        u = db.query(User).filter(User.id == m.user_id).first()

        out.append(
            {
                "merchant_id": m.merchant_id,
                "user_id": m.user_id,
                "username": getattr(u, "username", None),
                "name": getattr(u, "name", None),
                "citizen_id": m.citizen_id,
                "citizen_valid": bool(getattr(m, "citizen_valid", 0)),
                "seller_information": m.seller_information,
                "product_description": m.product_description,
                "approval_status": getattr(m.approval_status, "value", m.approval_status),
            }
        )

    return out


@router.get("/merchants/all")
def list_all_applications(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    rows = db.query(User).all()

    out = []
    for u in rows:
        role_val = getattr(u.role, "value", u.role)

        if role_val == "BOOTH_MANAGER":
            continue

        out.append(
            {
                "user_id": u.id,
                "username": u.username,
                "name": u.name,
                "role": role_val,
            }
        )

    return out


@router.patch(
    "/merchants/{merchant_id}/status",
    responses={
        404: {"description": MERCHANT_NOT_FOUND},
        400: {"description": INVALID_STATUS},
    },
)
def set_merchant_status(
    merchant_id: str,
    status_value: Annotated[str, Body(..., embed=True)],
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()

    if not merchant:
        raise HTTPException(status_code=404, detail=MERCHANT_NOT_FOUND)

    if status_value not in ("PENDING", "APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail=INVALID_STATUS)

    merchant.approval_status = ApprovalStatus(status_value)
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.now(datetime.timezone.utc)

    usr = db.query(User).filter(User.id == merchant.user_id).first()

    if usr:
        if status_value == "APPROVED":
            usr.role = UserRole.MERCHANT
        else:
            usr.role = UserRole.GENERAL_USER

        db.add(usr)

    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=merchant.user_id,
        title="Merchant status updated",
        message=f"Your merchant application status changed to {status_value}",
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(note)
    db.commit()

    return merchant


@router.patch(
    "/users/{user_id}/merchant_status",
    responses={
        404: {"description": USER_NOT_FOUND},
        400: {"description": INVALID_STATUS},
    },
)
def set_user_merchant_status(
    user_id: str,
    status_value: Annotated[str, Body(..., embed=True)],
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    if status_value not in ("PENDING", "APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail=INVALID_STATUS)

    usr = db.query(User).filter(User.id == user_id).first()

    if not usr:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

    merchant = db.query(Merchant).filter(Merchant.user_id == user_id).first()

    if not merchant:
        merchant = Merchant(
            merchant_id=str(uuid.uuid4()),
            user_id=user_id,
            citizen_id=None,
            seller_information=None,
            product_description=None,
            approval_status=ApprovalStatus.PENDING,
            citizen_valid=0,
        )

        db.add(merchant)

    merchant.approval_status = ApprovalStatus(status_value)
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.now(datetime.timezone.utc)

    if status_value == "APPROVED":
        usr.role = UserRole.MERCHANT
    else:
        usr.role = UserRole.GENERAL_USER

    db.add(usr)
    db.add(merchant)

    db.commit()
    db.refresh(merchant)

    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=user_id,
        title="Merchant status updated",
        message=f"Your merchant application status changed to {status_value}",
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(note)
    db.commit()

    return {
        "user_id": usr.id,
        "username": usr.username,
        "role": getattr(usr.role, "value", usr.role),
        "merchant_id": merchant.merchant_id,
        "approval_status": getattr(merchant.approval_status, "value", merchant.approval_status),
    }


@router.patch(
    "/merchants/{merchant_id}",
    responses={404: {"description": MERCHANT_NOT_FOUND}},
)
def update_merchant(
    merchant_id: str,
    seller_information: str,
    product_description: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()

    if not merchant or merchant.user_id != user.id:
        raise HTTPException(status_code=404, detail=MERCHANT_NOT_FOUND)

    merchant.seller_information = seller_information
    merchant.product_description = product_description

    db.commit()
    db.refresh(merchant)

    return merchant


@router.get("/users")
def list_users(
    db: Annotated[Session, Depends(get_db)],
):
    rows = db.query(User).all()

    out = []

    for u in rows:
        role_val = getattr(u.role, "value", u.role)

        if role_val == "BOOTH_MANAGER":
            continue

        m = db.query(Merchant).filter(Merchant.user_id == u.id).first()

        out.append(
            {
                "id": u.id,
                "username": u.username,
                "name": u.name,
                "contact_info": u.contact_info,
                "role": role_val,
                "created_at": u.created_at.isoformat() if getattr(u, "created_at", None) else None,
                "merchant_id": getattr(m, "merchant_id", None),
                "approval_status": getattr(m.approval_status, "value", None) if m else None,
                "seller_information": getattr(m, "seller_information", None) if m else None,
                "product_description": getattr(m, "product_description", None) if m else None,
                "citizen_valid": getattr(m, "citizen_valid", None) if m else None,
            }
        )

    return out