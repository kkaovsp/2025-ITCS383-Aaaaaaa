import pytest


def test_registration_and_login(client):
    # Register booth manager
    res = client.post(
        "/api/auth/register",
        json={
            "username": "manager",
            "password": "secret123",
            "name": "Manager",
            "contact_info": "manager@example.com",
            "role": "BOOTH_MANAGER",
        },
    )
    assert res.status_code == 200, res.text
    manager = res.json()
    assert manager["role"] == "BOOTH_MANAGER"

    # Login
    res = client.post(
        "/api/auth/login",
        json={"username": "manager", "password": "secret123"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token

    return token


def test_event_booth_reservation_payment_workflow(client):
    # Setup: create manager and merchant
    client.post(
        "/api/auth/register",
        json={
            "username": "manager2",
            "password": "secret123",
            "name": "Manager",
            "contact_info": "manager@example.com",
            "role": "BOOTH_MANAGER",
        },
    )
    manager_login = client.post(
        "/api/auth/login",
        json={"username": "manager2", "password": "secret123"},
    )
    manager_token = manager_login.json()["access_token"]

    client.post(
        "/api/auth/register",
        json={
            "username": "merchant1",
            "password": "secret123",
            "name": "Merchant One",
            "contact_info": "merchant@example.com",
            "role": "MERCHANT",
            "citizen_id": "1234567890",
            "seller_information": "Test",
            "product_description": "Test product",
        },
    )
    merchant_login = client.post(
        "/api/auth/login",
        json={"username": "merchant1", "password": "secret123"},
    )
    merchant_token = merchant_login.json()["access_token"]

    # Manager creates an event
    event_data = {
        "name": "Test Event",
        "description": "Test event",
        "location": "Test location",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
    }
    res = client.post(
        "/api/events",
        json=event_data,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    event = res.json()

    # Manager creates a booth for the event
    booth_data = {
        "event_id": event["event_id"],
        "booth_number": "A1",
        "size": "3x3",
        "price": 100.0,
        "location": "Front",
        "type": "INDOOR",
        "classification": "TEMPORARY",
        "duration_type": "SHORT_TERM",
        "electricity": True,
        "water_supply": False,
        "outlets": 1,
    }
    res = client.post(
        "/api/booths",
        json=booth_data,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    booth = res.json()

    # Merchant makes a reservation
    reservation_data = {
        "booth_id": booth["booth_id"],
        "merchant_id": merchant_login.json().get("access_token", ""),
        "reservation_type": "SHORT_TERM",
    }
    # Note: merchant_id should be merchant user ID, but login response doesn't include it. We'll query "me" via /api/reservations currently not available.
    # Instead, use the merchant's user id by retrieving data from /api/auth/register response (not returned) so we will adapt: use wrong merchant id to test rejection.

    # Create reservation using correct merchant id by calling /api/reservations after retrieving current user from cookie.
    # For test, we can use the merchant token stored in cookie by FastAPI TestClient.
    res = client.get(
        "/api/reservations",
        headers={"Authorization": f"Bearer {merchant_token}"},
    )
    assert res.status_code == 200

    # We'll create reservation with merchant_id being the current user id extracted from the response list (should be empty) by using token decode.
    # Since we don't have an endpoint to fetch current user, we can use the database directly via test fixture.
    from app.core.security import decode_access_token

    payload = decode_access_token(merchant_token)
    merchant_id = payload["sub"]
    reservation_data["merchant_id"] = merchant_id

    res = client.post(
        "/api/reservations",
        json=reservation_data,
        headers={"Authorization": f"Bearer {merchant_token}"},
    )
    assert res.status_code == 200, res.text
    reservation = res.json()

    # Merchant creates payment
    payment_data = {
        "reservation_id": reservation["reservation_id"],
        "amount": 100.0,
        "method": "CREDIT_CARD",
    }
    res = client.post(
        "/api/payments",
        json=payment_data,
        headers={"Authorization": f"Bearer {merchant_token}"},
    )
    assert res.status_code == 200
    payment = res.json()

    # Manager approves payment
    res = client.post(
        f"/api/payments/{payment['payment_id']}/approve",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    approved = res.json()
    assert approved["payment_status"] == "APPROVED"
