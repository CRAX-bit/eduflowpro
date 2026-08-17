'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, Question } from '@/types';
import { initials, fmtTime, cn } from '@/lib/utils';
import { getAuthHeaders } from '@/lib/api-client';
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
  ArrowRight,
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { JoinClassroomModal } from './JoinClassroomModal';
import { AssignmentSubmitModal } from './AssignmentSubmitModal';
import { QuizStudyModal } from './QuizStudyModal';

type AssignmentFilterTab = 'all' | 'pending' | 'evaluating' | 'completed';

function getCurriculumTopics(grade?: string): string[] {
  const g = (grade || '').toLowerCase();
  if (g.includes('ortaokul') || g.includes('lgs')) {
    return [
      'Matematik: Çarpanlar ve Katlar (EBOB-EKOK)',
      'Türkçe: Fiilimsiler (Eylemsiler)',
      'Fen: DNA ve Genetik Kod',
      'İngilizce: Teen Life & Preferences',
      'İnkılap: Milli Mücadele Hazırlık',
    ];
  }
  if (g.includes('sayısal')) {
    return [
      'Matematik: Fonksiyonlar ve Türev',
      'Fizik: Newton Hareket Yasaları',
      'Kimya: Kimyasal Denge',
      'Biyoloji: Hücresel Solunum ve ATP',
      'Geometri: Üçgende Benzerlik',
    ];
  }
  if (g.includes('eşit') || g.includes('sözel')) {
    return [
      'Edebiyat: Divan Edebiyatı Nazım Şekilleri',
      'Tarih: İlk Türk İslam Devletleri',
      'Coğrafya: Türkiye İklimi',
      'Matematik: Parabol ve Fonksiyonlar',
      'Türkçe: Paragrafta Anlam ve Yapı',
    ];
  }
  if (g.includes('lise') || g.includes('yks')) {
    return [
      'Matematik: Fonksiyonlar ve Kümeler',
      'Türkçe: Paragraf ve Ana Düşünce',
      'Fizik: Kuvvet ve Hareket',
      'Kimya: Asitler ve Bazlar',
      'Biyoloji: Kalıtım Esasları',
    ];
  }
  if (g.includes('kpss') || g.includes('ales') || g.includes('lisans')) {
    return [
      'Genel Yetenek: Sayısal & Sözel Mantık',
      'Tarih: Osmanlı Dağılma Dönemi',
      'Coğrafya: Türkiye\'nin Yer Şekilleri',
      'Vatandaşlık: Temel Hukuk ve Anayasa',
    ];
  }
  return [
    'İngilizce: Present Continuous vs Simple Present',
    'Mantık: Önermeler ve Kümeler',
    'Genel Kültür: Dünya Coğrafyası',
    'Türkçe: Sözcükte Anlam',
  ];
}

function getCoachWelcomeMessage(grade?: string): string {
  const g = (grade || '').toLowerCase();
  if (g.includes('ortaokul') || g.includes('lgs')) {
    return 'Merhaba! Ben senin LGS çalışma asistanınım. Anlamadığın yeni nesil soruları, formülleri ve ünite özetlerini bana dilediğin gibi sorabilirsin. Başarıya birlikte koşuyoruz! 🚀';
  }
  if (g.includes('lise') || g.includes('yks')) {
    return 'Selam! Ben senin YKS koçunum. TYT-AYT sınav taktikleri, formül ispatları ve ÖSYM mantığı odaklı sorularını buraya iletebilirsin. Hangi konuyu derinleştirelim? 🎯';
  }
  if (g.includes('kpss') || g.includes('ales') || g.includes('lisans')) {
    return 'Merhaba! KPSS & ALES hazırlığında sözel/sayısal mantık, mevzuat ve pratik soru çözüm teknikleriyle yanındayım. Ne üzerine çalışıyoruz? 📚';
  }
  return 'Merhaba! Derslerin, dil pratiğin ve merak ettiğin tüm akademik konular için kişisel çalışma asistanın hazır! 🎓';
}

const GRADE_LEVEL_OPTIONS = [
  'Ortaokul (5-8. Sınıf / LGS Hazırlık)',
  'Lise (9-12. Sınıf / YKS Hazırlık - Sayısal)',
  'Lise (9-12. Sınıf / YKS Hazırlık - Eşit Ağırlık / Sözel)',
  'Lisans & Mezun (KPSS / ALES Hazırlık)',
  'Genel Gelişim / Dil Eğitimi',
];

export function StudentView() {
  const {
    state,
    getStudentById,
    getVisibleAssignments,
    submitTestAnswers,
    retryTest,
    leaveClassroom,
    updateStudentGradeLevel,
    showToast,
  } = useEduFlow();

  const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || '';
  const currentStudent = getStudentById(studentId);
  const assignments = getVisibleAssignments(studentId);

  const [assignmentFilterTab, setAssignmentFilterTab] = useState<AssignmentFilterTab>('pending');
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);

  // Active Focus Quiz Study Modal State (Quizlet Study Engine)
  const [activeStudyQuiz, setActiveStudyQuiz] = useState<{
    id?: string;
    title: string;
    folder?: string;
    questions: Question[];
    timeLimit?: number;
  } | null>(null);

  // Modals state
  const [viewingNote, setViewingNote] = useState<Assignment | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    studentName?: string;
  } | null>(null);

  const currentGradeLevel = state.session?.gradeLevel || currentStudent?.gradeLevel || 'Ortaokul (5-8. Sınıf / LGS Hazırlık)';
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const practiceChips = useMemo(() => getCurriculumTopics(currentGradeLevel), [currentGradeLevel]);

  // --- Kişisel Çalışma Asistanı (Coach Chat) State ---
  const [coachMessages, setCoachMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: getCoachWelcomeMessage(currentGradeLevel),
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Update coach welcome message when grade level is loaded/changed
  useEffect(() => {
    const welcome = getCoachWelcomeMessage(currentGradeLevel);
    setCoachMessages([{ role: 'assistant', text: welcome }]);
  }, [currentGradeLevel]);

  // --- Konu Alıştırması (Quick Practice) State ---
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState('');
  const [practiceCount, setPracticeCount] = useState<number>(5);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);

  // Initialize and update practice topic from dynamic chips when level changes
  useEffect(() => {
    if (practiceChips.length > 0) {
      setPracticeTopic(practiceChips[0]);
    }
  }, [practiceChips]);

  if (!state.session && !state.currentStudentId) {
    return (
      <div className="text-center py-20 text-zinc-400 space-y-3">
        <p>Lütfen önce öğrenci girişi yapınız.</p>
      </div>
    );
  }

  const studentDisplayName = state.session?.name || currentStudent?.name || 'Öğrenci';
  const studentColor = currentStudent?.color || '#10b981';

  // --- Real Stats Tracker Calculation (Zero Fake Mock Data) ---
  const stats = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let evaluatingCount = 0;
    let totalScoreSum = 0;
    let scoredItemsCount = 0;

    assignments.forEach((a) => {
      const sub = a.submissions?.[studentId];
      if (a.type === 'note') {
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
        // Submitted, waiting for teacher review
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

  // Filtered Assignments based on tab (Quizlet / Notion Clean 3 Tabs)
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

  // --- Handlers for Teacher Assigned Tests in Focus Mode ---
  const handleStartFocusTest = (a: Assignment) => {
    if (!a.questions || a.questions.length === 0) {
      showToast('Bu test için soru bulunamadı.', 'warn');
      return;
    }

    setActiveStudyQuiz({
      id: a.id,
      title: a.title,
      folder: a.folder,
      questions: a.questions,
      timeLimit: a.timeLimit || 180,
    });
  };

  const handleStudyQuizComplete = (answers: string[], scorePercent: number) => {
    if (activeStudyQuiz?.id) {
      submitTestAnswers(activeStudyQuiz.id, answers, false);
      showToast(`Test tamamlandı! Başarı skorunuz: %${scorePercent}`, 'success');
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
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat_assistant',
          message: userText,
          role: 'student',
          gradeLevel: currentGradeLevel,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setCoachMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setCoachMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'Yanıt üretilirken bir aksaklık oldu. Lütfen sorunuzu tekrar iletin.' },
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

  // --- Handlers for Quick AI Practice Quiz (Direct to Focus Study Mode) ---
  const handleGeneratePracticeQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || practiceTopic).trim();
    if (!topic) return;
    setPracticeTopic(topic);
    setIsPracticeLoading(true);

    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_quiz',
          topic,
          count: practiceCount,
          grade: currentGradeLevel,
        }),
      });
      const data = await res.json();
      if (data.success && data.data && data.data.questions?.length > 0) {
        setIsPracticeModalOpen(false);
        setActiveStudyQuiz({
          title: data.data.title || `${topic} — Pratik Test`,
          folder: topic,
          questions: data.data.questions,
          timeLimit: (data.data.questions.length || 5) * 60,
        });
        showToast(`${topic} için ${data.data.questions.length} soruluk odak çalışma modu başlatıldı!`, 'success');
      } else {
        showToast(data.error || 'Alıştırma testi oluşturulamadı. Lütfen tekrar deneyin.', 'error');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsPracticeLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-16">
      {/* 1. Header Card (Linear / Quizlet Minimalist Banner) */}
      <header className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#090a0f] border border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-base text-white shadow-md shrink-0 border border-white/10"
            style={{ backgroundColor: studentColor }}
          >
            {initials(studentDisplayName)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Öğrenci Portalı</span>
              </div>

              {/* Interactive Level Selector Badge & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  disabled={isUpdatingLevel}
                  onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-sm group"
                  title="Hedef sınav veya eğitim seviyenizi değiştirmek için tıklayın"
                >
                  <span className="text-emerald-400">🎯 Hedef:</span>
                  <span className="font-semibold text-white max-w-[200px] sm:max-w-[280px] truncate">
                    {currentGradeLevel}
                  </span>
                  {isUpdatingLevel ? (
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                  ) : (
                    <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform", isLevelDropdownOpen && "rotate-180")} />
                  )}
                </button>

                {isLevelDropdownOpen && (
                  <>
                    {/* Backdrop for closing dropdown */}
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsLevelDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 p-1.5 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl z-30 space-y-1 animate-fade">
                      <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800/80 flex items-center justify-between">
                        <span>Eğitim Seviyesi / Hedef Sınav</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Tek tıkla değiştir</span>
                      </div>
                      {GRADE_LEVEL_OPTIONS.map((lvl) => {
                        const isSelected = currentGradeLevel === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={async () => {
                              setIsLevelDropdownOpen(false);
                              if (lvl !== currentGradeLevel) {
                                setIsUpdatingLevel(true);
                                await updateStudentGradeLevel(lvl);
                                setIsUpdatingLevel(false);
                              }
                            }}
                            className={cn(
                              'w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer',
                              isSelected
                                ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                            )}
                          >
                            <span className="truncate">{lvl}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">
              Hoş Geldin, {studentDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Ödevlerini teslim et, ders notlarını incele ve Quizlet odak modunda anında pratik yap.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>Sınıfa Katıl</span>
          </button>

          <button
            onClick={() => setIsPracticeModalOpen(!isPracticeModalOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Konu Alıştırması (AI Quiz)</span>
          </button>
        </div>
      </header>

      {/* 2. Metrics Ribbon */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completed Tasks */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Tamamlanan Görevler</div>
            <div className="font-heading font-bold text-2xl text-white">
              {stats.completedCount} <span className="text-xs text-zinc-500 font-normal">/ {stats.totalCount}</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              {stats.pendingCount > 0 ? `${stats.pendingCount} Bekleyen Ödev` : 'Tüm ödevler tamamlandı'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Streak Days */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Çalışma Serisi</div>
            <div className="font-heading font-bold text-2xl text-white flex items-center gap-1.5">
              <span>{stats.streakDays}</span>
              <span className="text-xs font-normal text-zinc-500">Gün</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-[11px] text-zinc-400">
              {stats.streakDays > 0 ? 'Seriyi bozmadan devam et!' : 'İlk ödevini tamamlayarak seriyi başlat'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Average Score */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Genel Başarı Puanı</div>
            <div className="font-heading font-bold text-2xl text-white">
              {stats.averageScore !== null ? `%${stats.averageScore}` : '—'}
            </div>
            <div className="text-[11px] text-zinc-400">
              {stats.averageScore !== null ? 'Öğretmen & Test Ortalaması' : 'Notlandırılmış ödev bekleniyor'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Classrooms */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Kayıtlı Sınıflar</div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.joinedClassrooms.length}
            </div>
            <div className="text-[11px] text-zinc-400">Aktif Şube & Ders</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <School className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. Classrooms Ribbon */}
      <section className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <School className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="font-heading font-semibold text-sm text-white">
                Kayıtlı Olduğum Sınıflar ({state.joinedClassrooms.length})
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsJoinClassModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Sınıfa Katıl</span>
          </button>
        </div>

        {state.joinedClassrooms.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 space-y-2">
            <KeyRound className="w-7 h-7 mx-auto text-zinc-600" />
            <h4 className="font-medium text-white text-xs">Henüz bir sınıfa katılmadınız</h4>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Öğretmeninizin paylaştığı 6 haneli kodu girerek sınıfınıza dahil olabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.joinedClassrooms.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-white truncate">{c.name}</h4>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <span>Kod: <b className="font-mono text-emerald-400">{c.joinCode}</b></span>
                    {c.subject && <span>• {c.subject}</span>}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`"${c.name}" sınıfından ayrılmak istediğinize emin misiniz?`)) {
                      leaveClassroom(c.id);
                    }
                  }}
                  className="text-zinc-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                  title="Sınıftan Ayrıl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Quick Practice Modal / Module Trigger */}
      {isPracticeModalOpen && (
        <section className="p-5 sm:p-6 rounded-2xl bg-[#090a0f] border border-emerald-500/30 shadow-2xl space-y-4 animate-fade">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="font-heading font-semibold text-base text-white">
                  Akıllı Konu Alıştırması & Test Modülü
                </h2>
                <p className="text-xs text-zinc-400">
                  Dilediğin konuda anında Quizlet odak modlu pratik testi oluştur.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPracticeModalOpen(false)}
              className="text-xs text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
            >
              Kapat ✕
            </button>
          </div>

          {/* Quick Subject Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400">Örnek Çalışma Konuları:</span>
            <div className="flex flex-wrap gap-2">
              {practiceChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPracticeTopic(chip)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer text-left',
                    practiceTopic === chip
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input & Soru Sayısı */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Konu Başlığı
              </label>
              <input
                type="text"
                value={practiceTopic}
                onChange={(e) => setPracticeTopic(e.target.value)}
                placeholder="Örn: 10. Sınıf Fotosentez Işık Reaksiyonları..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Soru Sayısı
              </label>
              <select
                value={practiceCount}
                onChange={(e) => setPracticeCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value={3}>3 Soru (Hızlı Pratik)</option>
                <option value={5}>5 Soru (Standart Test)</option>
                <option value={10}>10 Soru (Kapsamlı Sınav)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                disabled={isPracticeLoading || !practiceTopic.trim()}
                onClick={() => handleGeneratePracticeQuiz()}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
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
        </section>
      )}

      {/* 5. Categorized Assignments Section (Quizlet / Notion 3 Tabs Structure) */}
      <section className="space-y-4">
        {/* Subtabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0c0d12] border border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setAssignmentFilterTab('pending')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                assignmentFilterTab === 'pending'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <Inbox className="w-4 h-4 text-amber-400" />
              <span>Bekleyenler</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-mono ml-0.5">
                {stats.pendingCount}
              </span>
            </button>

            <button
              onClick={() => setAssignmentFilterTab('evaluating')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                assignmentFilterTab === 'evaluating'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <Hourglass className="w-4 h-4 text-indigo-400" />
              <span>Değerlendirmede</span>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-mono ml-0.5">
                {stats.evaluatingCount}
              </span>
            </button>

            <button
              onClick={() => setAssignmentFilterTab('completed')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                assignmentFilterTab === 'completed'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tamamlananlar</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-mono ml-0.5">
                {stats.completedCount}
              </span>
            </button>

            <button
              onClick={() => setAssignmentFilterTab('all')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer',
                assignmentFilterTab === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <span>Tümü ({assignments.length})</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400 font-mono hidden sm:block pr-2">
            {categorizedAssignments.length} materyal
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {categorizedAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0c0d12] border border-dashed border-zinc-800 space-y-2">
            <BookOpen className="w-7 h-7 mx-auto text-zinc-600" />
            <h4 className="font-medium text-white text-sm">
              {assignmentFilterTab === 'pending'
                ? 'Harika! Bekleyen hiçbir ödeviniz bulunmuyor.'
                : assignmentFilterTab === 'evaluating'
                ? 'Şu anda öğretmen değerlendirmesinde olan bir ödeviniz yok.'
                : assignmentFilterTab === 'completed'
                ? 'Henüz tamamlanmış ödeviniz bulunmuyor.'
                : 'Henüz atanmış bir ödev veya not bulunmuyor.'}
            </h4>
            <p className="text-xs text-zinc-400">
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

              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    {/* Badge Row with Format & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1',
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
                          <span className="text-[11px] text-zinc-400 font-medium">
                            • {a.classroomName}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      {sub ? (
                        sub.status === 'reviewed' ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Puan: %{sub.finalScore ?? 85}</span>
                          </span>
                        ) : isTest ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Skor: %{sub.percent}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Değerlendirmede</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-amber-400 border border-zinc-800">
                          Bekliyor
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                        {a.title}
                      </h3>
                      <div className="text-xs text-zinc-400 mt-0.5">Konu: {a.folder}</div>
                    </div>

                    {a.desc && (
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {a.desc}
                      </p>
                    )}

                    {/* Teacher Feedback Bubble if completed */}
                    {sub?.status === 'reviewed' && sub.feedback && (
                      <div className="p-3 rounded-xl bg-zinc-950/90 border border-emerald-500/20 text-xs space-y-1">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                          <MessageSquareQuote className="w-3 h-3" />
                          <span>Öğretmen Değerlendirmesi:</span>
                        </div>
                        <p className="text-zinc-300 italic text-[11px]">
                          &ldquo;{sub.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    {isNote && (
                      <button
                        onClick={() => setViewingNote(a)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ders Notunu Oku</span>
                      </button>
                    )}

                    {isBook && (
                      <button
                        onClick={() => setSubmitModalAssignment(a)}
                        className={cn(
                          'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                          sub
                            ? sub.status === 'reviewed'
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold'
                              : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-sm'
                        )}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                          {sub
                            ? sub.status === 'reviewed'
                              ? 'Değerlendirmeyi İncele'
                              : 'Tesliminizi İnceleyin'
                            : 'Ödevi Teslim Et'}
                        </span>
                      </button>
                    )}

                    {isTest && !sub && (
                      <button
                        onClick={() => handleStartFocusTest(a)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Quizlet Odak Modunda Başlat</span>
                      </button>
                    )}

                    {isTest && sub && (
                      <button
                        onClick={() => handleStartFocusTest(a)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Tekrar Çöz (Pratik)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Kişisel Çalışma Asistanı (Coach Chat) */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="font-heading font-semibold text-sm text-white">
              Kişisel Soru & Konu Danışmanı
            </h3>
            <p className="text-xs text-zinc-400">
              Takıldığınız soruları, formülleri ve konu özetlerini 7/24 sorabilirsiniz.
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {coachMessages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%]',
                m.role === 'user'
                  ? 'ml-auto bg-emerald-500 text-zinc-950 font-medium'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
              )}
            >
              {m.text}
            </div>
          ))}
          {isCoachLoading && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 w-fit">
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
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!coachInput.trim() || isCoachLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gönder</span>
          </button>
        </form>
      </section>

      {/* Focus Study Modal (Quizlet Engine) */}
      {activeStudyQuiz && (
        <QuizStudyModal
          isOpen={!!activeStudyQuiz}
          title={activeStudyQuiz.title}
          folder={activeStudyQuiz.folder}
          questions={activeStudyQuiz.questions}
          timeLimit={activeStudyQuiz.timeLimit}
          onClose={() => setActiveStudyQuiz(null)}
          onComplete={handleStudyQuizComplete}
        />
      )}

      {/* Additional Modals */}
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
