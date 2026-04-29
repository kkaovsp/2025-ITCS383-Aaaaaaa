# Test Results — Booth Organizer System

**Author:** Person 2
**Date:** 2026-04-29
**Phase:** Phase 2 Part 2 — Maintenance QA + D2 SonarCloud migration

---

## 1. Summary

| Category | Total | Pass | Fail |
|---|---|---|---|
| Edge API Smoke Tests | 19 | 19 | 0 |
| Edge Function Deno Tests | 25 | 25 | 0 |
| Legacy Backend Coverage Tests | 39 | 39 | 0 |
| Frontend Automated Tests | 23 | 23 | 0 |
| Manual Browser Tests (Manager) | 11 | 11 | 0 |
| Manual Browser Tests (Merchant) | 4 | 4 | 0 |
| **Total** | **121** | **121** | **0** |

**Overall Result: ✅ ALL TESTS PASSED**

---

## 2. Automated Test Results

### 2.1 Edge API Smoke Tests

**Command:** `node scripts/smoke-test-edge-api.mjs`
**Result:** 19/19 passed

```
PASS health: status=ok
PASS events: count=6; seeded=Campus Food Fair 2026
PASS event booths: count=2
PASS manager login: token returned
PASS manager auth/me: boothManager/BOOTH_MANAGER
PASS create event: 8ac04be9-01ea-422d-a7b4-980cdf914064
PASS update event: 8ac04be9-01ea-422d-a7b4-980cdf914064
PASS get single event: Smoke Test Event 1777395014363
PASS create booth: 9665893e-faca-4959-a750-888510b2c01f
PASS delete booth: 9665893e-faca-4959-a750-888510b2c01f
PASS delete event: 8ac04be9-01ea-422d-a7b4-980cdf914064
PASS report events: count=6
PASS report rows: rows=2
PASS manager users list: count=17
PASS manager reservations: count=4
PASS merchant login: token returned
PASS merchant auth/me: demoMerchant/MERCHANT
PASS merchant reservations: count=1
PASS merchant notifications: count=1
19/19 smoke checks passed
```

### 2.2 Edge Function Deno Tests (Active Backend Coverage)

**Command:** `cd supabase/functions && npx deno test --coverage=coverage --no-check --allow-all api/index_test.ts _shared/shared_helpers_test.ts _shared/auth_test.ts && npx deno coverage coverage --lcov > coverage/lcov.info`
**Result:** 25 passed, 90.2% overall coverage on 184 lines

```
running 7 tests from ./_shared/shared_helpers_test.ts
  jsonResponse sets correct status and headers ... ok
  jsonResponse accepts custom status and extra headers ... ok
  errorResponse returns correct error structure ... ok
  handleOptions returns null for non-OPTIONS requests ... ok
  handleOptions handles CORS preflight ... ok
  corsHeaders uses configured allowed origin ... ok
  corsHeaders falls back when origin is not allowed ... ok

running 7 tests from ./_shared/auth_test.ts
  hashPassword produces a fixable format ... ok
  verifyPassword accepts correct password ... ok
  verifyPassword rejects wrong password ... ok
  verifyPassword rejects invalid hash format ... ok
  createAccessToken and verifyAccessToken round-trip ... ok
  verifyAccessToken rejects tampered token ... ok
  verifyAccessToken rejects expired token ... ok

running 11 tests from ./api/index_test.ts
  apiPath strips /functions/v1/api prefix ... ok
  apiPath strips /api prefix ... ok
  apiPath returns /events ... ok
  apiPath returns / ... ok
  normalizeRole maps role aliases ... ok
  normalizeRole handles edge cases ... ok
  isValidCitizenId validates 13-digit strings ... ok
  isValidCitizenId rejects invalid input ... ok
  csvEscape handles null/undefined ... ok
  csvEscape passes simple strings ... ok
  csvEscape quotes special characters ... ok

ok | 25 passed | 0 failed
```

**Coverage by file:** auth.ts 86.5% (111 lines), cors.ts 96% (25 lines), json.ts 100% (18 lines), helpers.ts 93.3% (30 lines). Overall 90.2% on 184 lines.

**LCOV generated at:** `supabase/functions/coverage/lcov.info` (using Deno built-in `npx deno coverage coverage --lcov`)

### 2.3 Legacy Backend Coverage Tests (Reference Only — Non-Blocking)

**Command:** `pytest --cov=app --cov-report=xml --cov-report=term-missing`
**Result:** 39 passed, 96% total coverage

```
tests/test_quality_coverage.py ......
tests/test_reservation.py ................
TOTAL 1079 46 96%
Coverage XML written to file coverage.xml
39 passed
```

> **Note:** This job is a non-blocking reference in CI. It no longer gates the SonarCloud quality gate. The active SonarCloud scan sources are `supabase/functions/` only, so the Python backend (`implementations/backend/`) is entirely outside the active scan scope and requires no explicit exclusion.

### 2.4 Frontend Unit Tests

**Command:** `npm run test:coverage`
**Result:** 23 passed, 3 suites, 98.93% statement coverage and 100% line coverage for maintenance frontend code

```
PASS src/pages/__tests__/ReportsPage.test.js
PASS src/components/__tests__/LanguageToggle.test.js
PASS src/components/__tests__/NotificationBell.test.js
Tests:       23 passed, 23 total
Test Suites: 3 passed, 3 total
All files:   98.93% statements, 100% lines, 90.12% branches
```

### 2.5 Frontend Production Build

**Command:** `npm run build`
**Result:** Compiled successfully

```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  104.69 kB  build/static/js/main.ee44709f.js
  3.92 kB    build/static/css/main.8e9254da.css
```

---

## 3. Manual Browser Test Results

### 3.1 Booth Manager Role Tests

| TC-ID | Test | Result | Observations |
|---|---|---|---|
| TC-M01 | Home Page | ✅ PASS | Hero section with gradient, "Browse Events" button, 4 feature cards (Find Events, Reserve a Booth, Easy Payment, Real-time Notifications) |
| TC-M02 | Register Page | ✅ PASS | All fields present: Username, Password, Full Name, Contact Info, Account Type (General User / Merchant) |
| TC-M03 | Manager Login | ✅ PASS | `boothManager/boothManager123` → Redirected to home. Navbar shows: Home, Events, Reservations, Profile, Create Event, Admin, notification bell with badge (2), "Booth Manager · BOOTH_MANAGER", Logout |
| TC-M04 | Events List | ✅ PASS | 5 events displayed: Smoke Event, Cancel Event, Report Event, Campus Food Fair 2026, Startup Expo 2026. Each has status badge (Ongoing/Upcoming), View Booths/Edit/Delete buttons |
| TC-M05 | Booths | ✅ PASS | Campus Food Fair 2026: 2 booths. #A1 (Occupied, $1200, 3x3m, Hall A – Front Row, Indoor, Temporary, 2 outlets), #A2 (Available, $1000, 3x3m, Hall A – Middle Row, Indoor, Temporary, 1 outlet). Add Booth form with all fields |
| TC-M06 | Reservations | ✅ PASS | 4 reservations: Booth #A1 Confirmed/Payment Approved, Booth #R1 Waiting/Payment Pending (with Approve Payment button), Booth #B1 Cancelled/Payment Rejected, Booth #A1 Confirmed/Payment Approved |
| TC-M07 | Profile | ✅ PASS | Username: boothManager, Full Name: Booth Manager, Contact: manager@example.com |
| TC-M08 | Admin Dashboard | ✅ PASS | Two management sections: "Approve Merchants" and "Review Payments" with descriptive cards |
| TC-M09 | Notifications | ✅ PASS | 2 unread notifications: "Merchant harry registered and awaits approval", "Merchant merchant01 registered and awaits approval" |
| TC-M10 | Create Event | ✅ PASS | Form fields: Event Name, Description, Location, Start Date, End Date. Create Event and Cancel buttons |
| TC-M11 | Logout | ✅ PASS | Logged out successfully, redirected to home page, Login/Register reappear |

### 3.2 Merchant Role Tests

| TC-ID | Test | Result | Observations |
|---|---|---|---|
| TC-M12 | Merchant Login | ✅ PASS | `demoMerchant/merchant123` → Navbar shows: Home, Events, Reservations, Profile, notification bell. No "Create Event", no "Admin" links (RBAC enforced) |
| TC-M13 | Merchant Events | ✅ PASS | All 5 events visible. Only "View Booths" button per event — no Edit/Delete (RBAC correct) |
| TC-M14 | Merchant Reservations | ✅ PASS | 1 reservation: Booth #A1, CONFIRMED, PAYMENT: APPROVED |
| TC-M15 | Merchant Profile | ✅ PASS | Seller information displayed with APPROVED status badge. Contact info shown |

---

## 4. Bug List

**No blocking bugs were found during final web review.**

The web system is stable after Person 2 QA, Person 3 localization, and Person 4 reporting work.

### Known Limitations (Not Bugs)

| ID | Severity | Description |
|---|---|---|
| KL-01 | Low | Deno tests cover pure helper code (184 lines, 90.2% overall coverage). The main `Deno.serve` handler (~1,000 lines) requires a live Supabase project or mock environment to test end-to-end. Covered by deployed smoke tests (19/19). |
| KL-02 | Low | Payment slip storage is a placeholder marker. Full Supabase Storage integration is a future improvement. |
| KL-03 | Info | The frontend has no search functionality or floor plan UI (out of scope for this maintenance phase). |
| KL-04 | Info | Android app scope is still pending after web completion. |
| KL-05 | Info | Legacy FastAPI backend (`implementations/backend/`) is retained as non-blocking reference job. Its 96% coverage evidence is historical only; it no longer gates SonarCloud. |

---

## 5. Integration Evidence

### 5.1 Frontend → Edge API Integration

The React frontend successfully communicates with the deployed Supabase Edge Function API for all tested flows:

- **Authentication:** Login/logout with bearer token storage in localStorage
- **Public endpoints:** Events and booths load without authentication
- **Protected endpoints:** Reservations, payments, notifications, admin features all require and correctly use the bearer token
- **RBAC:** Booth Manager sees admin features; Merchant does not

### 5.2 Data Consistency

- Seeded demo data (events, booths, reservations, payments, notifications) displays correctly in the frontend
- 6 events loaded from cloud database during latest smoke test
- 2 booths per seeded event with correct occupation status
- 4 reservations with varied statuses (CONFIRMED, WAITING, CANCELLED) render with correct badges
- Notification counts match between bell badge and notifications page

---

## 6. Conclusion

The web app is **verified and stable** based on local Deno tests and deployed smoke tests. The system passes 19 deployed Edge API smoke checks, 25 Deno unit tests with 90.2% coverage on 184 lines of Edge helper/shared code, 39 legacy backend coverage tests (non-blocking reference), 23 frontend tests with 98.93% frontend new-code statement coverage, frontend production build, and the documented manual browser checks. Android remains the next major implementation area.

**D2 SonarCloud migration — configuration complete, awaiting first CI run.** Active backend coverage uses Deno built-in LCOV (`npx deno coverage coverage --lcov > coverage/lcov.info`). Test files are excluded from analysis, helper/shared source is analyzed, and the main handler (`api/index.ts`) and `supabaseClient.ts` are excluded from coverage baseline (covered by smoke tests instead). Legacy Python backend runs as non-blocking reference job.