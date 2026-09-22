import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { INITIAL_TEAM_ROSTER } from '@/lib/teamRoster';
import { getTimeTrackerEmployeesFromDb } from '@/lib/timeTrackerDb';
import { getCachedData, setCachedData } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

const META_CACHE_KEY = 'api_meta_data';
const META_CACHE_TTL_SECONDS = 300; // 5 minutes

export async function GET() {
  try {
    // Check in-memory cache
    const cached = getCachedData<any>(META_CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    const supabase = getSupabaseAdmin();

    // Fetch accounts
    const { data: accountsData } = await supabase
      .from('accounts')
      .select('account_id, account_code, account_name')
      .order('account_code');

    // 1. Fetch from time_tracker_employees (or team_roster fallback)
    const employees = await getTimeTrackerEmployeesFromDb();

    const finalEmployees = employees.length > 0 ? employees : INITIAL_TEAM_ROSTER.map((m) => ({
      id: m.employee_id,
      name: m.name,
      email: `${m.name.toLowerCase().replace(/\s+/g, '.')}@cebutele-net.ph`,
      role: m.position || m.role || 'Agent',
      userRole: m.role || 'User',
      position: m.position || 'Agent',
      shift: m.shift,
      shift_type: m.shift_type,
      account: m.account,
      supervisor: m.supervisor,
      department: m.department,
      hire_date: m.hire_date,
      tenure: m.tenure,
      traffic_light_status: m.traffic_light_status,
    }));

    // Fallback accounts if empty
    const accounts = accountsData && accountsData.length > 0 
      ? accountsData 
      : [
          { account_id: 1, account_code: 'DFT', account_name: 'DFT' },
          { account_id: 2, account_code: 'RM', account_name: 'RM' },
          { account_id: 3, account_code: 'BF', account_name: 'BF' },
          { account_id: 4, account_code: 'XPN', account_name: 'XPN' },
          { account_id: 5, account_code: 'JS', account_name: 'JS' },
          { account_id: 6, account_code: 'FLEET', account_name: 'FLEET' },
          { account_id: 7, account_code: 'HH', account_name: 'HH' },
        ];

    const result = {
      accounts,
      employees: finalEmployees,
      roster: finalEmployees,
    };

    setCachedData(META_CACHE_KEY, result, META_CACHE_TTL_SECONDS);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: any) {
    console.error('Error fetching meta info:', err);
    return NextResponse.json(
      {
        accounts: [
          { account_id: 1, account_code: 'DFT', account_name: 'DFT' },
          { account_id: 2, account_code: 'RM', account_name: 'RM' },
          { account_id: 3, account_code: 'BF', account_name: 'BF' },
          { account_id: 4, account_code: 'XPN', account_name: 'XPN' },
        ],
        employees: [],
      },
      { status: 200 }
    );
  }
}
