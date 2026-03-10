from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from ..database.db_connection import SessionLocal
from ..models.merchant import Merchant, ApprovalStatus
from ..services.dependencies import get_current_user, require_role

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
    db.commit()
    db.refresh(merchant)
    return merchant


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
