'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Download, 
  TrendingUp, 
  Coffee, 
  Utensils, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { RosterEmployee } from './RosterTable';

interface HoursReportTabProps {
  employees?: RosterEmployee[];
  onBackToRoster?: () => void;
}

interface TeamMemberHours {
  id: string;
  name: string;
  position: string;
  dailyHours: number; // e.g. 0.68 or 8.00
  actualTotal: number;
  targetHours: number;
  targetDays: number;
  breaksUsedMins: number;
  breakLimitMins: number;
  isWorkingToday?: boolean;
}

const TEAM_HOURS_DATA: TeamMemberHours[] = [
  {
    id: '1',
    name: 'Nissi-Jeh Reguero',
    position: 'Head of Training',
    dailyHours: 5.50,
    actualTotal: 5.50,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 45,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '2',
    name: 'Raymundo Alasagas III',
    position: 'Head of Quality',
    dailyHours: 6.00,
    actualTotal: 6.00,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 40,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '3',
    name: 'Bianca Kaye Ernestine Colonia',
    position: 'Trainer',
    dailyHours: 5.28,
    actualTotal: 5.28,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 9.6,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '4',
    name: 'Michelle Yncierto',
    position: 'Trainer',
    dailyHours: 8.00,
    actualTotal: 8.00,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 60,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '5',
    name: 'Rommel Mendoza',
    position: 'Trainer',
    dailyHours: 7.50,
    actualTotal: 7.50,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 55,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '6',
    name: 'Ronelyn Baguio',
    position: 'Trainer',
    dailyHours: 8.00,
    actualTotal: 8.00,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 50,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '7',
    name: 'Krisland Pepito',
    position: 'Trainer',
    dailyHours: 5.95,
    actualTotal: 5.95,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 0,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '8',
    name: 'Niño Elijah R. Reyes',
    position: 'Trainer',
    dailyHours: 0.68,
    actualTotal: 0.68,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 0,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '9',
    name: 'Kier Ariola',
    position: 'Trainer',
    dailyHours: 5.14,
    actualTotal: 5.14,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 50.1,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '10',
    name: 'Vincent Luis Celdran',
    position: 'Trainer',
    dailyHours: 4.50,
    actualTotal: 4.50,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 45,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '11',
    name: 'Nina Joy Briones',
    position: 'Trainer',
    dailyHours: 7.80,
    actualTotal: 7.80,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 60,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '12',
    name: 'Matt Riner Balaba',
    position: 'Trainer',
    dailyHours: 4.50,
    actualTotal: 4.50,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 60,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
  {
    id: '13',
    name: 'Maegan Marie Cabardo',
    position: 'Trainer',
    dailyHours: 6.20,
    actualTotal: 6.20,
    targetHours: 8.00,
    targetDays: 1,
    breaksUsedMins: 40,
    breakLimitMins: 90,
    isWorkingToday: true,
  },
];

export default function HoursReportTab({ onBackToRoster }: HoursReportTabProps) {
  const [viewMode, setViewMode] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Controls: Title + Period Toggles + Date Picker + Back Button */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Section Title */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Total Hours Worked
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Shift completion metrics and target variance for trainers & quality specialists
          </p>
        </div>

        {/* Right: Period Switcher & Date Controls */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          
          {/* Daily / Weekly / Monthly Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white dark:bg-[#2F6798] text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 px-1.5">
              {selectedDate}
            </span>

            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Back to Roster / Export Action */}
          {onBackToRoster && (
            <button
              type="button"
              onClick={onBackToRoster}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Roster</span>
            </button>
          )}

        </div>

      </div>

      {/* Main Hours Report Data Table */}
      <div className="bg-white dark:bg-[#0E1B38] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Unified Deep Navy / Primary Header */}
            <thead>
              <tr className="bg-[#153B5E] text-white select-none">
                <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-wider border-r border-white/10">
                  Employee
                </th>
                <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-wider border-r border-white/10">
                  Position
                </th>
                <th className="py-3.5 px-3 font-black uppercase text-[11px] tracking-wider text-center border-r border-white/10 bg-[#2F6798]">
                  Wed 16
                </th>
                <th className="py-3.5 px-3 font-black uppercase text-[11px] tracking-wider text-center border-r border-white/10 bg-[#1D4A73]">
                  Actual
                </th>
                <th className="py-3.5 px-3 font-black uppercase text-[11px] tracking-wider text-center border-r border-white/10">
                  Target (8h/day)
                </th>
                <th className="py-3.5 px-3 font-black uppercase text-[11px] tracking-wider text-center border-r border-white/10">
                  Δ vs Target
                </th>
                <th className="py-3.5 px-3 font-black uppercase text-[11px] tracking-wider text-center border-r border-white/10">
                  Breaks (used/limit)
                </th>
                <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-wider text-center">
                  Target vs Actual
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {TEAM_HOURS_DATA.map((member, idx) => {
                const delta = member.actualTotal - member.targetHours;
                const deltaFormatted = delta >= 0 ? `+${delta.toFixed(2)}` : `${delta.toFixed(2)}`;
                const isPositiveDelta = delta >= 0;
                const percent = Math.min(100, Math.round((member.actualTotal / member.targetHours) * 100));

                const isOverBreak = member.breaksUsedMins > member.breakLimitMins;

                return (
                  <tr 
                    key={member.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Employee Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800/80">
                      {member.name}
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium border-r border-slate-100 dark:border-slate-800/80">
                      {member.position}
                    </td>

                    {/* Day Cell (e.g. Wed 16) */}
                    <td className="py-3.5 px-3 text-center border-r border-slate-100 dark:border-slate-800/80">
                      {member.dailyHours > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-md bg-[#b3dee2]/40 text-[#153B5E] dark:bg-blue-900/40 dark:text-blue-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F6798]" />
                          {member.dailyHours.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">...</span>
                      )}
                    </td>

                    {/* Actual Total Hours */}
                    <td className="py-3.5 px-3 text-center font-black text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                      {member.actualTotal.toFixed(2)}
                    </td>

                    {/* Target Hours */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/80">
                      {member.targetHours.toFixed(2)} <span className="text-[10px] text-slate-400">({member.targetDays}d)</span>
                    </td>

                    {/* Delta vs Target */}
                    <td className="py-3.5 px-3 text-center font-black border-r border-slate-100 dark:border-slate-800/80">
                      <span className={`font-mono ${
                        isPositiveDelta 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-[#DC2626] dark:text-rose-400'
                      }`}>
                        {deltaFormatted}
                      </span>
                    </td>

                    {/* Breaks used / limit */}
                    <td className="py-3.5 px-3 text-center font-semibold border-r border-slate-100 dark:border-slate-800/80">
                      <span className={isOverBreak ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {member.breaksUsedMins.toFixed(0)}/{member.breakLimitMins}m
                      </span>
                    </td>

                    {/* Target vs Actual Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent >= 100 
                                ? 'bg-emerald-500' 
                                : percent >= 50 
                                ? 'bg-[#2F6798]' 
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={`w-9 text-right font-mono font-bold text-xs ${
                          percent >= 100 ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {percent}%
                        </span>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Footer Legend matching exact requirements */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>🎯 Target = 8 hours net work/day.</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>☕ Break limit = 1h 30m/day (Lunch 1h + 1st Break 15m + 2nd Break 15m).</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            Day cells: <span className="text-emerald-600 font-bold">green</span> = reached 8h • <span className="text-amber-600 font-bold">amber</span> = partial/under • <span className="text-slate-400">empty</span> = no punches. <span className="text-rose-600 font-bold">red Breaks</span> = over limit.
          </div>
        </div>

      </div>

    </div>
  );
}
