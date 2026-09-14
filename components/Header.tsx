'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Sun, Moon, UserCircle2, Sparkles, PhoneCall, LogIn } from 'lucide-react';
import { EmployeeOption } from '@/lib/types';

interface HeaderProps {
  currentAgent: string;
  onAgentChange: (agent: string) => void;
  employees: EmployeeOption[];
  isTracking: boolean;
  activeSeconds: number;
}

export default function Header({
  currentAgent,
  onAgentChange,
  employees,
  isTracking,
  activeSeconds,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [timeNow, setTimeNow] = useState('');

  useEffect(() => {
    // Check initial dark mode
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }

    const interval = setInterval(() => {
      const d = new Date();
      setTimeNow(
        d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatTimerMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2F6798] to-[#1e4566] text-white flex items-center justify-center shadow-md shadow-[#2F6798]/20 ring-2 ring-[#2F6798]/30">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                Tele-net <span className="text-[#2F6798] dark:text-[#5fa5de]">TimeTracker</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-[#2F6798] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <Sparkles className="w-2.5 h-2.5" />
                Live DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Phone & Shift Activity Tracking System
            </p>
          </div>
        </div>

        {/* Live Active Call Indicator (if running) */}
        {isTracking && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 animate-pulse">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">
              CALL IN PROGRESS: {formatTimerMinSec(activeSeconds)}
            </span>
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#2F6798] dark:text-[#5fa5de]" />
            <span>{timeNow || 'Loading...'}</span>
          </div>

          {/* User / Agent Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-slate-700 text-xs">
            <UserCircle2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <select
              value={currentAgent}
              onChange={(e) => onAgentChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none text-xs cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
            >
              <option value="Matt Riner Balaba" className="dark:bg-slate-900">Matt Riner Balaba</option>
              <option value="Jeremy Rigodon" className="dark:bg-slate-900">Jeremy Rigodon</option>
              {employees
                .filter((emp) => emp.name && emp.name !== 'Matt Riner Balaba' && emp.name !== 'Jeremy Rigodon')
                .slice(0, 30)
                .map((emp, idx) => (
                  <option key={idx} value={emp.name} className="dark:bg-slate-900">
                    {emp.name} {emp.role ? `(${emp.role})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Dark / Light Mode Button */}
          <button
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Login Page Link */}
          <Link
            href="/login"
            title="Go to Login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all shadow-sm shadow-[#2F6798]/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
