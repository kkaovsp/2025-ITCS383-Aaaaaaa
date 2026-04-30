# Booth Organizer System

A **Booth Organizer** is a web application designed to help event organizers manage booth inventory, merchant registrations, reservations, and payments. Merchants can sign up and reserve temporary or fixed booths for events; booth managers create events and approve merchants, reservations and payments. The platform includes notification support and role-based access control.

This repository contains a Booth Organizer web frontend, a native Android/Kotlin mobile app, and a Supabase Edge Function backend for the Phase 2 Part 2 maintenance work. All 10 change requests (CR-01 to CR-10) are completed and verified. The inherited FastAPI backend remains in the repository as a non-blocking reference job; the active cloud backend is Supabase Edge Functions.

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

Deno unit tests (active backend coverage):

```bash
cd supabase/functions
npm install --save-dev deno@1.46.0
npx deno test --coverage=coverage --no-check --allow-all api/index_test.ts _shared/shared_helpers_test.ts _shared/auth_test.ts
npx deno coverage coverage --lcov > coverage/lcov.info
```

Inherited backend baseline checks for CI/SonarCloud evidence:

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

Android app checks:

```bash
cd implementations/mobile
./gradlew.bat --no-daemon assembleDebug
```

For emulator setup, APK install, and runtime verification steps, see `implementations/mobile/README.md`.

---

## Maintenance Phase Progress

This section records the current Phase 2 Part 2 maintenance work completed by the receiving team.

| Area | Current Status |
|---|---|
| Cloud database | Supabase PostgreSQL project connected and initial schema migration applied |
| Backend | Supabase Edge Function API deployed at `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api`; all endpoints implemented: `/health`, `/events`, `/events/:event_id/booths`, auth/profile, reservations, payments, merchant approval, notifications, reports with CSV export |
| Demo data | Supabase seed data loaded for manager, merchant, user, events, booths, reservation, payment, and notification testing |
| Web frontend | React app uses the deployed Edge API; includes EN/TH localization, Booth Manager reporting page with CSV export, and all RBAC features |
| Android app | Native Android/Kotlin app completed and verified: APK built with Gradle, runtime tested on emulator `BoothOrganizer_API35` / `emulator-5554`; login, events, booths, reservations, profile, reports, language toggle, and manager navigation all verified; no `FATAL EXCEPTION` in crash log |
| Current handoff | Full project review passed: backend, web frontend, and Android app all verified; ready for submission |
| Quality | Active backend Deno unit tests: 25 passed, 90.2% coverage on 184 lines; Edge API smoke: 19/19; frontend tests and build pass; Android APK build and emulator runtime checks pass; legacy FastAPI backend: reference only (96% coverage, non-blocking) |

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

