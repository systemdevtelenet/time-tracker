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

// In-memory runtime cache ensuring real-time continuity for recent activities (strictly max 10)
let runtimeLogs: ActivityLogItem[] = [];

/**
 * Automatically prunes the activity_logs table in Supabase so only the latest 10 records exist in the database.
 * This saves database storage on free tier without deleting any employee timesheets.
 */
async function autoPruneActivityLogsInDb(supabase: any) {
  try {
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('id, timestamp, created_at')
      .order('created_at', { ascending: false });

    if (logs && logs.length > MAX_ACTIVITY_LOGS) {
      const logsToDelete = logs.slice(MAX_ACTIVITY_LOGS);
      const idsToDelete = logsToDelete.map((l: any) => l.id).filter(Boolean);
      if (idsToDelete.length > 0) {
        await supabase
          .from('activity_logs')
          .delete()
          .in('id', idsToDelete);
      }
    }
  } catch (err) {
    // Graceful fallback if table is not created yet
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), MAX_ACTIVITY_LOGS);

    // Prune activity_logs in database to 10 rows max
    await autoPruneActivityLogsInDb(supabase);

    const aggregated: ActivityLogItem[] = [...runtimeLogs];

    // 1. Fetch real recent activity logs from Supabase activity_logs table
    try {
      const { data: dbActivityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MAX_ACTIVITY_LOGS);

      if (dbActivityLogs && dbActivityLogs.length > 0) {
        dbActivityLogs.forEach((item: any) => {
          if (!aggregated.some((l) => l.id === item.id)) {
            aggregated.push({
              id: item.id,
              title: item.title,
              description: item.description,
              timestamp: item.timestamp || item.created_at || new Date().toISOString(),
              performedBy: item.performed_by || item.performedBy || 'System',
              category: item.category || 'SYSTEM',
              type: item.type || 'system',
              isRead: item.is_read ?? true,
            });
          }
        });
      }
    } catch (e) {}

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

    // Persist to Supabase activity_logs table and prune to 10 rows
    try {
      await supabase.from('activity_logs').insert({
        id: newLog.id,
        title: newLog.title,
        description: newLog.description,
        timestamp: newLog.timestamp,
        performed_by: newLog.performedBy,
        category: newLog.category,
        type: newLog.type,
        is_read: newLog.isRead,
      });
      await autoPruneActivityLogsInDb(supabase);
    } catch (e) {}

    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/activity-logs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = getSupabaseAdmin();
    runtimeLogs = [];
    try {
      await supabase.from('activity_logs').delete().neq('id', 'keep_none');
    } catch (e) {}
    return NextResponse.json({ success: true, message: 'Activity feed cleared from database and memory' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


