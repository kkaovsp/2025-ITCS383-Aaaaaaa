# D3: Change Request Analysis

## Change Request List

| CR ID | Associated Feature | Short Name |
|---|---|---|
| CR-01 | Administrative Reporting | Backend report API with event filter |
| CR-02 | Administrative Reporting | Web report table and filter UI |
| CR-03 | Administrative Reporting | CSV export |
| CR-04 | Administrative Reporting | Report empty/error handling and tests |
| CR-05 | UI Localization | EN/TH static UI text support |
| CR-06 | UI Localization | Language toggle and unchanged database content |
| CR-07 | Native Android App | Android app project/repository structure |
| CR-08 | Native Android App | Android login and authentication flow |
| CR-09 | Native Android App | Android event/booth browsing |
| CR-10 | Native Android App | Android reservation/payment/reporting/localization support |

---

## CR-01: Backend report API with event filter

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Add backend reporting endpoints that accept an event_id filter and return reservation/payment data. Endpoints: GET /reports/events and GET /reports/reservations-payments?event_id=<id> under the Edge API base URL. |
| Maintenance Type | Adaptive |
| Priority | High |
| Severity | Critical |
| Time to Implement | 1 person-week |
| Verification Method | Edge API smoke tests (19/19 passed) and Deno helper unit tests (25/25, 90.2% coverage on 184 lines of shared/Edge helper code) |

---

## CR-02: Web report table and filter UI

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Create web UI for Booth Managers to select an event from a dropdown and view a reservation/payment report table. |
| Maintenance Type | Perfective |
| Priority | High |
| Severity | Critical |
| Time to Implement | 1 person-week |
| Verification Method | Frontend automated tests (6 report-specific tests passed) and `npm run build` compiled successfully; manual inspection confirms event dropdown, data table, and filter controls render correctly |

---

## CR-03: CSV export

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Add a CSV export button so Booth Managers can download the generated report data as a CSV file. |
| Maintenance Type | Perfective |
| Priority | Medium |
| Severity | Major |
| Time to Implement | 0.5 person-week |
| Verification Method | Edge API smoke test for CSV endpoint (`/reports/reservations-payments.csv`) returned valid CSV output; UI download button triggers browser download and file content inspected |

---

## CR-04: Report empty/error handling and tests

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Handle empty reports and invalid event selections with clear error responses; add simple tests for the report workflow. |
| Maintenance Type | Preventive |
| Priority | Medium |
| Severity | Major |
| Time to Implement | 0.5 person-week |
| Verification Method | Frontend automated tests for empty and error state rendering (ReportsPage test suite); manual inspection confirms empty-state message and error boundary display correctly |

---

## CR-05: EN/TH static UI text support

| Attribute | Description |
|---|---|
| Associated Feature | UI Localization |
| Description | Add English and Thai translation files so all static interface elements (menus, buttons, labels) use translation files. |
| Maintenance Type | Adaptive |
| Priority | High |
| Severity | Major |
| Time to Implement | 1 person-week |
| Verification Method | Frontend automated tests for LanguageToggle passed; `npm run build` compiled successfully; manual UI inspection confirms EN/TH text files are loaded and toggle is visible in navbar |

---

## CR-06: Language toggle and unchanged database content

| Attribute | Description |
|---|---|
| Associated Feature | UI Localization |
| Description | Ensure language toggle only affects static UI; event names, merchant names, booth descriptions, and other database content must remain in original language regardless of toggle state. |
| Maintenance Type | Corrective |
| Priority | High |
| Severity | Critical |
| Time to Implement | 0.5 person-week |
| Verification Method | Language toggle button toggles UI text between English and Thai in the browser; database content (event names, merchant names, booth descriptions) remains in original language after toggle |

---

## CR-07: Android app project/repository structure

| Attribute | Description |
|---|---|
| Associated Feature | Native Android App |
| Description | Create shell Android project with Gradle wrapper, base activities, navigation structure, and INTERNET permission. |
| Maintenance Type | Adaptive |
| Priority | High |
| Severity | Major |
| Time to Implement | 1 person-week |
| Verification Method | `./gradlew.bat --no-daemon assembleDebug` completed without error, producing debug APK; Android project structure inspected (Gradle files, AndroidManifest.xml, MainActivity.kt, ApiClient.kt present); Android unit coverage passed (`75 passed`, 100% line coverage on utility code) |

---

## CR-08: Android login and authentication flow

| Attribute | Description |
|---|---|
| Associated Feature | Native Android App |
| Description | Implement JWT-based login screen, token storage in SharedPreferences, and authenticated API client using existing backend auth endpoints. |
| Maintenance Type | Perfective |
| Priority | High |
| Severity | Major |
| Time to Implement | 1 person-week |
| Verification Method | APK installed on emulator `BoothOrganizer_API35` (device `emulator-5554`) via `adb install`; runtime verified: login screen renders, JWT token received and stored in SharedPreferences, authenticated requests succeed, no `FATAL EXCEPTION` in log |

---

## CR-09: Android event/booth browsing

| Attribute | Description |
|---|---|
| Associated Feature | Native Android App |
| Description | Display list of events and booths; allow browsing booth details with pull-to-refresh and loading/empty/error states. |
| Maintenance Type | Perfective |
| Priority | High |
| Severity | Major |
| Time to Implement | 1 person-week |
| Verification Method | Runtime verified on emulator `BoothOrganizer_API35` / `emulator-5554`: event list loads, booth list loads, pull-to-refresh triggers reload, loading and empty states display correctly |

---

## CR-10: Android reservation/payment/reporting/localization support

| Attribute | Description |
|---|---|
| Associated Feature | Native Android App |
| Description | Allow logged-in user to reserve a booth, view reservations with payment status, access reports screen with event filter, and toggle language between EN/TH. |
| Maintenance Type | Perfective |
| Priority | High |
| Severity | Major |
| Time to Implement | 1 person-week |
| Verification Method | Runtime verified on emulator `BoothOrganizer_API35` / `emulator-5554`: reservation creation flow, payment screen, reports generation with event filter, EN/TH language toggle, manager-only navigation (Admin, Create Event); Android unit coverage passed (`75 passed`, 100% line coverage on utility code); crash scan confirms no `FATAL EXCEPTION` in log |
