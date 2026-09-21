import { NextRequest, NextResponse } from 'next/server';
import { getTimeTrackerEmployeesFromDb } from '@/lib/timeTrackerDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const employees = await getTimeTrackerEmployeesFromDb();

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (err: any) {
    console.error('Server error in GET /api/team-roster:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
