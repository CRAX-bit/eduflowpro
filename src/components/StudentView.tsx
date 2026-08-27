'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, Question } from '@/types';
import { initials, fmtTime, timeAgo, cn } from '@/lib/utils';
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
  BarChart2,
  BookMarked,
  GraduationCap,
  PieChart,
  Target,
  AlertTriangle,
  IdCard,
  Copy,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { JoinClassroomModal } from './JoinClassroomModal';
import { AssignmentSubmitModal } from './AssignmentSubmitModal';
import { QuizStudyModal } from './QuizStudyModal';
import { StudentAiDrawer } from './StudentAiDrawer';

type AssignmentFilterTab = 'pending' | 'evaluating' | 'completed' | 'all';

const GRADE_LEVEL_OPTIONS = [
  'Ortaokul (5-8. Sınıf / LGS Hazırlık)',
  'Lise (9-12. Sınıf / YKS Hazırlık - Sayısal)',
  'Lise (9-12. Sınıf / YKS Hazırlık - Eşit Ağırlık / Sözel)',
  'Lisans & Mezun (KPSS / ALES Hazırlık)',
  'Genel Gelişim / Dil Eğitimi',
];

// Seviyeye Göre Akıllı Konu Hakimiyeti Örnekleri
const LEVEL_TOPIC_MASTERY: Record<
  string,
  {
    strong: Array<{ name: string; score: number }>;
    review: Array<{ name: string; focus: string }>;
  }
> = {
  'Ortaokul (5-8. Sınıf / LGS Hazırlık)': {
    strong: [
      { name: 'Çarpanlar ve Katlar (EBOB-EKOK)', score: 94 },
      { name: 'DNA ve Genetik Kod', score: 90 },
      { name: 'Paragrafta Anlam & Yapı', score: 88 },
    ],
    review: [
      { name: 'Mevsimler ve İklim', focus: 'Eksen Eğikliği' },
      { name: 'Fiilimsiler (Eylemsiler)', focus: 'Zarf-Fiil Ekleri' },
    ],
  },
  'Lise (9-12. Sınıf / YKS Hazırlık - Sayısal)': {
    strong: [
      { name: 'Fonksiyonlar & Parabol', score: 95 },
      { name: 'Fotosentez ve Kloroplast', score: 92 },
      { name: 'Trigonometri Temelleri', score: 89 },
    ],
    review: [
      { name: 'Newton Hareket Yasaları', focus: 'Sürtünme & Eğik Düzlem' },
      { name: 'Kimyasal Türler Arası Etkileşim', focus: 'Hidrojen Bağı' },
    ],
  },
  'Lise (9-12. Sınıf / YKS Hazırlık - Eşit Ağırlık / Sözel)': {
    strong: [
      { name: 'Divan Edebiyatı Nazım Şekilleri', score: 96 },
      { name: 'Osmanlı Kuruluş & Yükselme', score: 91 },
      { name: 'Temel Fonksiyonlar', score: 86 },
    ],
    review: [
      { name: 'Tanzimat Dönemi Romanları', focus: 'Karakter Tahlilleri' },
      { name: 'Türkiye Coğrafyası & İklim', focus: 'Rüzgarlar & Yağış' },
    ],
  },
  'Lisans & Mezun (KPSS / ALES Hazırlık)': {
    strong: [
      { name: 'Sözel Mantık & Çıkarım', score: 93 },
      { name: 'Anayasa Hukuku Temelleri', score: 90 },
      { name: 'Matematik: Problemler', score: 87 },
    ],
    review: [
      { name: 'Türkiye Ekonomik Coğrafyası', focus: 'Madenler & Sanayi' },
      { name: 'Çağdaş Türk ve Dünya Tarihi', focus: 'Soğuk Savaş Dönemi' },
    ],
  },
  'Genel Gelişim / Dil Eğitimi': {
    strong: [
      { name: 'Temel İngilizce Zamanlar', score: 95 },
      { name: 'Hızlı Okuma ve Kavrama', score: 91 },
    ],
    review: [
      { name: 'Akademik Kelime Bilgisi', focus: 'Preposition Kullanımı' },
    ],
  },
};

export function StudentView() {
  const {
    state,
    getStudentById,
    getVisibleAssignments,
    submitTestAnswers,
    leaveClassroom,
    updateStudentGradeLevel,
    showToast,
    incomingStudentRequests,
    respondStudentRequest,
    loadStudentRequests,
    isLoadingRequests,
  } = useEduFlow();

  const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || '';
  const currentStudent = getStudentById(studentId);
  const assignments = getVisibleAssignments(studentId);

  const [assignmentFilterTab, setAssignmentFilterTab] = useState<AssignmentFilterTab>('pending');
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [isNoCopied, setIsNoCopied] = useState(false);
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);

  // Floating AI Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerInitialTab, setAiDrawerInitialTab] = useState<'chat' | 'practice'>('chat');

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

  const currentGradeLevel =
    state.session?.gradeLevel || currentStudent?.gradeLevel || 'Ortaokul (5-8. Sınıf / LGS Hazırlık)';
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);

  if (!state.session && !state.currentStudentId) {
    return (
      <div className="text-center py-20 text-slate-700 font-semibold space-y-3">
        <p>Lütfen önce öğrenci girişi yapınız.</p>
      </div>
    );
  }

  const studentDisplayName = state.session?.name || currentStudent?.name || 'Öğrenci';
  const studentNo = state.session?.studentNo || currentStudent?.studentNo || '';
  const pendingTeacherRequests = useMemo(
    () => incomingStudentRequests.filter((r) => r.status === 'pending'),
    [incomingStudentRequests]
  );
  const studentColor = currentStudent?.color || '#2563eb';

  // --- Real Stats Tracker Calculation ---
  const stats = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let evaluatingCount = 0;
    let totalScoreSum = 0;
    let scoredItemsCount = 0;
    const completedTestsList: Array<{ title: string; score: number; date: number }> = [];

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
        completedTestsList.push({
          title: a.title,
          score: sub.percent,
          date: sub.at || a.createdAt,
        });
      } else {
        evaluatingCount += 1;
      }
    });

    const averageScore = scoredItemsCount > 0 ? Math.round(totalScoreSum / scoredItemsCount) : null;
    const streakDays = completedCount > 0 ? Math.min(completedCount, 7) : 0;
    const totalCount = assignments.filter((a) => a.type !== 'note').length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      completedCount,
      pendingCount,
      evaluatingCount,
      totalCount,
      completionRate,
      averageScore,
      streakDays,
      completedTestsList,
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

  // Study Notes & Materials Archive
  const studyMaterialsList = useMemo(() => {
    return assignments.filter((a) => a.type === 'note' || a.fileName);
  }, [assignments]);

  // Topic mastery config for current grade level
  const topicMastery = LEVEL_TOPIC_MASTERY[currentGradeLevel] || LEVEL_TOPIC_MASTERY['Ortaokul (5-8. Sınıf / LGS Hazırlık)'];

  // Donut SVG calculations
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutValue = stats.completionRate > 0 ? stats.completionRate : stats.averageScore || 0;
  const completedStroke = (donutValue / 100) * donutCircumference;

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

  return (
    <div className="space-y-8 animate-fade pb-20">
      {/* 1. Header Banner (Deskio Student Desk) */}
      <header className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-base text-white shadow-xs shrink-0"
            style={{ backgroundColor: studentColor }}
          >
            {initials(studentDisplayName)}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Deskio Öğrenci Masası</span>
              </div>

              {/* Öğrenci Numarası — öğretmene verilecek kimlik */}
              {studentNo && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(studentNo);
                    setIsNoCopied(true);
                    showToast(`Öğrenci numaran kopyalandı: ${studentNo}`, 'success');
                    setTimeout(() => setIsNoCopied(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                  title="Öğretmenine vermen gereken numara — kopyalamak için tıkla"
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Öğrenci No: <b className="font-mono tracking-widest">{studentNo}</b></span>
                  {isNoCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-70" />}
                </button>
              )}

              {/* Interactive Target Level Selector */}
              <div className="relative">
                <button
                  type="button"
                  disabled={isUpdatingLevel}
                  onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                  title="Hedef sınav veya eğitim seviyenizi değiştirmek için tıklayın"
                >
                  <span className="text-blue-700 font-extrabold">🎯 Hedef:</span>
                  <span className="font-extrabold text-slate-950 max-w-[180px] sm:max-w-[240px] truncate">
                    {currentGradeLevel}
                  </span>
                  {isUpdatingLevel ? (
                    <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                  ) : (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-transform',
                        isLevelDropdownOpen && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {isLevelDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsLevelDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 p-1.5 rounded-2xl bg-white border border-slate-300 shadow-xl z-30 space-y-1 animate-fade">
                      <div className="px-3 py-1.5 text-xs font-bold text-slate-700 border-b border-slate-100 flex items-center justify-between">
                        <span>Eğitim Seviyesi / Hedef Sınav</span>
                        <span className="text-[10px] text-blue-700 font-extrabold">Seç & Güncelle</span>
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
                              'w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer',
                              isSelected
                                ? 'bg-blue-50 text-blue-800 font-extrabold border border-blue-200'
                                : 'text-slate-800 hover:text-slate-950 hover:bg-slate-50'
                            )}
                          >
                            <span className="truncate">{lvl}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-950 tracking-tight">
              Hoş Geldin, {studentDisplayName}
            </h1>
            <p className="text-sm text-slate-700 font-medium">
              Ödevlerini tamamla, ders notlarını incele ve yapay zeka odak modunda interaktif testler çöz.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs min-h-[44px] active:scale-95"
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Sınıfa Katıl</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiDrawerInitialTab('practice');
              setIsAiDrawerOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-sm shadow-blue-600/25 transition-all cursor-pointer min-h-[44px] active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Alıştırma Testi (AI)</span>
          </button>
        </div>
      </header>

      {/* 1.5 Öğretmen Ekleme İstekleri */}
      {pendingTeacherRequests.length > 0 && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-4 animate-fade">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-start gap-2">
              <UserPlus className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-950">
                  Öğretmen Ekleme İsteği ({pendingTeacherRequests.length})
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Onayladığında bu öğretmen adını, ödev teslimlerini ve gelişim raporunu görebilir. Reddedersen hiçbir bilgin paylaşılmaz.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadStudentRequests()}
              disabled={isLoadingRequests}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="Listeyi yenile"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isLoadingRequests && 'animate-spin')} />
              <span className="hidden sm:inline">Yenile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {pendingTeacherRequests.map((r) => (
              <div
                key={r.requestId}
                className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-heading font-extrabold text-xs shrink-0">
                    {initials(r.teacherName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-950 truncate">{r.teacherName}</h4>
                    <div className="text-xs text-slate-700 font-semibold truncate">
                      {r.branch ? `${r.branch} · ` : ''}
                      {r.teacherEmail || 'Öğretmen'}
                    </div>
                    <div className="text-[11px] text-amber-700 font-bold mt-0.5">{timeAgo(r.createdAt)}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={respondingRequestId === r.requestId}
                    onClick={async () => {
                      setRespondingRequestId(r.requestId);
                      await respondStudentRequest(r.requestId, true);
                      setRespondingRequestId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs min-h-[44px] active:scale-95"
                  >
                    {respondingRequestId === r.requestId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>Kabul Et</span>
                  </button>

                  <button
                    type="button"
                    disabled={respondingRequestId === r.requestId}
                    onClick={async () => {
                      setRespondingRequestId(r.requestId);
                      await respondStudentRequest(r.requestId, false);
                      setRespondingRequestId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-800 hover:text-red-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reddet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Metrics Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Completed Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all shadow-sm">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tamamlanan Görevler</div>
            <div className="font-heading font-extrabold text-3xl text-slate-950">
              {stats.completedCount} <span className="text-sm text-slate-600 font-bold">/ {stats.totalCount}</span>
            </div>
            <div className="text-xs text-blue-700 font-bold">
              {stats.pendingCount > 0 ? `${stats.pendingCount} Bekleyen Görev` : 'Tüm görevler tamamlandı'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Streak Days */}
        <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Çalışma Serisi</div>
            <div className="font-heading font-extrabold text-3xl text-slate-950 flex items-center gap-1.5">
              <span>{stats.streakDays}</span>
              <span className="text-xs font-bold text-slate-600">Gün</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-xs text-amber-700 font-bold">
              {stats.streakDays > 0 ? 'Seriyi bozmadan devam et!' : 'İlk ödevini tamamlayarak seriyi başlat'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Average Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-emerald-400 hover:shadow-md transition-all shadow-sm">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Genel Başarı Puanı</div>
            <div className="font-heading font-extrabold text-3xl text-slate-950">
              {stats.averageScore !== null ? `%${stats.averageScore}` : '—'}
            </div>
            <div className="text-xs text-emerald-700 font-bold">
              {stats.averageScore !== null ? 'Öğretmen & Test Ortalaması' : 'Notlandırılmış ödev bekleniyor'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Classrooms */}
        <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-indigo-400 hover:shadow-md transition-all shadow-sm">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Kayıtlı Sınıflar</div>
            <div className="font-heading font-extrabold text-3xl text-slate-950">
              {state.joinedClassrooms.length}
            </div>
            <div className="text-xs text-indigo-700 font-bold">Aktif Şube & Ders</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. BİREYSEL BAŞARI & KONU HAKİMİYETİ DONUT ANALİZ MODÜLÜ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sol Kolon: Bireysel Başarı & Görev Dağılımı Donut Grafiği (6 Kolon) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h3 className="font-heading font-extrabold text-base text-slate-950">
                Bireysel Başarı & Görev Dağılımı
              </h3>
            </div>
            <span className="text-xs font-mono font-extrabold text-blue-700">
              %{stats.completionRate} Tamamlandı
            </span>
          </div>

          <div className="flex items-center justify-around gap-4 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  className="stroke-slate-100"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Completion Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  className="stroke-blue-600 transition-all duration-700 ease-out"
                  strokeWidth="10"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutCircumference - completedStroke}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading font-extrabold text-2xl text-slate-950 leading-none">
                  %{stats.completionRate}
                </span>
                <span className="text-[10px] text-slate-700 font-bold mt-1">İlerleme</span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">Tamamlanan:</span>
                <span className="font-extrabold text-slate-950">{stats.completedCount} Ödev</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-slate-700 font-medium">Değerlendirmede:</span>
                <span className="font-extrabold text-indigo-700">{stats.evaluatingCount} Ödev</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-700 font-medium">Bekleyen:</span>
                <span className="font-extrabold text-amber-700">{stats.pendingCount} Ödev</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-medium">Genel Başarı:</span>
                <span className="font-extrabold text-emerald-700">
                  {stats.averageScore !== null ? `%${stats.averageScore}` : 'Henüz notlanmadı'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Çalışma Hedef Seviyesi:</span>
            <span className="font-bold text-slate-950 truncate max-w-[200px]">{currentGradeLevel}</span>
          </div>
        </div>

        {/* Sağ Kolon: Konu Hakimiyeti & Tavsiyeler (6 Kolon) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <h3 className="font-heading font-extrabold text-base text-slate-950">
                Konu Hakimiyeti & Çalışma Tavsiyesi
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              AI Analizi
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Güçlü Olduğun Konular */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Güçlü Olduğun Konular</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topicMastery.strong.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-extrabold"
                  >
                    <span>✓ {t.name}</span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">%{t.score}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Tekrar Edilmesi Gerekenler */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Tekrar Edilmesi Gerekenler</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topicMastery.review.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold"
                  >
                    <span>⚡ {t.name}</span>
                    <span className="text-[11px] text-amber-800 font-semibold">({t.focus})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-700 font-medium">Zayıf konuları pekiştir:</span>
            <button
              type="button"
              onClick={() => {
                setAiDrawerInitialTab('practice');
                setIsAiDrawerOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Deskio AI ile Pratik Başlat</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Categorized Assignments Section (Clean Tabs) */}
      <section className="space-y-4">
        {/* Subtabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-slate-300 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setAssignmentFilterTab('pending')}
              className={cn(
                'flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] active:scale-95',
                assignmentFilterTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              )}
            >
              <Inbox className="w-4 h-4" />
              <span>Bekleyenler</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ml-0.5',
                assignmentFilterTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
              )}>
                {stats.pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentFilterTab('evaluating')}
              className={cn(
                'flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] active:scale-95',
                assignmentFilterTab === 'evaluating'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              )}
            >
              <Hourglass className="w-4 h-4" />
              <span>Değerlendirmede</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ml-0.5',
                assignmentFilterTab === 'evaluating' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-900'
              )}>
                {stats.evaluatingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentFilterTab('completed')}
              className={cn(
                'flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] active:scale-95',
                assignmentFilterTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tamamlananlar</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ml-0.5',
                assignmentFilterTab === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
              )}>
                {stats.completedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentFilterTab('all')}
              className={cn(
                'flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] active:scale-95',
                assignmentFilterTab === 'all'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
              )}
            >
              <span>Tümü ({assignments.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-700 font-mono font-semibold hidden sm:block pr-2">
            {categorizedAssignments.length} görev listeleniyor
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {categorizedAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 shadow-sm space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-500" />
            <h4 className="font-extrabold text-slate-950 text-base">
              {assignmentFilterTab === 'pending'
                ? 'Harika! Bekleyen hiçbir ödeviniz bulunmuyor.'
                : assignmentFilterTab === 'evaluating'
                ? 'Şu anda öğretmen değerlendirmesinde olan bir ödeviniz yok.'
                : assignmentFilterTab === 'completed'
                ? 'Henüz tamamlanmış ödeviniz bulunmuyor.'
                : 'Henüz atanmış bir ödev veya not bulunmuyor.'}
            </h4>
            <p className="text-sm text-slate-700 font-medium">
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
                  className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 group shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Badge Row with Format & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1',
                            isNote
                              ? 'bg-sky-50 text-sky-800 border border-sky-300'
                              : isTest
                              ? 'bg-purple-50 text-purple-800 border border-purple-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          )}
                        >
                          {isNote ? 'Ders Notu' : isTest ? 'İnteraktif Test' : 'Yazılı Ödev'}
                        </span>

                        {a.classroomName && (
                          <span className="text-xs text-slate-700 font-bold">
                            • {a.classroomName}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      {sub ? (
                        sub.status === 'reviewed' ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Puan: %{sub.finalScore ?? 85}</span>
                          </span>
                        ) : isTest ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Skor: %{sub.percent}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Değerlendirmede</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-amber-50 text-amber-800 border border-amber-300 font-extrabold">
                          Bekliyor
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-heading font-extrabold text-lg text-slate-950 group-hover:text-blue-700 transition-colors">
                        {a.title}
                      </h3>
                      <div className="text-xs text-slate-700 font-bold mt-0.5">Konu: {a.folder}</div>
                    </div>

                    {a.fileName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate max-w-[180px]">{a.fileName}</span>
                      </div>
                    )}

                    {/* Deadline Badge for Student */}
                    {a.deadline && !sub && (() => {
                      const now = Date.now();
                      const isOverdue = now > a.deadline;
                      const daysLeft = Math.ceil((a.deadline - now) / (1000 * 60 * 60 * 24));
                      return (
                        <div className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border',
                          isOverdue
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : daysLeft <= 2
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-800 border-slate-300'
                        )}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {isOverdue
                              ? 'Son tarih doldu'
                              : daysLeft === 0
                              ? 'Bugün son gün!'
                              : daysLeft === 1
                              ? 'Yarın son teslim!'
                              : `Son Teslim: ${new Date(a.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`}
                          </span>
                        </div>
                      );
                    })()}

                    {a.desc && (
                      <p className="text-sm text-slate-800 leading-relaxed font-medium line-clamp-2">
                        {a.desc}
                      </p>
                    )}

                    {/* Teacher Feedback Bubble if completed */}
                    {sub?.status === 'reviewed' && sub.feedback && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-1">
                        <div className="font-extrabold text-emerald-950 flex items-center gap-1 text-xs">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Öğretmen Değerlendirmesi:</span>
                        </div>
                        <p className="text-slate-900 font-medium italic text-xs leading-relaxed">
                          &ldquo;{sub.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    {/* Interaktif Test Action */}
                    {isTest && (
                      <div className="w-full">
                        {sub?.percent !== undefined ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Başarıyla Çözüldü</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartFocusTest(a)}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                              <span>Tekrar Çöz</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartFocusTest(a)}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-blue-600/20"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Teste Başla ({a.questions?.length || 0} Soru)</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Yazılı / Fotoğraflı Ödev Action */}
                    {isBook && (
                      <div className="w-full">
                        {sub ? (
                          <button
                            type="button"
                            onClick={() => setSubmitModalAssignment(a)}
                            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Teslim Detayını & Yanıtımı Gör</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSubmitModalAssignment(a)}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-blue-600/20"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Ödevi Yanıtla / Belge Yükle</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Ders Notu Action */}
                    {isNote && (
                      <div className="w-full">
                        <button
                          type="button"
                          onClick={() => setViewingNote(a)}
                          className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                          <span>Ders Notunu & Materyali Aç</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Katılınan Sınıf Şubeleri */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-950">
                Kayıtlı Olduğun Sınıflar ({state.joinedClassrooms.length})
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Öğretmeninin paylaştığı kodla dahil olduğun çalışma masaları.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sınıfa Katıl</span>
          </button>
        </div>

        {state.joinedClassrooms.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
            <School className="w-7 h-7 mx-auto text-slate-500" />
            <h4 className="font-bold text-slate-950 text-sm">Henüz bir sınıfa katılmadın</h4>
            <p className="text-xs text-slate-700 font-medium">
              Öğretmeninden 6 haneli katılım kodunu alarak sınıfına katılabilirsin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.joinedClassrooms.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-950 truncate">{c.name}</h4>
                  {c.subject && <div className="text-xs text-slate-700 font-semibold">{c.subject}</div>}
                  <div className="text-xs text-blue-700 font-mono font-bold pt-0.5">
                    Öğretmen: {c.teacherName || 'Öğretmen'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`"${c.name}" sınıfından ayrılmak istediğine emin misin?`)) {
                      leaveClassroom(c.id);
                    }
                  }}
                  className="text-slate-500 hover:text-red-700 text-xs transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                  title="Sınıftan Ayrıl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. FLOATING AI STUDY COACH DRAWER (STUDENT COPILOT)                       */}
      {/* ========================================================================= */}
      <StudentAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onToggle={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        onStartFocusPracticeQuiz={(quiz) => {
          setIsAiDrawerOpen(false);
          setActiveStudyQuiz(quiz);
        }}
        initialTab={aiDrawerInitialTab}
        gradeLevel={currentGradeLevel}
      />

      {/* ========================================================================= */}
      {/* 7. MODALS                                                                 */}
      {/* ========================================================================= */}
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

      {activeStudyQuiz && (
        <QuizStudyModal
          quiz={activeStudyQuiz}
          isOpen={!!activeStudyQuiz}
          onClose={() => setActiveStudyQuiz(null)}
          onComplete={handleStudyQuizComplete}
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
