import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PhoneTimeRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const agent = searchParams.get('agent');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    let query = supabase
      .from('phone_time_tracker')
      .select('*')
      .order('date_of_shift', { ascending: false })
      .limit(limit);

    if (account && account !== 'ALL') {
      query = query.eq('account', account);
    }
    if (agent && agent !== 'ALL') {
      query = query.ilike('name', `%${agent}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error (phone_time_tracker):', error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('API Error in GET /api/time-entries:', err);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PhoneTimeRecord = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    // Insert into phone_time_tracker table
    const { data, error } = await supabase
      .from('phone_time_tracker')
      .insert([
        {
          date_of_shift: body.date_of_shift,
          name: body.name,
          account: body.account,
          total_minutes: body.total_minutes,
          ticket_number: body.ticket_number,
          tagging: body.tagging,
          summary: body.summary,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error (phone_time_tracker):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data?.[0] || body }, { status: 201 });
  } catch (err: any) {
    console.error('API Error in POST /api/time-entries:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get('ticket_number');

    if (!ticketNumber) {
      return NextResponse.json({ error: 'Ticket number required for deletion' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('phone_time_tracker')
      .delete()
      .eq('ticket_number', ticketNumber);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error in DELETE /api/time-entries:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
