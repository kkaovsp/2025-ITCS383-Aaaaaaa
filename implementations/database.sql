-- SQLite schema for Booth Organizer System
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  contact_info TEXT,
  role TEXT CHECK(role IN ('GENERAL_USER','MERCHANT','BOOTH_MANAGER')),
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS merchants (
  merchant_id TEXT PRIMARY KEY,
  user_id TEXT,
  citizen_id TEXT,
  seller_information TEXT,
  product_description TEXT,
  approval_status TEXT CHECK(approval_status IN ('PENDING','APPROVED','REJECTED')),
  approved_by TEXT,
  approved_at TEXT,
  citizen_valid INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  created_by TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS booths (
  booth_id TEXT PRIMARY KEY,
  event_id TEXT,
  booth_number TEXT,
  size TEXT,
  price REAL,
  location TEXT,
  type TEXT CHECK(type IN ('INDOOR','OUTDOOR')),
  classification TEXT CHECK(classification IN ('FIXED','TEMPORARY')),
  duration_type TEXT CHECK(duration_type IN ('SHORT_TERM','LONG_TERM')),
  electricity INTEGER,
  water_supply INTEGER,
  outlets INTEGER,
  status TEXT CHECK(status IN ('AVAILABLE','RESERVED','OCCUPIED')),
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id TEXT PRIMARY KEY,
  booth_id TEXT,
  merchant_id TEXT,
  reservation_type TEXT CHECK(reservation_type IN ('SHORT_TERM','LONG_TERM')),
  status TEXT CHECK(status IN ('PENDING_PAYMENT','WAITING_FOR_APPROVAL','CONFIRMED','CANCELLED')),
  created_at TEXT,
  FOREIGN KEY (booth_id) REFERENCES booths(booth_id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id TEXT PRIMARY KEY,
  reservation_id TEXT,
  amount REAL,
  method TEXT CHECK(method IN ('CREDIT_CARD','TRUEMONEY','BANK_TRANSFER')),
  payment_status TEXT CHECK(payment_status IN ('PENDING','APPROVED','REJECTED')),
  slip_url TEXT,
  created_at TEXT,
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT CHECK(type IN ('RESERVATION','PAYMENT','MERCHANT_APPROVAL','EVENT','SYSTEM')),
  reference_id TEXT,
  is_read INTEGER,
  created_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert booth manager user
INSERT INTO users (id, username, password, name, contact_info, role, created_at) 
VALUES ('booth-manager-001', 'boothManager', '$pbkdf2-sha256$29000$hJCyVkoJwZjzPqdUKkXovQ$4ujuXesDRMOLmZ5SPeiZ9EtMydHU6xSGi1iQEsa/BOI', 'Booth Manager', '', 'BOOTH_MANAGER', '2026-03-11T00:00:00');
