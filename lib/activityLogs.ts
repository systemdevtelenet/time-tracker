export type SystemActivityCategory = 
  | 'AUTH' 
  | 'PUNCH' 
  | 'TIME LOG' 
  | 'ATTENDANCE' 
  | 'TRAINEES' 
  | 'TRAINERS' 
  | 'REMARKS' 
  | 'SYSTEM' 
  | 'ALERT';

export interface SystemActivityLog {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO string
  performedBy: string;
  category: SystemActivityCategory;
  type?: 'login' | 'punch' | 'timelog' | 'attendance' | 'trainee' | 'trainer' | 'remark' | 'system' | 'alert';
  isRead?: boolean;
  metadata?: Record<string, any>;
}

export const MAX_ACTIVITY_LOGS = 10;

const STORAGE_KEY = 'ctnp_system_activity_logs';

export const INITIAL_ACTIVITY_LOGS: SystemActivityLog[] = [
  {
    id: 'act-punch-1',
    title: 'Break 2 End Recorded',
    description: 'Nissi-Jeh Reguero performed shift punch action: Break 2 End.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    performedBy: 'Nissi-Jeh Reguero',
    category: 'PUNCH',
    type: 'punch',
    isRead: true,
  },
  {
    id: 'act-punch-2',
    title: 'Break 2 Start Recorded',
    description: 'Nissi-Jeh Reguero performed shift punch action: Break 2 Start.',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    performedBy: 'Nissi-Jeh Reguero',
    category: 'PUNCH',
    type: 'punch',
    isRead: true,
  },
  {
    id: 'act-login-1',
    title: 'User Login',
    description: 'nreguero.telenet@gmail.com successfully logged into the hub.',
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    performedBy: 'System Auth',
    category: 'AUTH',
    type: 'login',
    isRead: true,
  },
  {
    id: 'act-timelog-1',
    title: 'Task Activity Recorded',
    description: 'Logged 37 minutes, 36 seconds for DFT (Ticket #068bf153).',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Matt Riner Balaba',
    category: 'TIME LOG',
    type: 'timelog',
    isRead: true,
  },
  {
    id: 'act-timelog-2',
    title: 'Task Activity Recorded',
    description: 'Logged 8 hours for Corporate (Ticket #CORP-TR-01).',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
    performedBy: 'Nissi-Jeh Reguero',
    category: 'TIME LOG',
    type: 'timelog',
    isRead: true,
  },
  {
    id: 'act-timelog-3',
    title: 'Task Activity Recorded',
    description: 'Logged 43 minutes, 6 seconds for DFT (Ticket #36e7ebf4).',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
    performedBy: 'Matt Riner Balaba',
    category: 'TIME LOG',
    type: 'timelog',
    isRead: true,
  },
  {
    id: 'act-timelog-4',
    title: 'Task Activity Recorded',
    description: 'Logged 27 minutes, 11 seconds for DFT (Ticket #9cfd9194).',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
    performedBy: 'Matt Riner Balaba',
    category: 'TIME LOG',
    type: 'timelog',
    isRead: true,
  },
];

export function isHeadOrAdminUser(supervisor?: {
  role?: string;
  position?: string;
  name?: string;
  id?: string;
  email?: string;
}): boolean {
  if (!supervisor) return false;
  const role = (supervisor.role || '').toLowerCase();
  const position = (supervisor.position || '').toLowerCase();
  const name = (supervisor.name || '').toLowerCase();
  const email = (supervisor.email || '').toLowerCase();

  if (role === 'admin' || role === 'superadmin') return true;
  if (
    position.includes('head of training') ||
    position.includes('head of quality') ||
    position.includes('qa supervisor') ||
    position.includes('supervisor') ||
    position.includes('manager') ||
    position.includes('administrator')
  ) {
    return true;
  }
  if (
    name.includes('nissi') ||
    name.includes('alasagas') ||
    name.includes('reguero') ||
    name.includes('raymundo')
  ) {
    return true;
  }
  if (
    email.includes('nreguero') ||
    email.includes('ralasagas')
  ) {
    return true;
  }
  return false;
}

/**
 * Determines whether a system activity log is relevant for a specific user.
 * - Administrators & Supervisors receive all organizational logs.
 * - Trainers, Trainees, and QA only receive their own actions (punches, logins, time logs)
 *   and administrative updates targeting their own data or status.
 */
export function isLogRelevantToUser(
  log: SystemActivityLog,
  user?: {
    name?: string;
    email?: string;
    id?: string;
    role?: string;
    position?: string;
  }
): boolean {
  if (!user) return true;

  // Head/Admin users have full visibility of all logs across the organization
  if (isHeadOrAdminUser(user)) {
    return true;
  }

  const userName = (user.name || '').trim().toLowerCase();
  const userEmail = (user.email || '').trim().toLowerCase();
  const userId = String(user.id || '').trim().toLowerCase();

  const logPerformedBy = (log.performedBy || '').trim().toLowerCase();
  const logTitle = (log.title || '').toLowerCase();
  const logDescription = (log.description || '').toLowerCase();
  const logMeta = log.metadata || {};
  const metaEmployeeName = String(logMeta.employeeName || logMeta.employee_name || logMeta.name || '').trim().toLowerCase();
  const metaEmail = String(logMeta.email || '').trim().toLowerCase();
  const metaUserId = String(logMeta.id || logMeta.employeeId || logMeta.employee_id || '').trim().toLowerCase();

  // 1. Direct performedBy match (the user themselves performed this action)
  if (userName && (logPerformedBy === userName || logPerformedBy.includes(userName) || userName.includes(logPerformedBy))) {
    return true;
  }
  if (userEmail && logPerformedBy.includes(userEmail)) {
    return true;
  }
  if (userEmail && userEmail.includes('@')) {
    const emailPrefix = userEmail.split('@')[0];
    if (emailPrefix.length >= 3 && logPerformedBy.includes(emailPrefix)) {
      return true;
    }
  }

  // 2. Metadata target match (Admin updated this user's attendance, shift, rating, remark, etc.)
  if (userName && metaEmployeeName && (metaEmployeeName === userName || metaEmployeeName.includes(userName) || userName.includes(metaEmployeeName))) {
    return true;
  }
  if (userEmail && metaEmail && (metaEmail === userEmail || metaEmail.includes(userEmail) || userEmail.includes(metaEmail))) {
    return true;
  }
  if (userId && metaUserId && (metaUserId === userId)) {
    return true;
  }

  // 3. Description or title explicitly mentions user's name, email, or ID
  if (userName && (logDescription.includes(userName) || logTitle.includes(userName))) {
    return true;
  }
  if (userEmail && (logDescription.includes(userEmail) || logTitle.includes(userEmail))) {
    return true;
  }
  if (userEmail && userEmail.includes('@')) {
    const emailPrefix = userEmail.split('@')[0];
    if (emailPrefix.length >= 3 && (logDescription.includes(emailPrefix) || logTitle.includes(emailPrefix))) {
      return true;
    }
  }

  // 4. Multi-part name check (e.g. "Bianca Kaye Ernestine Colonia" -> "bianca" and "colonia" appear in description)
  if (userName) {
    const nameParts = userName.split(/\s+/).filter((p) => p.length >= 3);
    if (nameParts.length >= 2) {
      const hasFirst = logDescription.includes(nameParts[0]);
      const hasLast = logDescription.includes(nameParts[nameParts.length - 1]);
      if (hasFirst && hasLast) {
        return true;
      }
    }
  }

  // 5. Broadcast system alert that is NOT personal to someone else
  const isPersonalLogOfSomeoneElse =
    logDescription.includes('performed shift punch') ||
    logDescription.includes("'s attendance") ||
    logDescription.includes('logged into the hub') ||
    logDescription.includes('ticket #') ||
    log.category === 'PUNCH' ||
    log.category === 'TIME LOG' ||
    log.category === 'AUTH' ||
    log.category === 'ATTENDANCE';

  if (!isPersonalLogOfSomeoneElse && (log.category === 'SYSTEM' || log.category === 'ALERT')) {
    return true;
  }

  return false;
}

/**
 * Filters a list of activity logs to only those relevant to the given user.
 */
export function filterActivityLogsForUser(
  logs: SystemActivityLog[],
  user?: {
    name?: string;
    email?: string;
    id?: string;
    role?: string;
    position?: string;
  }
): SystemActivityLog[] {
  if (!user || isHeadOrAdminUser(user)) {
    return logs;
  }
  return logs.filter((log) => isLogRelevantToUser(log, user));
}

export function getActivityLogs(): SystemActivityLog[] {
  if (typeof window === 'undefined') return INITIAL_ACTIVITY_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, MAX_ACTIVITY_LOGS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    return INITIAL_ACTIVITY_LOGS;
  } catch (e) {
    return INITIAL_ACTIVITY_LOGS;
  }
}

export async function syncActivityLogsWithApi(): Promise<SystemActivityLog[]> {
  try {
    const res = await fetch(`/api/activity-logs?limit=${MAX_ACTIVITY_LOGS}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const localLogs = getActivityLogs();
        const mergedMap = new Map<string, SystemActivityLog>();
        
        // Add default/seed logs first
        INITIAL_ACTIVITY_LOGS.forEach((l) => mergedMap.set(l.id, l));
        // Add backend logs
        json.data.forEach((l: SystemActivityLog) => mergedMap.set(l.id, l));
        // Add local logs
        localLogs.forEach((l) => mergedMap.set(l.id, l));
        
        const combined = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, MAX_ACTIVITY_LOGS);

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
          window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'sync' } }));
        }
        return combined;
      }
    }
  } catch (err) {
    console.warn('API sync warning for activity logs:', err);
  }
  return getActivityLogs().slice(0, MAX_ACTIVITY_LOGS);
}

export function addActivityLog(
  log: Omit<SystemActivityLog, 'id' | 'timestamp' | 'isRead'> & {
    id?: string;
    timestamp?: string;
    isRead?: boolean;
  }
): SystemActivityLog {
  const currentLogs = getActivityLogs();
  const newLog: SystemActivityLog = {
    id: log.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: log.title,
    description: log.description,
    timestamp: log.timestamp || new Date().toISOString(),
    performedBy: log.performedBy || 'System Auth',
    category: log.category,
    type: log.type || 'system',
    isRead: log.isRead ?? false,
    metadata: log.metadata,
  };

  const updated = [newLog, ...currentLogs.filter((l) => l.id !== newLog.id)].slice(0, MAX_ACTIVITY_LOGS);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: newLog }));
      
      // Post to backend asynchronously
      fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      }).catch((e) => console.warn('Activity log backend POST skipped:', e));
    } catch (e) {}
  }
  return newLog;
}

export function logUserLogin(email: string, performedBy: string = 'System Auth'): SystemActivityLog {
  return addActivityLog({
    title: 'User Login',
    description: `${email.trim()} successfully logged into the hub.`,
    performedBy: performedBy || 'System Auth',
    category: 'AUTH',
    type: 'login',
    metadata: {
      email: email.trim(),
      performedBy,
    },
  });
}

export function logAttendanceUpdate(params: {
  employeeName: string;
  dateStr: string;
  status: string;
  punchesCount?: number;
  performedBy?: string;
  note?: string;
}): SystemActivityLog {
  const { employeeName, dateStr, status, punchesCount = 0, performedBy = 'Supervisor', note } = params;
  const punchText = punchesCount > 0 ? ` with ${punchesCount} punch${punchesCount > 1 ? 'es' : ''}` : '';
  const noteText = note ? ` (Note: "${note}")` : '';
  
  return addActivityLog({
    title: 'Attendance Shift Updated',
    description: `${employeeName}'s attendance for ${dateStr} was updated to ${status}${punchText}.${noteText}`,
    performedBy: performedBy || 'Supervisor',
    category: 'ATTENDANCE',
    type: 'attendance',
    metadata: {
      employeeName,
      dateStr,
      status,
      punchesCount,
      note,
    },
  });
}

export function markAllNotificationsAsRead(user?: {
  name?: string;
  email?: string;
  id?: string;
  role?: string;
  position?: string;
}): void {
  if (typeof window === 'undefined') return;
  const current = getActivityLogs();
  const updated = current.map((item) => {
    if (!user || isLogRelevantToUser(item, user)) {
      return { ...item, isRead: true };
    }
    return item;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'mark_all_read' } }));
  } catch (e) {}
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  const current = getActivityLogs();
  const updated = current.map((item) => (item.id === id ? { ...item, isRead: true } : item));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'mark_read', id } }));
  } catch (e) {}
}

export function clearActivityLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'clear' } }));
    fetch('/api/activity-logs', { method: 'DELETE' }).catch(() => {});
  } catch (e) {}
}

export function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (diffMs < 0) return 'Just now';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  } catch (e) {
    return 'Recently';
  }
}
