from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    # register a user
    resp = client.post("/api/auth/register", json={
        "username": "testuser",
        "password": "secret",
        "name": "Test User",
        "contact_info": "test@example.com",
        "role": "GENERAL_USER"
    })
    assert resp.status_code == 201
    # login
    resp = client.post("/api/auth/login", data={
        "username": "testuser",
        "password": "secret"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()
