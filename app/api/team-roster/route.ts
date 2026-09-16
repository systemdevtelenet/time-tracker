import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('team_roster')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching team_roster from Supabase:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0,
    });
  } catch (err: any) {
    console.error('Server error in GET /api/team-roster:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
