# Team Scope

## Team Members

| Member | Responsibilities |
|--------|------------------|
| Person 1 | Team lead — **Supabase PostgreSQL, Edge Function backend rewrite, deployment**, CI/SonarCloud, architecture/integration review, final merge support |
| Person 2 | First handoff receiver — QA/test plan, regression testing, bug list, and integration evidence after Person 1 |
| Person 3 | Second handoff receiver — web localization EN/TH toggle and static UI text after Person 2 signs off |
| Person 4 | Third handoff receiver — web reporting UI, event filter, report table, and CSV download after Person 3 signs off |
| Person 5 | Final handoff receiver — native Android app after Person 4 signs off |

## Feature Ownership

| Feature | Lead |
|---------|------|
| **Supabase cloud DB / Edge Function backend rewrite / deployment** | Person 1 (team lead) |
| QA Test Plan, Regression Checks, and Evidence | Person 2 |
| Web UI Localization (EN/TH) | Person 3 |
| Web Reporting UI | Person 4 |
| Native Android App | Person 5 |
| Team Lead / CI & Quality | Person 1 |

## Sequential Handoff Rule

Team members work in this order only: Person 1, then Person 2, then Person 3, then Person 4, then Person 5.

No person should start implementation before the previous person finishes their assigned scope, records verification, and updates `docs/WORK_LOG.md`.

Each person must use the same branch unless the team lead creates a new approved branch. Each person must keep changes inside their assigned scope and must not change Supabase cloud configuration, database schema, or Edge Function backend code unless Person 1 approves it.

## Branch Rule

All feature and handoff work must happen on a working branch first. Do not commit directly to `master` during active work.

For the current Person 1 handoff, use:

```txt
chore/p1-skeleton-ci
```

Merge into `master` only after the planned work is complete, reviewed, verified, and approved.

## Shared System Context

| Item | Value |
|---|---|
| Active Backend | Supabase Edge Function API |
| API Base URL | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api` |
| Frontend Env | `implementations/frontend/.env.example` |
| Demo Seed | `supabase/seed.sql` |
| Cloud Guide | `docs/CLOUD_DATABASE_GUIDE.md` |

Demo login accounts:

| Role | Username | Password |
|---|---|---|
| Booth Manager | `boothManager` | `boothManager123` |
| Merchant | `demoMerchant` | `merchant123` |
| General User | `demoUser` | `user123` |

Seeded events include `Campus Food Fair 2026` and `Startup Expo 2026`.

## Verification Commands

Run frontend checks:

```bash
cd implementations/frontend
npm install
npx react-scripts test --watchAll=false --passWithNoTests
npm run build
```

Run cloud backend smoke checks:

```bash
node scripts/smoke-test-edge-api.mjs
```

Run inherited backend baseline coverage only when needed for D2/SonarCloud evidence:

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

## Person 2 Instructions

Goal: verify the integrated system before feature implementation continues.

Allowed scope:

- Create `docs/TEST_PLAN.md`.
- Create `docs/TEST_RESULTS.md`.
- Run frontend checks, Edge API smoke checks, and selected manual browser checks.
- Test login/logout, profile, events, booths, reservations, payments, merchant approval, notifications, and report API readiness.
- Record bugs clearly and update `docs/WORK_LOG.md`.

Forbidden scope:

- No Supabase CLI commands.
- No database schema changes.
- No Edge Function backend changes.
- No localization, reporting UI, or Android implementation.

Completion gate: Person 2 finishes only after `docs/TEST_PLAN.md`, `docs/TEST_RESULTS.md`, and a Person 2 row in `docs/WORK_LOG.md` exist.

## Person 3 Instructions

Goal: implement EN/TH static UI localization after Person 2 signs off.

Allowed scope:

- Add frontend translation structure for static UI text.
- Add a language toggle.
- Keep database content unchanged in its original language.
- Update `docs/WORK_LOG.md` with verification.

Forbidden scope:

- No backend, Supabase, database, report API, or Android changes.
- Do not translate event names, booth names, merchant names, or user-generated content from the database.

Verification: run frontend checks, inspect EN/TH toggle manually, and confirm seeded database content remains unchanged.

## Person 4 Instructions

Goal: implement web reporting UI after Person 3 signs off.

Allowed scope:

- Add Booth Manager report page/UI.
- Use `GET /reports/events` for event filter options.
- Use `GET /reports/reservations-payments?event_id=...` for report rows.
- Use `GET /reports/reservations-payments.csv?event_id=...` for CSV download.
- Add loading, empty, and error states.
- Update `docs/WORK_LOG.md` with verification.

Forbidden scope:

- No backend, Supabase, database, localization architecture, or Android changes.

Verification: run frontend checks, Edge API smoke checks, and manual report UI checks using `boothManager / boothManager123`.

## Person 5 Instructions

Goal: implement native Android app after Person 4 signs off.

Allowed scope:

- Create Android project/app structure.
- Implement login with bearer token storage.
- Implement event/booth browsing from the Edge API.
- Implement required reservation/payment/reporting/localization support as scoped in D3.
- Update `docs/WORK_LOG.md` with build/test evidence.

Forbidden scope:

- No Supabase CLI commands.
- No cloud database schema changes.
- No Edge Function backend changes unless Person 1 approves.
- No unrelated web UI refactors.

Verification: Android build must pass, app must run against the Edge API, and screenshots or emulator evidence should be recorded in `docs/TEST_RESULTS.md` or another agreed evidence location.
