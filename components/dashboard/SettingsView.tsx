'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw,
  Save, 
  User, 
  Bell, 
  Sliders, 
  ShieldCheck, 
  Camera, 
  Upload,
  Trash2,
  Mail, 
  Calendar, 
  Clock, 
  Briefcase, 
  Hash, 
  Check, 
  CheckCircle2, 
  Volume2, 
  RefreshCw, 
  Download, 
  Sun, 
  Moon,
  Database,
  Lock,
  Layers,
  Sparkles,
  Play,
  Square,
  Music,
  Phone,
  Radio,
  Gamepad2,
  Disc,
  BellRing,
  Activity
} from 'lucide-react';
import { SupervisorProfile } from './Sidebar';

interface SettingsViewProps {
  onBackToDashboard?: () => void;
  supervisor: SupervisorProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  themeMode?: 'light' | 'dark' | 'system';
  onSelectThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
  onUpdateAvatar?: (avatarUrl?: string) => void;
}

type TabType = 'profile' | 'notifications' | 'general';

import { 
  getSelectedRingtone, 
  setSelectedRingtone as persistSelectedRingtone, 
  playAlarmSound, 
  DEFAULT_RINGTONE_ID 
} from '@/lib/soundAlerts';

export default function SettingsView({
  onBackToDashboard,
  supervisor,
  isDark,
  onToggleTheme,
  themeMode: propThemeMode,
  onSelectThemeMode,
  onUpdateAvatar,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamically load profile from supervisor prop or localStorage
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ctnp_current_user');
        if (raw) setLocalUser(JSON.parse(raw));
      } catch (e) {}
    }
  }, []);

  const activeUser = {
    ...supervisor,
    ...localUser,
  };

  const displayName = activeUser.name || '';
  const nameParts = displayName.trim().split(/\s+/);
  const firstName = activeUser.firstName || (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : displayName);
  const lastName = activeUser.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '');
  const middleName = activeUser.middleName || '—';
  const suffixName = activeUser.suffix || 'N/A';
  const employeeId = activeUser.id || activeUser.employee_id || activeUser.employeeNumber || '—';
  const positionTitle = activeUser.position || activeUser.primaryTask || activeUser.role || '—';
  const emailContact = activeUser.email || (displayName ? `${displayName.toLowerCase().replace(/\s+/g, '.')}@cebutelenet.com` : '—');
  const department = activeUser.department || (activeUser.account ? `${activeUser.account} Operations` : 'Operations');
  const assignedShift = activeUser.shift || '—';
  const directSupervisor = activeUser.directSupervisor || activeUser.supervisor || '—';
  const accountLOB = activeUser.accounts || activeUser.account || '—';
  const startDate = activeUser.startDate || activeUser.hire_date || '—';

  // Photo state & dropdown
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(supervisor.avatarUrl || null);
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState(false);
  const cameraDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supervisor.avatarUrl) {
      setAvatarPhoto(supervisor.avatarUrl);
    } else if (localUser?.avatar_url || localUser?.avatarUrl) {
      setAvatarPhoto(localUser.avatar_url || localUser.avatarUrl);
    }
  }, [supervisor.avatarUrl, localUser]);

  // Handle clicking outside camera dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cameraDropdownRef.current && !cameraDropdownRef.current.contains(event.target as Node)) {
        setIsCameraDropdownOpen(false);
      }
    }
    if (isCameraDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCameraDropdownOpen]);

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const photoData = uploadEvent.target.result as string;
          setAvatarPhoto(photoData);

          // 1. Update localStorage
          try {
            const raw = localStorage.getItem('ctnp_current_user');
            const parsed = raw ? JSON.parse(raw) : {};
            const updated = {
              ...parsed,
              avatar_url: photoData,
              avatarUrl: photoData,
            };
            localStorage.setItem('ctnp_current_user', JSON.stringify(updated));
            setLocalUser(updated);
          } catch (err) {}

          // 2. Notify parent component via prop
          if (onUpdateAvatar) {
            onUpdateAvatar(photoData);
          }

          // 3. Dispatch global custom event for all page components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { avatarUrl: photoData } }));
          }

          setToastMessage('Profile photo updated!');
          setTimeout(() => setToastMessage(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setIsCameraDropdownOpen(false);
    setAvatarPhoto(null);

    // 1. Update localStorage
    try {
      const raw = localStorage.getItem('ctnp_current_user');
      const parsed = raw ? JSON.parse(raw) : {};
      const updated = {
        ...parsed,
        avatar_url: null,
        avatarUrl: null,
      };
      localStorage.setItem('ctnp_current_user', JSON.stringify(updated));
      setLocalUser(updated);
    } catch (err) {}

    // 2. Notify parent component via prop
    if (onUpdateAvatar) {
      onUpdateAvatar(undefined);
    }

    // 3. Dispatch global custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { avatarUrl: undefined } }));
    }

    setToastMessage('Profile photo removed');
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Alarm Ringtone State (Defaults to 'jungle' - Welcome to the Jungle)
  const [selectedRingtone, setSelectedRingtone] = useState<string>(() => getSelectedRingtone());
  const [playingRingtone, setPlayingRingtone] = useState<string | null>(null);

  const handleSelectRingtone = (ringtoneId: string) => {
    setSelectedRingtone(ringtoneId);
    persistSelectedRingtone(ringtoneId);
  };

  // Web Audio Synthesizer for all 10 Ringtones
  const playRingtone = (ringtoneId: string) => {
    setPlayingRingtone(ringtoneId);
    playAlarmSound(ringtoneId, () => setPlayingRingtone(null));
  };

  // Notification Preferences States (Alert Triggers & Delivery Channels)
  const [performanceAlerts, setPerformanceAlerts] = useState(true);
  const [batchTrainerUpdates, setBatchTrainerUpdates] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailDigestAlerts, setEmailDigestAlerts] = useState(false);

  // Theme Preference State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (propThemeMode) return propThemeMode;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_preference') as 'light' | 'dark' | 'system' | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    }
    return isDark ? 'dark' : 'light';
  });

  useEffect(() => {
    if (propThemeMode) {
      setThemeMode(propThemeMode);
    }
  }, [propThemeMode]);

  const handleSelectTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (onSelectThemeMode) {
      onSelectThemeMode(mode);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme_preference', mode);
        let darkActive = false;
        if (mode === 'dark') {
          darkActive = true;
        } else if (mode === 'light') {
          darkActive = false;
        } else {
          darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        if (darkActive) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        if (darkActive !== isDark) {
          onToggleTheme();
        }
      }
    }
  };

  // Trigger Save Feedback
  const handleSaveChanges = () => {
    setIsSaved(true);
    setToastMessage('Settings successfully saved!');
    setTimeout(() => setIsSaved(false), 2500);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset to default
  const handleResetDefault = () => {
    setPerformanceAlerts(true);
    setBatchTrainerUpdates(true);
    setInAppNotifications(true);
    setEmailDigestAlerts(false);
    handleSelectTheme('system');
    setSelectedRingtone('jungle');
    setToastMessage('Settings reset to system defaults');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications' as TabType, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'general' as TabType, label: 'General', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Page Container & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            System Settings
          </h1>
          <p className="text-xs font-normal text-slate-400">
            Manage system preferences, notifications, and company profile details.
          </p>
        </div>

        {/* 2. Header Action Buttons */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          {toastMessage && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </span>
          )}

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={handleResetDefault}
            className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handleSaveChanges}
            className="py-2 px-5 rounded-xl bg-[#2F6798] hover:bg-[#24527A] active:bg-[#1f4a6e] text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-[#434142] pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#363435] text-[#2F6798] dark:text-[#3678B0] border border-slate-200/80 dark:border-[#434142] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-[#F8F8F6] hover:bg-slate-100/60 dark:hover:bg-[#2C2A2B]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl p-8 bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-sm space-y-6">
          
          {/* Card Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-[#F8F8F6]">
                Profile Information
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-[#94A3B8]">
                Personal & employment details managed by Cebu Tele-Net.
              </p>
            </div>

            {/* Company Managed Badge */}
            <div className="py-1.5 px-3 rounded-full bg-slate-100 dark:bg-[#1D2433] border border-slate-200/60 dark:border-[#434142] flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F6798] dark:text-[#3678B0]" />
              <span className="text-xs font-bold text-slate-600 dark:text-[#F8F8F6]">
                Company Managed
              </span>
            </div>
          </div>

          {/* Profile Hero Banner with Dark Mode styling */}
          <div className="bg-[#2F6798] dark:bg-[#201F20] dark:border dark:border-[#434142] rounded-[24px] p-5 max-w-[95%] mx-auto w-full shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar with Camera Overlay & Dropdown Menu */}
              <div className="relative shrink-0" ref={cameraDropdownRef}>
                <div className="w-32 h-32 rounded-full ring-4 ring-white/20 dark:ring-[#434142] p-2 flex items-center justify-center">
                  {avatarPhoto ? (
                    <img
                      src={avatarPhoto}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full shadow-inner select-none"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#24527A] dark:bg-[#1D2433] dark:border dark:border-[#434142] text-white dark:text-[#F8F8F6] font-black text-3xl flex items-center justify-center shadow-inner select-none">
                      {displayName ? displayName.split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'}
                    </div>
                  )}
                </div>

                {/* Camera Action Button */}
                <button
                  type="button"
                  onClick={() => setIsCameraDropdownOpen(!isCameraDropdownOpen)}
                  title="Update profile picture"
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white border-2 border-white dark:border-[#434142] flex items-center justify-center cursor-pointer transition-colors shadow-md z-10"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Hidden File Input for Image Selection */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Dropdown Menu when Camera is Clicked */}
                {isCameraDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#363435] border border-slate-100 dark:border-[#434142] shadow-2xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 origin-top-left">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] transition-colors cursor-pointer text-left"
                    >
                      <Upload className="w-4 h-4 text-[#2F6798] dark:text-[#3678B0] shrink-0" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-[#ED1C25] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Identity, Role & 4-Column Bar (Pill Position on Next Line) */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white dark:text-[#F8F8F6] tracking-tight">
                    {displayName}
                  </h3>
                  <div className="mt-1.5 mb-1.5">
                    <div className="inline-flex py-1 px-3 rounded-full bg-white/20 dark:bg-[#1D2433] backdrop-blur-md border border-white/25 dark:border-[#434142]">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-white dark:text-[#3678B0]">
                        {positionTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-medium text-white/80 dark:text-[#94A3B8]">
                  {emailContact}
                </p>

                {/* Stats Pill Container (4-Column Details Bar) */}
                <div className="mt-3 bg-white/10 dark:bg-[#272626] backdrop-blur-md border border-white/15 dark:border-[#434142] rounded-2xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15 dark:divide-[#434142]">
                    
                    {/* Col 1: Employee ID */}
                    <div className="pt-2 sm:pt-0 sm:pr-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 dark:text-[#94A3B8]">
                        EMPLOYEE ID
                      </span>
                      <span className="block text-xs font-bold text-white dark:text-[#F8F8F6] mt-0.5">
                        {employeeId}
                      </span>
                    </div>

                    {/* Col 2: Start Date */}
                    <div className="pt-2 sm:pt-0 sm:px-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 dark:text-[#94A3B8]">
                        START DATE
                      </span>
                      <span className="block text-xs font-bold text-white dark:text-[#F8F8F6] mt-0.5">
                        {startDate}
                      </span>
                    </div>

                    {/* Col 3: Accounts */}
                    <div className="pt-2 sm:pt-0 sm:px-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 dark:text-[#94A3B8]">
                        ACCOUNTS
                      </span>
                      <span className="block text-xs font-bold text-white dark:text-[#F8F8F6] mt-0.5">
                        {accountLOB}
                      </span>
                    </div>

                    {/* Col 4: Position */}
                    <div className="pt-2 sm:pt-0 sm:pl-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 dark:text-[#94A3B8]">
                        POSITION
                      </span>
                      <span className="block text-xs font-bold text-white dark:text-[#F8F8F6] mt-0.5 truncate">
                        {positionTitle}
                      </span>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Form Input Fields (Read-Only Company Details) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* First Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>First Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={firstName}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Middle Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={middleName}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Last Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={lastName || '—'}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Suffix Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Suffix Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={suffixName}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Employee Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Employee Number</span>
              </label>
              <input
                type="text"
                readOnly
                value={employeeId}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Official Work Email</span>
              </label>
              <input
                type="text"
                readOnly
                value={emailContact}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Assigned Shift */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Assigned Shift Schedule</span>
              </label>
              <input
                type="text"
                readOnly
                value={assignedShift}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Direct Supervisor */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Direct Supervisor</span>
              </label>
              <input
                type="text"
                readOnly
                value={directSupervisor}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Account */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-[#94A3B8]">
                <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                <span>Account</span>
              </label>
              <input
                type="text"
                readOnly
                value={accountLOB}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-[#272626] dark:border dark:border-[#434142] text-sm font-medium text-slate-800 dark:text-[#F8F8F6] cursor-default select-none pointer-events-none outline-none"
              />
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Notification Header */}
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F8F8F6] tracking-tight">
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal">
              Manage which critical events notify you and how you receive them.
            </p>
          </div>

          {/* Card 1: Alert Triggers */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
                <span className="text-sm font-black">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#F8F8F6] leading-tight">
                  Alert Triggers
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                  Essential operational and performance notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Row 1: Performance & KPI Alerts */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-[#F8F8F6]">
                    Performance & KPI Alerts
                  </span>
                  <span className="block text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                    Notify when attrition, attendance, or reliability fall below target thresholds.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPerformanceAlerts(!performanceAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    performanceAlerts ? 'bg-[#2F6798] dark:bg-[#3678B0]' : 'bg-slate-200 dark:bg-[#272626]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      performanceAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Batch & Trainer Updates */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-[#F8F8F6]">
                    Batch & Trainer Updates
                  </span>
                  <span className="block text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                    Alert when new batches are assigned, trainer rosters change, or status updates occur.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchTrainerUpdates(!batchTrainerUpdates)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    batchTrainerUpdates ? 'bg-[#2F6798] dark:bg-[#3678B0]' : 'bg-slate-200 dark:bg-[#272626]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      batchTrainerUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Delivery Channels */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#F8F8F6] leading-tight">
                  Delivery Channels
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                  Choose where alerts are delivered.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Row 1: In-App Notifications */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-[#F8F8F6]">
                      In-App Notifications
                    </span>
                    <span className="block text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                      Display banner badges and alerts within the application
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInAppNotifications(!inAppNotifications)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    inAppNotifications ? 'bg-[#2F6798] dark:bg-[#3678B0]' : 'bg-slate-200 dark:bg-[#272626]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      inAppNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Email Digest & Alerts */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-[#F8F8F6]">
                      Email Digest & Alerts
                    </span>
                    <span className="block text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                      Send critical summaries directly to your registered email
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDigestAlerts(!emailDigestAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    emailDigestAlerts ? 'bg-[#2F6798] dark:bg-[#3678B0]' : 'bg-slate-200 dark:bg-[#272626]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      emailDigestAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: General & Theme Preference, Font Size, and Alarm Ringtone */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* 1. Theme Preference Card */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0] flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#F8F8F6] leading-tight">
                  Theme Preference
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                  Select how the Interface should appear on your device.
                </p>
              </div>
            </div>

            {/* 3 Option Buttons: Light, Dark, System */}
            <div className="flex items-center gap-3 pt-1">
              {/* Light Button */}
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`w-28 py-3.5 px-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  themeMode === 'light'
                    ? 'border-2 border-[#2F6798] dark:border-[#3678B0] text-[#2F6798] dark:text-[#3678B0] bg-blue-50/30 dark:bg-[#1D2433] shadow-xs ring-2 ring-[#2F6798]/20 dark:ring-[#3678B0]/30'
                    : 'border border-slate-200 dark:border-[#434142] text-slate-600 dark:text-[#94A3B8] hover:border-slate-300 dark:hover:border-[#434142] bg-white dark:bg-[#272626] hover:bg-slate-50 dark:hover:bg-[#2C2A2B]'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-bold">Light</span>
              </button>

              {/* Dark Button */}
              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`w-28 py-3.5 px-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'border-2 border-[#2F6798] dark:border-[#3678B0] text-[#2F6798] dark:text-[#3678B0] bg-blue-50/30 dark:bg-[#1D2433] shadow-xs ring-2 ring-[#2F6798]/20 dark:ring-[#3678B0]/30'
                    : 'border border-slate-200 dark:border-[#434142] text-slate-600 dark:text-[#94A3B8] hover:border-slate-300 dark:hover:border-[#434142] bg-white dark:bg-[#272626] hover:bg-slate-50 dark:hover:bg-[#2C2A2B]'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-bold">Dark</span>
              </button>

              {/* System Button */}
              <button
                type="button"
                onClick={() => handleSelectTheme('system')}
                className={`w-28 py-3.5 px-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  themeMode === 'system'
                    ? 'border-2 border-[#2F6798] dark:border-[#3678B0] text-[#2F6798] dark:text-[#3678B0] bg-blue-50/30 dark:bg-[#1D2433] shadow-xs ring-2 ring-[#2F6798]/20 dark:ring-[#3678B0]/30'
                    : 'border border-slate-200 dark:border-[#434142] text-slate-600 dark:text-[#94A3B8] hover:border-slate-300 dark:hover:border-[#434142] bg-white dark:bg-[#272626] hover:bg-slate-50 dark:hover:bg-[#2C2A2B]'
                }`}
              >
                <Sliders className="w-5 h-5" />
                <span className="text-xs font-bold">System</span>
              </button>
            </div>
          </div>

          {/* 2. Alarm Ringtone Card (10 Functional Sounds) */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0] flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#F8F8F6] leading-tight">
                  Alarm Ringtone
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal mt-0.5">
                  This is the sound that rings when your break/lunch time is nearly up or you exceed your limit.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { id: 'jungle', name: 'Welcome to the Jungle (classic)', Icon: Music },
                { id: 'phone', name: 'Classic Phone', Icon: Phone },
                { id: 'beep', name: 'Digital Beep', Icon: Radio },
                { id: 'chime', name: 'Soft Chime', Icon: Bell },
                { id: 'retro', name: 'Retro Alarm', Icon: Gamepad2 },
                { id: 'gong', name: 'Zen Singing Bowl', Icon: Disc },
                { id: 'dingdong', name: 'Elevator Ding-Dong', Icon: BellRing },
                { id: 'sparkle', name: 'Ascending Sparkle', Icon: Sparkles },
                { id: 'woodblock', name: 'Woodblock Knock', Icon: Layers },
                { id: 'synthpad', name: 'Warm Synth Wave', Icon: Activity },
              ].map((tone) => {
                const isSelected = selectedRingtone === tone.id;
                const isPlaying = playingRingtone === tone.id;
                const ToneIcon = tone.Icon;

                return (
                  <div
                    key={tone.id}
                    onClick={() => handleSelectRingtone(tone.id)}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#2F6798] dark:border-[#3678B0] bg-blue-50/40 dark:bg-[#1D2433] shadow-xs'
                        : 'border border-slate-200 dark:border-[#434142] bg-white dark:bg-[#272626] hover:border-slate-300 dark:hover:border-[#434142]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio Indicator */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#2F6798] bg-[#2F6798] dark:border-[#3678B0] dark:bg-[#3678B0]' : 'border-slate-300 dark:border-[#434142]'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Icon Container */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-[#3678B0]/20 dark:text-[#3678B0]' 
                          : 'bg-slate-100 dark:bg-[#363435] text-slate-500 dark:text-[#94A3B8]'
                      }`}>
                        <ToneIcon className="w-3.5 h-3.5" />
                      </div>

                      <span className={`text-xs ${
                        isSelected ? 'text-slate-900 dark:text-[#F8F8F6] font-bold' : 'text-slate-700 dark:text-[#94A3B8] font-medium'
                      }`}>
                        {tone.name}
                      </span>
                    </div>

                    {/* Interactive Play / Stop Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRingtone(tone.id);
                        playRingtone(tone.id);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#2F6798] hover:bg-[#24527A] active:bg-[#1f4a6e] text-white shadow-2xs"
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-white text-white" />
                          <span className="text-white font-bold">Playing</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white text-white" />
                          <span className="text-white font-bold">Play</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}


