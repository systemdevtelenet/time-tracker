'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CompanySidebar, { isHeadOrAdminUser } from '@/components/dashboard/CompanySidebar';
import CompanyTopNav from '@/components/dashboard/CompanyTopNav';
import HeroKpiCards from '@/components/dashboard/HeroKpiCards';
import FilterControlsBar from '@/components/dashboard/FilterControlsBar';
import ExecutivePerformanceOverview from '@/components/dashboard/ExecutivePerformanceOverview';
import DepartmentalTrendsChart from '@/components/dashboard/DepartmentalTrendsChart';
import KpiSummary from '@/components/KpiSummary';
import TimerTracker from '@/components/TimerTracker';
import ManualEntryModal from '@/components/ManualEntryModal';
import TimeLogsTable from '@/components/TimeLogsTable';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import AnalyticsView from '@/components/dashboard/AnalyticsView';
import HoursReportTab from '@/components/dashboard/HoursReportTab';
import FlowHubView from '@/components/dashboard/FlowHubView';
import AttendanceCalendarView from '@/components/dashboard/AttendanceCalendarView';
import AttendanceRosterHub from '@/components/dashboard/AttendanceRosterHub';
import SupervisorShiftCard from '@/components/dashboard/SupervisorShiftCard';
import LiveShiftPunchTimeline from '@/components/dashboard/LiveShiftPunchTimeline';
import SettingsView from '@/components/dashboard/SettingsView';
import SettingsModal from '@/components/dashboard/SettingsModal';
import ActivityLogsView from '@/components/dashboard/ActivityLogsView';
import WeatherWidgetCard from '@/components/dashboard/WeatherWidgetCard';
import FullScreenLoader from '@/components/dashboard/FullScreenLoader';
import { AccountOption, EmployeeOption, PhoneTimeRecord, KpiSummaryStats } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';
import { addActivityLog } from '@/lib/activityLogs';
import { Plus, CheckCircle2, User, Sparkles } from 'lucide-react';

const VALID_TABS = ['dashboard', 'tracker', 'activity', 'flowhub', 'attendance', 'analytics', 'settings'] as const;

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab')?.toLowerCase();
  const initialTab = tabParam && VALID_TABS.includes(tabParam as any) ? tabParam : 'dashboard';

  // Navigation & View State (SSR and Hydration identical via useSearchParams)
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [currentAgent, setCurrentAgent] = useState<string>('Matt Riner Balaba');
  const [records, setRecords] = useState<PhoneTimeRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [activeCalendarRecord, setActiveCalendarRecord] = useState<PhoneTimeRecord | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter Bar state for Dashboard
  const [filterQuarter, setFilterQuarter] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [filterSearch, setFilterSearch] = useState('');

  // Supervisor Profile matching exact system content (Dynamic state linked to team_roster & logged-in user)
  const [supervisor, setSupervisor] = useState({
    name: 'Nissi-Jeh Reguero',
    id: '1597',
    role: 'ADMIN',
    position: 'Head of Training',
    shift: '9:00 PM to 6:00 AM',
    account: 'Corporate',
    tenure: '32 mos',
    directSupervisor: 'June Babe Caballes',
    email: 'nreguero.telenet@gmail.com',
    avatarUrl: undefined as string | undefined,
    firstName: undefined as string | undefined,
    middleName: undefined as string | undefined,
    lastName: undefined as string | undefined,
    suffix: undefined as string | undefined,
    department: undefined as string | undefined,
    startDate: undefined as string | undefined,
    accounts: undefined as string | undefined,
    primaryTask: undefined as string | undefined,
  });

  // Apply and persist theme mode
  const applyThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme_preference', mode);
      let darkActive = false;
      if (mode === 'dark') {
        darkActive = true;
      } else if (mode === 'light') {
        darkActive = false;
      } else {
        darkActive = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDark(darkActive);
      if (darkActive) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = isDark ? 'light' : 'dark';
    applyThemeMode(nextMode);
  }, [isDark, applyThemeMode]);

  // Dark mode initialization & localStorage fallback when no URL query is present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('theme_preference') as 'light' | 'dark' | 'system') || 'system';
      applyThemeMode(savedTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = (e: MediaQueryListEvent) => {
        const currentMode = localStorage.getItem('theme_preference') || 'system';
        if (currentMode === 'system') {
          setIsDark(e.matches);
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
      }

      const savedUser = localStorage.getItem('ctnp_current_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && (parsed.name || parsed.email)) {
            setSupervisor({
              name: parsed.name || 'User',
              id: parsed.id || parsed.employee_id || '1597',
              role: (parsed.role || 'Admin').toUpperCase(),
              position: parsed.position || 'Head of Training',
              shift: parsed.shift || '9:00 PM to 6:00 AM',
              account: parsed.account || 'Corporate',
              tenure: parsed.tenure || '32 mos',
              directSupervisor: parsed.directSupervisor || 'June Babe Caballes',
              email: parsed.email || (parsed.name ? `${parsed.name.toLowerCase().replace(/\s+/g, '.')}@cebutelenet.com` : 'nreguero.telenet@gmail.com'),
              avatarUrl: parsed.avatar_url || parsed.avatarUrl || undefined,
              firstName: parsed.firstName,
              middleName: parsed.middleName,
              lastName: parsed.lastName,
              suffix: parsed.suffix,
              department: parsed.department,
              startDate: parsed.startDate || '1/3/2024',
              accounts: parsed.accounts || parsed.account || 'CORP',
              primaryTask: parsed.position || 'Head of Training',
            });
            if (parsed.name) {
              setCurrentAgent(parsed.name);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // Listen for dynamic avatar changes across tabs or windows
      const handleAvatarUpdate = (e: Event) => {
        const customEvent = e as CustomEvent<{ avatarUrl?: string }>;
        if (customEvent.detail !== undefined) {
          setSupervisor(prev => ({
            ...prev,
            avatarUrl: customEvent.detail.avatarUrl || undefined,
          }));
        }
      };
      window.addEventListener('user-avatar-updated', handleAvatarUpdate);

      // Instant cache retrieval from sessionStorage to eliminate cold-start lag
      try {
        const cachedRecords = sessionStorage.getItem('ctnp_cached_records');
        if (cachedRecords) {
          const parsed = JSON.parse(cachedRecords);
          if (Array.isArray(parsed) && parsed.length > 0) setRecords(parsed);
        }
        const cachedMeta = sessionStorage.getItem('ctnp_cached_meta');
        if (cachedMeta) {
          const parsed = JSON.parse(cachedMeta);
          if (parsed?.accounts) setAccounts(parsed.accounts);
          if (parsed?.employees) setEmployees(parsed.employees);
        }
      } catch (e) {}

      if (!tabParam) {
        const savedTab = localStorage.getItem('tele_active_tab')?.toLowerCase();
        if (savedTab && VALID_TABS.includes(savedTab as any) && savedTab !== 'dashboard') {
          setActiveTab(savedTab);
          router.replace(`/?tab=${savedTab}`, { scroll: false });
        }
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMediaChange);
        }
        window.removeEventListener('user-avatar-updated', handleAvatarUpdate);
      };
    }
  }, [tabParam, router, applyThemeMode]);

  // Sync state if searchParams change (e.g. browser back/forward buttons)
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam as any) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  // Fetch initial records & metadata from Supabase with non-blocking SWR background sync
  const fetchData = useCallback(async () => {
    try {
      // Fetch time entries and meta in parallel
      const [resLogs, resMeta] = await Promise.all([
        fetch('/api/time-entries'),
        fetch('/api/meta'),
      ]);

      const [dataLogs, dataMeta] = await Promise.all([
        resLogs.json(),
        resMeta.json(),
      ]);

      if (dataLogs.data) {
        setRecords(dataLogs.data);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('ctnp_cached_records', JSON.stringify(dataLogs.data));
          } catch (e) {}
        }
      }

      if (dataMeta.accounts) setAccounts(dataMeta.accounts);
      if (dataMeta.employees) {
        setEmployees(dataMeta.employees);

        let activeId = '1597';
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('ctnp_current_user');
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              if (parsed?.id) activeId = String(parsed.id);
            } catch (e) {}
          }
        }

        const activeEmp = dataMeta.employees.find((e: any) => String(e.id) === String(activeId)) || 
                          dataMeta.employees.find((e: any) => String(e.id) === '1597');
        if (activeEmp) {
          setSupervisor((prev) => ({
            ...prev,
            name: activeEmp.name || prev.name,
            role: (activeEmp.userRole || activeEmp.role || 'Admin').toUpperCase(),
            position: activeEmp.position || activeEmp.role || prev.position,
            shift: activeEmp.shift || prev.shift,
            account: activeEmp.account || prev.account,
            tenure: activeEmp.tenure ? `${activeEmp.tenure} mos` : prev.tenure,
            directSupervisor: activeEmp.supervisor || prev.directSupervisor,
          }));
        }

        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('ctnp_cached_meta', JSON.stringify(dataMeta));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // RBAC Permission Check: Heads & Admins have full access to all; Trainees, Trainers, QA, and Agents see only their own
  const isHeadOrAdmin = useMemo(() => isHeadOrAdminUser(supervisor), [supervisor]);

  // Regular users (trainee, trainer, qa, agent) only see their own attendance / time records
  const accessibleRecords = useMemo(() => {
    if (isHeadOrAdmin) return records;
    const sName = (supervisor.name || '').toLowerCase().trim();
    if (!sName) return records;
    return records.filter((r) => {
      const rName = (r.name || '').toLowerCase().trim();
      return rName === sName || rName.includes(sName) || sName.includes(rName);
    });
  }, [records, supervisor.name, isHeadOrAdmin]);

  // If a non-head user accesses ?tab=analytics or ?tab=attendance, automatically redirect to time tracker
  useEffect(() => {
    if (!isHeadOrAdmin && (activeTab === 'analytics' || activeTab === 'attendance')) {
      setActiveTab('tracker');
      router.replace('/?tab=tracker', { scroll: false });
    }
  }, [isHeadOrAdmin, activeTab, router]);

  // Compute live KPIs
  const kpiStats: KpiSummaryStats = useMemo(() => {
    const totalRecords = accessibleRecords.length;
    let totalSecs = 0;
    const agentSet = new Set<string>();
    const accountSet = new Set<string>();
    const tagCountMap: Record<string, number> = {};

    accessibleRecords.forEach((r) => {
      const s = parseDurationToSeconds(r.total_minutes);
      totalSecs += s;
      if (r.name) agentSet.add(r.name.trim());
      if (r.account) accountSet.add(r.account.trim());

      if (r.tagging) {
        r.tagging.split(',').forEach((t) => {
          const trim = t.trim();
          if (trim) {
            tagCountMap[trim] = (tagCountMap[trim] || 0) + 1;
          }
        });
      }
    });

    const avgSecs = totalRecords > 0 ? Math.round(totalSecs / totalRecords) : 0;
    
    // Find top tag
    let topTag = 'None';
    let maxTagCount = 0;
    Object.entries(tagCountMap).forEach(([tag, count]) => {
      if (count > maxTagCount) {
        maxTagCount = count;
        topTag = tag;
      }
    });

    return {
      totalRecords,
      totalDurationFormatted: formatTotalDurationHuman(totalSecs),
      totalSeconds: totalSecs,
      averageDurationFormatted: formatTotalDurationHuman(avgSecs),
      uniqueAgentsCount: isHeadOrAdmin ? (employees.length > 0 ? employees.length : (agentSet.size || 13)) : 1,
      uniqueAccountsCount: accountSet.size || 1,
      topTag: topTag !== 'None' ? `${topTag} (${maxTagCount}x)` : 'None',
    };
  }, [accessibleRecords, employees, isHeadOrAdmin]);

  // Handlers
  const handleRecordAdded = (newRecord: PhoneTimeRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    addActivityLog({
      title: 'New Time Log Entry',
      description: `Logged ${newRecord.total_minutes} for ${newRecord.account || 'Corporate'} (Ticket #${newRecord.ticket_number}).`,
      performedBy: newRecord.name || supervisor.name,
      category: 'TIME LOG',
      type: 'timelog',
    });
  };

  const handleDeleteRecord = async (ticketNumber: string) => {
    if (!confirm(`Are you sure you want to delete call log #${ticketNumber}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/time-entries?ticket_number=${ticketNumber}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.ticket_number !== ticketNumber));
        addActivityLog({
          title: 'Call Log Deleted',
          description: `Call log ticket #${ticketNumber} was removed from the database.`,
          performedBy: supervisor.name,
          category: 'SYSTEM',
          type: 'system',
        });
      } else {
        alert('Failed to delete record from database.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTimerStateChange = useCallback((running: boolean, currentSecs: number) => {
    setIsTimerRunning(running);
    setActiveTimerSeconds(currentSecs);
  }, []);

  const handleSelectTab = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setActiveCalendarRecord(null);

    router.replace(`/?tab=${tab}`, { scroll: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tele_active_tab', tab);
    }
  };

  // Title for topnav - Always Workforce Portal
  const getNavTitle = () => {
    return 'Workforce Portal';
  };

  // Filtered dashboard records based on top filter bar
  const filteredDashboardRecords = useMemo(() => {
    return accessibleRecords.filter((rec) => {
      // Account Filter
      if (filterAccount !== 'ALL' && rec.account?.trim() !== filterAccount) {
        return false;
      }

      // Quarter Filter
      if (filterQuarter !== 'ALL' && rec.date_of_shift) {
        const parts = rec.date_of_shift.split('-');
        if (parts.length >= 2) {
          const monthNum = parseInt(parts[1], 10);
          if (filterQuarter === 'Q1' && !(monthNum >= 1 && monthNum <= 3)) return false;
          if (filterQuarter === 'Q2' && !(monthNum >= 4 && monthNum <= 6)) return false;
          if (filterQuarter === 'Q3' && !(monthNum >= 7 && monthNum <= 9)) return false;
          if (filterQuarter === 'Q4' && !(monthNum >= 10 && monthNum <= 12)) return false;
        }
      }

      // Month Filter
      if (filterMonth !== 'ALL' && rec.date_of_shift) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const parts = rec.date_of_shift.split('-');
        if (parts.length >= 2) {
          const monthNum = parseInt(parts[1], 10);
          const monthIndex = monthNames.indexOf(filterMonth) + 1;
          if (monthNum !== monthIndex) return false;
        }
      }

      // Search Filter
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const matchesName = rec.name?.toLowerCase().includes(q);
        const matchesTicket = rec.ticket_number?.toLowerCase().includes(q);
        const matchesSummary = rec.summary?.toLowerCase().includes(q);
        const matchesTag = rec.tagging?.toLowerCase().includes(q);
        const matchesAccount = rec.account?.toLowerCase().includes(q);
        const matchesDate = rec.date_of_shift?.toLowerCase().includes(q);
        return matchesName || matchesTicket || matchesSummary || matchesTag || matchesAccount || matchesDate;
      }

      return true;
    });
  }, [accessibleRecords, filterAccount, filterQuarter, filterMonth, filterSearch]);

  return (
    <div className="h-screen overflow-hidden bg-[#F4F7FB] dark:bg-[#272626] text-slate-900 dark:text-[#F8F8F6] flex transition-colors duration-200 relative">
      
      {/* Full Screen Loading Overlay ONLY on initial cold start if no cache exists */}
      {isLoading && records.length === 0 && employees.length === 0 && (
        <FullScreenLoader activeTab={activeTab} />
      )}

      {/* 1. Left Fixed Sidebar matching exact design structure */}
      <CompanySidebar
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        supervisor={supervisor}
        onPunchAction={(act) => {
          setToastMsg(`Action recorded: ${act}`);
          setTimeout(() => setToastMsg(null), 2500);
          addActivityLog({
            title: `${act} Recorded`,
            description: `${supervisor.name} performed shift punch action: ${act}.`,
            performedBy: supervisor.name,
            category: 'PUNCH',
            type: 'punch',
          });
        }}
      />

      {/* 2. Main Content Viewport (Scrollable) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar matching user screenshot */}
        <CompanyTopNav
          title={getNavTitle()}
          supervisor={supervisor}
          onSelectTab={handleSelectTab}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Main Application Canvas (Reduced Margins by 2) */}
        <main className="flex-1 px-3 sm:px-4 lg:px-5 pt-2.5 sm:pt-3 pb-6 space-y-4 max-w-[1800px] w-full mx-auto">
          
          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* TAB 1: EXECUTIVE TRAINING DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Dashboard Top Header: Operations Shift Summary (Left) & Weather Widget (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 flex flex-col justify-center space-y-2 py-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 border border-[#2F6798]/20">
                      Cebu Tele-Net Operations Hub
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Shift Active (9:00 PM – 6:00 AM)
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Welcome back, <span className="text-[#2F6798] dark:text-blue-400">{supervisor.name}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-2xl leading-relaxed">
                    Real-time training analytics, phone duration tracking, and workforce attendance reliability across all active client accounts.
                  </p>
                </div>

                {/* Right: Weather Widget Card */}
                <div className="lg:col-span-4 flex justify-end">
                  <WeatherWidgetCard />
                </div>
              </div>

              {/* 4 System-Related Hero KPI Cards */}
              <HeroKpiCards 
                records={filteredDashboardRecords} 
                kpiStats={kpiStats} 
                stats={{ 
                  activeCount: employees.length > 0 ? employees.length : 13,
                  totalEmployees: employees.length > 0 ? employees.length : 13
                }} 
              />

              {/* Filter Controls Bar and Analytics/Table in One Single External Container */}
              <div className="w-full bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
                
                {/* Dynamic Filter Controls Bar */}
                <FilterControlsBar
                  quarter={filterQuarter}
                  month={filterMonth}
                  account={filterAccount}
                  searchTerm={filterSearch}
                  onQuarterChange={setFilterQuarter}
                  onMonthChange={setFilterMonth}
                  onAccountChange={setFilterAccount}
                  onSearchChange={setFilterSearch}
                  accounts={accounts}
                />

                {/* 2-Column Analytics Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-7">
                    <ExecutivePerformanceOverview records={filteredDashboardRecords} kpiStats={kpiStats} />
                  </div>
                  <div className="lg:col-span-5">
                    <DepartmentalTrendsChart records={filteredDashboardRecords} />
                  </div>
                </div>

                {/* Quick Summary & Real-time Shift Log Feed */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span>Recent Workforce Time Logs & Shift Activities</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 font-black">
                        Live Feed
                      </span>
                    </h3>
                    <button
                      onClick={() => handleSelectTab('tracker')}
                      className="text-xs font-bold text-[#2F6798] hover:underline cursor-pointer"
                    >
                      Open Workforce Portal →
                    </button>
                  </div>
                  <TimeLogsTable
                    records={filteredDashboardRecords}
                    isLoading={isLoading}
                    onRefresh={fetchData}
                    onDeleteRecord={handleDeleteRecord}
                    onOpenCalendar={(rec) => {
                      if (isHeadOrAdmin) {
                        setActiveCalendarRecord(rec);
                        handleSelectTab('attendance');
                      } else {
                        handleSelectTab('tracker');
                      }
                    }}
                    accounts={accounts}
                  />
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: WORKFORCE PORTAL (Time Clock & Live Shift Punch Timeline for Trainers/QA) */}
          {activeTab === 'tracker' && (
            <div className="space-y-4 animate-in fade-in">
              {/* 4 KPI Summary Boxes */}
              <KpiSummary stats={kpiStats} />

              {/* Single External White Container for Nissi-Jeh Reguero container & Today's Shift Activity & Punch Audit Trail */}
              <div className="w-full bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
                <SupervisorShiftCard 
                  supervisor={supervisor}
                  embedded={true}
                  onPunchAction={(act) => {
                    setToastMsg(`Action recorded: ${act}`);
                    setTimeout(() => setToastMsg(null), 2500);
                    addActivityLog({
                      title: `${act} Recorded`,
                      description: `${supervisor.name} performed shift punch action: ${act}.`,
                      performedBy: supervisor.name,
                      category: 'PUNCH',
                      type: 'punch',
                    });
                  }}
                />

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                <LiveShiftPunchTimeline 
                  embedded={true} 
                  supervisorId={supervisor.id}
                  shiftSchedule={supervisor.shift}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY LOGS */}
          {activeTab === 'activity' && (
            <div className="animate-in fade-in">
              <ActivityLogsView
                onBackToDashboard={() => handleSelectTab('dashboard')}
                supervisorName={supervisor.name}
              />
            </div>
          )}

          {/* TAB 4: FLOW HUB */}
          {activeTab === 'flowhub' && (
            <div className="animate-in fade-in">
              <FlowHubView 
                onBackToPortal={() => handleSelectTab('dashboard')} 
                supervisorId={supervisor.id}
              />
            </div>
          )}

          {/* TAB 4: ATTENDANCE & ROSTER HUB (Roster, Calendar, Hours Report, Employee Details) */}
          {activeTab === 'attendance' && (
            <div className="animate-in fade-in">
              <AttendanceRosterHub
                records={accessibleRecords}
                supervisorName={supervisor.name}
                supervisorId={supervisor.id}
                supervisorRole={supervisor.role}
                supervisorPosition={supervisor.position}
                supervisor={supervisor}
                initialEmployee={activeCalendarRecord?.name || (isHeadOrAdmin ? undefined : supervisor.name)}
              />
            </div>
          )}

          {/* TAB 5: ANALYTICS & INSIGHTS */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              records={records}
              employees={employees}
              accounts={accounts}
              kpiStats={kpiStats}
            />
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in">
              <SettingsView
                onBackToDashboard={() => handleSelectTab('dashboard')}
                supervisor={supervisor}
                isDark={isDark}
                themeMode={themeMode}
                onSelectThemeMode={applyThemeMode}
                onToggleTheme={toggleTheme}
                onUpdateAvatar={(newAvatar) => {
                  setSupervisor((prev) => ({
                    ...prev,
                    avatarUrl: newAvatar || undefined,
                  }));
                }}
              />
            </div>
          )}

        </main>
      </div>

      {/* Manual Entry Modal Dialog */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        currentAgent={currentAgent}
        accounts={accounts}
        onRecordAdded={handleRecordAdded}
      />

      {/* Settings Modal Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <FullScreenLoader
          customTitle="Loading Cebu Tele-Net Workspace..."
          customSubtitle="Retrieving operational metrics and executive KPIs"
        />
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

