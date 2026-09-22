'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { AccountOption, PhoneTimeRecord } from '@/lib/types';
import { getTodayFormatted } from '@/lib/utils';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgent: string;
  accounts: AccountOption[];
  onRecordAdded: (record: PhoneTimeRecord) => void;
}

export default function ManualEntryModal({
  isOpen,
  onClose,
  currentAgent,
  accounts,
  onRecordAdded,
}: ManualEntryModalProps) {
  const [dateOfShift, setDateOfShift] = useState<string>(getTodayFormatted());
  const [name, setName] = useState<string>(currentAgent || '');
  const [account, setAccount] = useState<string>('DFT');
  const [minutes, setMinutes] = useState<string>('15');
  const [seconds, setSeconds] = useState<string>('0');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [tagging, setTagging] = useState<string>('General Inquiry');
  const [summary, setSummary] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSummaryError(null);
    setDurationError(null);
    setNameError(null);

    let hasError = false;

    if (!name.trim()) {
      setNameError('Employee name is required.');
      hasError = true;
    }

    const minsNum = parseInt(minutes, 10) || 0;
    const secsNum = parseInt(seconds, 10) || 0;

    if (minsNum === 0 && secsNum === 0) {
      setDurationError('Please enter a duration of at least 1 second.');
      hasError = true;
    }

    if (!summary.trim()) {
      setSummaryError('Summary and notes are required.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    const totalMinutesFormatted =
      minsNum > 0
        ? `${minsNum} minutes, ${secsNum} seconds`
        : `${secsNum} seconds`;

    const payload: PhoneTimeRecord = {
      date_of_shift: dateOfShift,
      name: name.trim() || currentAgent || 'Anonymous Agent',
      account: account || 'DFT',
      total_minutes: totalMinutesFormatted,
      ticket_number: ticketNumber.trim() || Math.random().toString(16).substring(2, 10),
      tagging: tagging.trim() || 'General',
      summary: summary.trim(),
    };

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to save manual log.');
      }

      onRecordAdded(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving manual entry:', err);
      setSummaryError(err.message || 'Error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-[#2F6798]/10 dark:bg-[#2F6798]/20 text-[#2F6798] dark:text-[#5fa5de]">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Manual Shift &amp; Task Entry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log an off-schedule task, training session, or historical shift record.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Shift Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Shift Date
              </label>
              <input
                type="text"
                value={dateOfShift}
                onChange={(e) => setDateOfShift(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2F6798]"
                required
              />
            </div>

            {/* Employee Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. Matt Riner Balaba"
                className={`w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none ${
                  nameError 
                    ? 'border border-[#EF4444] text-[#EF4444]' 
                    : 'border border-slate-200 dark:border-slate-700 focus:border-[#2F6798]'
                }`}
                required
              />
              {nameError && (
                <p className="text-xs text-[#EF4444] mt-1 font-normal">
                  {nameError}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Department / Account */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Department / Account
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2F6798]"
              >
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <option key={acc.account_id || acc.account_code} value={acc.account_code}>
                      {acc.account_name} ({acc.account_code})
                    </option>
                  ))
                ) : (
                  <option value="Corporate">Corporate Training</option>
                )}
              </select>
            </div>

            {/* Task / Activity Code */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Task / Activity Code
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="e.g. act-84920"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2F6798]"
              />
            </div>
          </div>

          {/* Task Duration */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Task Duration
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="480"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    if (durationError) setDurationError(null);
                  }}
                  className={`w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none ${
                    durationError 
                      ? 'border border-[#EF4444] text-[#EF4444]' 
                      : 'border border-slate-200 dark:border-slate-700 focus:border-[#2F6798]'
                  }`}
                />
                <span className="text-xs text-slate-500 font-medium">Minutes</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => {
                    setSeconds(e.target.value);
                    if (durationError) setDurationError(null);
                  }}
                  className={`w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none ${
                    durationError 
                      ? 'border border-[#EF4444] text-[#EF4444]' 
                      : 'border border-slate-200 dark:border-slate-700 focus:border-[#2F6798]'
                  }`}
                />
                <span className="text-xs text-slate-500 font-medium">Seconds</span>
              </div>
            </div>
            {durationError && (
              <p className="text-xs text-[#EF4444] mt-1 font-normal">
                {durationError}
              </p>
            )}
          </div>

          {/* Activity Categories / Tagging */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Activity Categories / Tagging
            </label>
            <input
              type="text"
              value={tagging}
              onChange={(e) => setTagging(e.target.value)}
              placeholder="e.g. Training Session, Coaching, Calibration"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2F6798]"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Summary &amp; Notes
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (summaryError) setSummaryError(null);
              }}
              placeholder="Enter shift notes or task details..."
              className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none resize-none ${
                summaryError 
                  ? 'border border-[#EF4444] text-[#EF4444]' 
                  : 'border border-slate-200 dark:border-slate-700 focus:border-[#2F6798]'
              }`}
              required
            />
            {summaryError && (
              <p className="text-xs text-[#EF4444] mt-1 font-normal">
                {summaryError}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold shadow-md shadow-[#2F6798]/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Manual Record'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
