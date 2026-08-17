'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, AssignmentType, Student, Question, Classroom } from '@/types';
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
  FileUp,
  Download,
  AlertCircle,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';
import { FeedbackModal } from './FeedbackModal';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { CreateClassroomModal } from './CreateClassroomModal';
import { AssignmentReviewModal } from './AssignmentReviewModal';
import { TeacherAiDrawer } from './TeacherAiDrawer';

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
    createAssignment,
    logout,
    showToast,
    getStudentById,
  } = useEduFlow();

  // Active LMS Tab: 'assignments' | 'gradebook' | 'students'
  const [activeTab, setActiveTab] = useState<'assignments' | 'gradebook' | 'students'>('assignments');
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Floating AI Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Assignment Filters
  const [typeFilter, setTypeFilter] = useState<'all' | AssignmentType>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Gradebook Search & Filter
  const [gradebookSearch, setGradebookSearch] = useState('');
  const [gradebookClassFilter, setGradebookClassFilter] = useState<string>('all');

  // Student Search
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Quick Material / PDF Upload Area State
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFolder, setMaterialFolder] = useState('');
  const [materialClassId, setMaterialClassId] = useState('');
  const [materialTarget, setMaterialTarget] = useState('all');
  const [materialDesc, setMaterialDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileData, setSelectedFileData] = useState<string | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        timeLimit: externalGeneratedQuiz.timeLimit || 180,
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
      setCopiedCodeId(null), 2500;
    });
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`"${name}" sınıfını ve bu sınıfa ait üyelikleri silmek istediğinize emin misiniz?`)) {
      deleteClassroom(id);
    }
  };

  // Handle Quick PDF / Material File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Dosya boyutu 10MB\'dan küçük olmalıdır.', 'warn');
      return;
    }

    setSelectedFile(file);
    if (!materialTitle) {
      setMaterialTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      showToast('Lütfen materyal veya ders başlığı giriniz.', 'warn');
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const selectedClass = state.classrooms.find((c) => c.id === materialClassId);
      const isSuccess = createAssignment({
        type: 'note',
        title: materialTitle.trim(),
        folder: materialFolder.trim() || 'Ders Materyali & PDF',
        target: materialTarget,
        classroomId: materialClassId || undefined,
        classroomName: selectedClass?.name || undefined,
        desc: materialDesc.trim() || `${materialTitle} ders materyali ve çalışma dokümanı.`,
        fileName: selectedFile ? selectedFile.name : null,
        fileData: selectedFileData,
      });

      if (isSuccess) {
        setMaterialTitle('');
        setMaterialFolder('');
        setMaterialDesc('');
        setSelectedFile(null);
        setSelectedFileData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast('Materyal başarıyla yüklendi ve paylaşıldı!', 'success');
      }
    } catch (err) {
      showToast('Materyal yüklenirken bir hata oluştu.', 'error');
    } finally {
      setIsUploadingMaterial(false);
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

  // Uploaded Materials List
  const uploadedMaterialsList = useMemo(() => {
    return state.assignments.filter((a) => a.type === 'note' || a.fileName);
  }, [state.assignments]);

  // Gradebook Data Calculation
  const gradebookData = useMemo(() => {
    return state.students
      .map((student) => {
        const studentAssignments = state.assignments.filter(
          (a) => a.target === 'all' || a.target === student.id
        );

        let completedAssignmentsCount = 0;
        let totalScoreSum = 0;
        let gradedCount = 0;
        let testsCompleted = 0;
        let lastActivityDate: number | null = null;

        studentAssignments.forEach((a) => {
          const sub = a.submissions?.[student.id];
          if (!sub) return;

          if (sub.at && (!lastActivityDate || sub.at > lastActivityDate)) {
            lastActivityDate = sub.at;
          }

          if (a.type === 'test' && sub.percent !== undefined) {
            completedAssignmentsCount += 1;
            testsCompleted += 1;
            totalScoreSum += sub.percent;
            gradedCount += 1;
          } else if (sub.status === 'reviewed') {
            completedAssignmentsCount += 1;
            if (sub.finalScore !== undefined) {
              totalScoreSum += sub.finalScore;
              gradedCount += 1;
            }
          } else if (sub.photo || sub.responseText) {
            completedAssignmentsCount += 1;
          }
        });

        const averageScore = gradedCount > 0 ? Math.round(totalScoreSum / gradedCount) : null;
        const totalAssigned = studentAssignments.length;
        const completionRate =
          totalAssigned > 0 ? Math.round((completedAssignmentsCount / totalAssigned) * 100) : 0;

        return {
          student,
          totalAssigned,
          completedAssignmentsCount,
          testsCompleted,
          averageScore,
          completionRate,
          lastActivityDate,
        };
      })
      .filter((item) => {
        const matchesSearch =
          gradebookSearch === '' ||
          item.student.name.toLowerCase().includes(gradebookSearch.toLowerCase()) ||
          item.student.username.toLowerCase().includes(gradebookSearch.toLowerCase());
        return matchesSearch;
      });
  }, [state.students, state.assignments, gradebookSearch]);

  // Overall Class Gradebook Metrics
  const gradebookMetrics = useMemo(() => {
    const scoredStudents = gradebookData.filter((g) => g.averageScore !== null);
    const overallAverage =
      scoredStudents.length > 0
        ? Math.round(
            scoredStudents.reduce((acc, s) => acc + (s.averageScore || 0), 0) / scoredStudents.length
          )
        : null;

    const highestScore = scoredStudents.length > 0
      ? Math.max(...scoredStudents.map((s) => s.averageScore || 0))
      : null;

    return {
      overallAverage,
      highestScore,
      totalStudents: state.students.length,
      activeStudents: gradebookData.filter((g) => g.completedAssignmentsCount > 0).length,
    };
  }, [gradebookData, state.students]);

  // Metrics Calculations
  const totalSubmissions = useMemo(() => {
    return state.assignments.reduce((acc, a) => {
      const subs = Object.values(a.submissions || {});
      return acc + subs.filter((s) => (a.type === 'test' ? s.percent !== undefined : s.photo || s.responseText)).length;
    }, 0);
  }, [state.assignments]);

  const teacherDisplayName = state.session?.name || 'Öğretmenim';

  return (
    <div className="space-y-6 animate-fade pb-20">
      {/* 1. Calm Workspace Header */}
      <header className="p-6 sm:p-7 rounded-2xl bg-[#090a0f] border border-zinc-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Öğretmen Yönetim Paneli</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Hoş Geldiniz, {teacherDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
            Ders materyallerinizi paylaşın, ödev ve testler yayınlayın, öğrenci not çizelgesini (Gradebook) anlık olarak takip edin.
          </p>
        </div>

        {/* Topbar Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setCreateModalPrefill(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ödev Oluştur</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Araçları</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            title="Oturumu Kapat"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* 2. Workspace Metrics Ribbon */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Kayıtlı Öğrenciler</div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.students.length}
            </div>
            <div className="text-[11px] text-zinc-400">Aktif Sınıf Mevcudu</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Assignments & Materials */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Yayındaki Materyal & Ödev</div>
            <div className="font-heading font-bold text-2xl text-white">
              {state.assignments.length}
            </div>
            <div className="text-[11px] text-zinc-400">
              {uploadedMaterialsList.length} Ders Notu / PDF
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Submissions */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Ödev Teslimleri</div>
            <div className="font-heading font-bold text-2xl text-white">
              {totalSubmissions}
            </div>
            <div className="text-[11px] text-zinc-400">Tamamlanan Teslimat</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Class Average */}
        <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-400">Sınıf Başarı Ortalaması</div>
            <div className="font-heading font-bold text-2xl text-white">
              {gradebookMetrics.overallAverage !== null ? `%${gradebookMetrics.overallAverage}` : '—'}
            </div>
            <div className="text-[11px] text-zinc-400">
              {gradebookMetrics.highestScore !== null ? `En Yüksek: %${gradebookMetrics.highestScore}` : 'Notlandırma Bekleniyor'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. Main LMS Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#090a0f] border border-zinc-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'assignments'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          )}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Materyaller & Ödevler ({state.assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gradebook')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'gradebook'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          )}
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Öğrenci Not Takip Tablosu (Gradebook)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'students'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          )}
        >
          <School className="w-4 h-4 text-emerald-400" />
          <span>Sınıflarım & Öğrenciler ({state.classrooms.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB 1: MATERYALLER & ÖDEVLER (ASSIGNMENTS & MATERIAL UPLOAD)           */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fade">
          {/* A. Materyal & PDF Yükleme Alanı (Direct Upload & Sharing Zone) */}
          <section className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-white">
                    Hızlı Materyal & PDF Yükleme Alanı
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Ders notu, PDF fasikülü veya ödev dokümanı yükleyin ve anında sınıfınızla paylaşın.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex text-[11px] font-mono text-zinc-500">
                PDF, Word, Görsel (Max 10MB)
              </span>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Materyal / Not Başlığı
                  </label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Örn: 10. Sınıf Biyoloji Hücre Bölünmeleri Fasikülü"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ünite / Kategori
                  </label>
                  <input
                    type="text"
                    value={materialFolder}
                    onChange={(e) => setMaterialFolder(e.target.value)}
                    placeholder="Örn: 2. Ünite: Kalıtım"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Hedef Sınıf / Şube
                  </label>
                  <select
                    value={materialClassId}
                    onChange={(e) => setMaterialClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="">Tüm Sınıflarım</option>
                    {state.classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white text-xs font-medium cursor-pointer transition-all">
                    <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{selectedFile ? selectedFile.name : 'Dosya Seç'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <input
                  type="text"
                  value={materialDesc}
                  onChange={(e) => setMaterialDesc(e.target.value)}
                  placeholder="Opsiyonel açıklama veya öğrencilere çalışma notu..."
                  className="w-full sm:flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isUploadingMaterial || !materialTitle.trim()}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Materyali Yayınla</span>
                </button>
              </div>
            </form>
          </section>

          {/* B. Yayınlanan Ödevler & İçerikler Listesi */}
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="p-4 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'all'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  Tümü ({state.assignments.length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('test')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'test'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  Testler ({state.assignments.filter((a) => a.type === 'test').length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('note')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'note'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  Ders Notları & PDF ({state.assignments.filter((a) => a.type === 'note').length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('book')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'book'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  Yazılı Ödevler ({state.assignments.filter((a) => a.type === 'book').length})
                </button>
              </div>

              {/* Target & Search */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ödev veya ünite ara..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                {state.students.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <select
                      value={studentFilter}
                      onChange={(e) => setStudentFilter(e.target.value)}
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
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

            {/* Assignments Grid */}
            {filteredAssignments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0c0d12] border border-dashed border-zinc-800 space-y-3">
                <FileText className="w-8 h-8 mx-auto text-zinc-600" />
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-heading font-semibold text-base text-white">
                    Yayınlanmış ödev veya materyal bulunamadı
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Öğrencileriniz için ders notları yükleyebilir, süreli testler veya yazılı ödev teslimleri oluşturabilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalPrefill(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Yeni Ödev Tanımla</span>
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
                      className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-4 group"
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
                            {isNote ? 'Ders Notu / PDF' : isTest ? 'İnteraktif Test' : 'Yazılı Ödev'}
                          </span>

                          <span className="text-zinc-500 text-xs">{timeAgo(a.createdAt)}</span>
                        </div>

                        {/* Title & Unit */}
                        <div>
                          <h3 className="font-heading font-semibold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {a.title}
                          </h3>
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <span>Ünite:</span>
                            <span className="text-zinc-300 font-medium">{a.folder}</span>
                            {a.classroomName && (
                              <span className="ml-1 text-indigo-400 font-medium">• {a.classroomName}</span>
                            )}
                          </div>
                        </div>

                        {/* File Attachment Pill */}
                        {a.fileName && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                            <FileText className="w-3 h-3 text-cyan-400" />
                            <span className="truncate max-w-[180px]">{a.fileName}</span>
                          </div>
                        )}

                        {/* Description */}
                        {a.desc && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {a.desc}
                          </p>
                        )}

                        {/* Completion Progress Bar */}
                        {!isNote && (
                          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span>Teslimat:</span>
                              <span className="font-semibold text-emerald-400">
                                {completedCount} / {targetStudents.length || 1} Öğrenci
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
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
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isNote && (
                            <button
                              type="button"
                              onClick={() => setViewingNote(a)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Notu Oku</span>
                            </button>
                          )}

                          {!isNote && (
                            <button
                              type="button"
                              onClick={() => setReviewAssignment(a)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border',
                                completedCount > 0
                                  ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                              )}
                            >
                              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Teslimleri İncele ({completedCount})</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(a.id, a.title)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 border border-zinc-800 hover:border-red-500/30 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 2: ÖĞRENCİ NOT TAKİP TABLOSU (GRADEBOOK & SUCCESS ANALYTICS)        */}
      {/* ========================================================================= */}
      {activeTab === 'gradebook' && (
        <div className="space-y-6 animate-fade">
          {/* Gradebook Header with Search */}
          <div className="p-5 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>Öğrenci Not Çizelgesi & Gelişim Takip Tablosu</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Tüm öğrencilerin test sonuçları, ödev tamamlama oranları ve genel başarı istatistikleri.
              </p>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gradebookSearch}
                onChange={(e) => setGradebookSearch(e.target.value)}
                placeholder="Öğrenci adı ile ara..."
                className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gradebook Table View */}
          {gradebookData.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0c0d12] border border-dashed border-zinc-800 space-y-2">
              <Users className="w-8 h-8 mx-auto text-zinc-600" />
              <h4 className="font-semibold text-white text-sm">Kayıtlı öğrenci bulunamadı</h4>
              <p className="text-xs text-zinc-400">
                Öğrenci ekleyerek veya sınıf katılım kodunu paylaşarak sınıf mevcudunu oluşturun.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 overflow-hidden space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-950/60">
                      <th className="p-3.5 rounded-l-xl">Öğrenci</th>
                      <th className="p-3.5">Kullanıcı Adı</th>
                      <th className="p-3.5">Ödev Teslimleri</th>
                      <th className="p-3.5">Tamamlama Oranı</th>
                      <th className="p-3.5">Genel Başarı</th>
                      <th className="p-3.5">Son Aktivite</th>
                      <th className="p-3.5 text-right rounded-r-xl">İşlem & Karne</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                    {gradebookData.map(({ student, totalAssigned, completedAssignmentsCount, averageScore, completionRate, lastActivityDate }) => {
                      return (
                        <tr key={student.id} className="hover:bg-zinc-950/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-sm shrink-0"
                                style={{ backgroundColor: student.color || '#6366f1' }}
                              >
                                {initials(student.name)}
                              </div>
                              <div className="font-semibold text-white">{student.name}</div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-zinc-400">
                            {student.username}
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-zinc-200">
                              {completedAssignmentsCount}
                            </span>
                            <span className="text-zinc-500 font-normal"> / {totalAssigned}</span>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-1 min-w-[90px]">
                              <div className="text-[11px] font-semibold text-zinc-300">
                                %{completionRate}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            {averageScore !== null ? (
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-md text-xs font-mono font-bold',
                                  averageScore >= 85
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : averageScore >= 70
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : averageScore >= 50
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                )}
                              >
                                %{averageScore}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-xs font-mono">—</span>
                            )}
                          </td>

                          <td className="p-3.5 text-zinc-400 text-[11px]">
                            {lastActivityDate ? timeAgo(lastActivityDate) : 'Henüz işlem yok'}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setReportStudent(student)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>Gelişim Raporu</span>
                            </button>
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

      {/* ========================================================================= */}
      {/* 6. TAB 3: SINIFLARIM & ÖĞRENCİLER (CLASSROOMS & ROSTER)                    */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade">
          {/* Classrooms Grid & Management */}
          <section className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-heading font-semibold text-base text-white">
                    Sınıf Şubeleri ({state.classrooms.length})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Öğrencileriniz 6 haneli katılım kodu ile doğrudan ilgili sınıfa üye olabilir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateClassModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Sınıf Aç</span>
              </button>
            </div>

            {state.classrooms.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 space-y-2">
                <School className="w-7 h-7 mx-auto text-zinc-600" />
                <h4 className="font-medium text-white text-xs">Henüz oluşturulmuş bir sınıf yok</h4>
                <p className="text-[11px] text-zinc-400">
                  Yeni bir sınıf şubesi açarak öğrencilerinize katılım kodunu iletebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.classrooms.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-semibold text-xs text-white truncate">{c.name}</h4>
                      {c.subject && <div className="text-[10px] text-zinc-400">{c.subject}</div>}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.joinCode, c.id)}
                          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedCodeId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{c.joinCode}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteClass(c.id, c.name)}
                      className="text-zinc-600 hover:text-red-400 text-xs transition-colors p-1 cursor-pointer"
                      title="Sınıfı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Student Roster Management */}
          <section className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-heading font-semibold text-base text-white">
                    Öğrenci Yönetim Listesi ({state.students.length})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Öğrencileri doğrudan sisteme ekleyebilir veya giriş şifrelerini görüntüleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Add Student Form */}
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Öğrenci Adı Soyadı (örn: Zeynep Çelik)"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newStudentPass}
                  onChange={(e) => setNewStudentPass(e.target.value)}
                  placeholder="Erişim Şifresi (örn: 1234)"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isAddingStudent || !newStudentName.trim() || !newStudentPass.trim()}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Öğrenci Ekle</span>
                </button>
              </div>
            </form>

            {/* Students List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-sm shrink-0"
                      style={{ backgroundColor: s.color || '#6366f1' }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-white truncate">{s.name}</h4>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>Kullanıcı: <b className="font-mono text-zinc-300">{s.username}</b></span>
                        {s.password && <span>• Şifre: <b className="font-mono text-zinc-300">{s.password}</b></span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(s)}
                    className="text-zinc-600 hover:text-red-400 text-xs transition-colors p-1 cursor-pointer"
                    title="Öğrenciyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. FLOATING AI COPILOT SLIDE-OVER DRAWER (TEACHER COPILOT)                */}
      {/* ========================================================================= */}
      <TeacherAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onToggle={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        onOpenCreateAssignmentModal={(prefill) => {
          setCreateModalPrefill(prefill);
          setIsCreateModalOpen(true);
        }}
      />

      {/* ========================================================================= */}
      {/* 8. MODALS & SUB-VIEWS                                                     */}
      {/* ========================================================================= */}
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

      {isCreateClassModalOpen && (
        <CreateClassroomModal
          isOpen={isCreateClassModalOpen}
          onClose={() => setIsCreateClassModalOpen(false)}
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
