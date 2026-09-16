import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface FlowHubStore {
  tasks: any[];
  habits: any[];
  sessions: number;
  mindDump: {
    title: string;
    text: string;
  };
  stickies: any[];
  priorities: any[];
}

// Runtime database store populated with the user's initial state
const flowHubData: Record<string, FlowHubStore> = {
  '1597': {
    tasks: [
      {
        id: 't1788963795155',
        title: 'COVA Escalation - TM',
        ticketCode: '#17889',
        priority: 'MEDIUM',
        status: 'done',
        estimate: '2h',
        category: 'Escalation',
        categoryColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        assignee: 'NR',
        assigneeColor: 'bg-[#24537D]',
      },
      {
        id: 't1788963639603',
        title: 'Ms Cha schedule for CODI',
        ticketCode: '#17889',
        priority: 'HIGH',
        status: 'done',
        estimate: '4h',
        category: 'High Importance',
        categoryColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        assignee: 'MB',
        assigneeColor: 'bg-[#C29B38]',
      },
      {
        id: 't1788963617419',
        title: 'Coaching Evaluation - QA FRIA',
        ticketCode: '#17889',
        priority: 'HIGH',
        status: 'done',
        estimate: '1h',
        category: 'QA FRIA',
        categoryColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        assignee: 'JC',
        assigneeColor: 'bg-[#0E8A5E]',
      },
      {
        id: 't1788963601411',
        title: 'SL FORM - Matt Riner Balaba',
        ticketCode: '#17889',
        priority: 'HIGH',
        status: 'done',
        estimate: '2h',
        category: 'HR Form',
        categoryColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        assignee: 'EP',
        assigneeColor: 'bg-[#E82159]',
      },
    ],
    habits: [
      {
        id: 'h1',
        name: 'Drink a glass of water',
        category: 'hydration',
        categoryLabel: 'Hydration',
        duration: '5 min',
        streak: 5,
        completedToday: true,
        timeOfDay: 'Morning Shift',
      },
      {
        id: 'h2',
        name: 'Meditate to relax & mindful reset',
        category: 'mindfulness',
        categoryLabel: 'Focus Breath',
        duration: '15 min',
        streak: 8,
        completedToday: true,
        timeOfDay: 'Mid Shift',
      },
      {
        id: 'h3',
        name: 'Stretch for 10 minutes (Neck & Spine)',
        category: 'stretch',
        categoryLabel: 'Ergonomics',
        duration: '10 min',
        streak: 6,
        completedToday: false,
        timeOfDay: 'Desk Routine',
      },
      {
        id: 'h4',
        name: 'Reconcile call logs & phone times',
        category: 'tracker',
        categoryLabel: 'Time Tracker',
        duration: '15 min',
        streak: 14,
        completedToday: false,
        timeOfDay: 'Shift Review',
      },
      {
        id: 'h5',
        name: 'Healthy food & nourishment meal',
        category: 'nutrition',
        categoryLabel: 'Shift Fuel',
        duration: '30 min',
        streak: 7,
        completedToday: false,
        timeOfDay: 'Lunch Break',
      },
      {
        id: 'h6',
        name: 'Go for a short outdoor/step walk',
        category: 'walk',
        categoryLabel: 'Active Rest',
        duration: '15 min',
        streak: 4,
        completedToday: false,
        timeOfDay: 'Break Step',
      },
    ],
    sessions: 0,
    mindDump: {
      title: 'Salsile Project Brief',
      text: 'Salsile Inc. is a well-established fashion retailer specializing in high-quality clothing and accessories for men and women. The client is looking to revamp their existing e-commerce website to enhance user experience, improve overall aesthetics, and increase online sales. The new design should reflect their brand identity as a modern, and customer-centric fashion store.',
    },
    stickies: [
      {
        id: 's1',
        title: 'QA Escalation #17889',
        content: 'Call handling score issue on COVA simulation. Needs re-coaching before Friday certification.',
        color: 'rose',
        tag: 'Escalation',
        isPinned: true,
        timestamp: '02:15 AM',
      },
      {
        id: 's2',
        title: 'Batch 12 Attendance Note',
        content: 'Maegan & Niño were present on time for morning huddle. Great reliability this week!',
        color: 'green',
        tag: 'Trainees',
        isPinned: true,
        timestamp: '01:45 AM',
      },
    ],
    priorities: [
      { id: 'p1', text: 'Batch 12 Module 3 Live Evaluation & QA Audit', completed: false, priority: 'HIGH' },
      { id: 'p2', text: 'Follow-up on SL Form & Ticket #17889 (Matt Riner)', completed: true, priority: 'HIGH' },
      { id: 'p3', text: 'End-of-shift attendance lock & supervisor punch sync', completed: false, priority: 'MEDIUM' },
    ],
  },
  '1108': {
    tasks: [],
    habits: [
      {
        id: 'h1108_1',
        name: 'Quality Calibration & Criticize',
        category: 'tracker',
        categoryLabel: 'Quality',
        duration: '20 min',
        streak: 3,
        completedToday: false,
        timeOfDay: 'Mid Shift',
      },
    ],
    sessions: 0,
    mindDump: {
      title: 'Weekly Quality Objectives',
      text: 'Quality calibration goals for Rocket Money batch 14.',
    },
    stickies: [],
    priorities: [],
  },
  '1772': {
    tasks: [
      {
        id: 't1789460244192',
        title: 'Smoke Break & De-escalation Refresher',
        ticketCode: '#17894',
        priority: 'HIGH',
        status: 'done',
        estimate: '1h',
        category: 'Training',
        categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        assignee: 'BC',
        assigneeColor: 'bg-[#2F6798]',
      },
    ],
    habits: [
      {
        id: 'h1789460227535',
        name: 'No caffeine after 2:00 AM',
        category: 'nutrition',
        categoryLabel: 'Wellness',
        duration: '21 days target',
        streak: 4,
        completedToday: true,
        timeOfDay: 'Night Shift',
      },
    ],
    sessions: 0,
    mindDump: {
      title: 'Training Module Notes',
      text: 'Refresher session on conflict resolution with batch 12.',
    },
    stickies: [],
    priorities: [],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId') || '1597';

    const userData = flowHubData[empId] || flowHubData['1597'];

    return NextResponse.json({
      success: true,
      empId,
      data: userData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId = '1597', type, payload } = body;

    if (!flowHubData[empId]) {
      flowHubData[empId] = {
        tasks: [],
        habits: [],
        sessions: 0,
        mindDump: { title: 'Notes', text: '' },
        stickies: [],
        priorities: [],
      };
    }

    const current = flowHubData[empId];

    switch (type) {
      case 'UPDATE_TASKS':
        current.tasks = payload;
        break;
      case 'ADD_TASK':
        current.tasks = [payload, ...current.tasks];
        break;
      case 'UPDATE_TASK':
        current.tasks = current.tasks.map((t) => (t.id === payload.id ? { ...t, ...payload } : t));
        break;
      case 'DELETE_TASK':
        current.tasks = current.tasks.filter((t) => t.id !== payload.id);
        break;
      case 'UPDATE_HABITS':
        current.habits = payload;
        break;
      case 'TOGGLE_HABIT':
        current.habits = current.habits.map((h) => {
          if (h.id === payload.id) {
            const nextDone = !h.completedToday;
            return {
              ...h,
              completedToday: nextDone,
              streak: nextDone ? h.streak + 1 : Math.max(0, h.streak - 1),
            };
          }
          return h;
        });
        break;
      case 'ADD_HABIT':
        current.habits = [...current.habits, payload];
        break;
      case 'DELETE_HABIT':
        current.habits = current.habits.filter((h) => h.id !== payload.id);
        break;
      case 'INCREMENT_SESSION':
        current.sessions = (current.sessions || 0) + 1;
        break;
      case 'SAVE_MIND_DUMP':
        current.mindDump = payload;
        break;
      case 'UPDATE_STICKIES':
        current.stickies = payload;
        break;
      case 'UPDATE_PRIORITIES':
        current.priorities = payload;
        break;
      case 'FULL_SYNC':
        flowHubData[empId] = { ...current, ...payload };
        break;
      default:
        break;
    }

    return NextResponse.json({
      success: true,
      empId,
      data: flowHubData[empId],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
