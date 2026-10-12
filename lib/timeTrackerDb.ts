import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PunchActionType, ShiftPunchesState } from '@/lib/punchLogs';
import { formatShiftRange, parseShiftStartHour } from '@/lib/shiftSchedule';

export interface RawTimeTrackerRow {
  'LOG ID'?: string;
  'EMPLOYEE ID'?: string | number;
  'TYPE'?: string;
  'TIMESTAMP'?: string;
  'DURATION'?: string;
  'STATUS'?: string | null;
  // Fallbacks if normalized
  id?: string;
  employee_id?: string | number;
  punch_type?: string;
  type?: string;
  timestamp?: string;
  duration?: string;
  status?: string | null;
}

export interface NormalizedTimeTrackerLog {
  id: string;
  employee_id: string;
  punch_type: string;
  timestamp: string;
  parsedDate: Date;
  dateStr: string; // YYYY-MM-DD
  duration: string;
  duration_seconds: number;
  status: string;
}

export interface NormalizedEmployee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  userRole: string;
  position: string;
  shift: string;
  shift_type: string;
  account: string;
  supervisor: string;
  department: string;
  hire_date: string;
  tenure: string;
  traffic_light_status: string;
}

export interface RawEmployeeRow {
  'Employee ID'?: string | number;
  'Password'?: string;
  'Name'?: string;
  'Role'?: string;
  'Shift'?: string;
  'Shift Type'?: string;
  'Position'?: string;
  'Account'?: string;
  'Supervisor'?: string;
  'Department'?: string;
  'Hire Date'?: string;
  'Tenure'?: string;
  'Traffic Light Status'?: string;
  // Fallbacks
  id?: string | number;
  employee_code?: string | number;
  employee_name?: string;
  employee_email?: string;
  position_name?: string;
  role_name?: string;
  account_code?: string;
  account_name?: string;
  employee_id?: string | number;
  name?: string;
  role?: string;
  shift?: string;
  shift_type?: string;
  position?: string;
  account?: string;
  supervisor?: string;
  department?: string;
  hire_date?: string;
  tenure?: string;
  traffic_light_status?: string;
}

export function normalizeEmployeeRow(row: RawEmployeeRow): NormalizedEmployee {
  const empId = String(row.employee_code || row['Employee ID'] || row.employee_id || row.id || '').trim();
  const name = String(row.employee_name || row['Name'] || row.name || '').trim();
  const position = String(row.position_name || row['Position'] || row.position || row['Role'] || row.role || '').trim();
  const userRole = String(row.role_name || row['Role'] || row.role || '').trim();
  const shift = String(row['Shift'] || row.shift || '').trim();
  const shift_type = String(row['Shift Type'] || row.shift_type || '').trim();
  const account = String(row.account_code || row.account_name || row['Account'] || row.account || '').trim();
  const supervisor = String(row['Supervisor'] || row.supervisor || '').trim();
  const department = String(row['Department'] || row.department || '').trim();
  const hire_date = String(row.hire_date || row['Hire Date'] || '').trim();
  const tenure = String(row['Tenure'] || row.tenure || '').trim();
  const traffic_light_status = String(row['Traffic Light Status'] || row.traffic_light_status || '').trim();
  const email = String(row.employee_email || '').trim();

  return {
    id: empId,
    employee_id: empId,
    name,
    email,
    role: position,
    userRole,
    position,
    shift,
    shift_type,
    account,
    supervisor,
    department,
    hire_date,
    tenure,
    traffic_light_status,
  };
}

export async function getTimeTrackerEmployeesFromDb(): Promise<NormalizedEmployee[]> {
  const supabase = getSupabaseAdmin();
  const [
    { data: employees, error: employeesError },
    { data: assignments, error: assignmentsError },
    { data: schedules, error: schedulesError },
  ] = await Promise.all([
    supabase.from('employees')
      .select('id, employee_code, employee_name, employee_email, hire_date, statuses(status_name), roles(role_name), positions(position_name)')
      .order('employee_name'),
    supabase.from('employee_assignments')
      .select('employee_id, effective_from, effective_to, accounts(account_code, account_name, is_active)'),
    supabase.from('employee_work_schedules')
      .select('employee_id, shift_start, shift_end, shift_type, time_zone, effective_from, effective_to')
      .eq('is_active', true)
      .order('effective_from', { ascending: false }),
  ]);

  if (employeesError) throw employeesError;
  if (assignmentsError) throw assignmentsError;
  if (schedulesError) throw schedulesError;
  const now = Date.now();

  return (employees || [])
    .filter((employee) => (employee.statuses as { status_name?: string } | null)?.status_name?.toLowerCase() === 'active')
    .map((employee) => {
      const currentAssignment = (assignments || [])
        .filter((assignment) => {
          if (String(assignment.employee_id) !== String(employee.id)) return false;
          const start = assignment.effective_from ? new Date(assignment.effective_from).getTime() : 0;
          const end = assignment.effective_to ? new Date(assignment.effective_to).getTime() : Infinity;
          const account = assignment.accounts as { is_active?: boolean } | null;
          return start <= now && end >= now && account?.is_active !== false;
        })
        .sort((a, b) => new Date(b.effective_from || 0).getTime() - new Date(a.effective_from || 0).getTime())[0];
      const account = currentAssignment?.accounts as { account_code?: string; account_name?: string } | null;
      const currentSchedule = (schedules || []).find((schedule) => {
        if (String(schedule.employee_id) !== String(employee.id)) return false;
        const startsAt = schedule.effective_from ? new Date(schedule.effective_from).getTime() : 0;
        const endsAt = schedule.effective_to ? new Date(schedule.effective_to).getTime() : Infinity;
        return startsAt <= now && endsAt >= now;
      });
      return normalizeEmployeeRow({
        id: employee.id,
        employee_code: employee.employee_code,
        employee_name: employee.employee_name,
        employee_email: employee.employee_email,
        hire_date: employee.hire_date,
        role_name: (employee.roles as { role_name?: string } | null)?.role_name,
        position_name: (employee.positions as { position_name?: string } | null)?.position_name,
        account_code: account?.account_code,
        account_name: account?.account_name,
        Shift: formatShiftRange(currentSchedule?.shift_start, currentSchedule?.shift_end),
        'Shift Type': currentSchedule?.shift_type || '',
      });
    });
}

/**
 * Normalizes any row format from time_tracker_logs into a standard object
 */
export function normalizeTimeTrackerRow(row: RawTimeTrackerRow): NormalizedTimeTrackerLog {
  const id = String(row['LOG ID'] || row.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const employee_id = String(row['EMPLOYEE ID'] || row.employee_id || '').trim();
  const punch_type = String(row['TYPE'] || row.punch_type || row.type || 'Shift Start').trim();
  const rawTimestamp = String(row['TIMESTAMP'] || row.timestamp || new Date().toISOString()).trim();
  const duration = String(row['DURATION'] || row.duration || 'N/A').trim();
  const status = String(row['STATUS'] || row.status || 'On Time').trim();

  let parsedDate: Date;
  try {
    parsedDate = new Date(rawTimestamp);
    if (isNaN(parsedDate.getTime())) {
      // Try parsing formats like "8/25/2026 22:50:28"
      const parts = rawTimestamp.split(' ');
      if (parts.length >= 2) {
        const [m, d, y] = parts[0].split('/');
        parsedDate = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${parts[1]}`);
      } else {
        parsedDate = new Date();
      }
    }
  } catch (e) {
    parsedDate = new Date();
  }

  // Format dateStr as YYYY-MM-DD
  const y = parsedDate.getFullYear();
  const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const d = String(parsedDate.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  // Parse duration string into seconds (e.g. "00:15:00" -> 900, "58.78" mins -> 3527s)
  let duration_seconds = 0;
  if (duration && duration !== 'N/A') {
    if (duration.includes(':')) {
      const timeParts = duration.split(':').map((p) => parseInt(p, 10));
      if (timeParts.length === 3) {
        duration_seconds = (timeParts[0] || 0) * 3600 + (timeParts[1] || 0) * 60 + (timeParts[2] || 0);
      } else if (timeParts.length === 2) {
        duration_seconds = (timeParts[0] || 0) * 60 + (timeParts[1] || 0);
      }
    } else {
      const mins = parseFloat(duration);
      if (!isNaN(mins)) {
        duration_seconds = Math.round(mins * 60);
      }
    }
  }

  return {
    id,
    employee_id,
    punch_type,
    timestamp: rawTimestamp,
    parsedDate,
    dateStr,
    duration,
    duration_seconds,
    status: status === 'null' || !status ? 'On Time' : status,
  };
}

/**
 * Fetch logs directly from Supabase table time_tracker_logs with chunk pagination
 */
export async function getTimeTrackerLogsFromDb(options?: {
  empId?: string;
  date?: string;
  limit?: number;
}): Promise<NormalizedTimeTrackerLog[]> {
  try {
    const supabase = getSupabaseAdmin();
    const allRows: any[] = [];
    let page = 0;
    const pageSize = 1000;
    const maxLimit = options?.limit || 5000;

    while (allRows.length < maxLimit) {
      let query = supabase.from('time_tracker_logs').select('*');
      
      if (options?.empId && options.empId !== 'ALL') {
        query = query.eq('EMPLOYEE ID', isNaN(Number(options.empId)) ? options.empId : Number(options.empId));
      }

      const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Error querying time_tracker_logs:', error);
        break;
      }

      if (!data || data.length === 0) {
        break;
      }

      allRows.push(...data);

      if (data.length < pageSize) {
        break;
      }

      page++;
    }

    if (allRows.length === 0) {
      return [];
    }

    let normalized = allRows.map(normalizeTimeTrackerRow);

    if (options?.empId && options.empId !== 'ALL') {
      normalized = normalized.filter((l) => l.employee_id === String(options.empId));
    } else {
      const employees = await getTimeTrackerEmployeesFromDb();
      const activeEmployeeIds = new Set(employees.map((employee) => employee.employee_id));
      normalized = normalized.filter((log) => activeEmployeeIds.has(log.employee_id));
    }

    if (options?.date) {
      normalized = normalized.filter((l) => l.dateStr === options.date || l.timestamp.includes(options.date!));
    }

    // Sort newest first
    normalized.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

    return normalized;
  } catch (err) {
    console.error('Exception in getTimeTrackerLogsFromDb:', err);
    return [];
  }
}

/**
 * Insert a punch action directly into Supabase table time_tracker_logs
 */
export async function insertTimeTrackerPunch(payload: {
  empId: string | number;
  punchType: string;
  status?: string;
  duration?: string;
  timestamp?: string;
}) {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const timestampStr = payload.timestamp || `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const row = {
    'LOG ID': `punch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    'EMPLOYEE ID': isNaN(Number(payload.empId)) ? payload.empId : Number(payload.empId),
    'TYPE': payload.punchType,
    'TIMESTAMP': timestampStr,
    'DURATION': payload.duration || 'N/A',
    'STATUS': payload.status || 'On Time',
  };

  const { data, error } = await supabase
    .from('time_tracker_logs')
    .insert([row])
    .select();

  if (error) {
    console.error('Error inserting into time_tracker_logs:', error);
    throw error;
  }

  return data?.[0] ? normalizeTimeTrackerRow(data[0]) : normalizeTimeTrackerRow(row);
}

/**
 * Delete punch logs for a specific employee on a specific shift date
 */
export async function deleteTimeTrackerPunchesForDay(
  empId: string | number,
  monthIndex: number,
  dayNumber: number,
  year: number
) {
  try {
    const supabase = getSupabaseAdmin();
    const numEmpId = isNaN(Number(empId)) ? empId : Number(empId);

    // Fetch logs for this employee to match shift day
    const { data: logs, error: fetchErr } = await supabase
      .from('time_tracker_logs')
      .select('*')
      .eq('EMPLOYEE ID', numEmpId);
    const { data: employee } = await supabase.from('employees').select('id').eq('employee_code', String(empId)).maybeSingle();
    const { data: schedules } = employee
      ? await supabase.from('employee_work_schedules')
        .select('shift_start, shift_end')
        .eq('employee_id', employee.id)
        .eq('is_active', true)
      : { data: [] };
    const currentSchedule = schedules?.[0];
    const shiftStartHour = parseShiftStartHour(formatShiftRange(currentSchedule?.shift_start, currentSchedule?.shift_end));

    if (!fetchErr && logs && logs.length > 0) {
      const idsToDelete = logs.filter((row: any) => {
        const rawTs = row.TIMESTAMP || row.timestamp;
        if (!rawTs) return false;
        const d = new Date(rawTs);
        if (isNaN(d.getTime())) return false;
        if (d.getFullYear() !== year) return false;
        
        const h = d.getHours();
        let sDay = d.getDate();
        let sMonth = d.getMonth();
        if (shiftStartHour !== null && h < shiftStartHour) {
          const prev = new Date(d);
          prev.setDate(prev.getDate() - 1);
          sDay = prev.getDate();
          sMonth = prev.getMonth();
        }
        return sMonth === monthIndex && sDay === dayNumber;
      }).map((r: any) => r['LOG ID'] || r.id).filter(Boolean);

      if (idsToDelete.length > 0) {
        await supabase
          .from('time_tracker_logs')
          .delete()
          .in('LOG ID', idsToDelete);
        await supabase
          .from('time_tracker_logs')
          .delete()
          .in('id', idsToDelete);
      }
    }
    return { success: true };
  } catch (err) {
    console.warn('Exception in deleteTimeTrackerPunchesForDay:', err);
    return { success: false };
  }
}

/**
 * Computes live current punch status, elapsed seconds, last punch, and the 8 button states
 */
export function computeLiveStatusFromLogs(
  empId: string | number,
  logs: NormalizedTimeTrackerLog[]
): {
  status: 'working' | 'lunch' | 'break_1' | 'break_2' | 'offline';
  elapsedSeconds: number;
  lastPunchTime: string;
  lastPunchType: string;
  punchesState: ShiftPunchesState;
} {
  const empLogs = logs
    .filter((l) => l.employee_id === String(empId))
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  if (empLogs.length === 0) {
    return {
      status: 'offline',
      elapsedSeconds: 0,
      lastPunchTime: '--:--',
      lastPunchType: 'None',
      punchesState: {
        hasShiftStart: false,
        hasBreak1Start: false,
        hasBreak1End: false,
        hasLunchStart: false,
        hasLunchEnd: false,
        hasBreak2Start: false,
        hasBreak2End: false,
        hasShiftEnd: false,
      },
    };
  }

  const latest = empLogs[0];
  const typeLower = latest.punch_type.toLowerCase();

  let status: 'working' | 'lunch' | 'break_1' | 'break_2' | 'offline' = 'working';

  if (typeLower.includes('shift end') || typeLower.includes('end shift')) {
    status = 'offline';
  } else if (typeLower.includes('start lunch') || typeLower === 'lunch') {
    status = 'lunch';
  } else if (typeLower.includes('break 1 start') || typeLower.includes('start break 1') || typeLower === 'start break') {
    status = 'break_1';
  } else if (typeLower.includes('break 2 start') || typeLower.includes('start break 2')) {
    status = 'break_2';
  } else {
    status = 'working';
  }

  // Calculate elapsed seconds since latest punch
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - latest.parsedDate.getTime()) / 1000));

  // Determine punches state for the active day/shift
  const activeDateStr = latest.dateStr;
  const shiftLogs = empLogs.filter((l) => l.dateStr === activeDateStr);

  const hasShiftStart = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('shift start'));
  const hasBreak1Start = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('break 1 start') || l.punch_type.toLowerCase() === 'start break');
  const hasBreak1End = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('break 1 end') || l.punch_type.toLowerCase() === 'end break');
  const hasLunchStart = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('start lunch') || l.punch_type.toLowerCase() === 'lunch');
  const hasLunchEnd = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('end lunch'));
  const hasBreak2Start = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('break 2 start'));
  const hasBreak2End = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('break 2 end'));
  const hasShiftEnd = shiftLogs.some((l) => l.punch_type.toLowerCase().includes('shift end') || l.punch_type.toLowerCase().includes('end shift'));

  const lastPunchTimeFormatted = latest.parsedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    status,
    elapsedSeconds,
    lastPunchTime: lastPunchTimeFormatted,
    lastPunchType: latest.punch_type,
    punchesState: {
      hasShiftStart,
      hasBreak1Start,
      hasBreak1End,
      hasLunchStart,
      hasLunchEnd,
      hasBreak2Start,
      hasBreak2End,
      hasShiftEnd,
    },
  };
}
