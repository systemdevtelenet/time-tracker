'use client';

import React, { useState } from 'react';
import { X, Settings, Bell, Moon, Shield, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
}: SettingsModalProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#111C3D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F6798] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Workforce Portal Settings
              </h3>
              <p className="text-xs text-slate-500">
                Supervisor Roster & Notification Preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Auto-Refresh Live Roster
              </span>
              <span className="text-[11px] text-slate-500">
                Synchronize punches every 10 seconds
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 accent-[#2F6798] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Over-Break Sound Alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Notify when lunch/break exceeds 60/15 minutes
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#2F6798] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Traffic Light Status Warnings
              </span>
              <span className="text-[11px] text-slate-500">
                Flag agent adherence as YELLOW or RED
              </span>
            </div>
            <input
              type="checkbox"
              checked={trafficAlerts}
              onChange={(e) => setTrafficAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#2F6798] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Dark Mode Theme
              </span>
              <span className="text-[11px] text-slate-500">
                Toggle dark UI palette
              </span>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] cursor-pointer"
            >
              {isDark ? 'Dark Active' : 'Light Active'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
