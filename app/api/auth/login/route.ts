import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// In-memory sliding window rate limiter for login brute-force prevention
const loginAttemptsMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 60 seconds

function checkRateLimit(key: string): { allowed: boolean; remainingSecs: number } {
  const now = Date.now();
  const record = loginAttemptsMap.get(key);

  if (!record || now > record.resetAt) {
    loginAttemptsMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remainingSecs: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingSecs = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remainingSecs };
  }

  record.count += 1;
  return { allowed: true, remainingSecs: 0 };
}

function clearRateLimit(key: string) {
  loginAttemptsMap.delete(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Check server-side rate limit per email & IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimitKey = `${clientIp}_${cleanEmail}`;
    const rateLimitCheck = checkRateLimit(rateLimitKey);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Too many login attempts. Locked out for security. Try again in ${rateLimitCheck.remainingSecs} seconds.`,
          retryAfter: rateLimitCheck.remainingSecs
        },
        { status: 429 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Dynamic lookup in employees table
    const { data: emps } = await admin
      .from('employees')
      .select('*')
      .ilike('employee_email', cleanEmail);
    const empRecord = emps && emps.length > 0 ? emps[0] : null;

    // 2. Dynamic lookup in trainers_profile table
    const { data: trainers } = await admin
      .from('trainers_profile')
      .select('*')
      .or(`gmail_account.ilike.${cleanEmail},thunderbird_account.ilike.${cleanEmail}`);
    const trainerRecord = trainers && trainers.length > 0 ? trainers[0] : null;

    // 3. Dynamic lookup in user_roles table
    const { data: roles } = await admin
      .from('user_roles')
      .select('*')
      .ilike('email', cleanEmail);
    const roleRecord = roles && roles.length > 0 ? roles[0] : null;

    // 4. Dynamic lookup in team_roster table
    const { data: rosterData } = await admin
      .from('team_roster')
      .select('*');

    // Find dynamic employee identifier
    let empCode = empRecord?.employee_code || trainerRecord?.employee_num || null;

    // If not found yet, check if team_roster has matching record by email pattern or name
    let rosterMatch = null;
    if (empCode && rosterData) {
      rosterMatch = rosterData.find((r) => String(r.employee_id) === String(empCode));
    }

    if (!rosterMatch && rosterData) {
      // Try matching by email username or name in trainers/employees
      const emailUserPart = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
      rosterMatch = rosterData.find((r) => {
        const namePart = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return namePart.includes(emailUserPart) || emailUserPart.includes(namePart);
      });
      if (rosterMatch && !empCode) {
        empCode = rosterMatch.employee_id;
      }
    }

    // If still not identified in any DB table, return invalid
    if (!empCode && !rosterMatch && !empRecord && !trainerRecord) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const employeeNumber = empCode || rosterMatch?.employee_id || '';
    const expectedPassword = `CTNP-${employeeNumber}`;

    // Verify Password dynamically:
    // Format: 'CTNP-' + employee number (case-insensitive e.g. CTNP-1597 or ctnp-1597)
    // Also allow raw employee number or database stored password
    const isPasswordValid =
      cleanPassword.toUpperCase() === expectedPassword.toUpperCase() ||
      cleanPassword === employeeNumber ||
      (rosterMatch?.password && cleanPassword.toUpperCase() === rosterMatch.password.toUpperCase());

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Determine Role & Profile dynamically from database:
    // Nissi and all designated Admins receive full Admin role
    const isRoleAdmin =
      rosterMatch?.role?.toLowerCase() === 'admin' ||
      roleRecord?.role?.toLowerCase().includes('admin') ||
      roleRecord?.role === 'HOT_ADMIN' ||
      roleRecord?.role === 'SUPER_ADMIN' ||
      empRecord?.role_id === 9 ||
      trainerRecord?.position?.toLowerCase().includes('head of training') ||
      trainerRecord?.position?.toLowerCase().includes('admin');

    const finalRole = isRoleAdmin ? 'Admin' : (rosterMatch?.role || 'User');
    const finalPosition = rosterMatch?.position || trainerRecord?.position || 'Team Member';
    const finalName = rosterMatch?.name || trainerRecord?.name || empRecord?.employee_name || 'User';
    const finalShift = rosterMatch?.shift || '9:00 PM to 6:00 AM';
    const finalAccount = rosterMatch?.account || trainerRecord?.accounts || 'Corporate';
    const finalSupervisor = rosterMatch?.supervisor || 'June Babe Caballes';
    const finalTenure = rosterMatch?.tenure ? `${rosterMatch.tenure} mos` : '32 mos';
    const rawAvatar = empRecord?.avatar_url || trainerRecord?.profile_pic || rosterMatch?.avatar_url || null;
    const cleanAvatarStr = typeof rawAvatar === 'string' ? rawAvatar.trim() : null;
    const finalAvatar = cleanAvatarStr && !['none', 'null', 'n/a', 'undefined', 'false', '—'].includes(cleanAvatarStr.toLowerCase())
      ? cleanAvatarStr
      : null;

    // Synchronize / Upsert Supabase Auth user so standard Supabase sessions succeed
    try {
      const { data: usersList } = await admin.auth.admin.listUsers();
      const existingAuthUser = usersList?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );

      if (!existingAuthUser) {
        await admin.auth.admin.createUser({
          email: cleanEmail,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            name: finalName,
            role: finalRole,
            employee_id: employeeNumber,
            position: finalPosition,
          },
        });
      } else {
        await admin.auth.admin.updateUserById(existingAuthUser.id, {
          password: cleanPassword,
          user_metadata: {
            name: finalName,
            role: finalRole,
            employee_id: employeeNumber,
            position: finalPosition,
          },
        });
      }
    } catch (authSyncErr) {
      console.warn('Supabase Auth sync warning (proceeding):', authSyncErr);
    }

    // Clear any previous failed attempts upon successful login
    clearRateLimit(rateLimitKey);

    const sessionPayload = {
      id: employeeNumber,
      name: finalName,
      email: cleanEmail,
      role: finalRole,
      position: finalPosition,
      loginAt: Date.now(),
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: employeeNumber,
        name: finalName,
        email: cleanEmail,
        role: finalRole,
        position: finalPosition,
        shift: finalShift,
        account: finalAccount,
        tenure: finalTenure,
        directSupervisor: finalSupervisor,
        avatar_url: finalAvatar,
      },
    });

    // Set secure HttpOnly session cookie
    response.cookies.set('ctnp_session', JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
