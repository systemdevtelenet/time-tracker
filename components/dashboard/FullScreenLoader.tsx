'use client';

import React from 'react';

interface FullScreenLoaderProps {
  activeTab?: string;
  customTitle?: string;
  customSubtitle?: string;
}

export default function FullScreenLoader({
  activeTab = 'dashboard',
  customTitle,
  customSubtitle,
}: FullScreenLoaderProps) {
  const getLoadingDetails = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Loading Dashboard Data...',
          subtitle: 'Retrieving operational metrics and executive KPIs',
        };
      case 'tracker':
        return {
          title: 'Loading Time Tracking...',
          subtitle: 'Synchronizing live shift logs, timer states, and punch records',
        };
      case 'flowhub':
        return {
          title: 'Loading Flow Hub...',
          subtitle: 'Initializing Focus Studio tasks, habits, and sessions',
        };
      case 'attendance':
        return {
          title: 'Loading Attendance & Roster...',
          subtitle: 'Fetching employee profiles, schedules, and reliability status',
        };
      case 'analytics':
        return {
          title: 'Loading Analytics & Insights...',
          subtitle: 'Generating performance distributions and duration breakdowns',
        };
      case 'settings':
        return {
          title: 'Loading Settings...',
          subtitle: 'Loading workforce portal preferences and configurations',
        };
      default:
        return {
          title: 'Loading Workforce Portal...',
          subtitle: 'Connecting to Cebu Tele-Net Database',
        };
    }
  };

  const details = getLoadingDetails();
  const title = customTitle || details.title;
  const subtitle = customSubtitle || details.subtitle;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#272626] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center max-w-md space-y-4">
        
        {/* Animated Modern Ring Spinner matching screenshot */}
        <div className="relative w-12 h-12">
          {/* Subtle background circle */}
          <div className="w-12 h-12 rounded-full border-[3px] border-slate-100 dark:border-[#434142]" />
          {/* Active spinning arc in brand blue #3678B0 */}
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-[3px] border-transparent border-t-[#2F6798] dark:border-t-[#3678B0] animate-spin" />
        </div>

        {/* Loading Text & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

      </div>
    </div>
  );
}
