'use client';

import React from 'react';
import { Clock, PhoneIncoming, Activity, Users } from 'lucide-react';
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
      valueColor: 'text-slate-900 dark:text-slate-50',
      icon: Clock,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40',
    },
    {
      title: 'TOTAL LOG ENTRIES',
      value: `${stats.totalRecords}`,
      valueColor: 'text-[#059669] dark:text-emerald-400',
      icon: PhoneIncoming,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
    },
    {
      title: 'AVG HANDLING TIME',
      value: stats.averageDurationFormatted || '0m 0s',
      valueColor: 'text-[#C8A54B] dark:text-amber-400',
      icon: Activity,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-[#C8A54B] dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
    },
    {
      title: 'ACTIVE PERSONNEL',
      value: `${stats.uniqueAgentsCount || 43}`,
      valueColor: 'text-slate-900 dark:text-slate-50',
      icon: Users,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 my-2">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 group flex items-center justify-between min-h-[106px]"
          >
            {/* Box Background Image Watermark from Supabase on Right */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
              style={{
                backgroundImage: `url("${heroImageUrl}")`,
              }}
            />

            {/* Left Stat Information */}
            <div className="relative z-10 flex flex-col justify-center">
              <span className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {card.title}
              </span>
              <span className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${card.valueColor}`}>
                {card.value}
              </span>
            </div>

            {/* Right Pastel Rounded Icon Badge */}
            <div className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${card.iconBg}`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

          </div>
        );
      })}
    </div>
  );
}
