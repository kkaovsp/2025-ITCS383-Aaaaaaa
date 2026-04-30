# D4: Impact Analysis

> **Status:** This document covers the Phase 2 Part 2 maintenance plan. Web work for CR-01 through CR-06 is completed and verified. Android work for CR-07 through CR-10 is also completed and verified. Active backend is Supabase Edge Functions.

Rendered diagram images are stored beside this report so GitHub displays them directly in `D4_IMPACT_ANALYSIS.md`.

## 1. Overview

Phase 2 Part 2 adds three new features to the Booth Organizer System:

1. **Administrative Reporting** — Booth Managers can filter events and download reservation/payment reports as CSV.
2. **UI Localization** — Static UI text can be switched between English and Thai.
3. **Native Android App** — A mobile app supports core user-facing functions.

The current system has a Supabase Edge Functions backend, a React web frontend, and a native Android application. The old FastAPI backend remains in the repository only as original project material.

## 2. Requirements Artifacts

| ID | Requirement | Change Request | Feature |
|---|---|---|---|
| R01 | Backend report endpoints with event filter | CR-01 | Reporting |
| R02 | Web report table and filter UI | CR-02 | Reporting |
| R03 | CSV export for report data | CR-03 | Reporting |
| R04 | Report empty/error states and tests | CR-04 | Reporting |
| R05 | EN/TH static UI text files | CR-05 | Localization |
| R06 | Language toggle; database content unchanged | CR-06 | Localization |
| R07 | Android project shell with navigation | CR-07 | Android |
| R08 | Android login with JWT and token storage | CR-08 | Android |
| R09 | Android event and booth browsing | CR-09 | Android |
| R10 | Android reservation, payment, reports, localization | CR-10 | Android |

## 3. Design Artifacts

| ID | Design Item | Description | Affected By |
|---|---|---|---|
| D01 | Edge Reports API Design | GET /reports/events, GET /reports/reservations-payments, GET /reports/reservations-payments.csv | R01, R03 |
| D02 | Web Reports Page Design | Event dropdown, data table, CSV download button, loading/empty/error states | R02, R04 |
| D03 | CSV Export Workflow Design | Backend streams CSV; frontend triggers download | R03 |
| D04 | Report State Design | Empty report, invalid event, error response shapes | R04 |
| D05 | i18n Translation Structure Design | EN/TH locale files, Translation keys, namespace conventions | R05 |
| D06 | Language Toggle Design | Toggle button placement, localStorage persistence, content rule | R06 |
| D07 | Android Project Design | Gradle structure, base activities, navigation graph, INTERNET permission | R07 |
| D08 | Android Auth Design | Login screen, SharedPreferences token storage, bearer client | R08 |
| D09 | Android Browsing Design | Event list, booth list, pull-to-refresh, loading states | R09 |
| D10 | Android Feature Design | Reservation screen, payment screen, report screen, EN/TH toggle | R10 |

## 4. Code Modules

| ID | Code Module | File(s) | Change Request |
|---|---|---|---|
| C01 | Edge report endpoints | `supabase/functions/api/index.ts` (report functions) | CR-01 |
| C02 | Web ReportsPage component | `implementations/frontend/src/pages/ReportsPage.js` | CR-02 |
| C03 | CSV export endpoint and button | `supabase/functions/api/index.ts` (CSV function), `ReportsPage.js` (button) | CR-03 |
| C04 | Report state handling | `ReportsPage.js` (empty/error states) | CR-04 |
| C05 | i18n locale files and config | `implementations/frontend/src/locales/en.json`, `th.json`, `i18n.js`, `LanguageToggle.js` | CR-05 |
| C06 | Language toggle and DB rule | `implementations/frontend/src/components/LanguageToggle.js` | CR-06 |
| C07 | Android project structure | `implementations/mobile/app/src/main/java/com/kkaovsp/boothorganizer/MainActivity.kt`, `AndroidManifest.xml`, Gradle files | CR-07 |
| C08 | Android auth flow | `ApiClient.kt`, `MainActivity.kt` (login screen, SharedPreferences token storage, bearer client) | CR-08 |
| C09 | Android event/booth screens | `MainActivity.kt` (event list, booth list, pull-to-refresh, loading states) | CR-09 |
| C10 | Android all remaining screens | `MainActivity.kt`, `ApiClient.kt` (reservation, payment, reports, EN/TH toggle, manager navigation) | CR-10 |

## 5. Test Modules

| ID | Test Module | Test Command / File | Change Request |
|---|---|---|---|
| T01 | Edge report helper tests | `npx deno test api/index_test.ts` (Deno helper coverage, 25 tests); deployed smoke tests cover actual report endpoints (`node scripts/smoke-test-edge-api.mjs`) | CR-01 |
| T02 | Web report UI tests | `npx react-scripts test ReportsPage.test.js` | CR-02 |
| T03 | CSV export smoke check | `node scripts/smoke-test-edge-api.mjs` (CSV endpoint) | CR-03 |
| T04 | Report empty/error state tests | `npx react-scripts test ReportsPage.test.js` (state tests) | CR-04 |
| T05 | Localization toggle tests | `npx react-scripts test LanguageToggle.test.js` | CR-05 |
| T06 | Database unchanged check | Manual inspection after language toggle | CR-06 |
| T07 | Android shell build and coverage | `./gradlew.bat --no-daemon assembleDebug`; `./gradlew.bat --no-daemon testDebugUnitTest jacocoTestReport`; APK built successfully; 75 Android JVM unit tests passed | CR-07 |
| T08 | Android login test | Emulator `BoothOrganizer_API35` / `emulator-5554`; APK install via `adb install`; login screen renders, token stored, no `FATAL EXCEPTION` | CR-08 |
| T09 | Android browsing test | Runtime check: event list loads, booth list loads, pull-to-refresh works, loading states shown | CR-09 |
| T10 | Android feature test | Runtime check: reservation creation, payment flow, reports generation, EN/TH language toggle, manager navigation, no `FATAL EXCEPTION`; utility coverage 100% line / 91.21% branch | CR-10 |

## 6. Full Traceability Graph

![D4 Full Traceability Graph](D4_TRACEABILITY_GRAPH.svg)

The image above follows the assignment format: Requirements, Design, Code, and Test are shown as vertical columns with arrows between related lifecycle objects.

**Legend:** All items are completed (green). CR-01 to CR-06 are web features; CR-07 to CR-10 are Android features.

## 7. Affected-Part Traceability (Maintenance Scope)

![D4 Affected-Part Traceability Graph](D4_AFFECTED_TRACEABILITY_GRAPH.svg)

The image above is the affected-only version of the traceability graph. It keeps only the reporting, localization, Android, and related verification paths introduced or changed during this maintenance phase.

**Legend:** Green nodes are affected by the maintenance changes. This graph removes unrelated inherited FastAPI modules and keeps only reporting, localization, Android, and their verification paths.

## 8. Software Lifecycle Object (SLO) Graph

![D4 Directed SLO Graph](D4_SLO_GRAPH.svg)

The image above focuses only on code modules, as required by the assignment.

**Dependency summary:** The graph focuses only on code modules. Authentication affects all protected services. Events and booths feed reservations. Reservations and payments feed reports. The web UI and Android screens both depend on the same API objects. Localization affects user-facing web and Android screens. The Android API client is central because it connects the Android screens to every protected API.

## 9. SLO Connectivity Matrix

The table below shows shortest-path impact distance. A blank diagonal means the source and target are the same object.

| From / To | SLO00 | SLO01 | SLO02 | SLO03 | SLO04 | SLO05 | SLO06 | SLO07 | SLO08 | SLO09 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **SLO00** |  | 2 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 2 |
| **SLO01** | 2 |  | 1 | 1 | 2 | 1 | 1 | 2 | 2 | 1 |
| **SLO02** | 3 | 2 |  | 1 | 2 | 2 | 1 | 2 | 2 | 1 |
| **SLO03** | 2 | 2 | 2 |  | 1 | 1 | 1 | 2 | 2 | 1 |
| **SLO04** | 2 | 2 | 3 | 2 |  | 1 | 1 | 2 | 2 | 1 |
| **SLO05** | 2 | 2 | 3 | 2 | 2 |  | 1 | 1 | 2 | 1 |
| **SLO06** | 2 | 2 | 3 | 2 | 2 | 2 |  | 1 | 1 | 1 |
| **SLO07** | 3 | 3 | 4 | 3 | 3 | 2 | 2 |  | 3 | 1 |
| **SLO08** | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 2 |  | 1 |
| **SLO09** | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 3 | 1 |  |

**Interpretation:** SLO08 (Android API Client) and SLO09 (Android Screens) have low distances to most backend modules, so Android changes can expose backend/API contract issues quickly. SLO05 (Reports API) is close to reservations, payments, localization, web UI, and Android screens, so reporting changes need cross-platform regression checks. SLO07 (Localization) is more isolated from backend logic, which is why the database-content-unchanged rule is low risk.

## 10. Change Request Difficulty

### Easier to Apply

| CR | Why it is easier |
|---|---|
| CR-03 (CSV Export) | The reporting API already returns structured data. Adding CSV formatting and a download endpoint is a thin layer on existing code. The frontend button triggers an existing endpoint. |
| CR-04 (Report States) | Adding empty-state and error-state handling to an existing React component is straightforward. The component already has a loading state; adding error boundaries and empty messages requires only a few conditional renders and a test. |
| CR-06 (Database Unchanged Rule) | This is a design rule, not a code change. The language toggle only touches static UI text in translation files. No backend or data-layer code is affected. |

### More Difficult to Apply

| CR | Why it is harder |
|---|---|
| CR-02 (Web Report UI) | Requires coordinating a backend API response shape, a frontend data table with sorting and pagination, and a CSV download button. Multiple files and languages (TypeScript/React/HTML) must stay consistent. |
| CR-05 (EN/TH Localization) | Requires creating a translation architecture (i18n config, locale files, namespace conventions) that all future developers must follow. Mistakes affect every page, not just one component. |
| CR-07 to CR-10 (Android App) | Required setting up a full Android project from scratch: Gradle configuration, Android manifest, activities, navigation, API client, and authentication flow. No existing Android baseline existed to extend. Platform differences (Android hardware buttons, intent handling, different HTTP client, SDK and emulator setup) added complexity not present in the web frontend. |

## 11. Recommendations for Previous Developers

To make future maintenance easier, the following practices would help:

1. **Document all API response shapes with examples.** The reporting endpoints were easier to implement because the existing API patterns were predictable. If previous developers had published example JSON responses for each endpoint, new features would be faster to add.

2. **Keep a shared translation key convention.** Adding EN/TH support required reviewing every React component to find hardcoded text. A convention for translation key naming (e.g., `page_section_element`) would let a linter find missing keys automatically.

3. **Separate integration-tested code from unit-tested code.** The Edge Function handler (~1,000 lines) cannot be unit tested without a mock Supabase client. If the router and business logic had been separated into smaller functions with dependency injection, unit test coverage would be higher without requiring live cloud credentials.

4. **Provide an API contract or Postman collection.** New developers integrating the Android app will need to know the exact request shapes, authentication headers, and response formats for all endpoints. A shared API contract reduces back-and-forth.

5. **Add inline comments for non-obvious business rules.** The database-content-unchanged rule for localization was not written in any code comment. A developer who did not attend the requirements meeting would not know why the toggle does not translate event names.

## 12. Current Status Summary

| Feature | CRs | Status |
|---|---|---|
| Administrative Reporting | CR-01 to CR-04 | Completed and verified: Edge API deployed, web ReportsPage implemented, smoke tests 19/19, Deno unit tests 25/25 at 90.2% coverage on 184 lines |
| UI Localization | CR-05 to CR-06 | Completed and verified: i18n structure with EN/TH files, LanguageToggle component, frontend tests pass, database content unchanged by design |
| Native Android App | CR-07 to CR-10 | Completed and verified: native Android project built with `./gradlew.bat --no-daemon assembleDebug`, APK installed and launched on emulator `BoothOrganizer_API35` / `emulator-5554`, runtime verified for login, events, booths, reservations, profile, reports, language toggle, and manager navigation; no `FATAL EXCEPTION` |

The active backend for web and Android features is Supabase Edge Functions at `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api`. The old FastAPI backend (`implementations/backend/`) is not used by the current web or Android app.
