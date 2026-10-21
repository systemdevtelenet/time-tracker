import { NextRequest, NextResponse } from 'next/server';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isLogRelevantToUser, SystemActivityLog, SystemActivityCategory } from '@/lib/activityLogs';
import { WORKFORCE_TIME_ZONE } from '@/lib/timeZone';

export const dynamic = 'force-dynamic';

const NOTIFICATION_ACTION_URL = '/?source=time-tracker-notification';
const READ_NOTIFICATION_RETENTION_DAYS = 30;
const FETCH_PAGE_SIZE = 1000;

function startOfTodayInTimeZone(timeZone: string, now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';
  const [year, month, day] = [Number(part('year')), Number(part('month')), Number(part('day'))];
  const targetMidnightAsUtc = Date.UTC(year, month - 1, day);
  const localAtTarget = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(targetMidnightAsUtc));
  const value = (type: string) => Number(localAtTarget.find((item) => item.type === type)?.value || '0');
  const representedAsUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
  return new Date(targetMidnightAsUtc - (representedAsUtc - targetMidnightAsUtc));
}

function categoryFor(title: string, description: string): SystemActivityCategory {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('punch') || text.includes('shift start') || text.includes('shift end') || text.includes('break')) return 'PUNCH';
  if (text.includes('login') || text.includes('sign in')) return 'AUTH';
  if (text.includes('time log') || text.includes('task activity')) return 'TIME LOG';
  if (text.includes('attendance')) return 'ATTENDANCE';
  if (text.includes('trainee')) return 'TRAINEES';
  if (text.includes('trainer')) return 'TRAINERS';
  if (text.includes('remark')) return 'REMARKS';
  if (text.includes('alert')) return 'ALERT';
  return 'SYSTEM';
}

function activityTypeFor(category: SystemActivityCategory): SystemActivityLog['type'] {
  switch (category) {
    case 'AUTH': return 'login';
    case 'PUNCH': return 'punch';
    case 'TIME LOG': return 'timelog';
    case 'ATTENDANCE': return 'attendance' as SystemActivityLog['type'];
    case 'TRAINEES': return 'trainee';
    case 'TRAINERS': return 'trainer';
    case 'REMARKS': return 'remark';
    case 'ALERT': return 'alert';
    default: return 'system';
  }
}

function performedByFromDescription(description: string): string {
  const performed = /^(.+?)\s+performed\b/i.exec(description);
  if (performed) return performed[1].trim();
  const by = /\(by\s+([^)]+)\)/i.exec(description);
  return by?.[1]?.trim() || 'System';
}

function toActivityLog(row: any, recipientName: string): SystemActivityLog {
  const title = String(row.title || 'Notification');
  const description = String(row.description || '');
  const category = categoryFor(title, description);
  return {
    id: String(row.notification_id),
    title,
    description,
    timestamp: String(row.created_at),
    performedBy: performedByFromDescription(description),
    category,
    type: activityTypeFor(category),
    isRead: Boolean(row.read_at),
    metadata: { recipientName },
  };
}

async function pruneExpiredReadNotifications(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const cutoff = new Date(Date.now() - READ_NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('action_url', NOTIFICATION_ACTION_URL)
    .lt('read_at', cutoff);
  if (error) throw error;
}

async function readAllPages(queryFactory: (from: number, to: number) => any) {
  const rows: any[] = [];
  for (let offset = 0; ; offset += FETCH_PAGE_SIZE) {
    const { data, error } = await queryFactory(offset, offset + FETCH_PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < FETCH_PAGE_SIZE) break;
  }
  return rows;
}

function unauthorized() {
  return NextResponse.json({ error: 'Please sign in with an active employee account.' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  try {
    const employee = await getActiveEmployeeAccess(request);
    if (!employee) return unauthorized();

    const supabase = getSupabaseAdmin();
    await pruneExpiredReadNotifications(supabase);
    const todayStart = startOfTodayInTimeZone(WORKFORCE_TIME_ZONE).toISOString();
    const selectFields = 'notification_id, title, description, read_at, created_at, action_url';

    const [todayRows, unreadRows] = await Promise.all([
      readAllPages((from, to) => supabase.from('notifications').select(selectFields)
        .eq('recipient_employee_id', employee.id)
        .eq('action_url', NOTIFICATION_ACTION_URL)
        .gte('created_at', todayStart)
        .order('created_at', { ascending: false })
        .range(from, to)),
      readAllPages((from, to) => supabase.from('notifications').select(selectFields)
        .eq('recipient_employee_id', employee.id)
        .eq('action_url', NOTIFICATION_ACTION_URL)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .range(from, to)),
    ]);

    const uniqueRows = new Map<string, any>();
    [...todayRows, ...unreadRows].forEach((row) => uniqueRows.set(String(row.notification_id), row));
    const data = [...uniqueRows.values()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((row) => toActivityLog(row, employee.name));

    return NextResponse.json({ success: true, data, total: data.length, unreadCount: data.filter((item) => !item.isRead).length });
  } catch (error) {
    console.error('Error in GET /api/activity-logs:', error);
    return NextResponse.json({ error: 'Unable to load notifications.', data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const employee = await getActiveEmployeeAccess(request);
    if (!employee) return unauthorized();

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    await pruneExpiredReadNotifications(supabase);

    // Keep activity notifications for the actor and any employee explicitly
    // named as the target, plus managers who already receive organization logs.
    const log: SystemActivityLog = {
      id: String(body.id || ''),
      title,
      description,
      timestamp: new Date().toISOString(),
      performedBy: typeof body.performedBy === 'string' ? body.performedBy : employee.name,
      category: (typeof body.category === 'string' ? body.category : categoryFor(title, description)) as SystemActivityCategory,
      type: body.type || 'system',
      isRead: false,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    };
    const { data: roster, error: rosterError } = await supabase.from('employees')
      .select('id, employee_code, employee_name, employee_email, roles(role_name), positions(position_name)');
    if (rosterError) throw rosterError;

    const recipients = new Set<number>([employee.id]);
    for (const candidate of roster || []) {
      const user = {
        id: String(candidate.employee_code || candidate.id),
        name: candidate.employee_name || '',
        email: candidate.employee_email || '',
        role: (candidate.roles as { role_name?: string } | null)?.role_name || '',
        position: (candidate.positions as { position_name?: string } | null)?.position_name || '',
      };
      if (isLogRelevantToUser(log, user)) recipients.add(Number(candidate.id));
    }

    const rows = [...recipients].map((recipientId) => ({
      recipient_employee_id: recipientId,
      title,
      description,
      action_url: NOTIFICATION_ACTION_URL,
      created_at: log.timestamp,
    }));
    const { data: inserted, error } = await supabase.from('notifications')
      .insert(rows)
      .select('notification_id, recipient_employee_id, title, description, read_at, created_at, action_url');
    if (error) throw error;

    const ownNotification = (inserted || []).find((row) => Number(row.recipient_employee_id) === employee.id) || inserted?.[0];
    return NextResponse.json({ success: true, data: ownNotification ? toActivityLog(ownNotification, employee.name) : log }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/activity-logs:', error);
    return NextResponse.json({ error: 'Unable to save this notification.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const employee = await getActiveEmployeeAccess(request);
    if (!employee) return unauthorized();
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const update = supabase.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('recipient_employee_id', employee.id)
      .eq('action_url', NOTIFICATION_ACTION_URL)
      .is('read_at', null);

    if (body.action === 'mark_read' && /^\d+$/.test(String(body.id || ''))) {
      const { error } = await update.eq('notification_id', Number(body.id));
      if (error) throw error;
    } else if (body.action === 'mark_all_read') {
      const { error } = await update;
      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'A valid notification read action is required.' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/activity-logs:', error);
    return NextResponse.json({ error: 'Unable to update notification status.' }, { status: 500 });
  }
}
