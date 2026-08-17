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
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-xs animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[92vh] max-h-[850px] bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 truncate">
                  {assignment.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                  {assignment.folder || 'Genel'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {submissionEntries.length} teslim • {reviewedCount} onaylandı • {pendingCount} bekliyor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">İlerleme</div>
                <div className="text-xs font-mono font-bold text-slate-900">%{progressPercent}</div>
              </div>
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono shadow-2xs"
            >
              <X className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 hidden md:inline">ESC</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Submissions List */}
          <aside className="w-full md:w-80 lg:w-84 bg-slate-50 flex flex-col shrink-0 overflow-hidden max-h-56 md:max-h-none border-b md:border-b-0 border-slate-200">
            {/* Filter & Search */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Öğrenci ara..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    'flex-1 py-1 rounded-md text-center font-medium transition-all',
                    statusFilter === 'all'
                      ? 'bg-slate-200 text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  )}
                >
                  Onaylı ({reviewedCount})
                </button>
              </div>
            </div>

            {/* Submissions Scroll List */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
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
                          ? 'bg-white border-l-4 border-l-blue-600 border-slate-200 text-slate-900 shadow-xs'
                          : 'bg-white/60 hover:bg-white border-slate-200/80 text-slate-700'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: student?.color || '#3b82f6' }}
                        >
                          {initials(name)}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="font-semibold text-xs text-slate-900 truncate">
                            {name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{submissionTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 text-right">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>%{sub.finalScore}</span>
                          </span>
                        ) : sub.aiScore !== undefined ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI: %{sub.aiScore}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
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

          {/* Right Column: Review Workspace */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            {!activeSubmission ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-sm space-y-2">
                <FileText className="w-8 h-8 text-slate-300" />
                <p>İncelemek için sol menüden bir öğrenci teslimi seçiniz.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active Student Top Ribbon */}
                <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                      style={{ backgroundColor: activeStudent?.color || '#3b82f6' }}
                    >
                      {initials(activeStudentName)}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{activeStudentName}</span>
                        {activeSubmission.status === 'reviewed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Öğretmen Onayladı</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Taslak Hazır</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Teslim Saati: {new Date(activeSubmission.at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>

                  {/* Apply AI draft button */}
                  {activeSubmission.aiScore !== undefined && activeSubmission.status !== 'reviewed' && (
                    <button
                      type="button"
                      onClick={handleApplyAiDraft}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Önerisini Yükle (%{activeSubmission.aiScore})</span>
                    </button>
                  )}
                </div>

                {/* Sub-Split Content Area */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                  {/* Left: Student Work */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Öğrencinin Yanıtı & Belgeler</span>
                      </div>
                      {activeSubmission.responseText && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {activeSubmission.responseText.split(/\s+/).filter(Boolean).length} kelime
                        </span>
                      )}
                    </div>

                    {/* Student Written Response */}
                    {activeSubmission.responseText ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                        {activeSubmission.responseText}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 italic">
                        Metin yanıtı girilmedi, dosya/görsel teslimi yapıldı.
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {activeSubmission.fileUrl && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                            {activeSubmission.fileType?.includes('pdf') || activeSubmission.fileName?.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-rose-500" />
                            ) : activeSubmission.fileType?.startsWith('image') ? (
                              <Camera className="w-5 h-5 text-blue-500" />
                            ) : (
                              <FileUp className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {activeSubmission.fileName || 'Ekli Belge'}
                            </div>
                            <div className="text-[10px] text-slate-400">
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
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Önizle</span>
                          </a>
                          <a
                            href={activeSubmission.fileUrl}
                            download={activeSubmission.fileName || 'ogrenci_belge'}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-2xs"
                            title="İndir"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {(activeSubmission.photo || (activeSubmission.fileUrl && activeSubmission.fileType?.startsWith('image'))) && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                          <span>Fotoğraf Önizlemesi</span>
                        </div>
                        <img
                          src={activeSubmission.photo || activeSubmission.fileUrl}
                          alt="Ödev fotoğrafı"
                          className="max-h-64 rounded-lg object-contain border border-slate-200 mx-auto shadow-2xs"
                        />
                      </div>
                    )}

                    {/* Student Note */}
                    {activeSubmission.note && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Öğrencinin Notu</span>
                        </div>
                        <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-wrap">
                          {activeSubmission.note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: AI Rubric Evaluation */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Gemini AI Rubrik Analizi</span>
                      </div>
                      {activeSubmission.aiScore !== undefined && (
                        <span className="text-xs font-mono font-bold text-blue-600">
                          Önerilen: %{activeSubmission.aiScore}
                        </span>
                      )}
                    </div>

                    {/* AI Score Card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center font-heading font-extrabold text-blue-700 text-lg">
                            {activeSubmission.aiScore ?? 85}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Önerilen Not Taslağı
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Müfredat ve Yönerge Uyumu
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setScoreInput(activeSubmission.aiScore || 85)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
                        >
                          Puanı Aktar
                        </button>
                      </div>

                      {/* AI Feedback */}
                      {activeSubmission.aiFeedback && (
                        <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed italic shadow-2xs">
                          &ldquo;{activeSubmission.aiFeedback}&rdquo;
                        </div>
                      )}

                      {/* Strengths & Improvements */}
                      {((activeSubmission.aiStrengths && activeSubmission.aiStrengths.length > 0) ||
                        (activeSubmission.aiImprovements && activeSubmission.aiImprovements.length > 0)) && (
                        <div className="space-y-2 pt-1 text-xs">
                          {activeSubmission.aiStrengths && activeSubmission.aiStrengths.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                              <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Güçlü Yönler:</span>
                              </span>
                              <ul className="text-emerald-950 list-disc list-inside space-y-0.5 text-[11px]">
                                {activeSubmission.aiStrengths.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {activeSubmission.aiImprovements && activeSubmission.aiImprovements.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                              <span className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                                <span>Gelişime Açık Noktalar:</span>
                              </span>
                              <ul className="text-amber-950 list-disc list-inside space-y-0.5 text-[11px]">
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

                {/* Bottom Action Bar */}
                <form
                  onSubmit={handleSaveAndNext}
                  className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0"
                >
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-700 shrink-0">
                        Nihai Puan:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(Number(e.target.value))}
                        className="w-18 px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-slate-900 font-bold text-sm text-center focus:outline-none"
                        required
                      />

                      <div className="hidden sm:flex items-center gap-1">
                        {[100, 90, 80, 70].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setScoreInput(preset)}
                            className={cn(
                              'px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer',
                              scoreInput === preset
                                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                            )}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[220px]">
                      <input
                        type="text"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Öğrenciye iletilecek değerlendirme yorumu..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
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
