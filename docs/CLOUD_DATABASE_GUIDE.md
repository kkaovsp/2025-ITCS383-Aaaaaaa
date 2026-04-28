# Cloud Database Guide

## Overview

The Supabase PostgreSQL database is the production cloud database for this project. The backend is being migrated from FastAPI to Supabase Edge Functions written in TypeScript/Deno.

| Item | Value |
|---|---|
| Supabase Project Ref | `uaoufhdysqcivheauwyf` |
| Initial Migration | `supabase/migrations/20260428120000_initial_schema.sql` |
| Demo Seed | `supabase/seed.sql` |
| Cloud Tables | `users`, `events`, `booths`, `merchants`, `reservations`, `payments`, `notifications` |
| ID Format | `varchar(36)` to match existing SQLAlchemy `String(36)` models |
| Edge Function Base | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api` |

The first Edge Function API slice is deployed as `api` and currently supports:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Deployment health check |
| GET | `/events` | Public event list |
| GET | `/events/:event_id/booths` | Public booth list by event |
| POST | `/auth/register` | Register user and optional merchant profile |
| POST | `/auth/login` | Login and return bearer token |
| POST | `/auth/logout` | Clear auth cookie |
| GET | `/auth/me` | Current user summary |
| GET | `/users/me` | Current user profile with merchant details |
| PATCH | `/users/me` | Update profile fields |
| PATCH | `/users/me/seller` | Update or create seller information |
| GET | `/reservations` | List merchant or manager reservations |
| POST | `/reservations` | Create booth reservation for approved merchant |
| PATCH | `/reservations/:reservation_id/confirm` | Manager confirms reservation |
| PATCH | `/reservations/:reservation_id/cancel` | Merchant/manager cancels reservation |
| GET | `/payments` | List merchant or manager payments |
| POST | `/payments` | Create payment for reservation |
| POST | `/payments/upload-slip?payment_id=...` | Mark bank transfer slip uploaded |
| GET | `/payments/:payment_id/slip` | Return slip placeholder info |
| PATCH | `/payments/:payment_id/approve` | Manager approves payment and confirms reservation |
| GET | `/merchants/pending` | Manager lists pending merchant applications |
| GET | `/merchants/all` | Manager lists user applications |
| GET | `/users` | Manager lists users with merchant status |
| GET | `/merchants/:merchant_id` | Manager or owner views merchant record |
| PATCH | `/merchants/:merchant_id/approve` | Manager approves merchant |
| PATCH | `/merchants/:merchant_id/reject` | Manager rejects merchant |
| PATCH | `/merchants/:merchant_id/status` | Manager sets merchant status |
| PATCH | `/users/:user_id/merchant_status` | Manager sets user merchant status |
| PATCH | `/merchants/:merchant_id` | Merchant updates seller information |
| GET | `/notifications` | User lists notifications |
| PATCH | `/notifications/:notification_id/read` | User marks notification as read |
| GET | `/reports/events` | Manager lists events for report filter |
| GET | `/reports/reservations-payments?event_id=...` | Manager gets reservation/payment report rows |
| GET | `/reports/reservations-payments.csv?event_id=...` | Manager downloads report CSV |

Edge Function auth uses `JWT_SECRET` stored as a Supabase function secret. New users are hashed by the Edge Function using PBKDF2-SHA256.

The React frontend should set `REACT_APP_API_URL` to the Edge Function base URL and send protected requests with `Authorization: Bearer <access_token>` after login. The old Create React App local proxy is not used for cloud testing.

Payment slip storage is not fully migrated yet. The current Edge Function records a `slip_url` marker so approval flow can be tested. Final storage should use a Supabase Storage bucket.

Demo cloud data is loaded from `supabase/seed.sql`. It includes stable accounts and events so the frontend can be reviewed without running local backend scripts.

| Role | Username | Password |
|---|---|---|
| Booth Manager | `boothManager` | `boothManager123` |
| Merchant | `demoMerchant` | `merchant123` |
| General User | `demoUser` | `user123` |

---

## Access Policy

- **Supabase cloud DB is managed by the team lead / Person 1 only.**
- Team members run all development and testing against their local SQLite database.
- Destructive operations (DROP TABLE, DELETE FROM with no WHERE, DROP DATABASE, etc.) must **never** be executed against the Supabase cloud database.
- If you need a schema change or data operation on the cloud DB, coordinate through the team lead and log the change in `docs/WORK_LOG.md`.

---

## Local Development & CI

- **Local dev:** Use `DATABASE_URL=sqlite:///./local.db` (or leave unset for dev defaults).
- **CI tests:** Use `DATABASE_URL=sqlite:///./test.db` so tests run against an isolated SQLite file.
- Do not add SQLite-specific SQL (e.g. `PRAGMA foreign_keys=ON`, `check_same_thread`) to shared model code — these are applied conditionally.

---

## Required Environment Variables

### Backend (`implementations/backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite (`sqlite:///...`) for local/CI; `postgresql://...` or `postgresql+psycopg2://...` for Supabase |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ENVIRONMENT` | `development` or `production` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins (e.g. `http://localhost:3000,https://my-app.vercel.app`). If omitted, defaults to local dev origins only. |

### Frontend (`implementations/frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Full URL to the deployed Edge Function API (e.g. `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api`). If omitted, the frontend code defaults to the deployed Edge API. |

---

## Schema & Environment Change Log

All schema changes and environment variable updates must be recorded in `docs/WORK_LOG.md` with:
- Date
- Person who made the change
- Description of the change
- Rollback notes (if applicable)

The initial migration was applied to Supabase on 2026-04-28 and verified by listing the public tables from the linked project.

---

## Common Tasks

### Switch backend to Supabase

```bash
# In implementations/backend/.env
DATABASE_URL=postgresql+psycopg2://postgres.xxx:yyyy@aws-0-xx.pooler.supabase.com:6543/postgres
```

### Run tests with SQLite

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

### Deploy Edge Function API

```bash
npx supabase functions deploy api --no-verify-jwt
```

The router uses `--no-verify-jwt` so public endpoints can work while protected endpoints check authentication inside the function.

### Required Edge Function Secrets

```bash
npx supabase secrets set JWT_SECRET=<secret> ENVIRONMENT=production
```

Do not commit real secret values.

### Apply Demo Seed Data

```bash
npx supabase db query --linked --file supabase/seed.sql
```

### Run Cloud Backend Smoke Checks

```bash
node scripts/smoke-test-edge-api.mjs
```

These checks use seeded demo accounts and call the deployed Edge Function API. They are integration smoke checks, not line-coverage tests.
