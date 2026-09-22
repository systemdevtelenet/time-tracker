'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Utensils, 
  Coffee, 
  LogOut, 
  LogIn, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Download,
  ShieldCheck,
  Send,
  LucideIcon
} from 'lucide-react';
import { ShiftMilestoneItem, PunchAuditEntry, computeShiftMilestonesAndAudit } from '@/lib/punchLogs';

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
  const [milestones, setMilestones] = useState<ShiftMilestoneItem[]>(() => {
    return computeShiftMilestonesAndAudit(supervisorId).milestones;
  });
  const [auditHistory, setAuditHistory] = useState<PunchAuditEntry[]>(() => {
    return computeShiftMilestonesAndAudit(supervisorId).auditHistory;
  });
  const [isLoadingPunches, setIsLoadingPunches] = useState(false);

  // Fetch live punch milestones and audit trail
  const fetchShiftPunches = useCallback(async () => {
    try {
      const res = await fetch(`/api/punch-logs?empId=${supervisorId}`);
      const data = await res.json();
      if (data.milestones && data.milestones.length > 0) {
        setMilestones(data.milestones);
      }
      if (data.auditHistory && data.auditHistory.length > 0) {
        setAuditHistory(data.auditHistory);
      }
    } catch (err) {
      console.error('Error loading punch milestones:', err);
    } finally {
      setIsLoadingPunches(false);
    }
  }, [supervisorId]);

  useEffect(() => {
    fetchShiftPunches();
  }, [fetchShiftPunches]);

  // Listen for global punch updates
  useEffect(() => {
    const handlePunchUpdate = () => {
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

  return (
    <div className={`space-y-4 animate-in fade-in ${
      embedded ? '' : 'p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-2xs'
    }`}>
      
      {/* 1. Milestone Timeline Header Card */}
      <div className="space-y-4">
        
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#434142]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F8F8F6] tracking-tight">
                Today&apos;s Shift Activity &amp; Punch Audit Trail
              </h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#2F6798]/15 text-[#2F6798] dark:bg-[#3678B0]/30 dark:text-blue-200 border border-[#2F6798]/30 dark:border-[#3678B0]/40 shadow-2xs">
                Live Timeline
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time audit log of shift punch milestones, break durations, and shift completion tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#272626] text-xs font-bold text-slate-700 dark:text-[#F8F8F6] border border-slate-200 dark:border-[#434142] font-mono">
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
                      ? 'bg-slate-50/70 dark:bg-[#272626] border-slate-200/80 dark:border-[#434142] text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50/40 dark:bg-[#272626]/50 border-slate-200/50 dark:border-[#434142]/50 opacity-70 text-slate-500'
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
                        : 'bg-slate-200 dark:bg-[#1D2433] text-slate-500 dark:text-slate-400'
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

        {/* 3. Full-Width Punch Audit Log Table */}
        <div className="pt-2">
          <div className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-[#272626] border border-slate-200/80 dark:border-[#434142] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2F6798] dark:text-[#3678B0]" />
                <span>Today&apos;s Punch History Log</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                {auditHistory.length} Punches Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#434142] text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Punch Action</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#434142] font-medium text-slate-700 dark:text-slate-300">
                  {auditHistory.length > 0 ? (
                    auditHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-white/80 dark:hover:bg-[#363435] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-[#F8F8F6] flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.action.includes('In Progress') || p.action.includes('Lunch') || p.action.includes('Break')
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`} />
                          <span>{p.action}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2F6798] dark:text-[#3678B0]">
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
        </div>

      </div>

    </div>
  );
}
