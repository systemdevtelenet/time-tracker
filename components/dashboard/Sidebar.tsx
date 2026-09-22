'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Coffee, 
  Utensils, 
  CheckCircle2, 
  LogOut,
  Clock,
  User,
  Building,
  Briefcase,
  Shield,
  Calendar,
  Sparkles
} from 'lucide-react';

export interface SupervisorProfile {
  name: string;
  id: string;
  role: string;
  position: string;
  shift: string;
  account: string;
  tenure: string;
  directSupervisor: string;
  email?: string;
  avatarUrl?: string | null;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  department?: string;
  startDate?: string;
  accounts?: string;
  primaryTask?: string;
}

interface SidebarProps {
  supervisor: SupervisorProfile;
  onPunchAction?: (action: string) => void;
}

export default function Sidebar({
  supervisor,
  onPunchAction,
}: SidebarProps) {
  // Live Punch State - starting at 1h 05m 23s
  const [currentStatus, setCurrentStatus] = useState<'working' | 'lunch' | 'break' | 'offline'>('lunch');
  const [statusSeconds, setStatusSeconds] = useState<number>(1 * 3600 + 5 * 60 + 23);
  const [lastPunchTime, setLastPunchTime] = useState<string>('1:57:09 AM');

  // Live timer tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsedTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const isOverTime = statusSeconds > 3600;

  const handleActionClick = (newStatus: 'working' | 'lunch' | 'break' | 'offline', label: string) => {
    setCurrentStatus(newStatus);
    setStatusSeconds(0);
    const now = new Date();
    const formatted = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setLastPunchTime(formatted);
    if (onPunchAction) onPunchAction(label);
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-[#2F6798] text-white p-5 sm:p-6 flex flex-col gap-5 rounded-3xl shadow-lg border border-white/10 select-none">
      
      {/* 1. Supervisor Profile Header */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-white/15">
        {/* Solid Circular Initials Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white/30 shadow-sm shrink-0">
          NR
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-white tracking-tight truncate">
            {supervisor.name}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white border border-white/30 uppercase tracking-wide">
              {supervisor.role || 'SUPERVISOR'}
            </span>
            <span className="text-[11px] text-blue-100/90 font-medium">
              ID: {supervisor.id}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT TIME CLOCK & PUNCH ACTIONS CARD (Placed at the top for optimal UX) */}
      <div className="p-4 rounded-2xl bg-white/10 border border-white/15 shadow-sm space-y-3.5 backdrop-blur-md">
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-blue-100/90 tracking-wider uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Time Clock &amp; Punch</span>
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
            currentStatus === 'lunch'
              ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
              : currentStatus === 'break'
              ? 'bg-orange-400/20 text-orange-200 border border-orange-400/40'
              : currentStatus === 'working'
              ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
              : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentStatus === 'working' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span>
              {currentStatus === 'lunch' && 'On Lunch'}
              {currentStatus === 'break' && 'On Break'}
              {currentStatus === 'working' && 'Working'}
              {currentStatus === 'offline' && 'Offline'}
            </span>
          </span>
        </div>

        {/* Live Elapsed Counter */}
        <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-100/80 uppercase block">
              {currentStatus === 'lunch' ? 'Lunch Duration' : currentStatus === 'break' ? 'Break Duration' : 'Active Time'}
            </span>
            <span className="text-lg font-black font-mono text-white tracking-tight">
              {formatElapsedTime(statusSeconds)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-blue-100/80 uppercase block">
              Last Punch
            </span>
            <span className="text-xs font-bold text-amber-200">
              {lastPunchTime}
            </span>
          </div>
        </div>

        {/* Primary Action Button - Prominent & Easy to Click */}
        <div>
          {currentStatus === 'lunch' ? (
            <button
              type="button"
              onClick={() => handleActionClick('working', 'End Lunch')}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4 text-slate-950" />
              <span>End Lunch</span>
            </button>
          ) : currentStatus === 'break' ? (
            <button
              type="button"
              onClick={() => handleActionClick('working', 'End Break')}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coffee className="w-4 h-4 text-slate-950" />
              <span>End Break</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleActionClick('lunch', 'Start Lunch')}
                className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-300" />
                <span>Start Lunch</span>
              </button>
              <button
                type="button"
                onClick={() => handleActionClick('break', 'Start Break')}
                className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5 text-slate-950" />
                <span>Start Break</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. Supervisor Details & Shift Info List */}
      <div className="space-y-3 flex-1">
        <span className="text-[10px] font-extrabold text-blue-100/90 tracking-wider uppercase px-1 block">
          POSITION &amp; ASSIGNMENT
        </span>

        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-blue-100/70 uppercase block mb-0.5">
              POSITION
            </span>
            <p className="font-extrabold text-white text-xs sm:text-sm">
              {supervisor.position || 'Head of Training'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-white/10">
            <span className="text-[10px] font-bold text-blue-100/70 uppercase block mb-0.5">
              SHIFT SCHEDULE
            </span>
            <p className="font-extrabold text-white text-xs sm:text-sm">
              {supervisor.shift || '9:00 PM to 6:00 AM'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-200/70 uppercase block mb-0.5">
                ACCOUNT
              </span>
              <p className="font-extrabold text-white text-xs sm:text-sm">
                {supervisor.account || 'Corporate'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-blue-200/70 uppercase block mb-0.5">
                TENURE
              </span>
              <p className="font-extrabold text-white text-xs sm:text-sm">
                {supervisor.tenure || '32 mos'}
              </p>
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/10">
            <span className="text-[10px] font-bold text-blue-200/70 uppercase block mb-0.5">
              DIRECT SUPERVISOR
            </span>
            <p className="font-extrabold text-white text-xs sm:text-sm">
              {supervisor.directSupervisor || 'June Babe Caballes'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom System Status */}
      <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200/80 font-medium">
        <span>Cebu Tele-Net v2.4</span>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Synced
        </span>
      </div>

    </aside>
  );
}

