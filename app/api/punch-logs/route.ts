import { NextRequest, NextResponse } from 'next/server';
import {
  getTimeTrackerLogsFromDb,
  insertTimeTrackerPunch,
  deleteTimeTrackerPunchesForDay,
  computeLiveStatusFromLogs,
  NormalizedTimeTrackerLog,
  TIME_TRACKER_TIME_ZONE,
} from '@/lib/timeTrackerDb';
import { PunchActionType, PunchLogItem, computeShiftMilestonesAndAudit } from '@/lib/punchLogs';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';

export const dynamic = 'force-dynamic';

const PUNCH_ACTIONS: PunchActionType[] = [
  'Shift Start', 'Break 1 Start', 'Break 1 End', 'Start Lunch',
  'End Lunch', 'Break 2 Start', 'Break 2 End', 'Shift End',
];

function unauthorized() {
  return NextResponse.json({ error: 'Please sign in with an active employee account.' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  try {
    const employee = await getActiveEmployeeAccess(request);
    if (!employee) return unauthorized();

    const { searchParams } = new URL(request.url);
    const requestedEmpId = searchParams.get('empId');
    const date = searchParams.get('date');
    const calendarScope = searchParams.get('scope') === 'calendar';
    const canViewAll = calendarScope ? employee.isAdmin : employee.canManageAttendance;
    if (!canViewAll && requestedEmpId && requestedEmpId !== employee.employeeCode && requestedEmpId !== 'ALL') {
      return NextResponse.json({ error: 'You can only view your own punch history.' }, { status: 403 });
    }

    const viewAllEmployees = canViewAll && requestedEmpId === 'ALL';
    const targetEmpId = canViewAll && requestedEmpId && requestedEmpId !== 'ALL'
      ? requestedEmpId
      : employee.employeeCode;
    const dbLogs: NormalizedTimeTrackerLog[] = await getTimeTrackerLogsFromDb({
      empId: viewAllEmployees ? undefined : targetEmpId,
      date: date || undefined,
      limit: 5000,
    });

    const currentStatus = computeLiveStatusFromLogs(targetEmpId, dbLogs);
    const formattedList: PunchLogItem[] = dbLogs.map((log) => ({
      id: log.id,
      empId: log.employee_id,
      type: log.punch_type,
      // Return a timezone-qualified instant so browsers do not reinterpret
      // legacy database strings using the viewer's machine timezone.
      timestamp: log.parsedDate.toISOString(),
      duration: log.duration,
      status: log.status || 'On Time',
      overDuration: null,
    }));
    const { milestones, auditHistory: computedMilestoneAudit } = computeShiftMilestonesAndAudit(
      targetEmpId,
      formattedList.filter((log) => log.empId === targetEmpId)
    );
    const auditHistory = dbLogs
      .filter((log) => log.employee_id === targetEmpId)
      .slice(0, 8)
      .map((log) => ({
        id: log.id,
        action: log.punch_type,
        time: log.parsedDate.toLocaleTimeString('en-US', { timeZone: TIME_TRACKER_TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: log.parsedDate.toLocaleDateString('en-US', { timeZone: TIME_TRACKER_TIME_ZONE, month: 'short', day: 'numeric', year: 'numeric' }),
        status: log.status,
      }));

    return NextResponse.json({
      success: true,
      data: formattedList,
      total: formattedList.length,
      currentStatus,
      milestones,
      auditHistory: auditHistory.length > 0 ? auditHistory : computedMilestoneAudit,
    });
  } catch (err) {
    console.error('Error in GET /api/punch-logs:', err);
    return NextResponse.json({ error: 'Unable to load punch history.', data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const employee = await getActiveEmployeeAccess(request);
    if (!employee) return unauthorized();

    const body = await request.json();
    if (body.source === 'calendar' && !employee.isAdmin) {
      return NextResponse.json({ error: 'Only admins can edit calendar punches.' }, { status: 403 });
    }
    const requestedEmpId = String(body.empId || '');
    const type = String(body.type || '') as PunchActionType;
    if (!requestedEmpId || !PUNCH_ACTIONS.includes(type)) {
      return NextResponse.json({ error: 'A valid employee and punch action are required.' }, { status: 400 });
    }
    if (!employee.canManageAttendance && requestedEmpId !== employee.employeeCode) {
      return NextResponse.json({ error: 'You can only record your own punches.' }, { status: 403 });
    }

    const inserted = await insertTimeTrackerPunch({
      empId: requestedEmpId,
      punchType: type,
      status: employee.canManageAttendance ? (body.status || 'On Time') : 'On Time',
      duration: employee.canManageAttendance ? (body.duration || 'N/A') : 'N/A',
      timestamp: employee.canManageAttendance && body.timestamp ? String(body.timestamp) : undefined,
    });
    const freshLogs = await getTimeTrackerLogsFromDb({ empId: requestedEmpId, limit: 100 });
    return NextResponse.json({
      success: true,
      data: inserted,
      currentStatus: computeLiveStatusFromLogs(requestedEmpId, freshLogs),
    }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/punch-logs:', err);
    return NextResponse.json({ error: 'Unable to record this punch.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const employee = await getActiveEmployeeAccess(request);
    if (!employee) return unauthorized();
    const { searchParams } = new URL(request.url);
    const calendarScope = searchParams.get('scope') === 'calendar';
    if (calendarScope ? !employee.isAdmin : !employee.canManageAttendance) {
      return NextResponse.json({ error: 'Only attendance managers can clear punch records.' }, { status: 403 });
    }

    const empId = searchParams.get('empId');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const year = searchParams.get('year');
    if (!empId || month === null || day === null || year === null) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const result = await deleteTimeTrackerPunchesForDay(empId, Number(month), Number(day), Number(year));
    if (!result.success) return NextResponse.json({ error: 'Unable to clear punch records.' }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Punches cleared for day' });
  } catch (err) {
    console.error('Error in DELETE /api/punch-logs:', err);
    return NextResponse.json({ error: 'Unable to clear punch records.' }, { status: 500 });
  }
}
