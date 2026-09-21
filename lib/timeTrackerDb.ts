import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PunchActionType, ShiftPunchesState } from '@/lib/punchLogs';

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
  const empId = String(row['Employee ID'] || row.employee_id || row.id || '').trim();
  const name = String(row['Name'] || row.name || 'Employee').trim();
  const position = String(row['Position'] || row.position || row['Role'] || row.role || 'Agent').trim();
  const userRole = String(row['Role'] || row.role || 'User').trim();
  const shift = String(row['Shift'] || row.shift || '08:00 - 17:00').trim();
  const shift_type = String(row['Shift Type'] || row.shift_type || 'Dayshift').trim();
  const account = String(row['Account'] || row.account || 'DFT').trim();
  const supervisor = String(row['Supervisor'] || row.supervisor || 'N/A').trim();
  const department = String(row['Department'] || row.department || 'Operations').trim();
  const hire_date = String(row['Hire Date'] || row.hire_date || '2023-01-01').trim();
  const tenure = String(row['Tenure'] || row.tenure || '1 year').trim();
  const traffic_light_status = String(row['Traffic Light Status'] || row.traffic_light_status || 'Green').trim();
  const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@cebutele-net.ph`;

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

export const TARGET_13_EMPLOYEE_IDS = [
  '1597', // Nissi-Jeh Reguero (Head of Training)
  '1108', // Raymundo Alasagas III (Head of Quality)
  '1772', // Bianca Kaye Ernestine Colonia (Trainer)
  '2385', // Michelle Yncierto (Trainer)
  '1035', // Rommel Mendoza (Trainer)
  '1820', // Ronelyn Baguio (Trainer)
  '836',  // Krisland Pepito (Trainer)
  '1006', // Niño Elijah R. Reyes (Trainer)
  '1880', // Kier Ariola (Trainer)
  '946',  // Vincent Luis Celdran (Trainer)
  '2298', // Nina Joy Briones (Trainer)
  '1954', // Matt Riner Balaba (Trainer)
  '2610', // Maegan Marie Cabardo (Trainer)
];

export async function getTimeTrackerEmployeesFromDb(): Promise<NormalizedEmployee[]> {
  try {
    const supabase = getSupabaseAdmin();
    // 1. Try time_tracker_employees table
    const { data: tteData, error: tteError } = await supabase
      .from('time_tracker_employees')
      .select('*');

    if (!tteError && tteData && tteData.length > 0) {
      const all = tteData.map(normalizeEmployeeRow);
      // Filter for the 13 target employees (Head of Training, Head of Quality, and 11 Trainers)
      const filtered = all.filter((emp) =>
        TARGET_13_EMPLOYEE_IDS.includes(emp.employee_id) ||
        emp.position.toLowerCase().includes('trainer') ||
        emp.position.toLowerCase().includes('head of')
      );
      // Sort to match the standard sequence (Head of Training, Head of Quality, Trainers)
      filtered.sort((a, b) => {
        const idxA = TARGET_13_EMPLOYEE_IDS.indexOf(a.employee_id);
        const idxB = TARGET_13_EMPLOYEE_IDS.indexOf(b.employee_id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
      return filtered;
    }

    // 2. Fallback to team_roster table
    const { data: rosterData, error: rosterError } = await supabase
      .from('team_roster')
      .select('*');

    if (!rosterError && rosterData && rosterData.length > 0) {
      const all = rosterData.map(normalizeEmployeeRow);
      const filtered = all.filter((emp) =>
        TARGET_13_EMPLOYEE_IDS.includes(emp.employee_id) ||
        emp.position.toLowerCase().includes('trainer') ||
        emp.position.toLowerCase().includes('head of')
      );
      filtered.sort((a, b) => {
        const idxA = TARGET_13_EMPLOYEE_IDS.indexOf(a.employee_id);
        const idxB = TARGET_13_EMPLOYEE_IDS.indexOf(b.employee_id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
      return filtered;
    }

    return [];
  } catch (err) {
    console.error('Error fetching employees from db:', err);
    return [];
  }
}


/**
 * Normalizes any row format from time_tracker_logs into a standard object
 */
export function normalizeTimeTrackerRow(row: RawTimeTrackerRow): NormalizedTimeTrackerLog {
  const id = String(row['LOG ID'] || row.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const employee_id = String(row['EMPLOYEE ID'] || row.employee_id || '1597').trim();
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
      // Filter for the 13 target employees
      normalized = normalized.filter((l) => TARGET_13_EMPLOYEE_IDS.includes(l.employee_id));
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
