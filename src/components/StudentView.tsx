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
  FileUp,
  FileSpreadsheet,
  Layers,
  Inbox,
  Hourglass,
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { JoinClassroomModal } from './JoinClassroomModal';
import { AssignmentSubmitModal } from './AssignmentSubmitModal';

type AssignmentFilterTab = 'pending' | 'evaluating' | 'completed' | 'all';

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

  const [assignmentFilterTab, setAssignmentFilterTab] = useState<AssignmentFilterTab>('pending');
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
      text: 'Merhaba! Ben senin kişisel çalışma asistanınım. Anlamadığın formülleri, çözemediğin soruları veya konu özetlerini bana dilediğin gibi sorabilirsin.',
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // --- Konu Alıştırması (Quick Practice) State ---
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState('Matematik Üslü ve Köklü Sayılar');
  const [practiceCount, setPracticeCount] = useState<number>(5);
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
  const studentColor = currentStudent?.color || '#6366f1';

  // --- Real Stats Tracker Calculation (No Fake Mock Data) ---
  const stats = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let evaluatingCount = 0;
    let totalScoreSum = 0;
    let scoredItemsCount = 0;

    assignments.forEach((a) => {
      const sub = a.submissions?.[studentId];
      if (a.type === 'note') {
        // Read notes are informative
        return;
      }

      if (!sub) {
        pendingCount += 1;
      } else if (sub.status === 'reviewed') {
        completedCount += 1;
        if (sub.finalScore !== undefined) {
          totalScoreSum += sub.finalScore;
          scoredItemsCount += 1;
        }
      } else if (a.type === 'test' && sub.percent !== undefined) {
        completedCount += 1;
        totalScoreSum += sub.percent;
        scoredItemsCount += 1;
      } else {
        // Submitted, waiting for teacher approval
        evaluatingCount += 1;
      }
    });

    const averageScore = scoredItemsCount > 0 ? Math.round(totalScoreSum / scoredItemsCount) : null;
    const streakDays = completedCount > 0 ? Math.min(completedCount, 7) : 0;

    return {
      completedCount,
      pendingCount,
      evaluatingCount,
      totalCount: assignments.length,
      averageScore,
      streakDays,
      hasActivity: completedCount > 0 || evaluatingCount > 0,
    };
  }, [assignments, studentId]);

  // Filtered Assignments based on tab
  const categorizedAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const sub = a.submissions?.[studentId];
      if (assignmentFilterTab === 'all') return true;
      if (assignmentFilterTab === 'pending') {
        return !sub;
      }
      if (assignmentFilterTab === 'evaluating') {
        return !!sub && sub.status !== 'reviewed' && a.type !== 'test';
      }
      if (assignmentFilterTab === 'completed') {
        return (!!sub && sub.status === 'reviewed') || (a.type === 'test' && sub?.percent !== undefined);
      }
      return true;
    });
  }, [assignments, studentId, assignmentFilterTab]);

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
        showToast(`${practiceCount} soruluk alıştırma hazırlandı.`, 'success');
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
    'Fizik Kuvvet ve Hareket Yasaları',
    'Kimya Asitler ve Bazlar',
  ];

  return (
    <div className="space-y-6 animate-fade pb-16">
      {/* 1. Header Card */}
      <header className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center font-heading font-extrabold text-lg text-white shadow-md shrink-0 border border-white/10"
            style={{ backgroundColor: studentColor }}
          >
            {initials(studentDisplayName)}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <span>🎓 Öğrenci Başarı Portalı</span>
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Hoş Geldin, {studentDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Ödevlerini teslim et, ders notlarını incele ve çalışma asistanınla eksiklerini pekiştir.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Sınıfa Katıl</span>
          </button>

          <button
            onClick={() => setIsPracticeModalOpen(!isPracticeModalOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Konu Alıştırması</span>
          </button>
        </div>
      </header>

      {/* 2. Real Stats Ribbon (Zero Fake Mock Data) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completed Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Tamamlanan Görevler</div>
            <div className="font-heading font-bold text-2xl text-white">
              {stats.completedCount} <span className="text-xs text-slate-500 font-normal">/ {stats.totalCount}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.pendingCount > 0 ? `${stats.pendingCount} Bekleyen Ödev` : 'Tüm ödevler tamamlandı'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Streak Days */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Çalışma Serisi</div>
            <div className="font-heading font-bold text-2xl text-amber-400 flex items-center gap-1.5">
              <span>{stats.streakDays}</span>
              <span className="text-xs text-slate-400 font-normal">Gün</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.streakDays > 0 ? 'Harika gidiyorsun! 🔥' : 'Bugün ilk testini çöz! 🔥'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Real Average Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Başarı Ortalaması</div>
            <div className="font-heading font-bold text-2xl text-emerald-400">
              {stats.averageScore !== null ? `%${stats.averageScore}` : '—'}
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.averageScore !== null ? 'Onaylanan Not Ortalaması' : 'Henüz notlanmış ödev yok'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Joined Classrooms */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Kayıtlı Sınıflarım</div>
            <div className="font-heading font-bold text-2xl text-cyan-400">
              {state.joinedClassrooms.length}
            </div>
            <div className="text-[11px] text-slate-400">Dahil Olduğun Şube</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <School className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. Joined Classrooms Section */}
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-heading font-semibold text-base text-white">
                Kayıtlı Olduğum Sınıflar ({state.joinedClassrooms.length})
              </h2>
              <p className="text-xs text-slate-400">
                Öğretmeninizin paylaştığı 6 haneli kod ile sınıflarınıza erişin.
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 mt-2 cursor-pointer shadow-sm"
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
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-white line-clamp-1">{c.name}</h4>
                      {c.subject && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
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

      {/* 4. Quick Practice Modal / Module with Question Count & Clear Instructions */}
      {isPracticeModalOpen && (
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-xl space-y-4 animate-fade">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="font-heading font-semibold text-base text-white">
                  Akıllı Konu Alıştırması & Test Modülü
                </h2>
                <p className="text-xs text-slate-400">
                  Dilediğin konuda anında soru üret ve çözümlerini gör.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPracticeModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Kapat ✕
            </button>
          </div>

          {/* Clear Instructions Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">💡 Nasıl Kullanılır?</span>
              Çalışmak istediğin dersi, konuyu veya zorluk seviyesini yazabilirsin. (Örn: <i>"10. Sınıf Fonksiyonlar"</i>, <i>"B1 İngilizce Past Perfect Tense"</i>, <i>"Köklü Sayılar Kolay Seviye"</i>, <i>"Fizik Vektörler"</i>).
            </div>
          </div>

          {/* Quick Subject Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">Popüler Konu Örnekleri:</span>
            <div className="flex flex-wrap gap-2">
              {practiceChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGeneratePracticeQuiz(chip)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                    practiceTopic === chip
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input & Soru Sayısı Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Konu Başlığı
              </label>
              <input
                type="text"
                value={practiceTopic}
                onChange={(e) => setPracticeTopic(e.target.value)}
                placeholder="Örn: 9. Sınıf Üçgende Açılar..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Soru Sayısı
              </label>
              <select
                value={practiceCount}
                onChange={(e) => setPracticeCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value={3}>3 Soru (Hızlı Test)</option>
                <option value={5}>5 Soru (Standart)</option>
                <option value={10}>10 Soru (Kapsamlı)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                disabled={isPracticeLoading || !practiceTopic.trim()}
                onClick={() => handleGeneratePracticeQuiz()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isPracticeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Başlat</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rendered Practice Quiz Questions */}
          {practiceQuiz && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">
                  {practiceQuiz.title} ({practiceQuiz.questions?.length} Soru)
                </h3>
                {practiceSubmitted && practiceScore && (
                  <div className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
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
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Alıştırmayı Tamamla ve Sonucu Gör
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* 5. Categorized Assignments Section (3 Tabs Structure) */}
      <section className="space-y-4">
        {/* Subtabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAssignmentFilterTab('pending')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                assignmentFilterTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Inbox className="w-4 h-4" />
              <span>📌 Bekleyen Ödevler</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-[10px] ml-1">
                {stats.pendingCount}
              </span>
            </button>

            <button
              onClick={() => setAssignmentFilterTab('evaluating')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                assignmentFilterTab === 'evaluating'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Hourglass className="w-4 h-4" />
              <span>⏳ Değerlendirmede</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-[10px] ml-1">
                {stats.evaluatingCount}
              </span>
            </button>

            <button
              onClick={() => setAssignmentFilterTab('completed')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                assignmentFilterTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>✅ Tamamlananlar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] ml-1">
                {stats.completedCount}
              </span>
            </button>

            <button
              onClick={() => setAssignmentFilterTab('all')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer',
                assignmentFilterTab === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <span>Tümü ({assignments.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            {categorizedAssignments.length} materyal listeleniyor
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {categorizedAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-500" />
            <h4 className="font-medium text-white text-sm">
              {assignmentFilterTab === 'pending'
                ? 'Harika! Bekleyen hiçbir ödeviniz bulunmuyor.'
                : assignmentFilterTab === 'evaluating'
                ? 'Şu anda öğretmen değerlendirmesinde olan bir ödeviniz yok.'
                : assignmentFilterTab === 'completed'
                ? 'Henüz tamamlanmış veya notlandırılmış ödeviniz bulunmuyor.'
                : 'Henüz atanmış bir ödev veya not bulunmuyor.'}
            </h4>
            <p className="text-xs text-slate-400">
              {assignmentFilterTab === 'pending'
                ? 'Yeni bir ödev yayınlandığında bu alanda görüntülenecektir.'
                : 'Ödevlerinizi teslim ettikçe durumları burada güncellenecektir.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorizedAssignments.map((a) => {
              const sub = a.submissions?.[studentId];
              const isTest = a.type === 'test';
              const isBook = a.type === 'book';
              const isNote = a.type === 'note';
              const activeTimer = timers[a.id];
              const isTestRunning = isTest && activeTimer?.active;

              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Badge Row with Explicit Format Type Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Format Badge */}
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1',
                            isNote
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : isTest
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : a.fileName
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          )}
                        >
                          {isNote ? (
                            <>
                              <BookOpen className="w-3 h-3" />
                              <span>Ders Notu & Okuma</span>
                            </>
                          ) : isTest ? (
                            <>
                              <ListCheck className="w-3 h-3" />
                              <span>Çoktan Seçmeli Test</span>
                            </>
                          ) : a.fileName ? (
                            <>
                              <FileUp className="w-3 h-3" />
                              <span>Dosya Yüklemeli PDF</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3" />
                              <span>Klasik Yazılı / Metin</span>
                            </>
                          )}
                        </span>

                        {a.classroomName && (
                          <span className="text-xs text-indigo-400 font-semibold">
                            • {a.classroomName}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      {sub ? (
                        sub.status === 'reviewed' ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Not: %{sub.finalScore ?? 85}</span>
                          </span>
                        ) : isTest ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Puan: %{sub.percent}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Değerlendirmede</span>
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
                      <h3 className="font-heading font-bold text-base text-white">{a.title}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">Ünite / Konu: {a.folder}</div>
                    </div>

                    {a.desc && (
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap line-clamp-3">
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
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
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
                          'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                          sub
                            ? sub.status === 'reviewed'
                              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm'
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
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Testi Başlat</span>
                      </button>
                    )}

                    {isTest && sub && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRetry(a.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
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
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
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
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-heading font-semibold text-base text-white">
              Çalışma Asistanı (Soru & Konu Danışmanı)
            </h3>
            <p className="text-xs text-slate-400">
              Takıldığınız soruları, formülleri veya konu özetlerini 7/24 asistanınıza danışabilirsiniz.
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {coachMessages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-xl text-xs sm:text-sm leading-relaxed max-w-[85%]',
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

        {/* Input */}
        <form onSubmit={handleSendCoachMessage} className="flex gap-2 pt-2">
          <input
            type="text"
            value={coachInput}
            onChange={(e) => setCoachInput(e.target.value)}
            placeholder="Sorunuzu buraya yazınız (örn: Fotosentez evrelerini kısaca özetler misin?)..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!coachInput.trim() || isCoachLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
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
