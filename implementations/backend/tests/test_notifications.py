from fastapi.testclient import TestClient
from app.main import app
from app.database.db_connection import SessionLocal
from app.models.notification import Notification, NotificationType
import datetime

client = TestClient(app)


def test_notifications_flow():
    # register user
    client.post("/api/auth/register", json={
        "username": "user1",
        "password": "pass",
        "name": "User1",
        "contact_info": "u1@example.com",
        "role": "GENERAL_USER",
    })
    token = client.post("/api/auth/login", data={"username": "user1", "password": "pass"}).json()["access_token"]

    # insert notification directly
    db = SessionLocal()
    n = Notification(
        notification_id="notif1",
        user_id=db.query(Notification).first().user_id if db.query(Notification).first() else "",
        title="Test",
        message="Hello",
        type=NotificationType.SYSTEM,
        reference_id="",
        is_read=False,
        created_at=datetime.datetime.utcnow(),
    )
    # adjust user_id to the created user id
    from app.models.user import User
    user = db.query(User).filter(User.username == "user1").first()
    n.user_id = user.id
    db.add(n)
    db.commit()
    db.close()

    resp = client.get("/api/notifications", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # mark read
    nid = resp.json()[0]["notification_id"]
    resp2 = client.patch(f"/api/notifications/{nid}/read", headers={"Authorization": f"Bearer {token}"})
    assert resp2.status_code == 200
    assert resp2.json()["is_read"] == True
