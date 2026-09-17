'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  ArrowLeft, 
  ArrowRight,
  Play, 
  Pause, 
  RotateCcw, 
  CloudRain, 
  Radio, 
  Coffee, 
  Plus, 
  Search, 
  Check, 
  Trash2, 
  Undo2, 
  Copy, 
  FileEdit, 
  CheckSquare, 
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Timer,
  Kanban,
  BrainCircuit,
  Flame,
  X,
  Type,
  Italic,
  Bold,
  Underline,
  AlignLeft,
  Save,
  Edit3,
  Maximize2,
  Minimize2,
  GripVertical,
  Layers,
  Filter,
  CheckCircle2,
  MoreHorizontal,
  Droplets,
  Activity,
  Utensils,
  Bell,
  Footprints,
  Smile,
  Calendar,
  Zap,
  Award,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ListTodo,
  LayoutGrid,
  Waves,
  Trees
} from 'lucide-react';

import FlowHubNotesPlanner from './FlowHubNotesPlanner';
import ConfirmActionModal from './ConfirmActionModal';

interface FlowHubViewProps {
  onBackToPortal: () => void;
}

interface TaskItem {
  id: string;
  title: string;
  ticketCode: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'todo' | 'inprogress' | 'done';
  estimate: string;
  category: string;
  categoryColor: string;
  assignee: string;
  assigneeColor: string;
}

interface HabitItem {
  id: string;
  name: string;
  category: 'hydration' | 'mindfulness' | 'stretch' | 'tracker' | 'nutrition' | 'walk' | 'general';
  categoryLabel: string;
  duration: string;
  streak: number;
  completedToday: boolean;
  timeOfDay: string;
}

export default function FlowHubView({ onBackToPortal }: FlowHubViewProps) {
  // Live Date & Time
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: 'Tuesday, September 15, 2026',
    timeStr: '03:08:17 AM',
  });

  // Focus Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // in minutes
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);

  const audioCtxRef = useRef<any>(null);
  const noiseSourceRef = useRef<any>(null);
  const gainNodeRef = useRef<any>(null);

  // Task Board State matching Teamhood Kanban visual design
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'HIGH' | 'MINE'>('ALL');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isFullscreenBoard, setIsFullscreenBoard] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newTaskCategory, setNewTaskCategory] = useState('Website');
  const [newTaskEstimate, setNewTaskEstimate] = useState('2h');
  const [newTaskAssignee, setNewTaskAssignee] = useState('NR');
  const [newTaskColumn, setNewTaskColumn] = useState<'todo' | 'inprogress' | 'done'>('todo');

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
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
  ]);

  // Mind Dump State matching screenshot
  const [mindDumpTitle, setMindDumpTitle] = useState('Salsile Project Brief');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [mindDumpText, setMindDumpText] = useState(
    'Salsile Inc. is a well-established fashion retailer specializing in high-quality clothing and accessories for men and women. The client is looking to revamp their existing e-commerce website to enhance user experience, improve overall aesthetics, and increase online sales. The new design should reflect their brand identity as a modern, and customer-centric fashion store.'
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Habit Tracker State
  const [habits, setHabits] = useState<HabitItem[]>([
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
  ]);

  const [activeHabitTab, setActiveHabitTab] = useState<'routine' | 'highlights' | 'stats'>('routine');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1); // Tuesday active
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'hydration' | 'mindfulness' | 'stretch' | 'tracker' | 'nutrition' | 'walk' | 'general'>('hydration');
  const [newHabitDuration, setNewHabitDuration] = useState('10 min');
  const [newHabitTimeOfDay, setNewHabitTimeOfDay] = useState('Mid Shift');
  const [reminderToast, setReminderToast] = useState(false);

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', options);
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentDateTime({ dateStr, timeStr });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Flow Hub Database / API Load
  const fetchFlowHubData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/flow-hub?empId=1597');
      const json = await res.json();
      if (json.data) {
        if (json.data.tasks && Array.isArray(json.data.tasks) && json.data.tasks.length > 0) {
          setTasks(json.data.tasks);
        }
        if (json.data.habits && Array.isArray(json.data.habits) && json.data.habits.length > 0) {
          setHabits(json.data.habits);
        }
        if (json.data.sessions !== undefined) {
          setSessionsCompleted(json.data.sessions);
        }
        if (json.data.mindDump) {
          if (json.data.mindDump.text) setMindDumpText(json.data.mindDump.text);
          if (json.data.mindDump.title) setMindDumpTitle(json.data.mindDump.title);
        }
      }
    } catch (err) {
      console.error('Error fetching Flow Hub data:', err);
    }
  }, []);

  useEffect(() => {
    fetchFlowHubData();
  }, [fetchFlowHubData]);

  const handleMindDumpChange = (val: string) => {
    setMindDumpText(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flow_hub_mind_dump', val);
    }
  };

  const handleSaveMindDump = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flow_hub_mind_dump', mindDumpText);
      localStorage.setItem('flow_hub_mind_dump_title', mindDumpTitle);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: '1597',
          type: 'SAVE_MIND_DUMP',
          payload: { title: mindDumpTitle, text: mindDumpText },
        }),
      });
    } catch (err) {
      console.error('Error saving mind dump:', err);
    }
  };

  const handleCopyMindDump = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mindDumpText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const applyFormatting = (formatTag: string) => {
    if (formatTag === 'bold') {
      setMindDumpText((prev) => prev + ' **bold text**');
    } else if (formatTag === 'italic') {
      setMindDumpText((prev) => prev + ' *italic text*');
    } else if (formatTag === 'underline') {
      setMindDumpText((prev) => prev + ' _underlined text_');
    } else if (formatTag === 'heading') {
      setMindDumpText((prev) => prev + '\n\n### Heading\n');
    }
  };

  // Web Audio API Ambient Sound Synthesizer
  const stopAmbientSynth = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop?.();
        noiseSourceRef.current.disconnect?.();
      } catch {}
      noiseSourceRef.current = null;
    }
  };

  const playAmbientSynth = (type: string, volume: number) => {
    try {
      stopAmbientSynth();
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const time = i / ctx.sampleRate;

        if (type === 'Rain') {
          // Soft pink rain noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        } else if (type === 'Brown Noise') {
          // Deep, rich brown noise (ADHD/Deep Focus)
          b0 = (b0 + (0.02 * white)) / 1.02;
          output[i] = b0 * 0.65;
        } else if (type === 'Ocean') {
          // Ocean waves: brown base modulated with a 0.2 Hz tide swell
          b0 = (b0 + (0.02 * white)) / 1.02;
          const swell = 0.4 + 0.6 * Math.pow((Math.sin(2 * Math.PI * 0.18 * time) + 1) / 2, 1.5);
          output[i] = b0 * 0.6 * swell + white * 0.006 * (1 - swell);
        } else if (type === 'Campfire') {
          // Warm brown rumble + gentle crackles
          b0 = (b0 + (0.018 * white)) / 1.02;
          let crackle = 0;
          if (Math.random() < 0.0006) {
            crackle = (Math.random() * 2 - 1) * 0.28;
          }
          output[i] = b0 * 0.45 + crackle;
        } else if (type === 'Coffee Shop') {
          // Warm brown rumble ambient
          b0 = (b0 + (0.02 * white)) / 1.02;
          output[i] = b0 * 0.55;
        } else if (type === 'Forest') {
          // Modulated gentle forest breeze
          b0 = (b0 + (0.015 * white)) / 1.01;
          const breeze = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.12 * time);
          output[i] = b0 * 0.4 * breeze + (white * 0.005);
        } else if (type === 'Night Train') {
          // Rhythmic click-clack track cadence over steady low drone
          b0 = (b0 + (0.018 * white)) / 1.02;
          const cadence = Math.sin(2 * Math.PI * 2.2 * time);
          const click = (cadence > 0.94 || (time % 0.45 < 0.015)) ? (Math.random() * 0.05) : 0;
          output[i] = b0 * 0.45 + click;
        } else {
          // Gentle white noise
          output[i] = white * 0.022;
        }
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gainNodeRef.current = gain;

      whiteNoiseSource.connect(gain);
      gain.connect(ctx.destination);
      whiteNoiseSource.start(0);
      noiseSourceRef.current = whiteNoiseSource;
    } catch (e) {
      console.error('Ambient audio synthesizer error:', e);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSynth();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Update volume live
  const handleVolumeChange = (newVol: number) => {
    setAmbientVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // Focus Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      setSessionsCompleted((s) => s + 1);
      fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'INCREMENT_SESSION' }),
      }).catch(console.error);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerSecondsLeft, timerMode]);

  const handleSelectMode = (mode: 'focus' | 'short_break' | 'long_break', mins: number) => {
    setTimerMode(mode);
    setSelectedDuration(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerActive(false);
  };

  const handleSelectDuration = (mins: number) => {
    setSelectedDuration(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerActive(false);
  };

  const handleAdjustMinutes = (deltaMins: number) => {
    setTimerSecondsLeft((prev) => {
      const updated = Math.max(60, prev + deltaMins * 60);
      return updated;
    });
  };

  const handleSkipSession = () => {
    setIsTimerActive(false);
    if (timerMode === 'focus') {
      setSessionsCompleted((s) => s + 1);
      handleSelectMode('short_break', 5);
    } else {
      handleSelectMode('focus', 25);
    }
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    setTimerSecondsLeft(selectedDuration * 60);
  };

  const formatTimerMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Ambient sound toggle with live synthesizer
  const toggleAmbient = (ambientName: string) => {
    if (activeAmbient === ambientName) {
      setActiveAmbient(null);
      stopAmbientSynth();
    } else {
      setActiveAmbient(ambientName);
      playAmbientSynth(ambientName, ambientVolume);
    }
  };

  // Task Handlers matching Teamhood Kanban with API persistence
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `t${Date.now()}`,
      title: newTaskTitle.trim(),
      ticketCode: `#${Math.floor(10000 + Math.random() * 90000)}`,
      priority: newTaskPriority,
      status: newTaskColumn,
      estimate: newTaskEstimate || '2h',
      category: newTaskCategory || 'General',
      categoryColor: newTaskPriority === 'HIGH' 
        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
        : newTaskPriority === 'MEDIUM'
        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      assignee: newTaskAssignee || 'NR',
      assigneeColor: newTaskAssignee === 'NR' ? 'bg-[#2F6798]' : newTaskAssignee === 'EP' ? 'bg-rose-500' : newTaskAssignee === 'MB' ? 'bg-[#C8A54B]' : 'bg-emerald-600',
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setIsAddTaskOpen(false);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'ADD_TASK', payload: newTask }),
      });
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleMoveTask = async (id: string, newStatus: 'todo' | 'inprogress' | 'done') => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTasks(updated);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'UPDATE_TASKS', payload: updated }),
      });
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  const handleMoveTaskNext = (id: string, currentStatus: 'todo' | 'inprogress' | 'done') => {
    const sequence: ('todo' | 'inprogress' | 'done')[] = ['todo', 'inprogress', 'done'];
    const currentIdx = sequence.indexOf(currentStatus);
    if (currentIdx < sequence.length - 1) {
      handleMoveTask(id, sequence[currentIdx + 1]);
    }
  };

  const handleMoveTaskPrev = (id: string, currentStatus: 'todo' | 'inprogress' | 'done') => {
    const sequence: ('todo' | 'inprogress' | 'done')[] = ['todo', 'inprogress', 'done'];
    const currentIdx = sequence.indexOf(currentStatus);
    if (currentIdx > 0) {
      handleMoveTask(id, sequence[currentIdx - 1]);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const remaining = tasks.filter((t) => t.id !== id);
    setTasks(remaining);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'DELETE_TASK', payload: { id } }),
      });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateTask = async (updated: TaskItem) => {
    const updatedTasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    setTasks(updatedTasks);
    setSelectedTaskForEdit(null);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'UPDATE_TASK', payload: updated }),
      });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
    setDraggingTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnKey: 'todo' | 'inprogress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || draggingTaskId;
    if (taskId) {
      handleMoveTask(taskId, columnKey);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  // Habit Handlers with API persistence
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const categoryLabels: Record<string, string> = {
      hydration: 'Hydration',
      mindfulness: 'Focus Breath',
      stretch: 'Ergonomics',
      tracker: 'Time Tracker',
      nutrition: 'Shift Fuel',
      walk: 'Active Rest',
      general: 'Daily Routine',
    };
    const newHabit: HabitItem = {
      id: `h${Date.now()}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      categoryLabel: categoryLabels[newHabitCategory] || 'Routine',
      duration: newHabitDuration || '10 min',
      streak: 1,
      completedToday: false,
      timeOfDay: newHabitTimeOfDay || 'Daily Routine',
    };
    setHabits((prev) => [newHabit, ...prev]);
    setNewHabitName('');
    setIsAddHabitOpen(false);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'ADD_HABIT', payload: newHabit }),
      });
    } catch (err) {
      console.error('Error adding habit:', err);
    }
  };

  const handleToggleHabit = async (id: string) => {
    const updatedHabits = habits.map((h) =>
      h.id === id
        ? {
            ...h,
            completedToday: !h.completedToday,
            streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
          }
        : h
    );
    setHabits(updatedHabits);
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'TOGGLE_HABIT', payload: { id } }),
      });
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    try {
      await fetch('/api/flow-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: '1597', type: 'DELETE_HABIT', payload: { id } }),
      });
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const getHabitCategoryIcon = (category: string) => {
    switch (category) {
      case 'hydration':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'mindfulness':
        return <Smile className="w-4 h-4 text-emerald-500" />;
      case 'stretch':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'tracker':
        return <Clock className="w-4 h-4 text-[#24537D] dark:text-blue-400" />;
      case 'nutrition':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'walk':
        return <Footprints className="w-4 h-4 text-rose-500" />;
      default:
        return <CheckSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  const getHabitCategoryBg = (category: string) => {
    switch (category) {
      case 'hydration':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
      case 'mindfulness':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'stretch':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'tracker':
        return 'bg-blue-50 text-[#24537D] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'nutrition':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'walk':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.ticketCode.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.assignee.toLowerCase().includes(taskSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (taskFilter === 'HIGH') return t.priority === 'HIGH';
    if (taskFilter === 'MINE') return t.assignee === 'NR';

    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inprogressTasks = filteredTasks.filter((t) => t.status === 'inprogress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');
  const totalTasksDone = tasks.filter((t) => t.status === 'done').length;
  const habitsDoneCount = habits.filter((h) => h.completedToday).length;

  // Circular timer progress
  const totalSecs = selectedDuration * 60;
  const progressPercent = ((totalSecs - timerSecondsLeft) / totalSecs) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  // Category Tag Styles matching screenshot
  const getCategoryBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'instructions':
        return 'border border-[#27AE60]/60 text-[#27AE60] bg-[#27AE60]/10 dark:border-[#27AE60]/70 dark:text-emerald-400 dark:bg-[#27AE60]/20';
      case 'high importance':
        return 'border border-rose-400 text-rose-600 bg-rose-50/50 dark:border-rose-700 dark:text-rose-400 dark:bg-rose-950/40';
      case 'website':
        return 'border border-teal-400 text-teal-600 bg-teal-50/50 dark:border-teal-700 dark:text-teal-400 dark:bg-teal-950/40';
      case 'management':
        return 'border border-blue-400 text-[#24537D] bg-blue-50/50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/40';
      case 'training':
      case 'design':
        return 'border border-amber-400 text-amber-600 bg-amber-50/50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-950/40';
      case 'completed':
        return 'border border-[#27AE60]/60 text-[#27AE60] bg-[#27AE60]/10 dark:border-[#27AE60]/70 dark:text-emerald-400 dark:bg-[#27AE60]/20';
      default:
        return 'border border-slate-300 text-slate-600 bg-slate-50/50 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800/40';
    }
  };

  const getAssigneeColor = (assignee: string) => {
    switch (assignee) {
      case 'NR':
        return 'bg-[#24537D] text-white';
      case 'EP':
        return 'bg-[#E82159] text-white';
      case 'JC':
        return 'bg-[#0E8A5E] text-white';
      case 'MB':
        return 'bg-[#C29B38] text-white';
      default:
        return 'bg-[#24537D] text-white';
    }
  };

  const getKanbanCardStyle = (columnStatus: 'todo' | 'inprogress' | 'done') => {
    switch (columnStatus) {
      case 'todo':
        return 'bg-[#FADBD8] dark:bg-[#E55755]/25 border-[#E55755]/60 dark:border-[#E55755]/70 hover:border-[#E55755] hover:bg-[#F5B7B1]';
      case 'inprogress':
        return 'bg-[#FDEBD0] dark:bg-[#E68A38]/25 border-[#E68A38]/60 dark:border-[#E68A38]/70 hover:border-[#E68A38] hover:bg-[#FAD7A0]';
      case 'done':
        return 'bg-[#D4EFDF] dark:bg-[#27AE60]/25 border-[#27AE60]/60 dark:border-[#27AE60]/70 hover:border-[#27AE60] hover:bg-[#A9DFBF]';
    }
  };

  // Render individual Teamhood style Kanban card
  const renderKanbanCard = (t: TaskItem, columnStatus: 'todo' | 'inprogress' | 'done') => {
    const isHigh = t.priority === 'HIGH';
    const isMed = t.priority === 'MEDIUM';

    return (
      <div
        key={t.id}
        draggable
        onDragStart={(e) => handleDragStart(e, t.id)}
        onClick={() => setSelectedTaskForEdit(t)}
        className={`group relative p-3 rounded-2xl ${getKanbanCardStyle(
          columnStatus
        )} border shadow-2xs hover:shadow-md transition-all duration-200 space-y-2 cursor-pointer active:cursor-grabbing ${draggingTaskId === t.id ? 'opacity-40 scale-95' : 'opacity-100'}`}
      >
        {/* Top: Estimate capsule & Ticket ID + Blue Edit & Red Delete Icons (No box) */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {t.estimate && (
              <span className="px-1.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {t.estimate}
              </span>
            )}
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono truncate">
              {t.ticketCode}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Priority Tag matching user screenshot */}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                isHigh
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                  : isMed
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
              }`}
            >
              {t.priority}
            </span>

            {/* Blue Edit & Red Delete Icons (No Box Container) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTaskForEdit(t);
                }}
                title="Edit task"
                className="p-0.5 text-[#2F6798] hover:text-[#1c486e] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToDelete(t);
                }}
                title="Delete task"
                className="p-0.5 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <p className={`font-bold text-xs leading-snug tracking-tight ${
          columnStatus === 'done' 
            ? 'text-slate-800 dark:text-slate-200' 
            : 'text-slate-900 dark:text-slate-100'
        }`}>
          {t.title}
        </p>

        {/* Bottom Row: Avatar BEFORE Category Pill (No back button) */}
        <div className="pt-0.5 flex items-center justify-between gap-1.5 flex-wrap">
          {/* Avatar Icon BEFORE the Category Pill */}
          <div className="flex items-center gap-1.5">
            {/* Assignee Avatar Circle with Initials */}
            <div 
              title={`Assignee: ${t.assignee}`}
              className={`w-5 h-5 rounded-full font-bold text-[9px] flex items-center justify-center shadow-2xs ${getAssigneeColor(t.assignee)}`}
            >
              {t.assignee}
            </div>

            {/* Category Pill */}
            {t.category && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getCategoryBadgeClass(t.category)}`}>
                {t.category}
              </span>
            )}
          </div>

          {/* Quick Forward Button if not done */}
          {columnStatus !== 'done' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveTaskNext(t.id, columnStatus);
              }}
              className="px-1.5 py-0.5 rounded text-[9.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-slate-800 flex items-center gap-0.5 transition-colors border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800 cursor-pointer shadow-2xs"
              title="Move task forward"
            >
              <span>next</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Main Task Board Content (Reused in normal view and Fullscreen Modal)
  const renderVisualTaskBoard = (isExpanded: boolean) => (
    <div className="space-y-3.5">
      {/* Top Header Controls Bar (No search box here - search is in external container) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F6798] text-white flex items-center justify-center shadow-xs shrink-0">
            <LayoutGrid className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Task Board
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                Visual Task Boards 3
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2F6798]/15 text-[#2F6798] dark:bg-blue-900/30 dark:text-blue-300 border border-[#2F6798]/30 shrink-0">
                Live Workflow
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          {/* Quick Filter Pills */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800 gap-1 shrink-0">
            {(['ALL', 'HIGH', 'MINE'] as const).map((flt) => (
              <button
                key={flt}
                type="button"
                onClick={() => setTaskFilter(flt)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  taskFilter === flt
                    ? 'bg-[#2F6798] text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {flt === 'ALL' ? 'All' : flt === 'HIGH' ? 'High' : 'My Tasks'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add Task Button */}
            <button
              onClick={() => {
                setNewTaskColumn('todo');
                setIsAddTaskOpen(true);
              }}
              className="px-3 py-1.5 rounded-full bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              title="Add new kanban task"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Task</span>
            </button>

            {/* Fullscreen Expand Toggle */}
            <button
              onClick={() => setIsFullscreenBoard(!isFullscreenBoard)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-2xs shrink-0"
              title={isExpanded ? "Collapse View" : "Maximize Board View"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Task Board: 3-Column Grid (TO DO | IN PROGRESS | COMPLETED) */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[650px] space-y-2.5">
          
          {/* Top Stage Groups Bar: Styled in Light Blue with Semi-bold text */}
          <div className="grid grid-cols-3 gap-3.5 text-xs text-center px-0.5">
            <div className="bg-blue-50/80 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 px-3.5 py-1.5 rounded-xl font-semibold">
              Input
            </div>
            <div className="bg-blue-50/80 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 px-3.5 py-1.5 rounded-xl font-semibold">
              Work in Progress
            </div>
            <div className="bg-blue-50/80 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 px-3.5 py-1.5 rounded-xl font-semibold">
              Output
            </div>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-3 gap-3.5 items-start">
            
            {/* 1. TO DO Column */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'todo')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'todo')}
              className={`space-y-2 rounded-2xl transition-all ${
                dragOverColumn === 'todo' ? 'ring-2 ring-[#E55755] bg-rose-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#E55755] text-white font-black text-xs shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-white" />
                  <span>TO DO</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/30 text-white text-[11px] font-bold">
                  {todoTasks.length}
                </span>
              </div>

              <div className="min-h-[300px] p-2.5 rounded-2xl bg-[#FADBD8]/25 dark:bg-[#E55755]/10 border border-[#E55755]/20 dark:border-[#E55755]/30 space-y-2.5 flex flex-col">
                <div className="space-y-2.5 flex-1">
                  {todoTasks.map((t) => renderKanbanCard(t, 'todo'))}
                  {todoTasks.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No items in To Do
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskColumn('todo');
                    setIsAddTaskOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#E55755]/40 hover:border-[#E55755] text-[#E55755] dark:text-rose-400 hover:bg-[#E55755]/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* 2. IN PROGRESS Column (White Text & Clock Icon) */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'inprogress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'inprogress')}
              className={`space-y-2 rounded-2xl transition-all ${
                dragOverColumn === 'inprogress' ? 'ring-2 ring-[#E68A38] bg-amber-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#E68A38] text-white font-black text-xs shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">IN PROGRESS</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/30 text-white text-[11px] font-bold">
                  {inprogressTasks.length}
                </span>
              </div>

              <div className="min-h-[300px] p-2.5 rounded-2xl bg-[#FDEBD0]/25 dark:bg-[#E68A38]/10 border border-[#E68A38]/20 dark:border-[#E68A38]/30 space-y-2.5 flex flex-col">
                <div className="space-y-2.5 flex-1">
                  {inprogressTasks.map((t) => renderKanbanCard(t, 'inprogress'))}
                  {inprogressTasks.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No tasks in progress
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskColumn('inprogress');
                    setIsAddTaskOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#E68A38]/40 hover:border-[#E68A38] text-[#E68A38] dark:text-amber-400 hover:bg-[#E68A38]/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* 3. COMPLETED Column */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'done')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'done')}
              className={`space-y-2 rounded-2xl transition-all ${
                dragOverColumn === 'done' ? 'ring-2 ring-[#27AE60] bg-[#27AE60]/20' : ''
              }`}
            >
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#27AE60] text-white font-black text-xs shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>COMPLETED</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/30 text-white text-[11px] font-bold">
                  {doneTasks.length}
                </span>
              </div>

              <div className="min-h-[300px] p-2.5 rounded-2xl bg-[#D4EFDF]/25 dark:bg-[#27AE60]/10 border border-[#27AE60]/20 dark:border-[#27AE60]/30 space-y-2.5 flex flex-col">
                <div className="space-y-2.5 flex-1">
                  {doneTasks.map((t) => renderKanbanCard(t, 'done'))}
                  {doneTasks.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No completed tasks
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskColumn('done');
                    setIsAddTaskOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#27AE60]/40 hover:border-[#27AE60] text-[#27AE60] dark:text-emerald-400 hover:bg-[#27AE60]/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 1. Top Banner Card with Streamlined Header, Icon Metric Pills & Daily Focus Target */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="space-y-2">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Flow Hub Focus Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Deep work pomodoro, visual task boards &amp; shift planning
            </p>
          </div>

          {/* Metric Icon Pills (Replaced raw bullets with pills & icons) */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/90 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs">
              <Timer className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
              <span>Sessions today:</span>
              <b className="font-bold text-slate-900 dark:text-slate-100">{sessionsCompleted}</b>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tasks done:</span>
              <b className="font-bold text-emerald-800 dark:text-emerald-200">{totalTasksDone}</b>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Habits:</span>
              <b className="font-bold text-amber-800 dark:text-amber-200">{habitsDoneCount}/{habits.length}</b>
            </span>
          </div>
        </div>

        {/* Right: Daily Focus Target Widget (Inline on single line, no next line) */}
        <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs shrink-0 whitespace-nowrap">
          <div className="w-10 h-10 rounded-xl bg-[#2F6798] text-white flex items-center justify-center shadow-xs">
            <Timer className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Focus Target</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {sessionsCompleted >= 4 ? 'Goal Met' : `${sessionsCompleted}/4 Sessions`}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-[#2F6798] rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (sessionsCompleted / 4) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {sessionsCompleted * 25}m recorded
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Unified External Container For All Features (Timer, Task Board, Notes & Habits) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* External Container Header & Global Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2F6798]/15 text-[#2F6798] dark:text-blue-300 flex items-center justify-center shadow-2xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                Workforce Studio &amp; Task Command
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Integrated Pomodoro timer, Kanban columns and live sprint tracking
              </p>
            </div>
          </div>

          {/* Long Search Bar in External Container */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Search tasks, codes, tickets, or categories..."
              className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#2F6798]/30 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Main Grid: Focus Timer (Left) & Task Board (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Focus Timer Widget (Tightened padding & gaps) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2F6798] text-white flex items-center justify-center shadow-xs">
                <Timer className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                  Focus Timer
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                  Deep Work &amp; Pomodoro Studio
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase border flex items-center gap-1 ${
                timerMode === 'focus'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : timerMode === 'short_break'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                {timerMode === 'focus' ? (
                  <>
                    <Zap className="w-3 h-3 text-[#2F6798]" />
                    <span>Focus</span>
                  </>
                ) : timerMode === 'short_break' ? (
                  <>
                    <Coffee className="w-3 h-3 text-emerald-600" />
                    <span>Short Rest</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Long Rest</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs: Focus | Short Break | Long Break (Strictly 1-Line, No Line-Break) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 gap-1 overflow-hidden">
            <button
              type="button"
              onClick={() => handleSelectMode('focus', 25)}
              className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                timerMode === 'focus'
                  ? 'bg-[#2F6798] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Focus (25m)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('short_break', 5)}
              className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                timerMode === 'short_break'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coffee className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Short (5m)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('long_break', 15)}
              className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                timerMode === 'long_break'
                  ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Long (15m)</span>
            </button>
          </div>

          {/* Quick Duration Preset Pills */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>DURATION PRESET</span>
              <span>{selectedDuration} Minutes</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectDuration(mins)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedDuration === mins
                      ? 'bg-[#2F6798] text-white shadow-xs font-extrabold ring-1 ring-[#2F6798]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Countdown Display Box: Styled in Solid Brand Blue */}
          <div className="relative p-3 rounded-2xl bg-[#2F6798] dark:bg-[#1A4268] text-white border border-[#235179] dark:border-[#163654] flex flex-col items-center justify-center shadow-xs">
            
            {/* SVG Progress Gauge */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="focusTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#E0EDF8" />
                  </linearGradient>
                </defs>

                {/* Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-white/20"
                  strokeWidth="5"
                  fill="transparent"
                />

                {/* Animated Progress Circle */}
                {(() => {
                  const maxSecs = Math.max(1, selectedDuration * 60);
                  const progress = Math.min(1, Math.max(0, (maxSecs - timerSecondsLeft) / maxSecs));
                  const circ = 2 * Math.PI * 42;
                  const offset = circ * (1 - progress);
                  return (
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#focusTimerGrad)"
                      strokeWidth="6"
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  );
                })()}
              </svg>

              {/* Digital Time Centerpiece */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight drop-shadow-sm">
                  {formatTimerMinutes(timerSecondsLeft)}
                </span>
                
                {/* Live Completion % tag */}
                <span className="text-[10px] font-extrabold text-blue-100 mt-0.5">
                  {Math.round(Math.min(100, Math.max(0, ((selectedDuration * 60 - timerSecondsLeft) / Math.max(1, selectedDuration * 60)) * 100)))}% Elapsed
                </span>
              </div>
            </div>

            {/* Quick Time Adjusters (+5m / -5m) */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => handleAdjustMinutes(-5)}
                className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-[10.5px] font-bold text-white transition-all cursor-pointer shadow-2xs"
                title="Subtract 5 minutes"
              >
                -5 min
              </button>
              
              {/* Session Capsule Indicators (0/4) */}
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/15 border border-white/25 shadow-2xs">
                {[0, 1, 2, 3].map((idx) => {
                  const isDone = (sessionsCompleted % 4) > idx || (sessionsCompleted > 0 && sessionsCompleted % 4 === 0);
                  const isCurrent = (sessionsCompleted % 4) === idx;
                  return (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        isDone
                          ? 'bg-amber-300 shadow-xs scale-110'
                          : isCurrent
                          ? 'bg-white ring-2 ring-white/50 animate-pulse'
                          : 'bg-white/30'
                      }`}
                      title={`Session ${idx + 1}`}
                    />
                  );
                })}
                <span className="text-[9.5px] font-extrabold text-white ml-1 font-mono">
                  {sessionsCompleted % 4}/4
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjustMinutes(5)}
                className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-[10.5px] font-bold text-white transition-all cursor-pointer shadow-2xs"
                title="Add 5 minutes"
              >
                +5 min
              </button>
            </div>

          </div>

          {/* Ambient Sound Studio Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
                <span>AMBIENT FOCUS AUDIO</span>
              </span>

              {/* Animated Equalizer Wave when Audio is Active */}
              {activeAmbient && (
                <div className="flex items-end gap-[2px] h-3.5">
                  <span className="w-0.5 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-0.5 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.4s]" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { name: 'Rain', icon: <CloudRain className="w-3 h-3 text-sky-500" />, label: 'Soft Rain' },
                { name: 'Brown Noise', icon: <Radio className="w-3 h-3 text-amber-700 dark:text-amber-400" />, label: 'Brown Noise' },
                { name: 'Ocean', icon: <Waves className="w-3 h-3 text-teal-500" />, label: 'Ocean Waves' },
                { name: 'Campfire', icon: <Flame className="w-3 h-3 text-rose-500" />, label: 'Campfire' },
                { name: 'Coffee Shop', icon: <Coffee className="w-3 h-3 text-amber-500" />, label: 'Coffee Cafe' },
                { name: 'Forest', icon: <Trees className="w-3 h-3 text-emerald-500" />, label: 'Forest Breeze' },
                { name: 'Night Train', icon: <Activity className="w-3 h-3 text-indigo-500" />, label: 'Night Train' },
                { name: 'White Noise', icon: <Sparkles className="w-3 h-3 text-purple-500" />, label: 'White Noise' },
              ].map((sound) => {
                const isPlaying = activeAmbient === sound.name;
                return (
                  <button
                    key={sound.name}
                    type="button"
                    onClick={() => toggleAmbient(sound.name)}
                    className={`py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      isPlaying
                        ? 'bg-[#2F6798] text-white border-[#2F6798] shadow-xs ring-1 ring-[#2F6798]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sound.icon}
                    <span className="truncate">{sound.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Ambient Volume Slider if Active */}
            {activeAmbient && (
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 animate-in fade-in">
                <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400">
                  Vol: {Math.round(ambientVolume * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2F6798]"
                />
              </div>
            )}
          </div>

          {/* Action Hero Controls: Start/Pause, Reset, Skip */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                isTimerActive
                  ? 'bg-[#C8A54B] hover:bg-[#b5923c] text-slate-900 shadow-amber-500/25'
                  : 'bg-[#2F6798] hover:bg-[#235179] text-white shadow-[#2F6798]/30'
              }`}
            >
              {isTimerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-slate-900" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Session</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetTimer}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleSkipSession}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              title="Skip to next session / break"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right: Task Board (Visual Teamhood Kanban Board matching screenshot) */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
          {renderVisualTaskBoard(false)}
        </div>

      </div>

      {/* Shift Notes & Planning Studio */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
        <FlowHubNotesPlanner />
      </div>

      {/* Wellness & Daily Routine Tracker */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
        <div className="rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-5">
          
          {/* Top Header: Greeting, Title & Add Routine Button */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Daily Wellness & Tracker
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {habits.filter(h => h.completedToday).length}/{habits.length} Done
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Track Your Day
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setReminderToast(true);
                  setTimeout(() => setReminderToast(false), 3000);
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#24537D] hover:border-[#24537D] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="Shift Reminder Alerts"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsAddHabitOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#24537D] hover:bg-[#1B4266] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Routine</span>
              </button>
            </div>
          </div>

          {/* Reminder Toast Notification */}
          {reminderToast && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Routine reminders active for shift breaks & hydration!</span>
              </div>
              <button
                onClick={() => setReminderToast(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Weekly Day Capsules Bar matching Reference */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
            {[
              { day: 'Mon', date: '14' },
              { day: 'Tue', date: '15' },
              { day: 'Wed', date: '16' },
              { day: 'Thu', date: '17' },
              { day: 'Fri', date: '18' },
              { day: 'Sat', date: '19' },
              { day: 'Sun', date: '20' },
            ].map((item, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex-1 min-w-[46px] py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D4568] dark:bg-[#24537D] text-white shadow-md shadow-[#1D4568]/30 scale-105 font-black ring-2 ring-[#24537D]/50'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 hover:bg-white hover:border-[#1D4568]/40 font-medium'
                  }`}
                >
                  <span className={`text-[13px] ${isSelected ? 'font-extrabold text-white' : 'font-bold'}`}>
                    {item.date}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-blue-100 font-semibold' : 'text-slate-400'}`}>
                    {item.day}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Pill Tabs: Daily Routine | Good Habits | Statistics */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/90 gap-1">
            <button
              type="button"
              onClick={() => setActiveHabitTab('routine')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeHabitTab === 'routine'
                  ? 'bg-white dark:bg-[#101D3D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily Routine
            </button>
            <button
              type="button"
              onClick={() => setActiveHabitTab('highlights')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeHabitTab === 'highlights'
                  ? 'bg-white dark:bg-[#101D3D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Good Habits
            </button>
            <button
              type="button"
              onClick={() => setActiveHabitTab('stats')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeHabitTab === 'stats'
                  ? 'bg-white dark:bg-[#101D3D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* TAB 1: DAILY ROUTINE (Vertical Connected Timeline View) */}
          {activeHabitTab === 'routine' && (
            <div className="space-y-4">
              {/* Reminder Hero Banner matching Reference */}
              <div className="p-4 rounded-2xl bg-[#FFE8D6] dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-100">
                    Set the reminder
                  </h4>
                  <p className="text-[11px] font-medium text-amber-900/80 dark:text-amber-300 leading-tight">
                    Never miss your routine! Set reminders for calls, breaks & posture.
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setReminderToast(true);
                        setTimeout(() => setReminderToast(false), 3000);
                      }}
                      className="px-3.5 py-1 rounded-xl bg-[#543825] hover:bg-[#3D281A] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      Set Now
                    </button>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-200/70 dark:bg-amber-900/50 flex items-center justify-center shrink-0 shadow-inner">
                  <Bell className="w-6 h-6 text-[#C27803] dark:text-amber-300 animate-bounce" />
                </div>
              </div>

              {/* Connected Timeline List */}
              <div className="relative pl-6 space-y-3">
                {/* Vertical connecting line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-dashed border-l-2 border-dashed border-slate-300 dark:border-slate-700" />

                {habits.map((habit) => (
                  <div key={habit.id} className="relative group">
                    {/* Timeline Node Checkpoint */}
                    <button
                      type="button"
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                        habit.completedToday
                          ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-200 dark:ring-amber-900'
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-amber-400'
                      }`}
                      title={habit.completedToday ? "Mark as pending" : "Mark as completed"}
                    >
                      {habit.completedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Habit Card */}
                    <div
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        habit.completedToday
                          ? 'bg-white/95 dark:bg-[#101D3D]/95 border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                          : 'bg-white dark:bg-[#101D3D] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Category Icon Tile */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getHabitCategoryBg(habit.category)}`}>
                          {getHabitCategoryIcon(habit.category)}
                        </div>

                        {/* Text details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className={`text-xs font-bold truncate ${
                              habit.completedToday
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}>
                              {habit.name}
                            </h5>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              Streak {habit.streak} days
                            </span>
                            <span>•</span>
                            <span>{habit.timeOfDay}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Duration badge & delete action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{habit.duration}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHabit(habit.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                          title="Delete routine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GOOD HABIT HIGHLIGHTS (2x2 Visual Grid matching Reference) */}
          {activeHabitTab === 'highlights' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Good Habit List
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddHabitOpen(true)}
                  className="px-3 py-1 rounded-full bg-[#1D4568] hover:bg-[#14324D] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Habit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    category: 'hydration',
                    title: 'Hydration Reset',
                    subtitle: 'Drink pure water',
                    bg: 'bg-sky-50 dark:bg-sky-950/40',
                    border: 'border-sky-200 dark:border-sky-800/60',
                    icon: <Droplets className="w-6 h-6 text-sky-500" />,
                    badge: 'Daily 2.5L',
                  },
                  {
                    category: 'mindfulness',
                    title: 'Mindful Focus',
                    subtitle: 'Breath & queue pause',
                    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
                    border: 'border-emerald-200 dark:border-emerald-800/60',
                    icon: <Smile className="w-6 h-6 text-emerald-500" />,
                    badge: '15 Min Calibrate',
                  },
                  {
                    category: 'stretch',
                    title: 'Ergonomic Stretch',
                    subtitle: 'Neck, wrist & spine',
                    bg: 'bg-purple-50 dark:bg-purple-950/40',
                    border: 'border-purple-200 dark:border-purple-800/60',
                    icon: <Activity className="w-6 h-6 text-purple-500" />,
                    badge: '10 Min Desk',
                  },
                  {
                    category: 'nutrition',
                    title: 'Shift Fuel Meal',
                    subtitle: 'Nutritious lunch meal',
                    bg: 'bg-amber-50 dark:bg-amber-950/40',
                    border: 'border-amber-200 dark:border-amber-800/60',
                    icon: <Utensils className="w-6 h-6 text-amber-500" />,
                    badge: 'Healthy Meal',
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setNewHabitCategory(card.category as any);
                      setNewHabitName(card.title);
                      setIsAddHabitOpen(true);
                    }}
                    className={`p-4 rounded-2xl ${card.bg} border ${card.border} space-y-3 transition-all hover:scale-[1.02] shadow-2xs cursor-pointer group`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-snug group-hover:text-[#1D4568] dark:group-hover:text-blue-300 transition-colors">
                        {card.title}
                      </h5>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="inline-block px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800/80 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                      {card.badge}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STATISTICS (Semi-circular Arc Gauge & Metrics) */}
          {activeHabitTab === 'stats' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">
                  Productivity & Routine Completion
                </span>

                {/* Semi Circle Gauge matching Reference */}
                <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
                  <svg viewBox="0 0 100 50" className="w-48 h-24">
                    {/* Background Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="dark:stroke-slate-700"
                    />
                    {/* Gradient Active Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="url(#habitGrad)"
                      strokeWidth="8"
                      strokeDasharray="125.6"
                      strokeDashoffset={
                        125.6 - (125.6 * (habits.filter(h => h.completedToday).length / Math.max(1, habits.length)))
                      }
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="habitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="60%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Centered Percentage Text */}
                  <div className="absolute bottom-1 flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {Math.round((habits.filter(h => h.completedToday).length / Math.max(1, habits.length)) * 100)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Productivity Level
                    </span>
                  </div>
                </div>

                {/* Stats Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <span className="block text-xs font-black text-[#24537D] dark:text-blue-400">
                      {habits.filter(h => h.completedToday).length}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Completed</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <span className="block text-xs font-black text-amber-500">
                      {habits.filter(h => !h.completedToday).length}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Pending</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {Math.max(...habits.map(h => h.streak), 0)}d
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Top Streak</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      </div>

      {/* Fullscreen Task Board Modal Overlay */}
      {isFullscreenBoard && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Kanban className="w-6 h-6 text-[#2F6798]" />
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">
                  Visual Task Board • Expanded Studio View
                </h2>
              </div>
              <button
                onClick={() => setIsFullscreenBoard(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderVisualTaskBoard(true)}
          </div>
        </div>
      )}

      {/* Edit Task Details Slide-over Drawer matching Attendance Details design */}
      {selectedTaskForEdit && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 select-none"
          onClick={() => setSelectedTaskForEdit(null)}
        >
          <div 
            className="w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-[#0E1B38] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative border-l border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Solid Primary Blue Header Bar */}
            <div className="bg-[#2F6798] px-5 py-3.5 flex items-center justify-between text-white shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-white" />
                <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase">
                  TASK DETAILS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForEdit(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* 2. Drawer Body (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Header Info Block */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {selectedTaskForEdit.ticketCode ? `Ticket #${selectedTaskForEdit.ticketCode}` : 'Flow Hub Task Card'}
                  </h2>
                  <p className="text-xs text-[#2F6798] dark:text-blue-400 font-semibold mt-0.5">
                    {currentDateTime.dateStr}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shrink-0">
                  {selectedTaskForEdit.estimate || '2h target'}
                </span>
              </div>

              {/* Segmented Stage Tabs (TO DO | IN PROGRESS | COMPLETED) */}
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1 text-xs font-bold">
                {[
                  { id: 'todo', label: 'TO DO', activeClass: 'bg-[#E55755] text-white shadow-xs' },
                  { id: 'inprogress', label: 'IN PROGRESS', activeClass: 'bg-[#E68A38] text-white shadow-xs' },
                  { id: 'done', label: 'COMPLETED', activeClass: 'bg-[#27AE60] text-white shadow-xs' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedTaskForEdit({ ...selectedTaskForEdit, status: st.id as any })}
                    className={`py-2 px-2 rounded-lg text-center font-extrabold transition-all cursor-pointer ${
                      selectedTaskForEdit.status === st.id
                        ? st.activeClass
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Task Title Card */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  TASK TITLE
                </label>
                <textarea
                  rows={2}
                  value={selectedTaskForEdit.title}
                  onChange={(e) => setSelectedTaskForEdit({ ...selectedTaskForEdit, title: e.target.value })}
                  placeholder="Enter task summary..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#2F6798] resize-none"
                />
              </div>

              {/* 2x2 Info Grid matching Attendance Details Card Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Hours Estimate */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span>HOURS ESTIMATE</span>
                  </div>
                  <input
                    type="text"
                    value={selectedTaskForEdit.estimate}
                    onChange={(e) => setSelectedTaskForEdit({ ...selectedTaskForEdit, estimate: e.target.value })}
                    placeholder="e.g. 2h, 4h"
                    className="w-full text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                {/* 2. Priority Level */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>PRIORITY LEVEL</span>
                  </div>
                  <select
                    value={selectedTaskForEdit.priority}
                    onChange={(e) => setSelectedTaskForEdit({ ...selectedTaskForEdit, priority: e.target.value as any })}
                    className="w-full text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>

                {/* 3. Category Tag */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span>CATEGORY TAG</span>
                  </div>
                  <input
                    type="text"
                    value={selectedTaskForEdit.category}
                    onChange={(e) => setSelectedTaskForEdit({ ...selectedTaskForEdit, category: e.target.value })}
                    placeholder="e.g. Escalation, QA FRIA"
                    className="w-full text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                {/* 4. Verification / Status */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WORKFLOW STAGE</span>
                  </div>
                  <div className="pt-1">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                      selectedTaskForEdit.status === 'done' 
                        ? 'bg-[#27AE60] text-white' 
                        : selectedTaskForEdit.status === 'inprogress' 
                        ? 'bg-[#E68A38] text-white' 
                        : 'bg-[#E55755] text-white'
                    }`}>
                      {selectedTaskForEdit.status === 'done' ? 'Completed' : selectedTaskForEdit.status === 'inprogress' ? 'In Progress' : 'To Do'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignee Card */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    ASSIGNED TEAM MEMBER
                  </label>
                  <span className="text-[10px] font-bold text-[#2F6798]">
                    Selected: {selectedTaskForEdit.assignee}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'NR', name: 'Nissi-Jeh', role: 'Supervisor', color: 'bg-[#24537D]' },
                    { id: 'EP', name: 'Lead QA', role: 'QA Lead', color: 'bg-[#E82159]' },
                    { id: 'JC', name: 'Trainer', role: 'Trainer', color: 'bg-[#0E8A5E]' },
                    { id: 'MB', name: 'Matt Riner', role: 'Operations', color: 'bg-[#C29B38]' },
                  ].map((user) => {
                    const isSelected = selectedTaskForEdit.assignee === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedTaskForEdit({
                            ...selectedTaskForEdit,
                            assignee: user.id,
                            assigneeColor: user.color,
                          });
                        }}
                        className={`p-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                          isSelected
                            ? 'border-[#2F6798] bg-blue-50 dark:bg-blue-950/60 shadow-xs ring-1 ring-[#2F6798]'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs ${user.color}`}>
                          {user.id}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-full">
                          {user.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 3. Footer Bar matching Attendance Details reference */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-mono">
                Date Reference: September 2, 2026
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(selectedTaskForEdit)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTask(selectedTaskForEdit);
                    setSelectedTaskForEdit(null);
                  }}
                  className="px-6 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Create New Task Modal Popup */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#24537D]/10 text-[#24537D] dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shadow-2xs">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    Create New Task
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Add a new task card to your workflow board
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              
              {/* Task Title */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  TASK TITLE
                </label>
                <textarea
                  rows={2}
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. COVA Escalation - TM or SL Form review..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-[#24537D] transition-all resize-none text-xs"
                />
              </div>

              {/* Column / Stage Selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  STAGE COLUMN
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'todo', label: 'TO DO', color: 'bg-[#E55755] text-white shadow-xs' },
                    { key: 'inprogress', label: 'IN PROGRESS', color: 'bg-[#E68A38] text-slate-950 shadow-xs' },
                    { key: 'done', label: 'COMPLETED', color: 'bg-[#27AE60] text-white shadow-xs' }
                  ].map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => setNewTaskColumn(col.key as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                        newTaskColumn === col.key
                          ? col.color
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  PRIORITY
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => {
                    const isSelected = newTaskPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? p === 'HIGH'
                              ? 'bg-rose-50 text-rose-600 border-2 border-rose-500 dark:bg-rose-950/60 dark:text-rose-300 shadow-xs'
                              : p === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border-2 border-amber-500 dark:bg-amber-950/60 dark:text-amber-300 shadow-xs'
                              : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border-2 border-transparent'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p === 'HIGH' ? 'bg-rose-500' : p === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimate & Category Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    ESTIMATE (HOURS)
                  </label>
                  <input
                    type="text"
                    value={newTaskEstimate}
                    onChange={(e) => setNewTaskEstimate(e.target.value)}
                    placeholder="e.g. 2h, 4h"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    CATEGORY TAG
                  </label>
                  <input
                    type="text"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    placeholder="e.g. Escalation, QA FRIA"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                  />
                </div>
              </div>

              {/* Assignee Selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  ASSIGNEE
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'NR', name: 'Nissi-Jeh', color: 'bg-[#24537D]' },
                    { id: 'EP', name: 'Lead QA', color: 'bg-[#E82159]' },
                    { id: 'JC', name: 'Trainer', color: 'bg-[#0E8A5E]' },
                    { id: 'MB', name: 'Operations', color: 'bg-[#C29B38]' },
                  ].map((user) => {
                    const isSelected = newTaskAssignee === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setNewTaskAssignee(user.id)}
                        className={`p-2 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                          isSelected
                            ? 'border-[#24537D] bg-blue-50/70 dark:bg-blue-950/50 shadow-xs ring-1 ring-[#24537D]'
                            : 'border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs ${user.color}`}>
                          {user.id}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full">
                          {user.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#24537D] hover:bg-[#1B4266] text-white text-xs font-extrabold transition-all shadow-md shadow-[#24537D]/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create Task</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Add Routine Pop-up Modal Overlay */}
      {isAddHabitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Add Daily Routine & Habit
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Track your day & agent wellness
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddHabitOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddHabit} className="space-y-4">
              
              {/* Routine Name */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  ROUTINE TITLE
                </label>
                <input
                  type="text"
                  required
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Drink a glass of water, Call log review..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  CATEGORY & DOMAIN
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hydration', label: 'Hydration', icon: <Droplets className="w-3.5 h-3.5 text-sky-500" /> },
                    { id: 'mindfulness', label: 'Mindful', icon: <Smile className="w-3.5 h-3.5 text-emerald-500" /> },
                    { id: 'stretch', label: 'Stretch', icon: <Activity className="w-3.5 h-3.5 text-purple-500" /> },
                    { id: 'tracker', label: 'Tracker Log', icon: <Clock className="w-3.5 h-3.5 text-blue-500" /> },
                    { id: 'nutrition', label: 'Shift Fuel', icon: <Utensils className="w-3.5 h-3.5 text-amber-500" /> },
                    { id: 'walk', label: 'Step Break', icon: <Footprints className="w-3.5 h-3.5 text-rose-500" /> },
                  ].map((cat) => {
                    const isSelected = newHabitCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewHabitCategory(cat.id as any)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                          isSelected
                            ? 'border-[#24537D] bg-blue-50/80 dark:bg-blue-950/60 text-[#24537D] dark:text-blue-300 ring-1 ring-[#24537D]'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {cat.icon}
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Time of Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    DURATION
                  </label>
                  <select
                    value={newHabitDuration}
                    onChange={(e) => setNewHabitDuration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs cursor-pointer"
                  >
                    <option value="5 min">5 min</option>
                    <option value="10 min">10 min</option>
                    <option value="15 min">15 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    SHIFT TIMING
                  </label>
                  <select
                    value={newHabitTimeOfDay}
                    onChange={(e) => setNewHabitTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs cursor-pointer"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Mid Shift">Mid Shift</option>
                    <option value="Shift Review">Shift Review</option>
                    <option value="Lunch Break">Lunch Break</option>
                    <option value="Desk Routine">Desk Routine</option>
                    <option value="Break Step">Break Step</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddHabitOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#24537D] hover:bg-[#1B4266] text-white text-xs font-extrabold transition-all shadow-md shadow-[#24537D]/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Routine</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Task Delete Confirmation Modal matching user screenshot */}
      <ConfirmActionModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            handleDeleteTask(taskToDelete.id);
            if (selectedTaskForEdit?.id === taskToDelete.id) {
              setSelectedTaskForEdit(null);
            }
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        subDescription="This action cannot be undone and will remove the task card."
        confirmLabel="Yes"
        cancelLabel="Cancel"
        iconType="delete"
      />

    </div>
  );
}
