import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { signAuthSession } from '@/lib/authSession';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(`${origin}/login?error=not_authorized`);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData?.user?.email) {
      console.error('OAuth exchange error:', sessionError);
      return NextResponse.redirect(`${origin}/login?error=not_authorized`);
    }

    const email = sessionData.user.email.toLowerCase().trim();

    // Access is granted only to active employees in the HR employees table.
    const admin = getSupabaseAdmin();
    const { data: employee, error: employeeError } = await admin
      .from('employees')
      .select('id, employee_code, employee_name, employee_email, status_id, statuses(status_name), roles(role_name), positions(position_name)')
      .ilike('employee_email', email)
      .maybeSingle();
    const status = (employee?.statuses as { status_name?: string } | null)?.status_name;

    if (employeeError || !employee || status?.toLowerCase() !== 'active') {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=not_authorized`);
    }

    const response = NextResponse.redirect(`${origin}/?tab=dashboard`);
    response.cookies.set('ctnp_session', signAuthSession({
      id: employee.employee_code || String(employee.id),
      name: employee.employee_name || '',
      email,
      role: (employee.roles as { role_name?: string } | null)?.role_name || '',
      position: (employee.positions as { position_name?: string } | null)?.position_name || '',
      loginAt: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }
}
