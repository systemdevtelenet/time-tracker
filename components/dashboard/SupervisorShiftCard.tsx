'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  Utensils, 
  Coffee, 
  Building2, 
  CheckCircle2, 
  LogIn, 
  LogOut,
  BellRing,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play
} from 'lucide-react';
import { PunchActionType, ShiftPunchesState } from '@/lib/punchLogs';
import { addActivityLog } from '@/lib/activityLogs';
import { playAlarmSound, getSelectedRingtone, RINGTONE_OPTIONS } from '@/lib/soundAlerts';

export interface SupervisorShiftCardProps {
  supervisor?: {
    name: string;
    id: string;
    role: string;
    position: string;
    shift: string;
    account: string;
    tenure: string;
    directSupervisor: string;
    avatarUrl?: string;
  };
  onPunchAction?: (action: string) => void;
  embedded?: boolean;
}

export default function SupervisorShiftCard({
  supervisor = {
    name: 'Nissi-Jeh Reguero',
    id: '1597',
    role: 'SUPERVISOR',
    position: 'Head of Training',
    shift: '9:00 PM to 6:00 AM',
    account: 'Corporate',
    tenure: '32 mos',
    directSupervisor: 'June Babe Caballes',
  },
  onPunchAction,
  embedded = false,
}: SupervisorShiftCardProps) {
  const [currentStatus, setCurrentStatus] = useState<'working' | 'lunch' | 'break_1' | 'break_2' | 'offline'>('lunch');
  const [statusSeconds, setStatusSeconds] = useState<number>(0);
  const [lastPunchTime, setLastPunchTime] = useState<string>('1:57:09 AM');
  const [lastPunchType, setLastPunchType] = useState<string>('Start Lunch');
  const [punchesState, setPunchesState] = useState<ShiftPunchesState>({
    hasShiftStart: true,
    hasBreak1Start: true,
    hasBreak1End: true,
    hasLunchStart: true,
    hasLunchEnd: false,
    hasBreak2Start: false,
    hasBreak2End: false,
    hasShiftEnd: false,
  });
  const [isPunching, setIsPunching] = useState<boolean>(false);

  // Break / Lunch Alarm Alert State
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);
  const [alarmType, setAlarmType] = useState<'nearly_up' | 'exceeded' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const lastAlertedStageRef = useRef<'none' | 'nearly_up' | 'exceeded'>('none');
  const [currentRingtoneName, setCurrentRingtoneName] = useState<string>('Welcome to the Jungle (classic)');

  // Sync current configured ringtone name
  useEffect(() => {
    const updateRingtoneName = () => {
      const activeId = getSelectedRingtone();
      const match = RINGTONE_OPTIONS.find((r) => r.id === activeId);
      setCurrentRingtoneName(match ? match.name : 'Welcome to the Jungle (classic)');
    };
    updateRingtoneName();

    if (typeof window !== 'undefined') {
      window.addEventListener('alarm-ringtone-changed', updateRingtoneName);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('alarm-ringtone-changed', updateRingtoneName);
      }
    };
  }, []);

  // Break limit calculation in seconds (15 mins for breaks, 60 mins for lunch)
  const getBreakLimitSecs = (status: string) => {
    if (status === 'break_1' || status === 'break_2') return 15 * 60; // 15 mins = 900s
    if (status === 'lunch') return 60 * 60; // 60 mins = 3600s
    return 0;
  };

  // Reset alert state when status or punch changes
  useEffect(() => {
    lastAlertedStageRef.current = 'none';
    setIsAlarmRinging(false);
    setAlarmType(null);
    setIsMuted(false);
  }, [currentStatus]);

  // Break timer alarm check
  useEffect(() => {
    if (currentStatus !== 'break_1' && currentStatus !== 'break_2' && currentStatus !== 'lunch') {
      return;
    }
    const limit = getBreakLimitSecs(currentStatus);
    if (limit <= 0) return;

    const remaining = limit - statusSeconds;

    // 1. Limit Exceeded Alert (Overtime)
    if (remaining < 0) {
      if (lastAlertedStageRef.current !== 'exceeded') {
        lastAlertedStageRef.current = 'exceeded';
        setIsAlarmRinging(true);
        setAlarmType('exceeded');
        if (!isMuted) {
          playAlarmSound(undefined, () => setIsAlarmRinging(false));
        }
      }
    } 
    // 2. Nearly Up Alert (<= 2 mins for break, <= 5 mins for lunch)
    else if ((limit <= 900 && remaining <= 120) || (limit > 900 && remaining <= 300)) {
      if (lastAlertedStageRef.current === 'none') {
        lastAlertedStageRef.current = 'nearly_up';
        setIsAlarmRinging(true);
        setAlarmType('nearly_up');
        if (!isMuted) {
          playAlarmSound(undefined, () => setIsAlarmRinging(false));
        }
      }
    }
  }, [statusSeconds, currentStatus, isMuted]);

  // Test ringtone playback
  const handleTestAlarm = () => {
    setIsAlarmRinging(true);
    playAlarmSound(undefined, () => setIsAlarmRinging(false));
  };

  // Fetch live punch status from API
  const fetchPunchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/punch-logs?empId=${supervisor.id}`);
      const data = await res.json();
      if (data.currentStatus) {
        setCurrentStatus(data.currentStatus.status);
        setStatusSeconds(data.currentStatus.elapsedSeconds || 0);
        setLastPunchTime(data.currentStatus.lastPunchTime || '--:--');
        setLastPunchType(data.currentStatus.lastPunchType || '');
        if (data.currentStatus.punchesState) {
          setPunchesState(data.currentStatus.punchesState);
        }
      }
    } catch (err) {
      console.error('Error fetching punch status:', err);
    }
  }, [supervisor.id]);

  useEffect(() => {
    fetchPunchStatus();
  }, [fetchPunchStatus]);

  // Listen to external punch updates
  useEffect(() => {
    const handlePunchUpdate = () => {
      fetchPunchStatus();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('punch-updated', handlePunchUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('punch-updated', handlePunchUpdate);
      }
    };
  }, [fetchPunchStatus]);

  // Live timer tick incrementing every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h  ${m.toString().padStart(2, '0')}m  ${s.toString().padStart(2, '0')}s`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NR';
  };

  const handlePunch = async (actionType: PunchActionType) => {
    if (isPunching) return;
    setIsPunching(true);
    try {
      const res = await fetch('/api/punch-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: supervisor.id,
          type: actionType,
          status: 'On Time',
        }),
      });
      const resData = await res.json();
      if (resData.currentStatus) {
        setCurrentStatus(resData.currentStatus.status);
        setStatusSeconds(0);
        setLastPunchTime(resData.currentStatus.lastPunchTime);
        setLastPunchType(resData.currentStatus.lastPunchType);
        if (resData.currentStatus.punchesState) {
          setPunchesState(resData.currentStatus.punchesState);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('punch-updated', { detail: { empId: supervisor.id, punchType: actionType } }));
      }

      if (onPunchAction) {
        onPunchAction(actionType);
      } else {
        addActivityLog({
          title: `${actionType} Recorded`,
          description: `${supervisor.name} performed shift punch action: ${actionType}.`,
          performedBy: supervisor.name,
          category: 'PUNCH',
          type: 'punch',
        });
      }
    } catch (err) {
      console.error('Error executing punch:', err);
    } finally {
      setIsPunching(false);
    }
  };

  // Define the 8 Direct Punch Actions (Option 1: 4x2 Grid)
  const punchActionsList: {
    type: PunchActionType;
    label: string;
    icon: any;
    isDone: boolean;
    isCurrent: boolean;
    colorTheme: string;
  }[] = [
    { 
      type: 'Shift Start', 
      label: 'Shift Start', 
      icon: LogIn, 
      isDone: punchesState.hasShiftStart, 
      isCurrent: currentStatus === 'working' && lastPunchType === 'Shift Start',
      colorTheme: 'emerald'
    },
    { 
      type: 'Break 1 Start', 
      label: 'Break 1 Start', 
      icon: Coffee, 
      isDone: punchesState.hasBreak1Start, 
      isCurrent: currentStatus === 'break_1',
      colorTheme: 'amber'
    },
    { 
      type: 'Break 1 End', 
      label: 'Break 1 End', 
      icon: Coffee, 
      isDone: punchesState.hasBreak1End, 
      isCurrent: currentStatus === 'working' && lastPunchType === 'Break 1 End',
      colorTheme: 'amber'
    },
    { 
      type: 'Start Lunch', 
      label: 'Start Lunch', 
      icon: Utensils, 
      isDone: punchesState.hasLunchStart, 
      isCurrent: currentStatus === 'lunch',
      colorTheme: 'blue'
    },
    { 
      type: 'End Lunch', 
      label: 'End Lunch', 
      icon: Utensils, 
      isDone: punchesState.hasLunchEnd, 
      isCurrent: currentStatus === 'working' && lastPunchType === 'End Lunch',
      colorTheme: 'blue'
    },
    { 
      type: 'Break 2 Start', 
      label: 'Break 2 Start', 
      icon: Coffee, 
      isDone: punchesState.hasBreak2Start, 
      isCurrent: currentStatus === 'break_2',
      colorTheme: 'amber'
    },
    { 
      type: 'Break 2 End', 
      label: 'Break 2 End', 
      icon: Coffee, 
      isDone: punchesState.hasBreak2End, 
      isCurrent: currentStatus === 'working' && lastPunchType === 'Break 2 End',
      colorTheme: 'amber'
    },
    { 
      type: 'Shift End', 
      label: 'Shift End', 
      icon: LogOut, 
      isDone: punchesState.hasShiftEnd, 
      isCurrent: currentStatus === 'offline',
      colorTheme: 'rose'
    },
  ];

  return (
    <div className={`w-full text-slate-900 dark:text-slate-100 space-y-4 transition-all ${
      embedded ? '' : 'bg-white dark:bg-[#0E1B38] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs'
    }`}>
      
      {/* 1. Header Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          {/* Circular Initials / Avatar Image */}
          <div className="w-12 h-12 rounded-full bg-[#2F6798] text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-[#2F6798]/20 shrink-0 select-none overflow-hidden">
            {supervisor.avatarUrl ? (
              <img
                src={supervisor.avatarUrl}
                alt={supervisor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(supervisor.name)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {supervisor.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 border border-[#2F6798]/20 text-[10px] font-black tracking-wider uppercase">
                {supervisor.role}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Employee ID: <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{supervisor.id}</span>
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentStatus === 'lunch' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              On Lunch
            </span>
          ) : currentStatus === 'break_1' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              On 1st Break
            </span>
          ) : currentStatus === 'break_2' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              On 2nd Break
            </span>
          ) : currentStatus === 'offline' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Shift Ended
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Working
            </span>
          )}
        </div>
      </div>

      {/* Active Break / Lunch Alarm & Limit Warning Banner */}
      {(currentStatus === 'break_1' || currentStatus === 'break_2' || currentStatus === 'lunch') && (
        <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all animate-in fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          alarmType === 'exceeded'
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-xs'
            : alarmType === 'nearly_up'
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-xs'
            : 'bg-blue-50/60 dark:bg-[#13233E]/80 border-blue-200/80 dark:border-blue-900/50 text-slate-800 dark:text-slate-200'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              alarmType === 'exceeded'
                ? 'bg-rose-500 text-white animate-bounce'
                : alarmType === 'nearly_up'
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-[#2F6798] text-white'
            }`}>
              <BellRing className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight">
                  {alarmType === 'exceeded'
                    ? '⚠️ Break Limit Exceeded (Alarm Ringing!)'
                    : alarmType === 'nearly_up'
                    ? '⏰ Break Time Nearly Up!'
                    : currentStatus === 'lunch'
                    ? 'Lunch Break in Progress (60m Limit)'
                    : 'Scheduled Break in Progress (15m Limit)'}
                </span>

                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/80 dark:bg-[#272626] border border-slate-200/60 dark:border-slate-700">
                  Sound: {currentRingtoneName}
                </span>
              </div>

              <p className="text-xs opacity-80 mt-0.5">
                {alarmType === 'exceeded'
                  ? `You have exceeded your ${currentStatus === 'lunch' ? '60-minute' : '15-minute'} limit by ${Math.abs(Math.floor((getBreakLimitSecs(currentStatus) - statusSeconds) / 60))}m ${Math.abs((getBreakLimitSecs(currentStatus) - statusSeconds) % 60)}s.`
                  : `Remaining: ${Math.max(0, Math.floor((getBreakLimitSecs(currentStatus) - statusSeconds) / 60))}m ${Math.max(0, (getBreakLimitSecs(currentStatus) - statusSeconds) % 60)}s before alarm triggers.`}
              </p>
            </div>
          </div>

          {/* Action Buttons: Test Ring / Mute Alarm */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTestAlarm}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-[#2F6798] dark:text-[#60A5FA]" />
              <span>Test Alarm</span>
            </button>

            {isAlarmRinging && (
              <button
                type="button"
                onClick={() => {
                  setIsMuted(true);
                  setIsAlarmRinging(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5 text-white" />
                <span>Stop Ringing</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Horizontal Grid: Left (TIME CLOCK & PUNCH with 8-Action Grid) + Right (POSITION & ASSIGNMENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* TIME CLOCK & PUNCH SECTION (Left Side - White Container with Option 1 8-Button Grid) */}
        <div className="lg:col-span-6 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-2xs">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>TIME CLOCK &amp; PUNCH</span>
            </span>
            <span className="text-[10px] font-bold text-[#2F6798] dark:text-blue-400">
              Live Shift Timer
            </span>
          </div>

          {/* 2-Column Duration and Last Punch in Light Gray */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {currentStatus === 'lunch' 
                  ? 'LUNCH DURATION' 
                  : currentStatus === 'break_1' 
                  ? '1ST BREAK DURATION' 
                  : currentStatus === 'break_2' 
                  ? '2ND BREAK DURATION' 
                  : currentStatus === 'offline' 
                  ? 'OFFLINE' 
                  : 'WORKING TIME'}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
                {formatTimer(statusSeconds)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                LAST PUNCH
              </span>
              <span className="text-sm sm:text-base font-black text-[#2F6798] dark:text-blue-400 font-mono mt-0.5 block truncate" title={`${lastPunchType} at ${lastPunchTime}`}>
                {lastPunchTime}
              </span>
            </div>
          </div>

          {/* OPTION 1: Complete 8-Action Direct Punch Grid (Always Visible & Directly Clickable) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[9.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Shift Punch Controls (8 Actions)
              </span>
              <span className="text-[9.5px] font-bold text-[#2F6798] dark:text-blue-300 font-mono">
                {Object.values(punchesState).filter(Boolean).length}/8 Recorded
              </span>
            </div>

            {/* 4x2 Clean Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {punchActionsList.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.type}
                    type="button"
                    disabled={isPunching}
                    onClick={() => handlePunch(action.type)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center group disabled:opacity-50 select-none ${
                      action.isCurrent
                        ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/50 shadow-xs scale-[1.02]'
                        : action.isDone
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100'
                        : action.type === 'Shift End'
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:border-[#2F6798] hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Icon className={`w-3.5 h-3.5 ${
                        action.isCurrent 
                          ? 'text-white' 
                          : action.isDone 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : action.type === 'Shift End'
                          ? 'text-rose-600'
                          : 'text-[#2F6798] dark:text-blue-400'
                      }`} />
                      {action.isDone && !action.isCurrent && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    
                    <span className="text-[10px] font-black leading-tight line-clamp-1">
                      {action.label}
                    </span>

                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                      action.isCurrent
                        ? 'bg-white/25 text-white animate-pulse'
                        : action.isDone
                        ? 'bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {action.isCurrent ? 'ACTIVE' : action.isDone ? 'DONE' : 'PUNCH'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* POSITION & ASSIGNMENT SECTION (Right Side - White Container) */}
        <div className="lg:col-span-6 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 space-y-3 flex flex-col justify-start shadow-2xs">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>POSITION &amp; ASSIGNMENT</span>
            </span>

            {/* Department Tag & Time Actions Pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-[#2F6798] dark:text-blue-200 uppercase tracking-wider bg-[#2F6798]/15 dark:bg-[#2F6798]/30 px-3 py-1 rounded-full border border-[#2F6798]/30 shadow-2xs">
                {supervisor.account} Department
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Time Actions:
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                  currentStatus === 'offline'
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    : currentStatus === 'lunch' || currentStatus === 'break_1' || currentStatus === 'break_2'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    currentStatus === 'offline' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'
                  }`} />
                  {currentStatus === 'offline' ? 'Shift Ended' : currentStatus === 'lunch' ? 'On Lunch' : currentStatus === 'break_1' ? 'On 1st Break' : currentStatus === 'break_2' ? 'On 2nd Break' : 'Active (Working)'}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Inner Metric Boxes in Light Gray */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Position */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                POSITION
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                {supervisor.position}
              </span>
            </div>

            {/* Shift Schedule */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                SHIFT SCHEDULE
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#2F6798] dark:text-blue-400 font-mono mt-0.5 block">
                {supervisor.shift}
              </span>
            </div>

            {/* Account & Tenure */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                ACCOUNT &amp; TENURE
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {supervisor.account} <span className="text-slate-500 font-normal">({supervisor.tenure})</span>
              </span>
            </div>

            {/* Direct Supervisor */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                DIRECT SUPERVISOR
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                {supervisor.directSupervisor}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
