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
  School,
  Copy,
  Check,
  Hash,
  Plus,
  Compass,
  FileCheck,
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';
import { FeedbackModal } from './FeedbackModal';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { CreateClassroomModal } from './CreateClassroomModal';
import { AssignmentReviewModal } from './AssignmentReviewModal';
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
    deleteClassroom,
    logout,
    showToast,
    getStudentById,
  } = useEduFlow();

  // Active Tab: 'assignments' | 'students' | 'ai_studio'
  const [activeTab, setActiveTab] = useState<'assignments' | 'students' | 'ai_studio'>('assignments');
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

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
  const [reviewAssignment, setReviewAssignment] = useState<Assignment | null>(null);
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
    if (confirm(`"${title}" başlıklı ödev ve tüm teslim kayıtları silinecektir. Emin misiniz?`)) {
      deleteAssignment(id);
    }
  };

  const handleDeleteStudent = (s: Student) => {
    if (confirm(`${s.name} ve tüm ödev kayıtları tamamen silinecektir. Emin misiniz?`)) {
      deleteStudent(s.id);
    }
  };

  const handleCopyCode = (code: string, classId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(classId);
    showToast(`Katılım kodu kopyalandı: ${code}`, 'success');
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2500);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`"${name}" sınıfını ve bu sınıfa ait üyelikleri silmek istediğinize emin misiniz?`)) {
      deleteClassroom(id);
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
      return acc + subs.filter((s) => (a.type === 'test' ? s.percent !== undefined : s.photo || s.responseText)).length;
    }, 0);
  }, [state.assignments]);

  const teacherDisplayName = state.session?.name || 'Öğretmenim';

  return (
    <div className="space-y-6 animate-fade pb-16">
      {/* 1. Calm Workspace Header */}
      <header className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            <span>Öğretmen Çalışma Alanı</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Hoş Geldiniz, {teacherDisplayName}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Sınıflarınızı yönetin, ödev ve materyaller tanımlayın, teslim edilen çalışmaları inceleyip notlandırın.
          </p>
        </div>

        {/* Topbar Actions */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              setCreateModalPrefill(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ödev Oluştur</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
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
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Kayıtlı Öğrenciler
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.students.length}
            </div>
            <div className="text-[11px] text-slate-400">Sınıf Mevcudu</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Assignments */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Aktif Ödev & Notlar
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.assignments.length}
            </div>
            <div className="text-[11px] text-slate-400">Yayındaki Materyal</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Submissions */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Ödev Teslimleri
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {totalSubmissions}
            </div>
            <div className="text-[11px] text-slate-400">Tamamlanan Teslim</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Classrooms */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">
              Mevcut Sınıflar
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.classrooms.length}
            </div>
            <div className="text-[11px] text-slate-400">Aktif Şube</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <School className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. Main Pill Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab('assignments')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
            activeTab === 'assignments'
              ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Ödevler & İçerikler ({state.assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
            activeTab === 'students'
              ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          )}
        >
          <Users className="w-4 h-4" />
          <span>Sınıflarım & Öğrenciler ({state.classrooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_studio')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
            activeTab === 'ai_studio'
              ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          )}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Soru & İçerik Üretici</span>
        </button>
      </div>

      {/* 4. TAB 1: Ödevler & İçerikler */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fade">
          {/* Filters & Search Row */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                  typeFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                Tümü ({state.assignments.length})
              </button>

              <button
                onClick={() => setTypeFilter('test')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                  typeFilter === 'test'
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                Testler ({state.assignments.filter((a) => a.type === 'test').length})
              </button>

              <button
                onClick={() => setTypeFilter('note')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                  typeFilter === 'note'
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                Ders Notları ({state.assignments.filter((a) => a.type === 'note').length})
              </button>

              <button
                onClick={() => setTypeFilter('book')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                  typeFilter === 'book'
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                Kitap & Yazılı Ödevler ({state.assignments.filter((a) => a.type === 'book').length})
              </button>
            </div>

            {/* Target Student Filter & Search Box */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ödev veya ünite ara..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {state.students.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
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
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3 animate-fade">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-heading font-semibold text-base text-white">
                  Aktif bir ödev veya içerik bulunmuyor
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Öğrencileriniz için ders notları paylaşabilir, süreli testler veya yazılı ödev teslimleri oluşturabilirsiniz.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreateModalPrefill(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>İlk Ödevi Oluştur</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  isTest ? sub.percent !== undefined : sub.photo || sub.responseText
                ).length;

                return (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
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

                        <span className="text-slate-400 text-xs">
                          {timeAgo(a.createdAt)}
                        </span>
                      </div>

                      {/* Title & Folder */}
                      <div>
                        <h3 className="font-heading font-semibold text-base text-white line-clamp-1">
                          {a.title}
                        </h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>Ünite:</span>
                          <span className="text-slate-300 font-medium">{a.folder}</span>
                          {a.classroomName && (
                            <span className="ml-1 text-indigo-400 font-medium">• {a.classroomName}</span>
                          )}
                        </div>
                      </div>

                      {/* Description Preview */}
                      {a.desc && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {a.desc}
                        </p>
                      )}

                      {/* Meta Info Strip */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-xs text-slate-400">
                          Hedef: <b className="text-slate-200 font-medium">{targetLabel}</b>
                        </span>

                        {isTest && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{a.timeLimit ? `${Math.round(a.timeLimit / 60)} dk` : 'Süresiz'}</span>
                          </span>
                        )}
                      </div>

                      {/* Completion Progress Bar */}
                      {!isNote && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Teslim Durumu:</span>
                            <span className="font-semibold text-emerald-400">
                              {completedCount} / {targetStudents.length || 1} Öğrenci
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isNote && (
                          <button
                            onClick={() => setViewingNote(a)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Notu Oku</span>
                          </button>
                        )}

                        {!isNote && (
                          <button
                            onClick={() => setReviewAssignment(a)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border',
                              completedCount > 0
                                ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                            )}
                          >
                            <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Teslimleri İncele ({completedCount})</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteAssignment(a.id, a.title)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-300 transition-all cursor-pointer"
                        title="Ödevi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detailed Live Monitor Table for Active Assignments */}
          {state.assignments.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-base text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Öğrenci Teslim & Değerlendirme Çizelgesi</span>
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
                            <div className="text-[11px] text-slate-400">{a.folder}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
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
                              {a.type === 'note' ? 'DERS NOTU' : a.type === 'test' ? 'TEST' : 'ÖDEV'}
                            </span>
                          </td>
                          <td className="p-3">
                            {a.type === 'note' ? (
                              <span className="text-cyan-400 text-xs font-medium">Yayında</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {targetStudents.map((s) => {
                                  const sub = a.submissions?.[s.id];
                                  const done = a.type === 'test' ? sub?.percent !== undefined : !!sub?.photo || !!sub?.responseText;
                                  return (
                                    <span
                                      key={s.id}
                                      className={cn(
                                        'px-2 py-0.5 rounded-md text-[11px] font-medium',
                                        done
                                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                                      )}
                                      title={`${s.name}: ${done ? 'Teslim etti' : 'Bekleniyor'}`}
                                    >
                                      {s.name.split(' ')[0]}: {done ? (a.type === 'test' ? `%${sub?.percent}` : 'Teslim') : '—'}
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
                                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
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
                                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                                      title={`${s.name} için değerlendirme yap`}
                                    >
                                      <MessageSquareQuote className="w-3 h-3 text-indigo-400" />
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

      {/* 5. TAB 2: Sınıflarım & Öğrenciler */}
      {activeTab === 'students' && (
        <div className="space-y-10 animate-fade">
          {/* Classrooms Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-400" />
                  <span>Sınıflarım & Şubelerim ({state.classrooms.length})</span>
                </h3>
              </div>
              <button
                onClick={() => setIsCreateClassModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yeni Sınıf Oluştur</span>
              </button>
            </div>

            {state.classrooms.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <School className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="font-heading font-semibold text-white text-base">Henüz bir sınıf oluşturmadınız</h4>
                  <p className="text-xs text-slate-400">
                    Yeni bir sınıf oluşturarak otomatik 6 haneli katılım kodu alabilir ve öğrencilerinizle paylaşabilirsiniz.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateClassModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>İlk Sınıfı Oluştur</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.classrooms.map((c) => {
                  const assignedCount = state.assignments.filter((a) => a.classroomId === c.id).length;
                  const isCopied = copiedCodeId === c.id;

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-indigo-300 text-xs font-semibold border border-slate-700">
                            {c.subject || 'Genel'}
                          </span>
                          <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-white">{c.name}</h4>
                        <div className="text-xs text-slate-400">
                          {assignedCount} Atanan Ödev
                        </div>
                      </div>

                      {/* Code Strip */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Katılım Kodu
                          </div>
                          <div className="font-mono font-bold text-sm text-cyan-400">
                            {c.joinCode}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyCode(c.joinCode, c.id)}
                          className={cn(
                            'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border',
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                          )}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-xs text-slate-400">
                          Öğrenci Kodu: <b className="text-slate-200 font-mono">{c.joinCode}</b>
                        </span>
                        <button
                          onClick={() => handleDeleteClass(c.id, c.name)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                          title="Sınıfı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Students List Section */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Kayıtlı Öğrenciler ({state.students.length})</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Öğrenci adı ile ara..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Add Student Card */}
            <form onSubmit={handleAddStudent} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
              <div className="text-xs font-semibold text-slate-300 shrink-0 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Hızlı Öğrenci Ekle:</span>
              </div>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Örn: Ayşe Yılmaz"
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none flex-1 min-w-[140px]"
                required
              />
              <input
                type="text"
                value={newStudentPass}
                onChange={(e) => setNewStudentPass(e.target.value)}
                placeholder="Giriş Şifresi (örn: 1234)"
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none w-36"
                required
              />
              <button
                type="submit"
                disabled={isAddingStudent}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                + Öğrenciyi Ekle
              </button>
            </form>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                Öğrenci bulunamadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((s) => {
                  const studentSubmissions = state.assignments.filter((a) => a.submissions?.[s.id]);
                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white"
                            style={{ backgroundColor: s.color || '#6366F1' }}
                          >
                            {initials(s.name)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{s.name}</h4>
                            <span className="text-[11px] text-slate-400">Kullanıcı: {s.username}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteStudent(s)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                          title="Öğrenciyi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                        <span>{studentSubmissions.length} Tamamlanan Ödev</span>
                        <button
                          onClick={() => setReportStudent(s)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          Karne İncele ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* 6. TAB 3: Soru & İçerik Üretici */}
      {activeTab === 'ai_studio' && (
        <GeminiStudioTab onOpenCreateAssignmentModal={(prefill) => {
          setCreateModalPrefill(prefill);
          setIsCreateModalOpen(true);
        }} />
      )}

      {/* Modals */}
      {isCreateClassModalOpen && (
        <CreateClassroomModal
          isOpen={isCreateClassModalOpen}
          onClose={() => setIsCreateClassModalOpen(false)}
        />
      )}

      {isCreateModalOpen && (
        <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateModalPrefill(null);
          }}
          prefillData={createModalPrefill}
        />
      )}

      {reportStudent && (
        <ReportCardModal
          student={reportStudent}
          onClose={() => setReportStudent(null)}
        />
      )}

      {reviewAssignment && (
        <AssignmentReviewModal
          assignment={reviewAssignment}
          isOpen={!!reviewAssignment}
          onClose={() => setReviewAssignment(null)}
        />
      )}

      {feedbackItem && (
        <FeedbackModal
          assignment={feedbackItem.assignment}
          student={feedbackItem.student}
          onClose={() => setFeedbackItem(null)}
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
