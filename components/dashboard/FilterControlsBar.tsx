import React from 'react';
import { Calendar, Building, Search, Clock } from 'lucide-react';
import { AccountOption } from '@/lib/types';

interface FilterControlsBarProps {
  quarter: string;
  onQuarterChange: (q: string) => void;
  month: string;
  onMonthChange: (m: string) => void;
  account: string;
  onAccountChange: (a: string) => void;
  searchTerm: string;
  onSearchChange: (s: string) => void;
  accounts?: AccountOption[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function FilterControlsBar({
  quarter,
  onQuarterChange,
  month,
  onMonthChange,
  account,
  onAccountChange,
  searchTerm,
  onSearchChange,
  accounts = [],
}: FilterControlsBarProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Quarter Dropdown */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#2F6798]" /> QUARTER FILTER
          </label>
          <div className="relative">
            <select
              value={quarter}
              onChange={(e) => onQuarterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30 appearance-none"
            >
              <option value="ALL">All Quarters</option>
              <option value="Q1">Q1 (Jan - Mar)</option>
              <option value="Q2">Q2 (Apr - Jun)</option>
              <option value="Q3">Q3 (Jul - Sep)</option>
              <option value="Q4">Q4 (Oct - Dec)</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ⌵
            </span>
          </div>
        </div>

        {/* Month Dropdown */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2F6798]" /> MONTH FILTER
          </label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30 appearance-none"
            >
              <option value="ALL">All Months</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ⌵
            </span>
          </div>
        </div>

        {/* Client Account Dropdown */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#2F6798]" /> CLIENT ACCOUNT FILTER
          </label>
          <div className="relative">
            <select
              value={account}
              onChange={(e) => onAccountChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30 appearance-none"
            >
              <option value="ALL">All Client Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.account_id || acc.account_code} value={acc.account_code}>
                  {acc.account_code} {acc.account_name ? `- ${acc.account_name}` : ''}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ⌵
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#2F6798]" /> SEARCH TRAINERS / SHIFT LOGS
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Type trainer name, account, or shift summary..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2F6798]/30 transition-all"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
