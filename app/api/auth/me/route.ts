import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyAuthSession } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = verifyAuthSession(request.cookies.get('ctnp_session')?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = getSupabaseAdmin();
    const { data: employee, error } = await admin
      .from('employees')
      .select('id, employee_code, employee_name, employee_email, hire_date, avatar_url, statuses(status_name), roles(role_name), positions(position_name)')
      .ilike('employee_email', session.email)
      .maybeSingle();

    const status = (employee?.statuses as { status_name?: string } | null)?.status_name;
    const employeeCode = String(employee?.employee_code || '').trim();
    const employeeEmail = String(employee?.employee_email || '').trim().toLowerCase();
    if (
      error ||
      !employee ||
      status?.toLowerCase() !== 'active' ||
      !employeeCode ||
      !employeeEmail ||
      employeeEmail !== session.email.trim().toLowerCase()
    ) {
      const response = NextResponse.json({ error: 'Employee access is no longer active.' }, { status: 401 });
      response.cookies.delete('ctnp_session');
      return response;
    }

    const { data: schedules, error: scheduleError } = await admin
      .from('employee_work_schedules')
      .select('shift_start, shift_end, shift_type, time_zone, effective_from, effective_to')
      .eq('employee_id', employee.id)
      .eq('is_active', true)
      .order('effective_from', { ascending: false });
    if (scheduleError) throw scheduleError;
    const now = Date.now();
    const schedule = schedules?.find((item) => {
      const startsAt = item.effective_from ? new Date(item.effective_from).getTime() : 0;
      const endsAt = item.effective_to ? new Date(item.effective_to).getTime() : Infinity;
      return startsAt <= now && endsAt >= now;
    });
    const formatTime = (value?: string | null) => {
      if (!value) return '';
      const [hourRaw, minute = '00'] = value.slice(0, 5).split(':');
      const hour24 = Number(hourRaw);
      if (!Number.isInteger(hour24) || hour24 < 0 || hour24 > 23) return '';
      return `${hour24 % 12 || 12}:${minute} ${hour24 >= 12 ? 'PM' : 'AM'}`;
    };
    const shiftStart = formatTime(schedule?.shift_start);
    const shiftEnd = formatTime(schedule?.shift_end);

    const { data: assignments } = await admin
      .from('employee_assignments')
      .select('effective_from, effective_to, accounts(account_code, account_name, is_active)')
      .eq('employee_id', employee.id)
      .order('effective_from', { ascending: false });
    const currentAssignment = assignments?.find((assignment) => {
      const startsAt = assignment.effective_from ? new Date(assignment.effective_from).getTime() : 0;
      const endsAt = assignment.effective_to ? new Date(assignment.effective_to).getTime() : Infinity;
      const account = assignment.accounts as { is_active?: boolean } | null;
      return startsAt <= Date.now() && endsAt >= Date.now() && account?.is_active !== false;
    });
    const account = currentAssignment?.accounts as { account_code?: string; account_name?: string } | null;

    return NextResponse.json({
      user: {
        id: employeeCode,
        name: employee.employee_name || '',
        email: employee.employee_email || '',
        role: (employee.roles as { role_name?: string } | null)?.role_name || '',
        position: (employee.positions as { position_name?: string } | null)?.position_name || '',
        account: account?.account_code || account?.account_name || '',
        shift: shiftStart && shiftEnd ? `${shiftStart} – ${shiftEnd}` : '',
        shift_type: schedule?.shift_type || '',
        time_zone: schedule?.time_zone || '',
        hire_date: employee.hire_date,
        avatar_url: employee.avatar_url,
      },
    });
  } catch (error) {
    console.error('Failed to load authenticated employee:', error);
    return NextResponse.json({ error: 'Unable to load employee profile.' }, { status: 500 });
  }
}
