'use client';

import React, { useMemo } from 'react';
import { LayoutGrid, Clock, PhoneIncoming, Activity, ShieldCheck, Tag, Layers, Users } from 'lucide-react';
import { PhoneTimeRecord, KpiSummaryStats } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';

interface ExecutivePerformanceOverviewProps {
  records?: PhoneTimeRecord[];
  kpiStats?: KpiSummaryStats;
  onSelectCategory?: (cat: string) => void;
}

export default function ExecutivePerformanceOverview({
  records = [],
  kpiStats,
  onSelectCategory,
}: ExecutivePerformanceOverviewProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  // Calculate account breakdown from records
  const accountMetrics = useMemo(() => {
    const accMap: Record<string, { count: number; totalSecs: number; tags: Record<string, number> }> = {};

    records.forEach((r) => {
      const acc = (r.account || 'GENERAL').trim().toUpperCase();
      if (!accMap[acc]) {
        accMap[acc] = { count: 0, totalSecs: 0, tags: {} };
      }
      accMap[acc].count += 1;
      const s = parseDurationToSeconds(r.total_minutes);
      accMap[acc].totalSecs += s;

      if (r.tagging) {
        r.tagging.split(',').forEach((t) => {
          const trim = t.trim();
          if (trim) {
            accMap[acc].tags[trim] = (accMap[acc].tags[trim] || 0) + 1;
          }
        });
      }
    });

    const entries = Object.entries(accMap).map(([acc, data]) => {
      let topTag = 'General';
      let maxTag = 0;
      Object.entries(data.tags).forEach(([t, c]) => {
        if (c > maxTag) {
          maxTag = c;
          topTag = t;
        }
      });

      const avgSecs = data.count > 0 ? Math.round(data.totalSecs / data.count) : 0;

      return {
        account: acc,
        count: data.count,
        totalFormatted: formatTotalDurationHuman(data.totalSecs),
        avgFormatted: formatTotalDurationHuman(avgSecs),
        topTag: topTag.length > 18 ? `${topTag.slice(0, 18)}...` : topTag,
      };
    });

    // Sort by count descending
    entries.sort((a, b) => b.count - a.count);

    // Fallback if records are empty
    if (entries.length === 0) {
      return [
        { account: 'DFT', count: 12, totalFormatted: '8h 24m', avgFormatted: '3m 45s', topTag: 'HOLD, Best plan' },
        { account: 'RM', count: 9, totalFormatted: '6h 15m', avgFormatted: '4m 10s', topTag: 'Requested Info' },
        { account: 'BF', count: 6, totalFormatted: '4h 50m', avgFormatted: '4m 50s', topTag: 'Inquiry' },
        { account: 'XPN', count: 4, totalFormatted: '3h 10m', avgFormatted: '5m 02s', topTag: 'Escalation' },
      ];
    }

    return entries;
  }, [records]);

  const totalDuration = kpiStats?.totalDurationFormatted || '34h 48m';
  const totalCalls = kpiStats?.totalRecords ?? (records.length || 31);
  const avgHandlingTime = kpiStats?.averageDurationFormatted || '4m 12s';

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-15 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("${heroImageUrl}")`,
        }}
      />

      <div className="relative z-10 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#2F6798]" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Operations & Shift Tracking Overview
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Live Account Summary
          </span>
        </div>

        {/* 3 Top Summary Metrics */}
        <div className="grid grid-cols-3 gap-3">
          
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              LOGGED TIME
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-base sm:text-lg font-black text-[#2F6798] dark:text-blue-300">
              <Clock className="w-4 h-4 text-[#2F6798]" />
              <span className="truncate">{totalDuration}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TOTAL ACTIVITIES
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>{totalCalls} logs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              AVG TASK TIME
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-base sm:text-lg font-black text-[#C8A54B]">
              <Clock className="w-4 h-4 text-[#C8A54B]" />
              <span className="truncate">{avgHandlingTime}</span>
            </div>
          </div>

        </div>

        {/* Breakdown by Account Queues */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2F6798]" />
            <span>Account & Department Work Breakdown</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {accountMetrics.slice(0, 4).map((acc, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border-l-[4px] border-l-[#2F6798] border border-slate-100 dark:border-slate-700/60 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Account: {acc.account}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {acc.count} Activity Entries ({acc.totalFormatted})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">LOG ENTRIES</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{acc.count}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">AVG DURATION</span>
                    <span className="font-extrabold text-[#2F6798] dark:text-blue-300">{acc.avgFormatted}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">TOP CATEGORY</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate block" title={acc.topTag}>
                      {acc.topTag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
