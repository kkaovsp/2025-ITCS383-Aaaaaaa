from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_MANAGER_USERNAME = "manager"
TEST_MANAGER_PASSWORD = "test_manager_password_123"


def get_token():
    # create manager user
    client.post("/api/auth/register", json={
        "username": TEST_MANAGER_USERNAME,
        "password": TEST_MANAGER_PASSWORD,
        "name": "Mgr",
        "contact_info": "mgr@example.com",
        "role": "BOOTH_MANAGER"
    })

    resp = client.post(
        "/api/auth/login",
        data={
            "username": TEST_MANAGER_USERNAME,
            "password": TEST_MANAGER_PASSWORD
        }
    )

    return resp.json()["access_token"]


def test_create_event():
    token = get_token()

    resp = client.post(
        "/api/events",
        json={
            "name": "Test Event",
            "description": "desc",
            "location": "here",
            "start_date": "2025-01-01",
            "end_date": "2025-01-02"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert resp.status_code == 201
    data = resp.json()

    assert data["name"] == "Test Event"