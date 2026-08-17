'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Assignment, Submission, Student } from '@/types';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  Award,
  Save,
  MessageSquareQuote,
  TrendingUp,
  Check,
  School,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  FileText,
  Camera,
  FileUp,
  Download,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Clock,
  HelpCircle,
  RotateCcw,
  Zap,
  FileCheck,
} from 'lucide-react';
import { initials, cn } from '@/lib/utils';

interface AssignmentReviewModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignmentReviewModal({
  assignment,
  isOpen,
  onClose,
}: AssignmentReviewModalProps) {
  const { state, reviewSubmission, showToast } = useEduFlow();
  
  // Selection and Filter States
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for currently selected student review
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Submissions mapping
  const submissions = assignment?.submissions || {};
  const submissionEntries = useMemo(() => Object.entries(submissions), [submissions]);

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return submissionEntries.filter(([sid, sub]) => {
      const student = state.students.find((s) => s.id === sid);
      const studentName = student?.name.toLowerCase() || '';
      
      // Search filter
      if (searchQuery.trim() && !studentName.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter === 'pending') {
        return sub.status !== 'reviewed';
      }
      if (statusFilter === 'reviewed') {
        return sub.status === 'reviewed';
      }

      return true;
    });
  }, [submissionEntries, state.students, searchQuery, statusFilter]);

  // Set default active student
  useEffect(() => {
    if (isOpen && submissionEntries.length > 0) {
      // Pick first pending if available, otherwise first item
      const firstPending = submissionEntries.find(([_, sub]) => sub.status !== 'reviewed');
      const targetId = firstPending ? firstPending[0] : submissionEntries[0][0];
      setSelectedStudentId(targetId);
      
      const sub = submissions[targetId];
      if (sub) {
        setScoreInput(sub.finalScore !== undefined ? sub.finalScore : sub.aiScore || 85);
        setFeedbackInput(sub.feedback || sub.aiFeedback || '');
      }
    }
  }, [isOpen, assignment?.id]);

  if (!isOpen || !assignment) return null;

  const activeStudentId = selectedStudentId || (filteredSubmissions.length > 0 ? filteredSubmissions[0][0] : null);
  const activeSubmission: Submission | undefined = activeStudentId ? submissions[activeStudentId] : undefined;
  const activeStudent = state.students.find((s) => s.id === activeStudentId);
  const activeStudentName = activeStudent?.name || (activeStudentId ? `Öğrenci #${activeStudentId.slice(0, 6)}` : 'Öğrenci');

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const sub = submissions[studentId];
    if (sub) {
      setScoreInput(sub.finalScore !== undefined ? sub.finalScore : sub.aiScore || 85);
      setFeedbackInput(sub.feedback || sub.aiFeedback || '');
    }
  };

  const handleApplyAiDraft = () => {
    if (activeSubmission?.aiScore !== undefined) {
      setScoreInput(activeSubmission.aiScore);
      if (activeSubmission.aiFeedback) {
        setFeedbackInput(activeSubmission.aiFeedback);
      }
      showToast(`AI puanı (%${activeSubmission.aiScore}) ve geri bildirimi forma aktarıldı.`, 'info');
    }
  };

  const handleSaveAndNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeStudentId) return;

    setIsSaving(true);
    await reviewSubmission(assignment.id, activeStudentId, Number(scoreInput), feedbackInput);
    setIsSaving(false);
    showToast(`${activeStudentName} için değerlendirme başarıyla kaydedildi! ✓`, 'success');

    // Auto-advance to the next unreviewed submission
    const currentIndex = submissionEntries.findIndex(([sid]) => sid === activeStudentId);
    const nextPending = submissionEntries.slice(currentIndex + 1).find(([_, sub]) => sub.status !== 'reviewed')
      || submissionEntries.find(([sid, sub]) => sid !== activeStudentId && sub.status !== 'reviewed');

    if (nextPending) {
      handleSelectStudent(nextPending[0]);
    } else if (currentIndex < submissionEntries.length - 1) {
      handleSelectStudent(submissionEntries[currentIndex + 1][0]);
    }
  };

  const reviewedCount = submissionEntries.filter(([_, sub]) => sub.status === 'reviewed').length;
  const pendingCount = submissionEntries.length - reviewedCount;
  const progressPercent = submissionEntries.length > 0 ? Math.round((reviewedCount / submissionEntries.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fade">
      <div className="relative w-full max-w-6xl bg-[#090a0f] border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[94vh]">
        {/* 1. TOP HEADER (Linear-Style High Density Bar) */}
        <header className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-bold text-sm sm:text-base text-white truncate">
                  {assignment.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  📁 {assignment.folder}
                </span>
                {assignment.classroomName && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <School className="w-3 h-3" />
                    <span>{assignment.classroomName}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Akıcı İnceleme & AI Rubrik Değerlendirme Alanı
              </p>
            </div>
          </div>

          {/* Right Progress & Quick Close */}
          <div className="flex items-center gap-4">
            {/* Progress Meter */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-[11px] font-semibold text-zinc-300">
                  {reviewedCount}/{submissionEntries.length} Tamamlandı
                </div>
                <div className="text-[10px] text-zinc-500">%{progressPercent} İlerleme</div>
              </div>
              <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            >
              <X className="w-4 h-4" />
              <span className="text-[10px] text-zinc-500 hidden md:inline">ESC</span>
            </button>
          </div>
        </header>

        {/* 2. SPLIT-VIEW WORKSPACE BODY */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
          
          {/* LEFT COLUMN: COMPACT SUBMISSIONS LIST (Linear Sidebar) */}
          <aside className="w-full md:w-80 lg:w-84 bg-[#07080c] flex flex-col shrink-0 overflow-hidden max-h-56 md:max-h-none border-b md:border-b-0 border-zinc-800">
            {/* Filter & Search Toolbar */}
            <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/60 space-y-2">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Öğrenci ara..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    'flex-1 py-1 rounded-md text-center font-medium transition-all',
                    statusFilter === 'all'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  )}
                >
                  Tümü ({submissionEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={cn(
                    'flex-1 py-1 rounded-md text-center font-medium transition-all',
                    statusFilter === 'pending'
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  )}
                >
                  Bekleyen ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('reviewed')}
                  className={cn(
                    'flex-1 py-1 rounded-md text-center font-medium transition-all',
                    statusFilter === 'reviewed'
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  )}
                >
                  Onaylı ({reviewedCount})
                </button>
              </div>
            </div>

            {/* Submissions Compact Scroll List */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 space-y-1">
                  <p>Eşleşen teslim bulunamadı.</p>
                </div>
              ) : (
                filteredSubmissions.map(([sid, sub]) => {
                  const student = state.students.find((s) => s.id === sid);
                  const name = student?.name || `Öğrenci #${sid.slice(0, 5)}`;
                  const isSelected = sid === activeStudentId;
                  const isReviewed = sub.status === 'reviewed';
                  const submissionTime = new Date(sub.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button
                      key={sid}
                      onClick={() => handleSelectStudent(sid)}
                      className={cn(
                        'w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 border',
                        isSelected
                          ? 'bg-zinc-800/80 border-l-2 border-l-emerald-400 border-zinc-700/80 text-white shadow-sm'
                          : 'bg-zinc-950/40 hover:bg-zinc-900/70 border-zinc-800/50 text-zinc-300'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: student?.color || '#3b82f6' }}
                        >
                          {initials(name)}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="font-semibold text-xs text-zinc-200 truncate">
                            {name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>{submissionTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 text-right">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span>%{sub.finalScore}</span>
                          </span>
                        ) : sub.aiScore !== undefined ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI: %{sub.aiScore}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Bekliyor
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT COLUMN: DETAILED REVIEW & ACTION WORKSPACE (Linear Pane) */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#090a0e]">
            {!activeSubmission ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-sm space-y-2">
                <FileText className="w-8 h-8 text-zinc-700" />
                <p>İncelemek için sol menüden bir öğrenci teslimi seçiniz.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Active Student Top Ribbon */}
                <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm"
                      style={{ backgroundColor: activeStudent?.color || '#3b82f6' }}
                    >
                      {initials(activeStudentName)}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                        <span>{activeStudentName}</span>
                        {activeSubmission.status === 'reviewed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Öğretmen Onayladı</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Taslak Hazır</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Teslim Saati: {new Date(activeSubmission.at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>

                  {/* Top Action Shortcut: Apply AI draft directly */}
                  {activeSubmission.aiScore !== undefined && activeSubmission.status !== 'reviewed' && (
                    <button
                      type="button"
                      onClick={handleApplyAiDraft}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Önerisini Yükle (%{activeSubmission.aiScore})</span>
                    </button>
                  )}
                </div>

                {/* Sub-Split Content Area: Left Student Work vs Right AI Rubric Engine */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                  
                  {/* Left Sub-Column: Student Submission Work (6 Kolon) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 font-mono">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Öğrencinin Yanıtı & Belgeler</span>
                      </div>
                      {activeSubmission.responseText && (
                        <span className="text-[11px] font-mono text-zinc-500">
                          {activeSubmission.responseText.split(/\s+/).filter(Boolean).length} kelime
                        </span>
                      )}
                    </div>

                    {/* Student Written Response Box */}
                    {activeSubmission.responseText ? (
                      <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
                        {activeSubmission.responseText}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800 text-xs text-zinc-500 italic">
                        Metin yanıtı girilmedi, dosya/görsel teslimi yapıldı.
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {activeSubmission.fileUrl && (
                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                            {activeSubmission.fileType?.includes('pdf') || activeSubmission.fileName?.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-rose-400" />
                            ) : activeSubmission.fileType?.startsWith('image') ? (
                              <Camera className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <FileUp className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {activeSubmission.fileName || 'Ekli Belge'}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {activeSubmission.fileSize
                                ? activeSubmission.fileSize < 1024 * 1024
                                  ? `${(activeSubmission.fileSize / 1024).toFixed(1)} KB`
                                  : `${(activeSubmission.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                : 'Belge Dosyası'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={activeSubmission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Önizle</span>
                          </a>
                          <a
                            href={activeSubmission.fileUrl}
                            download={activeSubmission.fileName || 'ogrenci_belge'}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
                            title="İndir"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {(activeSubmission.photo || (activeSubmission.fileUrl && activeSubmission.fileType?.startsWith('image'))) && (
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                        <div className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                          <span>Fotoğraf Önizlemesi</span>
                          <span className="text-[10px] text-zinc-500 font-mono">100% Görsel</span>
                        </div>
                        <img
                          src={activeSubmission.photo || activeSubmission.fileUrl}
                          alt="Ödev fotoğrafı"
                          className="max-h-64 rounded-lg object-contain border border-zinc-800 mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Sub-Column: AI Rubric Evaluation Card (6 Kolon) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Gemini AI Rubrik Analizi</span>
                      </div>
                      {activeSubmission.aiScore !== undefined && (
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Önerilen: %{activeSubmission.aiScore}
                        </span>
                      )}
                    </div>

                    {/* AI Score & Rubric Analysis Card */}
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-heading font-extrabold text-emerald-400 text-lg">
                            {activeSubmission.aiScore ?? 85}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              Önerilen Not Taslağı
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Müfredat ve Yönerge Uyumu
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setScoreInput(activeSubmission.aiScore || 85)}
                            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-all cursor-pointer"
                          >
                            Puanı Aktar
                          </button>
                        </div>
                      </div>

                      {/* AI Generated Pedagogical Feedback */}
                      {activeSubmission.aiFeedback && (
                        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                          &ldquo;{activeSubmission.aiFeedback}&rdquo;
                        </div>
                      )}

                      {/* Strengths & Improvements Badges */}
                      {((activeSubmission.aiStrengths && activeSubmission.aiStrengths.length > 0) ||
                        (activeSubmission.aiImprovements && activeSubmission.aiImprovements.length > 0)) && (
                        <div className="space-y-2 pt-1 text-xs">
                          {activeSubmission.aiStrengths && activeSubmission.aiStrengths.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                              <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                                <Check className="w-3.5 h-3.5" />
                                <span>Güçlü Yönler:</span>
                              </span>
                              <ul className="text-zinc-300 list-disc list-inside space-y-0.5 text-[11px]">
                                {activeSubmission.aiStrengths.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {activeSubmission.aiImprovements && activeSubmission.aiImprovements.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-1">
                              <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Gelişime Açık Noktalar:</span>
                              </span>
                              <ul className="text-zinc-300 list-disc list-inside space-y-0.5 text-[11px]">
                                {activeSubmission.aiImprovements.map((imp, idx) => (
                                  <li key={idx}>{imp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. BOTTOM ACTION & QUICK APPROVAL BAR (Linear Speed Workflow) */}
                <form
                  onSubmit={handleSaveAndNext}
                  className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/95 flex flex-wrap items-center justify-between gap-3 shrink-0"
                >
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    {/* Score Input with Quick Presets */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-zinc-400 shrink-0">
                        Nihai Puan:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(Number(e.target.value))}
                        className="w-18 px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-emerald-400 rounded-xl text-white font-bold text-sm text-center focus:outline-none"
                        required
                      />

                      {/* Quick Score Chips */}
                      <div className="hidden sm:flex items-center gap-1">
                        {[100, 90, 80, 70].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setScoreInput(preset)}
                            className={cn(
                              'px-2 py-1 rounded text-[11px] font-mono transition-all',
                              scoreInput === preset
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                            )}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Teacher Feedback / Comment Input */}
                    <div className="flex-1 min-w-[220px]">
                      <input
                        type="text"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Öğrenciye iletilecek değerlendirme yorumu..."
                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary Save & Auto-Advance Action Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSaving ? 'Kaydediliyor...' : 'Notu Onayla & Gönder'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
