# D2: Code Quality Report

## Overview

Phase 2 Part 2 maintenance scope includes:
- UI Localization (English/Thai toggle)
- Administrative Reporting System
- Native Android mobile application

## Analysis Scope

| Setting | Value |
|---|---|
| SonarCloud Scope | `implementations/backend/app` |
| SonarCloud Coverage Source | `implementations/backend/coverage.xml` |
| Frontend Coverage Source | `implementations/frontend/coverage/lcov.info` from local `npm run test:coverage` |
| New Code Definition | Previous version (baseline 1.0) |
| Rationale | The original project measured backend coverage only. Our maintenance work keeps that SonarCloud baseline and also adds frontend Jest coverage evidence for changed UI features. |

## Quality Comparison

| Metric | Before | After |
|---|---:|---:|
| Quality Gate | Failed | **Passed** |
| Bugs | 0 | 0 |
| Vulnerabilities | 0 | 0 |
| Code Smells | 0 | 1 |
| Coverage | 44.2% (invalid) | **96%** on 1.1k lines |
| Frontend New-Code Coverage | Not measured by original group | **98.93%** statement coverage, **100%** line coverage |
| Duplications | 0.0% | 0.0% |

> Coverage note: Earlier 44.2% was invalid due to CI pipeline missing DB initialization. The backend baseline suite now passes locally at 96% coverage with `coverage.xml` regenerated for SonarCloud. Frontend new-code coverage is measured separately for the maintenance UI files and now passes the >90% requirement.

## Current Baseline Results

| Metric | Value |
|---|---|
| Quality Gate | **Passed** |
| LOC | 1.7k |
| Coverage | 96% on 1.1k lines |
| Duplications | 0.0% on 2.2k lines |
| Security | A (0 issues) |
| Reliability | A (0 issues) |
| Maintainability | A (1 issue) |
| Security Hotspots | 0 |

**Open Issue (1):** `auth_routes.py:88` — redundant Exception class (low/minor, 1 min fix)

---

## Cloud Migration — SonarCloud Note

The active backend is now Supabase Edge Functions, but SonarCloud still measures the inherited FastAPI backend as the stable CI coverage baseline. The original group only reported backend coverage, while our maintenance review records both backend coverage and frontend Jest coverage. The frontend is not added to SonarCloud in this pass because full-app React coverage is still low, but the changed UI areas now have focused tests.

Current final web review evidence:

| Check | Result |
|---|---|
| Inherited backend coverage | `39 passed`, `96%` total coverage |
| Deployed Edge API smoke test | `19/19 smoke checks passed` |
| Frontend tests | `23 passed`, 3 suites |
| Frontend new-code coverage | `98.93%` statements, `100%` lines, `90.12%` branches |
| Frontend build | Compiled successfully |

---

## Test Command

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
pytest --cov=app --cov-report=xml --cov-report=term-missing
```

Post-implementation Edge backend smoke checks:

```bash
node scripts/smoke-test-edge-api.mjs
```

Frontend coverage checks:

```bash
cd implementations/frontend
npm run test:coverage
npm run build
```

## Evidence

<img width="1598" height="837" alt="image" src="https://github.com/user-attachments/assets/febfa46d-a6b1-461a-8d7e-ff090160fa64" />
<img width="1630" height="856" alt="image" src="https://github.com/user-attachments/assets/2f66b1d4-21ad-4e72-8cc5-5c6c6e27b3f1" />


