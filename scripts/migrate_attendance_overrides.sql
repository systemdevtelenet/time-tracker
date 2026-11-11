-- Copy verified attendance overrides into the portal schema.
-- Source rows in public.attendance_logs are retained.
begin;

alter table workforce_portal_system.attendance_overrides
  add column if not exists source_attendance_id uuid;

-- Recover safely if a previous failed run left behind an empty bigint column.
do $$
declare
  source_id_type text;
begin
  select data_type into source_id_type
  from information_schema.columns
  where table_schema = 'workforce_portal_system'
    and table_name = 'attendance_overrides'
    and column_name = 'source_attendance_id';

  if source_id_type = 'bigint' then
    if exists (
      select 1
      from workforce_portal_system.attendance_overrides
      where source_attendance_id is not null
    ) then
      raise exception 'Cannot convert source_attendance_id: existing bigint values need review';
    end if;

    alter table workforce_portal_system.attendance_overrides
      alter column source_attendance_id type uuid using null::uuid;
  elsif source_id_type <> 'uuid' then
    raise exception 'Unexpected type for source_attendance_id: %', source_id_type;
  end if;
end $$;

create unique index if not exists attendance_overrides_source_id_uidx
  on workforce_portal_system.attendance_overrides (source_attendance_id)
  where source_attendance_id is not null;

do $$
declare
  source_count bigint;
  copied_count bigint;
begin
  select count(*)
  into source_count
  from public.attendance_logs;

  if exists (
    select 1
    from public.attendance_logs a
    where a.workforce_employee_id is null
       or a.attendance_date is null
       or a.status is null
       or length(btrim(a.status)) = 0
       or not exists (
         select 1
         from public.employees e
         where e.id = a.workforce_employee_id
       )
  ) then
    raise exception 'Attendance migration stopped: a row has an invalid employee, date, or status';
  end if;

  if exists (
    select 1
    from public.attendance_logs
    group by workforce_employee_id, attendance_date
    having count(*) > 1
  ) then
    raise exception 'Attendance migration stopped: duplicate employee/date rows exist';
  end if;

  if exists (
    select 1
    from public.attendance_logs a
    where a.updated_by_employee_id is not null
      and not exists (
        select 1
        from public.employees e
        where e.id = a.updated_by_employee_id
      )
  ) then
    raise exception 'Attendance migration stopped: an updater employee reference is invalid';
  end if;

  insert into workforce_portal_system.attendance_overrides (
    source_attendance_id,
    employee_id,
    attendance_date,
    status,
    note,
    updated_by_employee_id,
    created_at,
    updated_at
  )
  select
    a.id,
    a.workforce_employee_id,
    a.attendance_date,
    a.status,
    a.note,
    a.updated_by_employee_id,
    a.created_at,
    a.updated_at
  from public.attendance_logs a
  on conflict (source_attendance_id)
    where source_attendance_id is not null
    do update set
      employee_id = excluded.employee_id,
      attendance_date = excluded.attendance_date,
      status = excluded.status,
      note = excluded.note,
      updated_by_employee_id = excluded.updated_by_employee_id,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at;

  get diagnostics copied_count = row_count;
  raise notice 'Attendance migration complete: % source rows, % copied or refreshed rows.',
    source_count, copied_count;
end $$;

commit;

select
  (select count(*) from public.attendance_logs) as source_rows,
  (select count(*) from workforce_portal_system.attendance_overrides
   where source_attendance_id is not null) as migrated_source_rows;
