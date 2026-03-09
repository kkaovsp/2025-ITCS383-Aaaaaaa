# Project: Booth Management System

## Context & Architecture
We are building a Booth Organizer System that allows merchants to reserve booths for events through an online platform.
The system manages:
* Event creation
* Booth inventory
* Merchant registration
* Booth reservations
* Payment processing
* Administrative reporting
* Notification system
The platform supports both:
* Temporary booths (event-based)
* Fixed booths (long-term market booths)

Technology Stack
* **Language:**
  - Backend (Main System Logic): Python 3.10+, Framework: FastAPI
  - Frontend (User Interface): HTML + CSS + JavaScript, Framework: React
* **Data Storage:** mySQL.

# Database Schema

This document describes the database structure for the **Booth Organizer System**.  
The system uses **MySQL** as the relational database.

---

# 1. Users Table

Stores authentication and basic user information.

| Field | MySQL Type | Description |
|------|-------------|-------------|
| id | CHAR(36) | UUID primary key |
| username | VARCHAR(50) | Unique username for login |
| password | VARCHAR(255) | Hashed password |
| name | VARCHAR(100) | Full name of the user |
| citizen_id | VARCHAR(20) | National citizen ID |
| contact_info | VARCHAR(100) | Email or phone number |
| role | ENUM('GENERAL_USER','MERCHANT','BOOTH_MANAGER') | User role |
| approval_status | ENUM('PENDING','APPROVED','REJECTED') | Merchant approval status |
| created_at | DATETIME | Account creation time |

Primary Key: `id`

---

# 2. Merchants Table

Stores additional information for merchants.

| Field | MySQL Type | Description |
|------|-------------|-------------|
| merchant_id | CHAR(36) | UUID primary key |
| user_id | CHAR(36) | Reference to users.id |
| seller_information | TEXT | Merchant business information |
| product_description | TEXT | Description of products |
| approved_by | CHAR(36) | Booth manager who approved merchant |
| approved_at | DATETIME | Approval timestamp |

Primary Key: `merchant_id`  
Foreign Key: `user_id → users.id`

---

# 3. Events Table

Stores event information.

| Field | MySQL Type | Description |
|------|-------------|-------------|
| event_id | CHAR(36) | UUID primary key |
| name | VARCHAR(150) | Event name |
| description | TEXT | Event description |
| location | VARCHAR(200) | Event location |
| start_date | DATE | Event start date |
| end_date | DATE | Event end date |
| created_by | CHAR(36) | Booth manager who created event |
| created_at | DATETIME | Event creation timestamp |

Primary Key: `event_id`

---

# 4. Booths Table

Stores booth inventory for each event.

| Field | MySQL Type | Description |
|------|-------------|-------------|
| booth_id | CHAR(36) | UUID primary key |
| event_id | CHAR(36) | Associated event |
| booth_number | VARCHAR(20) | Booth identifier (e.g., A12) |
| size | VARCHAR(50) | Booth size |
| price | DECIMAL(10,2) | Booth price |
| location | VARCHAR(100) | Booth location on map |
| type | ENUM('INDOOR','OUTDOOR') | Booth type |
| classification | ENUM('FIXED','TEMPORARY') | Booth classification |
| duration_type | ENUM('SHORT_TERM','LONG_TERM') | Reservation duration |
| electricity | BOOLEAN | Electricity availability |
| water_supply | BOOLEAN | Water supply availability |
| outlets | INT | Number of electricity outlets |
| status | ENUM('AVAILABLE','RESERVED','OCCUPIED') | Booth status |

Primary Key: `booth_id`  
Foreign Key: `event_id → events.event_id`

---

# 5. Reservations Table

Stores booth reservation records.

| Field | MySQL Type | Description |
|------|-------------|-------------|
| reservation_id | CHAR(36) | UUID primary key |
| booth_id | CHAR(36) | Reserved booth |
| merchant_id | CHAR(36) | Merchant who made reservation |
| reservation_type | ENUM('SHORT_TERM','LONG_TERM') | Reservation type |
| status | ENUM('PENDING_PAYMENT','CONFIRMED','CANCELLED') | Reservation status |
| created_at | DATETIME | Reservation creation time |

Primary Key: `reservation_id`

Foreign Keys:
- `booth_id → booths.booth_id`
- `merchant_id → merchants.merchant_id`

---

# 6. Payments Table

Stores payment information for reservations.

| Field | MySQL Type | Description |
|------|-------------|-------------|
| payment_id | CHAR(36) | UUID primary key |
| reservation_id | CHAR(36) | Associated reservation |
| amount | DECIMAL(10,2) | Payment amount |
| method | ENUM('CREDIT_CARD','TRUEMONEY','BANK_TRANSFER') | Payment method |
| payment_status | ENUM('PENDING','APPROVED','REJECTED') | Payment status |
| slip_url | VARCHAR(255) | Uploaded bank transfer slip |
| created_at | DATETIME | Payment timestamp |

Primary Key: `payment_id`  
Foreign Key: `reservation_id → reservations.reservation_id`

# 7. Notifications Table

Stores system notifications sent to users (e.g., reservation updates, payment status, merchant approval).

| Field | MySQL Type | Description |
|------|-------------|-------------|
| notification_id | CHAR(36) | UUID primary key |
| user_id | CHAR(36) | User who receives the notification |
| title | VARCHAR(150) | Notification title |
| message | TEXT | Notification content |
| type | ENUM('RESERVATION','PAYMENT','MERCHANT_APPROVAL','EVENT','SYSTEM') | Notification category |
| reference_id | CHAR(36) | Related entity ID (reservation, payment, event, etc.) |
| is_read | BOOLEAN | Whether the notification has been read |
| created_at | DATETIME | Notification creation timestamp |

Primary Key: `notification_id`

Foreign Key:
- `user_id → users.id`

---

# Relationships Summary

- A **User** can become a **Merchant**
- A **Booth Manager** creates **Events**
- An **Event** contains multiple **Booths**
- A **Merchant** makes **Reservations**
- A **Reservation** is linked to **Payments**

```
Users
   │
   └── Merchants
          │
          └── Reservations
                 │
                 └── Payments

Events
   │
   └── Booths
          │
          └── Reservations
```

---

# Notes

- UUIDs are stored as `CHAR(36)`
- Passwords must be stored as **hashed values**
- Booth reservation must enforce **no double booking**
- Reservation is **confirmed only after payment approval**

## Development Tasks
- [ ] **1.. Project Initialization**
    - Create project inside the `implementations` folder
    - Create `backend` and `frontend` directories
    - Create `database.sql` file for MySQL schema
    - Setup Git repository
    - Setup Python virtual environment for backend
    - Install backend dependencies (FastAPI, SQLAlchemy, Pydantic)
    - Initialize React application for frontend

- [ ] **2. Database Setup**
    - Implement all tables defined in `database.sql`
    - Configure MySQL database connection
    - Create database connection module in backend
    - Implement ORM models for:
      * Users
      * Merchants
      * Events
      * Booths
      * Reservations
      * Payments

- [ ] **3. Authentication System**
    - Implement user registration API
    - Implement user login API
    - Implement password hashing
    - Implement JWT authentication
    - Implement role-based access control
    - Verify Citizen ID using MOI API (mock if API unavailable)
    - Using Cookies for remembering the userID for CRUD operation. 

- [ ] **4. Merchant Management**
    - Implement merchant registration process
    - Implement merchant approval by Booth Manager
    - Store seller information and product description
    - Allow merchants to view and edit their profiles

- [ ] **5. Event Management (Booth Manager)**
    - Implement create event API
    - Implement edit event API
    - Implement delete event API
    - Implement list events API

- [ ] **6. Booth Management**
    - Implement create booth API
    - Implement edit booth API
    - Implement delete booth API
    - Associate booths with events
    - Implement booth status management

- [ ] **7. Booth Visualization**
    - Display booths for each event
    - Show booth status (Available / Reserved / Occupied)
    - Allow merchants to select booths visually

- [ ] **8. Reservation System**
    - Implement booth reservation API
    - Prevent double booking
    - Implement reservation status tracking
    - Allow users to view their reservations
    - Allow managers to view all reservations

- [ ] **9. Payment System**
    - Implement payment record creation
    - Support payment methods:
      * Credit Card
      * TrueMoney Wallet
      * Bank Transfer
    - Implement payment slip upload for bank transfer
    - Implement payment approval by Booth Manager
    - Update reservation status after payment approval

- [ ] **10. Frontend Development**
    - Create login and registration pages
    - Create event listing page
    - Create booth selection page
    - Create reservation page
    - Create payment page
    - Create admin dashboard for booth managers
    = Create notification page for view all notification

- [ ] **11. Notifications**
    - Using in-app for notification
    - Make notification hotbar to store notification
    - Notify booth manager when:
      * New merchant registration submitted
      * New booth reservation made
      * Payment slip uploaded

- [ ] **12. Testing**
    - Create Test units for all function
      * Backend Test
      * Frontend Test
      * API Send and Response Test (Test communication between frontend and backend)

- [ ] **13. Deployment Preparation**
    - Configure environment variables
    - Setup production database
    - Prepare backend API server
    - Prepare frontend build

---

# Project Structure

The project must follow the structure below.

implementations/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── merchant.py
│   │   │   ├── event.py
│   │   │   ├── booth.py
│   │   │   ├── reservation.py
│   │   │   ├── payment.py
│   │   │   └── notification.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── event_routes.py
│   │   │   ├── booth_routes.py
│   │   │   ├── reservation_routes.py
│   │   │   ├── payment_routes.py
│   │   │   └── notification_routes.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── event_service.py
│   │   │   ├── booth_service.py
│   │   │   ├── reservation_service.py
│   │   │   ├── payment_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── user_schema.py
│   │   │   ├── event_schema.py
│   │   │   ├── booth_schema.py
│   │   │   ├── reservation_schema.py
│   │   │   ├── payment_schema.py
│   │   │   └── notification_schema.py
│   │   │
│   │   └── database/
│   │       └── db_connection.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── NotificationBell.js
│   │   │
│   │   ├── pages/
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── notificationService.js
│   │   │
│   │   └── App.js
│   │
│   └── package.json
│
└── database.sql
```

- **Backend** contains API and business logic.
- **Frontend** contains the React user interface.
- **database.sql** contains MySQL table definitions.

---

# Backend Architecture

The backend follows a **layered architecture** to separate concerns.

```
Client (Frontend)
        │
        ▼
API Routes (Controllers)
        │
        ▼
Service Layer (Business Logic)
        │
        ▼
Database Models (ORM / SQL)
        │
        ▼
MySQL Database
```

### Components

**Routes**
- Handle HTTP requests
- Validate inputs
- Return API responses

**Services**
- Contain business logic
- Implement reservation rules
- Implement payment workflows

**Models**
- Represent database tables

**Schemas**
- Define request and response validation using Pydantic

---

# Core API Endpoints

## Authentication

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login user |

---

## Events

| Method | Endpoint | Description |
|------|------|------|
| GET | /api/events | Get all events |
| POST | /api/events | Create new event (Booth Manager) |
| PUT | /api/events/{id} | Update event |
| DELETE | /api/events/{id} | Delete event |

---

## Booths

| Method | Endpoint | Description |
|------|------|------|
| GET | /api/events/{event_id}/booths | Get booths for event |
| POST | /api/booths | Create booth |
| PUT | /api/booths/{id} | Update booth |
| DELETE | /api/booths/{id} | Delete booth |

---

## Reservations

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/reservations | Reserve booth |
| GET | /api/reservations | View user reservations |

---

## Payments

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/payments | Create payment |
| POST | /api/payments/upload-slip | Upload bank transfer slip |

---

# Notification

| Method | Endpoint | Description |
|------|------|------|
| GET | `/api/notifications` | Get current user notifications |
| PATCH | `/api/notifications/{id}/read` | Mark notification as read |

---

# Environment Variables

Backend requires the following environment variables.

Logged in users require cookie with there user id.

```
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/booth_system

JWT_SECRET=your_secret_key

MOI_API_URL=https://api.moi.gov/verify

PAYMENT_GATEWAY_URL=https://payment-gateway.com
```

These variables should be stored in the `.env` file.

---

# Business Rules

The system must enforce the following rules.

1. Users must register before reserving booths.
2. Merchant accounts must be approved by Booth Manager.
3. Citizen ID must be verified via MOI API.
4. Booth reservations require full payment.
5. Installment payments are not allowed.
6. Booth double booking must be prevented.
7. Reservation is confirmed only after payment approval.

---

# Running the Project

## Backend

Install dependencies and run the FastAPI server.

```
cd implementations/backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend server runs at:

```
http://localhost:8000
```

API documentation is available at:

```
http://localhost:8000/docs
```

---

## Frontend

Run the React development server.

```
cd implementations/frontend

npm install
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

# Future Improvements

Possible improvements for future versions of the system.

- Interactive booth map visualization
- Real-time booth availability updates
- Email notifications for reservations and payments
- Admin analytics dashboard
- Mobile-friendly interface
