'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown } from 'lucide-react';

interface DatePickerPopoverProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

const MONTH_NAMES = [
  'September', 'October', 'November', 'December',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August'
].sort((a, b) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months.indexOf(a) - months.indexOf(b);
});

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function DatePickerPopover({
  selectedDate: initialSelectedDate,
  onSelectDate,
}: DatePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => initialSelectedDate || new Date());
  const [viewMonth, setViewMonth] = useState<number>(() => (initialSelectedDate || new Date()).getMonth());
  const [viewYear, setViewYear] = useState<number>(() => (initialSelectedDate || new Date()).getFullYear());
  const [currentTime, setCurrentTime] = useState<string>('');
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Dynamic Year range: starts from 1990 up to 2031, plus 5 years auto-added when reaching or passing 2031
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const dynamicMaxYear = Math.max(2031, currentYear + 5, viewYear + 5);
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

  // Live real-time clock update
  useEffect(() => {
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
  }, []);

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
  const calendarCells = React.useMemo(() => {
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
    if (onSelectDate) onSelectDate(selectedDate);
    setIsOpen(false);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Pill displaying Date + Live Time + Chevron Down */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMonthDropdownOpen(false);
          setIsYearDropdownOpen(false);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#434142] bg-white dark:bg-[#363435] hover:bg-slate-50 dark:hover:bg-[#2C2A2B] text-slate-800 dark:text-[#F8F8F6] text-xs font-bold shadow-2xs transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#F8F8F6]">
          <CalendarIcon className="w-3.5 h-3.5 text-[#3678B0]" />
          <span>
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <span className="text-slate-300 dark:text-[#434142] font-normal">|</span>
        <div className="flex items-center gap-1 text-[#3678B0] dark:text-[#3678B0] font-sans text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-[#3678B0] dark:text-[#3678B0]" />
          <span>{currentTime || '--:--:--'}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[330px] p-5 rounded-3xl bg-white dark:bg-[#363435] border border-slate-200 dark:border-[#434142] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          
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
                        ? 'border-slate-800 dark:border-[#434142] ring-1 ring-slate-800 dark:ring-[#434142]'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-[#434142]'
                    }`}
                  >
                    <span>{MONTH_NAMES[viewMonth]}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
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
                        ? 'border-slate-800 dark:border-[#434142] ring-1 ring-slate-800 dark:ring-[#434142]'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-[#434142]'
                    }`}
                  >
                    <span>{viewYear}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
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

          {/* Live Actual Time Today Bar (Above Confirm Button) */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#272626] border border-slate-200/80 dark:border-[#434142] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#94A3B8] text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-[#3678B0]" />
              <span>Time Today</span>
            </div>
            <span className="font-sans font-bold text-xs text-[#3678B0] dark:text-[#3678B0]">
              {currentTime || '--:--:--'}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3678B0] hover:bg-[#2b6290] active:bg-[#224e73] text-white text-xs font-black shadow-md transition-all cursor-pointer text-center"
          >
            Confirm
          </button>

        </div>
      )}
    </div>
  );
}
