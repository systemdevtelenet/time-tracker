'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ChevronDown, 
  ChevronRight, 
  UserCheck, 
  BarChart3, 
  TrafficCone, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

interface CompanySidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  supervisor: {
    name: string;
    id: string;
    role: string;
    position: string;
    avatarUrl?: string;
  };
}

export default function CompanySidebar({
  currentTab,
  onSelectTab,
  supervisor,
}: CompanySidebarProps) {
  const router = useRouter();
  const [isTrainersOpen, setIsTrainersOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/Images/ctnp-logo.png`;

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <aside 
      className={`shrink-0 bg-gradient-to-b from-[#2F6798] via-[#265782] to-[#1D4468] text-white flex flex-col justify-between transition-all duration-300 select-none z-30 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64 xl:w-72'
      } min-h-screen relative overflow-hidden`}
    >
      
      {/* Decorative Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-bottom"
        style={{
          backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")`,
        }}
      />

      {/* Top Header & Brand */}
      <div className="relative z-10">
        
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            
            {/* White Circular Logo Container */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-md">
              <img
                src={logoUrl}
                alt="CTNP Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none">
                  Cebu Tele-Net
                </h1>
                <p className="text-[9px] font-bold text-blue-200/90 tracking-widest uppercase mt-1">
                  OPERATIONS ANALYTICS
                </p>
              </div>
            )}

          </div>

          {/* Toggle Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 sm:p-4 space-y-1.5 text-xs font-semibold">
          
          {/* Dashboard Item (Active) */}
          <button
            onClick={() => onSelectTab('roster')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'roster'
                ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-white" />
            {!isCollapsed && <span>Dashboard</span>}
          </button>

          {/* Trainees / Agents */}
          <button
            onClick={() => onSelectTab('roster')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'trainees'
                ? 'bg-white/20 text-white font-bold shadow-xs'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0 text-white/80" />
            {!isCollapsed && <span>Trainees</span>}
          </button>

          {/* Trainers Accordion Dropdown */}
          <div>
            <button
              onClick={() => setIsTrainersOpen(!isTrainersOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 shrink-0 text-white/80" />
                {!isCollapsed && <span>Trainers</span>}
              </div>
              {!isCollapsed && (
                isTrainersOpen ? <ChevronDown className="w-3.5 h-3.5 text-white/60" /> : <ChevronRight className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>

            {/* Sub-items */}
            {isTrainersOpen && !isCollapsed && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px] font-medium text-white/75">
                <button
                  onClick={() => onSelectTab('details')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                    currentTab === 'details' ? 'text-white font-bold bg-white/10' : 'hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Trainers Directory</span>
                </button>
                <button
                  onClick={() => onSelectTab('calendar')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                    currentTab === 'calendar' ? 'text-white font-bold bg-white/10' : 'hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Attendance & Reliability</span>
                </button>
              </div>
            )}
          </div>

          {/* Employees Management */}
          <button
            onClick={() => onSelectTab('details')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'details'
                ? 'bg-white/20 text-white font-bold'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0 text-white/80" />
            {!isCollapsed && <span>Employees Management</span>}
          </button>

          {/* Analytics & AI Insights */}
          <button
            onClick={() => onSelectTab('hours')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'hours'
                ? 'bg-white/20 text-white font-bold'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-white/80" />
            {!isCollapsed && <span>Analytics & AI Insights</span>}
          </button>

          {/* Traffic Lights */}
          <button
            onClick={() => onSelectTab('roster')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <TrafficCone className="w-4 h-4 shrink-0 text-white/80" />
            {!isCollapsed && <span>Traffic Lights</span>}
          </button>

          {/* Activity Log */}
          <button
            onClick={() => onSelectTab('hours')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 shrink-0 text-white/80" />
            {!isCollapsed && <span>Activity Log</span>}
          </button>

        </nav>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="p-3 sm:p-4 border-t border-white/10 relative z-10 space-y-2">
        
        {/* Settings Item */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0 text-white/80" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* User Profile Card */}
        <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C8A54B] to-amber-200 text-[#1D4468] font-black text-xs flex items-center justify-center shrink-0 shadow-xs border border-white/40">
              NR
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {supervisor.name}
                </div>
                <div className="text-[9px] font-bold text-[#C8A54B] tracking-wider uppercase">
                  {supervisor.position || 'HEAD OF TRAINING'}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </aside>
  );
}
