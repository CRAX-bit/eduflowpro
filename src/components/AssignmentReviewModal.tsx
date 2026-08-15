'use client';

import React, { useState } from 'react';
import { Assignment, Submission } from '@/types';
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
  User,
  ExternalLink,
  ChevronRight,
  BookOpen,
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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Form states for currently selected student review
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !assignment) return null;

  const submissions = assignment.submissions || {};
  const submissionEntries = Object.entries(submissions);

  // Default to first submission student if none selected
  const activeStudentId = selectedStudentId || (submissionEntries.length > 0 ? submissionEntries[0][0] : null);
  const activeSubmission: Submission | undefined = activeStudentId ? submissions[activeStudentId] : undefined;
  const activeStudent = state.students.find((s) => s.id === activeStudentId);
  const activeStudentName = activeStudent?.name || (activeStudentId ? `Öğrenci #${activeStudentId.slice(0, 6)}` : 'Öğrenci');

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const sub = submissions[studentId];
    if (sub) {
      setScoreInput(sub.finalScore !== undefined ? sub.finalScore : sub.aiScore || 85);
      setFeedbackInput(sub.feedback || '');
    }
  };

  const handleApproveAiScore = () => {
    if (activeSubmission?.aiScore !== undefined) {
      setScoreInput(activeSubmission.aiScore);
      showToast(`Gemini puanı (%${activeSubmission.aiScore}) seçildi.`, 'info');
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentId) return;

    setIsSaving(true);
    await reviewSubmission(assignment.id, activeStudentId, Number(scoreInput), feedbackInput);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/50 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                📁 {assignment.folder}
              </span>
              {assignment.classroomName && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1">
                  <School className="w-3 h-3" />
                  <span>{assignment.classroomName}</span>
                </span>
              )}
              <span className="text-xs text-slate-400">
                • {submissionEntries.length} Teslim Alındı
              </span>
            </div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
              {assignment.title} — Teslim ve AI Değerlendirmeleri
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Split view (Students list on left, review panel on right) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Sidebar: Submission Students List */}
          <div className="w-full md:w-72 bg-slate-950/40 p-4 overflow-y-auto shrink-0 space-y-2 max-h-48 md:max-h-none">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Ödevi Teslim Edenler ({submissionEntries.length})
            </div>

            {submissionEntries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                Henüz ödevi teslim eden öğrenci bulunmuyor.
              </div>
            ) : (
              <div className="space-y-1.5">
                {submissionEntries.map(([sid, sub]) => {
                  const student = state.students.find((s) => s.id === sid);
                  const name = student?.name || `Öğrenci #${sid.slice(0, 5)}`;
                  const isSelected = sid === activeStudentId;
                  const isReviewed = sub.status === 'reviewed';

                  return (
                    <button
                      key={sid}
                      onClick={() => handleSelectStudent(sid)}
                      className={cn(
                        'w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 border',
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: student?.color || '#6366F1' }}
                        >
                          {initials(name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">{name}</div>
                          <div className="text-[10px] text-slate-400">
                            {isReviewed ? (
                              <span className="text-emerald-400 font-bold">Puan: %{sub.finalScore}</span>
                            ) : sub.aiScore !== undefined ? (
                              <span className="text-indigo-300">AI: %{sub.aiScore}</span>
                            ) : (
                              'Beklemede'
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Area: Active Student Submission Details & Review Panel */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {!activeSubmission ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                İncelemek için sol menüden bir öğrenci teslimi seçiniz.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-heading font-bold text-sm text-white shadow-md"
                      style={{ backgroundColor: activeStudent?.color || '#6366F1' }}
                    >
                      {initials(activeStudentName)}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-white">
                        {activeStudentName}
                      </h4>
                      <div className="text-xs text-slate-400">
                        Teslim Tarihi: {new Date(activeSubmission.at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5',
                      activeSubmission.status === 'reviewed'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {activeSubmission.status === 'reviewed'
                        ? 'Öğretmen Onayladı'
                        : 'AI Tarafından Notlandırıldı'}
                    </span>
                  </span>
                </div>

                {/* Student Response Text & Photo */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Öğrencinin Teslim Ettiği Yanıt</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {activeSubmission.responseText || '(Metin yanıtı girilmedi)'}
                  </div>
                  {activeSubmission.photo && (
                    <div className="p-2 bg-slate-950/60 rounded-2xl border border-slate-800 inline-block">
                      <img
                        src={activeSubmission.photo}
                        alt="Ödev fotoğrafı"
                        className="max-h-60 rounded-xl object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Gemini AI Auto-Grading & Feedback Card */}
                {activeSubmission.aiScore !== undefined && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-lg space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                          {activeSubmission.aiScore}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                            Gemini AI Önerilen Puan
                          </div>
                          <div className="text-xs text-slate-400">100 Üzerinden Otomatik Analiz</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleApproveAiScore}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>AI Puanını Seç</span>
                      </button>
                    </div>

                    {activeSubmission.aiFeedback && (
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20 text-xs text-slate-200 leading-relaxed italic">
                        "{activeSubmission.aiFeedback}"
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    {((activeSubmission.aiStrengths && activeSubmission.aiStrengths.length > 0) ||
                      (activeSubmission.aiImprovements && activeSubmission.aiImprovements.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeSubmission.aiStrengths && activeSubmission.aiStrengths.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Güçlü Yönler:</span>
                            </span>
                            <ul className="text-slate-300 list-disc list-inside space-y-0.5">
                              {activeSubmission.aiStrengths.map((s, idx) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeSubmission.aiImprovements && activeSubmission.aiImprovements.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                            <span className="font-bold text-amber-400 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Geliştirilmesi Gerekenler:</span>
                            </span>
                            <ul className="text-slate-300 list-disc list-inside space-y-0.5">
                              {activeSubmission.aiImprovements.map((imp, idx) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher Final Evaluation Form */}
                <form onSubmit={handleSaveReview} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Öğretmen Değerlendirmesi ve Notu</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Nihai Puan (0-100):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl text-white font-bold text-base focus:outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Öğretmen Yorumu / Geri Bildirimi:
                      </label>
                      <input
                        type="text"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Örn: Harika bir çalışma Ali, özellikle ikinci sorudaki yaklaşımın çok başarılı!"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Değerlendirmeyi Kaydet & Öğrenciye İlet</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
