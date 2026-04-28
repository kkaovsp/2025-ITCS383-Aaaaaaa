# Project Overview

**Course:** ITCS383 Software Construction and Evolution  
**Phase:** Phase 2 Part 2 — Maintenance  
**Period:** 2 April – 30 April 2026

## Inherited System

The team inherited a **Booth Organizer System** built with FastAPI (backend) and React (frontend). The original system manages event registration, booth reservations, and payment tracking.

## Selected Features

| Feature | Description |
|---------|-------------|
| Native Android App | Mobile client with login, event list, language toggle, and reports |
| UI Localization (EN/TH) | Static interface toggle between English and Thai languages |
| Administrative Reporting | Event-filtered reservation/payment table with CSV export |

## Cloud Architecture

| Layer | Service |
|---|---|
| Backend | Supabase Edge Functions (TypeScript/Deno) |
| Database | **Supabase PostgreSQL** — managed cloud database (project ref: `uaoufhdysqcivheauwyf`) |
| Frontend | React → Vercel (deployed later) |
| Mobile | Native Android → same Supabase Edge Function API |
| Local/CI | SQLite (unchanged) |

**Cloud-first quality approach:** Person 1 replaces the inherited FastAPI runtime with Supabase Edge Functions before teammates start feature work. This provides a stable cloud API for web and Android clients to integrate against.

## Out of Scope

Search, Floor Plan, real payment gateway, and real MOI integration are not implemented.

## Quality Approach

| Metric | Target |
|--------|--------|
| CI Pipeline | All builds and tests pass via GitHub Actions |
| Code Quality | No degradation; SonarCloud monitoring active |
| Test Coverage | >90% where measurable on new code |

## Deliverables

| Deliverable | Description |
|-------------|-------------|
| D1 | Working system with CI, deployed backend, and Android build |
| D2 | Code quality report with before/after SonarCloud evidence |
| D3 | 10 change requests using standard schema |
| D4 | Impact analysis with traceability and connectivity matrix |
| D5 | AI usage report with verification and limitations |

## Team

See `docs/TEAM_SCOPE.md` for individual responsibilities.
