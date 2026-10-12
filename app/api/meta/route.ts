import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getTimeTrackerEmployeesFromDb } from '@/lib/timeTrackerDb';
import { getCachedData, setCachedData } from '@/lib/serverCache';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';

export const dynamic = 'force-dynamic';

const META_CACHE_KEY = 'api_meta_data_v3';
const META_CACHE_TTL_SECONDS = 300;

export async function GET(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const cached = getCachedData<any>(META_CACHE_KEY);
    if (cached) {
      const visible = access.canManageAttendance ? cached : {
        ...cached,
        employees: cached.employees.filter((employee: { employee_id?: string }) => employee.employee_id === access.employeeCode),
        roster: cached.roster.filter((employee: { employee_id?: string }) => employee.employee_id === access.employeeCode),
      };
      return NextResponse.json(visible, {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    const supabase = getSupabaseAdmin();
    const [employees, accountsResult, positionsResult] = await Promise.all([
      getTimeTrackerEmployeesFromDb(),
      supabase.from('accounts')
        .select('account_id, account_code, account_name')
        .eq('is_active', true)
        .order('account_code'),
      supabase.from('positions')
        .select('position_id, position_code, position_name')
        .order('position_name'),
    ]);

    if (accountsResult.error) throw accountsResult.error;
    if (positionsResult.error) throw positionsResult.error;

    const result = {
      accounts: accountsResult.data || [],
      positions: positionsResult.data || [],
      employees,
      roster: employees,
    };

    setCachedData(META_CACHE_KEY, result, META_CACHE_TTL_SECONDS);
    const visible = access.canManageAttendance ? result : {
      ...result,
      employees: result.employees.filter((employee) => employee.employee_id === access.employeeCode),
      roster: result.roster.filter((employee) => employee.employee_id === access.employeeCode),
    };
    return NextResponse.json(visible, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching employee metadata:', error);
    return NextResponse.json({ error: 'Unable to load employee metadata.' }, { status: 500 });
  }
}
