'use client';

import React from 'react';
import { Search, Calendar, Bell, Sun, Moon } from 'lucide-react';

interface CompanyTopNavProps {
  isDark: boolean;
  onToggleTheme: () => void;
  supervisor: {
    name: string;
    id: string;
    role: string;
  };
}

export default function CompanyTopNav({
  isDark,
  onToggleTheme,
  supervisor,
}: CompanyTopNavProps) {
  return (
    <header className="sticky top-0 z-20 w-full bg-white dark:bg-[#0E1B38] border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: System Title */}
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Training Performance Hub
          </h1>
        </div>

        {/* Center: Search with ⌘ K */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Type name, batch, role, or page..."
              className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              ⌘ K
            </span>
          </div>
        </div>

        {/* Right: Date, Notifications, Theme, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Date Selector Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#2F6798]" />
            <span>Today</span>
            <span className="text-[10px] text-slate-400">⌵</span>
          </div>

          {/* Notifications Bell with count badge 10 */}
          <div className="relative">
            <button 
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
              10
            </span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Avatar with Online Status */}
          <div className="relative pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2F6798] to-[#C8A54B] text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-800 cursor-pointer">
              NR
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>

        </div>

      </div>
    </header>
  );
}
