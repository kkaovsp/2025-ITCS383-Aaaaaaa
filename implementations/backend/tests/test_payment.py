from fastapi.testclient import TestClient
from app.main import app
from io import BytesIO

client = TestClient(app)

TEST_MANAGER_USERNAME = "mgr4"
TEST_MANAGER_PASSWORD = "test_manager_password_123"

TEST_MERCHANT_USERNAME = "merch2"
TEST_MERCHANT_PASSWORD = "test_merchant_password_123"


def setup_reservation():
    # create manager
    client.post("/api/auth/register", json={
        "username": TEST_MANAGER_USERNAME,
        "password": TEST_MANAGER_PASSWORD,
        "name": "Mgr4",
        "contact_info": "mgr4@example.com",
        "role": "BOOTH_MANAGER",
    })

    mgr_token = client.post(
        "/api/auth/login",
        data={
            "username": TEST_MANAGER_USERNAME,
            "password": TEST_MANAGER_PASSWORD
        }
    ).json()["access_token"]

    # create merchant
    client.post("/api/auth/register", json={
        "username": TEST_MERCHANT_USERNAME,
        "password": TEST_MERCHANT_PASSWORD,
        "name": "Merch2",
        "contact_info": "merch2@example.com",
        "role": "MERCHANT",
        "citizen_id": "6789",
        "product_description": "goods",
    })

    merch_token = client.post(
        "/api/auth/login",
        data={
            "username": TEST_MERCHANT_USERNAME,
            "password": TEST_MERCHANT_PASSWORD
        }
    ).json()["access_token"]

    # Merchant must be approved before they can create reservations.
    me = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {merch_token}"},
    )
    merchant_user_id = me.json()["id"]
    approve = client.patch(
        f"/api/users/{merchant_user_id}/merchant_status",
        json={"status": "APPROVED"},
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert approve.status_code == 200

    # create event
    ev = client.post(
        "/api/events",
        json={
            "name": "EventP",
            "description": "desc",
            "location": "loc",
            "start_date": "2024-03-01",
            "end_date": "2024-03-02",
        },
        headers={"Authorization": f"Bearer {mgr_token}"},
    ).json()

    event_id = ev["event_id"]

    # create booth
    b = client.post(
        "/api/booths",
        json={
            "event_id": event_id,
            "booth_number": "C1",
            "size": "5x5",
            "price": 75.0,
        },
        headers={"Authorization": f"Bearer {mgr_token}"},
    ).json()

    booth_id = b["booth_id"]

    # create reservation
    r = client.post(
        "/api/reservations",
        json={
            "booth_id": booth_id,
            "reservation_type": "SHORT_TERM",
        },
        headers={"Authorization": f"Bearer {merch_token}"},
    )

    assert r.status_code == 201
    reservation_payload = r.json()

    return mgr_token, merch_token, reservation_payload["reservation_id"]


def test_payment_and_approval():
    mgr_token, merch_token, reservation_id = setup_reservation()

    # create payment
    pay = client.post(
        "/api/payments",
        json={
            "reservation_id": reservation_id,
            "amount": 75.0,
            "method": "CREDIT_CARD",
        },
        headers={"Authorization": f"Bearer {merch_token}"},
    )

    assert pay.status_code == 201
    pid = pay.json()["payment_id"]

    # manager approve payment
    appr = client.patch(
        f"/api/payments/{pid}/approve",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )

    assert appr.status_code == 200
    assert appr.json()["payment_status"] == "APPROVED"


def test_bank_transfer_requires_and_serves_slip():
    mgr_token, merch_token, reservation_id = setup_reservation()

    pay = client.post(
        "/api/payments",
        json={
            "reservation_id": reservation_id,
            "amount": 75.0,
            "method": "BANK_TRANSFER",
        },
        headers={"Authorization": f"Bearer {merch_token}"},
    )

    assert pay.status_code == 201
    pid = pay.json()["payment_id"]

    # approval should fail before a slip is uploaded
    before_upload = client.patch(
        f"/api/payments/{pid}/approve",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert before_upload.status_code == 400

    upload = client.post(
        f"/api/payments/upload-slip?payment_id={pid}",
        headers={"Authorization": f"Bearer {merch_token}"},
        files={"file": ("slip.png", BytesIO(b"fake-slip-bytes"), "image/png")},
    )
    assert upload.status_code == 200

    # manager can fetch slip file for validation
    slip = client.get(
        f"/api/payments/{pid}/slip",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert slip.status_code == 200
    assert slip.content == b"fake-slip-bytes"

    after_upload = client.patch(
        f"/api/payments/{pid}/approve",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert after_upload.status_code == 200
    assert after_upload.json()["payment_status"] == "APPROVED"