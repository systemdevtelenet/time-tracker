-- Read-only audit before migrating public.time_tracker_logs.
-- Does not change source or destination data.
with resolved_logs as (
  select
    t."LOG ID"::text as log_id,
    t."EMPLOYEE ID"::text as legacy_employee_id,
    case when matched.match_count = 1 then matched.employee_id end as employee_id,
    t."TYPE"::text as punch_type,
    t."TIMESTAMP"::timestamptz as occurred_at
  from public.time_tracker_logs t
  left join lateral (
    select min(e.id) as employee_id, count(*) as match_count
    from public.employees e
    where btrim(e.employee_code::text) = btrim(t."EMPLOYEE ID"::text)
       or btrim(e.id::text) = btrim(t."EMPLOYEE ID"::text)
  ) matched on true
  where coalesce(t."TYPE", '') <> 'Attendance Override'
), matched_logs as (
  select *
  from resolved_logs
  where employee_id is not null
), numbered as (
  select
    *,
    sum(case when lower(btrim(punch_type)) = 'shift start' then 1 else 0 end)
      over (partition by employee_id order by occurred_at, log_id) as session_no
  from matched_logs
), session_summary as (
  select
    employee_id,
    session_no,
    min(occurred_at) filter (where lower(btrim(punch_type)) = 'shift start') as started_at,
    min(occurred_at) filter (where lower(btrim(punch_type)) in ('shift end', 'end shift')) as ended_at,
    count(*) filter (where lower(btrim(punch_type)) in ('shift end', 'end shift')) as end_count,
    count(*) as event_count,
    string_agg(distinct punch_type, ', ' order by punch_type) as event_types
  from numbered
  where session_no > 0
  group by employee_id, session_no
), sessions_with_next as (
  select
    *,
    lead(started_at) over (partition by employee_id order by session_no) as next_started_at
  from session_summary
)
select
  employee_id,
  session_no,
  started_at,
  ended_at,
  round(extract(epoch from (ended_at - started_at)) / 3600.0, 2) as duration_hours,
  end_count,
  event_count,
  event_types,
  concat_ws('; ',
    case when ended_at is null and next_started_at is not null then 'new shift began before this shift ended' end,
    case when ended_at is null and next_started_at is null then 'no shift-end punch' end,
    case when end_count > 1 then 'multiple shift-end punches' end,
    case when ended_at < started_at then 'shift-end precedes shift-start' end,
    case when ended_at is not null and ended_at - started_at > interval '24 hours' then 'duration exceeds 24 hours' end
  ) as review_reason
from sessions_with_next
where (ended_at is null)
   or end_count > 1
   or ended_at < started_at
   or ended_at - started_at > interval '24 hours'
order by employee_id, started_at;

-- Unmatched events and excluded Attendance Override event count.
with resolved_logs as (
  select
    t."EMPLOYEE ID"::text as legacy_employee_id,
    case when matched.match_count = 1 then matched.employee_id end as employee_id,
    t."TYPE"::text as punch_type
  from public.time_tracker_logs t
  left join lateral (
    select min(e.id) as employee_id, count(*) as match_count
    from public.employees e
    where btrim(e.employee_code::text) = btrim(t."EMPLOYEE ID"::text)
       or btrim(e.id::text) = btrim(t."EMPLOYEE ID"::text)
  ) matched on true
)
select
  case
    when punch_type = 'Attendance Override' then 'excluded attendance event'
    when employee_id is null then 'unmatched employee'
    else 'matched employee'
  end as category,
  coalesce(punch_type, '<null>') as punch_type,
  count(*) as event_rows
from resolved_logs
group by 1, 2
order by 1, 2;
