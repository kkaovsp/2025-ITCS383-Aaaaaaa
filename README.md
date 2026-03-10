# Booth Organizer System

A **Booth Organizer** is a web application designed to help event organizers manage booth inventory, merchant registrations, reservations, and payments. Merchants can sign up and reserve temporary or fixed booths for events; booth managers create events and approve merchants, reservations and payments. The platform includes notification support and role-based access control.

This repository contains a FastAPI backend and React frontend for the system, created as a university class project.  It demonstrates a full-stack architecture with a MySQL database, JWT authentication, and a simple React UI.

## Setup Instructions

### Backend

1. Navigate to backend folder:
    ```bash
    cd implementations/backend
    ```
2. Create and activate a Python virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Set up a MySQL database and update `DATABASE_URL` in `.env`.
5. Start the development server:
    ```bash
    uvicorn app.main:app --reload
    ```

The backend will be available at `http://localhost:8000` and API docs at `http://localhost:8000/docs`.

### Frontend

1. Change to frontend directory:
    ```bash
    cd implementations/frontend
    ```
2. Install Node dependencies:
    ```bash
    npm install
    ```
3. Start development server:
    ```bash
    npm start
    ```

The React app will run on `http://localhost:3000`.

## Testing

Run backend tests using pytest:

```bash
cd implementations/backend
pytest tests/
```

## Notes

- JWT-based authentication is used; tokens are stored in `localStorage` by the frontend.
- Role-based access control ensures only booth managers can create events/booths and approve merchants or payments.
- Business logic is implemented at a basic level; further validation and error handling may be required.
