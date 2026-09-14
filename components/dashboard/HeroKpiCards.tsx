'use client';

import React from 'react';
import { Users, TrendingDown, GraduationCap, Coffee, CheckCircle, ShieldCheck } from 'lucide-react';

interface HeroKpiCardsProps {
  stats: {
    totalEmployees: number;
    activeCount: number;
    onBreakCount: number;
    onLunchCount: number;
    lateArrivalsCount: number;
    undertimeCount: number;
  };
  activeFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export default function HeroKpiCards({
  stats,
  activeFilter,
  onSelectFilter,
}: HeroKpiCardsProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  const cards = [
    {
      id: 'all',
      title: 'TOTAL TRAINEES',
      value: '180',
      subValue: `${stats.totalEmployees} Active in Roster`,
      badge: 'Live Data',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: Users,
      iconBg: 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      id: 'active',
      title: 'OVERALL ATTRITION',
      value: '14.4%',
      subValue: '98.4% Adherence',
      badge: 'Optimal',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: TrendingDown,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'trainers',
      title: 'ACTIVE TRAINERS',
      value: '16',
      subValue: `${stats.activeCount} Working Now`,
      badge: 'Active',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: GraduationCap,
      iconBg: 'bg-[#C8A54B]/15 text-[#C8A54B] dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      id: 'lunch',
      title: 'ON LUNCH & BREAK',
      value: `${stats.onLunchCount + stats.onBreakCount}`,
      subValue: `${stats.onLunchCount} Lunch, ${stats.onBreakCount} Break`,
      badge: 'On Track',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: Coffee,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group ${
              isSelected ? 'ring-2 ring-[#2F6798]' : ''
            }`}
          >
            {/* Box Background Watermark from Supabase storage */}
            <div 
              className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
              style={{
                backgroundImage: `url("${heroImageUrl}")`,
              }}
            />

            {/* Card Content (Relative Z-10) */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              
              {/* Top Row: Icon + Title + Badge */}
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

                {/* Status Pill Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              {/* Bottom Stat Values */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {card.subValue}
                  </div>
                </div>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}
