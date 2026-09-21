import { NextRequest, NextResponse } from 'next/server';
import { 
  getTimeTrackerLogsFromDb, 
  insertTimeTrackerPunch, 
  computeLiveStatusFromLogs,
  NormalizedTimeTrackerLog 
} from '@/lib/timeTrackerDb';
import { PunchLogItem } from '@/lib/punchLogs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId') || '1597';
    const date = searchParams.get('date');

    // Fetch real normalized rows directly from Supabase time_tracker_logs
    const dbLogs: NormalizedTimeTrackerLog[] = await getTimeTrackerLogsFromDb({
      empId: empId !== 'ALL' ? empId : undefined,
      date: date || undefined,
      limit: 5000,
    });

    const targetEmpId = empId && empId !== 'ALL' ? empId : '1597';
    const currentStatus = computeLiveStatusFromLogs(targetEmpId, dbLogs);

    const formattedList: PunchLogItem[] = dbLogs.map((log) => ({
      id: log.id,
      empId: log.employee_id,
      type: log.punch_type,
      timestamp: log.timestamp,
      duration: log.duration,
      status: (log.status as any) || 'On Time',
      overDuration: null,
    }));

    // Build audit history directly from real rows
    const auditHistory = dbLogs
      .filter((l) => l.employee_id === String(targetEmpId))
      .slice(0, 8)
      .map((l) => ({
        id: l.id,
        action: l.punch_type,
        time: l.parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: l.parsedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        status: l.status,
      }));

    return NextResponse.json({
      success: true,
      data: formattedList,
      total: formattedList.length,
      currentStatus,
      auditHistory,
    });
  } catch (err: any) {
    console.error('Error in GET /api/punch-logs:', err);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId, type, status, duration } = body;

    if (!empId || !type) {
      return NextResponse.json({ error: 'empId and type are required' }, { status: 400 });
    }

    // Insert directly into Supabase table time_tracker_logs
    const inserted = await insertTimeTrackerPunch({
      empId,
      punchType: type,
      status: status || 'On Time',
      duration: duration || 'N/A',
    });

    // Fetch fresh logs to recompute state
    const freshLogs = await getTimeTrackerLogsFromDb({ empId: String(empId), limit: 100 });
    const currentStatus = computeLiveStatusFromLogs(String(empId), freshLogs);

    return NextResponse.json(
      {
        success: true,
        data: inserted,
        currentStatus,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error in POST /api/punch-logs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
