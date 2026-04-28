-- Initial Supabase/PostgreSQL schema migration for Booth Organizer backend
-- Based on SQLAlchemy models in implementations/backend/app/models/

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('GENERAL_USER', 'MERCHANT', 'BOOTH_MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booth_type AS ENUM ('INDOOR', 'OUTDOOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE classification AS ENUM ('FIXED', 'TEMPORARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE duration_type AS ENUM ('SHORT_TERM', 'LONG_TERM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booth_status AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_type AS ENUM ('SHORT_TERM', 'LONG_TERM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('PENDING_PAYMENT', 'WAITING_FOR_APPROVAL', 'CONFIRMED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CREDIT_CARD', 'TRUEMONEY', 'BANK_TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('RESERVATION', 'PAYMENT', 'MERCHANT_APPROVAL', 'EVENT', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
create table if not exists users (
    id varchar(36) primary key,
    username varchar(50) unique not null,
    password varchar(255) not null,
    name varchar(100),
    contact_info varchar(100),
    role user_role,
    created_at timestamp
);

-- Events table
create table if not exists events (
    event_id varchar(36) primary key,
    name varchar(150),
    description text,
    location varchar(200),
    start_date date,
    end_date date,
    created_by varchar(36),
    created_at timestamp
);

-- Booths table
create table if not exists booths (
    booth_id varchar(36) primary key,
    event_id varchar(36) references events(event_id) on delete set null,
    booth_number varchar(20),
    size varchar(50),
    price numeric(10, 2),
    location varchar(100),
    type booth_type,
    classification classification,
    duration_type duration_type,
    electricity boolean default false,
    water_supply boolean default false,
    outlets integer,
    status booth_status default 'AVAILABLE'
);

-- Merchants table
create table if not exists merchants (
    merchant_id varchar(36) primary key,
    user_id varchar(36) references users(id) on delete cascade,
    citizen_id varchar(20),
    seller_information text,
    product_description text,
    approval_status approval_status default 'PENDING',
    approved_by varchar(36),
    approved_at timestamp,
    citizen_valid integer default 0
);

-- Reservations table
create table if not exists reservations (
    reservation_id varchar(36) primary key,
    booth_id varchar(36) references booths(booth_id) on delete set null,
    merchant_id varchar(36) references merchants(merchant_id) on delete set null,
    reservation_type reservation_type,
    status reservation_status default 'PENDING_PAYMENT',
    created_at timestamp
);

-- Payments table
create table if not exists payments (
    payment_id varchar(36) primary key,
    reservation_id varchar(36) references reservations(reservation_id) on delete set null,
    amount numeric(10, 2),
    method payment_method,
    payment_status payment_status default 'PENDING',
    slip_url varchar(255),
    created_at timestamp
);

-- Notifications table
create table if not exists notifications (
    notification_id varchar(36) primary key,
    user_id varchar(36) references users(id) on delete cascade,
    title varchar(150),
    message text,
    type notification_type,
    reference_id varchar(36),
    is_read boolean default false,
    created_at timestamp
);

-- Create indexes matching SQLAlchemy model indexes
create index if not exists ix_users_id on users(id);
create index if not exists ix_users_username on users(username);
create index if not exists ix_events_event_id on events(event_id);
create index if not exists ix_booths_booth_id on booths(booth_id);
create index if not exists ix_booths_event_id on booths(event_id);
create index if not exists ix_merchants_merchant_id on merchants(merchant_id);
create index if not exists ix_merchants_user_id on merchants(user_id);
create index if not exists ix_reservations_reservation_id on reservations(reservation_id);
create index if not exists ix_reservations_booth_id on reservations(booth_id);
create index if not exists ix_reservations_merchant_id on reservations(merchant_id);
create index if not exists ix_payments_payment_id on payments(payment_id);
create index if not exists ix_payments_reservation_id on payments(reservation_id);
create index if not exists ix_notifications_notification_id on notifications(notification_id);
create index if not exists ix_notifications_user_id on notifications(user_id);
