'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CompanySidebar from '@/components/dashboard/CompanySidebar';
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
import HoursReportTab from '@/components/dashboard/HoursReportTab';
import FlowHubView from '@/components/dashboard/FlowHubView';
import AttendanceCalendarView from '@/components/dashboard/AttendanceCalendarView';
import AttendanceRosterHub from '@/components/dashboard/AttendanceRosterHub';
import SupervisorShiftCard from '@/components/dashboard/SupervisorShiftCard';
import LiveShiftPunchTimeline from '@/components/dashboard/LiveShiftPunchTimeline';
import SettingsView from '@/components/dashboard/SettingsView';
import SettingsModal from '@/components/dashboard/SettingsModal';
import WeatherWidgetCard from '@/components/dashboard/WeatherWidgetCard';
import { AccountOption, EmployeeOption, PhoneTimeRecord, KpiSummaryStats } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';
import { Plus, CheckCircle2, User, Sparkles } from 'lucide-react';

export default function HomePage() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentAgent, setCurrentAgent] = useState<string>('Matt Riner Balaba');
  const [records, setRecords] = useState<PhoneTimeRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [activeCalendarRecord, setActiveCalendarRecord] = useState<PhoneTimeRecord | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter Bar state for Dashboard
  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Supervisor Profile matching exact system content
  const supervisor = {
    name: 'Nissi-Jeh Reguero',
    id: '1597',
    role: 'SUPERVISOR',
    position: 'Head of Training',
    shift: '9:00 PM to 6:00 AM',
    account: 'Corporate',
    tenure: '32 mos',
    directSupervisor: 'June Babe Caballes',
  };

  // Dark mode initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
      if (isDarkMode) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch initial records & metadata from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch time entries
      const resLogs = await fetch('/api/time-entries');
      const dataLogs = await resLogs.json();
      if (dataLogs.data) {
        setRecords(dataLogs.data);
      }

      // Fetch meta accounts & employees
      const resMeta = await fetch('/api/meta');
      const dataMeta = await resMeta.json();
      if (dataMeta.accounts) setAccounts(dataMeta.accounts);
      if (dataMeta.employees) setEmployees(dataMeta.employees);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute live KPIs
  const kpiStats: KpiSummaryStats = useMemo(() => {
    const totalRecords = records.length;
    let totalSecs = 0;
    const agentSet = new Set<string>();
    const accountSet = new Set<string>();
    const tagCountMap: Record<string, number> = {};

    records.forEach((r) => {
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
      uniqueAgentsCount: agentSet.size || 1,
      uniqueAccountsCount: accountSet.size || 1,
      topTag: topTag !== 'None' ? `${topTag} (${maxTagCount}x)` : 'None',
    };
  }, [records]);

  // Handlers
  const handleRecordAdded = (newRecord: PhoneTimeRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
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

  // Title for topnav
  const getNavTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Training Performance Hub';
      case 'tracker': return 'Workforce Portal';
      case 'flowhub': return 'Flow Hub Focus Studio';
      case 'attendance': return 'Attendance & Reliability Roster';
      case 'analytics': return 'Operations Analytics & Insights';
      case 'settings': return 'Workforce Portal Settings';
      default: return 'Workforce Portal';
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F4F7FB] dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      
      {/* 1. Left Fixed Sidebar matching exact design structure */}
      <CompanySidebar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setActiveCalendarRecord(null);
        }}
        supervisor={supervisor}
        onPunchAction={(act) => {
          setToastMsg(`Action recorded: ${act}`);
          setTimeout(() => setToastMsg(null), 2500);
        }}
      />

      {/* 2. Main Content Viewport (Scrollable) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar matching user screenshot */}
        <CompanyTopNav
          title={getNavTitle()}
          supervisor={supervisor}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setActiveCalendarRecord(null);
          }}
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 border border-[#2F6798]/20">
                        Cebu Tele-Net Operations Hub
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Shift Active (9:00 PM – 6:00 AM)
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      Welcome back, <span className="text-[#2F6798] dark:text-blue-400 font-extrabold">{supervisor.name}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal max-w-2xl leading-relaxed">
                      Real-time training analytics, phone duration tracking, and workforce attendance reliability across all active client accounts.
                    </p>
                  </div>

                  {/* Operational Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Logged Time</span>
                      <span className="text-sm font-extrabold text-[#2F6798] dark:text-blue-300">{kpiStats.totalDurationFormatted}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Call Volume</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{records.length > 0 ? records.length : 31} Logs</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Average AHT</span>
                      <span className="text-sm font-extrabold text-emerald-600">{kpiStats.averageDurationFormatted}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Attendance</span>
                      <span className="text-sm font-extrabold text-[#C8A54B]">96.8%</span>
                    </div>
                  </div>
                </div>

                {/* Right: Weather Widget Card */}
                <div className="lg:col-span-4 flex justify-end">
                  <WeatherWidgetCard />
                </div>
              </div>

              {/* 4 System-Related Hero KPI Cards */}
              <HeroKpiCards records={records} kpiStats={kpiStats} stats={{ activeCount: 43 }} />

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
              />

              {/* 2-Column Analytics Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <ExecutivePerformanceOverview />
                </div>
                <div className="lg:col-span-5">
                  <DepartmentalTrendsChart />
                </div>
              </div>

              {/* Quick Summary & Real-time Shift Log Feed */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>Recent Live Attendance & Punch Logs</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 font-black">
                      Live Feed
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="text-xs font-bold text-[#2F6798] hover:underline cursor-pointer"
                  >
                    Open Workforce Portal →
                  </button>
                </div>
                <TimeLogsTable
                  records={records}
                  isLoading={isLoading}
                  onRefresh={fetchData}
                  onDeleteRecord={handleDeleteRecord}
                  onOpenCalendar={(rec) => {
                    setActiveCalendarRecord(rec);
                    setActiveTab('attendance');
                  }}
                  accounts={accounts}
                />
              </div>

            </div>
          )}

          {/* TAB 2: WORKFORCE PORTAL (Time Clock & Live Shift Punch Timeline for Trainers/QA) */}
          {activeTab === 'tracker' && (
            <div className="space-y-4 animate-in fade-in">
              {/* 4 KPI Summary Boxes */}
              <KpiSummary stats={kpiStats} />

              {/* TIME CLOCK & PUNCH (Horizontal Full-Length Card below the 4 boxes) */}
              <SupervisorShiftCard 
                supervisor={supervisor}
                onPunchAction={(act) => {
                  setToastMsg(`Action recorded: ${act}`);
                  setTimeout(() => setToastMsg(null), 2500);
                }}
              />

              {/* Live Shift Punch Timeline & Handover Notes Audit Log */}
              <LiveShiftPunchTimeline />
            </div>
          )}

          {/* TAB 3: FLOW HUB */}
          {activeTab === 'flowhub' && (
            <div className="animate-in fade-in">
              <FlowHubView onBackToPortal={() => setActiveTab('dashboard')} />
            </div>
          )}

          {/* TAB 4: ATTENDANCE & ROSTER HUB (Roster, Calendar, Hours Report, Employee Details) */}
          {activeTab === 'attendance' && (
            <div className="animate-in fade-in">
              <AttendanceRosterHub
                records={records}
                supervisorName={supervisor.name}
                initialEmployee={activeCalendarRecord?.name}
              />
            </div>
          )}

          {/* TAB 5: ANALYTICS & INSIGHTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  PERFORMANCE ANALYTICS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Operations & Call Handling Insights
                </h2>
              </div>

              {/* KPI Summary */}
              <KpiSummary stats={kpiStats} />

              {/* Visual Breakdown Charts */}
              <AnalyticsCharts records={records} />

              {/* Hours Report Tab */}
              <HoursReportTab />
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in">
              <SettingsView
                onBackToDashboard={() => setActiveTab('dashboard')}
                supervisor={supervisor}
                isDark={isDark}
                onToggleTheme={toggleTheme}
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

