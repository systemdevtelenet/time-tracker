'use client';

import React from 'react';
import { Clock, PhoneIncoming, Activity, Layers, TrendingUp, Tag, Sparkles } from 'lucide-react';
import { KpiSummaryStats } from '@/lib/types';

interface KpiSummaryProps {
  stats: KpiSummaryStats;
}

export default function KpiSummary({ stats }: KpiSummaryProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  const cards = [
    {
      title: 'TOTAL LOGGED TIME',
      value: stats.totalDurationFormatted || '0m 0s',
      subtitle: 'Across all filtered phone logs',
      badge: 'Live Data',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: Clock,
      iconBg: 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      title: 'TOTAL PHONE ENTRIES',
      value: `${stats.totalRecords}`,
      subUnit: 'calls',
      subtitle: `${stats.uniqueAgentsCount} active agent${stats.uniqueAgentsCount !== 1 ? 's' : ''} logged`,
      badge: 'Active',
      badgeStyle: 'bg-blue-50 text-[#2F6798] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      icon: PhoneIncoming,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      title: 'AVERAGE HANDLING TIME (AHT)',
      value: stats.averageDurationFormatted || '0m 0s',
      subtitle: `${stats.uniqueAccountsCount} distinct account${stats.uniqueAccountsCount !== 1 ? 's' : ''}`,
      badge: 'Optimal',
      badgeStyle: 'bg-[#C8A54B]/15 text-[#C8A54B] border-[#C8A54B]/30 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: Activity,
      iconBg: 'bg-[#C8A54B]/15 text-[#C8A54B] dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      title: 'TOP CALL REASON / TAG',
      value: stats.topTag || 'None',
      subtitle: 'Most frequent inquiry category',
      badge: 'Key Driver',
      badgeStyle: 'bg-blue-50 text-[#2F6798] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      icon: Tag,
      iconBg: 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300',
      isTextVal: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 group"
          >
            {/* Box Background Image Watermark from Supabase */}
            <div 
              className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
              style={{
                backgroundImage: `url("${heroImageUrl}")`,
              }}
            />

            {/* Content (Z-10) */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              
              {/* Header: Icon + Title + Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                      {card.title}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeStyle}`}>
                  {card.badge}
                </span>
              </div>

              {/* Metric Value */}
              <div className="mt-4">
                <div className="flex items-baseline gap-1.5">
                  <span className={`${card.isTextVal ? 'text-lg sm:text-xl font-bold truncate max-w-[200px]' : 'text-2xl sm:text-3xl font-black'} text-slate-900 dark:text-slate-100 tracking-tight`}>
                    {card.value}
                  </span>
                  {card.subUnit && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {card.subUnit}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {card.subtitle}
                </div>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}
