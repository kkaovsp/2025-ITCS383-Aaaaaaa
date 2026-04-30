# D5: AI Usage Report

## 1. Overview

This report describes how AI tools were used during the Phase 2 Part 2 maintenance work.

AI was used to support planning, implementation, testing, documentation, and review. The students checked the output, ran the project, verified behavior, and decided what to include in the final submission.

## 2. AI Usage Summary

| Area | How AI Was Used | Human Verification |
|---|---|---|
| Planning | AI helped define the maintenance architecture, change requests, and implementation sequence | Human review approved all scope decisions |
| Backend | AI helped migrate backend planning to Supabase Edge Functions and implement API endpoints | Backend tests, deployed API smoke checks, and API inspection |
| Web Frontend | AI helped connect the React app to the deployed Edge Function API, add EN/TH localization, and add the reporting UI | Frontend report tests, build, and deployed API smoke checks |
| Android App | AI helped implement the native Android/Kotlin app with login, events, booths, reservations, reports, and localization | APK build, Android unit coverage, and emulator runtime verification |
| Documentation | AI helped organize D2, D3, D4, and D5 reports | Human review checked final markdown before submission |

## 3. AI Usage by Team Member

| Member | Main Work | AI Support Used | Verification |
|---|---|---|---|
| Person 1 | Architecture, Supabase cloud database, Edge Function backend, frontend API wiring, CI/SonarCloud setup, Android coverage setup, and final documentation review | Planning, implementation support, documentation consistency checks, and review support | Ran backend tests, frontend build/test commands, deployed API smoke checks, Android unit coverage, Android build, and local frontend startup |
| Person 2 | QA test plan, regression checks, bug list, and integration evidence | Test planning and evidence organization | Ran documented regression and integration checks |
| Person 3 | Web EN/TH localization toggle and static UI text | React localization implementation support | Ran frontend build/tests and checked UI behavior |
| Person 4 | Web reporting UI with event filter, data table, and CSV download | React reporting UI implementation support | Ran frontend report tests and build |
| Person 5 | Native Android/Kotlin app with login, events, booths, reservations, reports, and language toggle | Android screen implementation, API client, and Gradle configuration | APK built with Gradle; Android unit coverage passed; runtime verified on emulator for login, events, booths, reservations, reports, language toggle, manager navigation; no FATAL EXCEPTION |

## 4. Example AI Prompts

| Purpose | Example Prompt |
|---|---|
| Backend reporting | Implement Supabase Edge Function reporting endpoints for event list, reservation/payment report, and CSV export using the deployed cloud database. |
| Web localization | Implement a simple English/Thai static UI language toggle without translating database content. |
| Web reporting | Build a Reports page with event dropdown, generate button, report table, empty/error states, and CSV export. |
| Android app | Build a simple native Android app with login, event list, language toggle, and reports screen using the backend API. |
| Documentation | Summarize the implemented maintenance work using the required D2-D5 report structure. |

## 5. Human Review Process

The team used the following review process:

1. Check that AI output follows the approved feature scope.
2. Check that files outside the assigned area were not changed.
3. Run tests or builds for the affected area.
4. Inspect the UI or API behavior manually.
5. Record evidence for the final report.
6. Fix or reject AI output if it does not match the project requirements.

## 6. Limitations and Handling

| Limitation | Handling |
|---|---|
| AI suggests out-of-scope features | Team limited work to localization, reporting, and Android (all 10 CRs) |
| AI code mismatches project structure | Members reviewed existing files before accepting changes |
| AI misses edge cases | Tests added for empty data, invalid events, unchanged content |
| AI output needs final quality evidence | Team reran backend coverage, Edge smoke tests, frontend tests, frontend build, Android unit coverage, Android build, and Android emulator checks before marking each CR complete |

## 7. Final Statement

The students controlled the requirements, scope, verification, and final submission decisions. AI was used as a development assistant only. All work supported by AI was reviewed and tested before being accepted. Every change request (CR-01 to CR-10) was verified by a student, not by AI alone.
