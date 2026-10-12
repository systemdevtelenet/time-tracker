import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { verifyAuthSession } from '@/lib/authSession';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type TaskStatus = 'todo' | 'inprogress' | 'done';
type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

const taskColors: Record<TaskPriority, string> = {
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
};

type FocusMode = 'focus' | 'short_break' | 'long_break';

function isFocusMode(value: unknown): value is FocusMode {
  return value === 'focus' || value === 'short_break' || value === 'long_break';
}

function mapFocusTimer(row: Record<string, any> | null) {
  if (!row) return { mode: 'focus', durationMinutes: 25, secondsRemaining: 1500, isActive: false, sessionToken: null };
  const elapsed = row.is_active && row.started_at
    ? Math.max(0, Math.floor((Date.now() - new Date(row.started_at).getTime()) / 1000))
    : 0;
  return {
    mode: row.timer_mode,
    durationMinutes: row.duration_minutes,
    secondsRemaining: Math.max(0, row.remaining_seconds - elapsed),
    isActive: Boolean(row.is_active),
    sessionToken: row.session_token,
  };
}

async function getActiveEmployee(request: NextRequest) {
  const session = verifyAuthSession(request.cookies.get('ctnp_session')?.value);
  if (!session) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const supabase = getSupabaseAdmin();
  const { data: employee, error } = await supabase
    .from('employees')
    .select('id, employee_name, employee_email, statuses(status_name)')
    .ilike('employee_email', session.email)
    .maybeSingle();

  const status = (employee?.statuses as { status_name?: string } | null)?.status_name;
  if (error || !employee || status?.toLowerCase() !== 'active') {
    return { response: NextResponse.json({ error: 'Active employee access is required.' }, { status: 403 }) };
  }

  return { supabase, employee };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function mapTask(row: Record<string, any>, employeeName: string) {
  const priority = (['HIGH', 'MEDIUM', 'LOW'].includes(row.priority) ? row.priority : 'MEDIUM') as TaskPriority;
  return {
    id: String(row.task_id),
    title: row.title,
    ticketCode: row.ticket_code || '',
    priority,
    status: row.status as TaskStatus,
    estimate: row.estimate || '',
    category: row.category || 'General',
    categoryColor: taskColors[priority],
    assignee: initials(employeeName),
    assigneeColor: 'bg-[#24537D]',
  };
}

function mapNote(row: Record<string, any>) {
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  return {
    id: String(row.note_id),
    title: row.title || '',
    content: row.content || '',
    color: metadata.color || 'blue',
    tag: metadata.tag || 'Late Arrival',
    isPinned: Boolean(metadata.isPinned),
    timestamp: row.created_at,
  };
}

function localToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    hydration: 'Hydration', mindfulness: 'Focus Breath', stretch: 'Ergonomics',
    tracker: 'Time Tracker', nutrition: 'Shift Fuel', walk: 'Active Rest', general: 'Daily Routine',
  };
  return labels[category] || 'Daily Routine';
}

function mapRoutine(row: Record<string, any>, completedDates: Set<string>, today: string) {
  const completedToday = completedDates.has(today);
  const cursor = new Date(`${completedToday ? today : addDays(today, -1)}T00:00:00Z`);
  let streak = 0;
  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    id: String(row.routine_id), name: row.name, category: row.category,
    categoryLabel: categoryLabel(row.category), duration: `${row.duration_minutes} min`,
    streak, completedToday, timeOfDay: row.time_of_day,
  };
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function isStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'inprogress' || value === 'done';
}

function isPriority(value: unknown): value is TaskPriority {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getActiveEmployee(request);
    if ('response' in auth) return auth.response;
    const { supabase, employee } = auth;

    const today = localToday();
    const [{ data: taskRows, error: taskError }, { data: noteRows, error: noteError }, { data: routineRows, error: routineError }, { data: completionRows, error: completionError }, { data: focusState, error: focusStateError }, { data: sessionRows, error: sessionsError }] = await Promise.all([
      supabase
        .from('time_tracker_tasks')
        .select('task_id, title, ticket_code, priority, status, estimate, category, created_at')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('time_tracker_notes')
        .select('note_id, note_type, title, content, metadata, created_at')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false }),
      supabase.from('time_tracker_routines')
        .select('routine_id, name, category, duration_minutes, time_of_day')
        .eq('employee_id', employee.id).eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('time_tracker_routine_completions')
        .select('routine_id, completed_on').eq('employee_id', employee.id)
        .gte('completed_on', addDays(today, -365)),
      supabase.from('time_tracker_focus_state').select('*').eq('employee_id', employee.id).maybeSingle(),
      supabase.from('time_tracker_focus_sessions').select('duration_minutes')
        .eq('employee_id', employee.id).eq('completed_on', today),
    ]);

    if (taskError || noteError || routineError || completionError || focusStateError || sessionsError) {
      console.error('Failed to load Flow Hub records:', taskError || noteError || routineError || completionError || focusStateError || sessionsError);
      return NextResponse.json({ error: 'Unable to load Flow Hub data.' }, { status: 500 });
    }

    const notes = noteRows || [];
    const mindDump = notes.find((note) => note.note_type === 'mind_dump');
    const shiftMemo = notes.find((note) => note.note_type === 'shift');

    return NextResponse.json({
      success: true,
      data: {
        tasks: (taskRows || []).map((task) => mapTask(task, employee.employee_name || '')),
        mindDump: { id: mindDump ? String(mindDump.note_id) : '', title: mindDump?.title || '', text: mindDump?.content || '' },
        shiftMemo: { id: shiftMemo ? String(shiftMemo.note_id) : '', title: shiftMemo?.title || '', text: shiftMemo?.content || '' },
        notes: notes.filter((note) => note.note_type === 'sticky').map(mapNote),
        habits: (routineRows || []).map((routine) => mapRoutine(
          routine,
          new Set((completionRows || []).filter((completion) => completion.routine_id === routine.routine_id).map((completion) => completion.completed_on)),
          today,
        )),
        sessions: sessionRows?.length || 0,
        sessionMinutes: (sessionRows || []).reduce((total, session) => total + session.duration_minutes, 0),
        focusTimer: mapFocusTimer(focusState),
      },
    });
  } catch (error) {
    console.error('Flow Hub read failed:', error);
    return NextResponse.json({ error: 'Unable to load Flow Hub data.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getActiveEmployee(request);
    if ('response' in auth) return auth.response;
    const { supabase, employee } = auth;
    const body = await request.json();
    const payload = body?.payload;

    if (body?.type === 'SAVE_FOCUS_TIMER') {
      const mode = payload?.mode;
      const durationMinutes = Number(payload?.durationMinutes);
      const secondsRemaining = Number(payload?.secondsRemaining);
      const isActive = payload?.isActive === true;
      if (!isFocusMode(mode) || !Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 240 || !Number.isInteger(secondsRemaining) || secondsRemaining < 0 || secondsRemaining > 86400) {
        return NextResponse.json({ error: 'The timer settings are invalid.' }, { status: 400 });
      }
      const { data: current, error: currentError } = await supabase.from('time_tracker_focus_state')
        .select('session_token, session_started_at').eq('employee_id', employee.id).maybeSingle();
      if (currentError) throw currentError;
      const clearSession = payload?.clearSession === true;
      const sessionToken = clearSession ? null : current?.session_token || null;
      const sessionStartedAt = clearSession ? null : current?.session_started_at || null;
      const { data, error } = await supabase.from('time_tracker_focus_state').upsert({
        employee_id: employee.id, timer_mode: mode, duration_minutes: durationMinutes,
        remaining_seconds: secondsRemaining, is_active: isActive,
        started_at: isActive ? new Date().toISOString() : null,
        session_token: isActive ? (sessionToken || randomUUID()) : sessionToken,
        session_started_at: isActive ? (sessionStartedAt || new Date().toISOString()) : sessionStartedAt,
        updated_at: new Date().toISOString(),
      }).select('*').single();
      if (error) throw error;
      return NextResponse.json({ success: true, focusTimer: mapFocusTimer(data) });
    }

    if (body?.type === 'START_FOCUS_TIMER' || body?.type === 'PAUSE_FOCUS_TIMER') {
      const { data: current, error: currentError } = await supabase.from('time_tracker_focus_state')
        .select('*').eq('employee_id', employee.id).maybeSingle();
      if (currentError) throw currentError;
      const state = current || {
        timer_mode: 'focus', duration_minutes: 25, remaining_seconds: 1500,
        is_active: false, started_at: null, session_token: null, session_started_at: null,
      };
      let next;
      if (body.type === 'START_FOCUS_TIMER') {
        next = state.is_active ? state : {
          ...state, is_active: true,
          remaining_seconds: state.remaining_seconds > 0 ? state.remaining_seconds : state.duration_minutes * 60,
          started_at: new Date().toISOString(),
          session_token: state.session_token || randomUUID(),
          session_started_at: state.session_started_at || new Date().toISOString(),
        };
      } else {
        const elapsed = state.is_active && state.started_at
          ? Math.max(0, Math.floor((Date.now() - new Date(state.started_at).getTime()) / 1000)) : 0;
        next = {
          ...state, is_active: false, started_at: null,
          remaining_seconds: Math.max(0, state.remaining_seconds - elapsed),
        };
      }
      const { data, error } = await supabase.from('time_tracker_focus_state').upsert({
        employee_id: employee.id, timer_mode: next.timer_mode, duration_minutes: next.duration_minutes,
        remaining_seconds: next.remaining_seconds, is_active: next.is_active,
        started_at: next.started_at, session_token: next.session_token, updated_at: new Date().toISOString(),
        session_started_at: next.session_started_at,
      }).select('*').single();
      if (error) throw error;
      return NextResponse.json({ success: true, focusTimer: mapFocusTimer(data) });
    }

    if (body?.type === 'COMPLETE_FOCUS_TIMER') {
      const { data: current, error: currentError } = await supabase.from('time_tracker_focus_state')
        .select('*').eq('employee_id', employee.id).maybeSingle();
      if (currentError) throw currentError;
      if (!current?.is_active || !payload?.sessionToken || current.session_token !== payload.sessionToken) {
        return NextResponse.json({ error: 'This timer session is no longer active.' }, { status: 409 });
      }
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(current.started_at).getTime()) / 1000));
      if (elapsed < current.remaining_seconds) {
        return NextResponse.json({ error: 'The timer has not finished yet.' }, { status: 409 });
      }
      if (current.timer_mode === 'focus') {
        const { error } = await supabase.from('time_tracker_focus_sessions').upsert({
          employee_id: employee.id, session_token: current.session_token, timer_mode: 'focus',
          duration_minutes: current.duration_minutes, started_at: current.session_started_at || current.started_at,
          ended_at: new Date().toISOString(), completed_on: localToday(),
        }, { onConflict: 'session_token', ignoreDuplicates: true });
        if (error) throw error;
      }
      const { data, error } = await supabase.from('time_tracker_focus_state').update({
        is_active: false, started_at: null, remaining_seconds: 0, session_token: null,
        session_started_at: null, updated_at: new Date().toISOString(),
      }).eq('employee_id', employee.id).eq('session_token', current.session_token).select('*').single();
      if (error) throw error;
      const { data: sessionRows, error: countError } = await supabase.from('time_tracker_focus_sessions')
        .select('duration_minutes').eq('employee_id', employee.id).eq('completed_on', localToday());
      if (countError) throw countError;
      return NextResponse.json({
        success: true, sessions: sessionRows?.length || 0,
        sessionMinutes: (sessionRows || []).reduce((total, session) => total + session.duration_minutes, 0),
        focusTimer: mapFocusTimer(data),
      });
    }
    if (body?.type === 'ADD_HABIT' && payload) {
      const name = typeof payload.name === 'string' ? payload.name.trim() : '';
      const categories = ['hydration', 'mindfulness', 'stretch', 'tracker', 'nutrition', 'walk', 'general'];
      const duration = typeof payload.duration === 'string' ? Number.parseInt(payload.duration, 10) : 10;
      const timeOfDay = typeof payload.timeOfDay === 'string' ? payload.timeOfDay.trim() : 'Daily Routine';
      if (!name || name.length > 200 || !categories.includes(payload.category) || !Number.isInteger(duration) || duration < 1 || duration > 1440 || timeOfDay.length > 100) {
        return NextResponse.json({ error: 'Please provide valid routine details.' }, { status: 400 });
      }
      const { data, error } = await supabase.from('time_tracker_routines').insert({
        employee_id: employee.id, name, category: payload.category, duration_minutes: duration, time_of_day: timeOfDay || 'Daily Routine',
      }).select('routine_id, name, category, duration_minutes, time_of_day').single();
      if (error) throw error;
      return NextResponse.json({ success: true, habit: mapRoutine(data, new Set(), localToday()) });
    }
    if (body?.type === 'TOGGLE_HABIT' && payload?.id) {
      const routineId = Number(payload.id);
      if (!Number.isSafeInteger(routineId) || routineId < 1) return NextResponse.json({ error: 'A valid routine is required.' }, { status: 400 });
      const today = localToday();
      const { data: existing, error: lookupError } = await supabase.from('time_tracker_routine_completions')
        .select('completion_id').eq('routine_id', routineId).eq('employee_id', employee.id).eq('completed_on', today).maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) {
        const { error } = await supabase.from('time_tracker_routine_completions').delete()
          .eq('completion_id', existing.completion_id).eq('employee_id', employee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('time_tracker_routine_completions').insert({ routine_id: routineId, employee_id: employee.id, completed_on: today });
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }
    if (body?.type === 'DELETE_HABIT' && payload?.id) {
      const routineId = Number(payload.id);
      if (!Number.isSafeInteger(routineId) || routineId < 1) return NextResponse.json({ error: 'A valid routine is required.' }, { status: 400 });
      const { data, error } = await supabase.from('time_tracker_routines').delete()
        .eq('routine_id', routineId).eq('employee_id', employee.id).select('routine_id').maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Routine not found.' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (body?.type === 'ADD_TASK') {
      const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
      if (!title || title.length > 500 || !isPriority(payload.priority) || !isStatus(payload.status)) {
        return NextResponse.json({ error: 'A task title, valid priority, and status are required.' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('time_tracker_tasks')
        .insert({
          employee_id: employee.id,
          title,
          ticket_code: typeof payload.ticketCode === 'string' ? payload.ticketCode.trim() || null : null,
          priority: payload.priority,
          status: payload.status,
          estimate: typeof payload.estimate === 'string' ? payload.estimate.trim() || null : null,
          category: typeof payload.category === 'string' ? payload.category.trim() || 'General' : 'General',
        })
        .select('task_id, title, ticket_code, priority, status, estimate, category')
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, task: mapTask(data, employee.employee_name || '') });
    }

    if (body?.type === 'UPDATE_TASK') {
      const taskId = Number(payload?.id);
      const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
      if (!Number.isSafeInteger(taskId) || taskId < 1 || !title || title.length > 500 || !isPriority(payload.priority) || !isStatus(payload.status)) {
        return NextResponse.json({ error: 'The task update is invalid.' }, { status: 400 });
      }

      const { data: updatedTask, error } = await supabase
        .from('time_tracker_tasks')
        .update({
          title,
          ticket_code: typeof payload.ticketCode === 'string' ? payload.ticketCode.trim() || null : null,
          priority: payload.priority,
          status: payload.status,
          estimate: typeof payload.estimate === 'string' ? payload.estimate.trim() || null : null,
          category: typeof payload.category === 'string' ? payload.category.trim() || 'General' : 'General',
          updated_at: new Date().toISOString(),
        })
        .eq('task_id', taskId)
        .eq('employee_id', employee.id)
        .select('task_id')
        .maybeSingle();

      if (error) throw error;
      if (!updatedTask) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (body?.type === 'UPDATE_TASKS') {
      if (!Array.isArray(payload)) return NextResponse.json({ error: 'Task updates must be a list.' }, { status: 400 });
      const groups = new Map<TaskStatus, number[]>();
      for (const task of payload) {
        const id = Number(task?.id);
        if (!Number.isSafeInteger(id) || id < 1 || !isStatus(task?.status)) continue;
        groups.set(task.status, [...(groups.get(task.status) || []), id]);
      }

      for (const [status, ids] of groups) {
        const { error } = await supabase
          .from('time_tracker_tasks')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('employee_id', employee.id)
          .in('task_id', ids);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (body?.type === 'DELETE_TASK') {
      const taskId = Number(payload?.id);
      if (!Number.isSafeInteger(taskId) || taskId < 1) return NextResponse.json({ error: 'A valid task ID is required.' }, { status: 400 });
      const { data: deletedTask, error } = await supabase
        .from('time_tracker_tasks')
        .delete()
        .eq('task_id', taskId)
        .eq('employee_id', employee.id)
        .select('task_id')
        .maybeSingle();
      if (error) throw error;
      if (!deletedTask) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (body?.type === 'ADD_NOTE') {
      const title = typeof payload?.title === 'string' ? payload.title.trim().slice(0, 200) : '';
      const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
      const color = ['blue', 'yellow', 'green', 'rose'].includes(payload?.color) ? payload.color : 'blue';
      const allowedTags = ['Late Arrival', 'Meal Coverage', 'Shift Swap', 'Overtime Flag', 'Missing Punch', 'Approved Leave'];
      const tag = allowedTags.includes(payload?.tag) ? payload.tag : 'Late Arrival';
      if (!title || !content || content.length > 100_000) {
        return NextResponse.json({ error: 'A note title and content are required.' }, { status: 400 });
      }

      const { data, error } = await supabase.from('time_tracker_notes').insert({
        employee_id: employee.id,
        note_type: 'sticky',
        title,
        content,
        metadata: { color, tag, isPinned: false },
      }).select('note_id, note_type, title, content, metadata, created_at').single();
      if (error) throw error;
      return NextResponse.json({ success: true, note: mapNote(data) });
    }

    if (body?.type === 'UPDATE_NOTE') {
      const noteId = Number(payload?.id);
      if (!Number.isSafeInteger(noteId) || noteId < 1 || typeof payload?.isPinned !== 'boolean') {
        return NextResponse.json({ error: 'The note update is invalid.' }, { status: 400 });
      }
      const { data: note, error: lookupError } = await supabase.from('time_tracker_notes')
        .select('metadata').eq('note_id', noteId).eq('employee_id', employee.id).eq('note_type', 'sticky').maybeSingle();
      if (lookupError) throw lookupError;
      if (!note) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });

      const { error } = await supabase.from('time_tracker_notes').update({
        metadata: { ...(note.metadata || {}), isPinned: payload.isPinned },
        updated_at: new Date().toISOString(),
      }).eq('note_id', noteId).eq('employee_id', employee.id).eq('note_type', 'sticky');
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (body?.type === 'DELETE_NOTE') {
      const noteId = Number(payload?.id);
      if (!Number.isSafeInteger(noteId) || noteId < 1) return NextResponse.json({ error: 'A valid note ID is required.' }, { status: 400 });
      const { data, error } = await supabase.from('time_tracker_notes').delete()
        .eq('note_id', noteId).eq('employee_id', employee.id).select('note_id').maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (body?.type === 'SAVE_MIND_DUMP' || body?.type === 'SAVE_SHIFT_MEMO') {
      const noteType = body.type === 'SAVE_SHIFT_MEMO' ? 'shift' : 'mind_dump';
      const title = typeof payload?.title === 'string' ? payload.title.trim().slice(0, 200) : '';
      const content = typeof payload?.text === 'string' ? payload.text : '';
      if (content.length > 100_000) return NextResponse.json({ error: 'The note is too long.' }, { status: 400 });

      const requestedId = Number(payload?.noteId);
      let existing = null;
      if (Number.isSafeInteger(requestedId) && requestedId > 0) {
        const { data, error } = await supabase.from('time_tracker_notes').select('note_id')
          .eq('note_id', requestedId).eq('employee_id', employee.id).eq('note_type', noteType).maybeSingle();
        if (error) throw error;
        existing = data;
      }
      if (!existing) {
        const { data, error } = await supabase.from('time_tracker_notes').select('note_id')
          .eq('employee_id', employee.id).eq('note_type', noteType).order('created_at').limit(1).maybeSingle();
        if (error) throw error;
        existing = data;
      }

      if (existing) {
        const { data, error } = await supabase.from('time_tracker_notes').update({
          title: title || 'Notes', content, updated_at: new Date().toISOString(),
        }).eq('note_id', existing.note_id).eq('employee_id', employee.id).select('note_id').single();
        if (error) throw error;
        return NextResponse.json({ success: true, noteId: String(data.note_id) });
      }

      const { data, error } = await supabase.from('time_tracker_notes').insert({
        employee_id: employee.id, note_type: noteType, title: title || 'Notes', content,
      }).select('note_id').single();
      if (error) throw error;
      return NextResponse.json({ success: true, noteId: String(data.note_id) });
    }

    return NextResponse.json({ error: 'Unsupported Flow Hub action.' }, { status: 400 });
  } catch (error) {
    console.error('Flow Hub write failed:', error);
    return NextResponse.json({ error: 'Unable to save the Flow Hub change.' }, { status: 500 });
  }
}
