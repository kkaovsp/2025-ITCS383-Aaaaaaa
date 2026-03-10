from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..database.db_connection import SessionLocal
from ..models.user import User, UserRole
from ..models.merchant import Merchant
from ..schemas.user_schema import UserCreate, UserLogin
from ..services import auth_service
import uuid
import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # check existing username
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed = auth_service.hash_password(user.password)
    new_user = User(
        id=str(uuid.uuid4()),
        username=user.username,
        password=hashed,
        name=user.name,
        contact_info=user.contact_info,
        role=user.role,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new_user)
    if user.role == UserRole.MERCHANT.value:
        # create merchant entry and optionally verify citizen_id
        merchant = Merchant(
            merchant_id=str(uuid.uuid4()),
            user_id=new_user.id,
            citizen_id=user.citizen_id,
            seller_information="",
            product_description=user.product_description,
            approval_status="PENDING",
        )
        db.add(merchant)
    db.commit()
    return {"msg": "registration successful"}


@router.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth_service.create_access_token({"sub": user.id, "role": user.role.value if isinstance(user.role, UserRole) else user.role})
    return {"access_token": token, "token_type": "bearer"}
