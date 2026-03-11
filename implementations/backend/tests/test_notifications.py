from fastapi.testclient import TestClient
from app.main import app
from app.database.db_connection import SessionLocal
from app.models.notification import Notification, NotificationType
import datetime

client = TestClient(app)

TEST_USERNAME = "user1"
TEST_PASSWORD = "test_user_password_123"


def test_notifications_flow():
    # register user
    client.post("/api/auth/register", json={
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD,
        "name": "User1",
        "contact_info": "u1@example.com",
        "role": "GENERAL_USER",
    })

    token = client.post(
        "/api/auth/login",
        data={
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
    ).json()["access_token"]

    # insert notification directly
    db = SessionLocal()

    from app.models.user import User
    user = db.query(User).filter(User.username == TEST_USERNAME).first()

    n = Notification(
        notification_id="notif1",
        user_id=user.id,
        title="Test",
        message="Hello",
        type=NotificationType.SYSTEM,
        reference_id="",
        is_read=False,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(n)
    db.commit()
    db.close()

    resp = client.get("/api/notifications", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # mark read
    nid = resp.json()[0]["notification_id"]

    resp2 = client.patch(
        f"/api/notifications/{nid}/read",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert resp2.status_code == 200
    assert resp2.json()["is_read"] is True