alter table public.attendance_logs
  add column if not exists workforce_employee_id bigint,
  add column if not exists note text,
  add column if not exists updated_by_employee_id bigint,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attendance_logs_workforce_employee_id_fkey'
      and conrelid = 'public.attendance_logs'::regclass
  ) then
    alter table public.attendance_logs
      add constraint attendance_logs_workforce_employee_id_fkey
      foreign key (workforce_employee_id) references public.employees(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'attendance_logs_updated_by_employee_id_fkey'
      and conrelid = 'public.attendance_logs'::regclass
  ) then
    alter table public.attendance_logs
      add constraint attendance_logs_updated_by_employee_id_fkey
      foreign key (updated_by_employee_id) references public.employees(id) on delete set null;
  end if;
end $$;

create unique index if not exists attendance_logs_workforce_employee_date_key
  on public.attendance_logs (workforce_employee_id, attendance_date);
