'use client';

import React, { useState } from 'react';
import { Assignment } from '@/types';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  FileText,
  CheckCircle2,
  Award,
  BookOpen,
  Camera,
  RotateCcw,
  School,
  TrendingUp,
  AlertCircle,
  MessageSquareQuote,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface AssignmentSubmitModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignmentSubmitModal({
  assignment,
  isOpen,
  onClose,
}: AssignmentSubmitModalProps) {
  const { state, submitAssignmentResponse } = useEduFlow();
  const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || '';

  const [responseText, setResponseText] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assignment) return null;

  const currentSubmission = assignment.submissions?.[studentId];
  const isSubmitted = !!currentSubmission;
  const isReviewed = currentSubmission?.status === 'reviewed';

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() && !photoDataUrl) return;

    setIsSubmitting(true);
    const result = await submitAssignmentResponse(
      assignment.id,
      responseText,
      photoDataUrl || undefined
    );
    setIsSubmitting(false);

    if (result.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
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
            </div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
              {assignment.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Assignment Description & Instructions */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Ödev Yönergesi & Açıklaması</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {assignment.desc || 'Bu ödev için özel bir yönerge bulunmuyor. Yanıtınızı aşağıdaki metin alanına yazarak teslim edebilirsiniz.'}
            </p>
          </div>

          {/* If already submitted: Display Evaluation Card */}
          {isSubmitted && (
            <div className="space-y-4">
              {/* Score Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                      {currentSubmission.finalScore !== undefined
                        ? currentSubmission.finalScore
                        : currentSubmission.aiScore || 85}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                        {isReviewed ? '👨‍🏫 Öğretmen Tarafından Onaylandı' : '🤖 Gemini AI Tahmini Puanı'}
                      </div>
                      <div className="text-xs text-slate-400">100 Üzerinden Değerlendirme</div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5',
                      isReviewed
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isReviewed ? 'Nihai Not Verildi' : 'AI Ön Değerlendirmesi Tamam'}</span>
                  </span>
                </div>

                {/* Gemini Constructive Feedback */}
                {currentSubmission.aiFeedback && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 text-xs space-y-2">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Gemini Yapay Zeka Geri Bildirimi:</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed italic">
                      "{currentSubmission.aiFeedback}"
                    </p>
                  </div>
                )}

                {/* Strengths & Improvements */}
                {((currentSubmission.aiStrengths && currentSubmission.aiStrengths.length > 0) ||
                  (currentSubmission.aiImprovements && currentSubmission.aiImprovements.length > 0)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {currentSubmission.aiStrengths && currentSubmission.aiStrengths.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Güçlü Yönlerin:</span>
                        </span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {currentSubmission.aiStrengths.map((str, idx) => (
                            <li key={idx} className="leading-snug">
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentSubmission.aiImprovements && currentSubmission.aiImprovements.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Geliştirme Tavsiyesi:</span>
                        </span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {currentSubmission.aiImprovements.map((imp, idx) => (
                            <li key={idx} className="leading-snug">
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher's Manual Feedback Note */}
                {currentSubmission.feedback && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs space-y-1.5">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>Öğretmeninin Özel Yorumu:</span>
                    </div>
                    <p className="text-slate-100 font-medium leading-relaxed">
                      {currentSubmission.feedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Student's Sent Response */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400">Teslim Ettiğiniz Yanıtınız:</span>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {currentSubmission.responseText || '(Metin yanıtı girilmedi)'}
                </p>
                {currentSubmission.photo && (
                  <div className="pt-2">
                    <img
                      src={currentSubmission.photo}
                      alt="Ödev fotoğrafı"
                      className="max-h-48 rounded-xl border border-slate-800 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If NOT submitted yet: Submission Form */}
          {!isSubmitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Ödev Yanıtınız / Çözüm Adımlarınız</span>
                  <span className="text-[11px] text-slate-500">Gemini AI tarafından anında incelenir</span>
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Ödev metnini, çözümünüzü veya kompozisyonunuzu buraya detaylı olarak yazınız..."
                  className="w-full p-4 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-2xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none leading-relaxed transition-all resize-none"
                  required={!photoDataUrl}
                />
              </div>

              {/* Optional Photo Attachment */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  Fotoğraf / Ek Dosya (İsteğe Bağlı):
                </span>
                {photoDataUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-48 w-full bg-slate-950 flex items-center justify-center">
                    <img src={photoDataUrl} alt="Yüklenen görsel" className="max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => setPhotoDataUrl(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Kaldır ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-slate-800 hover:border-indigo-400 bg-slate-900/60 cursor-pointer transition-all">
                    <Camera className="w-5 h-5 text-indigo-400" />
                    <div className="text-xs">
                      <span className="font-semibold text-white">Defter veya soru fotoğrafı ekle</span>
                      <span className="text-slate-500 block text-[11px]">PNG, JPG veya WebP</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || (!responseText.trim() && !photoDataUrl)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini Yanıtı İnceliyor ve Notlandırıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Ödevi Teslim Et & AI ile Değerlendir</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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
