create index if not exists attendance_logs_updated_by_employee_id_idx
  on public.attendance_logs (updated_by_employee_id);
