from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..database.db_connection import SessionLocal
from ..models.user import User, UserRole
from ..models.merchant import Merchant, ApprovalStatus
from ..models.notification import Notification, NotificationType
from ..schemas.user_schema import UserCreate, UserLogin
from ..services import auth_service
from ..services.dependencies import get_current_user
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
import uuid
import datetime
import re
import logging

import os

from typing import Annotated

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_citizen_with_moi(citizen_id: str | None) -> bool:
    if not citizen_id:
        return False
    return bool(re.fullmatch(r"\d{13}", citizen_id))


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

    role_value = UserRole(user.role) if user.role else UserRole.GENERAL_USER

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
