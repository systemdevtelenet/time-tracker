'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  User, 
  Users,
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
  ShieldCheck,
  LogIn,
  FileText,
  Utensils,
  Coffee,
  UserCheck,
  Activity,
  Building2,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';

import DatePickerPopover from './DatePickerPopover';
import ConfirmActionModal from './ConfirmActionModal';
import { 
  getActivityLogs, 
  syncActivityLogsWithApi,
  markAllNotificationsAsRead, 
  formatRelativeTime, 
  SystemActivityLog 
} from '@/lib/activityLogs';
import { isHeadOrAdminUser } from './CompanySidebar';

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
  isDark?: boolean;
  onToggleTheme?: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tabId?: string;
  icon: any;
  iconBg: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Primary Navigation & Operations Actions (Matching reference layout)
  {
    id: 'act-traffic',
    title: 'Traffic Lights Status Tracking',
    subtitle: 'Weekly trainer & trainee ratings, notes & coaching',
    badge: 'Live',
    tabId: 'attendance',
    icon: Activity,
    iconBg: 'bg-amber-50 text-amber-500 border border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/40',
  },
  {
    id: 'act-trainees',
    title: 'Trainees Directory & Rosters',
    subtitle: 'Inhouse & PST cohorts, batch rosters & status',
    badge: 'Roster',
    tabId: 'attendance',
    icon: Users,
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/40',
  },
  {
    id: 'act-reliability',
    title: 'Trainers Reliability Matrix',
    subtitle: 'View trainer reliability scores, attendance & leaves',
    badge: 'Trainers',
    tabId: 'attendance',
    icon: UserCheck,
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/40',
  },
  {
    id: 'act-employees',
    title: 'Employees Management',
    subtitle: 'Employee codes, account assignments & vici links',
    badge: 'Staff',
    tabId: 'attendance',
    icon: Building2,
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/40',
  },
  {
    id: 'act-logs',
    title: 'Activity Log & Audit Trail',
    subtitle: 'Live history log, remarks updates & alerts',
    badge: 'Logs',
    tabId: 'activity',
    icon: ClipboardList,
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/40',
  },
  {
    id: 'act-dashboard',
    title: 'Dashboard Overview',
    subtitle: 'Headcount summaries, attrition rates & key charts',
    badge: 'Executive',
    tabId: 'dashboard',
    icon: LayoutDashboard,
    iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-200/60 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-900/40',
  },
  {
    id: 'act-tracker',
    title: 'Workforce Portal Time Clock',
    subtitle: 'Live shift logging, punch times & timelines',
    badge: 'Time Clock',
    tabId: 'tracker',
    icon: Clock,
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/40',
  },
  {
    id: 'act-flowhub',
    title: 'Flow Hub Focus Studio',
    subtitle: 'Deep work Pomodoro, Kanban tasks & weather',
    badge: 'Studio',
    tabId: 'flowhub',
    icon: Zap,
    iconBg: 'bg-orange-50 text-orange-600 border border-orange-200/60 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/40',
  },
  {
    id: 'act-analytics',
    title: 'Operations Analytics & Insights',
    subtitle: 'Work hours, activity categories & leaderboard',
    badge: 'Insights',
    tabId: 'analytics',
    icon: BarChart3,
    iconBg: 'bg-violet-50 text-violet-600 border border-violet-200/60 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900/40',
  },
  {
    id: 'act-settings',
    title: 'Workforce Portal Settings',
    subtitle: 'Thresholds, notifications & configurations',
    badge: 'Settings',
    tabId: 'settings',
    icon: Settings,
    iconBg: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },

  // Workforce Members Roster
  { id: 'emp-1', title: 'Nissi-Jeh Reguero', subtitle: 'Head of Training • TQA • ID: 1597', badge: 'Staff', tabId: 'attendance', icon: User, iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-400' },
  { id: 'emp-2', title: 'Raymundo Alasagas III', subtitle: 'Head of Quality • TQA • ID: 1108', badge: 'Staff', tabId: 'attendance', icon: User, iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-400' },
  { id: 'emp-3', title: 'Bianca Kaye Ernestine Colonia', subtitle: 'Trainer • TQA • ID: 1772', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-4', title: 'Michelle Yncierto', subtitle: 'Trainer • TQA • ID: 2385', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-5', title: 'Matt Riner Balaba', subtitle: 'Trainer • TQA • ID: 1954', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-6', title: 'Rommel Mendoza', subtitle: 'Trainer • TQA • ID: 1035', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-7', title: 'Ronelyn Baguio', subtitle: 'Trainer • TQA • ID: 1820', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-8', title: 'Krisland Pepito', subtitle: 'Trainer • TQA • ID: 836', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-9', title: 'Niño Elijah R. Reyes', subtitle: 'Trainer • TQA • ID: 1006', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-10', title: 'Kier Ariola', subtitle: 'Trainer • TQA • ID: 1880', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-11', title: 'Vincent Luis Celdran', subtitle: 'Trainer • TQA • ID: 946', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-12', title: 'Nina Joy Briones', subtitle: 'Trainer • TQA • ID: 2298', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'emp-13', title: 'Maegan Marie Cabardo', subtitle: 'Trainer • TQA • ID: 2610', badge: 'Trainer', tabId: 'attendance', icon: User, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400' },
];

export default function CompanyTopNav({
  title = 'Workforce Portal',
  supervisor,
  onSelectTab,
  onOpenProfile,
  isDark = false,
  onToggleTheme,
}: CompanyTopNavProps) {
  const router = useRouter();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Avatar Dropdown State
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemActivityLog[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync notifications
  useEffect(() => {
    setNotifications(getActivityLogs());
    syncActivityLogsWithApi().then((logs) => setNotifications(logs));

    const handleLogUpdate = () => {
      setNotifications(getActivityLogs());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('system-activity-logged', handleLogUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('system-activity-logged', handleLogUpdate);
      }
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isHeadOrAdmin = isHeadOrAdminUser(supervisor);

  const availableSearchItems = useMemo(() => {
    if (isHeadOrAdmin) return SEARCH_ITEMS;
    return SEARCH_ITEMS.filter((item) => item.tabId !== 'attendance' && item.tabId !== 'analytics');
  }, [isHeadOrAdmin]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return availableSearchItems;
    const q = searchQuery.toLowerCase();
    return availableSearchItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, availableSearchItems]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard shortcut listener for ⌘K / Ctrl+K and arrow navigation
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
        searchInputRef.current?.blur();
      } else if (isSearchOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
        } else if (e.key === 'Enter') {
          if (filteredItems[selectedIndex]) {
            e.preventDefault();
            handleSelectItem(filteredItems[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, filteredItems, selectedIndex]);

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

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#201F20] border-b border-slate-200/80 dark:border-[#434142] transition-colors shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: System Title (Bold) */}
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight truncate font-sans">
            {title}
          </h1>
        </div>

        {/* Center: Search Bar with ⌘K & Functional Command Palette Dropdown matching reference screenshot */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] stroke-[1.5] pointer-events-none" />
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
              className="w-full pl-10 pr-12 py-2 rounded-xl bg-white dark:bg-[#272626] hover:bg-white focus:bg-white dark:hover:bg-[#272626] dark:focus:bg-[#272626] border border-[#E2E8F0] dark:border-[#434142] text-xs text-slate-800 dark:text-[#F8F8F6] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3678B0]/40 focus:border-[#3678B0] transition-all shadow-2xs font-normal"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#434142] bg-white dark:bg-[#363435] text-[#94A3B8] text-xs font-medium select-none flex items-center gap-0.5 shadow-2xs">
              <span className="text-[13px] leading-none">⌘</span>
              <span className="text-[11px] leading-none font-semibold">K</span>
            </div>
          </div>

          {/* Functional Search Dropdown / Command Palette matching exact reference design */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-3xl bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 max-h-[460px] flex flex-col font-sans overflow-hidden">
              
              {/* Header */}
              <div className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-[#434142] mb-1">
                <span>QUICK NAVIGATION &amp; ACTIONS</span>
                <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400 dark:text-[#94A3B8]">
                  Press ↵ to open
                </span>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto space-y-1 py-1 pr-0.5 max-h-[340px] custom-scrollbar">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item: SearchItem, idx: number) => {
                    const Icon = item.icon;
                    const isSelected = selectedIndex === idx;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3 py-2 rounded-2xl text-left flex items-center justify-between gap-3 transition-all group cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-[#2C2A2B] ring-1 ring-slate-200/80 dark:ring-[#434142]'
                            : 'hover:bg-slate-50 dark:hover:bg-[#2C2A2B]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Left Icon Container in Pastel Color matching screenshot */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${item.iconBg}`}>
                            <Icon className="w-4 h-4 stroke-[2]" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-[#F8F8F6] truncate group-hover:text-[#2F6798] dark:group-hover:text-[#3678B0] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10.5px] font-medium text-slate-400 dark:text-[#94A3B8] truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right Badge matching screenshot */}
                        <span className="shrink-0 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50/70 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0] border border-blue-100 dark:border-[#434142]">
                          {item.badge}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No matching results for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Footer matching reference screenshot */}
              <div className="px-3 pt-2.5 pb-1 border-t border-slate-100 dark:border-[#434142] flex items-center justify-between text-[10.5px] font-medium text-slate-400 dark:text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <span>↵ Press <strong className="font-bold text-slate-700 dark:text-[#F8F8F6]">Enter</strong> to jump</span>
                </span>
                <span>ESC to close</span>
              </div>

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
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#F8F8F6] bg-transparent transition-colors relative cursor-pointer active:scale-95"
              title="Notifications"
            >
              <Bell className="w-6 h-6 stroke-[1.5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown matching reference image */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden font-sans">
                
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-[#434142] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-[#F8F8F6]">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0]">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-xs font-bold text-[#2F6798] dark:text-[#3678B0] hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#434142]/60 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((item) => {
                      const Icon = item.category === 'AUTH' 
                        ? LogIn 
                        : item.category === 'PUNCH' 
                        ? Clock 
                        : item.category === 'TIME LOG' 
                        ? FileText 
                        : item.category === 'ATTENDANCE' 
                        ? UserCheck 
                        : ShieldCheck;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-[#2C2A2B]/60 transition-colors ${
                            !item.isRead ? 'bg-blue-50/30 dark:bg-[#1D2433]/40' : ''
                          }`}
                        >
                          {/* Circular Left Icon */}
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-[#272626] text-[#2F6798] dark:text-[#3678B0] flex items-center justify-center shrink-0 border border-blue-100 dark:border-[#434142] mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-[#F8F8F6] truncate">
                                {item.title}
                              </h5>
                              <span className="text-[10px] font-medium text-slate-400 dark:text-[#94A3B8] shrink-0">
                                {formatRelativeTime(item.timestamp)}
                              </span>
                            </div>

                            <p className="text-[11.5px] text-slate-600 dark:text-[#94A3B8] leading-snug mt-0.5 line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between gap-2 mt-2">
                              <span className="text-[10px] text-slate-400 dark:text-[#94A3B8]">
                                By <b className="text-slate-700 dark:text-[#F8F8F6] font-semibold">{item.performedBy}</b>
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-50 text-[#2F6798] dark:bg-[#1D2433] dark:text-[#3678B0] border border-blue-200/50 dark:border-[#434142]">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    if (onSelectTab) onSelectTab('activity');
                  }}
                  className="w-full py-3 text-center text-xs font-bold text-slate-700 dark:text-[#F8F8F6] hover:text-[#2F6798] dark:hover:text-[#3678B0] bg-slate-50/50 dark:bg-[#272626]/80 border-t border-slate-100 dark:border-[#434142] transition-colors cursor-pointer block"
                >
                  View All Activity Logs
                </button>

              </div>
            )}
          </div>

          {/* 1. Avatar Trigger Button (In Topbar) */}
          <div className="relative pl-1" ref={avatarDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2F6798] to-[#1F4A6E] ring-2 ring-white dark:ring-[#434142] shadow-lg shadow-[#2F6798]/30 text-xs font-bold text-white flex items-center justify-center hover:scale-105 hover:opacity-90 transition-all cursor-pointer select-none overflow-hidden"
              title="User profile & settings"
            >
              {supervisor.avatarUrl ? (
                <img
                  src={supervisor.avatarUrl}
                  alt={supervisor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                supervisor.name ? supervisor.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'
              )}
            </button>

            {/* 2. Dropdown Menu Card Container */}
            {isAvatarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#363435] border border-[#F1F5F9] dark:border-[#434142] shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden">
                
                {/* 3. Dropdown Header (User Profile & Role Pill) */}
                <div className="p-4 border-b border-[#F1F5F9] dark:border-[#434142]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F6798] to-[#1F4A6E] ring-1 ring-slate-200 dark:ring-[#434142] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      {supervisor.avatarUrl ? (
                        <img
                          src={supervisor.avatarUrl}
                          alt={supervisor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        supervisor.name ? supervisor.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8F8F6] truncate leading-tight">
                        {supervisor.name || 'Nissi-Jeh Reguero'}
                      </h4>
                      <p className="text-[10px] text-[#94A3B8] truncate leading-tight mt-0.5">
                        {supervisor.email || 'nreguero.telenet@gmail.com'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold text-[#2F6798] dark:text-[#3678B0] bg-[#2F6798]/10 dark:bg-[#3678B0]/20 border border-[#2F6798]/20 dark:border-[#3678B0]/40 tracking-wider uppercase">
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
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-[#F8F8F6] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] transition-colors cursor-pointer group text-left"
                  >
                    <User className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F6798] dark:group-hover:text-[#3678B0] transition-colors shrink-0" />
                    <span>My Profile</span>
                  </button>

                  {/* Help & Support */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-[#F8F8F6] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] transition-colors cursor-pointer group text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F6798] dark:group-hover:text-[#3678B0] transition-colors shrink-0" />
                    <span>Help & Support</span>
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-[#F8F8F6] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] transition-colors cursor-pointer group text-left"
                  >
                    <Settings className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2F6798] dark:group-hover:text-[#3678B0] transition-colors shrink-0" />
                    <span>Settings</span>
                  </button>

                  {/* Theme Mode Toggle */}
                  {onToggleTheme && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTheme();
                      }}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium text-[#334155] dark:text-[#F8F8F6] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Sun className="w-4 h-4 text-[#C8A54B] shrink-0" />
                        ) : (
                          <Moon className="w-4 h-4 text-slate-500 group-hover:text-[#2F6798] dark:group-hover:text-[#3678B0] transition-colors shrink-0" />
                        )}
                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider">
                        {isDark ? 'Dark' : 'Light'}
                      </span>
                    </button>
                  )}
                </div>

                {/* 5. Dropdown Footer (Logout Row) */}
                <div className="p-2 border-t border-[#F1F5F9] dark:border-[#434142]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-[#ED1C25] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#ED1C25] shrink-0" />
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
