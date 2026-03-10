from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def setup_reservation():
    # similar to reservation setup
    client.post("/api/auth/register", json={
        "username": "mgr4",
        "password": "pass",
        "name": "Mgr4",
        "contact_info": "mgr4@example.com",
        "role": "BOOTH_MANAGER",
    })
    mgr_token = client.post("/api/auth/login", data={"username": "mgr4", "password": "pass"}).json()["access_token"]
    client.post("/api/auth/register", json={
        "username": "merch2",
        "password": "pass",
        "name": "Merch2",
        "contact_info": "merch2@example.com",
        "role": "MERCHANT",
        "citizen_id": "6789",
        "product_description": "goods",
    })
    merch_token = client.post("/api/auth/login", data={"username": "merch2", "password": "pass"}).json()["access_token"]
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
    r = client.post(
        "/api/reservations",
        json={
            "booth_id": booth_id,
            "reservation_type": "SHORT_TERM",
        },
        headers={"Authorization": f"Bearer {merch_token}"},
    ).json()
    return mgr_token, merch_token, r["reservation_id"]


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

    # manager approve
    appr = client.patch(
        f"/api/payments/{pid}/approve",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert appr.status_code == 200
    assert appr.json()["payment_status"] == "APPROVED"
