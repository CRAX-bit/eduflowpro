'use client';

import React, { useState, useMemo } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, AssignmentType, Student, Question } from '@/types';
import { initials, timeAgo, cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Trash2,
  FileSpreadsheet,
  PlusCircle,
  FileText,
  ListCheck,
  BookOpen,
  Send,
  Radio,
  Filter,
  Eye,
  Camera,
  MessageSquareQuote,
  Sparkles,
  UploadCloud,
  X,
  LogOut,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';
import { FeedbackModal } from './FeedbackModal';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { GeminiStudioTab } from './GeminiStudioTab';

interface TeacherViewProps {
  onOpenAiAssistant?: () => void;
  externalGeneratedQuiz?: any;
  externalGeneratedNote?: any;
}

export function TeacherView({
  onOpenAiAssistant,
  externalGeneratedQuiz,
  externalGeneratedNote,
}: TeacherViewProps) {
  const {
    state,
    addStudent,
    deleteStudent,
    deleteAssignment,
    logout,
    showToast,
    getStudentById,
  } = useEduFlow();

  // Active Tab: 'assignments' | 'students' | 'ai_studio'
  const [activeTab, setActiveTab] = useState<'assignments' | 'students' | 'ai_studio'>('assignments');

  // Assignment Filters
  const [typeFilter, setTypeFilter] = useState<'all' | AssignmentType>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Search
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPrefill, setCreateModalPrefill] = useState<any>(null);
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [feedbackItem, setFeedbackItem] = useState<{
    assignment: Assignment;
    student: Student;
  } | null>(null);
  const [viewingNote, setViewingNote] = useState<Assignment | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    studentName?: string;
  } | null>(null);

  // React to external AI generated quiz
  React.useEffect(() => {
    if (externalGeneratedQuiz) {
      setCreateModalPrefill({
        type: 'test',
        title: externalGeneratedQuiz.title || '',
        folder: externalGeneratedQuiz.folder || '',
        desc: externalGeneratedQuiz.desc || '',
        timeLimit: externalGeneratedQuiz.timeLimit || 120,
        questions: externalGeneratedQuiz.questions || [],
      });
      setIsCreateModalOpen(true);
    }
  }, [externalGeneratedQuiz]);

  // React to external AI generated note
  React.useEffect(() => {
    if (externalGeneratedNote) {
      setCreateModalPrefill({
        type: 'note',
        title: externalGeneratedNote.title || '',
        folder: externalGeneratedNote.folder || '',
        desc: externalGeneratedNote.content || '',
      });
      setIsCreateModalOpen(true);
    }
  }, [externalGeneratedNote]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPass.trim()) {
      showToast('Lütfen öğrenci adı ve erişim şifresi giriniz.', 'warn');
      return;
    }
    setIsAddingStudent(true);
    if (addStudent(newStudentName, newStudentPass)) {
      setNewStudentName('');
      setNewStudentPass('');
    }
    setIsAddingStudent(false);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (confirm(`"${title}" başlıklı ödev ve tüm teslim kayıtları silinecek. Emin misiniz?`)) {
      deleteAssignment(id);
    }
  };

  const handleDeleteStudent = (s: Student) => {
    if (confirm(`${s.name} ve tüm ödev kayıtları tamamen silinecektir. Emin misiniz?`)) {
      deleteStudent(s.id);
    }
  };

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return state.assignments.filter((a) => {
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      const matchesStudent =
        studentFilter === 'all' || a.target === 'all' || a.target === studentFilter;
      const matchesSearch =
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.folder.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStudent && matchesSearch;
    });
  }, [state.assignments, typeFilter, studentFilter, searchQuery]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return state.students.filter((s) => {
      return (
        studentSearchQuery === '' ||
        s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(studentSearchQuery.toLowerCase())
      );
    });
  }, [state.students, studentSearchQuery]);

  // Metrics Calculations
  const totalSubmissions = useMemo(() => {
    return state.assignments.reduce((acc, a) => {
      const subs = Object.values(a.submissions || {});
      return acc + subs.filter((s) => (a.type === 'test' ? s.percent !== undefined : s.photo)).length;
    }, 0);
  }, [state.assignments]);

  const teacherDisplayName = state.session?.name || 'Öğretmenim';

  return (
    <div className="space-y-6 animate-fade pb-16">
      {/* 1. Modern Workspace Topbar Header */}
      <header className="p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <span>👨‍🏫 Öğretmen Çalışma Alanı</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Hoş Geldiniz, <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">{teacherDisplayName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Sınıfınızı yönetin, ödev ve testler atayın, teslim durumlarını anlık izleyip öğrencilerinize geri bildirim verin.
          </p>
        </div>

        {/* Topbar Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 self-start md:self-auto">
          <button
            onClick={() => {
              setCreateModalPrefill(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Yeni Ödev Oluştur</span>
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
      </header>

      {/* 2. Workspace Metrics Ribbon */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div className="p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Kayıtlı Öğrenciler
            </div>
            <div className="font-heading font-extrabold text-2xl text-white">
              {state.students.length}
            </div>
            <div className="text-[10px] text-indigo-400">Sınıf Mevcudu</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Assignments */}
        <div className="p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Aktif Ödev & Not
            </div>
            <div className="font-heading font-extrabold text-2xl text-white">
              {state.assignments.length}
            </div>
            <div className="text-[10px] text-purple-400">Yayındaki Materyaller</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Submissions */}
        <div className="p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tamamlanan Teslimler
            </div>
            <div className="font-heading font-extrabold text-2xl text-white">
              {totalSubmissions}
            </div>
            <div className="text-[10px] text-emerald-400">Ödev & Test Çözümü</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: AI Engine */}
        <div className="p-5 rounded-2xl bg-[#111827]/70 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Gemini Pro Asistan
            </div>
            <div className="font-heading font-bold text-base text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hazır & Çevrimiçi</span>
            </div>
            <div className="text-[10px] text-slate-400">Soru & Ders Notu Üretici</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. Main Pill Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab('assignments')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'assignments'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Layers className="w-4 h-4" />
          <span>📑 Ödevler & İçerikler ({state.assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'students'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Users className="w-4 h-4" />
          <span>👥 Sınıfım & Öğrenciler ({state.students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_studio')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'ai_studio'
              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>✨ AI Asistan (Gemini Studio)</span>
        </button>
      </div>

      {/* 4. TAB 1: Ödevler & İçerikler */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fade">
          {/* Filters & Search Row */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#111827]/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  typeFilter === 'all'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                Tümü ({state.assignments.length})
              </button>

              <button
                onClick={() => setTypeFilter('test')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  typeFilter === 'test'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                📝 Testler ({state.assignments.filter((a) => a.type === 'test').length})
              </button>

              <button
                onClick={() => setTypeFilter('note')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  typeFilter === 'note'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                📄 Ders Notları ({state.assignments.filter((a) => a.type === 'note').length})
              </button>

              <button
                onClick={() => setTypeFilter('book')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  typeFilter === 'book'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                📚 Kitap Ödevleri ({state.assignments.filter((a) => a.type === 'book').length})
              </button>
            </div>

            {/* Target Student Filter & Search Box */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ödev veya ünite ara..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {state.students.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="all">Tüm Hedefler</option>
                    {state.students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Assignments List / Empty State */}
          {filteredAssignments.length === 0 ? (
            <div className="p-12 sm:p-16 text-center rounded-3xl bg-[#111827]/60 border border-dashed border-slate-800 space-y-4 animate-fade">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-heading font-bold text-lg text-white">
                  Henüz aktif bir ödev veya içerik bulunmuyor
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Öğrencileriniz için ders notları paylaşabilir, süreli interaktif testler tanımlayabilir veya kitap ödevi teslimleri oluşturabilirsiniz.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreateModalPrefill(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ İlk Ödevinizi Oluşturun</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssignments.map((a) => {
                const targetLabel =
                  a.target === 'all' ? 'Tüm Sınıf' : getStudentById(a.target)?.name || 'Tekil Öğrenci';
                const isTest = a.type === 'test';
                const isBook = a.type === 'book';
                const isNote = a.type === 'note';

                const targetStudents =
                  a.target === 'all'
                    ? state.students
                    : state.students.filter((s) => s.id === a.target);

                const submissionsList = Object.entries(a.submissions || {});
                const completedCount = submissionsList.filter(([_, sub]) =>
                  isTest ? sub.percent !== undefined : sub.photo
                ).length;

                return (
                  <div
                    key={a.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#111827]/80 border border-slate-800/90 hover:border-indigo-500/40 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase',
                            isNote
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : isTest
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          )}
                        >
                          {isNote ? 'Ders Notu' : isTest ? 'İnteraktif Test' : 'Kitap Ödevi'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                          {timeAgo(a.createdAt)}
                        </span>
                      </div>

                      {/* Title & Folder */}
                      <div>
                        <h3 className="font-heading font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {a.title}
                        </h3>
                        <div className="text-xs text-indigo-400/90 flex items-center gap-1 mt-0.5">
                          <span>Ünite:</span>
                          <span className="font-semibold text-slate-300">{a.folder}</span>
                        </div>
                      </div>

                      {/* Description Preview */}
                      {a.desc && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {a.desc}
                        </p>
                      )}

                      {/* Meta Info Strip */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] text-slate-400">
                          Hedef: <b className="text-slate-200">{targetLabel}</b>
                        </span>

                        {isTest && (
                          <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{a.timeLimit ? `${Math.round(a.timeLimit / 60)} dk` : 'Limitsiz'}</span>
                          </span>
                        )}
                      </div>

                      {/* Completion Progress Bar */}
                      {!isNote && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Teslim Durumu:</span>
                            <span className="font-bold text-emerald-400">
                              {completedCount} / {targetStudents.length || 1} Öğrenci
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  targetStudents.length
                                    ? Math.round((completedCount / targetStudents.length) * 100)
                                    : completedCount > 0
                                    ? 100
                                    : 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        {isNote && (
                          <button
                            onClick={() => setViewingNote(a)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Notu Oku</span>
                          </button>
                        )}

                        {!isNote && completedCount > 0 && (
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Teslimler Mevcut</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteAssignment(a.id, a.title)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        title="Ödevi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detailed Live Monitor Table for Active Assignments */}
          {state.assignments.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span>Canlı Öğrenci Teslim & Değerlendirme Tablosu</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="p-3">Ödev / Başlık</th>
                      <th className="p-3">Hedef</th>
                      <th className="p-3">Tür</th>
                      <th className="p-3">Teslim Durumu</th>
                      <th className="p-3">İşlem / Geri Bildirim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredAssignments.map((a) => {
                      const targetLabel =
                        a.target === 'all' ? 'Tüm Sınıf' : getStudentById(a.target)?.name || '—';
                      const targetStudents =
                        a.target === 'all'
                          ? state.students
                          : state.students.filter((s) => s.id === a.target);

                      return (
                        <tr key={a.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-white">{a.title}</div>
                            <div className="text-[10px] text-slate-500">{a.folder}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px]">
                              {targetLabel}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-md text-[10px] font-semibold',
                                a.type === 'note'
                                  ? 'bg-cyan-500/15 text-cyan-300'
                                  : a.type === 'test'
                                  ? 'bg-purple-500/15 text-purple-300'
                                  : 'bg-emerald-500/15 text-emerald-300'
                              )}
                            >
                              {a.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            {a.type === 'note' ? (
                              <span className="text-cyan-400 text-[11px] font-medium">Yayında</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {targetStudents.map((s) => {
                                  const sub = a.submissions?.[s.id];
                                  const done = a.type === 'test' ? sub?.percent !== undefined : !!sub?.photo;
                                  return (
                                    <span
                                      key={s.id}
                                      className={cn(
                                        'px-2 py-0.5 rounded-md text-[10px] font-semibold',
                                        done
                                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                                      )}
                                      title={`${s.name}: ${done ? 'Teslim etti' : 'Bekleniyor'}`}
                                    >
                                      {s.name.split(' ')[0]}: {done ? (a.type === 'test' ? `%${sub?.percent}` : 'Foto') : '—'}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {a.type === 'note' ? (
                                <button
                                  onClick={() => setViewingNote(a)}
                                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Görüntüle</span>
                                </button>
                              ) : (
                                targetStudents.map((s) => {
                                  const sub = a.submissions?.[s.id];
                                  if (!sub) return null;
                                  return (
                                    <button
                                      key={s.id}
                                      onClick={() =>
                                        setFeedbackItem({
                                          assignment: a,
                                          student: s,
                                        })
                                      }
                                      className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                                      title={`${s.name} için yorum düzenle`}
                                    >
                                      <MessageSquareQuote className="w-3 h-3 text-purple-400" />
                                      <span>{s.name.split(' ')[0]}</span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: Sınıfım & Öğrenciler */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade">
          {/* Add Student Card */}
          <section className="p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <UserPlus className="w-4 h-4" />
              <span>Yeni Öğrenci Hesabı Tanımla</span>
            </div>

            <form onSubmit={handleAddStudent} className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Öğrenci Adı Soyadı (örn: Ali Vural)"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-56">
                <input
                  type="text"
                  value={newStudentPass}
                  onChange={(e) => setNewStudentPass(e.target.value)}
                  placeholder="Erişim Şifresi / Kodu (örn: ali123)"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingStudent}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Öğrenciyi Ekle</span>
              </button>
            </form>
          </section>

          {/* Student Search and Count */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-semibold text-slate-400">
              Kayıtlı Öğrenci Listesi ({state.students.length})
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="İsim veya kullanıcı adı ara..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Student Grid / Empty State */}
          {filteredStudents.length === 0 ? (
            <div className="p-12 sm:p-16 text-center rounded-3xl bg-[#111827]/60 border border-dashed border-slate-800 space-y-4 animate-fade">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-heading font-bold text-lg text-white">
                  Sınıfınızda henüz kayıtlı öğrenci bulunmuyor
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Yukarıdaki formdan öğrenci adı ve erişim şifresi belirleyerek ilk öğrencinizi ekleyebilirsiniz.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800/90 hover:border-indigo-500/40 backdrop-blur-xl shadow-md flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-heading font-bold text-sm text-white shrink-0 shadow-md"
                      style={{ backgroundColor: s.color }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-white truncate">{s.name}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Kullanıcı: <b className="text-cyan-400">@{s.username}</b>
                      </div>
                      {s.password && (
                        <div className="text-[10px] text-slate-500 truncate">
                          Şifre: <span className="text-slate-300 font-mono">{s.password}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setReportStudent(s)}
                      title="Gelişim Karnesi (PDF)"
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s)}
                      title="Öğrenciyi Sil"
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: AI Asistan (Gemini Studio) */}
      {activeTab === 'ai_studio' && (
        <GeminiStudioTab
          onOpenCreateAssignmentModal={(prefill) => {
            setCreateModalPrefill(prefill);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        prefillData={createModalPrefill}
      />
      <ReportCardModal student={reportStudent} onClose={() => setReportStudent(null)} />
      <FeedbackModal
        assignment={feedbackItem?.assignment || null}
        student={feedbackItem?.student || null}
        onClose={() => setFeedbackItem(null)}
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
