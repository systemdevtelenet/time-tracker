'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  RotateCw, 
  FileText, 
  Search, 
  LogIn, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  FileEdit,
  CheckCircle2
} from 'lucide-react';
import { 
  getActivityLogs, 
  syncActivityLogsWithApi,
  formatRelativeTime, 
  SystemActivityLog 
} from '@/lib/activityLogs';

interface ActivityLogsViewProps {
  onBackToDashboard?: () => void;
  supervisorName?: string;
}

const FILTER_TABS = [
  { id: 'all', label: 'All Activities' },
  { id: 'trainees', label: 'Trainees' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'attendance', label: 'Trainer Attendance' },
  { id: 'remarks', label: 'Traffic Lights & Remarks' },
  { id: 'logins', label: 'User Logins' },
  { id: 'alerts', label: 'Alerts & Actions' },
];

export default function ActivityLogsView({
  onBackToDashboard,
  supervisorName = 'Nissi-Jeh Reguero',
}: ActivityLogsViewProps) {
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    const current = getActivityLogs();
    setLogs(current);
    const synced = await syncActivityLogsWithApi();
    if (synced && synced.length > 0) {
      setLogs(synced);
    }
  };

  useEffect(() => {
    fetchLogs();
    const handleLogUpdate = () => {
      setLogs(getActivityLogs());
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
    setToastMsg('Activity log refreshed.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      setToastMsg('No logs available to export.');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    const headers = ['ID', 'Timestamp', 'Title', 'Category', 'Description', 'Performed By'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.performedBy.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('Activity log exported successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filter Tab Match
      let matchesTab = true;
      if (activeFilter === 'trainees') {
        matchesTab = log.category === 'TRAINEES' || log.type === 'trainee' || log.category === 'TIME LOG';
      } else if (activeFilter === 'trainers') {
        matchesTab = log.category === 'TRAINERS' || log.type === 'trainer' || log.performedBy.includes('Reguero') || log.performedBy.includes('Caballes');
      } else if (activeFilter === 'attendance') {
        matchesTab = log.category === 'PUNCH' || log.category === 'ATTENDANCE' || log.type === 'punch' || log.type === 'attendance';
      } else if (activeFilter === 'remarks') {
        matchesTab = log.category === 'REMARKS' || log.type === 'remark' || log.title.toLowerCase().includes('note') || log.title.toLowerCase().includes('handover');
      } else if (activeFilter === 'logins') {
        matchesTab = log.category === 'AUTH' || log.type === 'login' || log.title.toLowerCase().includes('login');
      } else if (activeFilter === 'alerts') {
        matchesTab = log.category === 'SYSTEM' || log.category === 'ALERT' || log.type === 'system' || log.type === 'alert' || log.title.toLowerCase().includes('deleted');
      }

      // 2. Search Query Match
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          log.title.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.performedBy.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q);
      }

      return matchesTab && matchesSearch;
    }).slice(0, 10);
  }, [logs, activeFilter, searchQuery]);

  const getLogIcon = (log: SystemActivityLog) => {
    if (log.category === 'AUTH' || log.type === 'login') return LogIn;
    if (log.category === 'PUNCH' || log.type === 'punch') return Clock;
    if (log.category === 'TIME LOG' || log.type === 'timelog') return FileText;
    if (log.category === 'ATTENDANCE' || log.type === 'attendance') return UserCheck;
    if (log.category === 'TRAINEES' || log.type === 'trainee') return Users;
    if (log.category === 'REMARKS' || log.type === 'remark') return FileEdit;
    if (log.category === 'ALERT' || log.type === 'alert') return AlertTriangle;
    return ShieldCheck;
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-12 font-sans select-none">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Activity Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            A chronological timeline of system events, logins, updates, and administrative actions.
          </p>
        </div>

        {/* Top Right Action Buttons (Refresh & Export Log) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#0E1B38] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#0E1B38] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* 2. Main White Container Card matching screenshot */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        
        {/* Top Filter Pills & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Filter Pills with multi-row wrap */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E4D79] dark:bg-[#24537D] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input on the right */}
          <div className="relative shrink-0 w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activity by keyword, user..."
              className="w-full pl-8 pr-4 py-1.5 rounded-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1E4D79] shadow-2xs"
            />
          </div>

        </div>

        {/* 3. Items List matching screenshot */}
        <div className="space-y-2.5 pt-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const Icon = getLogIcon(log);
              return (
                <div
                  key={log.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B142B] hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Left Side: Icon + Title + Category Pill + Description */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Light Blue Circle Icon */}
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2F6798] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {log.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-[#2F6798] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/40 uppercase tracking-wider">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Timestamp + Performed By */}
                  <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      By <b className="text-slate-700 dark:text-slate-300 font-bold">{log.performedBy}</b>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold">No activity logs found for this filter.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
