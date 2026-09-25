'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Utensils, 
  Coffee, 
  LogOut, 
  LogIn, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Download,
  ShieldCheck,
  Send,
  LucideIcon
} from 'lucide-react';
import { ShiftMilestoneItem, PunchLogItem } from '@/lib/punchLogs';
import DatePickerPopover from './DatePickerPopover';

interface LiveShiftPunchTimelineProps {
  embedded?: boolean;
  supervisorId?: string;
  shiftSchedule?: string;
}

export interface FormattedAuditPunch {
  id: string;
  action: string;
  time: string;
  duration: string;
  status: string;
  type: string;
  rawDate: Date;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LogIn,
  Coffee,
  Utensils,
  LogOut,
};

function assignShiftDay(date: Date): { year: number; month: number; day: number } {
  const h = date.getHours();
  const shiftDate = new Date(date);
  if (h < 9) {
    shiftDate.setDate(shiftDate.getDate() - 1);
  }
  return {
    year: shiftDate.getFullYear(),
    month: shiftDate.getMonth(), // 0-indexed
    day: shiftDate.getDate(),
  };
}

function getInitialShiftDate(): Date {
  const now = new Date();
  // Default to active reference date or current shift date
  if (now.getHours() < 9) {
    const prev = new Date(now);
    prev.setDate(prev.getDate() - 1);
    return prev;
  }
  return now;
}

function formatDurationFriendly(mins: number): string {
  if (mins <= 0) return '0 mins';
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`;
  return `${h} hr${h > 1 ? 's' : ''} ${m}m`;
}

export default function LiveShiftPunchTimeline({ 
  embedded = false,
  supervisorId = '1597',
  shiftSchedule = '9:00 PM – 6:00 AM'
}: LiveShiftPunchTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => getInitialShiftDate());
  const [allEmpLogs, setAllEmpLogs] = useState<any[]>([]);
  const [isLoadingPunches, setIsLoadingPunches] = useState(false);

  // Fetch live punch logs for this supervisor
  const fetchShiftPunches = useCallback(async () => {
    try {
      setIsLoadingPunches(true);
      const res = await fetch(`/api/punch-logs?empId=${supervisorId}`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setAllEmpLogs(data.data);
      }
    } catch (err) {
      console.error('Error loading punch milestones:', err);
    } finally {
      setIsLoadingPunches(false);
    }
  }, [supervisorId]);

  useEffect(() => {
    fetchShiftPunches();
  }, [fetchShiftPunches]);

  // Listen for global punch updates & calendar edits
  useEffect(() => {
    const handlePunchUpdate = () => {
      fetchShiftPunches();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('punch-updated', handlePunchUpdate);
      window.addEventListener('attendance-override-updated', handlePunchUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('punch-updated', handlePunchUpdate);
        window.removeEventListener('attendance-override-updated', handlePunchUpdate);
      }
    };
  }, [fetchShiftPunches]);

  // Filter punch logs for the currently selected shift date (matches both shift cycle & direct date)
  const shiftPunches = useMemo(() => {
    const targetDate = selectedDate || new Date();
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const targetDay = targetDate.getDate();

    const seenIds = new Set<string>();
    const matched = allEmpLogs.filter((log) => {
      const rawTs = log.parsedDate || log.timestamp || log.TIMESTAMP;
      if (!rawTs) return false;
      const d = new Date(rawTs);
      if (isNaN(d.getTime())) return false;

      const shift = assignShiftDay(d);
      const isShiftMatch = (shift.year === targetYear && shift.month === targetMonth && shift.day === targetDay);
      const isDirectMatch = (d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === targetDay);

      if (isShiftMatch || isDirectMatch) {
        const idKey = String(log.id || `${log.type}-${rawTs}`);
        if (!seenIds.has(idKey)) {
          seenIds.add(idKey);
          return true;
        }
      }
      return false;
    });

    matched.sort((a, b) => {
      const da = new Date(a.parsedDate || a.timestamp || a.TIMESTAMP).getTime();
      const db = new Date(b.parsedDate || b.timestamp || b.TIMESTAMP).getTime();
      return da - db;
    });

    return matched;
  }, [allEmpLogs, selectedDate]);

  // Compute 5 Visual Milestones for the selected date
  const milestones: ShiftMilestoneItem[] = useMemo(() => {
    const shiftStartPunch = shiftPunches.find((p) => (p.type || p.punch_type || '').toLowerCase().includes('shift start'));
    const b1StartPunch = shiftPunches.find((p) => {
      const t = (p.type || p.punch_type || '').toLowerCase();
      return t.includes('break 1 start') || (t.includes('start break') && !t.includes('2'));
    });
    const b1EndPunch = shiftPunches.find((p) => {
      const t = (p.type || p.punch_type || '').toLowerCase();
      return t.includes('break 1 end') || (t.includes('end break') && !t.includes('2'));
    });
    const lunchStartPunch = shiftPunches.find((p) => (p.type || p.punch_type || '').toLowerCase().includes('start lunch'));
    const lunchEndPunch = shiftPunches.find((p) => (p.type || p.punch_type || '').toLowerCase().includes('end lunch'));
    const b2StartPunch = shiftPunches.find((p) => (p.type || p.punch_type || '').toLowerCase().includes('break 2 start'));
    const b2EndPunch = shiftPunches.find((p) => (p.type || p.punch_type || '').toLowerCase().includes('break 2 end'));
    const shiftEndPunch = shiftPunches.find((p) => (p.type || p.punch_type || '').toLowerCase().includes('shift end'));

    const formatPTime = (raw?: string) => {
      if (!raw) return '';
      const d = new Date(raw);
      return !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : raw;
    };

    // 1. Shift Start
    const m1: ShiftMilestoneItem = {
      id: 'm1',
      type: 'punch_in',
      label: 'Shift Start (Punch In)',
      timeRange: shiftStartPunch ? formatPTime(shiftStartPunch.timestamp) : 'Scheduled 9:00 PM',
      duration: shiftStartPunch ? ((shiftStartPunch.status || '').toLowerCase().includes('late') ? 'Late Punch' : 'On Time') : 'Scheduled',
      status: shiftStartPunch ? 'completed' : 'upcoming',
      iconName: 'LogIn',
      color: shiftStartPunch ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    };

    // 2. Break 1
    let b1Duration = '15 mins expected';
    if (b1StartPunch && b1EndPunch) {
      const sMs = new Date(b1StartPunch.timestamp).getTime();
      const eMs = new Date(b1EndPunch.timestamp).getTime();
      const m = Math.round((eMs - sMs) / 60000);
      b1Duration = formatDurationFriendly(m > 0 ? m : 15);
    } else if (b1EndPunch?.duration && b1EndPunch.duration !== 'N/A') {
      b1Duration = formatDurationFriendly(parseFloat(b1EndPunch.duration) || 15);
    }
    const m2: ShiftMilestoneItem = {
      id: 'm2',
      type: 'break_1',
      label: '1st Paid Break (15m)',
      timeRange: b1StartPunch && b1EndPunch
        ? `${formatPTime(b1StartPunch.timestamp)} – ${formatPTime(b1EndPunch.timestamp)}`
        : b1StartPunch
        ? `${formatPTime(b1StartPunch.timestamp)} – ...`
        : 'Scheduled ~11:30 PM',
      duration: b1Duration,
      status: b1EndPunch ? 'completed' : b1StartPunch ? 'active' : 'upcoming',
      iconName: 'Coffee',
      color: b1EndPunch ? 'bg-emerald-500 text-white' : b1StartPunch ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    };

    // 3. Lunch Break
    let lunchDuration = '1 hr expected';
    if (lunchStartPunch && lunchEndPunch) {
      const sMs = new Date(lunchStartPunch.timestamp).getTime();
      const eMs = new Date(lunchEndPunch.timestamp).getTime();
      const m = Math.round((eMs - sMs) / 60000);
      lunchDuration = formatDurationFriendly(m > 0 ? m : 60);
    } else if (lunchEndPunch?.duration && lunchEndPunch.duration !== 'N/A') {
      lunchDuration = formatDurationFriendly(parseFloat(lunchEndPunch.duration) || 60);
    }
    const m3: ShiftMilestoneItem = {
      id: 'm3',
      type: 'lunch',
      label: 'Meal / Lunch (1h)',
      timeRange: lunchStartPunch && lunchEndPunch
        ? `${formatPTime(lunchStartPunch.timestamp)} – ${formatPTime(lunchEndPunch.timestamp)}`
        : lunchStartPunch
        ? `${formatPTime(lunchStartPunch.timestamp)} – ...`
        : 'Scheduled ~1:00 AM',
      duration: lunchDuration,
      status: lunchEndPunch ? 'completed' : lunchStartPunch ? 'active' : 'upcoming',
      iconName: 'Utensils',
      color: lunchEndPunch ? 'bg-emerald-500 text-white' : lunchStartPunch ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    };

    // 4. Break 2
    let b2Duration = '15 mins expected';
    if (b2StartPunch && b2EndPunch) {
      const sMs = new Date(b2StartPunch.timestamp).getTime();
      const eMs = new Date(b2EndPunch.timestamp).getTime();
      const m = Math.round((eMs - sMs) / 60000);
      b2Duration = formatDurationFriendly(m > 0 ? m : 15);
    } else if (b2EndPunch?.duration && b2EndPunch.duration !== 'N/A') {
      b2Duration = formatDurationFriendly(parseFloat(b2EndPunch.duration) || 15);
    }
    const m4: ShiftMilestoneItem = {
      id: 'm4',
      type: 'break_2',
      label: '2nd Paid Break (15m)',
      timeRange: b2StartPunch && b2EndPunch
        ? `${formatPTime(b2StartPunch.timestamp)} – ${formatPTime(b2EndPunch.timestamp)}`
        : b2StartPunch
        ? `${formatPTime(b2StartPunch.timestamp)} – ...`
        : 'Scheduled ~4:00 AM',
      duration: b2Duration,
      status: b2EndPunch ? 'completed' : b2StartPunch ? 'active' : 'upcoming',
      iconName: 'Coffee',
      color: b2EndPunch ? 'bg-emerald-500 text-white' : b2StartPunch ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    };

    // 5. Shift End
    let shiftEndDuration = '9.0 hrs total shift';
    if (shiftEndPunch) {
      if (shiftStartPunch) {
        const startMs = new Date(shiftStartPunch.timestamp).getTime();
        const endMs = new Date(shiftEndPunch.timestamp).getTime();
        if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
          const grossHours = (endMs - startMs) / (1000 * 3600);
          const netHours = Math.max(0, grossHours - 1.25);
          shiftEndDuration = `${netHours.toFixed(1)} hrs completed`;
        } else {
          shiftEndDuration = '8.0 hrs completed';
        }
      } else {
        shiftEndDuration = '8.0 hrs completed';
      }
    }
    const m5: ShiftMilestoneItem = {
      id: 'm5',
      type: 'punch_out',
      label: 'Shift End (Punch Out)',
      timeRange: shiftEndPunch ? formatPTime(shiftEndPunch.timestamp) : 'Scheduled ~6:00 AM',
      duration: shiftEndDuration,
      status: shiftEndPunch ? 'completed' : 'upcoming',
      iconName: 'LogOut',
      color: shiftEndPunch ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    };

    return [m1, m2, m3, m4, m5];
  }, [shiftPunches]);

  // Format punch history table rows with Duration & Status columns (Option 2)
  const auditHistory: FormattedAuditPunch[] = useMemo(() => {
    return shiftPunches.map((p, idx) => {
      const pDate = new Date(p.parsedDate || p.timestamp || p.TIMESTAMP);
      const timeFormatted = !isNaN(pDate.getTime())
        ? pDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
        : p.timestamp || '—';

      const pType = (p.type || p.punch_type || 'Shift Action').trim();
      const pTypeLower = pType.toLowerCase();

      // Look backwards for the immediately preceding corresponding Start punch
      const priorPunches = shiftPunches.slice(0, idx).reverse();

      // Determine accurate Duration
      let durationStr = '—';
      if (p.duration && p.duration !== 'N/A') {
        const dNum = parseFloat(p.duration);
        durationStr = !isNaN(dNum) ? formatDurationFriendly(Math.round(dNum)) : String(p.duration);
      } else if (pTypeLower.includes('break 1 end') || pTypeLower.includes('end break 1') || (pTypeLower.includes('end break') && !pTypeLower.includes('2'))) {
        const startP = priorPunches.find((prevP) => {
          const t = (prevP.type || '').toLowerCase();
          return t.includes('break 1 start') || (t.includes('start break') && !t.includes('2'));
        });
        if (startP) {
          const sMs = new Date(startP.parsedDate || startP.timestamp || startP.TIMESTAMP).getTime();
          const eMs = pDate.getTime();
          const diffMins = Math.round((eMs - sMs) / 60000);
          const mins = (diffMins > 0 && diffMins <= 120) ? diffMins : 15;
          durationStr = formatDurationFriendly(mins);
        } else {
          durationStr = '15 mins';
        }
      } else if (pTypeLower.includes('end lunch') || pTypeLower.includes('lunch end')) {
        const startP = priorPunches.find((prevP) => (prevP.type || '').toLowerCase().includes('lunch'));
        if (startP) {
          const sMs = new Date(startP.parsedDate || startP.timestamp || startP.TIMESTAMP).getTime();
          const eMs = pDate.getTime();
          const diffMins = Math.round((eMs - sMs) / 60000);
          const mins = (diffMins > 0 && diffMins <= 180) ? diffMins : 60;
          durationStr = formatDurationFriendly(mins);
        } else {
          durationStr = '1 hr';
        }
      } else if (pTypeLower.includes('break 2 end') || pTypeLower.includes('end break 2')) {
        const startP = priorPunches.find((prevP) => (prevP.type || '').toLowerCase().includes('break 2 start'));
        if (startP) {
          const sMs = new Date(startP.parsedDate || startP.timestamp || startP.TIMESTAMP).getTime();
          const eMs = pDate.getTime();
          const diffMins = Math.round((eMs - sMs) / 60000);
          const mins = (diffMins > 0 && diffMins <= 120) ? diffMins : 15;
          durationStr = formatDurationFriendly(mins);
        } else {
          durationStr = '15 mins';
        }
      } else if (pTypeLower.includes('shift end')) {
        const startP = priorPunches.find((prevP) => (prevP.type || '').toLowerCase().includes('shift start'));
        if (startP) {
          const sMs = new Date(startP.parsedDate || startP.timestamp || startP.TIMESTAMP).getTime();
          const eMs = pDate.getTime();
          const grossHrs = (eMs - sMs) / 3600000;
          const netHrs = (grossHrs > 0 && grossHrs <= 16) ? Math.max(0, grossHrs - 1.25) : 8.0;
          durationStr = `${netHrs.toFixed(1)} hrs shift`;
        } else {
          durationStr = '8.0 hrs shift';
        }
      }

      // Determine Status badge
      let statusStr = p.status || 'On Time';
      if (pTypeLower.includes('shift start') && p.status?.toLowerCase().includes('late')) {
        statusStr = 'Late';
      }

      return {
        id: p.id || `audit-${idx}-${pDate.getTime()}`,
        action: pType,
        time: timeFormatted,
        duration: durationStr,
        status: statusStr,
        type: pType,
        rawDate: pDate,
      };
    });
  }, [shiftPunches]);

  return (
    <div className={`space-y-4 animate-in fade-in ${
      embedded ? '' : 'p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-2xs'
    }`}>
      
      {/* 1. Milestone Timeline Header Card with DatePicker */}
      <div className="space-y-4">
        
        {/* Title Row with Functional Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#434142]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F8F8F6] tracking-tight">
                Today&apos;s Shift Activity &amp; Punch Audit Trail
              </h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#2F6798]/15 text-[#2F6798] dark:bg-[#3678B0]/30 dark:text-blue-200 border border-[#2F6798]/30 dark:border-[#3678B0]/40 shadow-2xs">
                Live Timeline
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time audit log of shift punch milestones, break durations, and shift completion tracking
            </p>
          </div>

          {/* Right Controls: DatePicker + Shift Schedule Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <DatePickerPopover
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              format="date"
              showArrows
              align="right"
            />
            <span className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#272626] text-xs font-bold text-slate-700 dark:text-[#F8F8F6] border border-slate-200 dark:border-[#434142] font-mono shadow-2xs">
              Shift: {shiftSchedule}
            </span>
          </div>
        </div>

        {/* 2. Visual Milestones Step Flow (Live Calculated from Selected Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {milestones.length > 0 ? (
            milestones.map((m) => {
              const Icon = ICON_MAP[m.iconName] || Clock;
              const isActive = m.status === 'active';
              const isCompleted = m.status === 'completed';

              return (
                <div 
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive 
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-700/60 shadow-xs ring-2 ring-amber-400/20 text-slate-900 dark:text-slate-100'
                      : isCompleted
                      ? 'bg-slate-50/70 dark:bg-[#272626] border-slate-200/80 dark:border-[#434142] text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50/40 dark:bg-[#272626]/50 border-slate-200/50 dark:border-[#434142]/50 opacity-70 text-slate-500'
                  }`}
                >
                  {/* Milestone Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-[#1D2433] text-slate-500 dark:text-slate-400'
                    }`}>
                      {isActive ? '● IN PROGRESS' : isCompleted ? '✓ DONE' : 'SCHEDULED'}
                    </span>
                  </div>

                  {/* Label & Timestamps */}
                  <div>
                    <h4 className="text-xs font-black leading-snug text-slate-900 dark:text-slate-100">
                      {m.label}
                    </h4>
                    <p className={`text-[11px] font-mono mt-1 ${isActive ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {m.timeRange}
                    </p>
                    {m.duration && (
                      <span className={`text-[10px] font-semibold block mt-0.5 ${isActive ? 'text-amber-800/80 dark:text-amber-300/80' : 'text-slate-400'}`}>
                        {m.duration}
                      </span>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-5 p-4 text-center text-xs text-slate-400">
              Loading live shift milestones...
            </div>
          )}
        </div>

        {/* 3. Full-Width Punch Audit Log Table with Duration & Status Columns */}
        <div className="pt-2">
          <div className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-[#272626] border border-slate-200/80 dark:border-[#434142] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2F6798] dark:text-[#3678B0]" />
                <span>Today&apos;s Punch History Log</span>
              </h4>
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                {auditHistory.length} Punches Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#434142] text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Punch Action</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#434142] font-medium text-slate-700 dark:text-slate-300">
                  {auditHistory.length > 0 ? (
                    auditHistory.map((p) => {
                      const isLate = p.status?.toLowerCase().includes('late');
                      const isBreakOrLunch = p.action.includes('Lunch') || p.action.includes('Break');

                      return (
                        <tr key={p.id} className="hover:bg-white/80 dark:hover:bg-[#363435] transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-[#F8F8F6] flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isBreakOrLunch 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`} />
                            <span>{p.action}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#2F6798] dark:text-[#3678B0]">
                            {p.time}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300 text-xs">
                            {p.duration}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                              isLate
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${isLate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <span>{p.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                        No punch logs recorded for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
