'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment } from '@/types';
import { initials, fmtTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Folder,
  Timer,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Download,
  Camera,
  RotateCcw,
  Sparkles,
  Award,
  Send,
  Loader2,
  HelpCircle,
  MessageSquareQuote,
  UploadCloud,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';

export function StudentView() {
  const {
    state,
    getStudentById,
    getVisibleAssignments,
    submitTestAnswers,
    retryTest,
    submitHomeworkPhoto,
    showToast,
  } = useEduFlow();

  const currentStudent = getStudentById(state.currentStudentId);
  const assignments = getVisibleAssignments(state.currentStudentId);

  // Timers state: { [assignmentId]: { remaining: number, active: boolean } }
  const [timers, setTimers] = useState<Record<string, { remaining: number; active: boolean }>>({});
  const [testAnswers, setTestAnswers] = useState<Record<string, string[]>>({});

  // Question Explainer state
  const [explainingQuestion, setExplainingQuestion] = useState<{
    key: string;
    text: string;
    loading: boolean;
  } | null>(null);

  // Modals state
  const [viewingNote, setViewingNote] = useState<Assignment | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    studentName?: string;
  } | null>(null);

  // Active timers countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        let hasChanges = false;

        Object.keys(next).forEach((id) => {
          if (next[id]?.active) {
            if (next[id].remaining <= 1) {
              // Timer expired! Trigger auto submit
              next[id] = { remaining: 0, active: false };
              hasChanges = true;
              const currentAns = testAnswers[id] || [];
              submitTestAnswers(id, currentAns, true);
            } else {
              next[id] = { ...next[id], remaining: next[id].remaining - 1 };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testAnswers, submitTestAnswers]);

  if (!currentStudent) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Lütfen önce öğrenci girişi yapınız.</p>
      </div>
    );
  }

  const handleStartTest = (a: Assignment) => {
    const limit = a.timeLimit || 120;
    setTimers((prev) => ({
      ...prev,
      [a.id]: { remaining: limit, active: true },
    }));
    setTestAnswers((prev) => ({
      ...prev,
      [a.id]: new Array(a.questions?.length || 0).fill(''),
    }));
    showToast('Test başladı! Başarılar dileriz ⏱️', 'info');
  };

  const handleAnswerChange = (assignmentId: string, questionIndex: number, value: string) => {
    setTestAnswers((prev) => {
      const current = prev[assignmentId] ? [...prev[assignmentId]] : [];
      current[questionIndex] = value;
      return { ...prev, [assignmentId]: current };
    });
  };

  const handleSubmitTest = (assignmentId: string) => {
    // stop timer
    setTimers((prev) => {
      const next = { ...prev };
      if (next[assignmentId]) {
        next[assignmentId] = { ...next[assignmentId], active: false };
      }
      return next;
    });

    const answers = testAnswers[assignmentId] || [];
    const result = submitTestAnswers(assignmentId, answers, false);

    if (result.percent >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const handleRetry = (assignmentId: string) => {
    retryTest(assignmentId);
    setTimers((prev) => {
      const next = { ...prev };
      delete next[assignmentId];
      return next;
    });
    setTestAnswers((prev) => {
      const next = { ...prev };
      delete next[assignmentId];
      return next;
    });
  };

  const handlePhotoUpload = (assignmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        submitHomeworkPhoto(assignmentId, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExplainWithAi = async (
    assignmentId: string,
    questionIndex: number,
    questionText: string,
    studentAnswer: string,
    correctAnswer: string
  ) => {
    const key = `${assignmentId}-${questionIndex}`;
    setExplainingQuestion({ key, text: '', loading: true });

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_question',
          question: questionText,
          studentAnswer,
          correctAnswer,
        }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setExplainingQuestion({ key, text: data.explanation, loading: false });
      } else {
        setExplainingQuestion({
          key,
          text: 'Açıklama üretilemedi.',
          loading: false,
        });
      }
    } catch (e) {
      setExplainingQuestion({
        key,
        text: 'Bağlantı hatası oluştu.',
        loading: false,
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-12">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-blue-400">
          Ders Çalışma Modu
        </div>
        <h2 className="font-heading font-extrabold text-3xl text-white">
          Öğrenci <span className="text-blue-400">Portalı</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Size atanan notları inceleyin, süreli testleri çözün ve kitap sayfası fotoğraflarınızı teslim edin.
        </p>
      </div>

      {/* Active Student Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/20 via-sky-900/10 to-transparent border border-blue-500/30 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-base text-white shadow-lg shrink-0"
          style={{ backgroundColor: currentStudent.color }}
        >
          {initials(currentStudent.name)}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Aktif Öğrenci
          </div>
          <div className="font-heading font-bold text-lg text-white">{currentStudent.name}</div>
        </div>
      </div>

      {/* Assignment Feed */}
      <div className="space-y-5">
        {assignments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 text-slate-500 space-y-2">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <div className="font-heading font-bold text-white">Henüz Ödev Bulunmuyor</div>
            <p className="text-xs text-slate-400">
              Öğretmeniniz size veya sınıfa yeni bir içerik yayınladığında burada görünecektir.
            </p>
          </div>
        ) : (
          assignments.map((a) => {
            const sid = currentStudent.id;
            const sub = a.submissions?.[sid];
            const isTest = a.type === 'test';
            const isBook = a.type === 'book';
            const isNote = a.type === 'note';

            const activeTimer = timers[a.id];
            const isTestRunning = !!activeTimer?.active;
            const isTestLocked = isTest && (a.timeLimit || 0) > 0 && !sub && !isTestRunning;

            return (
              <div
                key={a.id}
                className={`p-6 sm:p-7 rounded-3xl bg-white/[0.02] border transition-all ${
                  isNote
                    ? 'border-cyan-500/25 hover:border-cyan-500/45'
                    : isTest
                    ? 'border-purple-500/25 hover:border-purple-500/45'
                    : 'border-amber-500/25 hover:border-amber-500/45'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          isNote
                            ? 'bg-cyan-500/15 text-cyan-300'
                            : isTest
                            ? 'bg-purple-500/15 text-purple-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {isNote ? 'DERS NOTU' : isTest ? 'İNTERAKTİF TEST' : 'KİTAP TESLİMİ'}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Folder className="w-3 h-3 text-cyan-400" />
                        <span>{a.folder}</span>
                      </div>

                      {isTest && (a.timeLimit || 0) > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30">
                          <Timer className="w-3 h-3" />
                          <span>{Math.round((a.timeLimit || 0) / 60)} dk</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
                      {a.title}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isNote ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Çalışma Notu</span>
                      </span>
                    ) : sub && (isTest ? sub.percent !== undefined : sub.photo) ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tamamlandı</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Bekliyor</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions / Text Content */}
                {a.desc && (
                  <div
                    className={`p-4 rounded-2xl mb-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isNote
                        ? 'bg-cyan-500/5 border border-cyan-500/20 text-slate-200'
                        : isTest
                        ? 'bg-purple-500/5 border border-purple-500/20 text-slate-200'
                        : 'bg-amber-500/5 border border-amber-500/20 text-amber-200'
                    }`}
                  >
                    {a.desc}
                  </div>
                )}

                {/* NOTE ACTIONS */}
                {isNote && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setViewingNote(a)}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Notu Görüntüle</span>
                    </button>

                    <button
                      onClick={() => {
                        if (a.fileData) {
                          const link = document.createElement('a');
                          link.href = a.fileData;
                          link.download = a.fileName || 'ders_notu';
                          link.click();
                        } else if (a.desc) {
                          const blob = new Blob([`${a.title}\n\n${a.desc}`], {
                            type: 'text/plain;charset=utf-8',
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${a.title}.txt`;
                          link.click();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>{a.fileName ? 'Dosyayı İndir' : 'Metin Notu İndir (.txt)'}</span>
                    </button>
                  </div>
                )}

                {/* TEST RUNNER */}
                {isTest && (
                  <div className="space-y-4">
                    {/* Locked State before start */}
                    {isTestLocked && (
                      <div className="p-8 rounded-2xl border border-dashed border-blue-500/40 bg-blue-500/5 text-center space-y-3">
                        <Timer className="w-10 h-10 text-blue-400 mx-auto" />
                        <h4 className="font-heading font-bold text-base text-white">Süreli Test</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {a.questions?.length || 0} soru · Süre:{' '}
                          <b className="text-white">
                            {Math.round((a.timeLimit || 0) / 60)} dakika
                          </b>
                          <br />
                          Başlattığınızda süre geriye sayar, süre dolunca cevaplarınız otomatik teslim edilir.
                        </p>
                        <button
                          onClick={() => handleStartTest(a)}
                          className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                          <span>Testi Başlat</span>
                        </button>
                      </div>
                    )}

                    {/* Active Test Questions or Submitted Result */}
                    {(!isTestLocked || sub) && (
                      <div className="space-y-4">
                        {/* Live Timer badge */}
                        {isTestRunning && activeTimer && (
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-sm border shadow-lg ${
                              activeTimer.remaining <= 15
                                ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                                : 'bg-blue-500/20 border-blue-500 text-blue-300'
                            }`}
                          >
                            <Timer className="w-4 h-4" />
                            <span>Kalan Süre: {fmtTime(activeTimer.remaining)}</span>
                          </div>
                        )}

                        {/* Questions list */}
                        {a.questions?.map((q, i) => {
                          const currentVal = (testAnswers[a.id] || [])[i] || '';
                          const ansObj = sub?.answers?.[i];

                          return (
                            <div
                              key={i}
                              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5"
                            >
                              <div className="font-medium text-xs sm:text-sm text-slate-200">
                                <span className="font-bold text-cyan-400 mr-1.5">{i + 1}.</span>
                                {q.q}
                              </div>

                              {/* Input or Result */}
                              {!sub ? (
                                <input
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) => handleAnswerChange(a.id, i, e.target.value)}
                                  placeholder="Cevabınızı yazın..."
                                  className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs focus:outline-none"
                                />
                              ) : (
                                <div className="space-y-2 pt-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">Verdiğin Yanıt:</span>
                                    <span className="font-semibold text-white">
                                      {ansObj?.given || '(Boş bırakıldı)'}
                                    </span>
                                    {ansObj?.ok ? (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Doğru
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-bold text-[10px] flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Yanlış — Doğrusu:{' '}
                                        <b className="underline text-white">{q.a}</b>
                                      </span>
                                    )}
                                  </div>

                                  {/* AI Question Explainer Button */}
                                  {!ansObj?.ok && (
                                    <div>
                                      <button
                                        onClick={() =>
                                          handleExplainWithAi(
                                            a.id,
                                            i,
                                            q.q,
                                            ansObj?.given || '',
                                            q.a
                                          )
                                        }
                                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Yapay Zekaya Bu Sorunun Çözümünü Açıklat</span>
                                      </button>

                                      {/* Expanded AI Explanation */}
                                      {explainingQuestion?.key === `${a.id}-${i}` && (
                                        <div className="mt-2 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed whitespace-pre-wrap animate-fade">
                                          {explainingQuestion.loading ? (
                                            <div className="flex items-center gap-2 text-slate-400">
                                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                                              <span>Gemini çözümü hazırlıyor...</span>
                                            </div>
                                          ) : (
                                            explainingQuestion.text
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Submit Button or Score Breakdown */}
                        {!sub ? (
                          <button
                            onClick={() => handleSubmitTest(a.id)}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/45 transition-all cursor-pointer mt-3"
                          >
                            <Send className="w-4 h-4" />
                            <span>Cevapları Gönder</span>
                          </button>
                        ) : (
                          <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                            <div
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-heading font-bold text-sm ${
                                sub.percent! >= 70
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                  : sub.percent! >= 40
                                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                  : 'bg-red-500/20 border border-red-500/40 text-red-300'
                              }`}
                            >
                              <Award className="w-4 h-4" />
                              <span>
                                Skor: %{sub.percent} ({sub.correct} / {sub.total})
                              </span>
                            </div>

                            <button
                              onClick={() => handleRetry(a.id)}
                              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Testi Tekrar Çöz</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* BOOK HOMEWORK SUBMISSION */}
                {isBook && (
                  <div className="space-y-4 pt-1">
                    {sub?.photo ? (
                      <div className="space-y-3">
                        <div className="max-w-xs rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                          <img
                            src={sub.photo}
                            alt="Teslim Edilen Ödev"
                            className="w-full h-auto object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                              setViewingPhoto({
                                url: sub.photo!,
                                title: a.title,
                                studentName: currentStudent.name,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ödev Fotoğrafı Teslim Edildi</span>
                          </span>

                          <label className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Yeniden Yükle</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(a.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block p-6 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-center cursor-pointer transition-all">
                          <Camera className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                          <span className="font-heading font-bold text-sm text-white block">
                            Çözdüğünüz sayfanın fotoğrafını yükleyin
                          </span>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG veya Kamera ile Çek</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(a.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher Feedback Box */}
                {sub?.feedback && (
                  <div className="mt-5 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1.5 animate-fade">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                      <MessageSquareQuote className="w-4 h-4 text-purple-400" />
                      <span>Öğretmen Yorumu</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                      "{sub.feedback}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NoteModal assignment={viewingNote} onClose={() => setViewingNote(null)} />
      <PhotoModal
        photoUrl={viewingPhoto?.url || null}
        title={viewingPhoto?.title || ''}
        studentName={viewingPhoto?.studentName}
        onClose={() => setViewingPhoto(null)}
      />
    </div>
  );
}
