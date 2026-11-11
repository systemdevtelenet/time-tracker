import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getActiveEmployeeAccess } from '@/lib/employeeAccess';
import { PhoneTimeRecord } from '@/lib/types';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

const TIME_ENTRIES_CACHE_PREFIX = 'api_time_entries_';

export async function GET(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account') || 'ALL';
    const agent = searchParams.get('agent') || 'ALL';
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '1000', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 1000;

    const cacheKey = TIME_ENTRIES_CACHE_PREFIX + JSON.stringify([access.isAdmin ? 'ALL' : access.employeeCode, access.name, account, agent, limit]);
    const cached = getCachedData<{ data: PhoneTimeRecord[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'private, no-store',
          'X-Cache': 'HIT',
        },
      });
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('phone_time_tracker')
      .select('date_of_shift, name, account, total_minutes, ticket_number, tagging, summary')
      .order('date_of_shift', { ascending: false })
      .limit(limit);

    if (account && account !== 'ALL') {
      query = query.eq('account', account);
    }
    if (!access.isAdmin) {
      query = query.eq('name', access.name);
    } else if (agent && agent !== 'ALL') {
      query = query.ilike('name', `%${agent}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error (phone_time_tracker):', error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
    }

    const result = { data: data || [] };
    setCachedData(cacheKey, result, 30); // 30 seconds TTL

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: unknown) {
    console.error('API Error in GET /api/time-entries:', err);
    return NextResponse.json({ error: 'Unable to process time entries.', data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const body: PhoneTimeRecord | null = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A JSON object is required.' }, { status: 400 });
    }
    if (!access.isAdmin && body.name !== access.name) {
      return NextResponse.json({ error: 'You can only submit your own time entries.' }, { status: 403 });
    }
    const supabase = getSupabaseAdmin();

    if (typeof body.summary !== 'string' || !body.summary.trim()) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    if (['date_of_shift', 'name', 'account', 'total_minutes', 'ticket_number'].some((field) => {
      const value = body[field as keyof PhoneTimeRecord];
      return typeof value !== 'string' || !value.trim();
    })) {
      return NextResponse.json({ error: 'Date, name, account, duration, and ticket number are required.' }, { status: 400 });
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

    // Invalidate time-entries cache immediately on new entry
    invalidateCache(TIME_ENTRIES_CACHE_PREFIX);

    return NextResponse.json({ success: true, data: data?.[0] || body }, { status: 201 });
  } catch (err: unknown) {
    console.error('API Error in POST /api/time-entries:', err);
    return NextResponse.json({ error: 'Unable to process time entries.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await getActiveEmployeeAccess(request);
    if (!access) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get('ticket_number');

    if (!ticketNumber) {
      return NextResponse.json({ error: 'Ticket number required for deletion' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('phone_time_tracker')
      .delete()
      .eq('ticket_number', ticketNumber);
    if (!access.isAdmin) query = query.eq('name', access.name);
    const { error } = await query;

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate time-entries cache immediately on delete
    invalidateCache(TIME_ENTRIES_CACHE_PREFIX);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API Error in DELETE /api/time-entries:', err);
    return NextResponse.json({ error: 'Unable to process time entries.' }, { status: 500 });
  }
}
