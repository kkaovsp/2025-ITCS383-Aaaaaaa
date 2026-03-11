from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
import datetime
import uuid

from ..database.db_connection import SessionLocal
from ..models.event import Event
from ..models.booth import Booth
from ..models.reservation import Reservation
from ..models.payment import Payment
from ..models.merchant import Merchant
from ..models.user import User
from ..models.notification import Notification, NotificationType
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
def list_events(
    db: Annotated[Session, Depends(get_db)]
):
    rows = db.query(Event).all()
    out = []

    for e in rows:
        creator = db.query(User).filter(User.id == e.created_by).first()
        created_by_name = None
        if creator:
            created_by_name = creator.name or creator.username

        out.append(
            {
                "event_id": e.event_id,
                "name": e.name,
                "description": e.description,
                "location": e.location,
                "start_date": e.start_date,
                "end_date": e.end_date,
                "created_by": e.created_by,
                "created_by_name": created_by_name,
                "created_at": e.created_at,
            }
        )

    return out


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(
    event: EventCreate,
    user: Annotated[dict, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)]
):
    new = Event(
        event_id=str(uuid.uuid4()),
        name=event.name,
        description=event.description,
        location=event.location,
        start_date=event.start_date,
        end_date=event.end_date,
        created_by=user.id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.put(
    "/events/{event_id}",
    responses={404: {"description": "Event not found"}}
)
def update_event(
    event_id: str,
    event: EventCreate,
    user: Annotated[dict, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)]
):
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


@router.delete(
    "/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "Event not found"}}
)
def delete_event(
    event_id: str,
    user: Annotated[dict, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)]
):
    existing = db.query(Event).filter(Event.event_id == event_id).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    # delete related payments, reservations, and booths, notifying affected merchants
    booths = db.query(Booth).filter(Booth.event_id == event_id).all()

    for b in booths:
        reservations = db.query(Reservation).filter(Reservation.booth_id == b.booth_id).all()

        for r in reservations:
            payments = db.query(Payment).filter(Payment.reservation_id == r.reservation_id).all()

            for p in payments:
                db.delete(p)

            # notify merchant (lookup the merchant -> user)
            if r.merchant_id:
                m = db.query(Merchant).filter(Merchant.merchant_id == r.merchant_id).first()

                if m and m.user_id:
                    note = Notification(
                        notification_id=str(uuid.uuid4()),
                        user_id=m.user_id,
                        title="Reservation cancelled",
                        message=f"Your reservation {r.reservation_id} was cancelled because the event '{existing.name}' was removed.",
                        type=NotificationType.RESERVATION,
                        reference_id=r.reservation_id,
                        is_read=False,
                        created_at=datetime.datetime.now(datetime.timezone.utc),
                    )

                    db.add(note)

            db.delete(r)

        db.delete(b)

    db.delete(existing)
    db.commit()
    return None