# Team Scope

## Team Members

| Member | Responsibilities |
|--------|------------------|
| Person 1 | Team lead — **Supabase PostgreSQL, Edge Function backend rewrite, deployment**, CI/SonarCloud, architecture/integration review, final merge support |
| Person 2 | First handoff receiver — QA/test plan, regression testing, bug list, and integration evidence after Person 1 |
| Person 3 | Second handoff receiver — web localization EN/TH toggle and static UI text after Person 2 signs off |
| Person 4 | Third handoff receiver — web reporting UI, event filter, report table, and CSV download after Person 3 signs off |
| Person 5 | Final handoff receiver — native Android app after Person 4 signs off |

## Feature Ownership

| Feature | Lead |
|---------|------|
| **Supabase cloud DB / Edge Function backend rewrite / deployment** | Person 1 (team lead) |
| QA Test Plan, Regression Checks, and Evidence | Person 2 |
| Web UI Localization (EN/TH) | Person 3 |
| Web Reporting UI | Person 4 |
| Native Android App | Person 5 |
| Team Lead / CI & Quality | Person 1 |

## Sequential Handoff Rule

Team members work in this order only: Person 1, then Person 2, then Person 3, then Person 4, then Person 5.

No person should start implementation before the previous person finishes their assigned scope, records verification, and updates `docs/WORK_LOG.md`.

Person 2 starts from the current Person 1 handoff. Person 2 should test and document the integrated system first; Person 3, Person 4, and Person 5 wait until Person 2 is finished.

## Branch Rule

All feature and handoff work must happen on a working branch first. Do not commit directly to `master` during active work.

For the current Person 1 handoff, use:

```txt
chore/p1-skeleton-ci
```

Merge into `master` only after the planned work is complete, reviewed, verified, and approved.
