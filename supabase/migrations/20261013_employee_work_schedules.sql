create table if not exists public.employee_work_schedules (
  id uuid primary key default gen_random_uuid(),
  employee_id bigint not null references public.employees(id) on delete cascade,
  shift_start time without time zone not null,
  shift_end time without time zone not null,
  shift_type text,
  time_zone text not null default 'Asia/Manila',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  is_active boolean not null default true,
  created_by bigint references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_work_schedules_different_times check (shift_start <> shift_end),
  constraint employee_work_schedules_valid_period check (effective_to is null or effective_to >= effective_from)
);

create index if not exists employee_work_schedules_employee_period_idx
  on public.employee_work_schedules (employee_id, effective_from desc);

create unique index if not exists employee_work_schedules_one_active_per_employee_idx
  on public.employee_work_schedules (employee_id)
  where is_active;

alter table public.employee_work_schedules enable row level security;
revoke all on public.employee_work_schedules from anon, authenticated;
grant all on public.employee_work_schedules to service_role;

create or replace function public.assign_employee_work_schedule(
  p_employee_id bigint,
  p_shift_start time without time zone,
  p_shift_end time without time zone,
  p_shift_type text,
  p_time_zone text,
  p_created_by bigint
)
returns public.employee_work_schedules
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned public.employee_work_schedules;
  change_time timestamptz := now();
begin
  if p_shift_start = p_shift_end then
    raise exception 'Shift start and end must be different.' using errcode = '22023';
  end if;

  update public.employee_work_schedules
  set is_active = false,
      effective_to = change_time,
      updated_at = change_time
  where employee_id = p_employee_id and is_active;

  insert into public.employee_work_schedules (
    employee_id, shift_start, shift_end, shift_type, time_zone,
    effective_from, is_active, created_by, created_at, updated_at
  ) values (
    p_employee_id, p_shift_start, p_shift_end, nullif(trim(p_shift_type), ''),
    coalesce(nullif(trim(p_time_zone), ''), 'Asia/Manila'),
    change_time, true, p_created_by, change_time, change_time
  ) returning * into assigned;

  return assigned;
end;
$$;

revoke all on function public.assign_employee_work_schedule(bigint, time without time zone, time without time zone, text, text, bigint) from public, anon, authenticated;
grant execute on function public.assign_employee_work_schedule(bigint, time without time zone, time without time zone, text, text, bigint) to service_role;

with matching_schedules as (
  select
    e.id as employee_id,
    trim(split_part(tt."Shift", ' to ', 1))::time as shift_start,
    trim(split_part(tt."Shift", ' to ', 2))::time as shift_end,
    nullif(trim(tt."Shift Type"), '') as shift_type,
    row_number() over (partition by e.id order by e.employee_name) as row_number
  from public.time_tracker_employees tt
  join public.employees e on e.employee_code = tt."Employee ID"::text
  join public.statuses s on s.status_id = e.status_id and lower(s.status_name) = 'active'
  where nullif(trim(tt."Shift"), '') ~* '^\s*[0-9]{1,2}:[0-9]{2}\s*(AM|PM)\s+to\s+[0-9]{1,2}:[0-9]{2}\s*(AM|PM)\s*$'
)
insert into public.employee_work_schedules (
  employee_id, shift_start, shift_end, shift_type, time_zone,
  effective_from, is_active
)
select employee_id, shift_start, shift_end, shift_type, 'Asia/Manila', now(), true
from matching_schedules
where row_number = 1
on conflict do nothing;
