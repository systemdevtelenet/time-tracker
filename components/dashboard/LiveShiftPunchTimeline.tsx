'use client';

import React, { useState } from 'react';
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
  Send
} from 'lucide-react';

interface ShiftMilestone {
  id: string;
  type: 'punch_in' | 'break_1' | 'lunch' | 'break_2' | 'punch_out';
  label: string;
  timeRange: string;
  duration?: string;
  status: 'completed' | 'active' | 'upcoming';
  icon: typeof LogIn;
  color: string;
  notes?: string;
}

interface PunchHistoryEntry {
  id: string;
  action: string;
  time: string;
  duration: string;
  category: string;
  verifiedBy: string;
}

export default function LiveShiftPunchTimeline() {
  const [shiftNotes, setShiftNotes] = useState(
    "Covered for Neil's lunch session. Completed Batch #12 quality calibration with 98.4% team adherence. All training logs synced."
  );
  const [isSavedToast, setIsSavedToast] = useState(false);

  const milestones: ShiftMilestone[] = [
    {
      id: 'm1',
      type: 'punch_in',
      label: 'Shift Start (Punch In)',
      timeRange: '9:00:00 PM',
      duration: 'On Time',
      status: 'completed',
      icon: LogIn,
      color: 'bg-emerald-500 text-white',
    },
    {
      id: 'm2',
      type: 'break_1',
      label: '1st Paid Break (15m)',
      timeRange: '11:30 PM – 11:45 PM',
      duration: '15 mins',
      status: 'completed',
      icon: Coffee,
      color: 'bg-amber-500 text-white',
    },
    {
      id: 'm3',
      type: 'lunch',
      label: 'Meal / Lunch (1h)',
      timeRange: '1:57:09 AM – In Progress',
      duration: '1h 13m 50s elapsed',
      status: 'active',
      icon: Utensils,
      color: 'bg-[#C8A54B] text-slate-950 ring-4 ring-[#C8A54B]/30 animate-pulse',
    },
    {
      id: 'm4',
      type: 'break_2',
      label: '2nd Paid Break (15m)',
      timeRange: 'Scheduled ~4:00 AM',
      duration: '15 mins expected',
      status: 'upcoming',
      icon: Coffee,
      color: 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    },
    {
      id: 'm5',
      type: 'punch_out',
      label: 'Shift End (Punch Out)',
      timeRange: 'Scheduled ~6:00 AM',
      duration: '9.0 hrs total shift',
      status: 'upcoming',
      icon: LogOut,
      color: 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    },
  ];

  const punchHistory: PunchHistoryEntry[] = [
    {
      id: 'p1',
      action: 'Meal / Lunch (Punch Out)',
      time: '1:57:09 AM',
      duration: 'In Progress',
      category: 'Unpaid Meal Break',
      verifiedBy: 'System GeoSync',
    },
    {
      id: 'p2',
      action: '1st Break (Punch In - Returned)',
      time: '11:45:10 PM',
      duration: '15m 10s',
      category: 'Paid 1st Rest Period',
      verifiedBy: 'Corporate Terminal',
    },
    {
      id: 'p3',
      action: '1st Break (Punch Out)',
      time: '11:30:00 PM',
      duration: 'Started',
      category: 'Paid 1st Rest Period',
      verifiedBy: 'Corporate Terminal',
    },
    {
      id: 'p4',
      action: 'Shift Start (Punch In)',
      time: '9:00:00 PM',
      duration: '9h 00m Scheduled',
      category: 'Regular Work Hours',
      verifiedBy: 'Biometric / Portal',
    },
  ];

  const handleSaveNotes = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* 1. Milestone Timeline Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Today&apos;s Shift Activity &amp; Punch Audit Trail
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300">
                Live Timeline
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time audit log of shift punch milestones, break durations, and shift completion tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Shift: 9:00 PM – 6:00 AM
            </span>
          </div>
        </div>

        {/* 2. Visual Milestones Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            const isActive = m.status === 'active';
            const isCompleted = m.status === 'completed';

            return (
              <div 
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive 
                    ? 'bg-[#153B5E] text-white border-[#C8A54B]/50 shadow-md ring-2 ring-[#C8A54B]/30'
                    : isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/50 opacity-65 text-slate-500'
                }`}
              >
                {/* Milestone Top Row: Icon + Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-[#C8A54B] text-slate-950'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isActive ? '● IN PROGRESS' : isCompleted ? '✓ DONE' : 'SCHEDULED'}
                  </span>
                </div>

                {/* Label & Timestamps */}
                <div>
                  <h4 className={`text-xs font-black leading-snug ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                    {m.label}
                  </h4>
                  <p className={`text-[11px] font-mono mt-1 ${isActive ? 'text-[#E5CA80] font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {m.timeRange}
                  </p>
                  {m.duration && (
                    <span className={`text-[10px] font-semibold block mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                      {m.duration}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* 3. 2-Column Split: Detailed Punch Log Feed (Left) & Shift Handover Notes (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          
          {/* Left: Punch Audit Log Table (Cols 7) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2F6798]" />
                <span>Today&apos;s Punch History Log</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                4 Punches Recorded
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
                  {punchHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.action.includes('In Progress') || p.action.includes('Lunch') 
                            ? 'bg-[#C8A54B]' 
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Shift Handover & Incident Notes (Cols 5) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2F6798]" />
                  <span>Supervisor Shift &amp; Handover Notes</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                  Auto-synced
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Document training milestones, coverage remarks, or handover notes for the incoming shift lead.
              </p>
            </div>

            {/* Note Textarea */}
            <div className="relative">
              <textarea
                rows={4}
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="Type shift notes or handover comments..."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30 resize-none font-medium leading-relaxed"
              />
            </div>

            {/* Save Action Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isSavedToast ? '✓ Shift notes saved to portal record' : '• Ready to sync'}
              </span>

              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] active:bg-[#1c4366] text-white text-xs font-black shadow-sm shadow-[#2F6798]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
