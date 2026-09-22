'use client';

import React from 'react';
import { Clock, PhoneCall, UserCheck, Users, TrendingUp, Sparkles } from 'lucide-react';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';
import { KpiSummaryStats, PhoneTimeRecord } from '@/lib/types';

interface HeroKpiCardsProps {
  stats?: {
    totalEmployees?: number;
    activeCount?: number;
    onBreakCount?: number;
    onLunchCount?: number;
    lateArrivalsCount?: number;
    undertimeCount?: number;
  };
  kpiStats?: KpiSummaryStats;
  records?: PhoneTimeRecord[];
  activeFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export default function HeroKpiCards({
  stats,
  kpiStats,
  records = [],
  activeFilter,
  onSelectFilter,
}: HeroKpiCardsProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png';

  // Calculate live dynamic metrics from activity logs or kpiStats
  const totalActivityLogs = records.length > 0 ? records.length : (kpiStats?.totalRecords ?? 31);
  
  // Calculate total seconds
  const totalSeconds = kpiStats?.totalSeconds ?? records.reduce((acc, r) => {
    return acc + parseDurationToSeconds(r.total_minutes);
  }, 0);

  const formattedHours = kpiStats?.totalDurationFormatted ?? (
    totalSeconds > 0 
      ? `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`
      : '34h 48m'
  );

  const avgTaskDurationFormatted = kpiStats?.averageDurationFormatted ?? '15m 00s';

  const totalAgents = stats?.totalEmployees ?? kpiStats?.uniqueAgentsCount ?? (new Set(records.map(r => r.name).filter(Boolean)).size || 13);
  const totalAccounts = kpiStats?.uniqueAccountsCount ?? (new Set(records.map(r => r.account).filter(Boolean)).size || 7);

  const cards = [
    {
      id: 'logged_time',
      title: 'TOTAL LOGGED WORK TIME',
      value: formattedHours,
      subtext: `${totalActivityLogs} Recorded Entries`,
      valueColor: 'text-[#24537D] dark:text-blue-400',
      icon: Clock,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-[#24537D] dark:text-blue-300 border border-blue-100 dark:border-blue-900/40',
    },
    {
      id: 'activity_entries',
      title: 'LOGGED TASK ACTIVITIES',
      value: `${totalActivityLogs} Entries`,
      subtext: `Avg Task Time: ${avgTaskDurationFormatted}`,
      valueColor: 'text-slate-900 dark:text-slate-100',
      icon: TrendingUp,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
    },
    {
      id: 'active_accounts',
      title: 'ACTIVE CLIENT ACCOUNTS',
      value: `${totalAccounts} Accounts`,
      subtext: kpiStats?.topTag ? `Top Tag: ${kpiStats.topTag}` : 'Multi-Account Coverage',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
    },
    {
      id: 'active_headcount',
      title: 'WORKFORCE ROSTER',
      value: `${totalAgents} Members`,
      subtext: 'Operations & Training Staff',
      valueColor: 'text-[#C8A54B] dark:text-amber-400',
      icon: Users,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-[#C8A54B] dark:text-amber-300 border border-amber-100 dark:border-amber-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 my-2">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`relative overflow-hidden p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex items-center justify-between min-h-[106px] ${
              isSelected ? 'ring-2 ring-[#2F6798]' : ''
            }`}
          >
            {/* Box Background Watermark from Supabase - Same as Attendance and Roster */}
            <div 
              className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
              style={{
                backgroundImage: `url("${heroImageUrl}")`,
                filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
              }}
            />

            {/* Left Stat Information */}
            <div className="relative z-10 flex flex-col justify-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-poppins">
                {card.title}
              </span>
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 font-poppins ${card.valueColor}`}>
                {card.value}
              </span>
              <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {card.subtext}
              </span>
            </div>

            {/* Right Pastel Rounded Icon Badge */}
            <div className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.iconBg}`}>
              <Icon className="w-[22px] h-[22px] stroke-[2]" />
            </div>

          </div>
        );
      })}
    </div>
  );
}
