# Time Tracker testing report

Tested November 11, 2026 (Asia/Manila), against the local app on port 3000 and its configured Supabase project.

## Coverage and results

- Production build: passed (`npm run build`).
- TypeScript: passed (`npx tsc --noEmit`) after the final navigation edit.
- Regression suite: 7/7 passed (`npm test`). Database writes/deletes in these tests use an isolated in-memory double.
- Focused lint: passed for the time-entry route, employee access helper, and new tests.
- Repository lint baseline: failed with 149 errors and 251 warnings before changes. Includes application code and scratch scripts; these were not broadly rewritten.
- Browser: successful sign-in with the supplied account; inspected dashboard, time tracking, attendance calendar, Flow Hub, activity logs, and analytics.
- Signed-out HTTP checks: `/` redirects to login; login renders; protected APIs return JSON 401.
- Signed-in HTTP checks: login, time entries, punch logs, Flow Hub, and attendance overrides returned 200. Profile, metadata, roster, and activity logs returned 500.
- Read-only database checks confirmed missing schedule and notification tables through PostgREST errors.

No punches, employee records, schedules, or time entries were intentionally created, edited, or deleted in the connected database. Sign-in was exercised normally; the app attempts to emit login notifications automatically. No live schema changes or deployment were performed.

## Fixed locally

### High: time-entry access enforced only by the dashboard

The time-entry route used a privileged database client without checking active employee access or ownership. The proxy rejects signed-out callers, but any signed-in caller could directly read organization records, submit another employee's name, or delete another employee's ticket. Filtering rows in the browser did not protect the API.

Changes: check active employee access in GET/POST/DELETE; restrict non-admin queries/deletes to the authenticated employee's exact name; reject submissions for another employee. Admin access is preserved. Cache keys include access scope, and responses use `private, no-store` instead of public shared caching. Invalid JSON, blank summaries, and missing required fields now return 400.

Seven regression tests cover missing access, read/cache isolation, impersonation rejection, malformed payloads, valid submissions/cache invalidation, scoped deletion, and admin access.

Remaining limitation: the legacy time-entry table identifies owners by name. Employees with identical names cannot be reliably distinguished until entries store an immutable employee ID. Account assignment restrictions are not added by this patch.

### Medium: inconsistent Administrator permissions

`administrator` counted as an admin but not as an attendance manager unless the employee's position independently qualified. The shared helper now recognizes all three supported admin roles consistently.

### Medium: navigation state can revert during a pending URL update

The URL synchronization effect depended on local active-tab state, so selecting a tab could run the effect against the previous URL while `router.replace` was pending. It now synchronizes when the URL tab parameter changes, using a functional state update. Navigation to attendance, Flow Hub, activity, and analytics was exercised in the browser.

## Outstanding findings

### High: configured database lacks required tables

The Data API returned `PGRST205` for both `public.employee_work_schedules` and `public.notifications` (not present in schema cache).

Reproduce: sign in, then request `/api/auth/me`, `/api/meta`, `/api/team-roster`, or `/api/activity-logs`. All returned 500 during this run. Attendance displays zero employees; profile schedule/account data is incomplete. The activity view can still display a local login event even when server notification persistence fails.

There is a schedule migration at `supabase/migrations/20261013_employee_work_schedules.sql`; no notification-table migration was found in the repository. Reconcile the configured project's schema and Data API exposure with the application's requirements, then rerun the affected endpoints. Confirm table grants and RLS before exposing data. The error alone does not establish whether a table is absent physically or missing from Data API exposure/cache.

### High: task durations are reported as attendance shifts

`components/dashboard/AnalyticsView.tsx` consumes `PhoneTimeRecord` task/call entries, labels them verified shift logs, classifies any entry shorter than 8 hours as undertime, and infers lateness from words such as `late`, `delay`, or `tardy` in task summaries/tags. The dashboard also presents task records as shift summaries.

Observed: four task entries produced four verified shifts and four undertime flags. Analytics displayed one active contributor out of zero roster members and a 100% present ring beside a 50% present legend.

Attendance metrics should use actual shift punches, work schedules, and authorized attendance overrides. Task activity should retain separate duration metrics. Short calls and mentions of customer delays must not determine employee attendance status.

### Medium: stale active shift is presented as current working time

The supplied account showed an active working timer exceeding 1,043 hours and three completed punch milestones, while the November 11 timeline showed no punches for today. `/api/punch-logs?empId=1597` returned historical logs successfully.

Investigate the last unclosed shift and how historical/current shift boundaries are displayed. Surface an explicit stale or unclosed shift state and a reviewed correction path; do not silently alter attendance history. No historical punch was changed during testing.

### Medium: Flow Hub weekday dates are hardcoded

`components/dashboard/FlowHubView.tsx` renders Monday 14 through Sunday 20 and initially selects Tuesday, regardless of today's date. On Wednesday, November 11 it still displayed those values. Derive dates and initial selection from the current workforce week in Asia/Manila.

### Medium: legacy shift notes are volatile and permit arbitrary employee IDs

`app/api/shift-notes/route.ts` stores notes in a process-local object with seeded example notes. Notes disappear on restart, differ across server instances, and lack employee ownership checks in the handler. The proxy provides only session authentication. No active UI caller was found. Retire this unused route or implement durable, authorized storage before using it.

## Limits

This is a focused functional and code review, not exhaustive certification. Live create/update/delete attendance and timer flows were not submitted, avoiding changes to real records. Multi-user concurrency, alternate-role browser sessions, responsive layouts, Google OAuth, PWA offline behavior, and deployment infrastructure were not fully exercised. Missing schema blocks complete schedule, roster, profile, and notification verification.

## Follow-up fixes (November 11, 2026)

- `employee_work_schedules` is treated as unavailable only when PostgREST returns `PGRST205`; profile and roster still load active employees. The private gateway needs its schedule schema restored for shift details and schedule editing.
- Live punch status resets to offline after an unclosed shift has been inactive for 24 hours. The API now returned `offline`, zero elapsed seconds, and `Previous shift not closed` for the tested account; historical rows were preserved.
- Flow Hub's seven weekday dates and selected day now follow the current week in Asia/Manila.
- Analytics now fetches punch logs and constructs completed shift sessions from start/end pairs. Task entries are excluded from attendance calculations. It no longer infers lateness from task text or absence from roster size alone.

The configured app gateway is `192.168.78.52:8000`, while the connected Supabase project is a different database. Both missing tables exist in the connected project, which does **not** establish their existence in the private gateway. Notifications still require a schema/connection repair in the gateway. Repository-wide lint errors also remain.

A reviewed repair script for the private self-hosted Supabase instance is at `scripts/repair_private_supabase.sql`. It creates the required schedule and notification tables when absent, restricts direct Data API access, and reloads the PostgREST schema. It does not alter employee attendance history or backfill schedules. This workspace can reach the private Postgres ports but has no database login or authenticated Studio browser session, so this script has not been applied to the private database. Run it in the private Studio SQL Editor, then repeat the signed-in API smoke checks.

## Private database verification

A later read-only check against the app's configured gateway at `192.168.78.52:8000` found `employees` (324 rows), `employee_work_schedules` (0 rows), and `notifications` (0 rows) reachable with the app's configured service role. Required schedule and notification columns were verified. Signed-in GET requests for `/api/auth/me`, `/api/meta`, `/api/team-roster`, and `/api/activity-logs` all returned 200. The earlier missing-table errors are therefore resolved in the current gateway state. This workspace still has no direct Postgres login; it can use the Supabase Data API.
