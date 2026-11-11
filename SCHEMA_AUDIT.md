# Time Tracker schema scan

Read-only scan of the app's configured self-hosted Supabase Data API (`public`) on November 11, 2026 (Asia/Manila). Counts are a snapshot. The source of truth for required tables and columns is the route and helper code under `app/api` and `lib`.

## Tables used by the app

| Area | Tables | Rows | Purpose |
| --- | --- | ---: | --- |
| Employee identity and access | `employees`, `statuses`, `roles`, `positions` | 324, 6, 6, 61 | Login, active status, roles, profile and permissions |
| Accounts and assignments | `accounts`, `employee_assignments` | 24, 321 | Client account choices and current employee assignment |
| Work schedules | `employee_work_schedules` | 0 | Shift start/end and schedule assignment |
| Punch tracking | `time_tracker_logs` | 1,335 | Shift start/end, breaks, live status and history |
| Task/call time | `phone_time_tracker` | 4 | Timed and manual task entries |
| Attendance corrections | `attendance_logs` | 13,225 | Attendance status and manager overrides |
| Notifications | `notifications` | 0 | Activity log, read status and alerts |
| Flow Hub | `time_tracker_focus_state`, `time_tracker_focus_sessions`, `time_tracker_tasks`, `time_tracker_notes`, `time_tracker_routines`, `time_tracker_routine_completions` | 2, 0, 0, 0, 0, 0 | Focus timer, tasks, notes and routines |

All 17 tables above are reachable through the configured service-role Data API. The app also calls `assign_employee_work_schedule`, which is exposed. The self-hosted API exposes other public tables for unrelated apps; they are not dependencies of this Time Tracker. The schema selector in Studio shows additional schemas, but this app's database calls use `public` only.

## What needs attention

1. **Populate schedules.** `employee_work_schedules` exists but has no rows, so the app cannot show staff shift times or compare attendance to a schedule. Only one `employees` row currently has a non-null legacy `shift` field, so an automatic backfill would cover almost nobody. Assign schedules through the app's authorized schedule flow or a reviewed import from an authoritative roster. Do not infer shifts from punches.
2. **Give task entries a stable owner and key.** `phone_time_tracker` has no `employee_id` or `id` column. The route scopes users by exact name and deletes by ticket number, which can collide. Add an immutable primary key and `employee_id` foreign key, backfill carefully, then update the route to authorize by employee ID and delete by primary key. Keep `name` as a historical display snapshot if desired.
3. **Retire or migrate the legacy shift-notes API.** `app/api/shift-notes/route.ts` uses a process-local map and arbitrary employee IDs. The durable `time_tracker_notes` table already exists and is used by Flow Hub. Move any needed shift-note behavior there with employee access checks, or remove the unused endpoint.
4. **Keep punch history distinct from task time.** `time_tracker_logs` and `phone_time_tracker` represent different concepts. Attendance metrics should use punch sessions plus schedules/overrides; task duration should remain a separate measure. The current analytics code now derives completed shifts from punch pairs, but schedule-based absence and expected hours remain unavailable until schedules are populated.
5. **Review the legacy punch schema before deeper changes.** `time_tracker_logs` uses quoted column names such as `EMPLOYEE ID` and `TIMESTAMP`. The app has compatibility code for that shape. A future normalized table with a primary key, employee foreign key and timezone-aware timestamp would simplify queries, but migrating 1,335 historical rows needs a separate, reversible data plan.

`notifications` and the Flow Hub tables are empty or nearly empty because those features have little recorded use yet; zero rows alone does not indicate a missing table. A read-only anonymous-key probe returned 401 for representative sensitive tables, while the server service role could read them. This scan did not audit all Postgres grants, RLS policies, indexes, functions, or private schemas because direct SQL access to the self-hosted database is not configured in this workspace.
