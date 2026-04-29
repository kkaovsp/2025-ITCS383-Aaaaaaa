from io import BytesIO
import pathlib

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.db_connection import SessionLocal
from app.models.booth import Booth, BoothStatus
from app.models.event import Event
from app.models.merchant import Merchant, ApprovalStatus
from app.models.notification import Notification
from app.models.payment import Payment, PaymentStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User
from app.routes import auth_routes
from app.routes import merchant_routes
from app.routes import payment_routes


client = TestClient(app)
PASSWORD = "quality_password_123"


def register_user(username, role="GENERAL_USER", **overrides):
    payload = {
        "username": username,
        "password": PASSWORD,
        "name": username.title(),
        "contact_info": f"{username}@example.com",
        "role": role,
    }
    payload.update(overrides)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201, response.text
    return response


def login(username, password=PASSWORD):
    response = client.post("/api/auth/login", data={"username": username, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def create_manager(username="quality_manager"):
    register_user(username, "BOOTH_MANAGER")
    return login(username)


def create_approved_merchant(username="quality_merchant"):
    manager_token = create_manager(f"{username}_mgr")
    register_user(
        username,
        "MERCHANT",
        citizen_id="1234567890123",
        seller_information="seller info",
        product_description="products",
    )
    merchant_token = login(username)
    me = client.get("/api/users/me", headers=auth_header(merchant_token)).json()
    approve = client.patch(
        f"/api/users/{me['id']}/merchant_status",
        json={"status": "APPROVED"},
        headers=auth_header(manager_token),
    )
    assert approve.status_code == 200, approve.text
    return manager_token, merchant_token


def create_event_and_booth(manager_token, booth_price=100.0):
    event = client.post(
        "/api/events",
        json={
            "name": "Quality Event",
            "description": "event desc",
            "location": "Hall Q",
            "start_date": "2026-05-01",
            "end_date": "2026-05-02",
        },
        headers=auth_header(manager_token),
    )
    assert event.status_code == 201, event.text
    event_id = event.json()["event_id"]

    booth = client.post(
        "/api/booths",
        json={
            "event_id": event_id,
            "booth_number": "Q1",
            "size": "3x3",
            "price": booth_price,
            "location": "Front",
            "type": "INDOOR",
            "classification": "TEMPORARY",
            "duration_type": "SHORT_TERM",
            "electricity": True,
            "outlets": 2,
            "water_supply": True,
        },
        headers=auth_header(manager_token),
    )
    assert booth.status_code == 201, booth.text
    return event_id, booth.json()["booth_id"]


def create_reservation_fixture(username="pay_merchant"):
    manager_token, merchant_token = create_approved_merchant(username)
    _, booth_id = create_event_and_booth(manager_token, booth_price=100.0)
    reservation = client.post(
        "/api/reservations",
        json={"booth_id": booth_id, "reservation_type": "SHORT_TERM"},
        headers=auth_header(merchant_token),
    )
    assert reservation.status_code == 201, reservation.text
    return manager_token, merchant_token, reservation.json()["reservation_id"], booth_id


def test_auth_error_logout_seller_and_external_moi_fallback(monkeypatch):
    assert client.post("/api/auth/login", data={"username": "missing", "password": PASSWORD}).status_code == 401

    register_user("auth_quality")
    assert client.post("/api/auth/register", json={
        "username": "auth_quality",
        "password": PASSWORD,
        "name": "Duplicate",
        "contact_info": "dup@example.com",
        "role": "GENERAL_USER",
    }).status_code == 400
    assert client.post("/api/auth/login", data={"username": "auth_quality", "password": "wrong"}).status_code == 401

    token = login("auth_quality")
    assert client.get("/api/auth/me", headers=auth_header(token)).json()["username"] == "auth_quality"
    assert client.patch("/api/users/me", headers=auth_header(token), json={}).status_code == 200

    seller_created = client.patch(
        "/api/users/me/seller",
        headers=auth_header(token),
        json={"seller_information": "new seller", "product_description": "new product"},
    )
    assert seller_created.status_code == 200
    seller_updated = client.patch(
        "/api/users/me/seller",
        headers=auth_header(token),
        json={"seller_information": "updated seller"},
    )
    assert seller_updated.status_code == 200
    assert seller_updated.json()["seller_information"] == "updated seller"

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert logout.json()["msg"] == "logged out"

    class FailingUrlopen:
        def __call__(self, *args, **kwargs):
            raise auth_routes.urllib.error.URLError("offline")

    monkeypatch.setenv("MOI_API_URL", "https://example.invalid/verify")
    monkeypatch.setattr(auth_routes.urllib.request, "urlopen", FailingUrlopen())
    assert auth_routes.verify_citizen_with_moi("1234567890123") is True


def test_event_list_update_delete_and_cascade_notifications():
    manager_token, merchant_token = create_approved_merchant("event_merchant")
    event_id, booth_id = create_event_and_booth(manager_token, booth_price=100.0)

    listed = client.get("/api/events")
    assert listed.status_code == 200
    assert any(e["created_by_name"] for e in listed.json())

    assert client.put(
        "/api/events/not-found",
        json={"name": "X", "description": "X", "location": "X", "start_date": "2026-01-01", "end_date": "2026-01-02"},
        headers=auth_header(manager_token),
    ).status_code == 404

    update = client.put(
        f"/api/events/{event_id}",
        json={"name": "Updated Event", "description": "updated", "location": "Updated Hall", "start_date": "2026-06-01", "end_date": "2026-06-02"},
        headers=auth_header(manager_token),
    )
    assert update.status_code == 200

    reservation = client.post(
        "/api/reservations",
        json={"booth_id": booth_id, "reservation_type": "SHORT_TERM"},
        headers=auth_header(merchant_token),
    )
    assert reservation.status_code == 201
    payment = client.post(
        "/api/payments",
        json={"reservation_id": reservation.json()["reservation_id"], "amount": 100.0, "method": "CREDIT_CARD"},
        headers=auth_header(merchant_token),
    )
    assert payment.status_code == 201

    assert client.delete("/api/events/not-found", headers=auth_header(manager_token)).status_code == 404
    deleted = client.delete(f"/api/events/{event_id}", headers=auth_header(manager_token))
    assert deleted.status_code == 204

    db = SessionLocal()
    try:
        assert db.query(Event).filter(Event.event_id == event_id).first() is None
        assert db.query(Booth).filter(Booth.booth_id == booth_id).first() is None
        assert db.query(Notification).filter(Notification.title == "Reservation cancelled").first() is not None
    finally:
        db.close()


def test_merchant_status_error_and_listing_branches():
    manager_token = create_manager("merchant_quality_mgr")
    register_user("merchant_quality_user")
    user_token = login("merchant_quality_user")
    user_id = client.get("/api/users/me", headers=auth_header(user_token)).json()["id"]

    db = SessionLocal()
    try:
        pending_rows = merchant_routes.list_pending_merchants(user=object(), db=db)
        assert isinstance(pending_rows, list)
        all_apps = merchant_routes.list_all_applications(user=object(), db=db)
        assert all(row["role"] != "BOOTH_MANAGER" for row in all_apps)
    finally:
        db.close()

    assert client.patch(
        "/api/users/missing/merchant_status",
        json={"status": "APPROVED"},
        headers=auth_header(manager_token),
    ).status_code == 404
    assert client.patch(
        f"/api/users/{user_id}/merchant_status",
        json={"status": "BAD"},
        headers=auth_header(manager_token),
    ).status_code == 400

    created = client.patch(
        f"/api/users/{user_id}/merchant_status",
        json={"status": "REJECTED"},
        headers=auth_header(manager_token),
    )
    assert created.status_code == 200
    assert created.json()["approval_status"] == "REJECTED"

    merchant_id = created.json()["merchant_id"]
    assert client.patch(
        f"/api/merchants/{merchant_id}/status",
        json={"status_value": "INVALID"},
        headers=auth_header(manager_token),
    ).status_code == 400
    assert client.patch(
        "/api/merchants/missing/status",
        json={"status_value": "APPROVED"},
        headers=auth_header(manager_token),
    ).status_code == 404
    assert client.patch(
        "/api/merchants/missing",
        params={"seller_information": "x", "product_description": "y"},
        headers=auth_header(user_token),
    ).status_code == 404
    assert client.patch("/api/merchants/missing/approve", headers=auth_header(manager_token)).status_code == 404
    assert client.patch("/api/merchants/missing/reject", headers=auth_header(manager_token)).status_code == 404


def test_payment_error_list_slip_and_approval_branches(tmp_path, monkeypatch):
    manager_token, merchant_token, reservation_id, booth_id = create_reservation_fixture()

    assert client.get("/api/payments", headers=auth_header(manager_token)).status_code == 200
    assert client.post(
        "/api/payments",
        json={"reservation_id": "missing", "amount": 100.0, "method": "CREDIT_CARD"},
        headers=auth_header(merchant_token),
    ).status_code == 404

    other_manager, other_merchant = create_approved_merchant("other_pay_merchant")
    assert other_manager
    assert client.post(
        "/api/payments",
        json={"reservation_id": reservation_id, "amount": 100.0, "method": "CREDIT_CARD"},
        headers=auth_header(other_merchant),
    ).status_code == 403
    assert client.post(
        "/api/payments",
        json={"reservation_id": reservation_id, "amount": 1.0, "method": "CREDIT_CARD"},
        headers=auth_header(merchant_token),
    ).status_code == 400

    db = SessionLocal()
    try:
        booth = db.query(Booth).filter(Booth.booth_id == booth_id).first()
        booth_id_missing = booth.booth_id
        db.delete(booth)
        db.commit()
    finally:
        db.close()
    assert booth_id_missing
    assert client.post(
        "/api/payments",
        json={"reservation_id": reservation_id, "amount": 100.0, "method": "CREDIT_CARD"},
        headers=auth_header(merchant_token),
    ).status_code == 404

    manager_token, merchant_token, reservation_id, _ = create_reservation_fixture("pay_merchant_second")
    payment = client.post(
        "/api/payments",
        json={"reservation_id": reservation_id, "amount": 100.0, "method": "BANK_TRANSFER"},
        headers=auth_header(merchant_token),
    )
    assert payment.status_code == 201
    payment_id = payment.json()["payment_id"]

    assert client.patch("/api/payments/missing/approve", headers=auth_header(manager_token)).status_code == 404
    assert client.post(
        "/api/payments/upload-slip?payment_id=missing",
        headers=auth_header(merchant_token),
        files={"file": ("slip.png", BytesIO(b"x"), "image/png")},
    ).status_code == 404
    assert client.post(
        f"/api/payments/upload-slip?payment_id={payment_id}",
        headers=auth_header(other_merchant),
        files={"file": ("slip.png", BytesIO(b"x"), "image/png")},
    ).status_code == 403
    assert client.post(
        f"/api/payments/upload-slip?payment_id={payment_id}",
        headers=auth_header(merchant_token),
        files={"file": ("malware.exe", BytesIO(b"x"), "application/octet-stream")},
    ).status_code == 400
    assert client.get(f"/api/payments/{payment_id}/slip", headers=auth_header(merchant_token)).status_code == 404

    monkeypatch.setattr(payment_routes, "UPLOAD_ROOT", pathlib.Path(tmp_path))
    slip_dir = payment_routes._payment_slip_dir(payment_id)
    slip_dir.mkdir(parents=True)
    (slip_dir / "bad.bin").write_bytes(b"bad")
    db = SessionLocal()
    try:
        pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()
        pay.slip_url = f"/api/payments/{payment_id}/slip"
        db.add(pay)
        db.commit()
    finally:
        db.close()
    assert client.get(f"/api/payments/{payment_id}/slip", headers=auth_header(merchant_token)).status_code == 415

    (slip_dir / "bad.bin").unlink()
    (slip_dir / "safe.pdf").write_bytes(b"pdf")
    assert client.get(f"/api/payments/{payment_id}/slip?download=true", headers=auth_header(manager_token)).status_code == 200
    assert client.patch(f"/api/payments/{payment_id}/approve", headers=auth_header(manager_token)).status_code == 200


def test_payment_list_for_general_user_and_orphan_booth_payment():
    register_user("plain_payment_user")
    plain_token = login("plain_payment_user")
    assert client.get("/api/payments", headers=auth_header(plain_token)).json() == []

    manager_token = create_manager("orphan_mgr")
    register_user("orphan_merchant", "MERCHANT", citizen_id="1234567890123", product_description="p")
    merchant_token = login("orphan_merchant")
    merchant_id = client.patch(
        f"/api/users/{client.get('/api/users/me', headers=auth_header(merchant_token)).json()['id']}/merchant_status",
        json={"status": "APPROVED"},
        headers=auth_header(manager_token),
    ).json()["merchant_id"]

    db = SessionLocal()
    try:
        db.add(Reservation(
            reservation_id="orphan_reservation",
            booth_id="missing_booth",
            merchant_id=merchant_id,
            reservation_type="SHORT_TERM",
            status=ReservationStatus.PENDING_PAYMENT,
        ))
        db.commit()
    finally:
        db.close()

    response = client.post(
        "/api/payments",
        json={"reservation_id": "orphan_reservation", "amount": 100.0, "method": "TRUEMONEY"},
        headers=auth_header(merchant_token),
    )
    assert response.status_code == 404


def test_direct_model_schema_and_helper_branches(tmp_path, monkeypatch):
    # Cover small helper/schema branches that support the baseline Sonar scope.
    from app.schemas.notification_schema import NotificationCreate

    schema = NotificationCreate(user_id="u1", title="T", message="M", type="SYSTEM")
    assert schema.title == "T"

    assert payment_routes._sanitize_filename("../bad name.png") == "bad_name.png"
    assert payment_routes._sanitize_filename("***") == "___"
    assert payment_routes._is_allowed_slip("file.bin", "image/png") is True
    assert payment_routes._is_allowed_slip("file.bin", "application/pdf") is True
    assert payment_routes._is_allowed_slip("file.bin", None) is False

    monkeypatch.setattr(payment_routes, "UPLOAD_ROOT", pathlib.Path(tmp_path))
    assert payment_routes._latest_slip_file("missing") is None
    directory = payment_routes._payment_slip_dir("p1")
    directory.mkdir(parents=True)
    assert payment_routes._latest_slip_file("p1") is None
    (directory / "a.png").write_bytes(b"a")
    assert payment_routes._latest_slip_file("p1").name == "a.png"
