# Agent Read First

This file is the first navigation point for agents working in this repository. Read it before changing code or documentation.

## Current Branch Rule

- Work on `chore/p1-skeleton-ci` unless the team lead explicitly creates another branch.
- Do not commit directly to `master` during active work.
- Merge to `master` only after planned work is complete, reviewed, verified, and approved.

## Current Architecture

- Active backend: Supabase Edge Functions in `supabase/functions/api/index.ts`.
- Active database: Supabase PostgreSQL project `uaoufhdysqcivheauwyf`.
- Active frontend: React app in `implementations/frontend`.
- Legacy backend: `implementations/backend` is kept for inherited CI/SonarCloud baseline tests only. Do not add new feature work there unless the team lead explicitly asks.

## Read These Files In Order

| File | Purpose |
|---|---|
| `docs/TEAM_SCOPE.md` | Main handoff instructions for Persons 2–5, sequence, branch rule, allowed/forbidden scope, verification commands |
| `docs/CLOUD_DATABASE_GUIDE.md` | Supabase project, API endpoints, demo accounts, seed data, Edge deploy/test commands |
| `D3_CHANGE_REQUESTS.md` | Official 10 change requests and feature scope |
| `docs/WORK_LOG.md` | Completed work, evidence, and what has already been verified |
| `README.md` | Short local setup, demo login accounts, current maintenance status |
| `D2_CODE_QUALITY.md` | Baseline SonarCloud evidence and final D2 update rule |
| `D4_IMPACT_ANALYSIS.md` | Impact analysis draft for the 10-CR plan |
| `D5_AI-USAGE.md` | AI usage report and human verification process |

## Person Order

Work is sequential:

```txt
Person 1 -> Person 2 -> Person 3 -> Person 4 -> Person 5
```

Do not start a later person's implementation before the previous person has completed their scope and updated `docs/WORK_LOG.md`.

## Verification Commands

Run deployed Edge API smoke checks:

```bash
node scripts/smoke-test-edge-api.mjs
```

Run frontend checks:

```bash
cd implementations/frontend
npm install
npx react-scripts test --watchAll=false --passWithNoTests
npm run build
```

Run inherited backend baseline coverage only when D2/SonarCloud evidence requires it:

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

## Known Current Backend/UI Notes

- Event and booth create/update/delete endpoints are implemented in the deployed Edge API.
- If the local UI calls `/api/...` or fails login after API changes, restart `npm start` and hard-refresh the browser.
- Authentication uses a bearer token stored in localStorage key `boothOrganizerAccessToken`; do not use cross-site cookie auth.
- Payment slip file storage is still a placeholder marker; full Supabase Storage is a future improvement.

## Documentation Rule

Before reporting completion, update any relevant source-of-truth markdown. If docs are stale, the task is not complete.
