from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
import uuid

from ..database.db_connection import SessionLocal
from ..models.booth import Booth
from ..schemas.booth_schema import BoothCreate
from ..services.dependencies import require_role

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/events/{event_id}/booths")
def list_booths(event_id: str, db: Session = Depends(get_db)):
    return db.query(Booth).filter(Booth.event_id == event_id).all()


@router.post("/booths", status_code=status.HTTP_201_CREATED)
def create_booth(booth: BoothCreate, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    new = Booth(
        booth_id=str(uuid.uuid4()),
        event_id=booth.event_id,
        booth_number=booth.booth_number,
        size=booth.size,
        price=booth.price,
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.put("/booths/{booth_id}")
def update_booth(booth_id: str, booth: BoothCreate, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    existing = db.query(Booth).filter(Booth.booth_id == booth_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Booth not found")
    existing.event_id = booth.event_id
    existing.booth_number = booth.booth_number
    existing.size = booth.size
    existing.price = booth.price
    db.commit()
    # refresh so that returned object contains the latest column values
    db.refresh(existing)
    return existing


@router.delete("/booths/{booth_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booth(booth_id: str, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    existing = db.query(Booth).filter(Booth.booth_id == booth_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Booth not found")
    db.delete(existing)
    db.commit()
    return None
