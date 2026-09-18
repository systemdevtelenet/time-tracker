import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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
    const finalAvatar = empRecord?.avatar_url || trainerRecord?.profile_pic || rosterMatch?.avatar_url || null;

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

    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
