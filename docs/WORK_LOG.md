# Maintenance Work Log

After each completed task, every team member adds one row to the table below. This log supports README updates, evidence collection, and the D5 AI usage report.

---

## Work Log

| Date | Member | Change Request | Summary | Files Changed | AI/Tool Support Used | Verification | Evidence Link/Path | Notes |
|------|--------|---------------|---------|---------------|----------------------|--------------|-------------------|-------|
| 2026-04-28 | Person 1 | Phase A — Cloud readiness | Initialized Supabase CLI, linked project `uaoufhdysqcivheauwyf`, and applied initial cloud schema migration for users, events, booths, merchants, reservations, payments, and notifications. | `supabase/config.toml`, `supabase/migrations/20260428120000_initial_schema.sql`, `implementations/backend/app/database/db_connection.py`, `implementations/backend/app/main.py`, `implementations/backend/requirements.txt`, `implementations/frontend/src/services/api.js`, `docs/CLOUD_DATABASE_GUIDE.md` | Supabase CLI — init, link, migration push | Remote tables verified; backend tests passed with SQLite (`32 passed`, 84% coverage) | `supabase/migrations/20260428120000_initial_schema.sql` | Supabase cloud DB is Person 1 managed only; teammates use local/CI SQLite |
| 2026-04-28 | Person 1 | Planning | Corrected CR scope from 8 to 10 because native Android is a required feature and assignment requires at least 8 CRs. | `D3_CHANGE_REQUESTS.md`, `D4_IMPACT_ANALYSIS.md`, `docs/PROJECT_OVERVIEW.md`, `docs/TEAM_SCOPE.md`, `.agent/phase-2-maintenance/00_PROJECT_REQUIREMENTS.md`, `.agent/phase-2-maintenance/01_TEAM_EXECUTION_PIPELINE.md`, `.agent/phase-2-maintenance/04_IMPLEMENTATION_INSTRUCTIONS.md` | AI assistant — documentation consistency review | CR list reviewed for localization, reporting, and Android coverage | `D3_CHANGE_REQUESTS.md` | D4 still needs full rewrite before final submission |
| 2026-04-28 | Person 1 | Architecture | Changed backend plan from FastAPI deployment to Supabase Edge Functions TypeScript rewrite. Added internal Edge Function rewrite plan and updated project docs before implementation. | `.agent/phase-2-maintenance/05_EDGE_FUNCTION_REWRITE_PLAN.md`, `.agent/phase-2-maintenance/00_PROJECT_REQUIREMENTS.md`, `.agent/phase-2-maintenance/01_TEAM_EXECUTION_PIPELINE.md`, `.agent/phase-2-maintenance/02_PROJECT_KNOWLEDGE.md`, `.agent/phase-2-maintenance/04_IMPLEMENTATION_INSTRUCTIONS.md`, `docs/PROJECT_OVERVIEW.md`, `docs/TEAM_SCOPE.md`, `docs/CLOUD_DATABASE_GUIDE.md`, `D2_CODE_QUALITY.md` | AI assistant — architecture planning and documentation sync | Markdown reviewed for architecture consistency | `.agent/phase-2-maintenance/05_EDGE_FUNCTION_REWRITE_PLAN.md` | First implementation slice: `/health`, `/events`, `/events/:id/booths` |
| 2026-04-28 | Person 1 | Phase A — Edge API foundation | Added and deployed Supabase Edge Function router `api` with CORS, shared JSON helpers, Supabase server client, `/health`, `/events`, and `/events/:event_id/booths`. | `supabase/functions/api/index.ts`, `supabase/functions/_shared/cors.ts`, `supabase/functions/_shared/json.ts`, `supabase/functions/_shared/supabaseClient.ts`, `docs/CLOUD_DATABASE_GUIDE.md`, `.agent/phase-2-maintenance/05_EDGE_FUNCTION_REWRITE_PLAN.md` | Supabase CLI — `functions deploy api --no-verify-jwt`; AI assistant — TypeScript routing support | Deployed smoke tests passed: `/health` returned `{"status":"ok"}`, `/events` returned `[]` | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api/health` | Public/protected auth handling will be added inside the router later |
| 2026-04-28 | Person 1 | Phase A — Edge Auth/Profile | Added Edge Function auth/profile endpoints: register, login, logout, auth/me, users/me, profile update, and seller update. Set Supabase `JWT_SECRET` function secret without committing it. | `supabase/functions/api/index.ts`, `supabase/functions/_shared/auth.ts`, `supabase/functions/_shared/json.ts`, `docs/CLOUD_DATABASE_GUIDE.md`, `.agent/phase-2-maintenance/05_EDGE_FUNCTION_REWRITE_PLAN.md` | Supabase CLI — `functions deploy api --no-verify-jwt`, `secrets set`; AI assistant — TypeScript auth support | Deployed smoke tests passed for register/login/auth-me/profile/seller update; inherited backend tests still pass (`32 passed`, 84% coverage) | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api/auth/me` | Uses new Edge PBKDF2 password hashes; old FastAPI hashes are not migrated |
| 2026-04-28 | Person 1 | Documentation | Added README maintenance progress outline to track cloud database, Edge Function backend, completed endpoints, next endpoints, web/mobile status, and quality baseline. | `README.md`, `docs/WORK_LOG.md` | AI assistant — documentation organization | README reviewed for progress outline and current API base URL | `README.md` | This section should be updated after each major backend/frontend/mobile milestone |
| 2026-04-28 | Person 1 | Phase A — Edge Reservations/Payments | Added Edge Function endpoints for reservation list/create/confirm/cancel and payment list/create/upload-slip/slip-info/approve. | `supabase/functions/api/index.ts`, `docs/CLOUD_DATABASE_GUIDE.md`, `README.md`, `docs/WORK_LOG.md` | Supabase CLI — `functions deploy api --no-verify-jwt`; AI assistant — TypeScript API support | Deployed smoke tests passed for reservation creation, payment creation, manager approval, reservation list, bank-transfer slip marker, slip-info, and cancellation | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api/reservations` | Slip file storage is still placeholder; migrate to Supabase Storage later |
| 2026-04-28 | Person 1 | Phase A — Edge Merchant/Notifications | Added Edge Function endpoints for merchant listing/status changes and notifications list/read. | `supabase/functions/api/index.ts`, `docs/CLOUD_DATABASE_GUIDE.md`, `README.md`, `docs/WORK_LOG.md` | Supabase CLI — `functions deploy api --no-verify-jwt`; AI assistant — TypeScript API support | Deployed smoke tests passed for pending merchant list, merchant approval, role update, notification creation, mark-read, and users list | `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api/merchants/pending` | Reporting API remains the next backend slice |

---

## Per-Task Checklist

After every task, add a real row and record the following:

- [ ] Date the work was completed
- [ ] Your name (the member who did the work)
- [ ] The change request identifier (e.g., CR-01)
- [ ] A brief summary of what was done (1–2 sentences)
- [ ] List of files added, modified, or deleted
- [ ] Any AI tool or assistant used (name and purpose, not internal framework details)
- [ ] How you verified the work (tests, inspection, build, etc.)
- [ ] Link or file path to saved evidence (screenshot, test output, build log, etc.)
- [ ] Any notes for the team (e.g., related work, blockers, follow-up)

---

*Add a new row for each completed task. Keep entries factual and concise.*
