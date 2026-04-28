# D5: AI Usage Report

## 1. Overview

This report describes how AI tools were used during the Phase 2 Part 2 maintenance work.

AI was used to support planning, implementation, testing, documentation, and review. Human team members remained responsible for checking the output, running the project, verifying behavior, and deciding what to include in the final submission.

## 2. AI Usage Summary

| Area | How AI Was Used | Human Verification |
|---|---|---|
| Planning | Helped divide features into change requests and team tasks | Team reviewed scope and simplified the plan |
| Backend | Helped migrate backend planning to Supabase Edge Functions and implement API endpoints | Backend tests, deployed API smoke checks, and API inspection |
| Web Frontend | Helped wire the React app to the deployed Edge Function API | Frontend build, test command, and local startup check |
| Mobile | Planned Android app structure and API usage for later implementation | Android build and emulator checks will be recorded after implementation |
| Documentation | Helped organize D2, D3, D4, and D5 reports | Team reviewed final markdown before submission |

## 3. AI Usage by Team Member

| Member | Main Work | AI Support Used | Verification |
|---|---|---|---|
| Person 1 | Architecture, Supabase database, Edge Function backend, frontend API wiring, CI/SonarCloud setup | Planning, implementation support, and documentation consistency checks | Ran backend tests, frontend build/test commands, deployed API smoke checks, and local frontend startup |
| Person 2 | QA test plan, regression checks, bug list, and integration evidence | Test planning and evidence organization | Will run documented checks before Person 3 starts |
| Person 3 | Web localization EN/TH toggle and static UI text | React localization implementation support | Will run frontend build/tests and inspect UI |
| Person 4 | Web reporting UI and CSV download UI | React reporting UI implementation support | Will run frontend build/tests and inspect UI |
| Person 5 | Native Android app | Android screen/API/test assistance | Will build app and check emulator behavior |

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
| AI suggests out-of-scope features | Team limited work to localization, reporting, and Android |
| AI code mismatches project structure | Members reviewed existing files before accepting changes |
| AI misses edge cases | Tests added for empty data, invalid events, unchanged content |

## 7. Final Statement

The team controlled all requirements, scope, verification, and final submission. AI was used as a development assistant only. All AI-generated work was reviewed before being accepted.
