import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.dependencies import get_current_user, require_role
from app.database.db_connection import SessionLocal
from app.models.merchant import Merchant, ApprovalStatus


class DummyUser:
    def __init__(self, id=1, role="GENERAL_USER"):
        self.user_id = id
        self.id = id
        self.role = role


class DummyQuery:
    def __init__(self, data=None):
        self.data = data or []

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return None

    def all(self):
        return self.data


class DummyDB:
    def query(self, *args, **kwargs):
        return DummyQuery()

    def add(self, *args, **kwargs):
        pass

    def commit(self):
        pass

    def refresh(self, *args, **kwargs):
        pass

    def close(self):
        pass


def override_get_current_user():
    return DummyUser()


def override_require_role(roles):
    def wrapper():
        return DummyUser(role="BOOTH_MANAGER")
    return wrapper


def override_get_db():
    db = DummyDB()
    try:
        yield db
    finally:
        pass


app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[require_role] = override_require_role


@pytest.fixture
def client():
    return TestClient(app)


def test_list_reservations(client):
    app.dependency_overrides[get_current_user] = lambda: DummyUser(id=1, role="MERCHANT")

    db = SessionLocal()
    db.add(Merchant(merchant_id=1, user_id=1, approval_status=ApprovalStatus.APPROVED))
    db.commit()
    db.close()

    resp = client.get("/api/reservations")

    assert resp.status_code == 200


def test_create_reservation_forbidden(client):
    app.dependency_overrides[get_current_user] = lambda: DummyUser(role="GENERAL_USER")

    resp = client.post(
        "/api/reservations",
        json={
            "booth_id": "1",
            "reservation_type": "ONLINE"
        },
    )

    assert resp.status_code == 403


def test_create_reservation_success(client):
    app.dependency_overrides[get_current_user] = lambda: DummyUser(id=1, role="MERCHANT")

    db = SessionLocal()

    merchant = Merchant(
        merchant_id=1,
        user_id=1,
        approval_status=ApprovalStatus.APPROVED,
    )
    db.add(merchant)
    db.commit()
    db.close()

    resp = client.post(
        "/api/reservations",
        json={
            "booth_id": "1",
            "reservation_type": "SHORT_TERM"
        },
    )

    assert resp.status_code in [200, 201]


def test_confirm_reservation_not_found(client):
    app.dependency_overrides[get_current_user] = lambda: DummyUser(role="BOOTH_MANAGER")

    resp = client.patch("/api/reservations/invalid-id/confirm")

    assert resp.status_code == 404


def test_cancel_reservation_not_found(client):
    app.dependency_overrides[get_current_user] = lambda: DummyUser(role="MERCHANT")

    resp = client.patch("/api/reservations/invalid-id/cancel")

    assert resp.status_code == 404

def test_list_reservations_manager(client):
    from app.database.db_connection import SessionLocal
    from app.models.reservation import Reservation, ReservationStatus
    from app.models.user import User
    from app.main import app
    from app.services.dependencies import get_current_user

    class DummyManager:
        def __init__(self):
            self.id = 99
            self.role = "BOOTH_MANAGER"

    app.dependency_overrides[get_current_user] = lambda: DummyManager()

    db = SessionLocal()

    res = Reservation(
        reservation_id="r1",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT
    )

    db.add(res)
    db.commit()
    db.close()

    resp = client.get("/api/reservations")

    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_create_reservation_already_reserved(client):
    from app.database.db_connection import SessionLocal
    from app.models.reservation import Reservation, ReservationStatus
    from app.models.merchant import Merchant
    from app.main import app
    from app.services.dependencies import get_current_user

    class DummyUser:
        def __init__(self):
            self.id = 1
            self.role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyUser()

    db = SessionLocal()

    db.add(Merchant(merchant_id=1, user_id=1, approval_status=ApprovalStatus.APPROVED))

    db.add(
        Reservation(
            reservation_id="existing",
            booth_id="1",
            merchant_id=1,
            reservation_type="SHORT_TERM",
            status=ReservationStatus.PENDING_PAYMENT,
        )
    )

    db.commit()
    db.close()

    resp = client.post(
        "/api/reservations",
        json={"booth_id": "1", "reservation_type": "SHORT_TERM"},
    )

    assert resp.status_code == 400
    assert resp.json()["detail"] == "Booth already reserved"

def test_confirm_reservation(client):
    from app.database.db_connection import SessionLocal
    from app.models.reservation import Reservation, ReservationStatus
    from app.main import app
    from app.services.dependencies import get_current_user

    class DummyManager:
        def __init__(self):
            self.id = 2
            self.role = "BOOTH_MANAGER"

    # override authentication
    app.dependency_overrides[get_current_user] = lambda: DummyManager()

    db = SessionLocal()

    res = Reservation(
        reservation_id="r_confirm",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT,
    )

    db.add(res)
    db.commit()
    db.close()

    resp = client.patch("/api/reservations/r_confirm/confirm")

    assert resp.status_code == 200
    assert resp.json()["msg"] == "reservation confirmed"


def test_list_reservations_as_merchant(client):
    from app.database.db_connection import SessionLocal
    from app.main import app
    from app.services.dependencies import get_current_user
    from app.models.merchant import Merchant
    from app.models.reservation import Reservation, ReservationStatus

    class DummyMerchant:
        id = 10
        role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyMerchant()

    db = SessionLocal()

    merchant = Merchant(merchant_id=1, user_id=10, approval_status=ApprovalStatus.APPROVED)
    db.add(merchant)

    res = Reservation(
        reservation_id="r1",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT,
    )

    db.add(res)
    db.commit()

    resp = client.get("/api/reservations")

    assert resp.status_code == 200
    assert len(resp.json()) == 1

    db.close()
    app.dependency_overrides = {}


def test_list_reservations_forbidden_for_general_user(client):
    from app.main import app
    from app.services.dependencies import get_current_user

    class DummyGeneralUser:
        id = 77
        role = "GENERAL_USER"

    app.dependency_overrides[get_current_user] = lambda: DummyGeneralUser()

    resp = client.get("/api/reservations")

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Only approved merchants can access reservations"

    app.dependency_overrides = {}

def test_create_reservation_without_merchant_profile(client):
    from app.main import app
    from app.services.dependencies import get_current_user

    class DummyMerchant:
        id = 99
        role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyMerchant()

    payload = {
        "booth_id": "1",
        "reservation_type": "SHORT_TERM"
    }

    resp = client.post("/api/reservations", json=payload)

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Only approved merchants can access reservations"

    app.dependency_overrides = {}


def test_confirm_reservation_updates_booth(client):
    from app.database.db_connection import SessionLocal
    from app.main import app
    from app.services.dependencies import get_current_user
    from app.models.reservation import Reservation, ReservationStatus
    from app.models.booth import Booth, BoothStatus

    class DummyManager:
        id = 1
        role = "BOOTH_MANAGER"

    app.dependency_overrides[get_current_user] = lambda: DummyManager()

    db = SessionLocal()

    booth = Booth(booth_id="1", booth_number="B1", price=100, status=BoothStatus.AVAILABLE)
    db.add(booth)

    res = Reservation(
        reservation_id="r_confirm2",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT,
    )

    db.add(res)
    db.commit()

    resp = client.patch("/api/reservations/r_confirm2/confirm")

    assert resp.status_code == 200

    db.refresh(booth)
    assert booth.status == BoothStatus.OCCUPIED

    db.close()
    app.dependency_overrides = {}

def test_cancel_reservation_permission_denied(client):
    from app.database.db_connection import SessionLocal
    from app.main import app
    from app.services.dependencies import get_current_user
    from app.models.reservation import Reservation, ReservationStatus

    class DummyMerchant:
        id = 50
        role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyMerchant()

    db = SessionLocal()

    res = Reservation(
        reservation_id="r_denied",
        booth_id="1",
        merchant_id=999,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT,
    )

    db.add(res)
    db.commit()

    resp = client.patch("/api/reservations/r_denied/cancel")

    assert resp.status_code == 403

    db.close()
    app.dependency_overrides = {}

def test_cancel_reservation_with_approved_payment(client):
    from app.database.db_connection import SessionLocal
    from app.main import app
    from app.services.dependencies import get_current_user
    from app.models.reservation import Reservation, ReservationStatus
    from app.models.payment import Payment, PaymentStatus
    from app.models.merchant import Merchant

    class DummyMerchant:
        id = 1
        role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyMerchant()

    db = SessionLocal()

    merchant = Merchant(merchant_id=1, user_id=1, approval_status=ApprovalStatus.APPROVED)
    db.add(merchant)

    res = Reservation(
        reservation_id="r_pay",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT,
    )

    payment = Payment(
        payment_id="p1",
        reservation_id="r_pay",
        payment_status=PaymentStatus.APPROVED
    )

    db.add(res)
    db.add(payment)
    db.commit()

    resp = client.patch("/api/reservations/r_pay/cancel")

    assert resp.status_code == 400

    db.close()
    app.dependency_overrides = {}

def test_cancel_reservation_rejects_pending_payment(client):
    from app.database.db_connection import SessionLocal
    from app.main import app
    from app.services.dependencies import get_current_user
    from app.models.reservation import Reservation, ReservationStatus
    from app.models.payment import Payment, PaymentStatus
    from app.models.merchant import Merchant

    class DummyMerchant:
        id = 1
        role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyMerchant()

    db = SessionLocal()

    merchant = Merchant(merchant_id=1, user_id=1, approval_status=ApprovalStatus.APPROVED)
    db.add(merchant)

    res = Reservation(
        reservation_id="r_pending",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.PENDING_PAYMENT,
    )

    payment = Payment(
        payment_id="p2",
        reservation_id="r_pending",
        payment_status=PaymentStatus.PENDING
    )

    db.add(res)
    db.add(payment)
    db.commit()

    resp = client.patch("/api/reservations/r_pending/cancel")

    assert resp.status_code == 200

    db.refresh(payment)
    assert payment.payment_status == PaymentStatus.REJECTED

    db.close()
    app.dependency_overrides = {}

def test_cancel_confirmed_reservation(client):
    from app.database.db_connection import SessionLocal
    from app.main import app
    from app.services.dependencies import get_current_user
    from app.models.reservation import Reservation, ReservationStatus

    class DummyManager:
        id = 1
        role = "BOOTH_MANAGER"

    app.dependency_overrides[get_current_user] = lambda: DummyManager()

    db = SessionLocal()

    res = Reservation(
        reservation_id="r_conf",
        booth_id="1",
        merchant_id=1,
        reservation_type="SHORT_TERM",
        status=ReservationStatus.CONFIRMED,
    )

    db.add(res)
    db.commit()

    resp = client.patch("/api/reservations/r_conf/cancel")

    assert resp.status_code == 400

    db.close()
    app.dependency_overrides = {}