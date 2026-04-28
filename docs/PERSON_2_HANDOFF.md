# Person 2 Handoff

## Purpose

Person 2 is the first receiver after Person 1. The goal is to verify that the cloud backend and React frontend integration are ready before Person 3 starts localization work.

## Current System State

| Area | Status |
|---|---|
| Cloud database | Supabase PostgreSQL schema is applied |
| Backend API | Supabase Edge Function API is deployed |
| Frontend API wiring | React app can use `REACT_APP_API_URL` and bearer-token auth |
| Reporting backend | Event list, reservation/payment report JSON, and CSV endpoints are ready |
| Demo data | Stable Supabase seed data is loaded for frontend testing |
| Payment slip storage | Placeholder only; real file storage is not finished |
| D2 SonarCloud | Baseline is recorded; final scan waits until all team work is done |

## Branch

Person 2 should continue from this branch:

```txt
chore/p1-skeleton-ci
```

Do not commit directly to `master`. `master` is only for approved merge results after the planned work is finished and reviewed.

## API Base URL

```txt
https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api
```

For local React testing, create `implementations/frontend/.env` from `implementations/frontend/.env.example`. The frontend now uses `REACT_APP_API_URL` instead of the old local FastAPI proxy.

## Demo Login Accounts

| Role | Username | Password |
|---|---|---|
| Booth Manager | `boothManager` | `boothManager123` |
| Merchant | `demoMerchant` | `merchant123` |
| General User | `demoUser` | `user123` |

Seeded events include `Campus Food Fair 2026` and `Startup Expo 2026`.

## Person 2 Scope

Person 2 should do:

- Create `docs/TEST_PLAN.md` with the planned checks.
- Create `docs/TEST_RESULTS.md` with actual results, bugs, screenshots, and notes.
- Test register, login, logout, profile, events, booths, reservations, payments, merchant approval, notifications, and report API readiness.
- Verify that protected frontend requests use the bearer token after login.
- Record every completed check in `docs/WORK_LOG.md`.
- Report bugs before Person 3 starts.

Person 2 should not do:

- Supabase CLI commands.
- Database schema changes.
- Edge Function backend changes.
- Localization implementation.
- Reporting UI implementation.
- Android implementation.

## Suggested Verification Commands

Run backend baseline tests:

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

Run frontend checks:

```bash
cd implementations/frontend
npm install
npx react-scripts test --watchAll=false --passWithNoTests
npm run build
```

Run cloud backend smoke checks against the deployed Supabase Edge API:

```bash
node scripts/smoke-test-edge-api.mjs
```

These smoke checks verify deployed behavior. They do not replace the inherited Python coverage baseline used for the current D2/SonarCloud evidence.

## Handoff Completion Criteria

Person 2 is finished when:

- `docs/TEST_PLAN.md` exists.
- `docs/TEST_RESULTS.md` records completed checks and bugs.
- `docs/WORK_LOG.md` has a Person 2 row.
- Any blocking bug is clearly assigned back to Person 1 or marked as a known limitation.
- Person 3 can start localization without guessing the system status.
