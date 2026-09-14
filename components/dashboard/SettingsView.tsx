'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Clock, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Database, 
  Save, 
  Check, 
  Sparkles, 
  Sliders, 
  Volume2, 
  RefreshCw, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Smartphone, 
  Building2, 
  Layers,
  Palette,
  Laptop
} from 'lucide-react';
import { SupervisorProfile } from './Sidebar';

interface SettingsViewProps {
  onBackToDashboard: () => void;
  supervisor: SupervisorProfile;
  isDark: boolean;
  onToggleTheme: () => void;
}

type SettingsSection = 'profile' | 'shift' | 'tracker' | 'notifications' | 'appearance' | 'integrations';

export default function SettingsView({
  onBackToDashboard,
  supervisor,
  isDark,
  onToggleTheme,
}: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Settings Form
  const [fullName, setFullName] = useState(supervisor.name || 'Nissi-Jeh Reguero');
  const [employeeId, setEmployeeId] = useState(supervisor.id || '1597');
  const [positionTitle, setPositionTitle] = useState(supervisor.position || 'Head of Training');
  const [emailContact, setEmailContact] = useState('nissijeh.reguero@cebutelenet.com');
  const [slackHandle, setSlackHandle] = useState('@nissijeh.r');
  const [timezone, setTimezone] = useState('Asia/Manila (UTC+08:00)');

  // Shift & Adherence Rules
  const [gracePeriodMins, setGracePeriodMins] = useState(5);
  const [maxBreakMins, setMaxBreakMins] = useState(15);
  const [maxLunchMins, setMaxLunchMins] = useState(60);
  const [autoFlagUndertime, setAutoFlagUndertime] = useState(true);
  const [trafficGreenThreshold, setTrafficGreenThreshold] = useState(95);
  const [trafficYellowThreshold, setTrafficYellowThreshold] = useState(85);

  // Time Tracker Rules
  const [targetAhtSeconds, setTargetAhtSeconds] = useState(300); // 5 min
  const [defaultPomodoroMins, setDefaultPomodoroMins] = useState(25);
  const [autoPauseIdleMins, setAutoPauseIdleMins] = useState(3);
  const [autoReconcileLogs, setAutoReconcileLogs] = useState(true);

  // Notification Preferences
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [overBreakAlerts, setOverBreakAlerts] = useState(true);
  const [escalationPush, setEscalationPush] = useState(true);
  const [wellnessReminders, setWellnessReminders] = useState(true);
  const [alertTone, setAlertTone] = useState<'gentle' | 'modern' | 'bell'>('modern');

  // Appearance & Display
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [showLiveGlow, setShowLiveGlow] = useState(true);

  // Trigger Save Feedback
  const handleSaveAll = () => {
    setIsSaved(true);
    setToastMessage('Settings successfully saved and synced!');
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Test Web Audio Chime
  const handleTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(alertTone === 'gentle' ? 520 : alertTone === 'bell' ? 880 : 660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      
      setToastMessage(`Played sound preview: ${alertTone.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Export CSV Handler
  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Agent,Status,AHT,Adherence\n2026-09-15,Matt Riner Balaba,Completed,4m 12s,98%\n2026-09-15,Jeremy Rigodon,Completed,5m 02s,96%";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cebu_telenet_shift_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Shift log export downloaded!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const navItems = [
    { id: 'profile', label: 'Supervisor Profile', icon: <User className="w-4 h-4" />, desc: 'Personal details, credentials & role' },
    { id: 'shift', label: 'Shift & Adherence', icon: <Clock className="w-4 h-4" />, desc: 'Grace periods, break limits & penalties' },
    { id: 'tracker', label: 'Time Tracking', icon: <Sliders className="w-4 h-4" />, desc: 'AHT targets, Pomodoro & idle limits' },
    { id: 'notifications', label: 'Notifications & Audio', icon: <Bell className="w-4 h-4" />, desc: 'Sound alerts, escalation bells & tones' },
    { id: 'appearance', label: 'Appearance & Theme', icon: <Palette className="w-4 h-4" />, desc: 'Dark mode, density & visual accents' },
    { id: 'integrations', label: 'Database & Sync', icon: <Database className="w-4 h-4" />, desc: 'Supabase realtime sync & data export' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#24537D] dark:text-blue-400 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workforce Portal</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#24537D] to-[#1B4266] text-white flex items-center justify-center shadow-md shadow-[#24537D]/20">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Workforce Portal Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Manage operational policies, agent tracking targets, notifications, and portal preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions: Save Button & Live Toast */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          {toastMessage && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#24537D] hover:bg-[#1B4266] active:bg-[#153450] text-white text-xs font-extrabold shadow-md shadow-[#24537D]/25 transition-all cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Changes Saved!' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Navigation Categories Menu (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 sm:p-4 space-y-1.5">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-1 block">
            SETTINGS CATEGORIES
          </span>

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id as SettingsSection)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer border ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 border-[#24537D]/40 text-[#24537D] dark:text-blue-300 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  isActive 
                    ? 'bg-[#24537D] text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span className="block font-black text-xs leading-snug">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate block">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Quick System Summary Card at bottom of sidebar */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 px-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">SYSTEM STATUS</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Cebu Tele-Net v2.4 • Supabase DB
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Settings Panel Content (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* 1. SUPERVISOR PROFILE TAB */}
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                  Supervisor Profile & Account Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Information displayed on shift rosters, coaching evaluations, and operational logs.
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-amber-50/50 dark:from-blue-950/40 dark:to-amber-950/30 border border-blue-200/60 dark:border-blue-800/40 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1C4366] via-[#24537D] to-[#C8A54B] text-white font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800 shrink-0">
                  NR
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {fullName}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8A54B]/20 text-[#9C7924] dark:text-[#E5CA80] border border-[#C8A54B]/40 uppercase">
                      ID: {employeeId} • {supervisor.role || 'SUPERVISOR'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {positionTitle} • Corporate Training
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Assigned Shift: {supervisor.shift || '9:00 PM to 6:00 AM'} • Reporting to: {supervisor.directSupervisor || 'June Babe Caballes'}
                  </p>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    EMPLOYEE ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    OFFICIAL WORK EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={emailContact}
                      onChange={(e) => setEmailContact(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    SLACK USER HANDLE
                  </label>
                  <input
                    type="text"
                    value={slackHandle}
                    onChange={(e) => setSlackHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    PORTAL TIMEZONE
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#24537D] text-xs cursor-pointer"
                  >
                    <option value="Asia/Manila (UTC+08:00)">Asia/Manila (UTC+08:00) • Philippine Standard Time</option>
                    <option value="America/New_York (UTC-05:00)">America/New_York (UTC-05:00) • US Eastern Time</option>
                    <option value="UTC (UTC+00:00)">UTC (UTC+00:00) • Universal Coordinated Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. SHIFT & ADHERENCE RULES TAB */}
          {activeSection === 'shift' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                  Shift Policies & Adherence Rules
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure punch allowances, grace periods, and traffic light status benchmarks.
                </p>
              </div>

              <div className="space-y-4">
                {/* Grace Period */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Shift Start Grace Period
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Minutes allowed past scheduled shift before flagging as Late.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={gracePeriodMins}
                      onChange={(e) => setGracePeriodMins(parseInt(e.target.value) || 0)}
                      className="w-16 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-extrabold text-center text-xs text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">mins</span>
                  </div>
                </div>

                {/* Max Break & Lunch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Standard Break Limit
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Allowed short break</span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-xs">
                        {maxBreakMins} Minutes
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Standard Lunch Limit
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Allowed meal break</span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                        {maxLunchMins} Minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traffic Light Adherence Thresholds */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                    Traffic Light Adherence Status Benchmarks
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="block font-black text-emerald-700 dark:text-emerald-300">GREEN</span>
                      <span className="text-[10px] text-slate-500">&gt;= {trafficGreenThreshold}% Reliability</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="block font-black text-amber-700 dark:text-amber-300">YELLOW</span>
                      <span className="text-[10px] text-slate-500">{trafficYellowThreshold}% - {trafficGreenThreshold - 1}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                      <span className="block font-black text-rose-700 dark:text-rose-300">RED</span>
                      <span className="text-[10px] text-slate-500">&lt; {trafficYellowThreshold}% Adherence</span>
                    </div>
                  </div>
                </div>

                {/* Auto Flag Undertime Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Auto-Flag Undertime Punches
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Highlight punches that end prior to scheduled shift end time.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoFlagUndertime}
                    onChange={(e) => setAutoFlagUndertime(e.target.checked)}
                    className="w-4 h-4 accent-[#24537D] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. TIME TRACKING & PRODUCTIVITY TAB */}
          {activeSection === 'tracker' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                  Time Tracking & Handling Targets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure average handling time goals, Pomodoro focus cycles, and auto-pause settings.
                </p>
              </div>

              <div className="space-y-4">
                {/* Target AHT */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Target Average Handling Time (AHT)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Goal duration per customer interaction ({Math.floor(targetAhtSeconds / 60)} minutes).
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="60"
                      max="1800"
                      step="30"
                      value={targetAhtSeconds}
                      onChange={(e) => setTargetAhtSeconds(parseInt(e.target.value) || 300)}
                      className="w-20 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-extrabold text-center text-xs text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">sec</span>
                  </div>
                </div>

                {/* Default Pomodoro Session */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Default Focus Timer Duration
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Starting duration for new deep work sessions in Flow Hub.
                    </span>
                  </div>
                  <select
                    value={defaultPomodoroMins}
                    onChange={(e) => setDefaultPomodoroMins(parseInt(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="15">15 Minutes (Sprint)</option>
                    <option value="25">25 Minutes (Standard)</option>
                    <option value="45">45 Minutes (Deep Work)</option>
                    <option value="60">60 Minutes (Power Hour)</option>
                  </select>
                </div>

                {/* Auto Pause on Inactivity */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Inactivity Auto-Pause
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Automatically prompt to pause stopwatch if no interaction is recorded.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={autoPauseIdleMins}
                      onChange={(e) => setAutoPauseIdleMins(parseInt(e.target.value) || 3)}
                      className="w-16 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-extrabold text-center text-xs text-slate-800 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">mins</span>
                  </div>
                </div>

                {/* Auto Reconcile Logs */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Auto-Reconcile Phone Time Logs
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sync completed customer logs directly with supervisor dashboard metrics.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReconcileLogs}
                    onChange={(e) => setAutoReconcileLogs(e.target.checked)}
                    className="w-4 h-4 accent-[#24537D] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS & AUDIO TAB */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                  Notification & Audio Alerts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage sound chimes, escalation bells, and wellness reminder prompts.
                </p>
              </div>

              <div className="space-y-4">
                {/* Master Sound Alerts */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Master Audio Chimes
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Play acoustic notifications for punches, break completions, and reminders.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlertsEnabled}
                    onChange={(e) => setSoundAlertsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#24537D] cursor-pointer"
                  />
                </div>

                {/* Tone Selector with Test Button */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Alert Sound Chime Tone
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Choose notification acoustic profile.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={alertTone}
                      onChange={(e) => setAlertTone(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="modern">Modern Ping</option>
                      <option value="gentle">Gentle Chime</option>
                      <option value="bell">Acoustic Bell</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleTestSound}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </button>
                  </div>
                </div>

                {/* Over Break Alerts */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Over-Break Sound Alerts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Notify immediately when meal or rest breaks exceed allowed threshold.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={overBreakAlerts}
                    onChange={(e) => setOverBreakAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#24537D] cursor-pointer"
                  />
                </div>

                {/* Daily Wellness Check-ins */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Daily Wellness & Hydration Prompts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Remind agents to take quick ergonomic posture breaks & hydrate.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={wellnessReminders}
                    onChange={(e) => setWellnessReminders(e.target.checked)}
                    className="w-4 h-4 accent-[#24537D] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. APPEARANCE & THEME TAB */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                  Appearance & Display Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize the interface theme, table density, and visual accessibility.
                </p>
              </div>

              <div className="space-y-4">
                {/* Theme Selector Cards */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    PORTAL COLOR THEME
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => !isDark || onToggleTheme()}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        !isDark
                          ? 'border-[#24537D] bg-blue-50/50 shadow-xs ring-2 ring-[#24537D]'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <span className="font-black text-xs text-slate-800 dark:text-slate-200">Light Mode</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Crisp white & corporate navy palette for bright environments.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => isDark || onToggleTheme()}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isDark
                          ? 'border-blue-500 bg-blue-950/40 shadow-xs ring-2 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="w-5 h-5 text-blue-400" />
                        <span className="font-black text-xs text-slate-800 dark:text-slate-200">Dark Mode</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Deep midnight blue palette optimized for night shift operations.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Table Density */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Roster & Time Log Density
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Adjust row padding in tables for higher information density.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-700">
                    <button
                      type="button"
                      onClick={() => setTableDensity('comfortable')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        tableDensity === 'comfortable' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Comfortable
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableDensity('compact')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        tableDensity === 'compact' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Compact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. DATABASE & INTEGRATIONS TAB */}
          {activeSection === 'integrations' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">
                  Database & System Integrations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cloud synchronization status with Supabase and data management utilities.
                </p>
              </div>

              <div className="space-y-4">
                {/* Supabase Connection Status Card */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-100">
                        Supabase Realtime Database Synced
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Live connection to tables: <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">time_entries</code>, <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">users</code>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase shadow-xs">
                    Connected
                  </span>
                </div>

                {/* CSV Log Export Utility */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Export Raw Shift & Phone Time Logs
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Download formatted CSV backup for offline supervisor review and analytics.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl bg-[#24537D] hover:bg-[#1B4266] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* Cache Reset */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      Local Workspace Cache
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Clear temporary offline storage and reload metadata.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('flow_hub_mind_dump');
                        setToastMessage('Local cache refreshed!');
                        setTimeout(() => setToastMessage(null), 2000);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button inside panel */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Last saved: Today at 5:26 AM • All preferences persisted locally
            </span>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-2xl bg-[#24537D] hover:bg-[#1B4266] active:bg-[#153450] text-white text-xs font-extrabold shadow-md shadow-[#24537D]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
