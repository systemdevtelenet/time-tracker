import { INITIAL_PUNCH_LOGS, PunchLogItem } from './punchLogs';

export interface CalendarPunchItem {
  id: string;
  time: string; // e.g. "9:24 PM"
  type: string; // e.g. "Shift Start", "Break 1 Start", "Break 1 End", "Start Lunch", "End Lunch", "Break 2 Start", "Break 2 End", "Shift End"
  rawType: string;
  timestamp: string;
  status: string;
  duration?: string;
}

export type AttendanceDayStatus = 'Present' | 'Late / UT' | 'Undertime' | 'Late' | 'Absent' | 'Rest Day' | null;

export interface CalendarDayData {
  dayNumber: number;
  monthIndex: number; // 0-11
  year: number;
  dateKey: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  status: AttendanceDayStatus;
  statusColor: 'green' | 'orange' | 'red' | 'gray';
  punches: CalendarPunchItem[];
  totalShiftHours?: string;
  totalBreakMinutes?: number;
  totalLunchMinutes?: number;
}

export interface EmployeeProfile {
  id: string;
  empId: string;
  name: string;
  position: string;
  department: string;
  shiftSchedule: string;
}

export const ROSTER_PROFILES: EmployeeProfile[] = [
  { id: '1', empId: '1597', name: 'Nissi-Jeh Reguero', position: 'Head of Training', department: 'Corporate Training', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '2', empId: '1108', name: 'Raymundo Alasagas III', position: 'Head of Quality', department: 'QA & Compliance', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '3', empId: '1021', name: 'Jerico Leyson', position: 'Process Improvement Specialist', department: 'Operations Coaching', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '4', empId: '1772', name: 'Bianca Kaye Ernestine Colonia', position: 'Trainer', department: 'Corporate Training', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '5', empId: '2385', name: 'Michelle Yncierto', position: 'Trainer', department: 'Corporate Training', shiftSchedule: '5:00 PM – 2:00 AM' },
  { id: '6', empId: '1035', name: 'Rommel Mendoza', position: 'Trainer', department: 'Voice Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '7', empId: '1820', name: 'Ronelyn Baguio', position: 'Trainer', department: 'Voice Operations', shiftSchedule: '11:00 AM – 8:00 PM' },
  { id: '8', empId: '836', name: 'Krisland Pepito', position: 'Trainer', department: 'QA & Training', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '9', empId: '1006', name: 'Niño Elijah R. Reyes', position: 'Trainer', department: 'Technical Support', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '10', empId: '1880', name: 'Kier Ariola', position: 'Trainer', department: 'Voice Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '11', empId: '946', name: 'Vincent Luis Celdran', position: 'Trainer', department: 'Operations Coaching', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '12', empId: '2298', name: 'Nina Joy Briones', position: 'Trainer', department: 'Customer Success', shiftSchedule: '8:00 PM – 5:00 AM' },
  { id: '13', empId: '1954', name: 'Matt Riner Balaba', position: 'Trainer', department: 'Corporate Training', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '14', empId: '2610', name: 'Maegan Marie Cabardo', position: 'Trainer', department: 'Technical Support', shiftSchedule: '8:00 PM – 5:00 AM' },
  { id: '15', empId: '1898', name: 'Hezel Mae Domo', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '16', empId: '1671', name: 'Janine Codilla', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '17', empId: '518', name: 'Darin Vic Ecle', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '18', empId: '770', name: 'Jeffrey Verallo', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '19', empId: '745', name: 'Steffany Cagape', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '20', empId: '892', name: 'Hanazaira Peleno', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
  { id: '21', empId: '1708', name: 'Jhonmel Commedador', position: 'Quality Assurance Analyst', department: 'QA Operations', shiftSchedule: '9:00 PM – 6:00 AM' },
];

// Helper to format punch type label matching image 1
export function normalizePunchTypeLabel(rawType: string): string {
  const t = rawType.trim().toLowerCase();
  if (t === 'shift start' || t.includes('shift start')) return 'Shift Start';
  if (t === 'shift end' || t.includes('shift end')) return 'Shift End';
  if (t === 'start lunch' || t === 'lunch start' || t.includes('start lunch')) return 'Start Lunch';
  if (t === 'end lunch' || t === 'lunch end' || t.includes('end lunch')) return 'End Lunch';
  if (t === 'break 1 start' || t === 'start break' || t === 'break start') return 'Break 1 Start';
  if (t === 'break 1 end' || t === 'end break' || t === 'break end') return 'Break 1 End';
  if (t === 'break 2 start') return 'Break 2 Start';
  if (t === 'break 2 end') return 'Break 2 End';
  return rawType;
}

// Format 12-hour time e.g. "9:24 PM"
export function formatTimeShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Parse manual format like "9/1/2026 21:24:00"
      const parts = dateStr.split(' ');
      if (parts.length >= 2) {
        const timePart = parts[1];
        const [h, m] = timePart.split(':');
        const hourNum = parseInt(h, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const displayH = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
        return `${displayH}:${m} ${ampm}`;
      }
      return dateStr;
    }
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return dateStr;
  }
}

// Specific punch records for Nissi-Jeh Reguero (EmpId 1597) exactly matching Image 1
const NISSI_CALENDAR_DATA_SEP_2026: Record<string, { status: AttendanceDayStatus; statusColor: 'green' | 'orange' | 'red' | 'gray'; punches: { time: string; type: string }[] }> = {
  '2026-08-31': {
    status: 'Absent',
    statusColor: 'red',
    punches: [],
  },
  '2026-09-01': {
    status: 'Late / UT',
    statusColor: 'orange',
    punches: [
      { time: '9:24 PM', type: 'Shift Start' },
      { time: '11:31 PM', type: 'Start Break' },
      { time: '11:46 PM', type: 'End Break' },
      { time: '1:34 AM', type: 'Start Lunch' },
      { time: '2:06 AM', type: 'End Lunch' },
    ],
  },
  '2026-09-02': {
    status: 'Present',
    statusColor: 'green',
    punches: [
      { time: '8:43 PM', type: 'Shift End' },
      { time: '8:43 PM', type: 'Shift Start' },
      { time: '11:39 PM', type: 'Break 1 Start' },
      { time: '11:45 PM', type: 'Break 1 End' },
      { time: '1:05 AM', type: 'Start Lunch' },
      { time: '1:23 AM', type: 'End Lunch' },
      { time: '4:42 AM', type: 'Break 2 Start' },
      { time: '4:45 AM', type: 'Break 2 End' },
      { time: '6:05 AM', type: 'Shift End' },
    ],
  },
  '2026-09-03': {
    status: 'Present',
    statusColor: 'green',
    punches: [
      { time: '8:13 PM', type: 'Shift Start' },
      { time: '10:53 PM', type: 'Break 1 Start' },
      { time: '11:12 PM', type: 'Break 1 End' },
      { time: '4:57 AM', type: 'Break 2 Start' },
      { time: '5:05 AM', type: 'Break 2 End' },
      { time: '6:04 AM', type: 'Shift End' },
    ],
  },
  '2026-09-04': {
    status: 'Undertime',
    statusColor: 'orange',
    punches: [
      { time: '8:36 PM', type: 'Shift Start' },
      { time: '11:22 PM', type: 'Break 1 Start' },
      { time: '11:35 PM', type: 'Break 1 End' },
      { time: '1:09 AM', type: 'Start Lunch' },
      { time: '2:07 AM', type: 'End Lunch' },
    ],
  },
  '2026-09-05': {
    status: 'Rest Day',
    statusColor: 'gray',
    punches: [],
  },
  '2026-09-06': {
    status: 'Rest Day',
    statusColor: 'gray',
    punches: [],
  },
  '2026-09-07': {
    status: 'Present',
    statusColor: 'green',
    punches: [
      { time: '6:16 PM', type: 'Shift End' },
      { time: '7:39 PM', type: 'Shift Start' },
      { time: '11:04 PM', type: 'Break 1 Start' },
      { time: '11:16 PM', type: 'Break 1 End' },
      { time: '1:31 AM', type: 'Start Lunch' },
      { time: '2:23 AM', type: 'End Lunch' },
      { time: '6:05 AM', type: 'Shift End' },
    ],
  },
  '2026-09-08': {
    status: 'Undertime',
    statusColor: 'orange',
    punches: [
      { time: '8:28 PM', type: 'Shift Start' },
      { time: '11:15 PM', type: 'Break 1 Start' },
      { time: '11:27 PM', type: 'Break 1 End' },
      { time: '2:10 AM', type: 'Start Lunch' },
      { time: '3:06 AM', type: 'End Lunch' },
      { time: '4:20 AM', type: 'Break 2 Start' },
      { time: '4:32 AM', type: 'Break 2 End' },
    ],
  },
  '2026-09-09': {
    status: 'Undertime',
    statusColor: 'orange',
    punches: [
      { time: '8:48 PM', type: 'Shift End' },
      { time: '8:49 PM', type: 'Shift Start' },
      { time: '11:43 PM', type: 'Break 1 Start' },
      { time: '11:55 PM', type: 'Break 1 End' },
      { time: '1:18 AM', type: 'Start Lunch' },
      { time: '2:15 AM', type: 'End Lunch' },
      { time: '4:08 AM', type: 'Break 2 Start' },
      { time: '4:20 AM', type: 'Break 2 End' },
    ],
  },
  '2026-09-10': {
    status: 'Undertime',
    statusColor: 'orange',
    punches: [
      { time: '3:05 PM', type: 'Shift End' },
      { time: '3:05 PM', type: 'Shift Start' },
      { time: '6:57 PM', type: 'Break 1 Start' },
      { time: '7:08 PM', type: 'Break 1 End' },
      { time: '12:05 AM', type: 'Shift End' },
    ],
  },
  '2026-09-11': {
    status: 'Present',
    statusColor: 'green',
    punches: [
      { time: '8:44 PM', type: 'Shift Start' },
      { time: '11:19 PM', type: 'Break 1 Start' },
      { time: '11:32 PM', type: 'Break 1 End' },
      { time: '1:10 AM', type: 'Start Lunch' },
      { time: '1:51 AM', type: 'End Lunch' },
      { time: '4:12 AM', type: 'Break 2 Start' },
      { time: '4:25 AM', type: 'Break 2 End' },
      { time: '6:06 AM', type: 'Shift End' },
    ],
  },
  '2026-09-12': {
    status: 'Rest Day',
    statusColor: 'gray',
    punches: [],
  },
  '2026-09-13': {
    status: 'Rest Day',
    statusColor: 'gray',
    punches: [],
  },
  '2026-09-14': {
    status: 'Late',
    statusColor: 'orange',
    punches: [
      { time: '9:14 PM', type: 'Shift Start' },
      { time: '11:17 PM', type: 'Break 1 Start' },
      { time: '11:25 PM', type: 'Break 1 End' },
      { time: '1:57 AM', type: 'Start Lunch' },
      { time: '2:51 AM', type: 'End Lunch' },
    ],
  },
  '2026-09-15': {
    status: 'Present',
    statusColor: 'green',
    punches: [
      { time: '6:50 PM', type: 'Shift Start' },
      { time: '2:26 AM', type: 'Start Lunch' },
      { time: '3:24 AM', type: 'End Lunch' },
      { time: '6:04 AM', type: 'Shift End' },
    ],
  },
  '2026-09-16': {
    status: 'Late',
    statusColor: 'orange',
    punches: [
      { time: '9:07 PM', type: 'Shift Start' },
      { time: '11:34 PM', type: 'Break 1 Start' },
      { time: '11:46 PM', type: 'Break 1 End' },
      { time: '4:37 AM', type: 'Break 2 Start' },
      { time: '4:42 AM', type: 'Break 2 End' },
    ],
  },
  '2026-09-17': {
    status: 'Present',
    statusColor: 'green',
    punches: [
      { time: '8:55 PM', type: 'Shift Start' },
      { time: '11:30 PM', type: 'Break 1 Start' },
      { time: '11:45 PM', type: 'Break 1 End' },
      { time: '1:57 AM', type: 'Start Lunch' },
    ],
  },
};

// Generate calendar cells for a given month & year for any employee
export function getShiftCalendarGrid(
  employeeName: string,
  year: number = 2026,
  monthIndex: number = 8 // 8 = September (0-indexed)
): CalendarDayData[] {
  const empProfile = ROSTER_PROFILES.find((p) => p.name.toLowerCase() === employeeName.toLowerCase()) || ROSTER_PROFILES[0];
  const isNissi = empProfile.empId === '1597' || employeeName.toLowerCase().includes('nissi');

  // First day of target month
  const firstDay = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, 2=Tue...
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();

  const grid: CalendarDayData[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthIdx = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateKey = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    let status: AttendanceDayStatus = null;
    let statusColor: 'green' | 'orange' | 'red' | 'gray' = 'gray';
    let punches: CalendarPunchItem[] = [];

    if (isNissi && NISSI_CALENDAR_DATA_SEP_2026[dateKey]) {
      const entry = NISSI_CALENDAR_DATA_SEP_2026[dateKey];
      status = entry.status;
      statusColor = entry.statusColor;
      punches = entry.punches.map((p, idx) => ({
        id: `prev-p-${idx}`,
        time: p.time,
        type: p.type,
        rawType: p.type,
        timestamp: `${dateKey} ${p.time}`,
        status: 'Logged',
      }));
    }

    grid.push({
      dayNumber: dayNum,
      monthIndex: prevMonthIdx,
      year: prevYear,
      dateKey,
      isCurrentMonth: false,
      status,
      statusColor,
      punches,
    });
  }

  // Current month days (1 to totalDaysInMonth)
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = (startDayOfWeek + d - 1) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun or Sat

    let status: AttendanceDayStatus = null;
    let statusColor: 'green' | 'orange' | 'red' | 'gray' = 'gray';
    let punches: CalendarPunchItem[] = [];

    if (isNissi && NISSI_CALENDAR_DATA_SEP_2026[dateKey]) {
      const entry = NISSI_CALENDAR_DATA_SEP_2026[dateKey];
      status = entry.status;
      statusColor = entry.statusColor;
      punches = entry.punches.map((p, idx) => ({
        id: `cur-p-${d}-${idx}`,
        time: p.time,
        type: p.type,
        rawType: p.type,
        timestamp: `${dateKey} ${p.time}`,
        status: 'Logged',
      }));
    } else {
      // Find raw punches for this employee from INITIAL_PUNCH_LOGS or generate realistic pattern
      const employeeLogs = INITIAL_PUNCH_LOGS.filter((l) => l.empId === empProfile.empId);
      const dayLogs = employeeLogs.filter((l) => {
        const parsed = new Date(l.timestamp);
        return parsed.getFullYear() === year && parsed.getMonth() === monthIndex && parsed.getDate() === d;
      });

      if (dayLogs.length > 0) {
        status = 'Present';
        statusColor = 'green';
        punches = dayLogs.map((l) => ({
          id: l.id,
          time: formatTimeShort(l.timestamp),
          type: normalizePunchTypeLabel(l.type),
          rawType: l.type,
          timestamp: l.timestamp,
          status: l.status,
          duration: l.duration,
        }));
      } else if (isWeekend) {
        status = 'Rest Day';
        statusColor = 'gray';
        punches = [];
      } else if (d <= 17) {
        // Realistic weekday shift for other employees
        const isLate = d % 5 === 1;
        const isUndertime = d % 7 === 4;
        status = isLate ? 'Late' : isUndertime ? 'Undertime' : 'Present';
        statusColor = isLate || isUndertime ? 'orange' : 'green';

        const startTime = isLate ? '9:15 PM' : '8:58 PM';
        punches = [
          { id: `gen-${d}-1`, time: startTime, type: 'Shift Start', rawType: 'Shift Start', timestamp: `${dateKey} ${startTime}`, status: 'Logged' },
          { id: `gen-${d}-2`, time: '11:15 PM', type: 'Break 1 Start', rawType: 'Break 1 Start', timestamp: `${dateKey} 11:15 PM`, status: 'Logged' },
          { id: `gen-${d}-3`, time: '11:30 PM', type: 'Break 1 End', rawType: 'Break 1 End', timestamp: `${dateKey} 11:30 PM`, status: 'Logged' },
          { id: `gen-${d}-4`, time: '1:10 AM', type: 'Start Lunch', rawType: 'Start Lunch', timestamp: `${dateKey} 1:10 AM`, status: 'Logged' },
          { id: `gen-${d}-5`, time: '2:10 AM', type: 'End Lunch', rawType: 'End Lunch', timestamp: `${dateKey} 2:10 AM`, status: 'Logged' },
          { id: `gen-${d}-6`, time: '4:15 AM', type: 'Break 2 Start', rawType: 'Break 2 Start', timestamp: `${dateKey} 4:15 AM`, status: 'Logged' },
          { id: `gen-${d}-7`, time: '4:30 AM', type: 'Break 2 End', rawType: 'Break 2 End', timestamp: `${dateKey} 4:30 AM`, status: 'Logged' },
          { id: `gen-${d}-8`, time: '6:00 AM', type: 'Shift End', rawType: 'Shift End', timestamp: `${dateKey} 6:00 AM`, status: 'Logged' },
        ];
      }
    }

    grid.push({
      dayNumber: d,
      monthIndex,
      year,
      dateKey,
      isCurrentMonth: true,
      status,
      statusColor,
      punches,
      totalShiftHours: punches.length >= 6 ? '9.0 hrs' : punches.length > 0 ? '5.5 hrs' : '0.0 hrs',
      totalBreakMinutes: punches.length >= 6 ? 30 : 15,
      totalLunchMinutes: punches.length >= 4 ? 60 : 0,
    });
  }

  // Next month leading days to complete grid to 35 or 42 cells
  const remainingCells = (7 - (grid.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const nextMonthIdx = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateKey = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;

    grid.push({
      dayNumber: n,
      monthIndex: nextMonthIdx,
      year: nextYear,
      dateKey,
      isCurrentMonth: false,
      status: null,
      statusColor: 'gray',
      punches: [],
    });
  }

  return grid;
}
