# Cloud Database Guide

## Overview

The Supabase PostgreSQL database is the production cloud database for this project. The backend is being migrated from FastAPI to Supabase Edge Functions written in TypeScript/Deno.

| Item | Value |
|---|---|
| Supabase Project Ref | `uaoufhdysqcivheauwyf` |
| Initial Migration | `supabase/migrations/20260428120000_initial_schema.sql` |
| Cloud Tables | `users`, `events`, `booths`, `merchants`, `reservations`, `payments`, `notifications` |
| ID Format | `varchar(36)` to match existing SQLAlchemy `String(36)` models |
| Edge Function Base | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api` |

The first Edge Function API slice is deployed as `api` and currently supports:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Deployment health check |
| GET | `/events` | Public event list |
| GET | `/events/:event_id/booths` | Public booth list by event |

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
| `REACT_APP_API_URL` | Full URL to the deployed Edge Function API (e.g. `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api`). If omitted, defaults to `/api` (dev proxy). |

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
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

### Deploy Edge Function API

```bash
npx supabase functions deploy api --no-verify-jwt
```

The router uses `--no-verify-jwt` so public endpoints can work while protected endpoints check authentication inside the function.
