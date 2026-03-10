from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def setup_environment():
    # create manager and merchant
    client.post("/api/auth/register", json={
        "username": "mgr3",
        "password": "pass",
        "name": "Mgr3",
        "contact_info": "mgr3@example.com",
        "role": "BOOTH_MANAGER",
    })
    mgr_token = client.post("/api/auth/login", data={"username": "mgr3", "password": "pass"}).json()["access_token"]

    client.post("/api/auth/register", json={
        "username": "merch1",
        "password": "pass",
        "name": "Merch1",
        "contact_info": "merch@example.com",
        "role": "MERCHANT",
        "citizen_id": "12345",
        "product_description": "stuff",
    })
    merch_token = client.post("/api/auth/login", data={"username": "merch1", "password": "pass"}).json()["access_token"]

    # manager makes event and booth
    ev = client.post(
        "/api/events",
        json={
            "name": "EventR",
            "description": "desc",
            "location": "loc",
            "start_date": "2024-02-01",
            "end_date": "2024-02-02",
        },
        headers={"Authorization": f"Bearer {mgr_token}"},
    ).json()
    event_id = ev["event_id"]
    b = client.post(
        "/api/booths",
        json={
            "event_id": event_id,
            "booth_number": "B1",
            "size": "5x5",
            "price": 50.0,
        },
        headers={"Authorization": f"Bearer {mgr_token}"},
    ).json()
    booth_id = b["booth_id"]
    return mgr_token, merch_token, event_id, booth_id


def test_reservation_flow():
    mgr_token, merch_token, event_id, booth_id = setup_environment()
    # merchant reserves
    resp = client.post(
        "/api/reservations",
        json={
            "booth_id": booth_id,
            "reservation_type": "SHORT_TERM",
        },
        headers={"Authorization": f"Bearer {merch_token}"},
    )
    assert resp.status_code == 201
    resv_id = resp.json()["reservation_id"]

    # can't double-book
    resp2 = client.post(
        "/api/reservations",
        json={
            "booth_id": booth_id,
            "reservation_type": "SHORT_TERM",
        },
        headers={"Authorization": f"Bearer {merch_token}"},
    )
    assert resp2.status_code == 400

    # manager can list all
    all_res = client.get("/api/reservations", headers={"Authorization": f"Bearer {mgr_token}"})
    assert any(r["reservation_id"] == resv_id for r in all_res.json())
