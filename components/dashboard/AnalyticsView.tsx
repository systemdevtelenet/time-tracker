'use client';

import React, { useMemo, useState } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Award,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PhoneTimeRecord, EmployeeOption, AccountOption, KpiSummaryStats } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';
import MemberAttendanceRosterTable from './MemberAttendanceRosterTable';

interface AnalyticsViewProps {
  records?: PhoneTimeRecord[];
  employees?: EmployeeOption[];
  accounts?: AccountOption[];
  kpiStats?: KpiSummaryStats;
}

export default function AnalyticsView({
  records = [],
  employees = [],
  accounts = [],
}: AnalyticsViewProps) {
  const totalRosterCount = employees.length;

  // 1. Core Total Durations and Calculations
  const { totalSeconds, regularSeconds, overtimeSeconds } = useMemo(() => {
    let totalSecs = 0;
    let otSecs = 0;

    records.forEach((r) => {
      const secs = parseDurationToSeconds(r.total_minutes);
      totalSecs += secs;
      // If a single shift or entry exceeds 8 hours (28,800 secs), excess is Overtime
      if (secs > 28800) {
        otSecs += (secs - 28800);
      }
    });

    const regSecs = Math.max(0, totalSecs - otSecs);
    return {
      totalSeconds: totalSecs,
      regularSeconds: regSecs,
      overtimeSeconds: otSecs,
    };
  }, [records]);

  // Unique active agents with records
  const uniqueAgentsInRecords = useMemo(() => {
    const set = new Set(records.map((r) => r.name?.trim()).filter(Boolean));
    return Array.from(set);
  }, [records]);

  const activeContributorsCount = uniqueAgentsInRecords.length;

  // 2. Attendance Status Classification (Present, Absent, Late, Undertime)
  const attendanceBreakdown = useMemo(() => {
    const totalLogs = records.length;
    let lateCount = 0;
    let undertimeCount = 0;
    let manualEditCount = 0;

    records.forEach((r) => {
      const text = `${r.tagging || ''} ${r.summary || ''}`.toLowerCase();
      const secs = parseDurationToSeconds(r.total_minutes);
      
      const isLate = text.includes('late') || text.includes('tardy') || text.includes('delay');
      const isUndertime = (secs > 0 && secs < 28800) || text.includes('undertime') || text.includes('early out');

      if (isLate) {
        lateCount += 1;
      }
      if (isUndertime) {
        undertimeCount += 1;
      }
      if (text.includes('manual') || text.includes('adjust') || text.includes('edited')) {
        manualEditCount += 1;
      }
    });

    const presentCount = Math.max(0, totalLogs - lateCount);
    const absentCount = Math.max(0, totalRosterCount - activeContributorsCount);

    const baseTotal = (presentCount + absentCount + lateCount + undertimeCount) || (totalRosterCount || 1);

    return {
      presentCount,
      presentPct: Math.round((presentCount / baseTotal) * 100),
      absentCount,
      absentPct: Math.round((absentCount / baseTotal) * 100),
      lateCount,
      latePct: Math.round((lateCount / baseTotal) * 100),
      undertimeCount,
      undertimePct: Math.round((undertimeCount / baseTotal) * 100),
      manualEditCount,
    };
  }, [records, totalRosterCount, activeContributorsCount]);

  // 3. Punctuality & Adherence Key Ratios
  const adherenceRate = useMemo(() => {
    if (totalRosterCount === 0) return 100;
    const baseExpectedSeconds = activeContributorsCount * 8 * 3600;
    if (baseExpectedSeconds === 0) return records.length > 0 ? 100 : 0;
    return Math.min(100, Math.round((totalSeconds / baseExpectedSeconds) * 100));
  }, [totalSeconds, activeContributorsCount, totalRosterCount, records.length]);

  const punctualityRate = useMemo(() => {
    const totalShifts = attendanceBreakdown.presentCount + attendanceBreakdown.lateCount;
    if (totalShifts === 0) return records.length > 0 ? 100 : 0;
    return Math.round((attendanceBreakdown.presentCount / totalShifts) * 100);
  }, [attendanceBreakdown, records.length]);

  // Lost Time / Shrinkage Estimate based on actual tardiness and unworked roster members
  const shrinkageHours = useMemo(() => {
    const tardyLostHours = (attendanceBreakdown.lateCount * 0.25);
    const absentLostHours = (attendanceBreakdown.absentCount * 8);
    const totalLost = tardyLostHours + absentLostHours;
    return totalLost.toFixed(1);
  }, [attendanceBreakdown]);

  // 4. Weekly Attendance Trends (Mon - Sun) derived from real shift dates
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

      let trend = 'Optimal Attendance';
      if (rate >= 95) trend = 'Target Achieved (≥95%)';
      else if (rate >= 90) trend = 'Good Compliance';
      else if (shifts > 0) trend = 'Attention Required (<90%)';
      else trend = 'No Shifts Logged';

      return {
        day: def.day,
        full: def.full,
        rate,
        shifts,
        late: b.late,
        trend,
      };
    });
  }, [records]);

  const kpiCards = [
    {
      label: 'PUNCTUALITY / ON-TIME RATE',
      value: `${punctualityRate}%`,
      detail: `${attendanceBreakdown.lateCount} late clock-in${attendanceBreakdown.lateCount === 1 ? '' : 's'} recorded`,
      icon: CheckCircle2,
      valueColor: 'text-emerald-600 dark:text-emerald-300',
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/55 dark:border-emerald-800/70',
    },
    {
      label: 'TOTAL LOGGED WORK TIME',
      value: formatTotalDurationHuman(totalSeconds),
      detail: `${records.length} verified shift log${records.length === 1 ? '' : 's'}`,
      icon: Clock,
      valueColor: 'text-[#24537D] dark:text-blue-300',
      iconColor: 'text-[#24537D] bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-950/55 dark:border-blue-800/70',
    },
    {
      label: 'LATE PUNCHES',
      value: `${attendanceBreakdown.lateCount} Logs`,
      detail: attendanceBreakdown.lateCount === 0 ? 'No late punches recorded' : `${attendanceBreakdown.latePct}% of total shifts`,
      icon: AlertTriangle,
      valueColor: 'text-amber-600 dark:text-amber-300',
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-950/55 dark:border-amber-800/70',
    },
    {
      label: 'ACTIVE CONTRIBUTORS',
      value: `${activeContributorsCount} Active`,
      detail: `${activeContributorsCount} of ${totalRosterCount} roster members logged`,
      icon: Users,
      valueColor: 'text-indigo-600 dark:text-indigo-300',
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/55 dark:border-indigo-800/70',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      
      {/* Top Header without Live Tracker pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Attendance &amp; Schedule Adherence Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Real-time punctuality rates, total logged hours, late punch tracking, and shift audit summaries.
          </p>
        </div>
      </div>

      {/* 1. TOP 4 ATTENDANCE & ADHERENCE KPI CARDS */}
      <div id="analytics-overview" className="scroll-mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {kpiCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="relative isolate overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs flex items-center justify-between gap-2 min-h-[82px] sm:min-h-[86px]">
              <div className="absolute inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-20 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")' }} />
              <div className="relative flex min-w-0 flex-col justify-center">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">{item.label}</span>
                <span className={`mt-0.5 text-xl sm:text-2xl font-bold tracking-tight ${item.valueColor}`}>{item.value}</span>
                <span className="mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">{item.detail}</span>
              </div>
              <div className={`relative w-8.5 h-8.5 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${item.iconColor}`}>
                <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. ATTENDANCE STATUS BREAKDOWN & WEEKLY HEATMAP (GRAPH STYLE - SOLID COLORS) */}
      <div id="analytics-breakdown" className="scroll-mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Attendance Status Donut Graph */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Attendance Status Breakdown
                  </h3>
                  <span className="text-[10.5px] text-slate-400 block font-medium">
                    Proportional workforce distribution by shift status
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#24537D] dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                {totalRosterCount} Total Roster
              </span>
            </div>

            {/* Donut Chart and Legend Row */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* SVG Donut Visual */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center relative py-2">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="11"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    
                    {/* Donut Segments */}
                    {(() => {
                      const total = (attendanceBreakdown.presentCount + attendanceBreakdown.lateCount + attendanceBreakdown.undertimeCount + attendanceBreakdown.absentCount) || 1;
                      const circumference = 2 * Math.PI * 38;
                      
                      const presentDash = (attendanceBreakdown.presentCount / total) * circumference;
                      const lateDash = (attendanceBreakdown.lateCount / total) * circumference;
                      const undertimeDash = (attendanceBreakdown.undertimeCount / total) * circumference;
                      const absentDash = (attendanceBreakdown.absentCount / total) * circumference;

                      let offset = 0;
                      const s1Offset = offset;
                      offset -= presentDash;
                      const s2Offset = offset;
                      offset -= lateDash;
                      const s3Offset = offset;
                      offset -= undertimeDash;
                      const s4Offset = offset;

                      return (
                        <>
                          {/* Segment 1: Present (Emerald) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#10B981"
                            strokeWidth="11"
                            fill="transparent"
                            strokeDasharray={`${presentDash} ${circumference}`}
                            strokeDashoffset={s1Offset}
                            className="transition-all duration-700"
                          />
                          {/* Segment 2: Late (Amber) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#F59E0B"
                            strokeWidth="11"
                            fill="transparent"
                            strokeDasharray={`${lateDash} ${circumference}`}
                            strokeDashoffset={s2Offset}
                            className="transition-all duration-700"
                          />
                          {/* Segment 3: Undertime (Indigo) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#6366F1"
                            strokeWidth="11"
                            fill="transparent"
                            strokeDasharray={`${undertimeDash} ${circumference}`}
                            strokeDashoffset={s3Offset}
                            className="transition-all duration-700"
                          />
                          {/* Segment 4: Absent (Rose) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#F43F5E"
                            strokeWidth="11"
                            fill="transparent"
                            strokeDasharray={`${absentDash} ${circumference}`}
                            strokeDashoffset={s4Offset}
                            className="transition-all duration-700"
                          />
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* Center Metric Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {punctualityRate}%
                    </span>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                      PRESENT
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Legend & Counts */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                {/* 1. Present */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0 shadow-xs" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">{attendanceBreakdown.presentCount}</span>
                    <span className="text-slate-400 text-[11px]">({attendanceBreakdown.presentPct}%)</span>
                  </div>
                </div>

                {/* 2. Absent */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shrink-0 shadow-xs" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-rose-600 dark:text-rose-400">{attendanceBreakdown.absentCount}</span>
                    <span className="text-slate-400 text-[11px]">({attendanceBreakdown.absentPct}%)</span>
                  </div>
                </div>

                {/* 3. Late */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0 shadow-xs" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Late</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-amber-600 dark:text-amber-400">{attendanceBreakdown.lateCount}</span>
                    <span className="text-slate-400 text-[11px]">({attendanceBreakdown.latePct}%)</span>
                  </div>
                </div>

                {/* 4. Undertime */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shrink-0 shadow-xs" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Undertime</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-indigo-600 dark:text-indigo-400">{attendanceBreakdown.undertimeCount}</span>
                    <span className="text-slate-400 text-[11px]">({attendanceBreakdown.undertimePct}%)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Status Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
              Active Shift Cycle: <strong>{activeContributorsCount} Logged</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
              {attendanceBreakdown.absentCount} Absent / Off
            </span>
          </div>
        </div>

        {/* Right Card: Weekly Shift Attendance Bar Chart (SOLID FLAT COLORS) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#24537D]/10 text-[#24537D] dark:bg-blue-950/60 dark:text-blue-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Weekly Attendance &amp; Punctuality Trend
                  </h3>
                  <span className="text-[10.5px] text-slate-400 block font-medium">
                    Daily shift capacity &amp; on-time compliance rate
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> &ge;95% Target
                </span>
              </div>
            </div>

            {/* Weekly Bar Chart Visual with SOLID flat colors */}
            <div className="mt-4 pt-1">
              <div className="h-36 w-full flex items-end justify-between gap-2 px-1 relative">
                
                {/* 95% Benchmark Target Line */}
                <div 
                  className="absolute left-0 right-0 border-b border-dashed border-emerald-400/60 dark:border-emerald-500/40 pointer-events-none z-10"
                  style={{ bottom: '72%' }}
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
                      <div className="w-full max-w-[34px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden relative flex flex-col justify-end h-24">
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

            {/* Punch Exception & Deviation Audit Box */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                PUNCH DEVIATION &amp; AUDIT FLAGS
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block font-medium">Manual Adjustments</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs mt-0.5 block">
                    {attendanceBreakdown.manualEditCount} Logs
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block font-medium">Late Clock-Ins (&gt;5m)</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs mt-0.5 block">
                    {attendanceBreakdown.lateCount} Logs
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block font-medium">Undertime (&lt;8h)</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs mt-0.5 block">
                    {attendanceBreakdown.undertimeCount} Logs
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. MEMBER ATTENDANCE & ADHERENCE LEADERBOARD TABLE */}
      <div id="analytics-leaderboard" className="scroll-mt-4">
        <MemberAttendanceRosterTable
          records={records}
          employees={employees}
          accounts={accounts}
        />
      </div>

    </div>
  );
}


