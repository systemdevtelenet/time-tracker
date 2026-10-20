import { WORKFORCE_TIME_ZONE } from '@/lib/timeZone';

export interface PunchLogItem {
  id: string;
  empId: string;
  type: string;
  timestamp: string;
  duration: string;
  status: string;
  overDuration?: string | null;
}

export type PunchActionType = 
  | 'Shift Start'
  | 'Break 1 Start'
  | 'Break 1 End'
  | 'Start Lunch'
  | 'End Lunch'
  | 'Break 2 Start'
  | 'Break 2 End'
  | 'Shift End';

function formatWorkforceTime(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleTimeString('en-US', { ...options, timeZone: WORKFORCE_TIME_ZONE });
}

export interface ShiftMilestoneItem {
  id: string;
  type: 'punch_in' | 'break_1' | 'lunch' | 'break_2' | 'punch_out';
  label: string;
  timeRange: string;
  duration?: string;
  status: 'completed' | 'active' | 'upcoming';
  iconName: 'LogIn' | 'Coffee' | 'Utensils' | 'LogOut';
  color: string;
  notes?: string;
}

export interface PunchAuditEntry {
  id: string;
  action: string;
  time: string;
  duration: string;
  category: string;
  verifiedBy: string;
  status?: string;
}

export interface ShiftPunchesState {
  hasShiftStart: boolean;
  hasBreak1Start: boolean;
  hasBreak1End: boolean;
  hasLunchStart: boolean;
  hasLunchEnd: boolean;
  hasBreak2Start: boolean;
  hasBreak2End: boolean;
  hasShiftEnd: boolean;
}

export const INITIAL_PUNCH_LOGS: PunchLogItem[] = [];

export function getEmployeePunches(empId: string, punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS): PunchLogItem[] {
  return punchList
    .filter(p => String(p.empId) === String(empId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getLatestPunch(empId: string, punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS): PunchLogItem | null {
  const list = getEmployeePunches(empId, punchList);
  return list.length > 0 ? list[0] : null;
}

export interface ComputedPunchStatus {
  status: 'working' | 'lunch' | 'break_1' | 'break_2' | 'offline';
  statusLabel: string;
  lastPunchType: string;
  lastPunchTime: string;
  lastPunchTimestamp: string;
  elapsedSeconds: number;
  punchesState: ShiftPunchesState;
}

export function computeEmployeePunchStatus(
  empId: string,
  punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS
): ComputedPunchStatus {
  const latest = getLatestPunch(empId, punchList);
  const employeePunches = getEmployeePunches(empId, punchList);

  // Find punches for active shift session
  const shiftStartPunch = employeePunches.find(p => p.type.toLowerCase().includes('shift start'));
  const shiftStartTime = shiftStartPunch ? new Date(shiftStartPunch.timestamp).getTime() : 0;
  
  const currentShiftPunches = employeePunches.filter(p => {
    if (!shiftStartTime) return true;
    const pTime = new Date(p.timestamp).getTime();
    return pTime >= shiftStartTime - 1000 * 60 * 30;
  });

  const punchesState: ShiftPunchesState = {
    hasShiftStart: currentShiftPunches.some(p => p.type.toLowerCase().includes('shift start')),
    hasBreak1Start: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 1 start') || (p.type.toLowerCase().includes('start break') && !p.type.toLowerCase().includes('2'))),
    hasBreak1End: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 1 end') || (p.type.toLowerCase().includes('end break') && !p.type.toLowerCase().includes('2'))),
    hasLunchStart: currentShiftPunches.some(p => p.type.toLowerCase().includes('start lunch') || (p.type.toLowerCase().includes('lunch') && !p.type.toLowerCase().includes('end'))),
    hasLunchEnd: currentShiftPunches.some(p => p.type.toLowerCase().includes('end lunch')),
    hasBreak2Start: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 2 start')),
    hasBreak2End: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 2 end')),
    hasShiftEnd: currentShiftPunches.some(p => p.type.toLowerCase().includes('shift end')),
  };

  if (!latest) {
    return {
      status: 'offline',
      statusLabel: 'Offline',
      lastPunchType: 'None',
      lastPunchTime: '--:--',
      lastPunchTimestamp: '',
      elapsedSeconds: 0,
      punchesState,
    };
  }

  const punchDate = new Date(latest.timestamp);
  const isValidDate = !isNaN(punchDate.getTime());
  const now = new Date();
  const elapsed = isValidDate ? Math.max(0, Math.floor((now.getTime() - punchDate.getTime()) / 1000)) : 0;
  
  let formattedTime = latest.timestamp;
  if (isValidDate) {
    formattedTime = formatWorkforceTime(punchDate, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  }

  const typeLower = latest.type.toLowerCase();

  if (typeLower.includes('start lunch') || (typeLower.includes('lunch') && !typeLower.includes('end'))) {
    return {
      status: 'lunch',
      statusLabel: 'On Lunch',
      lastPunchType: 'Start Lunch',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  if (typeLower.includes('break 2 start')) {
    return {
      status: 'break_2',
      statusLabel: 'On 2nd Break',
      lastPunchType: 'Break 2 Start',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  if (typeLower.includes('start break') || typeLower.includes('break 1 start') || (typeLower.includes('break') && !typeLower.includes('end'))) {
    return {
      status: 'break_1',
      statusLabel: 'On 1st Break',
      lastPunchType: 'Break 1 Start',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  if (typeLower.includes('shift end') || typeLower.includes('punch out')) {
    return {
      status: 'offline',
      statusLabel: 'Shift Ended',
      lastPunchType: 'Shift End',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  // Shift Start, End Lunch, Break 1 End, Break 2 End => Working
  return {
    status: 'working',
    statusLabel: 'Working',
    lastPunchType: latest.type,
    lastPunchTime: formattedTime,
    lastPunchTimestamp: latest.timestamp,
    elapsedSeconds: elapsed,
    punchesState,
  };
}

export function computeShiftMilestonesAndAudit(
  empId: string,
  punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS
): { milestones: ShiftMilestoneItem[]; auditHistory: PunchAuditEntry[] } {
  const employeePunches = getEmployeePunches(empId, punchList);

  const shiftStartPunch = employeePunches.find(p => p.type.toLowerCase().includes('shift start'));
  const shiftStartTime = shiftStartPunch ? new Date(shiftStartPunch.timestamp).getTime() : 0;

  const shiftPunches = employeePunches.filter(p => {
    if (!shiftStartTime) return true;
    const pTime = new Date(p.timestamp).getTime();
    return pTime >= shiftStartTime - 1000 * 60 * 30;
  });

  // 1. Shift Start
  const hasShiftStart = !!shiftStartPunch;
  const shiftStartFormatted = shiftStartPunch 
    ? formatWorkforceTime(new Date(shiftStartPunch.timestamp), { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    : '';
  
  const m1: ShiftMilestoneItem = {
    id: 'm1',
    type: 'punch_in',
    label: 'Shift Start (Punch In)',
    timeRange: hasShiftStart ? shiftStartFormatted : 'No punch recorded',
    duration: hasShiftStart ? (shiftStartPunch?.status === 'Late' ? 'Late Punch' : 'On Time') : 'Awaiting punch',
    status: hasShiftStart ? 'completed' : 'upcoming',
    iconName: 'LogIn',
    color: hasShiftStart ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  };

  // 2. 1st Break
  const break1Start = shiftPunches.find(p => p.type.toLowerCase().includes('break 1 start') || (p.type.toLowerCase().includes('start break') && !p.type.toLowerCase().includes('2')));
  const break1End = shiftPunches.find(p => p.type.toLowerCase().includes('break 1 end') || (p.type.toLowerCase().includes('end break') && !p.type.toLowerCase().includes('2')));
  
  let m2Status: 'completed' | 'active' | 'upcoming' = 'upcoming';
  let m2TimeRange = 'No punch recorded';
  let m2Duration = '15 mins expected';
  let m2Color = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

  if (break1Start && break1End) {
    m2Status = 'completed';
    const sTime = formatWorkforceTime(new Date(break1Start.timestamp), { hour: 'numeric', minute: '2-digit', hour12: true });
    const eTime = formatWorkforceTime(new Date(break1End.timestamp), { hour: 'numeric', minute: '2-digit', hour12: true });
    m2TimeRange = `${sTime} – ${eTime}`;
    m2Duration = break1End.duration !== 'N/A' ? `${Math.round(parseFloat(break1End.duration) || 15)} mins` : '15 mins';
    m2Color = 'bg-emerald-500 text-white';
  } else if (break1Start && !break1End) {
    m2Status = 'active';
    const sTime = formatWorkforceTime(new Date(break1Start.timestamp), { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    m2TimeRange = `${sTime} – In Progress`;
    m2Duration = 'Break in progress';
    m2Color = 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse';
  }

  const m2: ShiftMilestoneItem = {
    id: 'm2',
    type: 'break_1',
    label: '1st Paid Break (15m)',
    timeRange: m2TimeRange,
    duration: m2Duration,
    status: m2Status,
    iconName: 'Coffee',
    color: m2Color,
  };

  // 3. Lunch
  const lunchStart = shiftPunches.find(p => p.type.toLowerCase().includes('start lunch') || (p.type.toLowerCase().includes('lunch') && !p.type.toLowerCase().includes('end')));
  const lunchEnd = shiftPunches.find(p => p.type.toLowerCase().includes('end lunch'));

  let m3Status: 'completed' | 'active' | 'upcoming' = 'upcoming';
  let m3TimeRange = 'No punch recorded';
  let m3Duration = '1h expected';
  let m3Color = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

  if (lunchStart && lunchEnd) {
    m3Status = 'completed';
    const sTime = formatWorkforceTime(new Date(lunchStart.timestamp), { hour: 'numeric', minute: '2-digit', hour12: true });
    const eTime = formatWorkforceTime(new Date(lunchEnd.timestamp), { hour: 'numeric', minute: '2-digit', hour12: true });
    m3TimeRange = `${sTime} – ${eTime}`;
    m3Duration = lunchEnd.duration !== 'N/A' ? `${Math.round(parseFloat(lunchEnd.duration) || 55)} mins` : '55 mins';
    m3Color = 'bg-emerald-500 text-white';
  } else if (lunchStart && !lunchEnd) {
    m3Status = 'active';
    const sTime = formatWorkforceTime(new Date(lunchStart.timestamp), { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    m3TimeRange = `${sTime} – In Progress`;
    m3Duration = 'Elapsed in real-time';
    m3Color = 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse';
  }

  const m3: ShiftMilestoneItem = {
    id: 'm3',
    type: 'lunch',
    label: 'Meal / Lunch (1h)',
    timeRange: m3TimeRange,
    duration: m3Duration,
    status: m3Status,
    iconName: 'Utensils',
    color: m3Color,
  };

  // 4. 2nd Break
  const break2Start = shiftPunches.find(p => p.type.toLowerCase().includes('break 2 start') || (p.type.toLowerCase().includes('start break') && p !== break1Start));
  const break2End = shiftPunches.find(p => p.type.toLowerCase().includes('break 2 end') || (p.type.toLowerCase().includes('end break') && p !== break1End));

  let m4Status: 'completed' | 'active' | 'upcoming' = 'upcoming';
  let m4TimeRange = 'No punch recorded';
  let m4Duration = '15 mins expected';
  let m4Color = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

  if (break2Start && break2End) {
    m4Status = 'completed';
    const sTime = formatWorkforceTime(new Date(break2Start.timestamp), { hour: 'numeric', minute: '2-digit', hour12: true });
    const eTime = formatWorkforceTime(new Date(break2End.timestamp), { hour: 'numeric', minute: '2-digit', hour12: true });
    m4TimeRange = `${sTime} – ${eTime}`;
    m4Duration = break2End.duration !== 'N/A' ? `${Math.round(parseFloat(break2End.duration) || 15)} mins` : '15 mins';
    m4Color = 'bg-emerald-500 text-white';
  } else if (break2Start && !break2End) {
    m4Status = 'active';
    const sTime = formatWorkforceTime(new Date(break2Start.timestamp), { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    m4TimeRange = `${sTime} – In Progress`;
    m4Duration = 'Break in progress';
    m4Color = 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse';
  }

  const m4: ShiftMilestoneItem = {
    id: 'm4',
    type: 'break_2',
    label: '2nd Paid Break (15m)',
    timeRange: m4TimeRange,
    duration: m4Duration,
    status: m4Status,
    iconName: 'Coffee',
    color: m4Color,
  };

  // 5. Shift End
  const shiftEndPunch = shiftPunches.find(p => p.type.toLowerCase().includes('shift end'));
  const hasShiftEnd = !!shiftEndPunch;
  const shiftEndFormatted = shiftEndPunch 
    ? formatWorkforceTime(new Date(shiftEndPunch.timestamp), { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    : 'No punch recorded';

  // Calculate shift duration capped at 8.0 regular work hours (9.0 hrs total shift span)
  let shiftEndDuration = '9.0 hrs total shift';
  if (hasShiftEnd) {
    if (shiftStartPunch) {
      const startMs = new Date(shiftStartPunch.timestamp).getTime();
      const endMs = new Date(shiftEndPunch.timestamp).getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
        const grossHours = (endMs - startMs) / (1000 * 3600);
        if (grossHours > 9.5) {
          // Forgotten punch-out auto-caps to regular 8.0 hours
          shiftEndDuration = '8.0 hrs regular (Auto-Capped)';
        } else {
          const netHours = Math.min(8.0, Math.max(0, grossHours - 1.0));
          shiftEndDuration = `${netHours.toFixed(1)} hrs completed`;
        }
      } else {
        shiftEndDuration = '8.0 hrs completed';
      }
    } else {
      shiftEndDuration = '8.0 hrs completed';
    }
  }

  const m5: ShiftMilestoneItem = {
    id: 'm5',
    type: 'punch_out',
    label: 'Shift End (Punch Out)',
    timeRange: shiftEndFormatted,
    duration: shiftEndDuration,
    status: hasShiftEnd ? 'completed' : 'upcoming',
    iconName: 'LogOut',
    color: hasShiftEnd ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  };

  const milestones = [m1, m2, m3, m4, m5];

  // Build Audit History Table Rows from real shift punches
  const auditHistory: PunchAuditEntry[] = shiftPunches.slice(0, 10).map((p) => {
    let action = p.type;
    let category = 'Shift Operations';
    const typeLower = p.type.toLowerCase();

    if (typeLower.includes('start lunch')) {
      category = 'Unpaid Meal Break';
      action = 'Start Lunch';
    } else if (typeLower.includes('end lunch')) {
      category = 'Unpaid Meal Break';
      action = 'End Lunch';
    } else if (typeLower.includes('break 1 start') || (typeLower.includes('start break') && !typeLower.includes('2'))) {
      category = 'Paid 1st Rest Period';
      action = 'Break 1 Start';
    } else if (typeLower.includes('break 1 end') || (typeLower.includes('end break') && !typeLower.includes('2'))) {
      category = 'Paid 1st Rest Period';
      action = 'Break 1 End';
    } else if (typeLower.includes('break 2 start')) {
      category = 'Paid 2nd Rest Period';
      action = 'Break 2 Start';
    } else if (typeLower.includes('break 2 end')) {
      category = 'Paid 2nd Rest Period';
      action = 'Break 2 End';
    } else if (typeLower.includes('shift start')) {
      category = 'Regular Work Hours';
      action = 'Shift Start';
    } else if (typeLower.includes('shift end')) {
      category = 'Regular Work Hours';
      action = 'Shift End';
    }

    const pDate = new Date(p.timestamp);
    const timeFormatted = !isNaN(pDate.getTime()) 
      ? formatWorkforceTime(pDate, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
      : p.timestamp;

    return {
      id: p.id,
      action,
      time: timeFormatted,
      duration: p.duration && p.duration !== 'N/A' ? `${p.duration}m` : 'Recorded',
      category,
      verifiedBy: 'Corporate Terminal / GeoSync',
      status: p.status,
    };
  });

  return { milestones, auditHistory };
}
