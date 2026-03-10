from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from ..database.db_connection import SessionLocal
from ..models.merchant import Merchant, ApprovalStatus
from ..services.dependencies import get_current_user, require_role
from ..models.user import User, UserRole
from ..models.notification import Notification, NotificationType
import uuid, datetime
from fastapi import Body

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/merchants/{merchant_id}")
def get_merchant(merchant_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    # allow the merchant or manager to view
    if user.role != "BOOTH_MANAGER" and merchant.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return merchant


@router.patch("/merchants/{merchant_id}/approve")
def approve_merchant(merchant_id: str, user=Depends(require_role(["BOOTH_MANAGER"])), db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant.approval_status = ApprovalStatus.APPROVED
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.utcnow()
    db.add(merchant)
    # upgrade the user role to MERCHANT
    usr = db.query(User).filter(User.id == merchant.user_id).first()
    if usr:
        usr.role = UserRole.MERCHANT
        db.add(usr)
    db.commit()
    db.refresh(merchant)

    # notify the user
    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=merchant.user_id,
        title="Merchant approved",
        message=f"Your merchant application has been approved",
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(note)
    db.commit()
    return merchant


@router.patch("/merchants/{merchant_id}/reject")
def reject_merchant(merchant_id: str, user=Depends(require_role(["BOOTH_MANAGER"])), db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant.approval_status = ApprovalStatus.REJECTED
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.utcnow()
    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    # notify the user about rejection
    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=merchant.user_id,
        title="Merchant application rejected",
        message=f"Your merchant application has been rejected",
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(note)
    db.commit()
    return merchant


@router.get('/merchants/pending')
def list_pending_merchants(user=Depends(require_role(["BOOTH_MANAGER"])), db: Session = Depends(get_db)):
    rows = db.query(Merchant).filter(Merchant.approval_status == ApprovalStatus.PENDING).all()
    out = []
    for m in rows:
        u = db.query(User).filter(User.id == m.user_id).first()
        out.append({
            'merchant_id': m.merchant_id,
            'user_id': m.user_id,
            'username': getattr(u, 'username', None),
            'name': getattr(u, 'name', None),
            'citizen_id': m.citizen_id,
            'citizen_valid': bool(getattr(m, 'citizen_valid', 0)),
            'seller_information': m.seller_information,
            'product_description': m.product_description,
            'approval_status': getattr(m.approval_status, 'value', m.approval_status),
        })
    return out


@router.get('/merchants/all')
def list_all_applications(user=Depends(get_current_user), db: Session = Depends(get_db)):
    # Return all users (like `select * from users`) but filter out BOOTH_MANAGER
    rows = db.query(User).all()
    out = []
    for u in rows:
        role_val = getattr(u.role, 'value', u.role)
        if role_val == 'BOOTH_MANAGER':
            continue
        out.append({
            'user_id': u.id,
            'username': u.username,
            'name': u.name,
            'role': role_val,
        })
    return out


@router.patch('/merchants/{merchant_id}/status')
def set_merchant_status(merchant_id: str, status: str = Body(..., embed=True), user=Depends(require_role(["BOOTH_MANAGER"])), db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail='Merchant not found')
    # validate status
    if status not in ('PENDING', 'APPROVED', 'REJECTED'):
        raise HTTPException(status_code=400, detail='Invalid status')
    merchant.approval_status = ApprovalStatus(status)
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.utcnow()
    db.add(merchant)

    # update user role accordingly
    usr = db.query(User).filter(User.id == merchant.user_id).first()
    if usr:
        if status == 'APPROVED':
            usr.role = UserRole.MERCHANT
        else:
            usr.role = UserRole.GENERAL_USER
        db.add(usr)

    db.commit()
    db.refresh(merchant)

    # notify user
    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=merchant.user_id,
        title='Merchant status updated',
        message=f'Your merchant application status changed to {status}',
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(note)
    db.commit()
    return merchant


@router.patch('/users/{user_id}/merchant_status')
def set_user_merchant_status(user_id: str, status: str = Body(..., embed=True), user=Depends(require_role(["BOOTH_MANAGER"])), db: Session = Depends(get_db)):
    """Set merchant approval status by user id. Creates a merchant record if missing.
    status must be one of 'PENDING','APPROVED','REJECTED'. Updates the user's role accordingly."""
    if status not in ('PENDING', 'APPROVED', 'REJECTED'):
        raise HTTPException(status_code=400, detail='Invalid status')

    usr = db.query(User).filter(User.id == user_id).first()
    if not usr:
        raise HTTPException(status_code=404, detail='User not found')

    merchant = db.query(Merchant).filter(Merchant.user_id == user_id).first()
    if not merchant:
        # create a merchant record if missing
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

    merchant.approval_status = ApprovalStatus(status)
    merchant.approved_by = user.id
    merchant.approved_at = datetime.datetime.utcnow()
    db.add(merchant)

    # update user role accordingly
    if status == 'APPROVED':
        usr.role = UserRole.MERCHANT
    else:
        usr.role = UserRole.GENERAL_USER
    db.add(usr)

    db.commit()
    db.refresh(merchant)

    # notify the user
    note = Notification(
        notification_id=str(uuid.uuid4()),
        user_id=user_id,
        title='Merchant status updated',
        message=f'Your merchant application status changed to {status}',
        type=NotificationType.MERCHANT_APPROVAL,
        reference_id=merchant.merchant_id,
        is_read=False,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(note)
    db.commit()
    return {
        'user_id': usr.id,
        'username': usr.username,
        'role': getattr(usr.role, 'value', usr.role),
        'merchant_id': merchant.merchant_id,
        'approval_status': getattr(merchant.approval_status, 'value', merchant.approval_status),
    }


@router.patch("/merchants/{merchant_id}")
def update_merchant(merchant_id: str, seller_information: str, product_description: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
    if not merchant or merchant.user_id != user.id:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant.seller_information = seller_information
    merchant.product_description = product_description
    db.commit()
    db.refresh(merchant)
    return merchant


@router.get('/users')
def list_users(db: Session = Depends(get_db)):
    """Return all users (no passwords) to help verify the server is running."""
    rows = db.query(User).all()
    out = []
    for u in rows:
        # skip booth managers as requested
        role_val = getattr(u.role, 'value', u.role)
        if role_val == 'BOOTH_MANAGER':
            continue
        # attach merchant info if exists
        m = db.query(Merchant).filter(Merchant.user_id == u.id).first()
        out.append({
            'id': u.id,
            'username': u.username,
            'name': u.name,
            'contact_info': u.contact_info,
            'role': role_val,
            'created_at': u.created_at.isoformat() if getattr(u, 'created_at', None) else None,
            'merchant_id': getattr(m, 'merchant_id', None),
            'approval_status': getattr(m.approval_status, 'value', None) if m else None,
            'seller_information': getattr(m, 'seller_information', None) if m else None,
            'product_description': getattr(m, 'product_description', None) if m else None,
            'citizen_valid': getattr(m, 'citizen_valid', None) if m else None,
        })
    return out
