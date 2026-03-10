from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_manager_token():
    client.post("/api/auth/register", json={
        "username": "mgr2",
        "password": "pass",
        "name": "Mgr2",
        "contact_info": "mgr2@example.com",
        "role": "BOOTH_MANAGER",
    })
    resp = client.post("/api/auth/login", data={"username": "mgr2", "password": "pass"})
    return resp.json()["access_token"]


def test_booth_crud():
    token = get_manager_token()
    # create event
    ev_resp = client.post(
        "/api/events",
        json={
            "name": "Event1",
            "description": "desc",
            "location": "loc",
            "start_date": "2024-01-01",
            "end_date": "2024-01-02",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ev_resp.status_code == 201
    event_id = ev_resp.json()["event_id"]

    # create booth
    booth_resp = client.post(
        "/api/booths",
        json={
            "event_id": event_id,
            "booth_number": "A1",
            "size": "10x10",
            "price": 100.0,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert booth_resp.status_code == 201
    booth_id = booth_resp.json()["booth_id"]

    # list booths by event
    list_resp = client.get(f"/api/events/{event_id}/booths")
    assert list_resp.status_code == 200
    assert any(b["booth_id"] == booth_id for b in list_resp.json())

    # update booth
    upd_resp = client.put(
        f"/api/booths/{booth_id}",
        json={
            "event_id": event_id,
            "booth_number": "A1",
            "size": "20x20",
            "price": 150.0,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["size"] == "20x20"

    # delete booth
    del_resp = client.delete(
        f"/api/booths/{booth_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 204

    # ensure removed
    list_resp2 = client.get(f"/api/events/{event_id}/booths")
    assert not any(b["booth_id"] == booth_id for b in list_resp2.json())
