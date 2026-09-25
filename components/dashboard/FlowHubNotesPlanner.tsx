'use client';

import React, { useState } from 'react';
import { 
  Pin, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  Edit3, 
  FileCheck2, 
  Save 
} from 'lucide-react';
import ConfirmActionModal from './ConfirmActionModal';

interface AttendanceStickyNote {
  id: string;
  title: string;
  content: string;
  color: 'blue' | 'yellow' | 'green' | 'rose' | 'slate';
  tag: 'Late Arrival' | 'Meal Coverage' | 'Shift Swap' | 'Overtime Flag' | 'Missing Punch' | 'Approved Leave';
  isPinned: boolean;
  timestamp: string;
}

export default function FlowHubNotesPlanner() {
  const [activeTab, setActiveTab] = useState<'stickies' | 'memo'>('stickies');

  // 1. Attendance Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState<AttendanceStickyNote[]>([
    {
      id: 's1',
      title: 'Auto-Capped Punch-Out Verification',
      content: 'Shift end duration auto-capped to 8.0 hrs regular for unclosed 06:00 AM punch-out. Verified by Head of Training.',
      color: 'yellow',
      tag: 'Missing Punch',
      isPinned: true,
      timestamp: '09:42 PM',
    },
    {
      id: 's2',
      title: 'Meal / Lunch Break Coverage',
      content: 'Badz covered Neil\'s 1-hour lunch period from 04:47 AM to 05:47 AM on ONO account.',
      color: 'blue',
      tag: 'Meal Coverage',
      isPinned: true,
      timestamp: '04:50 AM',
    },
    {
      id: 's3',
      title: 'Schedule Swap — Fleet Account',
      content: 'Charles Espinosa approved for 8.0 hrs shift coverage on Fleet queue. Attendance logged and verified.',
      color: 'green',
      tag: 'Shift Swap',
      isPinned: true,
      timestamp: 'Yesterday',
    },
    {
      id: 's4',
      title: 'Rain Grace Period Approval',
      content: 'Matt Riner Balaba - 15 min weather delay arrival approved under company typhoon/rain grace period policy.',
      color: 'rose',
      tag: 'Late Arrival',
      isPinned: false,
      timestamp: 'Sep 24',
    },
  ]);

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'blue' | 'yellow' | 'green' | 'rose'>('blue');
  const [newNoteTag, setNewNoteTag] = useState<AttendanceStickyNote['tag']>('Late Arrival');
  const [isAddingSticky, setIsAddingSticky] = useState(false);
  const [stickyToDelete, setStickyToDelete] = useState<string | null>(null);

  // 2. Attendance Shift Memo State
  const [memoTitle, setMemoTitle] = useState('Daily Shift Attendance & Adherence Memo');
  const [memoText, setMemoText] = useState(
    `CEBU TELE-NET OPERATIONS — DAILY ATTENDANCE SUMMARY
Date of Shift: September 25, 2026
Shift Window: 9:00 PM to 6:00 AM
Supervisor / Head of Training: Nissi-Jeh Reguero

1. PUNCTUALITY & ATTENDANCE COMPLIANCE:
• Total Active Roster: 13 Members
• Verified Shifts Logged: 10 Shifts
• On-Time Punctuality Rate: 100% (No unexcused tardiness)

2. BREAK & MEAL ADHERENCE:
• 1st & 2nd Paid Breaks (15m): 100% compliance across all trainers.
• 1-Hour Meal / Lunch: All lunch periods properly recorded.

3. SCHEDULE OVERRIDES & COVERAGE:
• Charles Espinosa covered 8.0 hrs on Fleet Queue.
• Badz covered 1.0 hr lunch coverage on ONO account.

4. END-OF-SHIFT PUNCH VALIDATION:
• All shift logs verified against Cebu Tele-Net Attendance Audit Trail.`
  );
  const [isSavedMemo, setIsSavedMemo] = useState(false);
  const [isCopiedMemo, setIsCopiedMemo] = useState(false);

  // Handlers
  const handleAddStickyNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    setStickyNotes(prev => [
      {
        id: Date.now().toString(),
        title: newNoteTitle.trim() || 'Attendance Note',
        content: newNoteContent.trim(),
        color: newNoteColor,
        tag: newNoteTag,
        isPinned: false,
        timestamp: 'Just now',
      },
      ...prev
    ]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingSticky(false);
  };

  const handleDeleteSticky = (id: string) => {
    setStickyNotes(prev => prev.filter(s => s.id !== id));
  };

  const handleTogglePinSticky = (id: string) => {
    setStickyNotes(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const handleSaveMemo = () => {
    setIsSavedMemo(true);
    setTimeout(() => setIsSavedMemo(false), 2000);
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoText);
    setIsCopiedMemo(true);
    setTimeout(() => setIsCopiedMemo(false), 2500);
  };

  const getStickyColorClasses = (color: AttendanceStickyNote['color']) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100';
      case 'green':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100';
      case 'yellow':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100';
      case 'blue':
      default:
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100';
    }
  };

  const getTagBadgeClass = (tag: AttendanceStickyNote['tag']) => {
    switch (tag) {
      case 'Late Arrival':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200';
      case 'Meal Coverage':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200';
      case 'Shift Swap':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200';
      case 'Missing Punch':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
      case 'Overtime Flag':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200';
      case 'Approved Leave':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col space-y-4 p-5 sm:p-6">
      
      {/* 1. Header Bar: Title + Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2F6798]/15 text-[#2F6798] dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center shadow-2xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Shift Attendance &amp; Planning Studio
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Attendance exception flags &amp; audit shift memo
          </p>
        </div>

        {/* 2 Focused Attendance Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          
          <button
            type="button"
            onClick={() => setActiveTab('stickies')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stickies'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Attendance Flags &amp; Notes ({stickyNotes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memo')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'memo'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Daily Attendance Memo</span>
          </button>

        </div>

      </div>

      {/* 2. TAB 1: ATTENDANCE STICKY NOTES & EXCEPTION FLAGS */}
      {activeTab === 'stickies' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Active Attendance Flags ({stickyNotes.length})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                {stickyNotes.filter(s => s.isPinned).length} Pinned
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingSticky(!isAddingSticky)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#24537D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingSticky ? 'Cancel Note' : 'Add Attendance Note'}</span>
            </button>
          </div>

          {/* Add Note Form */}
          {isAddingSticky && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Create New Attendance Exception Note
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g. Approved Lateness, Lunch Swap)..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#2F6798]/30 font-medium"
                />

                {/* Category Tag Selector */}
                <select
                  value={newNoteTag}
                  onChange={(e) => setNewNoteTag(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#2F6798]/30 font-medium cursor-pointer"
                >
                  <option value="Late Arrival">Late Arrival</option>
                  <option value="Meal Coverage">Meal Coverage</option>
                  <option value="Shift Swap">Shift Swap</option>
                  <option value="Missing Punch">Missing Punch</option>
                  <option value="Overtime Flag">Overtime Flag</option>
                  <option value="Approved Leave">Approved Leave</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Details of the attendance note, employee name, timestamps, and reason..."
                className="w-full p-2.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#2F6798]/30 resize-none font-medium"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Color Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Card Color:</span>
                  {(['blue', 'green', 'yellow', 'rose'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewNoteColor(col)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                        col === 'blue' ? 'bg-blue-400' :
                        col === 'green' ? 'bg-emerald-400' :
                        col === 'yellow' ? 'bg-amber-400' : 'bg-rose-400'
                      } ${newNoteColor === col ? 'ring-2 ring-offset-2 ring-[#2F6798] scale-110' : ''}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddStickyNote}
                  className="px-4 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#24537D] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Sticky Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {stickyNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between transition-all duration-200 group ${getStickyColorClasses(note.color)} ${
                  note.isPinned ? 'ring-1.5 ring-[#2F6798]/50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${getTagBadgeClass(note.tag)}`}>
                      {note.tag}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleTogglePinSticky(note.id)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          note.isPinned ? 'text-[#2F6798] font-black' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStickyToDelete(note.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                    {note.title}
                  </h4>

                  <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {note.content}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {note.timestamp}
                  </span>
                  {note.isPinned && (
                    <span className="text-[#2F6798] dark:text-blue-300 font-extrabold">
                      Pinned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 3. TAB 2: DAILY ATTENDANCE MEMO */}
      {activeTab === 'memo' && (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
                className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 bg-transparent outline-none border-b border-transparent focus:border-[#2F6798]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveMemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#2F6798]" />
                <span>{isSavedMemo ? 'Saved!' : 'Save Memo'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#24537D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isCopiedMemo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedMemo ? 'Copied to Clipboard!' : 'Copy Formatted Memo'}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed outline-none focus:ring-2 focus:ring-[#2F6798]/30 resize-none shadow-inner"
          />

        </div>
      )}

      {/* Confirmation Modal for deleting sticky note */}
      {stickyToDelete && (
        <ConfirmActionModal
          isOpen={!!stickyToDelete}
          title="Delete Attendance Note"
          description="Are you sure you want to remove this attendance exception flag from the studio?"
          confirmLabel="Delete Note"
          iconType="delete"
          onConfirm={() => {
            handleDeleteSticky(stickyToDelete);
            setStickyToDelete(null);
          }}
          onClose={() => setStickyToDelete(null)}
        />
      )}

    </div>
  );
}
