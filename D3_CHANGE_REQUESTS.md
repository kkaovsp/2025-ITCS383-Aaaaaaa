# D3: Change Request Analysis

## Change Request List

| CR ID | Associated Feature | Short Name |
|---|---|---|
| CR-01 | UI Localization | Add EN/TH UI text support |
| CR-02 | UI Localization | Add language toggle button |
| CR-03 | UI Localization | Keep user data untranslated |
| CR-04 | UI Localization | Add localization tests |
| CR-05 | Administrative Reporting | Add event report filter |
| CR-06 | Administrative Reporting | Show report table |
| CR-07 | Administrative Reporting | Add CSV export |
| CR-08 | Administrative Reporting | Add report error handling and tests |

---

## CR-01: Add EN/TH UI text support

| Attribute | Description |
|---|---|
| Associated Feature | UI Localization |
| Description | Add English and Thai text support for static UI elements such as menus, buttons, page titles, and form labels. |
| Maintenance Type | Adaptive |
| Priority | High |
| Severity | Major |
| Time to Implement | 1 person-week |
| Verification Method | Testing and inspection |

---

## CR-02: Add language toggle button

| Attribute | Description |
|---|---|
| Associated Feature | UI Localization |
| Description | Add an EN/TH language toggle button in the navigation or header area so users can switch the static interface language. |
| Maintenance Type | Perfective |
| Priority | High |
| Severity | Major |
| Time to Implement | 0.5 person-week |
| Verification Method | Testing and inspection |

---

## CR-03: Keep user data untranslated

| Attribute | Description |
|---|---|
| Associated Feature | UI Localization |
| Description | Make sure event names, merchant names, booth descriptions, and other database content do not change when the user switches language. |
| Maintenance Type | Corrective |
| Priority | High |
| Severity | Critical |
| Time to Implement | 0.5 person-week |
| Verification Method | Testing and inspection |

---

## CR-04: Add localization tests

| Attribute | Description |
|---|---|
| Associated Feature | UI Localization |
| Description | Add simple tests to check that the language toggle changes static UI text and does not change user-generated content. |
| Maintenance Type | Preventive |
| Priority | Medium |
| Severity | Major |
| Time to Implement | 0.5 person-week |
| Verification Method | Testing |

---

## CR-05: Add event report filter

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Add a report section where Booth Managers can select an event from a dropdown before generating a report. |
| Maintenance Type | Adaptive |
| Priority | High |
| Severity | Critical |
| Time to Implement | 1 person-week |
| Verification Method | Testing and inspection |

---

## CR-06: Show report table

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Show a Reservation and Payment report table with fields such as Reservation ID, Merchant Name, and Payment Status. |
| Maintenance Type | Perfective |
| Priority | High |
| Severity | Critical |
| Time to Implement | 1 person-week |
| Verification Method | Testing and inspection |

---

## CR-07: Add CSV export

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Add a CSV export button so Booth Managers can download the generated report data. |
| Maintenance Type | Perfective |
| Priority | Medium |
| Severity | Major |
| Time to Implement | 0.5 person-week |
| Verification Method | Testing and inspection |

---

## CR-08: Add report error handling and tests

| Attribute | Description |
|---|---|
| Associated Feature | Administrative Reporting |
| Description | Handle empty reports and invalid event selections, then add simple tests for the report workflow. |
| Maintenance Type | Preventive |
| Priority | Medium |
| Severity | Major |
| Time to Implement | 0.5 person-week |
| Verification Method | Testing |
