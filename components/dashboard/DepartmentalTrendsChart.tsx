'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Clock, Calendar } from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';
import { parseDurationToSeconds } from '@/lib/utils';

interface DepartmentalTrendsChartProps {
  records?: PhoneTimeRecord[];
}

export default function DepartmentalTrendsChart({ records = [] }: DepartmentalTrendsChartProps) {
  const [metricMode, setMetricMode] = useState<'volume' | 'duration'>('volume');

  // Aggregate records strictly by date_of_shift
  const trendData = useMemo(() => {
    if (!records || records.length === 0) {
      return [
        { label: 'Aug 20', volume: 0, hours: 0 },
        { label: 'Aug 21', volume: 0, hours: 0 },
        { label: 'Aug 24', volume: 0, hours: 0 },
        { label: 'Aug 25', volume: 0, hours: 0 },
        { label: 'Aug 26', volume: 0, hours: 0 },
        { label: 'Aug 27', volume: 0, hours: 0 },
      ];
    }

    // Group by date_of_shift
    const dateMap: Record<string, { volume: number; totalSecs: number }> = {};
    records.forEach((r) => {
      const d = r.date_of_shift?.trim() || 'General';
      if (!dateMap[d]) {
        dateMap[d] = { volume: 0, totalSecs: 0 };
      }
      dateMap[d].volume += 1;
      dateMap[d].totalSecs += parseDurationToSeconds(r.total_minutes);
    });

    const entries = Object.entries(dateMap).map(([date, val]) => {
      let shortLabel = date;
      try {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          shortLabel = parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
      } catch (e) {}

      return {
        rawDate: date,
        label: shortLabel,
        volume: val.volume,
        hours: Math.round((val.totalSecs / 3600) * 10) / 10,
      };
    });

    // Sort chronologically if valid dates
    entries.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

    if (entries.length > 6) {
      return entries.slice(-6);
    }

    return entries;
  }, [records]);

  // Compute scale and SVG points
  const { pointsStr, areaStr, pointCoords, yLabels } = useMemo(() => {
    const dataLen = trendData.length;
    if (dataLen === 0) {
      return { pointsStr: '', areaStr: '', pointCoords: [], maxY: 10, yLabels: [] };
    }

    const rawValues = trendData.map((d) => (metricMode === 'volume' ? d.volume : d.hours));
    const maxVal = Math.max(...rawValues, metricMode === 'volume' ? 4 : 2);
    const ceilingMax = Math.ceil(maxVal * 1.25) || 10;

    const coords = trendData.map((d, idx) => {
      const val = metricMode === 'volume' ? d.volume : d.hours;
      const x = dataLen === 1 ? 250 : 40 + (idx / (dataLen - 1)) * 430;
      const y = 165 - (val / ceilingMax) * 135;
      return { x, y, val, label: d.label };
    });

    const pts = coords.map((c) => `${c.x},${c.y}`).join(' ');
    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    const area = `${firstX},170 ${pts} ${lastX},170`;

    const labels = [
      ceilingMax,
      Math.round(ceilingMax * 0.75),
      Math.round(ceilingMax * 0.5),
      Math.round(ceilingMax * 0.25),
    ].map((v) => (metricMode === 'volume' ? `${v}` : `${v}h`));

    return {
      pointsStr: pts,
      areaStr: area,
      pointCoords: coords,
      maxY: ceilingMax,
      yLabels: labels,
    };
  }, [trendData, metricMode]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2F6798] dark:text-blue-400" />
              <span>Shift Attendance &amp; Hours Trend</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              {metricMode === 'volume' 
                ? 'DAILY SHIFT ATTENDANCE TRAJECTORY' 
                : 'HOURLY WORKED TIME TRAJECTORY'}
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMetricMode('volume')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                metricMode === 'volume'
                  ? 'bg-white dark:bg-slate-700 text-[#2F6798] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Daily Shifts</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('duration')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                metricMode === 'duration'
                  ? 'bg-white dark:bg-slate-700 text-[#2F6798] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Worked Hours</span>
            </button>
          </div>
        </div>

        {/* SVG Chart with gold #C8A54B line & fill */}
        <div className="mt-4 relative h-48 sm:h-56 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 190" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8A54B" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#C8A54B" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            <line x1="30" y1="30" x2="480" y2="30" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="75" x2="480" y2="75" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="120" x2="480" y2="120" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="165" x2="480" y2="165" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeDasharray="3 3" opacity="0.6" />

            {/* Y Axis Labels */}
            {yLabels.map((lbl, idx) => (
              <text key={idx} x="5" y={34 + idx * 45} fontSize="9.5" fill="#94a3b8" fontWeight="bold">
                {lbl}
              </text>
            ))}

            {/* Area Fill */}
            {areaStr && <polygon points={areaStr} fill="url(#chartGoldGradient)" />}

            {/* Trajectory Line with #C8A54B */}
            {pointsStr && (
              <polyline
                fill="none"
                stroke="#C8A54B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsStr}
              />
            )}

            {/* Data Points */}
            {pointCoords.map((pt, idx) => (
              <g key={idx}>
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#C8A54B" strokeWidth="2.5" />
              </g>
            ))}
          </svg>

          {/* X-Axis Labels */}
          <div className="flex justify-between pl-8 pr-4 mt-2 text-[10.5px] font-bold text-slate-400">
            {trendData.map((d, idx) => (
              <span key={idx} className="truncate max-w-[70px] text-center" title={d.label}>
                {d.label}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
