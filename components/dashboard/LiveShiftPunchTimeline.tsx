'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Utensils, 
  Coffee, 
  LogOut, 
  LogIn, 
  FileText, 
  Save, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Download,
  ShieldCheck,
  Send,
  LucideIcon
} from 'lucide-react';
import { ShiftMilestoneItem, PunchAuditEntry } from '@/lib/punchLogs';

interface LiveShiftPunchTimelineProps {
  embedded?: boolean;
  supervisorId?: string;
  shiftSchedule?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LogIn,
  Coffee,
  Utensils,
  LogOut,
};

export default function LiveShiftPunchTimeline({ 
  embedded = false,
  supervisorId = '1597',
  shiftSchedule = '9:00 PM – 6:00 AM'
}: LiveShiftPunchTimelineProps) {
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [milestones, setMilestones] = useState<ShiftMilestoneItem[]>([]);
  const [auditHistory, setAuditHistory] = useState<PunchAuditEntry[]>([]);
  const [isLoadingPunches, setIsLoadingPunches] = useState(true);

  // Fetch live punch milestones and audit trail
  const fetchShiftPunches = useCallback(async () => {
    try {
      setIsLoadingPunches(true);
      const res = await fetch(`/api/punch-logs?empId=${supervisorId}`);
      const data = await res.json();
      if (data.milestones) {
        setMilestones(data.milestones);
      }
      if (data.auditHistory) {
        setAuditHistory(data.auditHistory);
      }
    } catch (err) {
      console.error('Error loading punch milestones:', err);
    } finally {
      setIsLoadingPunches(false);
    }
  }, [supervisorId]);

  // Fetch shift handover notes
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoadingNotes(true);
      const res = await fetch(`/api/shift-notes?empId=${supervisorId}`);
      const data = await res.json();
      if (data.note !== undefined) {
        setShiftNotes(data.note);
      }
    } catch (err) {
      console.error('Error loading shift notes:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [supervisorId]);

  useEffect(() => {
    fetchShiftPunches();
    fetchNotes();
  }, [fetchShiftPunches, fetchNotes]);

  // Listen for global punch updates
  useEffect(() => {
    const handlePunchUpdate = (e: any) => {
      fetchShiftPunches();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('punch-updated', handlePunchUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('punch-updated', handlePunchUpdate);
      }
    };
  }, [fetchShiftPunches]);

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await fetch('/api/shift-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: supervisorId,
          note: shiftNotes,
        }),
      });
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    } catch (err) {
      console.error('Error saving shift notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${
      embedded ? '' : 'p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-2xs'
    }`}>
      
      {/* 1. Milestone Timeline Header Card */}
      <div className="space-y-4">
        
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Today&apos;s Shift Activity &amp; Punch Audit Trail
              </h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#2F6798]/15 text-[#2F6798] dark:bg-[#2F6798]/30 dark:text-blue-200 border border-[#2F6798]/30 shadow-2xs">
                Live Timeline
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time audit log of shift punch milestones, break durations, and shift completion tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              Shift: {shiftSchedule}
            </span>
          </div>
        </div>

        {/* 2. Visual Milestones Step Flow (Live Calculated from Database) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {milestones.length > 0 ? (
            milestones.map((m) => {
              const Icon = ICON_MAP[m.iconName] || Clock;
              const isActive = m.status === 'active';
              const isCompleted = m.status === 'completed';

              return (
                <div 
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive 
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-700/60 shadow-xs ring-2 ring-amber-400/20 text-slate-900 dark:text-slate-100'
                      : isCompleted
                      ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/50 opacity-70 text-slate-500'
                  }`}
                >
                  {/* Milestone Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isActive ? '● IN PROGRESS' : isCompleted ? '✓ DONE' : 'SCHEDULED'}
                    </span>
                  </div>

                  {/* Label & Timestamps */}
                  <div>
                    <h4 className="text-xs font-black leading-snug text-slate-900 dark:text-slate-100">
                      {m.label}
                    </h4>
                    <p className={`text-[11px] font-mono mt-1 ${isActive ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {m.timeRange}
                    </p>
                    {m.duration && (
                      <span className={`text-[10px] font-semibold block mt-0.5 ${isActive ? 'text-amber-800/80 dark:text-amber-300/80' : 'text-slate-400'}`}>
                        {m.duration}
                      </span>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-5 p-4 text-center text-xs text-slate-400">
              Loading live shift milestones...
            </div>
          )}
        </div>

        {/* 3. 2-Column Split: Detailed Punch Log Feed (Left) & Shift Handover Notes (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          
          {/* Left: Punch Audit Log Table (Cols 7) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2F6798]" />
                <span>Today&apos;s Punch History Log</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                {auditHistory.length} Punches Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-3">Punch Action</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                  {auditHistory.length > 0 ? (
                    auditHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.action.includes('In Progress') || p.action.includes('Lunch') || p.action.includes('Break')
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`} />
                          <span>{p.action}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2F6798] dark:text-blue-300">
                          {p.time}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                          {p.category}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[10px] font-semibold text-slate-400">
                          {p.verifiedBy}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-xs text-slate-400">
                        No punch logs recorded for today yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Shift Handover & Incident Notes (Cols 5 - Styled in Solid Theme Blue #2F6798) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#2F6798] dark:bg-[#1C4263] border border-[#24527A] dark:border-blue-900/60 text-white flex flex-col justify-between space-y-3 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>Supervisor Shift &amp; Handover Notes</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30 tracking-wide">
                  Auto-synced
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-relaxed">
                Document training milestones, coverage remarks, or handover notes for the incoming shift lead.
              </p>
            </div>

            {/* Note Textarea */}
            <div className="relative">
              <textarea
                rows={3}
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="Type shift notes or handover comments..."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-white/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none font-medium leading-relaxed shadow-inner"
              />
            </div>

            {/* Status Pills, Character Counter & Save Action Button */}
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {isSavedToast ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-[10px] font-bold text-white flex items-center gap-1">
                    ✓ Shift notes saved
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ready to sync
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-bold text-white font-mono">
                  {shiftNotes.length} chars
                </span>
              </div>

              {/* Blue Save Note Button */}
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-[#24527A] hover:bg-[#1D4468] active:bg-[#163552] text-white text-xs font-black shadow-md border border-white/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Note'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
