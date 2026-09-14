'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Coffee, 
  Utensils, 
  CheckCircle2, 
  LogOut,
  Clock
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
  avatarUrl?: string;
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
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-gradient-to-b from-[#2F6798] via-[#265782] to-[#1C4366] text-white p-6 flex flex-col justify-between rounded-3xl shadow-xl border border-white/10 select-none">
      
      {/* Top Profile Card */}
      <div className="space-y-6">
        
        {/* Circular Avatar & Name */}
        <div className="space-y-3">
          
          {/* Circular Initials Avatar in #2F6798 & #C8A54B Gold Palette */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1C4366] via-[#2F6798] to-[#C8A54B] text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-black/20 ring-2 ring-white/30">
            NR
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {supervisor.name}
            </h2>
            <div className="mt-1.5">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[#C8A54B]/20 text-[#E5CA80] border border-[#C8A54B]/40 uppercase tracking-wide">
                {supervisor.role || 'SUPERVISOR'}
              </span>
            </div>
          </div>

        </div>

        {/* Metadata Details List with Separator Lines */}
        <div className="space-y-4 text-xs">
          
          <div className="pb-3 border-b border-white/15">
            <span className="text-[10px] font-extrabold text-blue-200/80 tracking-wider uppercase block mb-1">
              POSITION
            </span>
            <p className="font-extrabold text-white text-sm">
              {supervisor.position || 'Head of Training'}
            </p>
          </div>

          <div className="pb-3 border-b border-white/15">
            <span className="text-[10px] font-extrabold text-blue-200/80 tracking-wider uppercase block mb-1">
              SHIFT
            </span>
            <p className="font-extrabold text-white text-sm">
              {supervisor.shift || '9:00 PM to 6:00 AM'}
            </p>
          </div>

          <div className="pb-3 border-b border-white/15">
            <span className="text-[10px] font-extrabold text-blue-200/80 tracking-wider uppercase block mb-1">
              ACCOUNT
            </span>
            <p className="font-extrabold text-white text-sm">
              {supervisor.account || 'Corporate'}
            </p>
          </div>

          <div className="pb-3 border-b border-white/15">
            <span className="text-[10px] font-extrabold text-blue-200/80 tracking-wider uppercase block mb-1">
              TENURE
            </span>
            <p className="font-extrabold text-white text-sm">
              {supervisor.tenure || '32 mos'}
            </p>
          </div>

          <div className="pb-1">
            <span className="text-[10px] font-extrabold text-blue-200/80 tracking-wider uppercase block mb-1">
              DIRECT SUPERVISOR
            </span>
            <p className="font-extrabold text-white text-sm">
              {supervisor.directSupervisor || 'June Babe Caballes'}
            </p>
          </div>

        </div>

      </div>

      {/* Bottom Live Punch & Time Actions Card */}
      <div className="mt-8 pt-5 border-t border-white/15 space-y-4">
        
        <div>
          <span className="text-[10px] font-extrabold text-blue-200/80 tracking-wider uppercase block mb-2.5">
            TIME ACTIONS
          </span>

          {/* Status line with white pill and gold/amber elapsed text */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#2F6798] shadow-xs">
              {currentStatus === 'lunch' && 'On Lunch'}
              {currentStatus === 'break' && 'On Break'}
              {currentStatus === 'working' && 'Working'}
              {currentStatus === 'offline' && 'Offline'}
            </span>

            <span className={`text-xs font-extrabold ${isOverTime ? 'text-amber-200 font-black' : 'text-[#E5CA80]'}`}>
              — {currentStatus === 'lunch' ? 'Lunch' : currentStatus === 'break' ? 'Break' : 'Active'}{' '}
              {formatElapsedTime(statusSeconds)}
            </span>
          </div>

          {/* Last punch time */}
          <div className="mt-3 text-xs">
            <span className="text-[10px] font-extrabold text-blue-200/80 uppercase tracking-wider block">
              LAST PUNCH TIME
            </span>
            <span className="text-base font-extrabold text-white mt-0.5 block">
              {lastPunchTime}
            </span>
          </div>
        </div>

        {/* Primary Action Button in #C8A54B Gold Accent */}
        <div>
          {currentStatus === 'lunch' ? (
            <button
              onClick={() => handleActionClick('working', 'End Lunch')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#C8A54B] hover:bg-[#b5923c] active:bg-[#9e7d2f] text-slate-900 font-extrabold text-sm tracking-wide shadow-md shadow-black/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>End Lunch</span>
            </button>
          ) : currentStatus === 'break' ? (
            <button
              onClick={() => handleActionClick('working', 'End Break')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#C8A54B] hover:bg-[#b5923c] active:bg-[#9e7d2f] text-slate-900 font-extrabold text-sm tracking-wide shadow-md shadow-black/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>End Break</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleActionClick('lunch', 'Start Lunch')}
                className="py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Start Lunch</span>
              </button>
              <button
                onClick={() => handleActionClick('break', 'Start Break')}
                className="py-2.5 px-3 rounded-xl bg-[#C8A54B] hover:bg-[#b5923c] text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Start Break</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </aside>
  );
}
