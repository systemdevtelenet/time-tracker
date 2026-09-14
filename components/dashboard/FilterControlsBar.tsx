'use client';

import React from 'react';
import { Calendar, Building, Search, Filter } from 'lucide-react';

interface FilterControlsBarProps {
  quarter: string;
  onQuarterChange: (q: string) => void;
  month: string;
  onMonthChange: (m: string) => void;
  account: string;
  onAccountChange: (a: string) => void;
  searchTerm: string;
  onSearchChange: (s: string) => void;
}

export default function FilterControlsBar({
  quarter,
  onQuarterChange,
  month,
  onMonthChange,
  account,
  onAccountChange,
  searchTerm,
  onSearchChange,
}: FilterControlsBarProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs my-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Quarter Dropdown */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#2F6798]" /> QUARTER
          </label>
          <div className="relative">
            <select
              value={quarter}
              onChange={(e) => onQuarterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30 appearance-none"
            >
              <option value="all">All Quarters</option>
              <option value="q1">Q1 (Jan - Mar)</option>
              <option value="q2">Q2 (Apr - Jun)</option>
              <option value="q3">Q3 (Jul - Sep)</option>
              <option value="q4">Q4 (Oct - Dec)</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ⌵
            </span>
          </div>
        </div>

        {/* Month Dropdown */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#2F6798]" /> MONTH
          </label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30 appearance-none"
            >
              <option value="all">All Months</option>
              <option value="sep">September 2026</option>
              <option value="aug">August 2026</option>
              <option value="jul">July 2026</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ⌵
            </span>
          </div>
        </div>

        {/* Client Account Dropdown */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Building className="w-3 h-3 text-[#2F6798]" /> CLIENT ACCOUNT
          </label>
          <div className="relative">
            <select
              value={account}
              onChange={(e) => onAccountChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30 appearance-none"
            >
              <option value="all">All Client Accounts</option>
              <option value="corporate">Corporate</option>
              <option value="dft">DFT</option>
              <option value="fleet">FLEET</option>
              <option value="xpn">XPN</option>
              <option value="rm">RM</option>
              <option value="bf">BF</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ⌵
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Search className="w-3 h-3 text-[#2F6798]" /> SEARCH TRAINEE / BATCH / TRAINER
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Type name or batch..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2F6798]/30 transition-all"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
