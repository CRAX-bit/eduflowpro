'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, Question } from '@/types';
import { initials, fmtTime, cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Folder,
  Timer,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
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
  LogOut,
  Flame,
  Clock,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Zap,
  ListCheck,
  Check,
  RefreshCw,
  School,
  KeyRound,
  Plus,
  Trash2,
  Compass,
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { JoinClassroomModal } from './JoinClassroomModal';
import { AssignmentSubmitModal } from './AssignmentSubmitModal';

export function StudentView() {
  const {
    state,
    getStudentById,
    getVisibleAssignments,
    submitTestAnswers,
    retryTest,
    submitHomeworkPhoto,
    leaveClassroom,
    logout,
    showToast,
  } = useEduFlow();

  const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || '';
  const currentStudent = getStudentById(studentId);
  const assignments = getVisibleAssignments(studentId);

  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);

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

  // --- Kişisel Çalışma Asistanı (Coach Chat) State ---
  const [coachMessages, setCoachMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba! Ben senin çalışma asistanınım. Formülleri, çözemediğin soruları veya konu özetlerini bana dilediğin gibi sorabilirsin.',
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // --- Konu Alıştırması (Quick Practice) State ---
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState('Matematik Üslü Sayılar');
  const [practiceCount, setPracticeCount] = useState(3);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [practiceQuiz, setPracticeQuiz] = useState<{
    title: string;
    folder: string;
    questions: Question[];
  } | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<string[]>([]);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceScore, setPracticeScore] = useState<{ correct: number; total: number; percent: number } | null>(null);

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

  if (!state.session && !state.currentStudentId) {
    return (
      <div className="text-center py-20 text-slate-400 space-y-3">
        <p>Lütfen önce öğrenci girişi yapınız.</p>
      </div>
    );
  }

  const studentDisplayName = state.session?.name || currentStudent?.name || 'Öğrenci';
  const studentColor = currentStudent?.color || '#3b82f6';

  // --- KPI Stats Calculation ---
  const stats = useMemo(() => {
    let completed = 0;
    let totalScore = 0;
    let scoredCount = 0;

    assignments.forEach((a) => {
      const sub = a.submissions?.[studentId];
      if (a.type === 'test' && sub?.percent !== undefined) {
        completed += 1;
        totalScore += sub.percent;
        scoredCount += 1;
      } else if (sub?.finalScore !== undefined) {
        completed += 1;
        totalScore += sub.finalScore;
        scoredCount += 1;
      } else if (sub?.photo || sub?.responseText) {
        completed += 1;
      }
    });

    const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 85;
    return {
      completedTasks: completed,
      streakDays: Math.max(3, completed + 2),
      weeklyHours: (completed * 0.8 + 2.5).toFixed(1),
      avgScore: scoredCount > 0 ? `%${avgScore}` : '%90',
    };
  }, [assignments, studentId]);

  // --- Handlers for Teacher Assigned Tests ---
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
    setTestAnswers((prev) => ({ ...prev, [assignmentId]: [] }));
  };

  const handlePhotoUpload = (assignmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      submitHomeworkPhoto(assignmentId, dataUrl);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  const handleExplainQuestion = async (
    assignmentId: string,
    qIdx: number,
    questionText: string,
    correctAnswer: string,
    studentAnswer: string
  ) => {
    const key = `${assignmentId}-${qIdx}`;
    setExplainingQuestion({ key, text: '', loading: true });

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_question',
          question: questionText,
          correctAnswer,
          studentAnswer,
        }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setExplainingQuestion({ key, text: data.explanation, loading: false });
      } else {
        setExplainingQuestion({
          key,
          text: 'Bu sorunun açıklaması oluşturulurken bir hata oluştu.',
          loading: false,
        });
      }
    } catch (e) {
      setExplainingQuestion({
        key,
        text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.',
        loading: false,
      });
    }
  };

  // --- Handlers for AI Study Coach Chat ---
  const handleSendCoachMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim() || isCoachLoading) return;

    const userText = coachInput.trim();
    setCoachMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setCoachInput('');
    setIsCoachLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_assistant',
          message: `Öğrenci sorusu: ${userText}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setCoachMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setCoachMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Yanıt üretilirken bir aksaklık oldu. Lütfen sorunuzu tekrar iletin.' },
        ]);
      }
    } catch (e) {
      setCoachMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.' },
      ]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // --- Handlers for Quick AI Practice Quiz ---
  const handleGeneratePracticeQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || practiceTopic).trim();
    if (!topic) return;
    setPracticeTopic(topic);
    setIsPracticeLoading(true);
    setPracticeQuiz(null);
    setPracticeSubmitted(false);
    setPracticeScore(null);
    setPracticeAnswers([]);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_quiz',
          topic,
          count: practiceCount,
          grade: 'Ortaokul / Lise',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPracticeQuiz(data.data);
        setPracticeAnswers(new Array(data.data.questions?.length || 0).fill(''));
        showToast('Alıştırma soruları hazırlandı.', 'success');
      } else {
        showToast('Alıştırma testi oluşturulamadı. Lütfen tekrar deneyin.', 'error');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsPracticeLoading(false);
    }
  };

  const handlePracticeSubmit = () => {
    if (!practiceQuiz?.questions) return;
    let correct = 0;
    practiceQuiz.questions.forEach((q, idx) => {
      const userAns = (practiceAnswers[idx] || '').trim().toLowerCase();
      const trueAns = (q.a || '').trim().toLowerCase();
      if (userAns && userAns === trueAns) {
        correct += 1;
      }
    });

    const total = practiceQuiz.questions.length;
    const percent = Math.round((correct / total) * 100);
    setPracticeScore({ correct, total, percent });
    setPracticeSubmitted(true);

    if (percent >= 70) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const practiceChips = [
    'Matematik Üslü ve Köklü Sayılar',
    'İngilizce Present Perfect Tense',
    'Fen Bilgisi Hücre Bölünmeleri',
    'Türkçe Paragraf ve Ana Fikir',
    'Tarih Milli Mücadele Dönemi',
  ];

  return (
    <div className="space-y-6 animate-fade pb-16">
      {/* 1. Calm Workspace Header */}
      <header className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-lg text-white shadow-sm shrink-0"
            style={{ backgroundColor: studentColor }}
          >
            {initials(studentDisplayName)}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
              <span>Öğrenci Portalı</span>
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Hoş Geldin, {studentDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Ödevlerinizi tamamlayın, ders notlarını inceleyin ve çalışma asistanınızla pratik yapın.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Sınıfa Katıl</span>
          </button>

          <button
            onClick={() => setIsPracticeModalOpen(!isPracticeModalOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Konu Alıştırması</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            title="Oturumu Kapat"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </header>

      {/* 2. Workspace Metrics Ribbon */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Kayıtlı Sınıflarım
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.joinedClassrooms.length}
            </div>
            <div className="text-[11px] text-slate-400">Aktif Şube</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Tamamlanan Görevler
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {stats.completedTasks}
            </div>
            <div className="text-[11px] text-slate-400">Ödev & Test</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Çalışma Serisi
            </div>
            <div className="font-heading font-bold text-2xl text-amber-400">
              {stats.streakDays} Gün
            </div>
            <div className="text-[11px] text-slate-400">Öğrenme Serisi</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Başarı Ortalaması
            </div>
            <div className="font-heading font-bold text-2xl text-emerald-400">
              {stats.avgScore}
            </div>
            <div className="text-[11px] text-slate-400">Not Değerlendirmesi</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. Joined Classrooms Section */}
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-heading font-semibold text-base text-white">
                Kayıtlı Olduğum Sınıflar ({state.joinedClassrooms.length})
              </h2>
              <p className="text-xs text-slate-400">
                Katıldığınız sınıfların ders notlarına ve ödevlerine buradan erişebilirsiniz.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Sınıfa Katıl</span>
          </button>
        </div>

        {state.joinedClassrooms.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
            <KeyRound className="w-8 h-8 mx-auto text-slate-500" />
            <h4 className="font-medium text-white text-sm">Henüz bir sınıfa katılmadınız</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Öğretmeninizin sizinle paylaştığı 6 haneli katılım kodunu girerek sınıfınıza dahil olabilirsiniz.
            </p>
            <button
              onClick={() => setIsJoinClassModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs inline-flex items-center gap-1.5 mt-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Katılım Kodu Gir</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {state.joinedClassrooms.map((c) => {
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-white line-clamp-1">{c.name}</h4>
                      {c.subject && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium">
                          {c.subject}
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Kod: <b className="font-mono text-slate-200">{c.joinCode}</b>
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`"${c.name}" sınıfından ayrılmak istediğinize emin misiniz?`)) {
                          leaveClassroom(c.id);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors cursor-pointer"
                    >
                      Ayrıl
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Quick Practice Modal / Module */}
      {isPracticeModalOpen && (
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-fade">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h2 className="font-heading font-semibold text-base text-white">
                Konu Alıştırması & Test Modülü
              </h2>
            </div>
            <button
              onClick={() => setIsPracticeModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Kapat ✕
            </button>
          </div>

          {/* Quick Subject Chips */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400">Örnek Konular:</span>
            <div className="flex flex-wrap gap-2">
              {practiceChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGeneratePracticeQuiz(chip)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                    practiceTopic === chip
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={practiceTopic}
              onChange={(e) => setPracticeTopic(e.target.value)}
              placeholder="Özel bir konu yazın (örn: Çarpanlara Ayırma)..."
              className="flex-1 min-w-[240px] px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
            />
            <button
              disabled={isPracticeLoading}
              onClick={() => handleGeneratePracticeQuiz()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPracticeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sorular Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Testi Başlat</span>
                </>
              )}
            </button>
          </div>

          {/* Rendered Practice Quiz Questions */}
          {practiceQuiz && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">
                  {practiceQuiz.title} ({practiceQuiz.questions?.length} Soru)
                </h3>
                {practiceSubmitted && practiceScore && (
                  <div className="px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    Puan: %{practiceScore.percent} ({practiceScore.correct}/{practiceScore.total} Doğru)
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {practiceQuiz.questions?.map((q, idx) => {
                  const isCorrect =
                    practiceSubmitted &&
                    (practiceAnswers[idx] || '').trim().toLowerCase() === (q.a || '').trim().toLowerCase();

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'p-4 rounded-xl border space-y-2.5 transition-all',
                        practiceSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-red-950/20 border-red-500/40'
                          : 'bg-slate-950/70 border-slate-800'
                      )}
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                        <span className="text-slate-300 font-semibold">Soru {idx + 1}</span>
                        {practiceSubmitted && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-semibold',
                              isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                            )}
                          >
                            {isCorrect ? '✓ Doğru' : '✕ Yanlış'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-100 font-medium leading-relaxed">{q.q}</p>

                      <input
                        type="text"
                        disabled={practiceSubmitted}
                        value={practiceAnswers[idx] || ''}
                        onChange={(e) => {
                          const updated = [...practiceAnswers];
                          updated[idx] = e.target.value;
                          setPracticeAnswers(updated);
                        }}
                        placeholder="Cevabınızı buraya yazınız..."
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                      />

                      {practiceSubmitted && !isCorrect && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Doğru Cevap: <b className="text-emerald-400">{q.a}</b>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!practiceSubmitted && (
                <button
                  onClick={handlePracticeSubmit}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Alıştırmayı Tamamla ve Sonucu Gör
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* 5. Assignment Items List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-base text-white flex items-center gap-2">
            <ListCheck className="w-5 h-5 text-indigo-400" />
            <span>Ödevler & Çalışma Materyalleri ({assignments.length})</span>
          </h2>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-500" />
            <h4 className="font-medium text-white text-sm">Henüz atanmış bir ödev veya not bulunmuyor</h4>
            <p className="text-xs text-slate-400">
              Öğretmeniniz yeni bir materyal yayınladığında bu alanda görüntülenecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((a) => {
              const sub = a.submissions?.[studentId];
              const isTest = a.type === 'test';
              const isBook = a.type === 'book';
              const isNote = a.type === 'note';
              const activeTimer = timers[a.id];
              const isTestRunning = isTest && activeTimer?.active;

              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-md text-[11px] font-semibold',
                            isNote
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                              : isTest
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          )}
                        >
                          {isNote ? 'Ders Notu' : isTest ? 'İnteraktif Test' : 'Yazılı Ödev'}
                        </span>
                        {a.classroomName && (
                          <span className="text-xs text-indigo-400 font-medium">
                            • {a.classroomName}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      {sub ? (
                        sub.status === 'reviewed' ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Not: %{sub.finalScore ?? 85}</span>
                          </span>
                        ) : isTest ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Puan: %{sub.percent}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Değerlendirme Bekleniyor</span>
                          </span>
                        )
                      ) : isTestRunning ? (
                        <div className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5" />
                          <span>Kalan: {fmtTime(activeTimer.remaining)}</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs font-medium">
                          Bekliyor
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-heading font-semibold text-base text-white">{a.title}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">Ünite: {a.folder}</div>
                    </div>

                    {a.desc && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {a.desc}
                      </p>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    {/* Note Action */}
                    {isNote && (
                      <button
                        onClick={() => setViewingNote(a)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ders Notunu Oku</span>
                      </button>
                    )}

                    {/* Written / Book Action */}
                    {isBook && (
                      <button
                        onClick={() => setSubmitModalAssignment(a)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                          sub
                            ? sub.status === 'reviewed'
                              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        )}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                          {sub
                            ? sub.status === 'reviewed'
                              ? 'Öğretmen Değerlendirmesini Gör'
                              : 'Tesliminizi İnceleyin (Beklemede)'
                            : 'Ödevi Teslim Et'}
                        </span>
                      </button>
                    )}

                    {/* Test Action */}
                    {isTest && !isTestRunning && !sub && (
                      <button
                        onClick={() => handleStartTest(a)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Testi Başlat</span>
                      </button>
                    )}

                    {isTest && sub && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRetry(a.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Tekrar Çöz</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Test Active Running Form */}
                  {isTestRunning && a.questions && (
                    <div className="space-y-4 pt-3 border-t border-slate-800">
                      {a.questions.map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="text-xs font-semibold text-slate-400">Soru {idx + 1}</span>
                          <p className="text-xs sm:text-sm text-slate-200 font-medium">{q.q}</p>
                          <input
                            type="text"
                            value={testAnswers[a.id]?.[idx] || ''}
                            onChange={(e) => handleAnswerChange(a.id, idx, e.target.value)}
                            placeholder="Cevabınızı giriniz..."
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-400 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => handleSubmitTest(a.id)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
                      >
                        Testi Bitir ve Gönder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Kişisel Çalışma Asistanı (Coach Chat) */}
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-heading font-semibold text-base text-white">
              Çalışma Asistanı (Soru & Konu Danışmanı)
            </h3>
            <p className="text-xs text-slate-400">
              Anlamadığınız konuları ve adım adım soru çözümlerini danışabilirsiniz.
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {coachMessages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed max-w-[85%]',
                m.role === 'user'
                  ? 'ml-auto bg-indigo-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              )}
            >
              {m.text}
            </div>
          ))}
          {isCoachLoading && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Asistan yanıt hazırlıyor...</span>
            </div>
          )}
        </div>

        {/* Chat Form */}
        <form onSubmit={handleSendCoachMessage} className="flex gap-2">
          <input
            type="text"
            value={coachInput}
            onChange={(e) => setCoachInput(e.target.value)}
            placeholder="Bir soru veya konu danışın (örn: Fotosentez evreleri nelerdir?)..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!coachInput.trim() || isCoachLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gönder</span>
          </button>
        </form>
      </section>

      {/* Modals */}
      {isJoinClassModalOpen && (
        <JoinClassroomModal
          isOpen={isJoinClassModalOpen}
          onClose={() => setIsJoinClassModalOpen(false)}
        />
      )}

      {submitModalAssignment && (
        <AssignmentSubmitModal
          assignment={submitModalAssignment}
          isOpen={!!submitModalAssignment}
          onClose={() => setSubmitModalAssignment(null)}
        />
      )}

      {viewingNote && (
        <NoteModal
          assignment={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}

      {viewingPhoto && (
        <PhotoModal
          photoUrl={viewingPhoto.url}
          title={viewingPhoto.title}
          studentName={viewingPhoto.studentName}
          onClose={() => setViewingPhoto(null)}
        />
      )}
    </div>
  );
}
