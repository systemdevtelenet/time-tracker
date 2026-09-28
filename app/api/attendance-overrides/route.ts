import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Runtime store for attendance overrides & notes across the application
const attendanceOverridesStore: Record<string, string | null> = {};
const attendanceNotesStore: Record<string, string> = {};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      overrides: attendanceOverridesStore,
      notes: attendanceNotesStore,
    });
  } catch (err: any) {
    console.error('Server error in GET /api/attendance-overrides:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      empId, 
      employeeName, 
      year = 2026, 
      month = 8, 
      day, 
      status, 
      note, 
      performedBy = 'Supervisor',
      bulkOverrides,
      bulkNotes
    } = body;

    // Handle bulk sync from client if provided
    if (bulkOverrides && typeof bulkOverrides === 'object') {
      Object.assign(attendanceOverridesStore, bulkOverrides);
    }
    if (bulkNotes && typeof bulkNotes === 'object') {
      Object.assign(attendanceNotesStore, bulkNotes);
    }

    // Handle single cell update
    if (day !== undefined) {
      const cleanEmpId = String(empId || '').replace(/^emp-/, '').trim();
      const normName = String(employeeName || '').trim();

      const keys: string[] = [];
      if (cleanEmpId) {
        keys.push(`${cleanEmpId}-${year}-${month}-${day}`);
        keys.push(`${cleanEmpId}-${day}`);
      }
      if (normName) {
        keys.push(`${normName}-${year}-${month}-${day}`);
        keys.push(`${normName.toLowerCase()}-${year}-${month}-${day}`);
        keys.push(`${normName}-${day}`);
        keys.push(`${normName.toLowerCase()}-${day}`);
      }

      keys.forEach((k) => {
        attendanceOverridesStore[k] = status ?? null;
        if (note !== undefined) {
          attendanceNotesStore[k] = note;
        }
      });
    }

    return NextResponse.json({
      success: true,
      overrides: attendanceOverridesStore,
      notes: attendanceNotesStore,
    });
  } catch (err: any) {
    console.error('Server error in POST /api/attendance-overrides:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
