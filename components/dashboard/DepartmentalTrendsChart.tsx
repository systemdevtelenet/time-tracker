'use client';

import React, { useState, useMemo } from 'react';
import { Flame, CalendarCheck, BarChart3, PieChart } from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';
import { parseDurationToSeconds } from '@/lib/utils';

interface DepartmentalTrendsChartProps {
  records?: PhoneTimeRecord[];
}

export default function DepartmentalTrendsChart({ records = [] }: DepartmentalTrendsChartProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'status'>('weekly');

  // Compute actual attendance status breakdown from database records
  const { presentCount, lateCount, absentCount, undertimeCount, presentPct, latePct, absentPct, undertimePct, punctualityRate } = useMemo(() => {
    const totalLogs = records.length;
    let late = 0;
    let undertime = 0;

    records.forEach((r) => {
      const text = `${r.tagging || ''} ${r.summary || ''}`.toLowerCase();
      const secs = parseDurationToSeconds(r.total_minutes);

      if (text.includes('late') || text.includes('tardy') || text.includes('delay')) {
        late += 1;
      }
      if ((secs > 0 && secs < 28800) || text.includes('undertime') || text.includes('early out')) {
        undertime += 1;
      }
    });

    const present = Math.max(0, totalLogs - late);
    const activeStaffCount = new Set(records.map(r => r.name?.trim()).filter(Boolean)).size;
    const absent = Math.max(0, 13 - activeStaffCount);
    const baseTotal = (present + absent + late + undertime) || 13;

    const rate = (present + late) > 0 ? Math.round((present / (present + late)) * 100) : (totalLogs > 0 ? 100 : 0);

    return {
      presentCount: present,
      lateCount: late,
      absentCount: absent,
      undertimeCount: undertime,
      presentPct: Math.round((present / baseTotal) * 100),
      latePct: Math.round((late / baseTotal) * 100),
      absentPct: Math.round((absent / baseTotal) * 100),
      undertimePct: Math.round((undertime / baseTotal) * 100),
      punctualityRate: rate,
    };
  }, [records]);

  // Weekly attendance data (Mon - Sun) derived from real shift dates
  const weeklyTrends = useMemo(() => {
    const dayDefs = [
      { key: 1, day: 'Mon', full: 'Monday' },
      { key: 2, day: 'Tue', full: 'Tuesday' },
      { key: 3, day: 'Wed', full: 'Wednesday' },
      { key: 4, day: 'Thu', full: 'Thursday' },
      { key: 5, day: 'Fri', full: 'Friday' },
      { key: 6, day: 'Sat', full: 'Saturday' },
      { key: 0, day: 'Sun', full: 'Sunday' },
    ];

    const buckets: Record<number, { shifts: number; late: number }> = {
      0: { shifts: 0, late: 0 },
      1: { shifts: 0, late: 0 },
      2: { shifts: 0, late: 0 },
      3: { shifts: 0, late: 0 },
      4: { shifts: 0, late: 0 },
      5: { shifts: 0, late: 0 },
      6: { shifts: 0, late: 0 },
    };

    records.forEach((r) => {
      const dateStr = r.date_of_shift || r.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const dayIdx = d.getDay();
          buckets[dayIdx].shifts += 1;
          const text = `${r.tagging || ''} ${r.summary || ''}`.toLowerCase();
          if (text.includes('late') || text.includes('tardy') || text.includes('delay')) {
            buckets[dayIdx].late += 1;
          }
        }
      }
    });

    const totalLogs = records.length;

    return dayDefs.map((def) => {
      const b = buckets[def.key];
      let rate = 100;
      const shifts = b.shifts;

      if (totalLogs > 0 && shifts > 0) {
        const onTime = Math.max(0, shifts - b.late);
        rate = Math.round((onTime / shifts) * 100);
      } else if (totalLogs === 0) {
        rate = 0;
      }

      return {
        day: def.day,
        full: def.full,
        rate,
        shifts,
      };
    });
  }, [records]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[350px]">
      
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#24537D]/10 text-[#24537D] dark:bg-blue-950/60 dark:text-blue-400">
              {viewMode === 'weekly' ? <Flame className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                {viewMode === 'weekly' ? 'Weekly Attendance & Punctuality Trend' : 'Attendance Status Breakdown'}
              </h3>
              <span className="text-[10.5px] text-slate-400 block font-medium">
                {viewMode === 'weekly' ? 'Daily shift capacity & on-time compliance rate' : 'Workforce shift distribution by status'}
              </span>
            </div>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-[#24537D] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Weekly</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('status')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'status'
                  ? 'bg-white dark:bg-slate-700 text-[#24537D] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Status</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: WEEKLY BAR CHART (MATCHING ANALYTICS VIEW) */}
        {viewMode === 'weekly' && (
          <div className="mt-4 pt-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10.5px] font-bold text-slate-400">Weekly Consistency</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> &ge;95% Target
              </span>
            </div>

            <div className="h-44 w-full flex items-end justify-between gap-2 px-1 relative mt-3">
              
              {/* 95% Benchmark Target Line */}
              <div 
                className="absolute left-0 right-0 border-b border-dashed border-emerald-400/60 dark:border-emerald-500/40 pointer-events-none z-10"
                style={{ bottom: '70%' }}
              >
                <span className="absolute -top-3.5 right-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  Target 95%
                </span>
              </div>

              {weeklyTrends.map((d, idx) => {
                const maxShifts = 15;
                const barHeightPct = Math.round((d.shifts / maxShifts) * 100);
                const isHighPunctual = d.rate >= 95;
                const isMinorDrop = d.rate < 92;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                    
                    {/* Punctuality Percentage Pill on Top */}
                    <span className={`text-[10px] font-black mb-1 transition-transform group-hover:scale-110 ${
                      isHighPunctual ? 'text-emerald-600 dark:text-emerald-400' : isMinorDrop ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {d.rate}%
                    </span>

                    {/* Column Bar with SOLID FLAT COLORS */}
                    <div className="w-full max-w-[34px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden relative flex flex-col justify-end h-28">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${
                          isHighPunctual 
                            ? 'bg-emerald-500' 
                            : isMinorDrop
                            ? 'bg-amber-500'
                            : 'bg-[#24537D] dark:bg-blue-600'
                        }`}
                        style={{ height: `${barHeightPct}%` }}
                      />
                    </div>

                    {/* Day Label */}
                    <span className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 uppercase mt-2">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: ATTENDANCE DONUT GRAPH */}
        {viewMode === 'status' && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
            {/* SVG Donut Visual */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center relative py-2">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="11"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {(() => {
                    const total = (presentCount + lateCount + undertimeCount + absentCount) || 1;
                    const circumference = 2 * Math.PI * 38;
                    const presentDash = (presentCount / total) * circumference;
                    const lateDash = (lateCount / total) * circumference;
                    const undertimeDash = (undertimeCount / total) * circumference;
                    const absentDash = (absentCount / total) * circumference;

                    let offset = 0;
                    const s1 = offset; offset -= presentDash;
                    const s2 = offset; offset -= lateDash;
                    const s3 = offset; offset -= undertimeDash;
                    const s4 = offset;

                    return (
                      <>
                        <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="11" fill="transparent" strokeDasharray={`${presentDash} ${circumference}`} strokeDashoffset={s1} />
                        <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="11" fill="transparent" strokeDasharray={`${lateDash} ${circumference}`} strokeDashoffset={s2} />
                        <circle cx="50" cy="50" r="38" stroke="#6366F1" strokeWidth="11" fill="transparent" strokeDasharray={`${undertimeDash} ${circumference}`} strokeDashoffset={s3} />
                        <circle cx="50" cy="50" r="38" stroke="#F43F5E" strokeWidth="11" fill="transparent" strokeDasharray={`${absentDash} ${circumference}`} strokeDashoffset={s4} />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {punctualityRate}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    PRESENT
                  </span>
                </div>
              </div>
            </div>

            {/* Status Breakdown Legend */}
            <div className="sm:col-span-7 space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Present</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[11px]">{presentCount} ({presentPct}%)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F43F5E] shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Absent</span>
                </div>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-[11px]">{absentCount} ({absentPct}%)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Late</span>
                </div>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-[11px]">{lateCount} ({latePct}%)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6366F1] shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Undertime</span>
                </div>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-[11px]">{undertimeCount} ({undertimePct}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

