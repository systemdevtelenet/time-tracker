'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar, { SupervisorProfile } from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import KpiSummary from '@/components/KpiSummary';
import TimerTracker from '@/components/TimerTracker';
import ManualEntryModal from '@/components/ManualEntryModal';
import TimeLogsTable from '@/components/TimeLogsTable';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import FlowHubView from '@/components/dashboard/FlowHubView';
import AttendanceCalendarView from '@/components/dashboard/AttendanceCalendarView';
import SettingsView from '@/components/dashboard/SettingsView';
import SettingsModal from '@/components/dashboard/SettingsModal';
import { AccountOption, EmployeeOption, PhoneTimeRecord, KpiSummaryStats } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';
import { Plus, BarChart2, Sparkles, PhoneCall, CheckCircle2, User, Building2 } from 'lucide-react';

export default function HomePage() {
  // State
  const [currentAgent, setCurrentAgent] = useState<string>('Matt Riner Balaba');
  const [records, setRecords] = useState<PhoneTimeRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');
  const [isFlowHubActive, setIsFlowHubActive] = useState<boolean>(false);
  const [isSettingsActive, setIsSettingsActive] = useState<boolean>(false);
  const [activeCalendarRecord, setActiveCalendarRecord] = useState<PhoneTimeRecord | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Supervisor Profile matching exact screenshot content
  const supervisor: SupervisorProfile = {
    name: 'Nissi-Jeh Reguero',
    id: '1597',
    role: 'SUPERVISOR',
    position: 'Head of Training',
    shift: '9:00 PM to 6:00 AM',
    account: 'Corporate',
    tenure: '32 mos',
    directSupervisor: 'June Babe Caballes',
  };

  // Clock & Dark mode init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
      if (isDarkMode) document.documentElement.classList.add('dark');
    }

    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentDateTime(`${year}-${month}-${day} • ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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

  return (
    <div className="min-h-screen bg-[#F3F6FA] dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Top Company Navigation Bar */}
      <TopNav
        currentDateTime={currentDateTime}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => {
          setIsSettingsActive(!isSettingsActive);
          setIsFlowHubActive(false);
          setActiveCalendarRecord(null);
        }}
        isSettingsActive={isSettingsActive}
        onOpenFlowHub={() => {
          setIsFlowHubActive(!isFlowHubActive);
          setIsSettingsActive(false);
          setActiveCalendarRecord(null);
        }}
        isFlowHubActive={isFlowHubActive}
        supervisor={supervisor}
      />

      {/* Main Workspace Layout (Sidebar + Content) */}
      <div className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar with exact content & design requested */}
        <Sidebar
          supervisor={supervisor}
          onPunchAction={(act) => {
            setToastMsg(`Action recorded: ${act}`);
            setTimeout(() => setToastMsg(null), 2500);
          }}
        />

        {/* Main Application Container */}
        <main className="flex-1 flex flex-col min-w-0 space-y-6">
          
          {isSettingsActive ? (
            /* Dedicated Settings Page View */
            <SettingsView
              onBackToDashboard={() => setIsSettingsActive(false)}
              supervisor={supervisor}
              isDark={isDark}
              onToggleTheme={toggleTheme}
            />
          ) : isFlowHubActive ? (
            /* Flow Hub Interactive View matching user screenshots */
            <FlowHubView onBackToPortal={() => setIsFlowHubActive(false)} />
          ) : activeCalendarRecord ? (
            /* Google Calendar Style Attendance View matching user screenshot */
            <AttendanceCalendarView
              employeeName={activeCalendarRecord.name || supervisor.name}
              onBackToRoster={() => setActiveCalendarRecord(null)}
              records={records}
            />
          ) : (
            /* Standard Time Tracker Portal Dashboard */
            <>
              {/* Dashboard Title & Action Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    OPERATIONS & CALL TRACKING
                  </span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                      Agent Time & Call Tracker
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 dark:bg-blue-900/40 border border-[#2F6798]/20">
                      <Sparkles className="w-3 h-3" /> Training Hub DB
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Record live customer interactions, calculate average handling time, and sync with performance reporting.
                  </p>
                </div>

                {/* Quick Actions: Agent Selector, View Switcher, Manual Entry */}
                <div className="flex items-center gap-3 self-stretch sm:self-auto flex-wrap">
                  
                  {toastMsg && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{toastMsg}</span>
                    </span>
                  )}

                  {/* Agent Selector Dropdown */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
                    <User className="w-3.5 h-3.5 text-[#2F6798]" />
                    <select
                      value={currentAgent}
                      onChange={(e) => setCurrentAgent(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer max-w-[160px] truncate"
                    >
                      <option value="Matt Riner Balaba">Matt Riner Balaba</option>
                      <option value="Jeremy Rigodon">Jeremy Rigodon</option>
                      {employees
                        .filter((emp) => emp.name && emp.name !== 'Matt Riner Balaba' && emp.name !== 'Jeremy Rigodon')
                        .slice(0, 30)
                        .map((emp, idx) => (
                          <option key={idx} value={emp.name}>
                            {emp.name} {emp.role ? `(${emp.role})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* View Switcher Pills */}
                  <div className="p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 flex items-center text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('tracker')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'tracker'
                          ? 'bg-white dark:bg-[#101D3D] text-[#2F6798] dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Tracker & Logs
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'analytics'
                          ? 'bg-white dark:bg-[#101D3D] text-[#2F6798] dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Analytics
                    </button>
                  </div>

                  {/* Manual Entry Button in Primary Blue #2F6798 */}
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2F6798] hover:bg-[#235179] active:bg-[#1c4366] text-white text-xs font-bold shadow-sm shadow-[#2F6798]/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Manual Entry</span>
                  </button>

                </div>
              </div>

              {/* Top KPI Summary Cards with ligh_mode_hero.png background watermark */}
              <KpiSummary stats={kpiStats} />

              {/* Dynamic View: Tracker & Logs vs Analytics */}
              {activeTab === 'tracker' ? (
                <>
                  {/* Live Interactive Stopwatch & Call Timer Widget */}
                  <TimerTracker
                    currentAgent={currentAgent}
                    accounts={accounts}
                    onRecordSaved={handleRecordAdded}
                    onTimerStateChange={handleTimerStateChange}
                  />

                  {/* Analytics Breakdown Preview */}
                  <AnalyticsCharts records={records} />

                  {/* Shift & Phone Time Logs Table */}
                  <TimeLogsTable
                    records={records}
                    isLoading={isLoading}
                    onRefresh={fetchData}
                    onDeleteRecord={handleDeleteRecord}
                    onOpenCalendar={(rec) => setActiveCalendarRecord(rec)}
                    accounts={accounts}
                  />
                </>
              ) : (
                <>
                  {/* Analytics Focused View */}
                  <AnalyticsCharts records={records} />

                  {/* Shift & Phone Time Logs Table */}
                  <TimeLogsTable
                    records={records}
                    isLoading={isLoading}
                    onRefresh={fetchData}
                    onDeleteRecord={handleDeleteRecord}
                    onOpenCalendar={(rec) => setActiveCalendarRecord(rec)}
                    accounts={accounts}
                  />
                </>
              )}
            </>
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
