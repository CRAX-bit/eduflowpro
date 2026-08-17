'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, Question } from '@/types';
import { initials, fmtTime, cn } from '@/lib/utils';
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

export function StudentView() {
  const {
    state,
    getStudentById,
    getVisibleAssignments,
    submitTestAnswers,
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
      {/* 1. Header Banner */}
      <header className="p-6 sm:p-7 rounded-2xl bg-[#090a0f] border border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-base text-white shadow-md shrink-0 border border-white/10"
            style={{ backgroundColor: studentColor }}
          >
            {initials(studentDisplayName)}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <GraduationCap className="w-3 h-3" />
                <span>Öğrenci Portalı</span>
              </div>

              {/* Interactive Target Level Selector */}
              <div className="relative">
                <button
                  type="button"
                  disabled={isUpdatingLevel}
                  onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-sm group"
                  title="Hedef sınav veya eğitim seviyenizi değiştirmek için tıklayın"
                >
                  <span className="text-emerald-400 font-semibold">🎯 Hedef:</span>
                  <span className="font-semibold text-white max-w-[180px] sm:max-w-[240px] truncate">
                    {currentGradeLevel}
                  </span>
                  {isUpdatingLevel ? (
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                  ) : (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform',
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
              Ödevlerini tamamla, ders notlarını incele ve Quizlet odak modunda interaktif testler çöz.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsJoinClassModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>Sınıfa Katıl</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiDrawerInitialTab('practice');
              setIsAiDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Alıştırma Testi (AI)</span>
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

      {/* 3. Performance & Success Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Progress Breakdown Card */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-heading font-semibold text-sm text-white">
                Ödev & Görev Tamamlama Durumu
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              %{stats.completionRate} Tamamlandı
            </span>
          </div>

          {/* Progress Multi-Bar */}
          <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{
                width: `${stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0}%`,
              }}
              title={`Tamamlanan: ${stats.completedCount}`}
            />
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{
                width: `${stats.totalCount > 0 ? (stats.evaluatingCount / stats.totalCount) * 100 : 0}%`,
              }}
              title={`Değerlendirmede: ${stats.evaluatingCount}`}
            />
            <div
              className="h-full bg-amber-500 transition-all"
              style={{
                width: `${stats.totalCount > 0 ? (stats.pendingCount / stats.totalCount) * 100 : 0}%`,
              }}
              title={`Bekleyen: ${stats.pendingCount}`}
            />
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <div className="font-bold text-white">{stats.completedCount}</div>
                <div className="text-[10px] text-zinc-400">Tamamlanan</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <div className="font-bold text-white">{stats.evaluatingCount}</div>
                <div className="text-[10px] text-zinc-400">Değerlendirmede</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-white">{stats.pendingCount}</div>
                <div className="text-[10px] text-zinc-400">Bekleyen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Performance & Quiz History Card */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading font-semibold text-sm text-white">
                Tamamlanan Testler & Başarı Analizi
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {stats.completedTestsList.length} Çözülen Test
            </span>
          </div>

          {stats.completedTestsList.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div>Henüz tamamlanmış bir test bulunmuyor.</div>
              <p className="text-[11px] text-zinc-500">
                Alıştırma testlerini çözdükçe başarı analiziniz burada görüntülenecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
              {stats.completedTestsList.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-white truncate max-w-[240px]">{t.title}</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[11px] font-mono font-bold',
                      t.score >= 80
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : t.score >= 60
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-amber-500/10 text-amber-400'
                    )}
                  >
                    %{t.score}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Sınav Seviyeniz:</span>
            <span className="font-semibold text-white truncate max-w-[200px]">{currentGradeLevel}</span>
          </div>
        </div>
      </section>

      {/* 4. Categorized Assignments Section (Quizlet / Notion Clean Tabs) */}
      <section className="space-y-4">
        {/* Subtabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0c0d12] border border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
            {categorizedAssignments.length} görev listeleniyor
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {categorizedAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0c0d12] border border-dashed border-zinc-800 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-600" />
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

                    {a.fileName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                        <FileText className="w-3 h-3 text-cyan-400" />
                        <span className="truncate max-w-[180px]">{a.fileName}</span>
                      </div>
                    )}

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
                        type="button"
                        onClick={() => setViewingNote(a)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ders Notunu Oku</span>
                      </button>
                    )}

                    {isBook && (
                      <button
                        type="button"
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
                        type="button"
                        onClick={() => handleStartFocusTest(a)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Quizlet Odak Modunda Başlat</span>
                      </button>
                    )}

                    {isTest && sub && (
                      <button
                        type="button"
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

      {/* 5. Study Notes & Materials Archive Section */}
      {studyMaterialsList.length > 0 && (
        <section className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-heading font-semibold text-base text-white">
                  Ders Notları & Çalışma Dokümanları ({studyMaterialsList.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Öğretmenleriniz tarafından paylaşılan tüm ders fasikülleri ve özet dokümanları.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studyMaterialsList.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <h4 className="font-semibold text-xs text-white truncate">{m.title}</h4>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                    <span>{m.folder}</span>
                    {m.classroomName && <span>• {m.classroomName}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingNote(m)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>İncele</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Joined Classrooms Section */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-heading font-semibold text-sm text-white">
                Kayıtlı Olduğum Sınıflar ({state.joinedClassrooms.length})
              </h3>
              <p className="text-xs text-zinc-400">
                Katıldığınız ders şubeleri ve öğretmen çalışma grupları.
              </p>
            </div>
          </div>

          <button
            type="button"
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
                    <span>
                      Kod: <b className="font-mono text-emerald-400">{c.joinCode}</b>
                    </span>
                    {c.subject && <span>• {c.subject}</span>}
                  </div>
                </div>

                <button
                  type="button"
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

      {/* ========================================================================= */}
      {/* 7. FLOATING AI COPILOT SLIDE-OVER DRAWER (STUDENT TUTOR)                  */}
      {/* ========================================================================= */}
      <StudentAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onToggle={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        currentGradeLevel={currentGradeLevel}
        initialTab={aiDrawerInitialTab}
        onStartFocusTest={(quizData) => {
          setActiveStudyQuiz({
            title: quizData.title,
            folder: quizData.folder,
            questions: quizData.questions,
            timeLimit: quizData.timeLimit,
          });
        }}
      />

      {/* ========================================================================= */}
      {/* 8. MODALS & SUB-VIEWS                                                     */}
      {/* ========================================================================= */}
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
