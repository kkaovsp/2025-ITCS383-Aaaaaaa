# Booth Organizer System

A **Booth Organizer** is a web application designed to help event organizers manage booth inventory, merchant registrations, reservations, and payments. Merchants can sign up and reserve temporary or fixed booths for events; booth managers create events and approve merchants, reservations and payments. The platform includes notification support and role-based access control.

This repository contains a Booth Organizer web frontend and a Supabase Edge Function backend for the Phase 2 Part 2 maintenance work. The inherited FastAPI backend remains in the repository for baseline tests and SonarCloud evidence, but the active cloud backend is Supabase.

## Setup Instructions

### Frontend Setup

1. Change to the frontend directory:

```bash
cd implementations/frontend
```

2. Create a local frontend environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Install Node dependencies:

```bash
npm install
```

4. Start the React development server:

```bash
npm start
```

5. Open the frontend in a browser:

```txt
http://localhost:3000
```

The frontend connects to the deployed Supabase Edge Function API through `REACT_APP_API_URL`.

### Demo Login Accounts

The Supabase cloud database has repeatable demo data for review:

| Role | Username | Password |
|---|---|---|
| Booth Manager | `boothManager` | `boothManager123` |
| Merchant | `demoMerchant` | `merchant123` |
| General User | `demoUser` | `user123` |

Demo events and booths are already loaded in Supabase, including `Campus Food Fair 2026` and `Startup Expo 2026`.

### Verification

Frontend checks:

```bash
cd implementations/frontend
npx react-scripts test --watchAll=false --passWithNoTests
npm run build
```

Cloud backend smoke checks:

```bash
node scripts/smoke-test-edge-api.mjs
```

Inherited backend baseline checks for CI/SonarCloud evidence:

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

---

## Maintenance Phase Progress

This section records the current Phase 2 Part 2 maintenance work completed by the receiving team.

| Area | Current Status |
|---|---|
| Cloud database | Supabase PostgreSQL project connected and initial schema migration applied |
| Backend migration | Supabase Edge Function API foundation deployed at `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api` |
| Backend endpoints done | `/health`, `/events`, `/events/:event_id/booths`, auth/profile, reservations, payments, merchant approval, notifications, reports with CSV export |
| Backend endpoints next | full slip file storage |
| Demo data | Supabase seed data loaded for manager, merchant, user, events, booths, reservation, payment, and notification testing |
| Web frontend | React app uses the deployed Edge API, includes EN/TH localization, and includes a Booth Manager reporting page with CSV export |
| Current handoff | Web app review passed after Person 2 QA, Person 3 localization, and Person 4 reporting work |
| Android app | Required feature; implementation starts after backend/web behavior is stable |
| Quality | Backend baseline tests pass at 95% coverage; frontend tests/build and Supabase Edge API smoke tests pass |

Current backend API base:

```txt
https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api
```

For detailed cloud database and API notes, see:

```txt
AGENTS.md
docs/CLOUD_DATABASE_GUIDE.md
docs/TEAM_SCOPE.md
docs/WORK_LOG.md
```

