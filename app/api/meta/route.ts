import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch accounts
    const { data: accountsData } = await supabase
      .from('accounts')
      .select('account_id, account_code, account_name')
      .order('account_code');

    // Fetch employees & trainers for agent selector
    const { data: employeesData } = await supabase
      .from('employees')
      .select('id, employee_name, employee_email')
      .limit(60);

    const { data: trainersData } = await supabase
      .from('trainers_profile')
      .select('name, position, gmail_account')
      .limit(30);

    const employees = [
      ...(employeesData || []).map((e) => ({
        id: e.id,
        name: e.employee_name,
        email: e.employee_email,
        role: 'Agent',
      })),
      ...(trainersData || []).map((t, idx) => ({
        id: `trainer-${idx}`,
        name: t.name,
        email: t.gmail_account,
        role: t.position || 'Trainer',
      })),
    ];

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

    return NextResponse.json({
      accounts,
      employees,
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
