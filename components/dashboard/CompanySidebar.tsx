'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Zap, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  Utensils,
  Coffee,
  LogIn
} from 'lucide-react';
import { PunchActionType } from '@/lib/punchLogs';
import ConfirmActionModal from './ConfirmActionModal';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tracker', label: 'Time Tracking', icon: Clock },
  { id: 'flowhub', label: 'Flow Hub', icon: Zap },
  { id: 'attendance', label: 'Attendance & Roster', icon: Calendar },
  { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
];

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
  onPunchAction?: (action: string) => void;
}

export default function CompanySidebar({
  currentTab,
  onSelectTab,
  supervisor,
  onPunchAction,
}: CompanySidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Live Punch State
  const [currentStatus, setCurrentStatus] = useState<'working' | 'lunch' | 'break_1' | 'break_2' | 'offline'>('lunch');
  const [statusSeconds, setStatusSeconds] = useState<number>(0);
  const [isPunching, setIsPunching] = useState<boolean>(false);

  // Fetch live punch status from API
  const fetchPunchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/punch-logs?empId=${supervisor.id}`);
      const data = await res.json();
      if (data.currentStatus) {
        setCurrentStatus(data.currentStatus.status);
        setStatusSeconds(data.currentStatus.elapsedSeconds || 0);
      }
    } catch (err) {
      console.error('Error fetching sidebar punch status:', err);
    }
  }, [supervisor.id]);

  useEffect(() => {
    fetchPunchStatus();
  }, [fetchPunchStatus]);

  // Listen to global punch events
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

  // Live timer tick
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

  const handleActionClick = async (label: PunchActionType) => {
    if (isPunching) return;
    setIsPunching(true);
    try {
      const res = await fetch('/api/punch-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: supervisor.id,
          type: label,
          status: 'On Time',
        }),
      });
      const resData = await res.json();
      if (resData.currentStatus) {
        setCurrentStatus(resData.currentStatus.status);
        setStatusSeconds(0);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('punch-updated', { detail: { empId: supervisor.id, punchType: label } }));
      }

      if (onPunchAction) onPunchAction(label);
    } catch (err) {
      console.error('Error in sidebar punch:', err);
    } finally {
      setIsPunching(false);
    }
  };

  const logoUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ctnp-logo.png';
  const artworkUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png';

  return (
    <aside 
      className={`shrink-0 bg-[#2F6798] dark:bg-[#1A1C1E] text-white flex flex-col justify-between transition-[width] duration-200 ease-out select-none z-50 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen sticky top-0 overflow-hidden relative`}
    >
      
      {/* 7. Decorative Bottom Artwork Background */}
      <div 
        className={`absolute bottom-5 left-0 right-0 h-64 pointer-events-none select-none z-0 bg-contain bg-bottom bg-no-repeat transition-opacity duration-200 ${
          isCollapsed ? 'opacity-20' : 'opacity-40'
        }`}
        style={{
          backgroundImage: `url("${artworkUrl}")`,
        }}
      />

      {/* Top Header & Navigation Links */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        
        {/* 3. Header / Brand Section */}
        <div className={`p-4 border-b border-[#2F6798]/20 dark:border-white/10 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                {/* CTNP Logo Box */}
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1 shrink-0 shadow-md shadow-black/10">
                  <img
                    src={logoUrl}
                    alt="CTNP Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="truncate">
                  <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">
                    Cebu Tele-Net
                  </h1>
                  <p className="text-[10px] font-medium tracking-[0.05em] uppercase text-white/60 mt-1">
                    Workforce Portal
                  </p>
                </div>
              </div>

              {/* Toggle Collapse Button in Expanded Mode */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            /* When collapsed: Do NOT show logo, only the Menu icon centered */
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer mx-auto"
              title="Expand Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* 4. Clean Navigation Links (No Nested Accordion Dropdown) */}
        <nav className="px-3 py-4 space-y-1.5 text-xs font-semibold overflow-y-auto flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/20 font-bold text-white shadow-xs'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-white/75'}`} />
                {!isCollapsed && (
                  <span className="truncate text-xs">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 6. Sidebar Footer (Settings & User Profile Card) */}
      <div className="p-3 border-t border-[#2F6798]/20 dark:border-white/10 relative z-10 space-y-2 shrink-0">
        
        {/* Compact Punch Clock Action Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#E5CA80]" />
                <span>Punch Status</span>
              </span>
              <span className="text-[10px] font-black text-[#E5CA80] font-mono">
                {formatElapsedTime(statusSeconds)}
              </span>
            </div>

            {/* Quick Action Button */}
            {currentStatus === 'lunch' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('End Lunch')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] active:bg-[#c3a860] text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Utensils className="w-3 h-3" />
                <span>{isPunching ? 'Saving...' : 'End Lunch'}</span>
              </button>
            ) : currentStatus === 'break_1' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('Break 1 End')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] active:bg-[#c3a860] text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Coffee className="w-3 h-3" />
                <span>{isPunching ? 'Saving...' : 'End Break 1'}</span>
              </button>
            ) : currentStatus === 'break_2' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('Break 2 End')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] active:bg-[#c3a860] text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Coffee className="w-3 h-3" />
                <span>{isPunching ? 'Saving...' : 'End Break 2'}</span>
              </button>
            ) : currentStatus === 'offline' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('Shift Start')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3 h-3" />
                <span>{isPunching ? 'Saving...' : 'Shift Start'}</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={isPunching}
                  onClick={() => handleActionClick('Start Lunch')}
                  className="py-1.5 px-2 rounded-lg bg-black/20 hover:bg-black/30 text-white font-bold text-[11px] border border-white/15 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Utensils className="w-3 h-3 text-[#E5CA80]" />
                  <span>Lunch</span>
                </button>
                <button
                  type="button"
                  disabled={isPunching}
                  onClick={() => handleActionClick('Break 1 Start')}
                  className="py-1.5 px-2 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] text-slate-950 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Coffee className="w-3 h-3" />
                  <span>Break 1</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            {currentStatus === 'lunch' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('End Lunch')}
                className="p-2.5 rounded-xl bg-[#E5CA80] text-slate-950 shadow-xs cursor-pointer disabled:opacity-50"
                title="End Lunch"
              >
                <Utensils className="w-4 h-4" />
              </button>
            ) : currentStatus === 'break_1' || currentStatus === 'break_2' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick(currentStatus === 'break_1' ? 'Break 1 End' : 'Break 2 End')}
                className="p-2.5 rounded-xl bg-[#E5CA80] text-slate-950 shadow-xs cursor-pointer disabled:opacity-50"
                title="End Break"
              >
                <Coffee className="w-4 h-4" />
              </button>
            ) : currentStatus === 'offline' ? (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('Shift Start')}
                className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-xs cursor-pointer disabled:opacity-50"
                title="Shift Start"
              >
                <LogIn className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPunching}
                onClick={() => handleActionClick('Start Lunch')}
                className="p-2.5 rounded-xl bg-white/10 text-white border border-white/20 cursor-pointer disabled:opacity-50"
                title="Start Lunch"
              >
                <Clock className="w-4 h-4 text-[#E5CA80]" />
              </button>
            )}
          </div>
        )}

        {/* Settings Link (Icon matching text color text-white/75 when inactive, text-white when active) */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-white/20 font-bold text-white shadow-xs'
              : 'text-white/75 hover:bg-white/10 hover:text-white'
          } ${isCollapsed ? 'justify-center px-2' : ''}`}
          title="Settings"
        >
          <Settings className={`h-4 w-4 shrink-0 ${currentTab === 'settings' ? 'text-white' : 'text-white/75'}`} />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* User Profile Pill */}
        {isCollapsed ? (
          /* When collapsed: Show ONLY the avatar and its container (no logout icon) */
          <div className="p-2 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-xs">
            <div 
              className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/30 bg-white/20 flex items-center justify-center font-black text-xs text-white"
              title={supervisor.name}
            >
              {supervisor.avatarUrl ? (
                <img
                  src={supervisor.avatarUrl}
                  alt={supervisor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{supervisor.name ? supervisor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'}</span>
              )}
            </div>
          </div>
        ) : (
          /* When expanded: Show full profile with Name, Position, and Logout button */
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Avatar Circle (32px × 32px, bg-white/20, border border-white/30) */}
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/30 bg-white/20 flex items-center justify-center font-black text-xs text-white">
                {supervisor.avatarUrl ? (
                  <img
                    src={supervisor.avatarUrl}
                    alt={supervisor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{supervisor.name ? supervisor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'}</span>
                )}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {supervisor.name}
                </div>
                <div className="text-[10px] font-medium text-white/60 tracking-wider uppercase truncate leading-tight mt-0.5">
                  {supervisor.position || 'HEAD OF TRAINING'}
                </div>
              </div>
            </div>

            {/* Logout Action Button in Expanded Mode */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              title="Log Out"
              className="p-1.5 rounded-xl hover:text-white hover:bg-[#ED1C25]/20 active:bg-[#ED1C25]/30 text-white/75 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>

      {/* 8. Logout Confirmation Modal */}
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

    </aside>
  );
}
