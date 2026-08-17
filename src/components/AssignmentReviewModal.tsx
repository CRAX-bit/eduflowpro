'use client';

import React, { useState, useEffect } from 'react';
import { Assignment, Submission } from '@/types';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  X,
  FileCheck,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Clock,
  Send,
  Loader2,
  FileText,
  Camera,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  BookOpen,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { getAuthHeaders } from '@/lib/api-client';

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

  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  const submissions = assignment?.submissions || {};
  const submissionEntries = Object.entries(submissions);

  // Initialize active student
  useEffect(() => {
    if (isOpen && assignment) {
      const firstPending = submissionEntries.find(([_, sub]) => sub.status !== 'reviewed');
      if (firstPending) {
        handleSelectStudent(firstPending[0]);
      } else if (submissionEntries.length > 0) {
        handleSelectStudent(submissionEntries[0][0]);
      } else {
        setActiveStudentId(null);
      }
    }
  }, [isOpen, assignment]);

  if (!isOpen || !assignment) return null;

  const handleSelectStudent = (studentId: string) => {
    setActiveStudentId(studentId);
    const sub = submissions[studentId];
    if (sub) {
      setScoreInput(sub.finalScore !== undefined ? sub.finalScore : sub.aiScore !== undefined ? sub.aiScore : 85);
      setFeedbackInput(sub.feedback || sub.aiFeedback || '');
    }
  };

  const activeSubmission = activeStudentId ? submissions[activeStudentId] : null;
  const activeStudent = activeStudentId ? state.students.find((s) => s.id === activeStudentId) : null;
  const activeStudentName = activeStudent?.name || 'Öğrenci';

  const handleAiAutoGrade = async () => {
    if (!activeStudentId || !activeSubmission) return;

    setIsAiGrading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'evaluate_rubric',
          assignmentTitle: assignment.title,
          rubricGuide: assignment.desc || 'Genel içerik ve konu hakimiyeti analizi',
          studentText: activeSubmission.responseText || '',
          fileUrl: activeSubmission.fileAttachment?.fileUrl || activeSubmission.photo,
          studentName: activeStudentName,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        const aiScore = Number(data.evaluation.score) || 85;
        const aiFeedback = data.evaluation.feedback || '';
        setScoreInput(aiScore);
        setFeedbackInput(aiFeedback);
        showToast('Deskio AI rubrik değerlendirmesini tamamladı! ✨', 'success');
      } else {
        showToast(data.error || 'Yapay zeka değerlendirmesi alınamadı.', 'warn');
      }
    } catch (err) {
      showToast('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.', 'error');
    } finally {
      setIsAiGrading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!activeStudentId || !activeSubmission) return;

    setIsSaving(true);
    try {
      await reviewSubmission(
        assignment.id,
        activeStudentId,
        scoreInput,
        feedbackInput.trim()
      );

      showToast(`${activeStudentName} için not onaylandı! (%${scoreInput})`, 'success');
      
      // Auto advance to next pending student
      const currentIndex = filteredSubmissions.findIndex(([sid]) => sid === activeStudentId);
      const nextPending = filteredSubmissions.slice(currentIndex + 1).find(([_, sub]) => sub.status !== 'reviewed');
      
      if (nextPending) {
        handleSelectStudent(nextPending[0]);
      }
    } catch (err) {
      showToast('Not kaydedilirken bir hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSubmissions = submissionEntries.filter(([sid, sub]) => {
    const student = state.students.find((s) => s.id === sid);
    const name = student?.name || '';
    const matchesSearch = searchQuery === '' || name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'pending') return sub.status !== 'reviewed';
    if (statusFilter === 'reviewed') return sub.status === 'reviewed';
    return true;
  });

  const totalCount = submissionEntries.length;
  const reviewedCount = submissionEntries.filter(([_, s]) => s.status === 'reviewed').length;
  const pendingCount = totalCount - reviewedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
      <div className="bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl w-full max-w-6xl h-[95vh] sm:h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                  Deskio Rubrik Değerlendirme
                </span>
                <span className="text-xs text-slate-700 font-bold truncate">• {assignment.folder}</span>
                {assignment.classroomName && (
                  <span className="text-xs text-slate-700 font-bold truncate">• {assignment.classroomName}</span>
                )}
              </div>
              <h2 className="font-heading font-extrabold text-base sm:text-xl text-slate-950 tracking-tight truncate">
                {assignment.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300">
                {reviewedCount} Onaylandı
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300">
                {pendingCount} Bekliyor
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Split: Sidebar Submissions List + Review Canvas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar / Top Mobile Selector: Submissions Roster */}
          <aside className="w-full md:w-80 max-h-40 md:max-h-none border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-y-auto touch-scroll">
            {/* Search & Filter Controls */}
            <div className="p-3 border-b border-slate-200 space-y-2 shrink-0 bg-slate-50 sticky top-0 z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Öğrenci ara..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none min-h-[36px]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-center font-bold transition-all min-h-[32px]',
                    statusFilter === 'all'
                      ? 'bg-white text-slate-950 font-extrabold shadow-2xs'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  Tümü ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-center font-bold transition-all min-h-[32px]',
                    statusFilter === 'pending'
                      ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  Bekleyen ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('reviewed')}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-center font-bold transition-all min-h-[32px]',
                    statusFilter === 'reviewed'
                      ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  Onaylı ({reviewedCount})
                </button>
              </div>
            </div>

            {/* Submissions Scroll List */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1 touch-scroll">
              {filteredSubmissions.length === 0 ? (
                <div className="p-4 sm:p-8 text-center text-xs text-slate-500 font-medium space-y-1">
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
                        'w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 border min-h-[44px] active:scale-[0.99]',
                        isSelected
                          ? 'bg-white border-l-4 border-l-blue-600 border-slate-300 text-slate-950 shadow-xs font-bold'
                          : 'bg-white/60 hover:bg-white border-slate-200 text-slate-800 font-semibold'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-[11px] text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: student?.color || '#3b82f6' }}
                        >
                          {initials(name)}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="font-bold text-xs text-slate-950 truncate">
                            {name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{submissionTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 text-right">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <span>%{sub.finalScore}</span>
                          </span>
                        ) : sub.aiScore !== undefined ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                            <span>AI: %{sub.aiScore}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-600 text-sm space-y-2 font-medium">
                <FileText className="w-8 h-8 text-slate-400" />
                <p>İncelemek için sol menüden bir öğrenci teslimi seçiniz.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active Student Top Ribbon */}
                <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                      style={{ backgroundColor: activeStudent?.color || '#3b82f6' }}
                    >
                      {initials(activeStudentName)}
                    </div>
                    <div>
                      <div className="font-heading font-extrabold text-sm sm:text-base text-slate-950 flex items-center gap-2">
                        <span>{activeStudentName}</span>
                        {activeSubmission.status === 'reviewed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            Not Onaylandı
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            İnceleme Bekliyor
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-700 font-medium">
                        Teslim: {new Date(activeSubmission.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAiAutoGrade}
                      disabled={isAiGrading}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 min-h-[40px] active:scale-95"
                    >
                      {isAiGrading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{isAiGrading ? 'AI İnceliyor...' : '✨ Deskio AI Rubrik Analizi'}</span>
                    </button>
                  </div>
                </div>

                {/* Review Canvas: Student Content + Teacher Scoring Form */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 touch-scroll">
                  {/* Homework Description Prompt Reminder */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ödev Yönergesi:</span>
                    </span>
                    <p className="text-xs sm:text-sm text-slate-950 font-medium leading-relaxed">
                      {assignment.desc || 'Özel bir yönerge belirtilmedi.'}
                    </p>
                  </div>

                  {/* Student Response Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Öğrencinin Yanıtı & Çözümü
                      </span>
                    </div>

                    {activeSubmission.responseText ? (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-950 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                        {activeSubmission.responseText}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs italic">
                        Metin yanıtı girilmedi (Sadece dosya teslimi yapıldı).
                      </div>
                    )}
                  </div>

                  {/* Attached File or Photo */}
                  {(activeSubmission.fileAttachment || activeSubmission.fileUrl) && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Yüklenen Ödev Dosyası
                      </span>
                      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-slate-950 truncate">
                              {activeSubmission.fileAttachment?.fileName || activeSubmission.fileName || 'Ödev_Dosyası'}
                            </div>
                            <div className="text-[11px] text-slate-700 font-semibold">
                              {activeSubmission.fileAttachment?.fileSize
                                ? `${(activeSubmission.fileAttachment.fileSize / 1024).toFixed(1)} KB`
                                : activeSubmission.fileSize
                                ? `${(activeSubmission.fileSize / 1024).toFixed(1)} KB`
                                : 'Belge'}
                            </div>
                          </div>
                        </div>

                        <a
                          href={activeSubmission.fileAttachment?.fileUrl || activeSubmission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs min-h-[40px] active:scale-95 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>İndir / Görüntüle</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {activeSubmission.photo && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Ödev Fotoğrafı
                      </span>
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 max-h-96 flex items-center justify-center p-2">
                        <img
                          src={activeSubmission.photo}
                          alt="Ödev"
                          className="max-h-92 w-auto object-contain rounded-xl shadow-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Student Note to Teacher */}
                  {activeSubmission.note && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        <span>Öğrencinin Size Notu:</span>
                      </span>
                      <p className="text-slate-950 font-medium italic">&quot;{activeSubmission.note}&quot;</p>
                    </div>
                  )}

                  {/* Teacher Evaluation & Grading Box */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-slate-300 space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-950">
                          Öğretmen Değerlendirmesi & Notlandırma
                        </h4>
                      </div>

                      {/* Score Input Stepper */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">Not (0-100):</span>
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300">
                          <button
                            type="button"
                            onClick={() => setScoreInput((prev) => Math.max(0, prev - 5))}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreInput}
                            onChange={(e) => setScoreInput(Number(e.target.value))}
                            className="w-14 text-center font-heading font-extrabold text-base bg-white border border-slate-300 rounded-lg py-1 text-slate-950 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setScoreInput((prev) => Math.min(100, prev + 5))}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Öğrenciye Geri Bildirim Notu
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Öğrencinin çalışmasını güçlendirecek yapıcı geri bildirim ve notlarınızı buraya yazın..."
                        className="w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none transition-all resize-y leading-relaxed"
                      />
                    </div>

                    {/* Save & Confirm Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveReview}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Notu Onayla & Öğrenciye İlet (%{scoreInput})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
