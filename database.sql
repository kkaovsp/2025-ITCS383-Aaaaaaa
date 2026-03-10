-- MySQL schema for Booth Organizer System

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  contact_info VARCHAR(100),
  role ENUM('GENERAL_USER','MERCHANT','BOOTH_MANAGER'),
  created_at DATETIME
);

CREATE TABLE merchants (
  merchant_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  citizen_id VARCHAR(20),
  seller_information TEXT,
  product_description TEXT,
  approval_status ENUM('PENDING','APPROVED','REJECTED'),
  approved_by CHAR(36),
  approved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE events (
  event_id CHAR(36) PRIMARY KEY,
  name VARCHAR(150),
  description TEXT,
  location VARCHAR(200),
  start_date DATE,
  end_date DATE,
  created_by CHAR(36),
  created_at DATETIME
);

CREATE TABLE booths (
  booth_id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  booth_number VARCHAR(20),
  size VARCHAR(50),
  price DECIMAL(10,2),
  location VARCHAR(100),
  type ENUM('INDOOR','OUTDOOR'),
  classification ENUM('FIXED','TEMPORARY'),
  duration_type ENUM('SHORT_TERM','LONG_TERM'),
  electricity BOOLEAN,
  water_supply BOOLEAN,
  outlets INT,
  status ENUM('AVAILABLE','RESERVED','OCCUPIED'),
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE reservations (
  reservation_id CHAR(36) PRIMARY KEY,
  booth_id CHAR(36),
  merchant_id CHAR(36),
  reservation_type ENUM('SHORT_TERM','LONG_TERM'),
  status ENUM('PENDING_PAYMENT','CONFIRMED','CANCELLED'),
  created_at DATETIME,
  FOREIGN KEY (booth_id) REFERENCES booths(booth_id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
);

CREATE TABLE payments (
  payment_id CHAR(36) PRIMARY KEY,
  reservation_id CHAR(36),
  amount DECIMAL(10,2),
  method ENUM('CREDIT_CARD','TRUEMONEY','BANK_TRANSFER'),
  payment_status ENUM('PENDING','APPROVED','REJECTED'),
  slip_url VARCHAR(255),
  created_at DATETIME,
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);

CREATE TABLE notifications (
  notification_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  title VARCHAR(150),
  message TEXT,
  type ENUM('RESERVATION','PAYMENT','MERCHANT_APPROVAL','EVENT','SYSTEM'),
  reference_id CHAR(36),
  is_read BOOLEAN,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
