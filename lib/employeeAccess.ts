import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyAuthSession } from '@/lib/authSession';

export interface ActiveEmployeeAccess {
  id: number;
  employeeCode: string;
  email: string;
  name: string;
  role: string;
  position: string;
  canManageAttendance: boolean;
}

export async function getActiveEmployeeAccess(request: NextRequest): Promise<ActiveEmployeeAccess | null> {
  const session = verifyAuthSession(request.cookies.get('ctnp_session')?.value);
  if (!session) return null;

  const { data, error } = await getSupabaseAdmin()
    .from('employees')
    .select('id, employee_code, employee_name, employee_email, statuses(status_name), roles(role_name), positions(position_name)')
    .ilike('employee_email', session.email)
    .maybeSingle();
  if (error || !data || (data.statuses as { status_name?: string } | null)?.status_name?.toLowerCase() !== 'active') return null;

  const role = (data.roles as { role_name?: string } | null)?.role_name || '';
  const position = (data.positions as { position_name?: string } | null)?.position_name || '';
  const roleLower = role.toLowerCase();
  const positionLower = position.toLowerCase();
  return {
    id: Number(data.id),
    employeeCode: String(data.employee_code || data.id),
    email: data.employee_email || session.email,
    name: data.employee_name || '',
    role,
    position,
    canManageAttendance: ['admin', 'superadmin'].includes(roleLower) ||
      ['head', 'supervisor', 'manager', 'administrator'].some((term) => positionLower.includes(term)),
  };
}
