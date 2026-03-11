from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..models.user import User, UserRole
from ..models.merchant import Merchant, ApprovalStatus
from ..models.notification import Notification, NotificationType
from ..schemas.user_schema import UserCreate, UserLogin
from ..services import auth_service
from ..services.dependencies import get_current_user, get_db
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
import uuid
import datetime
import re
import logging
import json
import urllib.parse
import urllib.request
import urllib.error

import os

from typing import Annotated

router = APIRouter()


def _is_valid_thai_citizen_id(citizen_id: str) -> bool:
    if not re.fullmatch(r"\d{13}", citizen_id):
        return False

    digits = [int(ch) for ch in citizen_id]
    weighted_sum = sum(digits[i] * (13 - i) for i in range(12))
    check_digit = (11 - (weighted_sum % 11)) % 10
    return check_digit == digits[12]


def _mock_moi_result(citizen_id: str | None) -> dict:
    if not citizen_id:
        return {
            "citizen_id": citizen_id,
            "is_valid": False,
            "reason": "missing_citizen_id",
            "source": "mock_moi",
        }

    mode = os.getenv("MOI_MOCK_MODE", "len13").strip().lower()
    if mode == "checksum":
        is_valid = _is_valid_thai_citizen_id(citizen_id)
        reason = "ok" if is_valid else "invalid_format_or_checksum"
    else:
        is_valid = bool(re.fullmatch(r"\d{13}", citizen_id))
        reason = "ok" if is_valid else "invalid_format"

    return {
        "citizen_id": citizen_id,
        "is_valid": is_valid,
        "reason": reason,
        "mode": mode,
        "source": "mock_moi",
    }


@router.get("/mock/moi/verify")
def mock_moi_verify(citizen_id: str):
    """Mock MOI endpoint for development/testing citizen validation."""
    return _mock_moi_result(citizen_id)


def verify_citizen_with_moi(citizen_id: str | None) -> bool:
    if not citizen_id:
        return False

    moi_url = os.getenv("MOI_API_URL", "mock://moi/verify")

    # Use in-process mock logic when explicitly requested.
    if moi_url.startswith("mock://"):
        return bool(_mock_moi_result(citizen_id).get("is_valid"))

    query = urllib.parse.urlencode({"citizen_id": citizen_id})
    url = f"{moi_url}{'&' if '?' in moi_url else '?'}{query}"

    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
            return bool(payload.get("is_valid", False))
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, TimeoutError):
        # Fallback keeps registration resilient in dev if mock endpoint is unreachable.
        return bool(_mock_moi_result(citizen_id).get("is_valid"))


def create_merchant(db: Session, user: User, data: UserCreate):
    merchant = Merchant(
        merchant_id=str(uuid.uuid4()),
        user_id=user.id,
        citizen_id=data.citizen_id,
        seller_information=data.seller_information,
        product_description=data.product_description,
        approval_status=ApprovalStatus.PENDING,
        citizen_valid=1 if verify_citizen_with_moi(data.citizen_id) else 0,
    )
    db.add(merchant)
    return merchant

@router.post(
    "/auth/register",
    status_code=status.HTTP_201_CREATED,
    responses={400: {"description": "Username already exists"}}
)
def register(user: UserCreate, db: Annotated[Session, Depends(get_db)]):

    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    _role_alias = {
        "general": UserRole.GENERAL_USER,
        "general_user": UserRole.GENERAL_USER,
        "merchant": UserRole.MERCHANT,
        "booth_manager": UserRole.BOOTH_MANAGER,
        "boothmanager": UserRole.BOOTH_MANAGER,
    }
    if user.role:
        _key = user.role.strip().lower()
        role_value = _role_alias.get(_key) or UserRole(user.role.strip().upper())
    else:
        role_value = UserRole.GENERAL_USER

    new_user = User(
        id=str(uuid.uuid4()),
        username=user.username,
        password=auth_service.hash_password(user.password),
        name=user.name,
        contact_info=user.contact_info,
        role=role_value,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(new_user)

    merchant = None
    if user.citizen_id or user.seller_information or user.product_description:
        merchant = create_merchant(db, new_user, user)

    try:
        db.commit()
    except OperationalError:
        db.rollback()
        db.execute(text("ALTER TABLE merchants ADD COLUMN citizen_valid INTEGER DEFAULT 0"))
        db.commit()

    if merchant:
        managers = db.query(User).filter(User.role == UserRole.BOOTH_MANAGER).all()

        for m in managers:
            note = Notification(
                notification_id=str(uuid.uuid4()),
                user_id=m.id,
                title="New merchant registration",
                message=f"Merchant {new_user.username} registered and awaits approval",
                type=NotificationType.MERCHANT_APPROVAL,
                reference_id=merchant.merchant_id,
                is_read=False,
                created_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(note)

        db.commit()

    return {"msg": "registration successful"}


@router.post(
    "/auth/login",
    responses={401: {"description": "Invalid credentials"}}
)

def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)]
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        logging.warning(f"Login failed: user '{form_data.username}' not found")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    ok = auth_service.verify_password(form_data.password, user.password)
    if not ok:
        logging.warning(f"Login failed: password verification failed for user '{form_data.username}'")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth_service.create_access_token({"sub": user.id, "role": user.role.value if isinstance(user.role, UserRole) else user.role})
    # set token as HttpOnly cookie for browser-based auth
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=os.getenv("ENVIRONMENT") == "production",
        samesite="lax",
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get('/auth/me')
def me(user: Annotated[User, Depends(get_current_user)]):
    # return a minimal user profile for the frontend
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "role": getattr(user.role, 'value', user.role),
    }


@router.get('/users/me')
def users_me(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """Return the authenticated user's profile including merchant info if present."""
    m = db.query(Merchant).filter(Merchant.user_id == user.id).first()
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "contact_info": user.contact_info,
        "role": getattr(user.role, 'value', user.role),
        "created_at": user.created_at.isoformat() if getattr(user, 'created_at', None) else None,
        "merchant_id": getattr(m, 'merchant_id', None) if m else None,
        "approval_status": getattr(m.approval_status, 'value', None) if m else None,
        "seller_information": getattr(m, 'seller_information', None) if m else None,
        "product_description": getattr(m, 'product_description', None) if m else None,
        "citizen_valid": getattr(m, 'citizen_valid', None) if m else None,
    }


@router.patch('/users/me')
def update_profile(
    payload: dict,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """Update the authenticated user's basic profile fields (name, contact_info)."""
    allowed = ['name', 'contact_info']
    updated = False
    for k in allowed:
        if k in payload:
            setattr(user, k, payload[k])
            updated = True
    if updated:
        db.add(user)
        db.commit()
        db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "contact_info": user.contact_info,
        "role": getattr(user.role, 'value', user.role),
    }


@router.patch('/users/me/seller')
def update_seller_info(
    payload: dict,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """Allow the user to edit their seller information (seller_information, product_description)."""
    seller_info = payload.get('seller_information')
    product_info = payload.get('product_description')

    merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
    if not merchant:
        # create a merchant record for the user (PENDING)
        merchant = Merchant(
            merchant_id=str(uuid.uuid4()),
            user_id=user.id,
            citizen_id=None,
            seller_information=seller_info,
            product_description=product_info,
            approval_status=ApprovalStatus.PENDING,
            citizen_valid=0,
        )
        db.add(merchant)
    else:
        if seller_info is not None:
            merchant.seller_information = seller_info
        if product_info is not None:
            merchant.product_description = product_info
        db.add(merchant)
    db.commit()
    db.refresh(merchant)
    return {
        'merchant_id': merchant.merchant_id,
        'seller_information': merchant.seller_information,
        'product_description': merchant.product_description,
        'approval_status': getattr(merchant.approval_status, 'value', merchant.approval_status),
    }


@router.post('/auth/logout')
def logout(response: Response):
    # clear the HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=os.getenv("ENVIRONMENT") == "production",
        samesite="lax",
        max_age=0,
    )
    return {"msg": "logged out"}
