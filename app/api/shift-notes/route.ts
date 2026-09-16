import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Runtime store for shift notes per employee
const shiftNotesMap: Record<string, string> = {
  '1597': "Covered for Neil's lunch session. Completed Batch #12 quality calibration with 98.4% team adherence. All training logs synced.",
  '1108': "Weekly quality evaluations completed for Rocket Money wave 14. Calibration score 96.2%.",
  '1772': "Handled 4 phone coaching sessions. All agents completed refresher module on conflict resolution.",
  '2298': "End of day report submitted. Batch onboarding session concluded with 100% attendance.",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId') || '1597';

    const note = shiftNotesMap[empId] || "Document training milestones, coverage remarks, or handover notes for the incoming shift lead.";

    return NextResponse.json({
      success: true,
      empId,
      note,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId, note } = body;

    if (!empId) {
      return NextResponse.json({ error: 'empId is required' }, { status: 400 });
    }

    shiftNotesMap[empId] = note || '';

    return NextResponse.json({
      success: true,
      empId,
      note: shiftNotesMap[empId],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
