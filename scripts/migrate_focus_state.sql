-- Copy Flow Hub timer state from public into the portal schema.
-- Source rows are retained. Safe to rerun; source state refreshes a matching
-- destination row until the app is switched to the new schema.
begin;

insert into workforce_portal_system.focus_state (
  employee_id,
  timer_mode,
  duration_minutes,
  remaining_seconds,
  is_active,
  started_at,
  session_started_at,
  session_token,
  updated_at
)
select
  employee_id,
  timer_mode,
  duration_minutes,
  remaining_seconds,
  is_active,
  started_at,
  session_started_at,
  session_token,
  updated_at
from public.time_tracker_focus_state
on conflict (employee_id) do update set
  timer_mode = excluded.timer_mode,
  duration_minutes = excluded.duration_minutes,
  remaining_seconds = excluded.remaining_seconds,
  is_active = excluded.is_active,
  started_at = excluded.started_at,
  session_started_at = excluded.session_started_at,
  session_token = excluded.session_token,
  updated_at = excluded.updated_at;

commit;

select
  (select count(*) from public.time_tracker_focus_state) as source_rows,
  (select count(*) from workforce_portal_system.focus_state) as destination_rows;
