# Workforce Portal tables rollout

The SQL in [`scripts/create_workforce_portal_tables.sql`](../scripts/create_workforce_portal_tables.sql) creates 12 empty tables in the self-hosted CTNP Systems `workforce_portal_system` schema:

| Area | New tables |
| --- | --- |
| Schedule and attendance | `work_schedules`, `work_shifts`, `shift_punches`, `attendance_overrides` |
| Task time | `task_time_entries` |
| Notifications | `notifications` |
| Flow Hub | `focus_state`, `focus_sessions`, `tasks`, `notes`, `routines`, `routine_completions` |

Every employee reference points to `public.employees(id)`; task account references point to `public.accounts(account_id)`. Shared identity and account tables stay in `public`. The script is transactional, creates no employee or attendance rows, enables RLS on the 12 new tables, and grants direct Data API table access only to `service_role`. It does not move, rename, or delete the live public tables.

Run the file in the **CTNP Systems self-hosted SQL Editor**, then run [`scripts/verify_workforce_portal_tables.sql`](../scripts/verify_workforce_portal_tables.sql). The verification should list 12 tables, all with RLS enabled, service-role read access, and no anon/authenticated read access.

The current app continues using its existing `public` tables. Populating and switching to the new schema is separate work: migrate and reconcile historical data, add the new schema to the self-hosted Data API's exposed schemas, update server queries to target the schema, and run functional tests. Do not copy historical punches or attendance overrides until their ownership and shift boundaries have been reconciled.
