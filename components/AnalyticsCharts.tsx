'use client';

import React, { useMemo } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';

interface AnalyticsChartsProps {
  records: PhoneTimeRecord[];
}

export default function AnalyticsCharts({ records }: AnalyticsChartsProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  // Compute Account distribution
  const accountStats = useMemo(() => {
    const map: Record<string, { count: number; totalSeconds: number }> = {};
    records.forEach((r) => {
      const acc = r.account || 'DFT';
      const secs = parseDurationToSeconds(r.total_minutes);
      if (!map[acc]) map[acc] = { count: 0, totalSeconds: 0 };
      map[acc].count += 1;
      map[acc].totalSeconds += secs;
    });

    const entries = Object.entries(map).map(([account, data]) => ({
      account,
      count: data.count,
      totalSeconds: data.totalSeconds,
      formattedTime: formatTotalDurationHuman(data.totalSeconds),
    }));

    // Sort by count desc
    entries.sort((a, b) => b.count - a.count);
    return entries;
  }, [records]);

  // Compute Tag distribution
  const tagStats = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      if (r.tagging) {
        r.tagging.split(',').forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            map[trimmed] = (map[trimmed] || 0) + 1;
          }
        });
      }
    });

    const entries = Object.entries(map).map(([tag, count]) => ({
      tag,
      count,
      percentage: records.length > 0 ? Math.round((count / records.length) * 100) : 0,
    }));

    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, 6); // Top 6 tags
  }, [records]);

  const maxAccountCount = Math.max(...accountStats.map((a) => a.count), 1);
  const maxTagCount = Math.max(...tagStats.map((t) => t.count), 1);

  if (records.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Account Time & Volume Breakdown */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        
        {/* Box Background Image Watermark */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-15 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("${heroImageUrl}")`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Calls & Volume by Account
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {accountStats.length} Accounts
            </span>
          </div>

          <div className="space-y-3.5 mt-4">
            {accountStats.map((item, idx) => {
              const percentage = Math.round((item.count / maxAccountCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.account}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2F6798] dark:text-blue-400">
                        {item.count} calls
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({item.formattedTime})
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2F6798] to-[#C8A54B] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Inquiry Categories & Tag Distribution */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        
        {/* Box Background Image Watermark */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-15 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("${heroImageUrl}")`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#C8A54B]/15 text-[#C8A54B] dark:bg-amber-950/60 dark:text-amber-400">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Top Call Reasons & Categories
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Tag Frequency
            </span>
          </div>

          <div className="space-y-3.5 mt-4">
            {tagStats.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No tags recorded in the active call entries.
              </p>
            ) : (
              tagStats.map((item, idx) => {
                const percentage = Math.round((item.count / maxTagCount) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {item.tag}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#C8A54B] dark:text-amber-400">
                          {item.count}x
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C8A54B] to-emerald-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
