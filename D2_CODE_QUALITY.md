# D2: Code Quality Report

## Overview

Phase 2 Part 2 maintenance scope includes:
- UI Localization (English/Thai toggle)
- Administrative Reporting System
- Native Android mobile application

## Analysis Scope

| Setting | Value |
|---|---|
| Active Backend | Supabase Edge Functions (`supabase/functions/`) |
| Active Coverage Source | Deno built-in LCOV (`supabase/functions/coverage/lcov.info`) |
| Android Coverage Source | JaCoCo XML (`implementations/mobile/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml`) |
| Legacy Backend | Inherited FastAPI (`implementations/backend/app`) — old backend kept for comparison tests |
| Legacy Coverage | Available in `implementations/backend/coverage.xml` but no longer drives SonarCloud quality gate |
| Frontend Coverage Source | `implementations/frontend/coverage/lcov.info` from local `npm run test:coverage` |
| New Code Definition | Previous version: compare current `2.0` scan against baseline `1.0` scan |

> **Scope note:** The original project measured only the FastAPI backend. The active backend is now Supabase Edge Functions. The old Python backend is still tested for comparison, but it is not the main quality target anymore.

## Quality Comparison

| Metric | Before (Legacy FastAPI) | After (Active Edge Functions + Android) |
|---|---:|---:|
| Quality Gate | Failed | **Local evidence passed; SonarQube Cloud final screenshot unavailable due service maintenance** |
| Bugs | 0 | 0 |
| Vulnerabilities | 0 | 0 |
| Code Smells | 0 | 1 (legacy `auth_routes.py:88`) |
| Edge Function Coverage | Not measured | **90.2%** on helper/shared code (auth.ts 86.5%, cors.ts 96%, json.ts 100%, helpers.ts 93.3%) |
| Android Helper Coverage | Not measured | **100% line coverage**, **91.21% branch coverage** on pure Kotlin utility code |
| Legacy Backend Coverage | 44.2% (invalid) | **96%** (comparison tests only) |
| Frontend New-Code Coverage | Not measured | **98.93%** statements, **100%** lines |
| Duplications | 0.0% | 0.0% |

> Coverage note: The 44.2% was invalid due to CI pipeline missing DB initialization. The active backend is Supabase Edge Functions, measured by Deno built-in LCOV (`npx deno coverage coverage --lcov`). The 90.2% covers 184 lines of pure helper/shared code only — it does not include the ~1,000-line Deno.serve handler and router, which requires a live Supabase project and is covered by deployed smoke tests instead.

## Current Baseline Results — Active Backend (Supabase Edge Functions)

| Metric | Value |
|---|---|
| Quality Gate | **Local evidence passed; final SonarQube Cloud capture unavailable due service maintenance** |
| LOC measured | 184 lines (auth.ts 111 + cors.ts 25 + json.ts 18 + helpers.ts 30) |
| Coverage (helper/shared only) | **90.2%** |
| Functions | 18 named functions; `tokenFromRequest` in auth.ts not exercised by unit tests |
| Per-file | auth.ts 86.5%, cors.ts 96%, json.ts 100%, helpers.ts 93.3% |
| TypeScript validation | `npx deno check api/index.ts` passes |
| Duplications | 0.0% |

**Deno test results:** 25 tests passed (7 auth + 7 shared helpers + 11 api helpers)

## Legacy Backend — Reference Only (Not Gating)

The inherited FastAPI backend (`implementations/backend/`) is kept for comparison. Its last passing state was 96% coverage on ~1.1k lines. It is not the active backend for this maintenance work.

## Current Baseline Results — Android App

| Metric | Value |
|---|---|
| Unit test command | `./gradlew.bat --no-daemon testDebugUnitTest jacocoTestReport` |
| Unit tests | **75 passed**, 0 failures, 0 errors |
| Coverage scope | Pure Kotlin Android utility code in `com.kkaovsp.boothorganizer.util` |
| Line coverage | **100%** |
| Instruction coverage | **100%** |
| Branch coverage | **91.21%** |
| Build command | `./gradlew.bat --no-daemon assembleDebug` |
| Build result | **BUILD SUCCESSFUL** |

Coverage note: Android `MainActivity.kt` is a large programmatic UI file and `ApiClient.kt` depends on live network behavior. They remain analyzed as source code, but are excluded from the unit coverage gate and verified through APK build, emulator runtime checks, and Edge API smoke tests.

## Cloud Migration — SonarCloud Note

The active backend is Supabase Edge Functions. SonarCloud consumes Deno LCOV from `supabase/functions/coverage/lcov.info` using the property `sonar.javascript.lcov.reportPaths`. Android coverage is imported from JaCoCo XML using `sonar.coverage.jacoco.xmlReportPaths`. The active scan sources are `supabase/functions/` and `implementations/mobile/app/src/main/java`; the legacy FastAPI backend (`implementations/backend/`) is excluded from this active scan.

## New Code Report Method

The before-implementation baseline was scanned as project version `1.0`. The after-implementation scan uses `sonar.projectVersion=2.0`. With SonarCloud's New Code Definition set to **Previous version**, SonarCloud treats code added or changed since the previous version scan as **new code**. This is the report to use for D2 after implementation.

For pull requests, SonarCloud also shows new code as the branch diff against `master`. For the final D2 evidence, use the `master` scan after this branch is merged and CI completes, because that scan compares version `2.0` against the earlier `1.0` baseline.

## SonarQube Cloud Availability Note

During the final report update, SonarQube Cloud showed **SQC EU System Maintenance** and warned that analysis execution and access to some features may be interrupted. Because of that, the final D2 evidence below uses verified local/CI-equivalent test commands instead of a fresh SonarQube Cloud screenshot.

Current verified evidence:

| Check | Result |
|---|---|
| Active Edge Function Deno tests | `25 passed`, 90.2% coverage on 184 lines |
| Android unit tests | `75 passed`, 100% line coverage and 91.21% branch coverage on utility code |
| Android build | `assembleDebug` passed |
| Deployed Edge API smoke test | `23/23 smoke checks passed` after payment slip deployment |
| Legacy backend comparison tests | `39 passed`, 96% coverage |
| Frontend tests | `23 passed`, 3 suites |
| Frontend new-code coverage | `98.93%` statements, `100%` lines, `90.12%` branches |
| Frontend build | Compiled successfully |

---

## Test Commands

### Active backend (Deno / Supabase Edge Functions):

```bash
cd supabase/functions
npm install --save-dev deno@1.46.0
npx deno test --coverage=coverage --no-check --allow-all api/index_test.ts _shared/shared_helpers_test.ts _shared/auth_test.ts
npx deno coverage coverage --lcov > coverage/lcov.info
```

### Old backend comparison tests:

```bash
cd implementations/backend
python -c "from app.database.db_connection import init_db; init_db()"
DATABASE_URL=sqlite:///./test.db pytest --cov=app --cov-report=xml --cov-report=term-missing
```

### Frontend:

```bash
cd implementations/frontend
npm run test:coverage
npm run build
```

### Android app:

```bash
cd implementations/mobile
./gradlew.bat --no-daemon testDebugUnitTest jacocoTestReport
./gradlew.bat --no-daemon assembleDebug
```

### Cloud backend smoke checks:

```bash
node scripts/smoke-test-edge-api.mjs
```

## Evidence

Edge Function coverage LCOV is written to `supabase/functions/coverage/lcov.info` using Deno's built-in LCOV output (`npx deno coverage coverage --lcov`) and uploaded as a CI artifact. Android JaCoCo XML is written to `implementations/mobile/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml` and uploaded as a CI artifact for the SonarCloud scan.

The final local verification also included strict deployed payment slip smoke testing after deploying the Supabase migration and Edge Function update. The strict binary slip check passed with real `image/png` responses for both merchant and Booth Manager access.

---

## Limitations

The Deno test suite covers 184 lines of pure helper code from the Edge Function codebase:

- `supabase/functions/_shared/auth.ts` — JWT/password helpers, 111 lines, **86.5% coverage** (tokenFromRequest not exercised)
- `supabase/functions/_shared/cors.ts` — CORS header helpers, 25 lines, **96% coverage**
- `supabase/functions/_shared/json.ts` — JSON response helpers, 18 lines, **100% coverage**
- `supabase/functions/api/helpers.ts` — apiPath, normalizeRole, isValidCitizenId, csvEscape, 30 lines, **93.3% coverage**

The remaining ~1,000 lines of `api/index.ts` contain the Deno.serve handler and route dispatch logic, which requires a live Supabase project or a mock environment to test end-to-end. The smoke test script (`scripts/smoke-test-edge-api.mjs`) exercises the deployed endpoint against the real Supabase cloud project.

The legacy FastAPI backend (`implementations/backend/`) is not part of the active runtime system. It remains in the repository only for comparison with the original project.
