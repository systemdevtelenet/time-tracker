'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerPopoverProps {
  selectedDate?: Date | string | null;
  onSelectDate?: (date: Date, dateString: string) => void;
  format?: 'date' | 'month-year' | 'with-time' | 'short';
  showTime?: boolean;
  showArrows?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseDateInput(input?: Date | string | null): Date {
  if (!input) return new Date();
  if (input instanceof Date) return isNaN(input.getTime()) ? new Date() : input;
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    }
    const d = new Date(input);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerPopover({
  selectedDate: initialSelectedDate,
  onSelectDate,
  format,
  showTime,
  showArrows = false,
  align = 'right',
  className = '',
}: DatePickerPopoverProps) {
  // Determine display mode
  const effectiveFormat = useMemo(() => {
    if (format) return format;
    if (showTime === true) return 'with-time';
    if (showTime === false) return 'date';
    return 'with-time'; // Default for TopNav backwards compatibility
  }, [format, showTime]);

  const [isOpen, setIsOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => parseDateInput(initialSelectedDate));
  const [viewMonth, setViewMonth] = useState<number>(() => parseDateInput(initialSelectedDate).getMonth());
  const [viewYear, setViewYear] = useState<number>(() => parseDateInput(initialSelectedDate).getFullYear());
  const [currentTime, setCurrentTime] = useState<string>('');

  const popoverRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Sync state if initialSelectedDate prop changes externally
  useEffect(() => {
    if (initialSelectedDate !== undefined && initialSelectedDate !== null) {
      const parsed = parseDateInput(initialSelectedDate);
      setSelectedDate(parsed);
      setViewMonth(parsed.getMonth());
      setViewYear(parsed.getFullYear());
    }
  }, [initialSelectedDate]);

  // Dynamic Year range: 1990 up to currentYear + 5 or viewYear + 5
  const years = useMemo(() => {
    const curYear = new Date().getFullYear();
    const dynamicMaxYear = Math.max(2031, curYear + 5, viewYear + 5);
    const startYear = 1990;
    const list: number[] = [];
    for (let y = startYear; y <= dynamicMaxYear; y++) {
      list.push(y);
    }
    return list;
  }, [viewYear]);

  // Scroll active year into view when year dropdown opens
  useEffect(() => {
    if (isYearDropdownOpen && yearListRef.current) {
      const activeEl = yearListRef.current.querySelector('[data-active-year="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isYearDropdownOpen]);

  // Live real-time clock update (only needed if format is 'with-time')
  useEffect(() => {
    if (effectiveFormat !== 'with-time') return;
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [effectiveFormat]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMonthDropdownOpen(false);
        setIsYearDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Generate calendar days for current viewMonth/viewYear
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      day: number;
      isCurrentMonth: boolean;
      date: Date;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(viewYear, viewMonth - 1, dayNum);
      cells.push({
        day: dayNum,
        isCurrentMonth: false,
        date,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const isToday =
        today.getDate() === d &&
        today.getMonth() === viewMonth &&
        today.getFullYear() === viewYear;
      const isSelected =
        selectedDate.getDate() === d &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getFullYear() === viewYear;

      cells.push({
        day: d,
        isCurrentMonth: true,
        date,
        isToday,
        isSelected,
      });
    }

    // Next month padding days to complete rows (multiple of 7)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = (totalCells < 35 ? 35 : totalCells) - cells.length;
    for (let nextD = 1; nextD <= remaining; nextD++) {
      const date = new Date(viewYear, viewMonth + 1, nextD);
      cells.push({
        day: nextD,
        isCurrentMonth: false,
        date,
        isToday: false,
        isSelected: false,
      });
    }

    return cells;
  }, [viewMonth, viewYear, selectedDate]);

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setViewMonth(date.getMonth());
    setViewYear(date.getFullYear());
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (onSelectDate) onSelectDate(selectedDate, formatDateToIso(selectedDate));
    setIsOpen(false);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  // Step navigation (Prev / Next arrow handlers)
  const handleStepPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveFormat === 'month-year') {
      const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const newYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const newDate = new Date(newYear, newMonth, 1);
      setViewMonth(newMonth);
      setViewYear(newYear);
      setSelectedDate(newDate);
      if (onSelectDate) onSelectDate(newDate, formatDateToIso(newDate));
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
      setViewMonth(newDate.getMonth());
      setViewYear(newDate.getFullYear());
      if (onSelectDate) onSelectDate(newDate, formatDateToIso(newDate));
    }
  };

  const handleStepNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveFormat === 'month-year') {
      const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const newYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const newDate = new Date(newYear, newMonth, 1);
      setViewMonth(newMonth);
      setViewYear(newYear);
      setSelectedDate(newDate);
      if (onSelectDate) onSelectDate(newDate, formatDateToIso(newDate));
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
      setViewMonth(newDate.getMonth());
      setViewYear(newDate.getFullYear());
      if (onSelectDate) onSelectDate(newDate, formatDateToIso(newDate));
    }
  };

  // Render trigger text depending on effective format
  const renderTriggerText = () => {
    if (effectiveFormat === 'month-year') {
      return `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    }
    if (effectiveFormat === 'short') {
      return formatDateToIso(selectedDate);
    }
    return selectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      {/* Outer wrapper with optional quick-step arrow buttons */}
      <div className="flex items-center gap-1.5">
        {showArrows && (
          <button
            type="button"
            onClick={handleStepPrev}
            className="p-1.5 rounded-lg bg-white dark:bg-[#363435] hover:bg-slate-100 dark:hover:bg-[#434142] text-slate-700 dark:text-[#F8F8F6] text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center border border-slate-200/80 dark:border-[#434142]"
            title={effectiveFormat === 'month-year' ? 'Previous Month' : 'Previous Day'}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Trigger Pill displaying Date + Live Time + Chevron Down */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMonthDropdownOpen(false);
            setIsYearDropdownOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#434142] bg-white dark:bg-[#363435] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] text-slate-800 dark:text-[#F8F8F6] text-xs font-bold shadow-2xs transition-all cursor-pointer group select-none"
        >
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#F8F8F6]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#3678B0]" />
            <span className="font-bold">{renderTriggerText()}</span>
          </div>

          {effectiveFormat === 'with-time' && (
            <>
              <span className="text-slate-300 dark:text-[#434142] font-normal">|</span>
              <div className="flex items-center gap-1 text-[#3678B0] dark:text-[#3678B0] font-sans text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#3678B0] dark:text-[#3678B0]" />
                <span>{currentTime || '--:--:--'}</span>
              </div>
            </>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showArrows && (
          <button
            type="button"
            onClick={handleStepNext}
            className="p-1.5 rounded-lg bg-white dark:bg-[#363435] hover:bg-slate-100 dark:hover:bg-[#434142] text-slate-700 dark:text-[#F8F8F6] text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center border border-slate-200/80 dark:border-[#434142]"
            title={effectiveFormat === 'month-year' ? 'Next Month' : 'Next Day'}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 w-[330px] p-5 rounded-3xl bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none ${
            align === 'left' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
          }`}
        >
          {/* Header Area */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              {/* Bold Month and Day Title */}
              <h3 className="text-xl font-black text-slate-900 dark:text-[#F8F8F6] tracking-tight leading-tight">
                {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}
              </h3>

              {/* Custom Month and Year Dropdown Controls */}
              <div className="flex items-center gap-2 mt-2">
                {/* 1. Custom Month Dropdown */}
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMonthDropdownOpen(!isMonthDropdownOpen);
                      setIsYearDropdownOpen(false);
                    }}
                    className={`px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#272626] text-xs font-bold text-slate-800 dark:text-[#F8F8F6] flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isMonthDropdownOpen
                        ? 'border-[#3678B0] ring-1 ring-[#3678B0]'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-[#434142]'
                    }`}
                  >
                    <span>{MONTH_NAMES[viewMonth]}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-500 transition-transform ${
                        isMonthDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Month Popup List */}
                  {isMonthDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-60 w-36 py-2 px-1.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-100 dark:border-[#434142] shadow-2xl max-h-52 overflow-y-auto animate-in fade-in zoom-in-95">
                      {MONTH_NAMES.map((m, idx) => {
                        const isSelectedMonth = idx === viewMonth;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setViewMonth(idx);
                              setIsMonthDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                              isSelectedMonth
                                ? 'bg-blue-50 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0] font-extrabold'
                                : 'text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#2C2A2B] hover:text-[#2F6798]'
                            }`}
                          >
                            <span>{m}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Custom Year Dropdown */}
                <div className="relative" ref={yearDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsYearDropdownOpen(!isYearDropdownOpen);
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#272626] text-xs font-bold text-slate-800 dark:text-[#F8F8F6] flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isYearDropdownOpen
                        ? 'border-[#3678B0] ring-1 ring-[#3678B0]'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-[#434142]'
                    }`}
                  >
                    <span>{viewYear}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-500 transition-transform ${
                        isYearDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Year Popup List */}
                  {isYearDropdownOpen && (
                    <div
                      ref={yearListRef}
                      className="absolute left-0 top-full mt-1.5 z-60 w-28 py-2 px-1.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-100 dark:border-[#434142] shadow-2xl max-h-52 overflow-y-auto animate-in fade-in zoom-in-95"
                    >
                      {years.map((y) => {
                        const isSelectedYear = y === viewYear;
                        return (
                          <button
                            key={y}
                            type="button"
                            data-active-year={isSelectedYear ? 'true' : 'false'}
                            onClick={() => {
                              setViewYear(y);
                              setIsYearDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                              isSelectedYear
                                ? 'bg-blue-50 dark:bg-[#1D2433] text-[#2F6798] dark:text-[#3678B0] font-extrabold'
                                : 'text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#2C2A2B] hover:text-[#2F6798]'
                            }`}
                          >
                            <span>{y}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Blue Calendar Icon Card with Year & Binder Rings */}
            <div className="relative pt-1">
              {/* Binder Rings */}
              <div className="absolute top-0 left-2.5 w-1.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full z-10" />
              <div className="absolute top-0 right-2.5 w-1.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full z-10" />

              {/* Blue Card Body */}
              <div className="w-12 h-12 rounded-2xl bg-[#2F6798] flex items-center justify-center text-white font-black text-xs shadow-md mt-1">
                {viewYear}
              </div>
            </div>
          </div>

          {/* Days of the Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map((d, i) => (
              <span
                key={i}
                className="text-[10px] font-black text-[#2F6798] dark:text-blue-400 tracking-wider py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {calendarCells.map((cell, idx) => {
              const formattedDay = cell.day.toString().padStart(2, '0');

              if (!cell.isCurrentMonth) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(cell.date)}
                    className="h-8 w-8 mx-auto flex items-center justify-center text-xs font-medium text-slate-300 dark:text-[#94A3B8]/40 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    {formattedDay}
                  </button>
                );
              }

              if (cell.isSelected) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(cell.date)}
                    className="h-8 w-8 mx-auto rounded-full bg-[#3678B0] text-white flex items-center justify-center text-xs font-black shadow-md cursor-pointer scale-105 transition-transform"
                  >
                    {formattedDay}
                  </button>
                );
              }

              if (cell.isToday) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(cell.date)}
                    className="h-8 w-8 mx-auto rounded-full border-2 border-[#3678B0] text-[#3678B0] dark:text-[#3678B0] flex items-center justify-center text-xs font-black hover:bg-[#3678B0]/10 transition-colors cursor-pointer"
                  >
                    {formattedDay}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.date)}
                  className="h-8 w-8 mx-auto rounded-full text-xs font-bold text-slate-800 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#2C2A2B] transition-colors cursor-pointer"
                >
                  {formattedDay}
                </button>
              );
            })}
          </div>

          {/* Time / Mode Today Bar */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#272626] border border-slate-200/80 dark:border-[#434142] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#94A3B8] text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-[#3678B0]" />
              <span>Selected Date</span>
            </div>
            <span className="font-sans font-bold text-xs text-[#3678B0] dark:text-[#3678B0]">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3678B0] hover:bg-[#2b6290] active:bg-[#224e73] text-white text-xs font-black shadow-md transition-all cursor-pointer text-center"
          >
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
}
