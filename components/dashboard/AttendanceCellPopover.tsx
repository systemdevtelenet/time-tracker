'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { AttendanceStatus } from './AttendanceCalendarTab';

interface AttendanceCellPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId?: string;
  position?: string;
  account?: string;
  dayNumber: number;
  monthName: string;
  year: number;
  currentStatus: AttendanceStatus;
  currentNote?: string;
  onSelectStatus: (newStatus: AttendanceStatus, note?: string) => void;
  onOpenFullBreakdown?: (dayNumber: number, employeeName?: string) => void;
}

export default function AttendanceCellPopover({
  isOpen,
  onClose,
  employeeName,
  employeeId,
  position = 'Trainer',
  account = 'TRAINING',
  dayNumber,
  monthName,
  year,
  currentStatus,
  currentNote = '',
  onSelectStatus,
  onOpenFullBreakdown,
}: AttendanceCellPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteText, setNoteText] = useState(currentNote);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus);
    setNoteText(currentNote || '');
    setIsNoteInputOpen(false);
  }, [currentStatus, currentNote, isOpen, dayNumber, employeeName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortMonth = monthName.slice(0, 3);
  const subtitle = `${shortMonth} ${dayNumber}, ${year} · ${account.toUpperCase()} – ${position}`;

  const handleStatusClick = (status: AttendanceStatus) => {
    setSelectedStatus(status);
    onSelectStatus(status, noteText);
    onClose();
  };

  const handleSaveNote = () => {
    onSelectStatus(selectedStatus, noteText);
    setIsNoteInputOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={popoverRef}
        className="w-full max-w-[310px] bg-white dark:bg-[#101D3D] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 space-y-3.5 animate-in zoom-in-95 fade-in duration-150 text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
              {employeeName}
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Option Buttons */}
        <div className="space-y-1">
          {/* P - Present */}
          <button
            type="button"
            onClick={() => handleStatusClick('P')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              selectedStatus === 'P'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 ring-1.5 ring-emerald-500/40'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-[#d1fae5] text-[#065f46] dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px] flex items-center justify-center shadow-2xs">
                P
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                P – Present
              </span>
            </div>
            {selectedStatus === 'P' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />}
          </button>

          {/* L - Late */}
          <button
            type="button"
            onClick={() => handleStatusClick('L')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              selectedStatus === 'L'
                ? 'bg-amber-50 dark:bg-amber-950/50 ring-1.5 ring-amber-500/40'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-[#fef3c7] text-[#92400e] dark:bg-amber-950 dark:text-amber-300 font-extrabold text-[11px] flex items-center justify-center shadow-2xs">
                L
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                L – Late
              </span>
            </div>
            {selectedStatus === 'L' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.5]" />}
          </button>

          {/* U - Undertime */}
          <button
            type="button"
            onClick={() => handleStatusClick('U')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              selectedStatus === 'U'
                ? 'bg-orange-50 dark:bg-orange-950/50 ring-1.5 ring-orange-500/40'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-[#ffedd5] text-[#9a3412] dark:bg-orange-950 dark:text-orange-300 font-extrabold text-[11px] flex items-center justify-center shadow-2xs">
                U
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                U – Undertime
              </span>
            </div>
            {selectedStatus === 'U' && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5]" />}
          </button>

          {/* A - Absent */}
          <button
            type="button"
            onClick={() => handleStatusClick('A')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              selectedStatus === 'A'
                ? 'bg-rose-50 dark:bg-rose-950/50 ring-1.5 ring-rose-500/40'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-[#ffe4e6] text-[#9f1239] dark:bg-rose-950 dark:text-rose-300 font-extrabold text-[11px] flex items-center justify-center shadow-2xs">
                A
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                A – Absent
              </span>
            </div>
            {selectedStatus === 'A' && <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2.5]" />}
          </button>

          {/* RD - Rest Day */}
          <button
            type="button"
            onClick={() => handleStatusClick('RD')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              selectedStatus === 'RD'
                ? 'bg-slate-100 dark:bg-slate-800 ring-1.5 ring-slate-400/50'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-extrabold text-[10px] flex items-center justify-center shadow-2xs border border-slate-200/80 dark:border-slate-700">
                RD
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                RD – Rest Day
              </span>
            </div>
            {selectedStatus === 'RD' && <Check className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-[2.5]" />}
          </button>

          {/* Clear Tag */}
          <button
            type="button"
            onClick={() => handleStatusClick(null)}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              selectedStatus === null
                ? 'bg-slate-100 dark:bg-slate-800 ring-1.5 ring-slate-400/40'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center justify-center shadow-2xs">
                ✕
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Clear Tag
              </span>
            </div>
            {selectedStatus === null && <Check className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2.5]" />}
          </button>
        </div>

        {/* Reason Note Section */}
        {isNoteInputOpen ? (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Reason / Justification Note:
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Approved leave, Medical certificate submitted, Overtime cover..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#2F6798]/30 resize-none font-sans"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNoteInputOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3 py-1 rounded-lg bg-[#2F6798] hover:bg-[#25547c] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
            {noteText && (
              <div className="mb-2 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{noteText}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsNoteInputOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#2F6798] hover:bg-[#24537c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{noteText ? 'Edit Reason Note' : '+ Add Reason Note'}</span>
            </button>

            {onOpenFullBreakdown && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullBreakdown(dayNumber, employeeName);
                }}
                className="w-full mt-2 py-1.5 px-2 text-center text-[11px] font-semibold text-[#2F6798] hover:text-[#1d4b72] dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full Day Breakdown</span>
                <span className="text-xs">→</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
