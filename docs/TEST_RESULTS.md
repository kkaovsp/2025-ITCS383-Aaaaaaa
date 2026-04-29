# Test Results — Booth Organizer System

**Author:** Person 2  
**Date:** 2026-04-28  
**Phase:** Phase 2 Part 2 — Maintenance QA

---

## 1. Summary

| Category | Total | Pass | Fail |
|---|---|---|---|
| Edge API Smoke Tests | 19 | 19 | 0 |
| Frontend Automated Tests | 23 | 23 | 0 |
| Inherited Backend Coverage Tests | 38 | 38 | 0 |
| Manual Browser Tests (Manager) | 11 | 11 | 0 |
| Manual Browser Tests (Merchant) | 4 | 4 | 0 |
| **Total** | **95** | **95** | **0** |

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

### 2.2 Frontend Unit Tests

**Command:** `npm run test:coverage`
**Result:** 23 passed, 3 suites, 98.93% statement coverage and 100% line coverage for new maintenance frontend code

```
PASS src/pages/__tests__/ReportsPage.test.js
PASS src/components/__tests__/LanguageToggle.test.js
PASS src/components/__tests__/NotificationBell.test.js
Tests:       23 passed, 23 total
Test Suites: 3 passed, 3 total
All files:   98.93% statements, 100% lines, 90.12% branches
```

> **Note:** The original project reported backend coverage only. The maintenance team now also records frontend Jest coverage for new maintenance UI files: `ReportsPage.js`, `LanguageToggle.js`, and `NotificationBell.js`. Full inherited-app React coverage is not used for the assignment coverage target because many old pages were outside this maintenance scope.

### 2.3 Inherited Backend Coverage Tests

**Command:** `pytest --cov=app --cov-report=xml --cov-report=term-missing`
**Result:** 38 passed, 95% total coverage

```
tests/test_quality_coverage.py ......
tests/test_reservation.py ................
TOTAL 1082 56 95%
Coverage XML written to file coverage.xml
38 passed
```

### 2.4 Frontend Production Build

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
| KL-01 | Low | Frontend automated tests focus on the reporting page. Full frontend coverage remains limited. |
| KL-02 | Low | Payment slip storage is a placeholder marker. Full Supabase Storage integration is a future improvement (documented by Person 1). |
| KL-03 | Info | The frontend has no search functionality or floor plan UI (out of scope for the maintenance phase, as documented in HANDOVER.md). |
| KL-04 | Info | Android app scope is still pending after web completion. |

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

The web app is **verified and stable**. The system passes 19 deployed Edge API smoke checks, 38 inherited backend coverage tests at 95% coverage, 23 frontend tests with 98.93% frontend new-code statement coverage, frontend production build, and the documented manual browser checks. Android remains the next major implementation area.
