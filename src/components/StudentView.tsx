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

  // --- AI Study Coach (Kişisel Çalışma Koçu) State ---
  const [coachMessages, setCoachMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba! Ben senin Gemini Kişisel Çalışma Koçunum. 🎓 Anlamadığın formülleri, çözemediğin soruları veya konu özetlerini bana dilediğin gibi sorabilirsin!',
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // --- Quick Practice AI Quiz (Hızlı Pratik Testi) State ---
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
      <div className="text-center py-20 text-slate-500 space-y-3">
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
      } else if (a.type === 'book' && sub?.photo) {
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
          { role: 'assistant', text: 'Üzgünüm, yanıt üretirken küçük bir aksaklık oldu. Tekrar sorabilir misin?' },
        ]);
      }
    } catch (e) {
      setCoachMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantını kontrol et.' },
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
        showToast('Gemini AI pratik sorularını hazırladı! ⚡', 'success');
      } else {
        showToast('Pratik test oluşturulamadı. Lütfen tekrar dene.', 'error');
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
    <div className="space-y-7 animate-fade pb-16">
      {/* 1. Header & Greeting Bar */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-extrabold text-xl text-white shadow-lg shadow-blue-500/20 shrink-0"
            style={{ backgroundColor: studentColor }}
          >
            {initials(studentDisplayName)}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-semibold mb-1">
              <span>🎓 Öğrenci Başarı Portalı</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Hoş Geldin, <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">{studentDisplayName}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Ders materyallerini incele, ödevlerini tamamla ve Gemini AI koçunla pratik yap.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 self-start sm:self-auto">
          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Sınıfa Katıl</span>
          </button>

          <button
            onClick={() => setIsPracticeModalOpen(!isPracticeModalOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>⚡ Hızlı AI Pratik</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Oturumu Kapat"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* 2. Progress & Activity KPI Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Kayıtlı Sınıflarım
            </div>
            <div className="font-heading font-extrabold text-2xl text-indigo-400 flex items-center gap-1.5">
              <span>{state.joinedClassrooms.length}</span>
              <School className="w-5 h-5 text-indigo-400/50" />
            </div>
            <div className="text-[10px] text-indigo-400/90">Aktif Sınıf & Şube</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tamamlanan Görevler
            </div>
            <div className="font-heading font-extrabold text-2xl text-white">
              {stats.completedTasks}
            </div>
            <div className="text-[10px] text-blue-400">Test & Kitap Teslimi</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Çalışma Serisi
            </div>
            <div className="font-heading font-extrabold text-2xl text-amber-400 flex items-center gap-1.5">
              <span>{stats.streakDays} Gün</span>
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
            </div>
            <div className="text-[10px] text-amber-400/90">Aktif Öğrenme Serisi</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Başarı Ortalaması
            </div>
            <div className="font-heading font-extrabold text-2xl text-emerald-400">
              {stats.avgScore}
            </div>
            <div className="text-[10px] text-emerald-400/90">Puan Değerlendirmesi</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 2.5 Joined Classrooms Section */}
      <section className="p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                Kayıtlı Olduğum Sınıflar & Şubeler ({state.joinedClassrooms.length})
              </h2>
              <p className="text-[11px] text-slate-400">
                Katıldığın sınıfların ders notlarına ve ödevlerine buradan erişebilirsin.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Sınıfa Katıl</span>
          </button>
        </div>

        {state.joinedClassrooms.length === 0 ? (
          <div className="p-6 sm:p-8 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-heading font-bold text-white text-sm">
                Henüz bir sınıfa katılmadınız
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Öğretmeninizin sizinle paylaştığı 6 haneli katılım kodunu (örn: EDF92A) girerek sınıfınıza dahil olabilirsiniz.
              </p>
            </div>
            <button
              onClick={() => setIsJoinClassModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 mx-auto shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Katılım Kodu Gir</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {state.joinedClassrooms.map((c) => {
              const classAssignments = assignments.filter((a) => a.classroomId === c.id);

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading font-bold text-sm text-white line-clamp-1">
                        {c.name}
                      </h4>
                      {c.subject && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 font-semibold text-[10px]">
                          {c.subject}
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{c.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Kod: <b className="font-mono text-cyan-400">{c.joinCode}</b>
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`"${c.name}" sınıfından ayrılmak istediğinize emin misiniz?`)) {
                          leaveClassroom(c.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-[10px] font-semibold cursor-pointer"
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

      {/* 3. Quick AI Practice Module (Expandable or Inline) */}
      {isPracticeModalOpen && (
        <section className="p-6 sm:p-7 rounded-3xl bg-[#111827]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(6,182,212,0.15)] space-y-5 animate-fade">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <h2 className="font-heading font-bold text-lg text-white">
                Gemini AI Hızlı Pratik & Sınav Simülatörü
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
            <span className="text-xs font-semibold text-slate-300">
              Hangi dersten test çözmek istersin?
            </span>
            <div className="flex flex-wrap gap-2">
              {practiceChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGeneratePracticeQuiz(chip)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer',
                    practiceTopic === chip
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
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
              placeholder="Özel bir konu yaz (örn: Çarpanlara Ayırma)..."
              className="flex-1 min-w-[240px] px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
            />
            <button
              disabled={isPracticeLoading}
              onClick={() => handleGeneratePracticeQuiz()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isPracticeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sorular Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Testi Oluştur & Başlat</span>
                </>
              )}
            </button>
          </div>

          {/* Rendered Practice Quiz Questions */}
          {practiceQuiz && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-cyan-300">
                  {practiceQuiz.title} ({practiceQuiz.questions?.length} Soru)
                </h3>
                {practiceSubmitted && practiceScore && (
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
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
                        'p-4 rounded-2xl border space-y-2.5 transition-all',
                        practiceSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-red-950/20 border-red-500/40'
                          : 'bg-slate-900/80 border-slate-800'
                      )}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span className="text-cyan-400 font-bold">Soru {idx + 1}</span>
                        {practiceSubmitted && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold',
                              isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                            )}
                          >
                            {isCorrect ? '✓ Doğru' : '✕ Yanlış'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-white font-medium">{q.q}</p>

                      <input
                        type="text"
                        disabled={practiceSubmitted}
                        value={practiceAnswers[idx] || ''}
                        onChange={(e) => {
                          const updated = [...practiceAnswers];
                          updated[idx] = e.target.value;
                          setPracticeAnswers(updated);
                        }}
                        placeholder="Cevabını buraya yaz..."
                        className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                      />

                      {practiceSubmitted && !isCorrect && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Doğru Cevap: <b>{q.a}</b>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!practiceSubmitted ? (
                <button
                  onClick={handlePracticeSubmit}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Testi Tamamla ve Sonucu Gör
                </button>
              ) : (
                <button
                  onClick={() => handleGeneratePracticeQuiz()}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Yeni Sorularla Tekrar Çöz</span>
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* 4. Interactive Gemini AI Personal Study Coach & Question Solver */}
      <section className="p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                Gemini AI Kişisel Çalışma Koçun
              </h2>
              <p className="text-[11px] text-slate-400">
                Anlamadığın konuları sor, özet iste veya formül çözümünü adım adım öğren.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>7/24 Aktif</span>
          </div>
        </div>

        {/* Coach Chat Stream */}
        <div className="space-y-3 min-h-[160px] max-h-[300px] overflow-y-auto pr-1">
          {coachMessages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2.5',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={cn(
                  'p-3 rounded-2xl text-xs sm:text-sm max-w-xl leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isCoachLoading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Gemini yanıt hazırlıyor...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt recommendations */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setCoachInput('İngilizce Present Perfect Tense konusunu 3 maddede özetler misin?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-400 text-[11px] text-slate-400 hover:text-indigo-300 transition-all cursor-pointer"
          >
            💡 Present Perfect Özeti
          </button>
          <button
            type="button"
            onClick={() => {
              setCoachInput('Matematikte Pisagor Teoremi nedir ve nerede kullanılır?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-400 text-[11px] text-slate-400 hover:text-indigo-300 transition-all cursor-pointer"
          >
            📐 Pisagor Teoremi Nedir?
          </button>
          <button
            type="button"
            onClick={() => {
              setCoachInput('Bana 8. sınıf seviyesinde fen bilgisinden pratik bir soru sorabilir misin?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-400 text-[11px] text-slate-400 hover:text-indigo-300 transition-all cursor-pointer"
          >
            🧪 Bana Bir Fen Sorusu Sor
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleSendCoachMessage} className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            value={coachInput}
            onChange={(e) => setCoachInput(e.target.value)}
            placeholder="Bir konu, soru veya formül sor..."
            className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isCoachLoading || !coachInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sor</span>
          </button>
        </form>
      </section>

      {/* 5. Assignment Feed / Empty State */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Öğretmeninin Atadığı Ödevler & Notlar ({assignments.length})</span>
          </h2>
        </div>

        {assignments.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-3xl bg-[#111827]/70 border border-dashed border-slate-800 text-slate-400 space-y-4 animate-fade">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.2)] text-2xl">
              🎉
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
                Harika! Şu an tamamlanması gereken bekleyen bir ödevin bulunmuyor.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Öğretmenin yeni bir ders notu, test veya kitap ödevi yayınladığında burada görüntülenecektir. Boş vaktinde yukarıdaki <b>⚡ Hızlı AI Pratik</b> butonuyla kendini test edebilirsin!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {assignments.map((a) => {
              const sid = studentId;
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
                  className={cn(
                    'p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border transition-all space-y-5 shadow-lg',
                    sub
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : isTestRunning
                      ? 'border-purple-500/50 shadow-purple-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  )}
                >
                  {/* Top Bar: Badges, Folder, Title */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase',
                          isNote
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : isTest
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        )}
                      >
                        {isNote ? 'Ders Notu' : isTest ? 'İnteraktif Test' : 'Kitap Ödevi'}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                        📁 {a.folder}
                      </span>

                      {a.classroomName && (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1">
                          <School className="w-3.5 h-3.5" />
                          <span>{a.classroomName}</span>
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {sub ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isTest
                            ? `Puan: %${sub.percent} (${sub.correct}/${sub.total})`
                            : sub.finalScore !== undefined
                            ? `👨‍🏫 Not: %${sub.finalScore}`
                            : sub.aiScore !== undefined
                            ? `🤖 AI Notu: %${sub.aiScore}`
                            : 'Tamamlandı'}
                        </span>
                      </span>
                    ) : isTestRunning ? (
                      <div className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                        <Timer className="w-4 h-4 text-purple-400" />
                        <span>Kalan Süre: {fmtTime(activeTimer.remaining)}</span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                        ⏳ Bekliyor
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
                      {a.title}
                    </h3>
                    {a.desc && (
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {a.desc}
                      </p>
                    )}
                  </div>

                  {/* NOTE VIEW */}
                  {isNote && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => setViewingNote(a)}
                        className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ders Notunu İncele</span>
                      </button>
                    </div>
                  )}

                  {/* TEST VIEW */}
                  {isTest && (
                    <div className="space-y-4 pt-1">
                      {isTestLocked ? (
                        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                          <p className="text-xs text-slate-300">
                            Bu test <b>{Math.round((a.timeLimit || 120) / 60)} dakika</b> sürelidir.
                            Testi başlattığınızda süre geri saymaya başlar.
                          </p>
                          <button
                            onClick={() => handleStartTest(a)}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Testi Başlat</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {a.questions?.map((q, qIdx) => {
                            const rawAns = sub
                              ? sub.answers?.[qIdx]
                              : testAnswers[a.id]?.[qIdx] || '';
                            const studentAnsStr =
                              typeof rawAns === 'string'
                                ? rawAns
                                : (rawAns as any)?.answer || '';
                            const isCorrect =
                              sub &&
                              studentAnsStr.trim().toLowerCase() === (q.a || '').trim().toLowerCase();

                            const explKey = `${a.id}-${qIdx}`;
                            const isExplainingThis = explainingQuestion?.key === explKey;

                            return (
                              <div
                                key={qIdx}
                                className={cn(
                                  'p-4 rounded-2xl border space-y-2.5 transition-all',
                                  sub
                                    ? isCorrect
                                      ? 'bg-emerald-950/20 border-emerald-500/40'
                                      : 'bg-red-950/20 border-red-500/40'
                                    : 'bg-slate-900/80 border-slate-800'
                                )}
                              >
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                                  <span className="text-purple-400 font-bold">Soru {qIdx + 1}</span>
                                  {sub && (
                                    <span
                                      className={cn(
                                        'px-2 py-0.5 rounded text-[10px] font-bold',
                                        isCorrect
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-red-500/20 text-red-300'
                                      )}
                                    >
                                      {isCorrect ? '✓ Doğru' : '✕ Yanlış'}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs sm:text-sm text-white font-medium">{q.q}</p>

                                <input
                                  type="text"
                                  disabled={!!sub}
                                  value={studentAnsStr}
                                  onChange={(e) => handleAnswerChange(a.id, qIdx, e.target.value)}
                                  placeholder="Cevabınızı buraya yazınız..."
                                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-purple-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                                />

                                {sub && !isCorrect && (
                                  <div className="space-y-2 pt-1">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span>
                                        Doğru Cevap: <b>{q.a}</b>
                                      </span>
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleExplainQuestion(a.id, qIdx, q.q, q.a, studentAnsStr)
                                      }
                                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                      <span>Yapay Zeka Çözüm Açıklamasını Gör</span>
                                    </button>

                                    {isExplainingThis && (
                                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 animate-fade">
                                        {explainingQuestion.loading ? (
                                          <div className="flex items-center gap-2 text-purple-300">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Gemini çözümü açıklıyor...</span>
                                          </div>
                                        ) : (
                                          explainingQuestion.text
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {!sub && isTestRunning && (
                            <button
                              onClick={() => handleSubmitTest(a.id)}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                            >
                              Testi Bitir ve Gönder
                            </button>
                          )}

                          {sub && (
                            <button
                              onClick={() => handleRetry(a.id)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Testi Tekrar Çöz</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BOOK / WRITTEN ASSIGNMENT VIEW */}
                  {isBook && (
                    <div className="space-y-4 pt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setSubmitModalAssignment(a)}
                          className={cn(
                            'px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md',
                            sub
                              ? 'bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300'
                              : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-indigo-500/20'
                          )}
                        >
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span>
                            {sub ? '🔍 Teslim ve AI Not Değerlendirmesini Gör' : '✍️ Ödevi Teslim Et & AI ile Değerlendir'}
                          </span>
                        </button>
                      </div>

                      {sub?.photo && (
                        <div className="space-y-2 pt-2">
                          <div className="max-w-xs rounded-2xl overflow-hidden border border-slate-800 bg-black/30">
                            <img
                              src={sub.photo}
                              alt="Teslim Edilen Ödev"
                              className="w-full h-auto object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() =>
                                setViewingPhoto({
                                  url: sub.photo!,
                                  title: a.title,
                                  studentName: studentDisplayName,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Teacher Feedback Note */}
                  {sub?.feedback && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
                      <div className="text-purple-300 font-bold flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        <span>Öğretmeninin Geri Bildirimi:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed italic">{sub.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      <AssignmentSubmitModal
        assignment={submitModalAssignment}
        isOpen={!!submitModalAssignment}
        onClose={() => setSubmitModalAssignment(null)}
      />
      <JoinClassroomModal
        isOpen={isJoinClassModalOpen}
        onClose={() => setIsJoinClassModalOpen(false)}
      />
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
