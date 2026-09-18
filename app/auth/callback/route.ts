import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const AUTHORIZED_DOMAINS = [
  '@cebutelenet.com',
  '@cebutele-net.com',
  '@cebutele-net.ph',
  '.telenet@gmail.com',
  'telenet@gmail.com',
  '@gmail.com',
];

function isAuthorizedDomain(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return AUTHORIZED_DOMAINS.some((domain) => lower.endsWith(domain));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZG1zbXdyc2t4b3d2eXRlZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mzg3MDEsImV4cCI6MjEwMzQxNDcwMX0.jEfT-8dwK1tp3fuQW9ypTObVNc0a6EjgvfgKJhzg70o';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData?.user?.email) {
      console.error('OAuth exchange error:', sessionError);
      return NextResponse.redirect(`${origin}/login?error=not_authorized`);
    }

    const email = sessionData.user.email.toLowerCase().trim();

    // 1. SSO Domain Check
    if (!isAuthorizedDomain(email)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`);
    }

    // 2. System Authorization / Roster Verification
    const admin = getSupabaseAdmin();
    let isAuthorized = false;

    // Check user_roles table
    try {
      const { data: roleData } = await admin
        .from('user_roles')
        .select('id, role')
        .eq('email', email)
        .limit(1);
      if (roleData && roleData.length > 0) isAuthorized = true;
    } catch (e) {
      // Table may not exist yet
    }

    // Check trainers_profile table
    if (!isAuthorized) {
      try {
        const { data: trainerData } = await admin
          .from('trainers_profile')
          .select('id')
          .eq('email', email)
          .limit(1);
        if (trainerData && trainerData.length > 0) isAuthorized = true;
      } catch (e) {
        // Ignore
      }
    }

    // Check employees table or team_roster table
    if (!isAuthorized) {
      try {
        const { data: empData } = await admin
          .from('employees')
          .select('id, status_id')
          .eq('email', email)
          .limit(1);
        if (empData && empData.length > 0) {
          const emp = empData[0];
          if (emp.status_id === 1 || emp.status_id === undefined) {
            isAuthorized = true;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    if (!isAuthorized) {
      try {
        const { data: rosterData } = await admin
          .from('team_roster')
          .select('id, status')
          .eq('email', email)
          .limit(1);
        if (rosterData && rosterData.length > 0) {
          isAuthorized = true;
        }
      } catch (e) {
        // Ignore
      }
    }

    // Allow default company email accounts or verified admin
    if (email.endsWith('.telenet@gmail.com') || email === 'bcolonia.telenet@gmail.com' || email === 'nreguero.telenet@gmail.com') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=not_authorized`);
    }

    return NextResponse.redirect(`${origin}/?tab=dashboard`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }
}
