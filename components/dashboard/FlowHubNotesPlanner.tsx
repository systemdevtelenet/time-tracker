'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  CheckSquare, 
  Pin, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  User, 
  Sparkles, 
  Tag, 
  AlertTriangle, 
  Calendar, 
  Edit3, 
  Flame, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Bookmark,
  Type,
  Italic,
  Bold,
  Underline
} from 'lucide-react';

interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'blue' | 'yellow' | 'green' | 'rose' | 'slate';
  tag: string;
  isPinned: boolean;
  timestamp: string;
}

interface ShiftPriority {
  id: string;
  text: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

interface ShiftTimeBlock {
  id: string;
  timeRange: string;
  activity: string;
  category: string;
  completed: boolean;
}

interface CoachingLog {
  id: string;
  traineeName: string;
  topic: string;
  actionPlan: string;
  status: 'Pending' | 'Completed';
  date: string;
}

export default function FlowHubNotesPlanner() {
  const [activeTab, setActiveTab] = useState<'handover' | 'stickies' | 'schedule' | 'coaching' | 'minddump'>('handover');

  // 1. Shift Handover & Endorsement State
  const [shiftPriorities, setShiftPriorities] = useState<ShiftPriority[]>([
    { id: 'p1', text: 'Batch 12 Module 3 Live Evaluation & QA Audit', completed: false, priority: 'HIGH' },
    { id: 'p2', text: 'Follow-up on SL Form & Ticket #17889 (Matt Riner)', completed: true, priority: 'HIGH' },
    { id: 'p3', text: 'End-of-shift attendance lock & supervisor punch sync', completed: false, priority: 'MEDIUM' },
  ]);
  const [newPriorityText, setNewPriorityText] = useState('');
  const [handoverPendingIssues, setHandoverPendingIssues] = useState(
    '1. Trainee Bianca Colonia requested schedule adjustment for Friday.\n2. Audio test server had a 10-min latency spike at 01:30 AM (Resolved).\n3. Batch 12 exam 2 scores ready for QA verification.'
  );
  const [handoverNextShiftEndorsements, setHandoverNextShiftEndorsements] = useState(
    '• Handover to Next Supervisor (Rommel Mendoza / Raymundo):\n- Please monitor Batch 12 simulation calls starting 09:00 PM.\n- Check attendance records for 3 newly onboarded trainers.'
  );
  const [isCopiedReport, setIsCopiedReport] = useState(false);

  // 2. Sticky Notes Scratchpad State
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    {
      id: 's1',
      title: 'QA Escalation #17889',
      content: 'Call handling score issue on COVA simulation. Needs re-coaching before Friday certification.',
      color: 'rose',
      tag: 'Escalation',
      isPinned: true,
      timestamp: '02:15 AM',
    },
    {
      id: 's2',
      title: 'Batch 12 Attendance Note',
      content: 'Maegan & Niño were present on time for morning huddle. Great reliability this week!',
      color: 'green',
      tag: 'Trainees',
      isPinned: true,
      timestamp: '01:45 AM',
    },
    {
      id: 's3',
      title: 'Meeting with Operations',
      content: 'Agenda: Shift roster for October and training room audio headset upgrades.',
      color: 'blue',
      tag: 'Meeting',
      isPinned: false,
      timestamp: 'Yesterday',
    },
    {
      id: 's4',
      title: 'Quick Extension Codes',
      content: 'IT Support: ext. 4040\nHR Desk: ext. 2011\nOps Floor Desk: ext. 1005',
      color: 'yellow',
      tag: 'Quick Ref',
      isPinned: false,
      timestamp: 'Sep 14',
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'blue' | 'yellow' | 'green' | 'rose'>('blue');
  const [newNoteTag, setNewNoteTag] = useState('General');
  const [isAddingSticky, setIsAddingSticky] = useState(false);

  // 3. Shift Time-Block Schedule State
  const [shiftTimeBlocks, setShiftTimeBlocks] = useState<ShiftTimeBlock[]>([
    { id: 'tb1', timeRange: '09:00 PM – 09:30 PM', activity: 'Team Standup & Attendance Sync', category: 'Ops', completed: true },
    { id: 'tb2', timeRange: '09:30 PM – 12:30 AM', activity: 'Batch 12 Live Training & Simulation Runs', category: 'Training', completed: true },
    { id: 'tb3', timeRange: '12:30 AM – 01:00 AM', activity: 'Mid-Shift Check & Escalation Logging', category: 'Admin', completed: true },
    { id: 'tb4', timeRange: '01:00 AM – 02:00 AM', activity: 'Lunch Break (Shift Staggered)', category: 'Break', completed: false },
    { id: 'tb5', timeRange: '02:00 AM – 04:00 AM', activity: '1-on-1 Coaching & QA Audit Reviews', category: 'Coaching', completed: false },
    { id: 'tb6', timeRange: '04:00 AM – 05:30 AM', activity: 'Self-Paced Practice & Trainee Quiz Verification', category: 'Training', completed: false },
    { id: 'tb7', timeRange: '05:30 AM – 06:00 AM', activity: 'Shift Handover & Endorsement Report', category: 'Handover', completed: false },
  ]);

  // 4. Coaching Log State
  const [coachingLogs, setCoachingLogs] = useState<CoachingLog[]>([
    {
      id: 'c1',
      traineeName: 'Bianca Kaye Colonia',
      topic: 'AHT (Average Handling Time) optimization & empathy tone',
      actionPlan: 'Practice 3 mock calls on customer objections; follow cheat sheet on knowledge portal.',
      status: 'Pending',
      date: 'Sep 16, 2026',
    },
    {
      id: 'c2',
      traineeName: 'Rommel Mendoza',
      topic: 'Tardiness prevention & shift check-in punctuality',
      actionPlan: 'Set 30-min buffer alarm; acknowledged attendance policy endorsement.',
      status: 'Completed',
      date: 'Sep 15, 2026',
    },
  ]);
  const [newCoachingName, setNewCoachingName] = useState('Michelle Yncierto');
  const [newCoachingTopic, setNewCoachingTopic] = useState('');
  const [newCoachingAction, setNewCoachingAction] = useState('');
  const [isAddingCoaching, setIsAddingCoaching] = useState(false);

  // 5. Mind Dump / Freeform Note State
  const [mindDumpTitle, setMindDumpTitle] = useState('Shift Planning & Training Memo');
  const [mindDumpText, setMindDumpText] = useState(
    'Cebu Tele-Net Training Operations — Week 3 Progress Note.\n\nAll Batch 12 trainees have completed the technical telephony onboarding. Priority focus for the upcoming pay period is customer communication, escalation matrix adherence, and CRM ticket accuracy.\n\nKey Action Items:\n- Review QA scorecard for incoming trainers\n- Verify supervisor lunch logs on portal'
  );
  const [isSavedMindDump, setIsSavedMindDump] = useState(false);

  // Handlers
  const handleTogglePriority = (id: string) => {
    setShiftPriorities(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  const handleAddPriority = () => {
    if (!newPriorityText.trim()) return;
    setShiftPriorities(prev => [
      ...prev,
      { id: Date.now().toString(), text: newPriorityText.trim(), completed: false, priority: 'HIGH' }
    ]);
    setNewPriorityText('');
  };

  const handleCopyHandoverReport = () => {
    const prioritiesStr = shiftPriorities.map(p => `[${p.completed ? 'X' : ' '}] ${p.text}`).join('\n');
    const fullReport = `=== CEBU TELE-NET SHIFT HANDOVER REPORT ===\nDate: September 16, 2026\nSupervisor: Nissi-Jeh Reguero\n\n📌 DAILY PRIORITIES:\n${prioritiesStr}\n\n⚠️ PENDING ISSUES & ESCALATIONS:\n${handoverPendingIssues}\n\n📝 ENDORSEMENTS FOR NEXT SHIFT:\n${handoverNextShiftEndorsements}\n\nGenerated via Cebu Tele-Net Flow Hub.`;
    
    navigator.clipboard.writeText(fullReport);
    setIsCopiedReport(true);
    setTimeout(() => setIsCopiedReport(false), 2500);
  };

  const handleAddStickyNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    setStickyNotes(prev => [
      {
        id: Date.now().toString(),
        title: newNoteTitle.trim() || 'Untitled Note',
        content: newNoteContent.trim(),
        color: newNoteColor,
        tag: newNoteTag.trim() || 'General',
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

  const handleToggleTimeBlock = (id: string) => {
    setShiftTimeBlocks(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  };

  const handleAddCoaching = () => {
    if (!newCoachingTopic.trim()) return;
    setCoachingLogs(prev => [
      {
        id: Date.now().toString(),
        traineeName: newCoachingName,
        topic: newCoachingTopic.trim(),
        actionPlan: newCoachingAction.trim() || 'Self-review and follow-up on next shift.',
        status: 'Pending',
        date: 'Sep 16, 2026',
      },
      ...prev
    ]);
    setNewCoachingTopic('');
    setNewCoachingAction('');
    setIsAddingCoaching(false);
  };

  const getStickyColorClasses = (color: StickyNote['color']) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100';
      case 'green':
        return 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100';
      case 'yellow':
        return 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100';
      case 'blue':
      default:
        return 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100';
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col space-y-4 p-5 sm:p-6">
      
      {/* 1. Header Bar: Title + Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2F6798]/15 text-[#2F6798] dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Shift Notes & Planning Studio
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational handovers, time-block scheduling, coaching logs & scratchpad
          </p>
        </div>

        {/* Tab Navigation Pill Group */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('handover')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'handover'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Shift Handover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stickies')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stickies'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Sticky Board ({stickyNotes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Shift Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coaching')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coaching'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1-on-1 Coaching</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('minddump')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'minddump'
                ? 'bg-[#2F6798] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Freeform Memo</span>
          </button>
        </div>

      </div>

      {/* 2. Tab Contents */}
      
      {/* TAB 1: SHIFT HANDOVER & ENDORSEMENT PLAN */}
      {activeTab === 'handover' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Top 3 Priorities Checklist */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#070D1E] border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Top Shift Priorities ({shiftPriorities.filter(p => p.completed).length}/{shiftPriorities.length} Completed)</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">September 16, 2026 Shift</span>
            </div>

            <div className="space-y-2">
              {shiftPriorities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTogglePriority(item.id)}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    item.completed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-slate-500 line-through'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#2F6798]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{item.text}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    item.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick add priority */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newPriorityText}
                onChange={(e) => setNewPriorityText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
                placeholder="Add a new target priority..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-1 focus:ring-[#2F6798]"
              />
              <button
                type="button"
                onClick={handleAddPriority}
                className="px-3 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#24537D] text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Two Columns: Pending Issues & Next Shift Endorsements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pending Issues & Escalations */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 dark:text-rose-400 uppercase">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pending Issues &amp; Trainee Escalations</span>
              </div>
              <textarea
                rows={2}
                value={handoverPendingIssues}
                onChange={(e) => setHandoverPendingIssues(e.target.value)}
                placeholder="Log any unresolved trainer or technical issues..."
                className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed outline-none focus:ring-1 focus:ring-[#2F6798] resize-none"
              />
            </div>

            {/* Next Shift Endorsements */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#2F6798] dark:text-blue-400 uppercase">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Endorsements to Incoming Supervisor</span>
              </div>
              <textarea
                rows={2}
                value={handoverNextShiftEndorsements}
                onChange={(e) => setHandoverNextShiftEndorsements(e.target.value)}
                placeholder="Notes for next shift team..."
                className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed outline-none focus:ring-1 focus:ring-[#2F6798] resize-none"
              />
            </div>

          </div>

          {/* Action Footer: 1-Click Copy Shift Report */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs text-slate-500 font-semibold">
              Ready to send to team Slack / Discord / Email handover channel?
            </span>
            <button
              type="button"
              onClick={handleCopyHandoverReport}
              className="px-4 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isCopiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Shift Report</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: STICKY BOARD SCRATCHPAD */}
      {activeTab === 'stickies' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Header Action: Add Sticky Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              Pin critical thoughts, phone extensions, ticket IDs & quick reminders
            </span>
            <button
              type="button"
              onClick={() => setIsAddingSticky(!isAddingSticky)}
              className="px-3 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingSticky ? 'Close Form' : 'New Sticky Note'}</span>
            </button>
          </div>

          {/* Add Sticky Card Form */}
          {isAddingSticky && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                />
                <input
                  type="text"
                  value={newNoteTag}
                  onChange={(e) => setNewNoteTag(e.target.value)}
                  placeholder="Tag (e.g. Escalation, Trainees)..."
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Color:</span>
                  {(['blue', 'yellow', 'green', 'rose'] as const).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewNoteColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        color === 'blue' ? 'bg-blue-400' : color === 'yellow' ? 'bg-amber-400' : color === 'green' ? 'bg-emerald-400' : 'bg-rose-400'
                      } ${newNoteColor === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent opacity-70'}`}
                    />
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your quick note here..."
                className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSticky(false)}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddStickyNote}
                  className="px-4 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-black cursor-pointer"
                >
                  Pin Note
                </button>
              </div>
            </div>
          )}

          {/* Sticky Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {stickyNotes.map(note => (
              <div
                key={note.id}
                className={`p-3.5 rounded-xl border shadow-2xs flex flex-col justify-between space-y-2 relative transition-all group hover:shadow-md ${getStickyColorClasses(note.color)}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/10">
                      {note.tag}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleTogglePinSticky(note.id)}
                        className={`p-1 rounded cursor-pointer ${note.isPinned ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSticky(note.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-xs mt-2 leading-snug">
                    {note.title}
                  </h4>
                  <p className="text-[11px] mt-1 leading-relaxed whitespace-pre-wrap opacity-90">
                    {note.content}
                  </p>
                </div>

                <span className="text-[9px] text-slate-400 font-mono self-end pt-1">
                  {note.timestamp}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: SHIFT TIMELINE & TIME-BLOCK SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-500">
              Shift Time-Blocks (9:00 PM – 6:00 AM) • Check off as your shift progresses
            </span>
            <span className="text-xs font-black text-[#2F6798]">
              {shiftTimeBlocks.filter(b => b.completed).length} of {shiftTimeBlocks.length} Completed
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {shiftTimeBlocks.map(block => (
              <div
                key={block.id}
                onClick={() => handleToggleTimeBlock(block.id)}
                className={`p-3 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                  block.completed
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 text-slate-400'
                    : 'bg-white dark:bg-[#101D3D] hover:bg-blue-50/40 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    block.completed 
                      ? 'bg-[#2F6798] border-[#2F6798] text-white' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {block.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span className="text-xs font-mono font-bold text-[#2F6798] dark:text-blue-300 min-w-[145px]">
                    {block.timeRange}
                  </span>

                  <span className={`text-xs font-bold ${block.completed ? 'line-through text-slate-400' : ''}`}>
                    {block.activity}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {block.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 1-ON-1 COACHING LOG */}
      {activeTab === 'coaching' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Track 1-on-1 coaching sessions, quality audit feedback & trainee agreements
            </span>
            <button
              type="button"
              onClick={() => setIsAddingCoaching(!isAddingCoaching)}
              className="px-3 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              <span>{isAddingCoaching ? 'Close' : 'Log Coaching Session'}</span>
            </button>
          </div>

          {/* Add Coaching Log Form */}
          {isAddingCoaching && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Trainee</label>
                  <select
                    value={newCoachingName}
                    onChange={(e) => setNewCoachingName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Bianca Kaye Colonia">Bianca Kaye Colonia</option>
                    <option value="Michelle Yncierto">Michelle Yncierto</option>
                    <option value="Rommel Mendoza">Rommel Mendoza</option>
                    <option value="Ronelyn Baguio">Ronelyn Baguio</option>
                    <option value="Matt Riner Balaba">Matt Riner Balaba</option>
                    <option value="Niño Elijah Reyes">Niño Elijah Reyes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Topic / Area of Focus</label>
                  <input
                    type="text"
                    value={newCoachingTopic}
                    onChange={(e) => setNewCoachingTopic(e.target.value)}
                    placeholder="e.g. Call handling, Tardiness, QA scorecard"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Plan / Trainee Agreement</label>
                <textarea
                  rows={2}
                  value={newCoachingAction}
                  onChange={(e) => setNewCoachingAction(e.target.value)}
                  placeholder="Action items agreed upon during coaching..."
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCoaching(false)}
                  className="px-3 py-1 text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCoaching}
                  className="px-4 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-black cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </div>
          )}

          {/* Coaching Log List */}
          <div className="space-y-3">
            {coachingLogs.map(log => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{log.traineeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">• {log.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    log.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {log.status}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#2F6798] dark:text-blue-300">
                  Topic: {log.topic}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <b className="text-slate-700 dark:text-slate-300">Agreement:</b> {log.actionPlan}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 5: FREEFORM MEMO / MIND DUMP */}
      {activeTab === 'minddump' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={mindDumpTitle}
              onChange={(e) => setMindDumpTitle(e.target.value)}
              className="text-sm font-extrabold text-slate-900 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 outline-none pb-0.5"
            />
            <span className="text-[10px] font-bold text-slate-400">
              {mindDumpText.length} characters • {mindDumpText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            rows={5}
            value={mindDumpText}
            onChange={(e) => setMindDumpText(e.target.value)}
            placeholder="Type your notes, ideas, or meeting draft..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed outline-none focus:ring-1 focus:ring-[#2F6798]"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              <span className="text-[10px] text-slate-400 font-bold">Auto-persisted to browser</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSavedMindDump(true);
                setTimeout(() => setIsSavedMindDump(false), 2000);
              }}
              className="px-4 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-black shadow-xs cursor-pointer"
            >
              {isSavedMindDump ? 'Saved!' : 'Save Memo'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
