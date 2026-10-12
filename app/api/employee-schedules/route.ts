import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';
import { formatShiftRange } from '@/lib/shiftSchedule';

export const dynamic = 'force-dynamic';

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: NextRequest) {
  const access = await getActiveEmployeeAccess(request);
  if (!access) return NextResponse.json({ error: 'Please sign in with an active employee account.' }, { status: 401 });
  if (!access.canManageAttendance) {
    return NextResponse.json({ error: 'Only attendance managers can assign work schedules.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const employeeCode = String(body.employee_code || '').trim();
    const shiftStart = String(body.shift_start || '').trim();
    const shiftEnd = String(body.shift_end || '').trim();
    const shiftType = String(body.shift_type || '').trim();

    if (!employeeCode || !TIME_PATTERN.test(shiftStart) || !TIME_PATTERN.test(shiftEnd) || shiftStart === shiftEnd) {
      return NextResponse.json({ error: 'Enter a valid employee and different start and end times.' }, { status: 400 });
    }
    if (shiftType.length > 80) {
      return NextResponse.json({ error: 'Shift label must be 80 characters or fewer.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: target, error: employeeError } = await supabase
      .from('employees')
      .select('id, statuses(status_name)')
      .eq('employee_code', employeeCode)
      .maybeSingle();
    if (employeeError) throw employeeError;
    if (!target || (target.statuses as { status_name?: string } | null)?.status_name?.toLowerCase() !== 'active') {
      return NextResponse.json({ error: 'That active employee could not be found.' }, { status: 404 });
    }

    const { data: schedule, error: scheduleError } = await supabase.rpc('assign_employee_work_schedule', {
      p_employee_id: target.id,
      p_shift_start: `${shiftStart}:00`,
      p_shift_end: `${shiftEnd}:00`,
      p_shift_type: shiftType,
      p_time_zone: 'Asia/Manila',
      p_created_by: access.id,
    });
    if (scheduleError) throw scheduleError;

    const savedSchedule = Array.isArray(schedule) ? schedule[0] : schedule;
    return NextResponse.json({
      success: true,
      data: {
        employee_code: employeeCode,
        shift: formatShiftRange(savedSchedule?.shift_start, savedSchedule?.shift_end),
        shift_type: savedSchedule?.shift_type || '',
        time_zone: savedSchedule?.time_zone || 'Asia/Manila',
      },
    });
  } catch (error) {
    console.error('Failed to assign employee work schedule:', error);
    return NextResponse.json({ error: 'Unable to save this work schedule.' }, { status: 500 });
  }
}
