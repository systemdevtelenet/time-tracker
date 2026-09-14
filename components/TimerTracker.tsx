'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Tag as TagIcon, 
  FileText, 
  Ticket, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Timer,
  Save,
  Clock
} from 'lucide-react';
import { AccountOption, EmployeeOption, PhoneTimeRecord } from '@/lib/types';
import { formatSecondsToTrackerText, formatStopwatchTime, getTodayFormatted } from '@/lib/utils';

interface TimerTrackerProps {
  currentAgent: string;
  accounts: AccountOption[];
  onRecordSaved: (record: PhoneTimeRecord) => void;
  onTimerStateChange: (isRunning: boolean, currentSeconds: number) => void;
}

const COMMON_TAGS = [
  'HOLD',
  'Best plan',
  'Requested Info',
  'Past Due',
  'Billing Issue',
  'Technical Support',
  'Escalation',
  'Follow-up',
  'General Inquiry',
];

export default function TimerTracker({
  currentAgent,
  accounts,
  onRecordSaved,
  onTimerStateChange,
}: TimerTrackerProps) {
  // Timer State
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [dateOfShift, setDateOfShift] = useState<string>(getTodayFormatted());
  const [agentName, setAgentName] = useState<string>(currentAgent);
  const [account, setAccount] = useState<string>('DFT');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['HOLD']);
  const [customTag, setCustomTag] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  
  // UI Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  // Sync agentName if prop changes
  useEffect(() => {
    if (currentAgent) {
      setAgentName(currentAgent);
    }
  }, [currentAgent]);

  // Handle Timer ticking
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          onTimerStateChange(true, next);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      onTimerStateChange(false, seconds);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onTimerStateChange, seconds]);

  // Set default account when accounts prop is loaded
  useEffect(() => {
    if (accounts && accounts.length > 0 && !accounts.some((a) => a.account_code === account)) {
      setAccount(accounts[0].account_code);
    }
  }, [accounts, account]);

  const handleStart = () => {
    if (!ticketNumber) {
      const randTicket = Math.random().toString(16).substring(2, 10);
      setTicketNumber(randTicket);
    }
    setIsRunning(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setTicketNumber('');
    setSummary('');
    setSelectedTags(['HOLD']);
    setErrorMsg(null);
    setSuccessMsg(null);
    onTimerStateChange(false, 0);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      const trimmed = customTag.trim();
      if (!selectedTags.includes(trimmed)) {
        setSelectedTags((prev) => [...prev, trimmed]);
      }
      setCustomTag('');
    }
  };

  const generateTicket = () => {
    const randTicket = Math.random().toString(16).substring(2, 10);
    setTicketNumber(randTicket);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (seconds === 0) {
      setErrorMsg('Timer has not elapsed. Please track duration before saving.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formattedDuration = formatSecondsToTrackerText(seconds);
    const taggingStr = selectedTags.join(', ');

    const newRecordPayload: PhoneTimeRecord = {
      date_of_shift: dateOfShift,
      name: agentName.trim(),
      account: account.trim(),
      total_minutes: formattedDuration,
      ticket_number: ticketNumber.trim() || Math.random().toString(16).substring(2, 10),
      tagging: taggingStr,
      summary: summary.trim(),
    };

    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordPayload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save phone time record.');
      }

      onRecordSaved(json.data || newRecordPayload);
      setSuccessMsg(`Call log #${newRecordPayload.ticket_number} saved successfully!`);
      
      // Reset timer & form for next call
      setIsRunning(false);
      setSeconds(0);
      setTicketNumber('');
      setSummary('');
      setSelectedTags(['HOLD']);
      onTimerStateChange(false, 0);
    } catch (err: any) {
      console.error('Error saving record:', err);
      setErrorMsg(err.message || 'Error occurred while saving to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#101D3D] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-7 mb-6">
      
      {/* Background Watermark Image from Supabase */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-20 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("${heroImageUrl}")`,
        }}
      />

      {/* Content Form */}
      <form onSubmit={handleSaveEntry} className="relative z-10 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <Timer className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Live Call & Shift Timer Tracker
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Record active phone duration, select inquiry tagging, and log customer resolution summary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isRunning 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' 
                : seconds > 0 
                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : seconds > 0 ? 'bg-amber-500' : 'bg-slate-400'}`} />
              <span>{isRunning ? 'Timer Active' : seconds > 0 ? 'Timer Paused' : 'Ready'}</span>
            </span>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Stopwatch & Action Controls Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900/60 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Large Digital Stopwatch Display */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1">
              CALL DURATION (MM:SS)
            </span>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-50 drop-shadow-xs">
              <span className={isRunning ? 'text-[#2F6798] dark:text-blue-400' : seconds > 0 ? 'text-[#C8A54B]' : 'text-slate-800 dark:text-slate-200'}>
                {formatStopwatchTime(seconds)}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Equivalent: <b className="text-slate-700 dark:text-slate-300">{formatSecondsToTrackerText(seconds)}</b>
            </span>
          </div>

          {/* Stopwatch Buttons (#2F6798 & #C8A54B) */}
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-3.5 rounded-2xl bg-[#2F6798] hover:bg-[#235179] text-white font-extrabold text-sm shadow-md shadow-[#2F6798]/25 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{seconds > 0 ? 'Resume Timer' : 'Start Call Timer'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="px-6 py-3.5 rounded-2xl bg-[#C8A54B] hover:bg-[#b0903f] text-slate-900 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-slate-900" />
                <span>Pause Timer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={seconds === 0 && !isRunning}
              className="px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Reset timer and fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Date of Shift */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>Date of Shift</span>
            </label>
            <input
              type="text"
              required
              value={dateOfShift}
              onChange={(e) => setDateOfShift(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/30 outline-none"
            />
          </div>

          {/* Agent Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>Agent Name</span>
            </label>
            <input
              type="text"
              required
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/30 outline-none"
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>Account</span>
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/30 outline-none cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_code}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#2F6798]" />
                <span>Ticket Number</span>
              </span>
              <button
                type="button"
                onClick={generateTicket}
                className="text-[10px] font-bold text-[#2F6798] hover:underline"
              >
                Auto-generate
              </button>
            </label>
            <input
              type="text"
              required
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="e.g. f7efd2dd"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/30 outline-none"
            />
          </div>

        </div>

        {/* Tags Selection Section */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <TagIcon className="w-3.5 h-3.5 text-[#2F6798]" />
            <span>Call Categories / Tagging</span>
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2F6798] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && <span className="mr-1.5">✓</span>}
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type custom tag & press Enter..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#2F6798]/30 outline-none"
            />
          </div>
        </div>

        {/* Summary Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#2F6798]" />
            <span>Call Summary / Notes</span>
          </label>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Document interaction highlights, customer inquiry resolution, plan details, or next steps..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#2F6798]/30 outline-none resize-none"
          />
        </div>

        {/* Bottom Save Action Button */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting || seconds === 0}
            className="px-6 py-3 rounded-xl bg-[#2F6798] hover:bg-[#235179] active:bg-[#1c4366] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2F6798]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Call Record...' : 'Save Time Entry to Database'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
