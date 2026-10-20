'use client';

import React from 'react';
import { Clock, PhoneCall, UserCheck, Users, TrendingUp } from 'lucide-react';
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
  isHeadOrAdmin?: boolean;
  userShift?: string;
}

export default function HeroKpiCards({
  stats,
  kpiStats,
  records = [],
  activeFilter,
  onSelectFilter,
  isHeadOrAdmin = true,
  userShift,
}: HeroKpiCardsProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png';

  // Calculate live dynamic metrics from activity logs or kpiStats
  const totalActivityLogs = records.length;
  
  // Calculate total seconds
  const totalSeconds = kpiStats?.totalSeconds ?? records.reduce((acc, r) => {
    return acc + parseDurationToSeconds(r.total_minutes);
  }, 0);

  const formattedHours = kpiStats?.totalDurationFormatted ?? (
    totalSeconds > 0 
      ? `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`
      : '0h 0m'
  );

  const avgTaskDurationFormatted = kpiStats?.averageDurationFormatted ?? '0m 00s';

  const totalAgents = stats?.totalEmployees ?? kpiStats?.uniqueAgentsCount ?? (new Set(records.map(r => r.name).filter(Boolean)).size);
  const totalAccounts = kpiStats?.uniqueAccountsCount ?? (new Set(records.map(r => r.account).filter(Boolean)).size);

  const cards = [
    {
      id: 'logged_time',
      title: isHeadOrAdmin ? 'TOTAL LOGGED WORK TIME' : 'MY LOGGED WORK TIME',
      value: formattedHours,
      subtext: `${totalActivityLogs} Recorded Entries`,
      valueColor: 'text-[#24537D] dark:text-blue-400',
      icon: Clock,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-[#24537D] dark:text-blue-300 border border-blue-100 dark:border-blue-900/40',
    },
    {
      id: 'activity_entries',
      title: isHeadOrAdmin ? 'LOGGED TASK ACTIVITIES' : 'MY TASK ACTIVITIES',
      value: `${totalActivityLogs} Entries`,
      subtext: `Avg Task Time: ${avgTaskDurationFormatted}`,
      valueColor: 'text-slate-900 dark:text-slate-100',
      icon: TrendingUp,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
    },
    {
      id: 'active_accounts',
      title: isHeadOrAdmin ? 'ACTIVE CLIENT ACCOUNTS' : 'MY ACTIVE ACCOUNTS',
      value: `${totalAccounts} Account${totalAccounts > 1 ? 's' : ''}`,
      subtext: kpiStats?.topTag ? `Top Tag: ${kpiStats.topTag}` : 'Assigned Accounts',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
    },
    isHeadOrAdmin
      ? {
          id: 'active_headcount',
          title: 'WORKFORCE ROSTER',
          value: `${totalAgents} Members`,
          subtext: 'Operations & Training Staff',
          valueColor: 'text-[#C8A54B] dark:text-amber-400',
          icon: Users,
          iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-[#C8A54B] dark:text-amber-300 border border-amber-100 dark:border-amber-900/40',
        }
      : {
          id: 'shift_schedule',
          title: 'MY SHIFT SCHEDULE',
          value: userShift || 'Not set',
          subtext: userShift ? 'Assigned Work Window' : 'No shift schedule assigned',
          valueColor: 'text-[#C8A54B] dark:text-amber-400',
          icon: Clock,
          iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-[#C8A54B] dark:text-amber-300 border border-amber-100 dark:border-amber-900/40',
        },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3 mt-1 mb-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`relative overflow-hidden p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex items-center justify-start gap-3 min-h-[104px] ${
              isSelected ? 'ring-2 ring-[#2F6798]' : ''
            }`}
          >
            {/* Box Background Watermark from Supabase - Same as Attendance and Roster */}
            <div 
              className="absolute inset-0 w-full h-full bg-no-repeat bg-right opacity-20 dark:opacity-12 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
              style={{
                backgroundImage: `url("${heroImageUrl}")`,
                backgroundSize: '71% auto',
                filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
              }}
            />

            {/* Left Stat Information */}
            <div className={`relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.iconBg}`}>
              <Icon className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="relative z-10 flex min-w-0 flex-col justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-poppins">
                {card.title}
              </span>
              <span className={`text-xl sm:text-2xl leading-tight font-extrabold tracking-tight mt-0.5 font-poppins ${card.valueColor}`}>
                {card.value}
              </span>
              <span className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                {card.subtext}
              </span>
            </div>

          </div>
        );
      })}
    </div>
  );
}
