'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
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
  Building2, 
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
  onBackToDashboard: () => void;
  supervisor: SupervisorProfile;
  isDark: boolean;
  onToggleTheme: () => void;
}

type TabType = 'profile' | 'notifications' | 'general' | 'shift';

export default function SettingsView({
  onBackToDashboard,
  supervisor,
  isDark,
  onToggleTheme,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile data (Company managed)
  const displayName = supervisor.name || 'Nissi-Jeh Reguero';
  const nameParts = displayName.split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : displayName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const employeeId = supervisor.id || '1597';
  const positionTitle = supervisor.position || 'HEAD OF TRAINING';
  const emailContact = supervisor.email || 'nreguero.telenet@gmail.com';
  const department = 'Corporate Training & Operations';
  const assignedShift = supervisor.shift || '9:00 PM - 6:00 AM (Graveyard)';
  const directSupervisor = supervisor.directSupervisor || 'June Babe Caballes';
  const accountLOB = 'CORP';
  const startDate = '1/3/2024';

  // Photo state & dropdown
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(supervisor.avatarUrl || null);
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState(false);
  const cameraDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setAvatarPhoto(uploadEvent.target.result as string);
          setToastMessage('Profile photo updated!');
          setTimeout(() => setToastMessage(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Alarm Ringtone State (10 sounds: 5 original + 5 extra)
  const [selectedRingtone, setSelectedRingtone] = useState<string>('jungle');
  const [playingRingtone, setPlayingRingtone] = useState<string | null>(null);

  // Web Audio Synthesizer for all 10 Ringtones
  const playRingtone = (ringtoneId: string) => {
    if (typeof window === 'undefined') return;
    try {
      setPlayingRingtone(ringtoneId);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (ringtoneId === 'jungle') {
        // 80s Rock guitar arpeggiation (E, G, A, B riff)
        const notes = [164.81, 196.00, 220.00, 246.94, 220.00, 196.00, 164.81, 146.83];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.14, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + (idx + 1) * 0.12);
        });
        setTimeout(() => setPlayingRingtone(null), 1100);
      } else if (ringtoneId === 'phone') {
        // Classic twin-bell rotary telephone ring burst
        [0, 0.06, 0.12, 0.18, 0.32, 0.38, 0.44, 0.50].forEach((offset) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(750, now + offset);
          osc2.frequency.setValueAtTime(850, now + offset);
          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now + offset);
          osc2.start(now + offset);
          osc1.stop(now + offset + 0.05);
          osc2.stop(now + offset + 0.05);
        });
        setTimeout(() => setPlayingRingtone(null), 800);
      } else if (ringtoneId === 'beep') {
        // Digital wristwatch alarm beep pattern
        [0, 0.12, 0.24, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2048, now + offset);
          gain.gain.setValueAtTime(0.08, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.07);
        });
        setTimeout(() => setPlayingRingtone(null), 600);
      } else if (ringtoneId === 'chime') {
        // Warm soft harmonic bell chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.18, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.7);
        });
        setTimeout(() => setPlayingRingtone(null), 1200);
      } else if (ringtoneId === 'retro') {
        // Retro 8-bit arcade oscillating laser buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        setTimeout(() => setPlayingRingtone(null), 500);
      } else if (ringtoneId === 'gong') {
        // Deep resonant Zen singing bowl / meditation gong
        [180, 220, 330, 440].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          const volume = idx === 0 ? 0.3 : 0.12;
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.8);
        });
        setTimeout(() => setPlayingRingtone(null), 1800);
      } else if (ringtoneId === 'dingdong') {
        // Two-tone elevator / PA announcement Ding-Dong (High G5 -> Low C5)
        const tones = [
          { freq: 783.99, time: 0, dur: 0.8 },     // G5 (Ding)
          { freq: 523.25, time: 0.35, dur: 0.9 }   // C5 (Dong)
        ];
        tones.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);
          gain.gain.setValueAtTime(0.22, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
        setTimeout(() => setPlayingRingtone(null), 1300);
      } else if (ringtoneId === 'sparkle') {
        // Ascending crystal sparkle arpeggio
        [587.33, 739.99, 880, 1174.66, 1479.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.14, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
        setTimeout(() => setPlayingRingtone(null), 900);
      } else if (ringtoneId === 'woodblock') {
        // Snappy organic woodblock double-knock percussion
        [0, 0.14].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = idx === 0 ? 880 : 1046.5;
          osc.frequency.setValueAtTime(freq, now + offset);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + offset + 0.05);
          gain.gain.setValueAtTime(0.3, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
        setTimeout(() => setPlayingRingtone(null), 300);
      } else if (ringtoneId === 'synthpad') {
        // Warm polyphonic 80s synth pad chord (Maj7)
        [261.63, 329.63, 392.00, 493.88].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        });
        setTimeout(() => setPlayingRingtone(null), 1200);
      }
    } catch (err) {
      console.error('Ringtone playback error:', err);
      setPlayingRingtone(null);
    }
  };

  // Notification Preferences States (Alert Triggers & Delivery Channels)
  const [performanceAlerts, setPerformanceAlerts] = useState(true);
  const [batchTrainerUpdates, setBatchTrainerUpdates] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailDigestAlerts, setEmailDigestAlerts] = useState(false);

  // Theme Preference State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(isDark ? 'dark' : 'light');

  const handleSelectTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (mode === 'light' && isDark) {
      onToggleTheme();
    } else if (mode === 'dark' && !isDark) {
      onToggleTheme();
    } else if (mode === 'system') {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark !== isDark) {
          onToggleTheme();
        }
      }
    }
  };

  // Shift & Adherence States
  const [gracePeriodMins, setGracePeriodMins] = useState(5);
  const [targetAhtSeconds, setTargetAhtSeconds] = useState(300);
  const [defaultPomodoroMins, setDefaultPomodoroMins] = useState(25);

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
    setGracePeriodMins(5);
    setTargetAhtSeconds(300);
    setDefaultPomodoroMins(25);
    setThemeMode('light');
    setSelectedRingtone('jungle');
    if (isDark) onToggleTheme();
    setToastMessage('Settings reset to system defaults');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications' as TabType, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'general' as TabType, label: 'General', icon: <Sliders className="w-4 h-4" /> },
    { id: 'shift' as TabType, label: 'Shift & Policies', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Page Container & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6798] dark:text-blue-400 hover:underline mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workforce Portal</span>
          </button>
          
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
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-[#2F6798] dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
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
        <div className="rounded-2xl p-8 bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Card Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                Profile Information
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Personal & employment details managed by Cebu Tele-Net.
              </p>
            </div>

            {/* Company Managed Badge */}
            <div className="py-1.5 px-3 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Company Managed
              </span>
            </div>
          </div>

          {/* Blue Profile Hero Banner */}
          <div className="bg-[#2F6798] rounded-[24px] p-5 max-w-[95%] mx-auto w-full shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar with Camera Overlay & Dropdown Menu */}
              <div className="relative shrink-0" ref={cameraDropdownRef}>
                <div className="w-32 h-32 rounded-full ring-4 ring-white/20 p-2 flex items-center justify-center">
                  {avatarPhoto ? (
                    <img
                      src={avatarPhoto}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full shadow-inner select-none"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#24527A] text-white font-black text-3xl flex items-center justify-center shadow-inner select-none">
                      {displayName ? displayName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'NR'}
                    </div>
                  )}
                </div>

                {/* Camera Action Button */}
                <button
                  type="button"
                  onClick={() => setIsCameraDropdownOpen(!isCameraDropdownOpen)}
                  title="Update profile picture"
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white border-2 border-white flex items-center justify-center cursor-pointer transition-colors shadow-md z-10"
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

                {/* Dropdown Menu when Camera is Clicked (Matching Second Image) */}
                {isCameraDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 origin-top-left">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    >
                      <Upload className="w-4 h-4 text-[#2F6798] dark:text-blue-400 shrink-0" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraDropdownOpen(false);
                        setAvatarPhoto(null);
                        setToastMessage('Profile photo removed');
                        setTimeout(() => setToastMessage(null), 2000);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
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
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {displayName}
                  </h3>
                  <div className="mt-1.5 mb-1.5">
                    <div className="inline-flex py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                        {positionTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-medium text-white/80">
                  {emailContact}
                </p>

                {/* Stats Pill Container (4-Column Details Bar) */}
                <div className="mt-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
                    
                    {/* Col 1: Employee ID */}
                    <div className="pt-2 sm:pt-0 sm:pr-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60">
                        EMPLOYEE ID
                      </span>
                      <span className="block text-xs font-bold text-white mt-0.5">
                        {employeeId}
                      </span>
                    </div>

                    {/* Col 2: Start Date */}
                    <div className="pt-2 sm:pt-0 sm:px-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60">
                        START DATE
                      </span>
                      <span className="block text-xs font-bold text-white mt-0.5">
                        {startDate}
                      </span>
                    </div>

                    {/* Col 3: Accounts */}
                    <div className="pt-2 sm:pt-0 sm:px-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60">
                        ACCOUNTS
                      </span>
                      <span className="block text-xs font-bold text-white mt-0.5">
                        {accountLOB}
                      </span>
                    </div>

                    {/* Col 4: Primary Task */}
                    <div className="pt-2 sm:pt-0 sm:pl-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/60">
                        PRIMARY TASK
                      </span>
                      <span className="block text-xs font-bold text-white mt-0.5 truncate">
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
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>First Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={firstName}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Middle Name</span>
              </label>
              <input
                type="text"
                readOnly
                value="—"
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={lastName || 'Reguero'}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Suffix Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Suffix Name</span>
              </label>
              <input
                type="text"
                readOnly
                value="N/A"
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Employee Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Employee Number</span>
              </label>
              <input
                type="text"
                readOnly
                value={employeeId}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Work Email</span>
              </label>
              <input
                type="text"
                readOnly
                value={emailContact}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Department / Program */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Department / Program</span>
              </label>
              <input
                type="text"
                readOnly
                value={department}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Assigned Shift */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Shift Schedule</span>
              </label>
              <input
                type="text"
                readOnly
                value={assignedShift}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Reporting Lead */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Reporting Manager / Lead</span>
              </label>
              <input
                type="text"
                readOnly
                value={directSupervisor}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

            {/* Account / Line of Business */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Account / Line of Business</span>
              </label>
              <input
                type="text"
                readOnly
                value={accountLOB}
                className="w-full py-3 px-4 rounded-xl border-none bg-[#f1f1f1] dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-default select-none pointer-events-none outline-none"
              />
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Notification Preferences (Styled Exactly as Image 2) */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Notification Header */}
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-400 font-normal">
              Manage which critical events notify you and how you receive them.
            </p>
          </div>

          {/* Card 1: Alert Triggers */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
                <span className="text-sm font-black">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Alert Triggers
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Essential operational and performance notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Row 1: Performance & KPI Alerts */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Performance & KPI Alerts
                  </span>
                  <span className="block text-xs text-slate-400 font-normal mt-0.5">
                    Notify when attrition, attendance, or reliability fall below target thresholds.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPerformanceAlerts(!performanceAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    performanceAlerts ? 'bg-[#2F6798]' : 'bg-slate-200 dark:bg-slate-700'
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
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Batch & Trainer Updates
                  </span>
                  <span className="block text-xs text-slate-400 font-normal mt-0.5">
                    Alert when new batches are assigned, trainer rosters change, or status updates occur.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchTrainerUpdates(!batchTrainerUpdates)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    batchTrainerUpdates ? 'bg-[#2F6798]' : 'bg-slate-200 dark:bg-slate-700'
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
          <div className="rounded-2xl p-6 bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Delivery Channels
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Choose where alerts are delivered.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Row 1: In-App Notifications */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                      In-App Notifications
                    </span>
                    <span className="block text-xs text-slate-400 font-normal mt-0.5">
                      Display banner badges and alerts within the application
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInAppNotifications(!inAppNotifications)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    inAppNotifications ? 'bg-[#2F6798]' : 'bg-slate-200 dark:bg-slate-700'
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
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                      Email Digest & Alerts
                    </span>
                    <span className="block text-xs text-slate-400 font-normal mt-0.5">
                      Send critical summaries directly to your registered email
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDigestAlerts(!emailDigestAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    emailDigestAlerts ? 'bg-[#2F6798]' : 'bg-slate-200 dark:bg-slate-700'
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
          <div className="rounded-2xl p-6 bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Theme Preference
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
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
                    ? 'border-2 border-[#2F6798] text-[#2F6798] bg-white dark:bg-slate-800 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
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
                    ? 'border-2 border-[#2F6798] text-[#2F6798] bg-white dark:bg-slate-800 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
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
                    ? 'border-2 border-[#2F6798] text-[#2F6798] bg-white dark:bg-slate-800 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
                }`}
              >
                <Sliders className="w-5 h-5" />
                <span className="text-xs font-bold">System</span>
              </button>
            </div>
          </div>

          {/* 2. Alarm Ringtone Card (10 Functional Sounds) */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Alarm Ringtone
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
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
                    onClick={() => setSelectedRingtone(tone.id)}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#2F6798] bg-blue-50/40 dark:bg-blue-950/30 shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio Indicator */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#2F6798] bg-[#2F6798]' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Icon Container (No Emojis) */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-400' 
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                      }`}>
                        <ToneIcon className="w-3.5 h-3.5" />
                      </div>

                      <span className={`text-xs ${
                        isSelected ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'
                      }`}>
                        {tone.name}
                      </span>
                    </div>

                    {/* Interactive Play / Stop Preview Button (Blue with white icon & text) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRingtone(tone.id);
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

      {/* Tab 4: Shift & Policies */}
      {activeTab === 'shift' && (
        <div className="rounded-2xl p-8 bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
              Shift & Adherence Policies
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Configure grace periods, break duration allowances, and time tracking targets.
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
          </div>
        </div>
      )}

    </div>
  );
}

