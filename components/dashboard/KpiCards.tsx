'use client';

import React from 'react';
import { Users, UserCheck, Coffee, Utensils, AlertTriangle, Clock } from 'lucide-react';

export interface KpiSummaryData {
  totalEmployees: number;
  activeCount: number;
  onBreakCount: number;
  onLunchCount: number;
  lateArrivalsCount: number;
  undertimeCount: number;
}

interface KpiCardsProps {
  stats: KpiSummaryData;
  activeFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export default function KpiCards({
  stats,
  activeFilter = 'all',
  onSelectFilter,
}: KpiCardsProps) {
  const cards = [
    {
      id: 'all',
      label: 'Total Employees',
      value: stats.totalEmployees,
      accentBorder: 'border-l-slate-400 dark:border-l-slate-500',
      accentColor: 'text-slate-800 dark:text-slate-100',
      icon: Users,
      iconColor: 'text-slate-400',
      bgGlow: 'hover:shadow-slate-500/10',
    },
    {
      id: 'active',
      label: 'Active',
      value: stats.activeCount,
      accentBorder: 'border-l-emerald-500',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      icon: UserCheck,
      iconColor: 'text-emerald-500',
      bgGlow: 'hover:shadow-emerald-500/10',
    },
    {
      id: 'break',
      label: 'On Break',
      value: stats.onBreakCount,
      accentBorder: 'border-l-amber-500',
      accentColor: 'text-amber-600 dark:text-amber-400',
      icon: Coffee,
      iconColor: 'text-amber-500',
      bgGlow: 'hover:shadow-amber-500/10',
    },
    {
      id: 'lunch',
      label: 'On Lunch',
      value: stats.onLunchCount,
      accentBorder: 'border-l-purple-500',
      accentColor: 'text-purple-600 dark:text-purple-400',
      icon: Utensils,
      iconColor: 'text-purple-500',
      bgGlow: 'hover:shadow-purple-500/10',
    },
    {
      id: 'late',
      label: 'Late Arrivals',
      value: stats.lateArrivalsCount,
      accentBorder: 'border-l-rose-500',
      accentColor: 'text-rose-600 dark:text-rose-400',
      icon: AlertTriangle,
      iconColor: 'text-rose-500',
      bgGlow: 'hover:shadow-rose-500/10',
    },
    {
      id: 'undertime',
      label: 'Undertime',
      value: stats.undertimeCount,
      accentBorder: 'border-l-orange-500',
      accentColor: 'text-orange-600 dark:text-orange-400',
      icon: Clock,
      iconColor: 'text-orange-500',
      bgGlow: 'hover:shadow-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`text-left p-4 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 border-l-[4px] ${
              card.accentBorder
            } ${card.bgGlow} ${
              isSelected
                ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/40 bg-blue-50/20 dark:bg-blue-900/10 scale-[1.02]'
                : 'hover:scale-[1.01]'
            } cursor-pointer`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 shrink-0 opacity-75 ${card.iconColor}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${card.accentColor}`}>
                {card.value}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
