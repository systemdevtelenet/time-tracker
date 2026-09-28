import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const MAX_ACTIVITY_LOGS = 10;

export interface ActivityLogItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  category: 'AUTH' | 'PUNCH' | 'TIME LOG' | 'ATTENDANCE' | 'TRAINEES' | 'TRAINERS' | 'REMARKS' | 'SYSTEM' | 'ALERT';
  type?: string;
  isRead?: boolean;
}

// In-memory runtime cache ensuring real-time continuity for recent activities
let runtimeLogs: ActivityLogItem[] = [];

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), MAX_ACTIVITY_LOGS);

    const aggregated: ActivityLogItem[] = [...runtimeLogs];

    // 1. Fetch real recent time tracker entries from Supabase (strictly max 10)
    try {
      const { data: timeEntries } = await supabase
        .from('phone_time_tracker')
        .select('*')
        .order('date_of_shift', { ascending: false })
        .limit(MAX_ACTIVITY_LOGS);

      if (timeEntries && timeEntries.length > 0) {
        timeEntries.forEach((entry: any) => {
          const entryId = `entry-${entry.ticket_number || entry.id || Math.random().toString(36).substring(2, 7)}`;
          if (!aggregated.some((l) => l.id === entryId)) {
            aggregated.push({
              id: entryId,
              title: 'Task Activity Recorded',
              description: `Logged ${entry.total_minutes || 'duration'} for ${entry.account || 'Corporate'} (Ticket #${entry.ticket_number || 'N/A'}).`,
              timestamp: entry.created_at || new Date(entry.date_of_shift || Date.now()).toISOString(),
              performedBy: entry.name ? entry.name.trim() : 'Agent',
              category: 'TIME LOG',
              type: 'timelog',
              isRead: true,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not fetch time entries for activity logs:', e);
    }

    // Sort by timestamp descending (newest first)
    const sorted = aggregated.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    let filtered = sorted;
    if (category && category !== 'ALL') {
      filtered = filtered.filter((l) => l.category === category);
    }

    // Strictly enforce max 10 logs
    const finalLogs = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: finalLogs,
      total: finalLogs.length,
      unreadCount: finalLogs.filter((l) => !l.isRead).length,
    });
  } catch (err: any) {
    console.error('Error in GET /api/activity-logs:', err);
    return NextResponse.json({ success: false, data: runtimeLogs.slice(0, MAX_ACTIVITY_LOGS) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { title, description, performedBy, category, type } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const newLog: ActivityLogItem = {
      id: body.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      timestamp: body.timestamp || new Date().toISOString(),
      performedBy: performedBy || 'System Auth',
      category: category || 'SYSTEM',
      type: type || 'system',
      isRead: false,
    };

    // Strictly keep only the top 10 logs in runtime memory
    runtimeLogs = [newLog, ...runtimeLogs.filter((l) => l.id !== newLog.id)].slice(0, MAX_ACTIVITY_LOGS);

    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/activity-logs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    runtimeLogs = [];
    return NextResponse.json({ success: true, message: 'Activity feed cleared from memory' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


