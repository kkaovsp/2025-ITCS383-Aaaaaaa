from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_PASSWORD = "test_password_123"


def _with_valid_check_digit(base12: str) -> str:
    digits = [int(ch) for ch in base12]
    weighted_sum = sum(digits[i] * (13 - i) for i in range(12))
    check_digit = (11 - (weighted_sum % 11)) % 10
    return f"{base12}{check_digit}"

def test_register_and_login():
    # register a user
    resp = client.post("/api/auth/register", json={
        "username": "testuser",
        "password": TEST_PASSWORD,
        "name": "Test User",
        "contact_info": "test@example.com",
        "role": "GENERAL_USER"
    })

    assert resp.status_code == 201

    # login
    resp = client.post("/api/auth/login", data={
        "username": "testuser",
        "password": TEST_PASSWORD
    })

    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_mock_moi_validation_and_merchant_citizen_flag():
    valid_id = _with_valid_check_digit("110170020345")
    invalid_id = "1234"

    verify_ok = client.get(f"/api/mock/moi/verify?citizen_id={valid_id}")
    assert verify_ok.status_code == 200
    assert verify_ok.json().get("is_valid") is True

    verify_bad = client.get(f"/api/mock/moi/verify?citizen_id={invalid_id}")
    assert verify_bad.status_code == 200
    assert verify_bad.json().get("is_valid") is False

    # Register merchant with valid citizen id -> citizen_valid should be 1
    reg_ok = client.post("/api/auth/register", json={
        "username": "merchant_valid",
        "password": TEST_PASSWORD,
        "name": "Merchant Valid",
        "contact_info": "valid@example.com",
        "role": "MERCHANT",
        "citizen_id": valid_id,
        "seller_information": "food",
        "product_description": "snacks",
    })
    assert reg_ok.status_code == 201

    login_ok = client.post("/api/auth/login", data={
        "username": "merchant_valid",
        "password": TEST_PASSWORD,
    })
    token_ok = login_ok.json()["access_token"]
    me_ok = client.get("/api/users/me", headers={"Authorization": f"Bearer {token_ok}"})
    assert me_ok.status_code == 200
    assert me_ok.json().get("citizen_valid") == 1

    # Register merchant with invalid citizen id -> citizen_valid should be 0
    reg_bad = client.post("/api/auth/register", json={
        "username": "merchant_invalid",
        "password": TEST_PASSWORD,
        "name": "Merchant Invalid",
        "contact_info": "invalid@example.com",
        "role": "MERCHANT",
        "citizen_id": invalid_id,
        "seller_information": "craft",
        "product_description": "art",
    })
    assert reg_bad.status_code == 201

    login_bad = client.post("/api/auth/login", data={
        "username": "merchant_invalid",
        "password": TEST_PASSWORD,
    })
    token_bad = login_bad.json()["access_token"]
    me_bad = client.get("/api/users/me", headers={"Authorization": f"Bearer {token_bad}"})
    assert me_bad.status_code == 200
    assert me_bad.json().get("citizen_valid") == 0