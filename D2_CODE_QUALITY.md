# D2: Code Quality Report

## Overview

Phase 2 Part 2 maintenance scope includes:
- UI Localization (English/Thai toggle)
- Administrative Reporting System
- Native Android mobile application

## Analysis Scope

| Setting | Value |
|---|---|
| Scope | `implementations/backend/app` |
| Coverage Source | `implementations/backend/coverage.xml` |
| New Code Definition | Previous version (baseline 1.0) |
| Rationale | Backend has Pytest coverage; inherited React project had no frontend unit tests |

## Quality Comparison

| Metric | Before | After |
|---|---:|---:|
| Quality Gate | Failed | **Passed** |
| Bugs | 0 | 0 |
| Vulnerabilities | 0 | 0 |
| Code Smells | 0 | 1 |
| Coverage | 44.2% (invalid) | **83.6%** on 1.1k lines |
| Duplications | 0.0% | 0.0% |

> Coverage note: Earlier 44.2% was invalid due to CI pipeline missing DB initialization. Fixed in CI, recovered to 83.6%.

## Final Results (master @ f03f0ea8)

| Metric | Value |
|---|---|
| Quality Gate | **Passed** |
| LOC | 1.7k |
| Coverage | 83.6% on 1.1k lines |
| Duplications | 0.0% on 2.2k lines |
| Security | A (0 issues) |
| Reliability | A (0 issues) |
| Maintainability | A (1 issue) |
| Security Hotspots | 0 |

**Open Issue (1):** `auth_routes.py:88` — redundant Exception class (low/minor, 1 min fix)

---

## Cloud Migration — SonarCloud Note

**Current SonarCloud results above reflect the baseline before cloud migration changes.**

The project is now changing backend architecture from inherited FastAPI to Supabase Edge Functions. D2 will keep the current screenshot as the **before/baseline** result and should be updated one final time after all implementation work is complete. Do not replace the baseline screenshots after each intermediate migration step.

---

## Test Command

```bash
cd implementations/backend
pytest --cov=app --cov-report=xml --cov-report=term-missing
```

## Evidence

<img width="1598" height="837" alt="image" src="https://github.com/user-attachments/assets/febfa46d-a6b1-461a-8d7e-ff090160fa64" />
<img width="1630" height="856" alt="image" src="https://github.com/user-attachments/assets/2f66b1d4-21ad-4e72-8cc5-5c6c6e27b3f1" />


