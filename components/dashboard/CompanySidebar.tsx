'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Users,
  Shield,
  Layers,
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

  // Live Punch State
  const [currentStatus, setCurrentStatus] = useState<'working' | 'lunch' | 'break' | 'offline'>('lunch');
  const [statusSeconds, setStatusSeconds] = useState<number>(1 * 3600 + 5 * 60 + 23);

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

  const handleActionClick = (newStatus: 'working' | 'lunch' | 'break' | 'offline', label: string) => {
    setCurrentStatus(newStatus);
    setStatusSeconds(0);
    if (onPunchAction) onPunchAction(label);
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/Images/ctnp-logo.png`;

  const handleLogout = () => {
    router.push('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Time Tracking', icon: Clock },
    { id: 'flowhub', label: 'Flow Hub', icon: Zap },
    { id: 'attendance', label: 'Attendance & Roster', icon: Calendar },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
  ];

  return (
    <aside 
      className={`shrink-0 bg-[#2F6798] text-white flex flex-col justify-between transition-all duration-300 select-none z-30 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-60 lg:w-64'
      } h-screen sticky top-0 overflow-hidden relative`}
    >
      
      {/* Bottom Illustration Background Image (Properly Scaled) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none opacity-30 bg-contain bg-bottom bg-no-repeat z-0"
        style={{
          backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
        }}
      />

      {/* Top Header & Navigation Links */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        
        {/* Brand Header */}
        <div className={`p-3.5 border-b border-white/10 flex items-center ${
          isCollapsed ? 'flex-col gap-2.5 justify-center' : 'justify-between'
        }`}>
          <div className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
            
            {/* White Circular Logo Container */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-md">
              <img
                src={logoUrl}
                alt="CTNP Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">
                  Cebu Tele-Net
                </h1>
                <p className="text-[10px] font-semibold text-blue-100/90 tracking-wide mt-1">
                  Workforce Portal
                </p>
              </div>
            )}

          </div>

          {/* Toggle Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu (Scrollable only if screen height is very short) */}
        <nav className="p-2.5 sm:p-3 space-y-1 text-xs font-semibold overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/80'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Compact Punch Clock Widget + Glassmorphic Settings + User Profile */}
      <div className="p-2.5 sm:p-3 relative z-10 space-y-2 shrink-0">
        
        {/* Compact Punch Clock Action Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-100/90 uppercase tracking-wider flex items-center gap-1">
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
                onClick={() => handleActionClick('working', 'End Lunch')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] active:bg-[#c3a860] text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Utensils className="w-3 h-3" />
                <span>End Lunch</span>
              </button>
            ) : currentStatus === 'break' ? (
              <button
                type="button"
                onClick={() => handleActionClick('working', 'End Break')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] active:bg-[#c3a860] text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coffee className="w-3 h-3" />
                <span>End Break</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleActionClick('lunch', 'Start Lunch')}
                  className="py-1.5 px-2 rounded-lg bg-black/20 hover:bg-black/30 text-white font-bold text-[11px] border border-white/15 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Utensils className="w-3 h-3 text-[#E5CA80]" />
                  <span>Lunch</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActionClick('break', 'Start Break')}
                  className="py-1.5 px-2 rounded-lg bg-[#E5CA80] hover:bg-[#d4b970] text-slate-950 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Coffee className="w-3 h-3" />
                  <span>Break</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            {currentStatus === 'lunch' ? (
              <button
                type="button"
                onClick={() => handleActionClick('working', 'End Lunch')}
                className="p-2.5 rounded-xl bg-[#E5CA80] text-slate-950 shadow-xs cursor-pointer"
                title="End Lunch"
              >
                <Utensils className="w-4 h-4" />
              </button>
            ) : currentStatus === 'break' ? (
              <button
                type="button"
                onClick={() => handleActionClick('working', 'End Break')}
                className="p-2.5 rounded-xl bg-[#E5CA80] text-slate-950 shadow-xs cursor-pointer"
                title="End Break"
              >
                <Coffee className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleActionClick('lunch', 'Start Lunch')}
                className="p-2.5 rounded-xl bg-white/10 text-white border border-white/20 cursor-pointer"
                title="Start Lunch"
              >
                <Clock className="w-4 h-4 text-[#E5CA80]" />
              </button>
            )}
          </div>
        )}

        {/* Glassmorphic Settings Button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md border ${
            currentTab === 'settings'
              ? 'bg-white/25 text-white shadow-xs border-white/40'
              : 'bg-white/15 text-white hover:bg-white/20 border-white/15'
          } ${isCollapsed ? 'justify-center px-2' : ''}`}
          title="Settings"
        >
          <Settings className="w-4 h-4 shrink-0 text-white" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Glassmorphic User Profile Card */}
        {isCollapsed ? (
          <div className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center gap-2 shadow-xs">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/40 bg-white/20 flex items-center justify-center" title={supervisor.name}>
              <img
                src={supervisor.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'}
                alt={supervisor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/40 bg-white/20 flex items-center justify-center">
                <img
                  src={supervisor.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'}
                  alt={supervisor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {supervisor.name}
                </div>
                <div className="text-[9px] font-semibold text-blue-100/80 tracking-wider uppercase truncate">
                  {supervisor.position || 'HEAD OF TRAINING'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </aside>
  );
}

