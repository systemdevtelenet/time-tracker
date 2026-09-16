import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { 
  INITIAL_PUNCH_LOGS, 
  PunchLogItem, 
  computeEmployeePunchStatus, 
  computeShiftMilestonesAndAudit,
  getEmployeePunches 
} from '@/lib/punchLogs';

export const dynamic = 'force-dynamic';

// In-memory runtime cache for seamless live punch actions across turns
let memoryPunches: PunchLogItem[] = [...INITIAL_PUNCH_LOGS];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId') || '1597';
    const date = searchParams.get('date');

    // 1. Try fetching from Supabase table attendance_logs if available
    let dbPunches: PunchLogItem[] | null = null;
    try {
      const supabase = getSupabaseAdmin();
      let query = supabase.from('attendance_logs').select('*').order('created_at', { ascending: false });
      if (empId && empId !== 'ALL') {
        query = query.eq('employee_id', empId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        dbPunches = data.map((d: any) => ({
          id: String(d.id),
          empId: String(d.employee_id),
          type: d.status || d.type || 'Punch',
          timestamp: d.created_at || d.attendance_date,
          duration: d.duration || 'N/A',
          status: 'On Time',
          overDuration: null
        }));
      }
    } catch (dbErr) {
      // Fallback to memoryPunches
    }

    const sourceList = dbPunches && dbPunches.length > 0 ? [...dbPunches, ...memoryPunches] : memoryPunches;

    // Filter by empId if provided
    let filtered = sourceList;
    if (empId && empId !== 'ALL') {
      filtered = filtered.filter(p => String(p.empId) === String(empId));
    }
    if (date) {
      filtered = filtered.filter(p => p.timestamp.includes(date));
    }

    // Compute status, milestones and audit history for the active employee
    const targetEmpId = empId && empId !== 'ALL' ? empId : '1597';
    const computedStatus = computeEmployeePunchStatus(targetEmpId, sourceList);
    const { milestones, auditHistory } = computeShiftMilestonesAndAudit(targetEmpId, sourceList);

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
      currentStatus: computedStatus,
      milestones,
      auditHistory,
    });
  } catch (err: any) {
    console.error('Error in GET /api/punch-logs:', err);
    return NextResponse.json({ error: err.message, data: memoryPunches }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId, type, status, duration } = body;

    if (!empId || !type) {
      return NextResponse.json({ error: 'empId and type are required' }, { status: 400 });
    }

    const now = new Date();
    // Format timestamp like "9/17/2026 3:52:51"
    const timestampStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newPunch: PunchLogItem = {
      id: `punch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      empId: String(empId),
      type,
      timestamp: timestampStr,
      duration: duration || 'N/A',
      status: status || 'On Time',
      overDuration: body.overDuration || null,
    };

    // Prepend to in-memory punches
    memoryPunches = [newPunch, ...memoryPunches];

    // Also attempt to save to Supabase attendance_logs
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('attendance_logs').insert([
        {
          employee_id: empId,
          attendance_date: now.toISOString().split('T')[0],
          status: type,
          created_at: now.toISOString(),
        }
      ]);
    } catch (insertErr) {
      // non-blocking
    }

    const updatedStatus = computeEmployeePunchStatus(String(empId), memoryPunches);
    const { milestones, auditHistory } = computeShiftMilestonesAndAudit(String(empId), memoryPunches);

    return NextResponse.json({ 
      success: true, 
      data: newPunch,
      currentStatus: updatedStatus,
      milestones,
      auditHistory,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/punch-logs:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
