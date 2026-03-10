-- Database schema for Booth Organizer System
-- Use MySQL / MariaDB

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(100),
  role ENUM('GENERAL_USER','MERCHANT','BOOTH_MANAGER') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchants (
  merchant_id CHAR(36) PRIMARY KEY,
  citizen_id VARCHAR(20) NOT NULL,
  seller_information TEXT,
  product_description TEXT,
  approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL,
  approved_by CHAR(36),
  approved_at DATETIME,
  FOREIGN KEY (merchant_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id CHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booths (
  booth_id CHAR(36) PRIMARY KEY,
  event_id CHAR(36) NOT NULL,
  booth_number VARCHAR(20) NOT NULL,
  size VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  location VARCHAR(100),
  type ENUM('INDOOR','OUTDOOR') NOT NULL,
  classification ENUM('FIXED','TEMPORARY') NOT NULL,
  duration_type ENUM('SHORT_TERM','LONG_TERM') NOT NULL,
  electricity BOOLEAN DEFAULT FALSE,
  water_supply BOOLEAN DEFAULT FALSE,
  outlets INT DEFAULT 0,
  status ENUM('AVAILABLE','RESERVED','OCCUPIED') NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id CHAR(36) PRIMARY KEY,
  booth_id CHAR(36) NOT NULL,
  merchant_id CHAR(36) NOT NULL,
  reservation_type ENUM('SHORT_TERM','LONG_TERM') NOT NULL,
  status ENUM('PENDING_PAYMENT','CONFIRMED','CANCELLED') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booth_id) REFERENCES booths(booth_id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id CHAR(36) PRIMARY KEY,
  reservation_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('CREDIT_CARD','TRUEMONEY','BANK_TRANSFER') NOT NULL,
  payment_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL,
  slip_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('RESERVATION','PAYMENT','MERCHANT_APPROVAL','EVENT','SYSTEM') NOT NULL,
  reference_id CHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
