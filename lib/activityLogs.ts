import { WORKFORCE_TIME_ZONE } from '@/lib/timeZone';

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

export const MAX_ACTIVITY_LOGS = 1000;
const READ_NOTIFICATION_RETENTION_DAYS = 30;

const STORAGE_KEY = 'ctnp_system_activity_logs';

export const INITIAL_ACTIVITY_LOGS: SystemActivityLog[] = [];

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
  return role === 'admin' || role === 'superadmin' ||
    position.includes('head') || position.includes('supervisor') || position.includes('manager') ||
    position.includes('administrator');
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
  const metaRecipientName = String(logMeta.recipientName || '').trim().toLowerCase();
  const metaEmail = String(logMeta.email || '').trim().toLowerCase();
  const metaUserId = String(logMeta.id || logMeta.employeeId || logMeta.employee_id || '').trim().toLowerCase();

  if (userName && metaRecipientName && metaRecipientName === userName) return true;

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
      return INITIAL_ACTIVITY_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cutoff = Date.now() - READ_NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
      const retained = parsed.filter((log: SystemActivityLog) =>
        !/^act-(?:punch|login|timelog)-\d+$/.test(log.id) &&
        (!log.isRead || new Date(log.timestamp).getTime() >= cutoff)
      );
      if (retained.length !== parsed.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(retained));
      return retained;
    }
    return INITIAL_ACTIVITY_LOGS;
  } catch (e) {
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function filterNotificationsForToday(logs: SystemActivityLog[]): SystemActivityLog[] {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: WORKFORCE_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  return logs.filter((log) => {
    if (!log.isRead) return true;
    const logDay = new Intl.DateTimeFormat('en-CA', {
      timeZone: WORKFORCE_TIME_ZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(log.timestamp));
    return logDay === today;
  });
}

export async function syncActivityLogsWithApi(): Promise<SystemActivityLog[]> {
  try {
    const res = await fetch('/api/activity-logs');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const localLogs = getActivityLogs();
        const mergedMap = new Map<string, SystemActivityLog>();
        
        // Add local logs
        localLogs.forEach((l) => mergedMap.set(l.id, l));
        // Server read state is authoritative for persisted notifications.
        json.data.forEach((l: SystemActivityLog) => mergedMap.set(l.id, l));
        
        const combined = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

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
  return getActivityLogs();
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

  const updated = [newLog, ...currentLogs.filter((l) => l.id !== newLog.id)];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: newLog }));
      
      // Post to backend asynchronously
      fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      }).then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        const saved = result?.data as SystemActivityLog | undefined;
        if (!saved?.id) return;
        const latest = getActivityLogs().map((item) => item.id === newLog.id ? { ...item, ...saved } : item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));
        window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'sync' } }));
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
    fetch('/api/activity-logs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' }),
    }).catch(() => {});
  } catch (e) {}
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  const current = getActivityLogs();
  const updated = current.map((item) => (item.id === id ? { ...item, isRead: true } : item));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'mark_read', id } }));
    fetch('/api/activity-logs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', id }),
    }).catch(() => {});
  } catch (e) {}
}

export function clearActivityLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('system-activity-logged', { detail: { action: 'clear' } }));
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
