import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';

export const dynamic = 'force-dynamic';

const STATUS_CODES: Record<string, string> = {
  p: 'P', present: 'P',
  l: 'L', late: 'L',
  u: 'U', undertime: 'U',
  a: 'A', absent: 'A',
  rd: 'RD', 'rest day': 'RD',
  vl: 'VL', vacation: 'VL', 'vacation leave': 'VL',
  sl: 'SL', sick: 'SL', 'sick leave': 'SL',
  bl: 'BL', bereavement: 'BL', 'bereavement leave': 'BL',
  ml: 'ML', maternity: 'ML', 'maternity leave': 'ML',
  pl: 'PL', paternity: 'PL', 'paternity leave': 'PL',
  hol: 'HOL', holiday: 'HOL',
  sus: 'SUS', suspension: 'SUS',
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return jsonError('Please sign in to continue.', 401);

    const supabase = getSupabaseAdmin();
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, employee_code, employee_name');

    if (employeesError) throw employeesError;

    const attendanceRows: Array<{
      workforce_employee_id: number | null;
      attendance_date: string;
      status: string;
      note: string | null;
    }> = [];
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      let query = supabase
        .from('attendance_logs')
        .select('workforce_employee_id, attendance_date, status, note')
        .order('attendance_date', { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (!access.canManageAttendance) query = query.eq('workforce_employee_id', access.id);
      const { data, error } = await query;
      if (error) throw error;
      attendanceRows.push(...(data || []));
      if (!data || data.length < pageSize) break;
    }

    const employeeById = new Map((employees || []).map((employee) => [String(employee.id), employee]));
    const overrides: Record<string, string> = {};
    const notes: Record<string, string> = {};

    for (const record of attendanceRows) {
      if (record.workforce_employee_id == null || !record.attendance_date) continue;
      const employee = employeeById.get(String(record.workforce_employee_id));
      if (!employee) continue;

      const [yearText, monthText, dayText] = String(record.attendance_date).split('-');
      const year = Number(yearText);
      const monthIndex = Number(monthText) - 1;
      const day = Number(dayText);
      const employeeCode = String(employee.employee_code || employee.id);
      const employeeName = String(employee.employee_name || '');
      const canonicalStatus = STATUS_CODES[String(record.status || '').trim().toLowerCase()] || String(record.status || '');
      const keys = [
        `${employeeCode}-${year}-${monthIndex}-${day}`,
        `${employeeName}-${year}-${monthIndex}-${day}`,
        `${employeeName.toLowerCase()}-${year}-${monthIndex}-${day}`,
      ];

      for (const key of keys) {
        overrides[key] = canonicalStatus;
        if (record.note) notes[key] = record.note;
      }
    }

    return NextResponse.json({ success: true, overrides, notes });
  } catch (error) {
    console.error('Failed to load attendance records:', error);
    return jsonError('Unable to load attendance records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return jsonError('Please sign in to continue.', 401);
    if (!access.canManageAttendance) return jsonError('Only attendance managers can update attendance.', 403);

    const body = await request.json();
    const employeeId = Number(body.employeeDbId);
    const year = Number(body.year);
    const month = Number(body.month);
    const day = Number(body.day);
    if (!Number.isSafeInteger(employeeId) || employeeId <= 0 ||
        !Number.isInteger(year) || year < 2000 || year > 2200 ||
        !Number.isInteger(month) || month < 0 || month > 11 ||
        !Number.isInteger(day) || day < 1 || day > 31) {
      return jsonError('A valid employee and attendance date are required.', 400);
    }

    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
      return jsonError('The attendance date is invalid.', 400);
    }
    const attendanceDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const supabase = getSupabaseAdmin();
    const { data: targetEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .maybeSingle();
    if (employeeError) throw employeeError;
    if (!targetEmployee) return jsonError('The selected employee was not found.', 404);

    const rawStatus = body.status == null ? '' : String(body.status).trim();
    const normalizedStatus = STATUS_CODES[rawStatus.toLowerCase()];
    const note = body.note == null ? null : String(body.note).trim() || null;

    if (!rawStatus || rawStatus.toLowerCase() === 'clear' || rawStatus.toLowerCase() === 'none') {
      const { error } = await supabase
        .from('attendance_logs')
        .delete()
        .eq('workforce_employee_id', employeeId)
        .eq('attendance_date', attendanceDate);
      if (error) throw error;
      return NextResponse.json({ success: true, deleted: true });
    }
    if (!normalizedStatus) return jsonError('Choose a valid attendance status.', 400);

    const { data, error } = await supabase
      .from('attendance_logs')
      .upsert({
        workforce_employee_id: employeeId,
        attendance_date: attendanceDate,
        status: normalizedStatus,
        note,
        updated_by_employee_id: access.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'workforce_employee_id,attendance_date' })
      .select('workforce_employee_id, attendance_date, status, note')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to save attendance record:', error);
    return jsonError('Unable to save attendance. Please try again.', 500);
  }
}
