'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  Clock, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface TopNavProps {
  currentDateTime: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isSettingsActive?: boolean;
  onOpenFlowHub?: () => void;
  isFlowHubActive?: boolean;
  supervisor: {
    name: string;
    id: string;
    role: string;
  };
}

export default function TopNav({
  currentDateTime,
  isDark,
  onToggleTheme,
  onOpenSettings,
  isSettingsActive = false,
  onOpenFlowHub,
  isFlowHubActive = false,
  supervisor,
}: TopNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand & Role Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E4E79] to-[#0E2C4C] text-white flex items-center justify-center font-black text-sm shadow-sm shadow-[#1E4E79]/20 group-hover:scale-105 transition-transform">
              CT
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-slate-100">
              Workforce Portal
            </span>
          </Link>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C8A54B]/15 text-[#C8A54B] border border-[#C8A54B]/30 uppercase tracking-wide">
            {supervisor.role || 'SUPERVISOR'}
          </span>
        </div>

        {/* Center: Live Date & Time Pill */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-[#1E4E79] dark:text-blue-300 text-xs font-semibold shadow-xs">
          <Clock className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
          <span>{currentDateTime || '2026-09-15 • 2:43:38 AM'}</span>
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Flow Hub Button */}
          <button
            onClick={onOpenFlowHub}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
              isFlowHubActive
                ? 'bg-[#2F6798] text-white border-[#2F6798] shadow-md shadow-[#2F6798]/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isFlowHubActive ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`} />
            <span>Flow Hub</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 fill-slate-600" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Portal Settings"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSettingsActive
                ? 'bg-[#24537D] text-white border-[#24537D] shadow-md shadow-[#24537D]/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {supervisor.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                ID: {supervisor.id}
              </div>
            </div>
            
            {/* Log Out Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800/50 hover:text-red-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
