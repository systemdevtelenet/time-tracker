'use client';

import React from 'react';
import { Clock, PhoneIncoming, Activity, Users } from 'lucide-react';
import { KpiSummaryStats } from '@/lib/types';

interface KpiSummaryProps {
  stats: KpiSummaryStats;
}

export default function KpiSummary({ stats }: KpiSummaryProps) {
  const kpiImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png';

  const cards = [
    {
      title: 'TOTAL LOGGED TIME',
      value: stats.totalDurationFormatted || '0m 0s',
      valueColor: 'text-slate-900 dark:text-slate-50',
      icon: Clock,
      iconBg: 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/50 dark:text-blue-300 border border-[#2F6798]/20',
    },
    {
      title: 'TOTAL LOG ENTRIES',
      value: `${stats.totalRecords}`,
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      icon: Activity,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
    },
    {
      title: 'AVG TASK DURATION',
      value: stats.averageDurationFormatted || '0m 0s',
      valueColor: 'text-[#2F6798] dark:text-blue-300',
      icon: Clock,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40',
    },
    {
      title: 'ACTIVE PERSONNEL',
      value: `${stats.uniqueAgentsCount || 21}`,
      valueColor: 'text-slate-900 dark:text-slate-50',
      icon: Users,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-1.5 mb-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="relative overflow-hidden py-3.5 px-4 sm:px-4.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 group flex items-center justify-between min-h-[88px] select-none"
          >
            {/* Box Background Image Watermark from Supabase - Same as Attendance and Roster */}
            <div 
              className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
              style={{
                backgroundImage: `url("${kpiImageUrl}")`,
                filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
              }}
            />

            {/* Left Stat Information */}
            <div className="relative z-10 flex flex-col justify-center min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase truncate">
                {card.title}
              </span>
              <span className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 ${card.valueColor}`}>
                {card.value}
              </span>
            </div>

            {/* Right Pastel Rounded Icon Badge */}
            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${card.iconBg}`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

          </div>
        );
      })}
    </div>
  );
}
