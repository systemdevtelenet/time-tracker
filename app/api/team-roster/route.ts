import { NextRequest, NextResponse } from 'next/server';
import { getTimeTrackerEmployeesFromDb } from '@/lib/timeTrackerDb';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return NextResponse.json({ success: false, error: 'Please sign in to continue.' }, { status: 401 });
    const employees = await getTimeTrackerEmployeesFromDb();
    const visibleEmployees = access.canManageAttendance
      ? employees
      : employees.filter((employee) => employee.employee_id === access.employeeCode);

    return NextResponse.json({
      success: true,
      data: visibleEmployees,
      count: visibleEmployees.length,
    });
  } catch (err) {
    console.error('Server error in GET /api/team-roster:', err);
    return NextResponse.json({ success: false, error: 'Unable to load employee schedules.' }, { status: 500 });
  }
}
