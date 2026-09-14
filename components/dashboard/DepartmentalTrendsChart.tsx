'use client';

import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Sparkles, Calendar } from 'lucide-react';

export default function DepartmentalTrendsChart() {
  const [trajectoryMode, setTrajectoryMode] = useState<'quarterly' | 'monthly'>('quarterly');

  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      
      {/* Box Background Watermark */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-15 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("${heroImageUrl}")`,
        }}
      />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Overall Departmental Trends
            </h3>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              OVERALL DEPARTMENTAL TRENDS — {trajectoryMode === 'quarterly' ? 'QUARTERLY TRAJECTORY' : 'MONTHLY TRAJECTORY'} (ATTRITION % TREND)
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setTrajectoryMode('quarterly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trajectoryMode === 'quarterly'
                  ? 'bg-white dark:bg-slate-700 text-[#2F6798] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Quarterly Trajectory
            </button>
            <button
              onClick={() => setTrajectoryMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trajectoryMode === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-[#2F6798] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly Trajectory
            </button>
          </div>
        </div>

        {/* SVG Chart with gold #C8A54B line */}
        <div className="mt-4 relative h-48 sm:h-56 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8A54B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#C8A54B" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            <line x1="30" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="65" x2="480" y2="65" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="155" x2="480" y2="155" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />

            {/* Y Axis Labels */}
            <text x="5" y="24" fontSize="10" fill="#94a3b8" fontWeight="bold">16%</text>
            <text x="5" y="69" fontSize="10" fill="#94a3b8" fontWeight="bold">12%</text>
            <text x="5" y="114" fontSize="10" fill="#94a3b8" fontWeight="bold">8%</text>
            <text x="5" y="159" fontSize="10" fill="#94a3b8" fontWeight="bold">4%</text>

            {/* Area Fill */}
            <polygon
              points="40,22 185,78 330,85 470,90 470,180 40,180"
              fill="url(#goldGradient)"
            />

            {/* Trajectory Line with #C8A54B */}
            <polyline
              fill="none"
              stroke="#C8A54B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="40,22 185,78 330,85 470,90"
            />

            {/* Data Points */}
            <circle cx="40" cy="22" r="5" fill="#ffffff" stroke="#C8A54B" strokeWidth="3" />
            <circle cx="185" cy="78" r="5" fill="#ffffff" stroke="#C8A54B" strokeWidth="3" />
            <circle cx="330" cy="85" r="5" fill="#ffffff" stroke="#C8A54B" strokeWidth="3" />
            <circle cx="470" cy="90" r="5" fill="#ffffff" stroke="#C8A54B" strokeWidth="3" />
          </svg>

          {/* X-Axis Labels */}
          <div className="flex justify-between pl-8 pr-4 mt-2 text-[11px] font-bold text-slate-400">
            <span>Q1</span>
            <span>Q2</span>
            <span>Q3</span>
            <span>Q4 (Projected)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
