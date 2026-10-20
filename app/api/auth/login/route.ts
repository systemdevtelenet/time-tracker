import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAuthSession } from '@/lib/authSession';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const loginAttemptsMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(key: string) {
  const now = Date.now();
  const record = loginAttemptsMap.get(key);
  if (!record || now > record.resetAt) {
    loginAttemptsMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remainingSecs: 0 };
  }
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingSecs: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count += 1;
  return { allowed: true, remainingSecs: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanEmail = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!cleanEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimitKey = `${clientIp}_${cleanEmail}`;
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `Too many login attempts. Try again in ${rateLimit.remainingSecs} seconds.`,
        retryAfter: rateLimit.remainingSecs,
      }, { status: 429 });
    }

    const admin = getSupabaseAdmin();
    const { data: employee, error: employeeError } = await admin
      .from('employees')
      .select('id, employee_code, employee_name, employee_email, password_hash, status_id, role_id, position_id, avatar_url, hire_date, statuses(status_name), roles(role_name), positions(position_name)')
      .ilike('employee_email', cleanEmail)
      .maybeSingle();

    if (employeeError) {
      console.error('Employee lookup failed:', employeeError);
      return NextResponse.json({ error: 'Unable to verify your account right now.' }, { status: 500 });
    }

    const status = (employee?.statuses as { status_name?: string } | null)?.status_name;
    if (!employee || status?.toLowerCase() !== 'active') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const role = (employee.roles as { role_name?: string } | null)?.role_name || '';
    const position = (employee.positions as { position_name?: string } | null)?.position_name || '';
    const roleAndPosition = `${role} ${position}`.toLowerCase();
    const employeeCode = String(employee.employee_code || '').trim();
    const isCsa = /\bcsa\b/.test(roleAndPosition);
    const csaDefaultPasswordValid = Boolean(
      isCsa && employeeCode && password === `CTNP-${employeeCode}`
    );

    let passwordValid = false;
    if (employee.password_hash) {
      try {
        passwordValid = await bcrypt.compare(password, employee.password_hash);
      } catch (error) {
        console.error('Stored employee password hash is invalid:', error);
      }
    } else {
      // Some active employees have no HR password hash; accept only an existing
      // Supabase Auth credential for those accounts.
      const { data, error } = await admin.auth.signInWithPassword({ email: cleanEmail, password });
      passwordValid = !error && Boolean(data.user);
    }

    // Temporary CSA sign-in format: email + CTNP-<employee_code>.
    // Keep this scoped to active CSA employees with an employee code.
    passwordValid = passwordValid || csaDefaultPasswordValid;

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: assignments, error: assignmentError } = await admin
      .from('employee_assignments')
      .select('effective_from, effective_to, accounts(account_code, account_name, is_active)')
      .eq('employee_id', employee.id)
      .order('effective_from', { ascending: false });

    if (assignmentError) {
      console.error('Employee account lookup failed:', assignmentError);
    }

    const accountAssignment = assignments?.find((assignment) => {
      const startsAt = assignment.effective_from ? new Date(assignment.effective_from).getTime() : 0;
      const endsAt = assignment.effective_to ? new Date(assignment.effective_to).getTime() : Infinity;
      const account = assignment.accounts as { is_active?: boolean } | null;
      return startsAt <= Date.now() && endsAt >= Date.now() && account?.is_active !== false;
    });
    const account = accountAssignment?.accounts as {
      account_code?: string;
      account_name?: string;
    } | null;
    const employeeNumber = employee.employee_code || String(employee.id);
    const name = employee.employee_name || '';

    loginAttemptsMap.delete(rateLimitKey);
    const user = {
      id: employeeNumber,
      name,
      email: cleanEmail,
      role,
      position,
      account: account?.account_code || account?.account_name || '',
      hire_date: employee.hire_date,
      avatar_url: employee.avatar_url,
    };
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('ctnp_session', signAuthSession({
      id: employeeNumber,
      name,
      email: cleanEmail,
      role,
      position,
      loginAt: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'An unexpected authentication error occurred.' }, { status: 500 });
  }
}
