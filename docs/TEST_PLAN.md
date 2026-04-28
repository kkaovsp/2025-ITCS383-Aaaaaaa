# Test Plan — Booth Organizer System

**Author:** Person 2  
**Date:** 2026-04-28  
**Phase:** Phase 2 Part 2 — Maintenance QA  
**System Under Test:** Deployed Supabase Edge Function API + React Frontend

---

## 1. Scope

This test plan covers **regression testing and integration verification** of Person 1's backend migration and platform work. The active backend is the deployed Supabase Edge Function API at:

```
https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api
```

The frontend is the React app in `implementations/frontend`, configured via `REACT_APP_API_URL` to call the Edge API.

### In Scope

- Automated Edge API smoke tests
- Frontend build regression (unit tests, production build)
- Manual browser testing of all user-facing flows
- Role-based access control verification (Booth Manager, Merchant)
- Integration between frontend and Edge API

### Out of Scope

- Localization (Person 3)
- Reporting UI (Person 4)
- Android App (Person 5)
- Database schema changes
- Backend code changes

---

## 2. Test Environments

| Layer | Environment |
|---|---|
| Backend | Deployed Supabase Edge Function API |
| Frontend | React dev server at `http://localhost:3000` |
| Database | Supabase PostgreSQL with seeded demo data |
| Browser | Chrome (Chromium-based) on macOS |

---

## 3. Demo Accounts

| Role | Username | Password |
|---|---|---|
| Booth Manager | `boothManager` | `boothManager123` |
| Merchant | `demoMerchant` | `merchant123` |
| General User | `demoUser` | `user123` |

---

## 4. Test Cases

### 4.1 Automated Tests

| TC-ID | Category | Test | Method | Expected |
|---|---|---|---|---|
| TC-A01 | Edge API | Health endpoint | `node scripts/smoke-test-edge-api.mjs` | `/health` returns `{"status":"ok"}` |
| TC-A02 | Edge API | Public event list | Smoke script | `/events` returns seeded events |
| TC-A03 | Edge API | Event booths | Smoke script | `/events/:id/booths` returns ≥ 2 booths |
| TC-A04 | Edge API | Manager login | Smoke script | Returns bearer token |
| TC-A05 | Edge API | Manager auth/me | Smoke script | Returns `boothManager` / `BOOTH_MANAGER` |
| TC-A06 | Edge API | Create event (CRUD) | Smoke script | Event created, updated, fetched, deleted |
| TC-A07 | Edge API | Create/delete booth | Smoke script | Booth created and deleted successfully |
| TC-A08 | Edge API | Report events | Smoke script | Returns ≥ 2 report events |
| TC-A09 | Edge API | Report rows | Smoke script | Returns ≥ 2 reservation/payment rows |
| TC-A10 | Edge API | Manager users list | Smoke script | Returns ≥ 3 users |
| TC-A11 | Edge API | Manager reservations | Smoke script | Returns ≥ 1 reservation |
| TC-A12 | Edge API | Merchant login | Smoke script | Returns bearer token |
| TC-A13 | Edge API | Merchant auth/me | Smoke script | Returns `demoMerchant` / `MERCHANT` |
| TC-A14 | Edge API | Merchant reservations | Smoke script | Returns ≥ 1 merchant reservation |
| TC-A15 | Edge API | Merchant notifications | Smoke script | Returns ≥ 1 notification |
| TC-A16 | Frontend | Unit tests | `npx react-scripts test --watchAll=false --passWithNoTests` | Exit code 0 |
| TC-A17 | Frontend | Production build | `npm run build` | Compiled successfully |

### 4.2 Manual Browser Tests — Booth Manager Role

| TC-ID | Page | Test | Expected |
|---|---|---|---|
| TC-M01 | Home Page | Page loads with branding, nav links, feature cards | Hero section, Browse Events button, 3-4 feature cards |
| TC-M02 | Register Page | Registration form renders with all fields | Username, Password, Full Name, Contact, Account Type |
| TC-M03 | Login | Login as `boothManager` | Redirects to home, shows role in navbar, extra nav items appear |
| TC-M04 | Events | View events list | 5 seeded events with status badges, View Booths/Edit/Delete buttons |
| TC-M05 | Booths | View booths for Campus Food Fair 2026 | 2 booths (#A1 Occupied, #A2 Available), Add Booth form |
| TC-M06 | Reservations | View all reservations | 4 reservations with mixed statuses (Confirmed, Waiting, Cancelled) |
| TC-M07 | Profile | View profile page | Username, Full Name, Contact Info displayed correctly |
| TC-M08 | Admin Dashboard | Access admin features | Approve Merchants and Review Payments sections |
| TC-M09 | Notifications | View notifications | 2 unread merchant registration notifications |
| TC-M10 | Create Event | View create event form | Event Name, Description, Location, Start/End Date fields |
| TC-M11 | Logout | Manager logs out | Redirects to home, Login/Register buttons reappear |

### 4.3 Manual Browser Tests — Merchant Role

| TC-ID | Page | Test | Expected |
|---|---|---|---|
| TC-M12 | Login | Login as `demoMerchant` | Redirects to home, no Admin/Create Event links |
| TC-M13 | Events | View events as merchant | Events visible, no Edit/Delete buttons (RBAC) |
| TC-M14 | Reservations | View merchant reservations | 1 confirmed reservation for Booth #A1 |
| TC-M15 | Profile | View merchant profile with seller info | Seller info displayed with APPROVED status |

---

## 5. Pass/Fail Criteria

- **Automated tests:** All 19 Edge API smoke checks pass. Frontend test and build exit with code 0.
- **Manual tests:** All pages load, data displays correctly, no JavaScript errors, RBAC enforced.
- **Blocking bugs:** Any test failure that prevents downstream persons (3–5) from working.

---

## 6. Bug Recording

All bugs found during testing are recorded in `docs/TEST_RESULTS.md` with:
- Bug ID, severity, description
- Steps to reproduce
- Expected vs actual behavior
- Screenshot reference (if applicable)
