from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
import uuid

from ..database.db_connection import SessionLocal
from ..models.event import Event
from ..schemas.event_schema import EventCreate
from ..services.dependencies import get_current_user, require_role

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/events")
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).all()


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(event: EventCreate, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    new = Event(
        event_id=str(uuid.uuid4()),
        name=event.name,
        description=event.description,
        location=event.location,
        start_date=event.start_date,
        end_date=event.end_date,
        created_by=user.id,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.put("/events/{event_id}")
def update_event(event_id: str, event: EventCreate, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    existing = db.query(Event).filter(Event.event_id == event_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    existing.name = event.name
    existing.description = event.description
    existing.location = event.location
    existing.start_date = event.start_date
    existing.end_date = event.end_date
    db.commit()
    return existing


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    existing = db.query(Event).filter(Event.event_id == event_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(existing)
    db.commit()
    return None
