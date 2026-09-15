'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Utensils, Coffee, Shield, CheckCircle2, User, Building2, Calendar, Award } from 'lucide-react';

interface SupervisorShiftCardProps {
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
}: SupervisorShiftCardProps) {
  const [currentStatus, setCurrentStatus] = useState<'working' | 'lunch' | 'break' | 'offline'>('lunch');
  const [statusSeconds, setStatusSeconds] = useState<number>(1 * 3600 + 13 * 60 + 47);
  const [lastPunchTime, setLastPunchTime] = useState<string>('1:57:09 AM');

  // Live timer tick
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

  const handlePunch = (newStatus: 'working' | 'lunch' | 'break' | 'offline', label: string) => {
    setCurrentStatus(newStatus);
    setStatusSeconds(0);
    const now = new Date();
    setLastPunchTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));
    if (onPunchAction) onPunchAction(label);
  };

  return (
    <div className="w-full bg-[#153B5E] text-white p-5 sm:p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
      
      {/* 1. Header Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A44] border border-[#C8A54B]/40 flex items-center justify-center text-[#E5CA80] font-black text-base shadow-inner shrink-0">
            NR
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-tight">
                {supervisor.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-md bg-[#C8A54B]/20 text-[#E5CA80] border border-[#C8A54B]/40 text-[10px] font-black tracking-wider uppercase">
                {supervisor.role}
              </span>
            </div>
            <p className="text-[11px] font-bold text-blue-200/80 mt-0.5">
              Employee ID: <span className="text-white font-mono">{supervisor.id}</span> • {supervisor.position}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A54B]/20 border border-[#C8A54B]/40 text-xs font-black text-[#E5CA80]">
            <span className="w-2 h-2 rounded-full bg-[#E5CA80] animate-pulse"></span>
            {currentStatus === 'lunch' ? '● On Lunch' : currentStatus === 'break' ? '● On Break' : '● Working'}
          </span>
        </div>
      </div>

      {/* 2. Main Horizontal Grid: Time Clock & Punch + Position & Shift Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* TIME CLOCK & PUNCH SECTION (Cols 5 on desktop) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#0F2A44] border border-white/10 space-y-3.5 flex flex-col justify-between shadow-inner">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-blue-200/80 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E5CA80]" />
              <span>TIME CLOCK & PUNCH</span>
            </span>
            <span className="text-[10px] font-bold text-blue-200/60">
              Live Shift Timer
            </span>
          </div>

          {/* 2-Column Duration and Last Punch */}
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-extrabold text-blue-200/60 uppercase tracking-wider block">
                {currentStatus === 'lunch' ? 'LUNCH DURATION' : currentStatus === 'break' ? 'BREAK DURATION' : 'WORKING TIME'}
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                {formatTimer(statusSeconds)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-extrabold text-blue-200/60 uppercase tracking-wider block">
                LAST PUNCH
              </span>
              <span className="text-base sm:text-lg font-black text-[#E5CA80] font-mono mt-0.5 block">
                {lastPunchTime}
              </span>
            </div>
          </div>

          {/* Large Action Button */}
          {currentStatus === 'lunch' ? (
            <button
              type="button"
              onClick={() => handlePunch('working', 'End Lunch')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C8A54B] hover:bg-[#b8933a] active:bg-[#a6822f] text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>End Lunch</span>
            </button>
          ) : currentStatus === 'break' ? (
            <button
              type="button"
              onClick={() => handlePunch('working', 'End Break')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C8A54B] hover:bg-[#b8933a] active:bg-[#a6822f] text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>End Break</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePunch('lunch', 'Start Lunch')}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5 text-[#E5CA80]" />
                <span>Start Lunch</span>
              </button>
              <button
                type="button"
                onClick={() => handlePunch('break', 'Start Break')}
                className="py-2.5 px-3 rounded-xl bg-[#C8A54B] hover:bg-[#b8933a] text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Start Break</span>
              </button>
            </div>
          )}
        </div>

        {/* POSITION & ASSIGNMENT SECTION (Cols 7 on desktop) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-[#0F2A44] border border-white/10 space-y-3 shadow-inner flex flex-col justify-between">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-blue-200/80 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>POSITION & ASSIGNMENT</span>
            </span>
            <span className="text-[10px] font-bold text-[#E5CA80] uppercase tracking-wider">
              {supervisor.account} Department
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Position */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-extrabold text-blue-200/60 uppercase tracking-wider block">
                POSITION
              </span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">
                {supervisor.position}
              </span>
            </div>

            {/* Shift Schedule */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-extrabold text-blue-200/60 uppercase tracking-wider block">
                SHIFT SCHEDULE
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#E5CA80] font-mono mt-0.5 block">
                {supervisor.shift}
              </span>
            </div>

            {/* Account & Tenure */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-extrabold text-blue-200/60 uppercase tracking-wider block">
                ACCOUNT & TENURE
              </span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">
                {supervisor.account} <span className="text-blue-200/60">({supervisor.tenure})</span>
              </span>
            </div>

            {/* Direct Supervisor */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-extrabold text-blue-200/60 uppercase tracking-wider block">
                DIRECT SUPERVISOR
              </span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">
                {supervisor.directSupervisor}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
