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
  PieChart,
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
      setCopiedCodeId(null);
    }, 2500);
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

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('Dosya boyutu en fazla 10 MB olabilir.', 'warn');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileData(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (!materialTitle.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setMaterialTitle(nameWithoutExt);
    }
  };

  // Handle Quick Material Upload Submit
  const handleUploadMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      showToast('Lütfen bir materyal başlığı yazınız.', 'warn');
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const targetClass = state.classrooms.find((c) => c.id === materialClassId);
      const created = createAssignment({
        type: 'note',
        title: materialTitle.trim(),
        folder: materialFolder.trim() || 'Genel Materyal',
        desc: materialDesc.trim(),
        target: materialTarget,
        classroomId: targetClass?.id,
        classroomName: targetClass?.name,
        fileName: selectedFile?.name || null,
        fileData: selectedFileData || null,
      });

      if (created) {
        setMaterialTitle('');
        setMaterialFolder('');
        setMaterialDesc('');
        setMaterialClassId('');
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

  // Filtered assignments list
  const filteredAssignments = useMemo(() => {
    return state.assignments.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (studentFilter !== 'all' && a.target !== 'all' && a.target !== studentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.folder.toLowerCase().includes(q) ||
          (a.desc && a.desc.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [state.assignments, typeFilter, studentFilter, searchQuery]);

  // Filtered students for roster
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return state.students;
    const q = studentSearchQuery.toLowerCase();
    return state.students.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q)
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

  // Overall Class Gradebook Metrics & Donut Chart Data
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

    // Assignment Completion Stats across the class
    const totalExpectedSubmissions = state.students.length * Math.max(1, state.assignments.length);
    let totalCompleted = 0;
    let totalReviewed = 0;
    let totalPendingReview = 0;

    state.assignments.forEach((a) => {
      Object.values(a.submissions || {}).forEach((sub) => {
        if (a.type === 'test' && sub.percent !== undefined) {
          totalCompleted += 1;
          totalReviewed += 1;
        } else if (sub.status === 'reviewed') {
          totalCompleted += 1;
          totalReviewed += 1;
        } else if (sub.photo || sub.responseText) {
          totalCompleted += 1;
          totalPendingReview += 1;
        }
      });
    });

    const completionPercent =
      totalExpectedSubmissions > 0
        ? Math.min(100, Math.round((totalCompleted / totalExpectedSubmissions) * 100))
        : 0;

    return {
      overallAverage,
      highestScore,
      totalStudents: state.students.length,
      activeStudents: gradebookData.filter((g) => g.completedAssignmentsCount > 0).length,
      totalExpectedSubmissions,
      totalCompleted,
      totalReviewed,
      totalPendingReview,
      completionPercent,
    };
  }, [gradebookData, state.students, state.assignments]);

  // Metrics Calculations
  const totalSubmissions = useMemo(() => {
    return state.assignments.reduce((acc, a) => {
      const subs = Object.values(a.submissions || {});
      return acc + subs.filter((s) => (a.type === 'test' ? s.percent !== undefined : s.photo || s.responseText)).length;
    }, 0);
  }, [state.assignments]);

  const teacherDisplayName = state.session?.name || 'Öğretmenim';

  // SVG Donut Calculation Helpers
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const completedStroke = (gradebookMetrics.completionPercent / 100) * donutCircumference;

  return (
    <div className="space-y-6 animate-fade pb-20">
      {/* 1. Calm Workspace Header (Clean EdTech Light Theme) */}
      <header className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Öğretmen Yönetim Paneli</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">
            Hoş Geldiniz, {teacherDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ödev Oluştur</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Araçları</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Oturumu Kapat"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* 2. Sınıf Başarı & Tamamlama Donut Modülü + Stat Kartları */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sınıf Başarı Donut Kartı (5 Kolon) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h3 className="font-heading font-bold text-sm text-slate-800">
                Sınıf Başarı & Teslim Analitiği
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Canlı Takip
            </span>
          </div>

          <div className="flex items-center justify-around gap-4 py-1">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
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
                {/* Completion Segment */}
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
                <span className="font-heading font-extrabold text-xl text-slate-800 leading-none">
                  %{gradebookMetrics.completionPercent}
                </span>
                <span className="text-[9px] text-slate-500 font-medium mt-0.5">Teslimat</span>
              </div>
            </div>

            {/* Donut Legend & Stats */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-500">İncelenen / Notlanan:</span>
                <span className="font-bold text-slate-800">{gradebookMetrics.totalReviewed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-500">Onay Bekleyen:</span>
                <span className="font-bold text-amber-600">{gradebookMetrics.totalPendingReview}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
                <span className="text-slate-500">Beklenen Toplam:</span>
                <span className="font-semibold text-slate-700">{gradebookMetrics.totalExpectedSubmissions}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sınıf Başarı Ortalaması:</span>
            <span className="font-bold text-blue-600">
              {gradebookMetrics.overallAverage !== null ? `%${gradebookMetrics.overallAverage}` : '—'}
            </span>
          </div>
        </div>

        {/* 4 Stat Kartı Grid (7 Kolon) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Metric 1: Students */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">Kayıtlı Öğrenciler</div>
              <div className="font-heading font-bold text-2xl text-slate-800">
                {state.students.length}
              </div>
              <div className="text-[11px] text-blue-600 font-medium">{gradebookMetrics.activeStudents} Aktif Öğrenci</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Assignments & Materials */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">Yayındaki Materyaller</div>
              <div className="font-heading font-bold text-2xl text-slate-800">
                {state.assignments.length}
              </div>
              <div className="text-[11px] text-indigo-600 font-medium">
                {uploadedMaterialsList.length} Ders Notu / PDF
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: Submissions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">Ödev Teslimleri</div>
              <div className="font-heading font-bold text-2xl text-slate-800">
                {totalSubmissions}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">Tamamlanan Teslimat</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4: Class Average */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between hover:border-amber-300 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">En Yüksek Başarı Skoru</div>
              <div className="font-heading font-bold text-2xl text-slate-800">
                {gradebookMetrics.highestScore !== null ? `%${gradebookMetrics.highestScore}` : '—'}
              </div>
              <div className="text-[11px] text-amber-600 font-medium">
                {gradebookMetrics.overallAverage !== null ? `Ortalama: %${gradebookMetrics.overallAverage}` : 'Henüz notlanmadı'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main LMS Navigation Tabs (Clean EdTech Light Style) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Materyaller & Ödevler ({state.assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gradebook')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'gradebook'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Öğrenci Not Takip Tablosu (Gradebook)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <School className="w-4 h-4" />
          <span>Sınıflarım & Öğrenciler ({state.classrooms.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB 1: MATERYALLER & ÖDEVLER (ASSIGNMENTS & MATERIAL UPLOAD)           */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fade">
          {/* A. Materyal & PDF Yükleme Alanı (Direct Upload & Sharing Zone) */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-heading font-semibold text-base text-slate-800">
                    Ders Materyali & PDF Paylaşım Alanı
                  </h3>
                  <p className="text-xs text-slate-500">
                    Öğrencileriniz için PDF çalışma kâğıtları, ders notları veya formül özetlerini doğrudan paylaşın.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Materyal Başlığı
                  </label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Örn: 10. Sınıf Biyoloji Özet PDF"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Klasör / Ünite
                  </label>
                  <input
                    type="text"
                    value={materialFolder}
                    onChange={(e) => setMaterialFolder(e.target.value)}
                    placeholder="Örn: Hücre Bölünmeleri"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hedef Sınıf
                  </label>
                  <select
                    value={materialClassId}
                    onChange={(e) => setMaterialClassId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none transition-all"
                  >
                    <option value="">🌐 Tüm Sınıflar & Öğrenciler</option>
                    {state.classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.joinCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Açıklama / Öğretmen Notu
                </label>
                <textarea
                  rows={2}
                  value={materialDesc}
                  onChange={(e) => setMaterialDesc(e.target.value)}
                  placeholder="Materyalle ilgili dikkat edilmesi gereken noktaları veya yönergeleri yazabilirsiniz..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Drag & Drop File Select Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2"
              >
                <FileUp className="w-7 h-7 text-blue-600" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedFile ? (
                      <span className="text-blue-600 font-bold">✓ Seçilen Dosya: {selectedFile.name}</span>
                    ) : (
                      <>
                        PDF veya Belge Seçmek İçin <span className="text-blue-600 underline">Tıklayın</span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    PDF, DOCX, PNG veya JPG formatları (Maks 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUploadingMaterial || !materialTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Materyali Yayınla</span>
                </button>
              </div>
            </form>
          </section>

          {/* B. Yayınlanmış Materyal ve Ödevler Listesi */}
          <div className="space-y-4">
            {/* Toolbar Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  Tüm İçerikler ({state.assignments.length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('note')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'note'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  Ders Notları & PDF ({state.assignments.filter((a) => a.type === 'note').length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('test')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'test'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  İnteraktif Testler ({state.assignments.filter((a) => a.type === 'test').length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('book')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    typeFilter === 'book'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  Yazılı Ödevler ({state.assignments.filter((a) => a.type === 'book').length})
                </button>
              </div>

              {/* Target & Search */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ödev veya ünite ara..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {state.students.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={studentFilter}
                      onChange={(e) => setStudentFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
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

            {/* Assignments Grid (Clean EdTech Light Cards) */}
            {filteredAssignments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200 shadow-sm space-y-3">
                <FileText className="w-8 h-8 mx-auto text-slate-400" />
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-heading font-semibold text-base text-slate-800">
                    Yayınlanmış ödev veya materyal bulunamadı
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Öğrencileriniz için ders notları yükleyebilir, süreli testler veya yazılı ödev teslimleri oluşturabilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalPrefill(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
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
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 group shadow-sm"
                    >
                      <div className="space-y-3">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-md text-[11px] font-semibold',
                              isNote
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : isTest
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            )}
                          >
                            {isNote ? 'Ders Notu / PDF' : isTest ? 'İnteraktif Test' : 'Yazılı Ödev'}
                          </span>

                          <span className="text-slate-400 text-xs">{timeAgo(a.createdAt)}</span>
                        </div>

                        {/* Title & Unit */}
                        <div>
                          <h3 className="font-heading font-semibold text-base text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {a.title}
                          </h3>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>Ünite:</span>
                            <span className="text-slate-700 font-medium">{a.folder}</span>
                            {a.classroomName && (
                              <span className="ml-1 text-blue-600 font-medium">• {a.classroomName}</span>
                            )}
                          </div>
                        </div>

                        {/* File Attachment Pill */}
                        {a.fileName && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span className="truncate max-w-[180px]">{a.fileName}</span>
                          </div>
                        )}

                        {/* Deadline Badge */}
                        {a.deadline && (() => {
                          const now = Date.now();
                          const isOverdue = now > a.deadline;
                          const daysLeft = Math.ceil((a.deadline - now) / (1000 * 60 * 60 * 24));
                          return (
                            <div className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border',
                              isOverdue
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : daysLeft <= 2
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            )}>
                              <Clock className="w-3 h-3" />
                              <span>
                                {isOverdue
                                  ? 'Son tarih geçti'
                                  : daysLeft === 0
                                  ? 'Bugün son!'
                                  : daysLeft === 1
                                  ? 'Yarın son!'
                                  : `Son: ${new Date(a.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`}
                              </span>
                            </div>
                          );
                        })()}

                        {/* Description */}
                        {a.desc && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {a.desc}
                          </p>
                        )}

                        {/* Completion Progress Bar */}
                        {!isNote && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Teslimat:</span>
                              <span className="font-semibold text-emerald-600">
                                {completedCount} / {targetStudents.length || 1} Öğrenci
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
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
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isNote && (
                            <button
                              type="button"
                              onClick={() => setViewingNote(a)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
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
                                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              )}
                            >
                              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>Teslimleri İncele ({completedCount})</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(a.id, a.title)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
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
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Öğrenci Not Çizelgesi & Gelişim Takip Tablosu</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tüm öğrencilerin test sonuçları, ödev tamamlama oranları ve genel başarı istatistikleri.
              </p>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gradebookSearch}
                onChange={(e) => setGradebookSearch(e.target.value)}
                placeholder="Öğrenci adı ile ara..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Gradebook Table View (Clean EdTech Light Table) */}
          {gradebookData.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200 shadow-sm space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-400" />
              <h4 className="font-semibold text-slate-800 text-sm">Kayıtlı öğrenci bulunamadı</h4>
              <p className="text-xs text-slate-500">
                Öğrenci ekleyerek veya sınıf katılım kodunu paylaşarak sınıf mevcudunu oluşturun.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                      <th className="p-3.5 rounded-l-xl">Öğrenci</th>
                      <th className="p-3.5">Kullanıcı Adı</th>
                      <th className="p-3.5">Ödev Teslimleri</th>
                      <th className="p-3.5">Tamamlama Oranı</th>
                      <th className="p-3.5">Genel Başarı</th>
                      <th className="p-3.5">Son Aktivite</th>
                      <th className="p-3.5 text-right rounded-r-xl">İşlem & Karne</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {gradebookData.map(({ student, totalAssigned, completedAssignmentsCount, averageScore, completionRate, lastActivityDate }) => {
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-xs shrink-0"
                                style={{ backgroundColor: student.color || '#2563eb' }}
                              >
                                {initials(student.name)}
                              </div>
                              <div className="font-semibold text-slate-800">{student.name}</div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-slate-500">
                            {student.username}
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800">
                              {completedAssignmentsCount}
                            </span>
                            <span className="text-slate-400 font-normal"> / {totalAssigned}</span>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-1 min-w-[90px]">
                              <div className="text-[11px] font-semibold text-slate-700">
                                %{completionRate}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
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
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : averageScore >= 70
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : averageScore >= 50
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                )}
                              >
                                %{averageScore}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs font-mono">—</span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {lastActivityDate ? timeAgo(lastActivityDate) : 'Henüz işlem yok'}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setReportStudent(student)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
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
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-heading font-semibold text-base text-slate-800">
                    Sınıf Şubeleri ({state.classrooms.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Öğrencileriniz 6 haneli katılım kodu ile doğrudan ilgili sınıfa üye olabilir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateClassModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Sınıf Aç</span>
              </button>
            </div>

            {state.classrooms.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <School className="w-7 h-7 mx-auto text-slate-400" />
                <h4 className="font-medium text-slate-800 text-xs">Henüz oluşturulmuş bir sınıf yok</h4>
                <p className="text-[11px] text-slate-500">
                  Yeni bir sınıf şubesi açarak öğrencilerinize katılım kodunu iletebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.classrooms.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-semibold text-xs text-slate-800 truncate">{c.name}</h4>
                      {c.subject && <div className="text-[10px] text-slate-500">{c.subject}</div>}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.joinCode, c.id)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedCodeId === c.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          <span>{c.joinCode}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteClass(c.id, c.name)}
                      className="text-slate-400 hover:text-red-600 text-xs transition-colors p-1 cursor-pointer"
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
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-heading font-semibold text-base text-slate-800">
                    Öğrenci Yönetim Listesi ({state.students.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Öğrencileri doğrudan sisteme ekleyebilir veya giriş şifrelerini görüntüleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Add Student Form */}
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Öğrenci Adı Soyadı (örn: Zeynep Çelik)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newStudentPass}
                  onChange={(e) => setNewStudentPass(e.target.value)}
                  placeholder="Erişim Şifresi (örn: 1234)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isAddingStudent || !newStudentName.trim() || !newStudentPass.trim()}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
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
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: s.color || '#2563eb' }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-800 truncate">{s.name}</h4>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Kullanıcı: <b className="font-mono text-slate-700">{s.username}</b></span>
                        {s.password && <span>• Şifre: <b className="font-mono text-slate-700">{s.password}</b></span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(s)}
                    className="text-slate-400 hover:text-red-600 text-xs transition-colors p-1 cursor-pointer"
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
