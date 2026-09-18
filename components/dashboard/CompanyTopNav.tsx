'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  User, 
  HelpCircle,
  Settings, 
  LogOut, 
  X, 
  LayoutDashboard, 
  Clock, 
  Zap, 
  Calendar, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import DatePickerPopover from './DatePickerPopover';
import ConfirmActionModal from './ConfirmActionModal';

interface CompanyTopNavProps {
  title?: string;
  supervisor: {
    name: string;
    id: string;
    role: string;
    email?: string;
    position?: string;
    avatarUrl?: string;
  };
  onSelectTab?: (tab: string) => void;
  onOpenProfile?: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Page' | 'Trainee' | 'Action';
  tabId?: string;
  icon: any;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Pages
  { id: 'p1', title: 'Training Performance Hub', subtitle: 'Executive Dashboard & KPI Metrics', category: 'Page', tabId: 'dashboard', icon: LayoutDashboard },
  { id: 'p2', title: 'Workforce Portal Time Clock', subtitle: 'Live Shift Logging, Punch Times & Timelines', category: 'Page', tabId: 'tracker', icon: Clock },
  { id: 'p3', title: 'Flow Hub Focus Studio', subtitle: 'Deep Work Pomodoro, Kanban Tasks & Weather', category: 'Page', tabId: 'flowhub', icon: Zap },
  { id: 'p4', title: 'Attendance & Reliability Roster', subtitle: 'Live Attendance Matrix & Absence Summaries', category: 'Page', tabId: 'attendance', icon: Calendar },
  { id: 'p5', title: 'Operations Analytics & Insights', subtitle: 'AHT Distribution, Heatmaps & Call Durations', category: 'Page', tabId: 'analytics', icon: BarChart3 },
  { id: 'p6', title: 'Workforce Portal Settings', subtitle: 'Thresholds, Notifications & Configurations', category: 'Page', tabId: 'settings', icon: Settings },

  // Team & Trainees
  { id: 't1', title: 'Reguero, Nissi-Jeh', subtitle: 'Head of Training • Batch 1 • Supervisor', category: 'Trainee', tabId: 'attendance', icon: User },
  { id: 't2', title: 'Caballes, June Babe', subtitle: 'Operations Manager • Executive Lead', category: 'Trainee', tabId: 'attendance', icon: User },
  { id: 't3', title: 'Carmelotes, Grachelle', subtitle: 'QA Lead • Batch 4 • Corporate Account', category: 'Trainee', tabId: 'attendance', icon: User },
  { id: 't4', title: 'Santos, Maria', subtitle: 'Trainee • Batch 4 • Amazon Direct', category: 'Trainee', tabId: 'attendance', icon: User },
  { id: 't5', title: 'Dela Cruz, Juan', subtitle: 'Trainee • Batch 5 • Verizon Care', category: 'Trainee', tabId: 'attendance', icon: User },

  // Quick Actions
  { id: 'a1', title: 'Start Focus Timer (Pomodoro)', subtitle: 'Launch 25m Deep Work Session', category: 'Action', tabId: 'flowhub', icon: Zap },
  { id: 'a2', title: 'Add New Phone Time Entry', subtitle: 'Log Call Duration & Ticket Code', category: 'Action', tabId: 'tracker', icon: Clock },
  { id: 'a3', title: 'View Attendance Matrix', subtitle: 'Check Present, Late & Absent Logs', category: 'Action', tabId: 'attendance', icon: Calendar },
];

export default function CompanyTopNav({
  title = 'Workforce Portal',
  supervisor,
  onSelectTab,
  onOpenProfile,
}: CompanyTopNavProps) {
  const router = useRouter();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Avatar Dropdown State
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAvatarDropdownOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleSelectItem = (item: SearchItem) => {
    if (item.tabId && onSelectTab) {
      onSelectTab(item.tabId);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const filteredItems = SEARCH_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0E1B38] border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: System Title (Bold) */}
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate font-sans">
            {title}
          </h1>
        </div>

        {/* Center: Search Bar with ⌘K & Functional Command Palette Dropdown (rounded-xl, not very circle) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9EB5] stroke-[1.5] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Type name, batch, role, or page..."
              className="w-full pl-10 pr-12 py-2 rounded-xl bg-white dark:bg-[#0B132B] hover:bg-white focus:bg-white dark:hover:bg-[#0B132B] dark:focus:bg-[#0B132B] border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-100 placeholder:text-[#8A9EB5] focus:outline-none focus:ring-1 focus:ring-[#8A9EB5]/40 focus:border-[#8A9EB5] transition-all shadow-2xs font-normal"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#8A9EB5] dark:text-slate-400 text-xs font-medium select-none flex items-center gap-0.5 shadow-2xs">
              <span className="text-[13px] leading-none">⌘</span>
              <span className="text-[11px] leading-none font-semibold">K</span>
            </div>
          </div>

          {/* Functional Search Dropdown / Command Palette */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
                <span>{searchQuery ? `Results for "${searchQuery}"` : 'Quick Navigation'}</span>
                <span>{filteredItems.length} found</span>
              </div>

              {filteredItems.length > 0 ? (
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#2F6798] group-hover:text-white text-[#2F6798] dark:text-blue-300 flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#2F6798] dark:group-hover:text-blue-300 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No matching results for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Date Picker, Notification Bell (Gray Color), Avatar with Dropdown (Reduced Width by 3, Reduced Text by 1) */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Functional Date Picker Popover */}
          <DatePickerPopover />

          {/* Notification Bell in Gray Color */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent transition-colors relative cursor-pointer active:scale-95"
              title="Notifications"
            >
              <Bell className="w-6 h-6 stroke-[1.5]" />
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                10
              </span>
            </button>

            {/* Notification Popover Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 space-y-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Notifications (10 Unread)
                  </h4>
                  <span className="text-[10px] text-[#2F6798] font-bold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                  <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                    <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Shift Handover Received</p>
                    <p className="text-[10px] text-slate-500">Night shift endorsement completed by June Babe.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Late Attendance Alert</p>
                    <p className="text-[10px] text-slate-500">2 trainees clocked in after 9:15 PM.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 1. Avatar Trigger Button (In Topbar) */}
          <div className="relative pl-1" ref={avatarDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2F6798] to-[#1F4A6E] ring-2 ring-white dark:ring-slate-800 shadow-lg shadow-[#2F6798]/30 text-xs font-bold text-white flex items-center justify-center hover:scale-105 hover:opacity-90 transition-all cursor-pointer select-none"
              title="User profile & settings"
            >
              {supervisor.name ? supervisor.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'}
            </button>

            {/* 2. Dropdown Menu Card Container */}
            {isAvatarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#F1F5F9] dark:border-slate-800 shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden">
                
                {/* 3. Dropdown Header (User Profile & Role Pill) */}
                <div className="p-4 border-b border-[#F1F5F9] dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F6798] to-[#1F4A6E] ring-1 ring-slate-200 dark:ring-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {supervisor.name ? supervisor.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0F172A] dark:text-slate-100 truncate leading-tight">
                        {supervisor.name || 'Nissi-Jeh Reguero'}
                      </h4>
                      <p className="text-[10px] text-[#94A3B8] truncate leading-tight mt-0.5">
                        {supervisor.email || 'nreguero.telenet@gmail.com'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold text-[#2F6798] dark:text-blue-300 bg-[#2F6798]/10 border border-[#2F6798]/20 tracking-wider uppercase">
                      {supervisor.position || supervisor.role || 'HEAD OF TRAINING'}
                    </span>
                  </div>
                </div>

                {/* 4. Menu Action Items Body */}
                <div className="p-2 space-y-1">
                  {/* My Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      if (onOpenProfile) onOpenProfile();
                      else if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group text-left"
                  >
                    <User className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F6798] transition-colors shrink-0" />
                    <span>My Profile</span>
                  </button>

                  {/* Help & Support */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F6798] transition-colors shrink-0" />
                    <span>Help & Support</span>
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group text-left"
                  >
                    <Settings className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F6798] transition-colors shrink-0" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* 5. Dropdown Footer (Logout Row) */}
                <div className="p-2 border-t border-[#F1F5F9] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#DC2626] dark:text-red-400 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Logout Confirmation Modal matching user screenshot */}
      <ConfirmActionModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => router.push('/login')}
        title="Logout"
        description="Are you sure you want to logout?"
        subDescription="You will need to sign in again to access the dashboard."
        confirmLabel="Yes"
        cancelLabel="Cancel"
        iconType="logout"
      />
    </header>
  );
}
