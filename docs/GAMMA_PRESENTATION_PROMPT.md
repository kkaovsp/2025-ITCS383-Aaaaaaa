# Gamma AI Presentation Prompt

Copy this prompt into Gamma AI to create the project presentation.

---

Create a clear, simple, professor-friendly slide deck for a university software maintenance project.

Project title: **Booth Organizer System — Phase 2 Part 2 Maintenance**

Audience: professor and classmates. Keep the wording easy to present out loud. Avoid overly formal business language. Use simple explanations, short bullets, and clear visuals.

Style: clean academic presentation, modern but not flashy. Use blue/purple accents to match the Booth Organizer app theme. Use screenshots/diagram placeholders where useful. Make about 10–12 slides.

Important project context:
- The system is a Booth Organizer platform for event booth management.
- Booth Managers create events, manage booths, approve merchants, review reservations/payments, and generate reports.
- Merchants can register, reserve booths, submit payments, and upload payment slips.
- General Users can browse events and use user-facing features.
- The active backend is **Supabase Edge Functions** with Supabase PostgreSQL.
- The web frontend is a **React app**.
- The mobile app is a **native Android/Kotlin app**.
- The old inherited FastAPI backend is kept only for comparison tests; it is not the active backend.

Required maintenance features completed:
1. **Administrative Reporting System**
   - Backend report endpoints were added.
   - Booth Managers can filter by event.
   - Reports show reservation/payment data.
   - CSV export is supported.

2. **UI Localization**
   - Static UI text supports English and Thai.
   - Language toggle is available.
   - Database content such as event names and merchant names stays unchanged.

3. **Native Android App**
   - Android/Kotlin project added.
   - Supports login, event browsing, booth browsing, reservations, payments, reports, profile, notifications, and EN/TH toggle.
   - Uses the same deployed Supabase Edge API as the web app.

4. **Payment Slip Storage and Viewing**
   - Payment slips are stored in a private Supabase Storage bucket.
   - Backend returns real slip image/PDF bytes for viewing.
   - Android app opens slips using FileProvider.
   - Merchant can view own slip; Booth Manager can view merchant slip.

Change requests:
- CR-01: Backend report API with event filter
- CR-02: Web report table and filter UI
- CR-03: CSV export
- CR-04: Report empty/error handling and tests
- CR-05: EN/TH static UI text support
- CR-06: Language toggle and unchanged database content
- CR-07: Android app project/repository structure
- CR-08: Android login and authentication flow
- CR-09: Android event/booth browsing
- CR-10: Android reservation/payment/reporting/localization support

Quality and verification evidence:
- Edge API smoke tests: 23/23 passed after final deployment.
- Edge Function Deno tests: 25 passed, 90.2% coverage on helper/shared code.
- Android unit tests: 75 passed.
- Android JaCoCo coverage: 100% line coverage and 91.21% branch coverage on pure Kotlin utility code.
- Android APK build: successful.
- Frontend tests: 23 passed.
- Frontend build: successful.
- Strict payment slip binary smoke check passed after Supabase deployment.
- D4 impact-analysis diagrams are included in `D4_IMPACT_ANALYSIS.md`:
  - full traceability graph
  - affected-only traceability graph
  - directed SLO graph
  - SLO connectivity matrix

Suggested slide structure:

Slide 1 — Title
- Booth Organizer System
- Phase 2 Part 2 Maintenance
- Team/project summary

Slide 2 — System Overview
- Explain what the Booth Organizer does.
- Mention three user roles: Booth Manager, Merchant, General User.
- Show simple architecture: React Web + Android App + Supabase Edge API + Supabase DB/Storage.

Slide 3 — Maintenance Goals
- Three main required features: Reporting, Localization, Android App.
- Also mention final payment slip storage/viewing fix.
- Explain that the goal was to improve the existing system, not rebuild everything from scratch.

Slide 4 — Change Requests
- Show all 10 CRs grouped by feature.
- Reporting: CR-01 to CR-04.
- Localization: CR-05 to CR-06.
- Android: CR-07 to CR-10.

Slide 5 — Reporting Feature
- Event filter for Booth Managers.
- Reservation/payment report table.
- CSV export.
- Empty/error handling.
- Verification: smoke tests, frontend tests, build.

Slide 6 — Localization Feature
- English/Thai static UI text.
- Language toggle.
- Database content remains unchanged.
- Why this matters: makes UI easier for Thai/English users without changing stored event data.

Slide 7 — Android App
- Native Kotlin app.
- Login, events, booths, reservations, payments, reports, profile, notifications, language toggle.
- Uses same cloud API as web app.
- Verification: APK build, emulator runtime checks, unit tests.

Slide 8 — Payment Slip Fix
- Before: payment slip was only placeholder/metadata.
- After: real file storage in Supabase Storage.
- Slip viewing works for merchant and manager.
- Android uses FileProvider to open image/PDF safely.

Slide 9 — Quality Evidence / D2
- Show a simple table with tests and results:
  - Edge smoke: 23/23
  - Deno tests: 25 passed, 90.2% coverage
  - Frontend tests: 23 passed
  - Android tests: 75 passed
  - Android coverage: 100% line, 91.21% branch on utility code
  - Android build: passed
- Mention SonarCloud new-code setup: baseline 1.0, after scan 2.0.

Slide 10 — D4 Impact Analysis
- Include or summarize the 3 diagrams:
  - full traceability graph
  - affected-only traceability graph
  - directed SLO graph
- Explain in simple words: requirements connect to design, code, and tests; SLO graph shows code module dependencies.

Slide 11 — What Was Easy vs Difficult
- Easier:
  - CSV export because report data already existed.
  - Report empty/error states because it was mostly UI conditions.
  - Database unchanged localization rule because it was mainly a design rule.
- Harder:
  - Web report UI because backend/frontend needed to match.
  - Localization because many UI strings had to be reviewed.
  - Android app because it required Gradle, API client, screens, emulator, and platform-specific handling.
  - Payment slip viewing because it needed backend storage, permissions, binary response, and Android file handling.

Slide 12 — Final Result
- All 10 change requests completed.
- Web, backend, Android, reporting, localization, payment slip viewing verified.
- System is ready for demonstration.
- End with demo flow suggestion:
  1. Login as Booth Manager.
  2. Show reports and CSV export.
  3. Toggle EN/TH.
  4. Show Android login/events/reservations.
  5. Show payment slip upload/viewing.

Add speaker notes for each slide with short presentation sentences. Keep each slide visually clean with no more than 5 bullets. Use simple icons for web, mobile, database, testing, and reports. Include placeholders for screenshots if images are not available.
