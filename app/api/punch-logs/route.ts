import { NextRequest, NextResponse } from 'next/server';
import { 
  getTimeTrackerLogsFromDb, 
  insertTimeTrackerPunch, 
  deleteTimeTrackerPunchesForDay,
  computeLiveStatusFromLogs,
  NormalizedTimeTrackerLog 
} from '@/lib/timeTrackerDb';
import { PunchLogItem, computeShiftMilestonesAndAudit } from '@/lib/punchLogs';

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

    // Calculate dynamic shift milestones based on actual punches
    const { milestones, auditHistory: computedMilestoneAudit } = computeShiftMilestonesAndAudit(
      String(targetEmpId),
      formattedList
    );

    // Build audit history directly from real rows (or fallback to computed milestone audit)
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
      milestones,
      auditHistory: auditHistory.length > 0 ? auditHistory : computedMilestoneAudit,
    });
  } catch (err: any) {
    console.error('Error in GET /api/punch-logs:', err);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId, type, status, duration, timestamp } = body;

    if (!empId || !type) {
      return NextResponse.json({ error: 'empId and type are required' }, { status: 400 });
    }

    // Insert directly into Supabase table time_tracker_logs with accurate timestamp
    const inserted = await insertTimeTrackerPunch({
      empId,
      punchType: type,
      status: status || 'On Time',
      duration: duration || 'N/A',
      timestamp: timestamp || body.timestamp,
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const year = searchParams.get('year');

    if (empId && month !== null && day !== null && year !== null) {
      await deleteTimeTrackerPunchesForDay(empId, Number(month), Number(day), Number(year));
      return NextResponse.json({ success: true, message: 'Punches cleared for day' });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in DELETE /api/punch-logs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
