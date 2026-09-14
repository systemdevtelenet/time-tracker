'use client';

import React from 'react';
import { LayoutGrid, Users, TrendingDown, Percent, Award } from 'lucide-react';

interface ExecutivePerformanceOverviewProps {
  onSelectCategory?: (cat: string) => void;
}

export default function ExecutivePerformanceOverview({
  onSelectCategory,
}: ExecutivePerformanceOverviewProps) {
  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

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
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#2F6798]" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Executive Performance Overview
          </h3>
        </div>

        {/* 3 Top Summary Metrics */}
        <div className="grid grid-cols-3 gap-3">
          
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              HEADCOUNT
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              <Users className="w-4 h-4 text-[#2F6798]" />
              <span>180</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              LOSSES
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-lg sm:text-xl font-black text-rose-600">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>26</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              GLOBAL ATTRITION
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-lg sm:text-xl font-black text-[#2F6798] dark:text-blue-300">
              <Percent className="w-4 h-4 text-[#2F6798]" />
              <span>14.4%</span>
            </div>
          </div>

        </div>

        {/* Breakdown Sub-boxes */}
        <div className="space-y-3">
          
          {/* INHOUSE TRAINING (Blue #2F6798 left accent) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border-l-[4px] border-l-[#2F6798] border border-slate-100 dark:border-slate-700/60">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">
              INHOUSE TRAINING
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">HEADCOUNT</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">79</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ONGOING</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">0</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">LOSSES</span>
                <span className="font-extrabold text-rose-600">6</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ATTRITION</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">7.6%</span>
              </div>
            </div>
          </div>

          {/* PST TRAINING (Blue #2F6798 left accent) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border-l-[4px] border-l-[#2F6798] border border-slate-100 dark:border-slate-700/60">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">
              PST TRAINING
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">HEADCOUNT</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">101</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ONGOING</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">7</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">LOSSES</span>
                <span className="font-extrabold text-rose-600">20</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ATTRITION</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">19.8%</span>
              </div>
            </div>
          </div>

          {/* TRAINERS (Gold #C8A54B left accent) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border-l-[4px] border-l-[#C8A54B] border border-slate-100 dark:border-slate-700/60">
            <h4 className="text-xs font-black text-[#C8A54B] uppercase tracking-wide mb-2">
              TRAINERS / LEADERSHIP
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">HEADCOUNT</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">16</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ACTIVE</span>
                <span className="font-extrabold text-emerald-600">13</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">LUNCH/BREAK</span>
                <span className="font-extrabold text-[#C8A54B]">3</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ATTRITION</span>
                <span className="font-extrabold text-emerald-600">0.0%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
