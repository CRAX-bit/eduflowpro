'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, AssignmentType, Student, Question, Classroom, StudentLookupResult } from '@/types';
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
  ArrowLeft,
  Hourglass,
  IdCard,
  Loader2,
  ShieldCheck,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';
import { FeedbackModal } from './FeedbackModal';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { CreateClassroomModal } from './CreateClassroomModal';
import { AssignmentReviewModal } from './AssignmentReviewModal';

export type TeacherSection = 'home' | 'stats' | 'materials' | 'students';

interface TeacherViewProps {
  onOpenAiAssistant?: () => void;
  externalGeneratedQuiz?: any;
  externalGeneratedNote?: any;
  /** Hangi öğretmen sayfası gösterilecek. 'home' = ana masa (3 giriş kartı) */
  view?: TeacherSection;
}

const SECTION_META: Record<Exclude<TeacherSection, 'home'>, { title: string; desc: string }> = {
  stats: {
    title: 'Sınıf İstatistikleri',
    desc: 'Teslim oranları, sınıf başarı ortalaması ve genel performans metrikleri.',
  },
  materials: {
    title: 'Materyaller & Ödevler',
    desc: 'PDF/ders notu paylaşın, ödev ve testlerinizi yönetin.',
  },
  students: {
    title: 'Sınıflarım & Öğrenciler',
    desc: 'Sınıf şubelerinizi yönetin, öğrenci ekleyin ve not çizelgelerini açın.',
  },
};

export function TeacherView({
  onOpenAiAssistant,
  externalGeneratedQuiz,
  externalGeneratedNote,
  view = 'home',
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
    lookupStudentByNo,
    sendStudentRequest,
    cancelStudentRequest,
    teacherStudentRequests,
    loadStudentRequests,
    isLoadingRequests,
  } = useEduFlow();

  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Floating AI Drawer State

  // Assignment Filters
  const [typeFilter, setTypeFilter] = useState<'all' | AssignmentType>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Search
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Öğrenci Numarası ile Ekleme State
  const [studentNoInput, setStudentNoInput] = useState('');
  const [lookupResult, setLookupResult] = useState<StudentLookupResult | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

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

  // Numara ile öğrenci sorgula (isim maskeli döner)
  const handleLookupStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNo = studentNoInput.trim();
    if (!cleanNo) {
      showToast('Lütfen öğrenci numarasını giriniz.', 'warn');
      return;
    }
    setIsLookingUp(true);
    setLookupResult(null);
    const result = await lookupStudentByNo(cleanNo);
    setLookupResult(result);
    setIsLookingUp(false);
  };

  // Sorgulanan öğrenciye ekleme isteği gönder
  const handleSendStudentRequest = async () => {
    if (!lookupResult) return;
    setIsSendingRequest(true);
    const ok = await sendStudentRequest(studentNoInput.trim());
    setIsSendingRequest(false);
    if (ok) {
      setLookupResult(null);
      setStudentNoInput('');
    }
  };

  const handleCancelRequest = async (requestId: string, label: string) => {
    if (confirm(`${label} için gönderilen istek kaldırılsın mı?`)) {
      await cancelStudentRequest(requestId);
    }
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

  // Onay bekleyen / reddedilen istekler (kabul edilenler roster'da görünür)
  const pendingRequests = useMemo(
    () => teacherStudentRequests.filter((r) => r.status !== 'accepted'),
    [teacherStudentRequests]
  );

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
      });
  }, [state.students, state.assignments]);

  // Öğrenci id -> not çizelgesi satırı (öğrenci kartlarında kullanılır)
  const gradebookByStudentId = useMemo(() => {
    const map: Record<string, (typeof gradebookData)[number]> = {};
    gradebookData.forEach((row) => {
      map[row.student.id] = row;
    });
    return map;
  }, [gradebookData]);

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
      {/* 1. Calm Workspace Header (Deskio High-Contrast Style) */}
      <header className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          {view === 'home' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Deskio Öğretmen Masası</span>
            </div>
          ) : (
            <Link
              href="/teacher-dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-200 text-slate-800 hover:text-blue-800 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Öğretmen Masasına Dön</span>
            </Link>
          )}
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-950 tracking-tight">
            {view === 'home' ? `Hoş Geldiniz, ${teacherDisplayName}` : SECTION_META[view].title}
          </h1>
          <p className="text-sm text-slate-700 max-w-xl leading-relaxed font-medium">
            {view === 'home'
              ? 'Ders materyallerinizi paylaşın, ödev ve testler yayınlayın, öğrenci not çizelgesini (Gradebook) anlık olarak takip edin.'
              : SECTION_META[view].desc}
          </p>
        </div>

        {/* Topbar Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setCreateModalPrefill(null);
              setIsCreateModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-sm shadow-blue-600/25 transition-all cursor-pointer min-h-[44px] active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ödev Oluştur</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs min-h-[44px] active:scale-95"
            title="Oturumu Kapat"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* 2. Sınıf Başarı & Tamamlama Donut Modülü + Stat Kartları (İstatistikler Sayfası) */}
      {view === 'stats' && (
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sınıf Başarı Donut Kartı (5 Kolon) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h3 className="font-heading font-extrabold text-base text-slate-950">
                Sınıf Başarı & Teslim Analitiği
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Canlı Takip
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
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
                <span className="font-heading font-extrabold text-2xl text-slate-950 leading-none">
                  %{gradebookMetrics.completionPercent}
                </span>
                <span className="text-[10px] text-slate-700 font-bold mt-0.5">Teslimat</span>
              </div>
            </div>

            {/* Donut Legend & Stats */}
            <div className="space-y-2 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">İncelenen / Notlanan:</span>
                </div>
                <span className="font-extrabold text-slate-950">{gradebookMetrics.totalReviewed}</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-700 font-medium">Onay Bekleyen:</span>
                </div>
                <span className="font-extrabold text-amber-700">{gradebookMetrics.totalPendingReview}</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-slate-700 font-medium">Beklenen Toplam:</span>
                </div>
                <span className="font-bold text-slate-900">{gradebookMetrics.totalExpectedSubmissions}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Sınıf Başarı Ortalaması:</span>
            <span className="font-extrabold text-blue-700 text-sm">
              {gradebookMetrics.overallAverage !== null ? `%${gradebookMetrics.overallAverage}` : '—'}
            </span>
          </div>
        </div>

        {/* 4 Stat Kartı Grid (7 Kolon) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Metric 1: Students */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Kayıtlı Öğrenciler</div>
              <div className="font-heading font-extrabold text-3xl text-slate-950">
                {state.students.length}
              </div>
              <div className="text-xs text-blue-700 font-bold">{gradebookMetrics.activeStudents} Aktif Öğrenci</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Assignments & Materials */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-indigo-400 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Yayındaki Materyaller</div>
              <div className="font-heading font-extrabold text-3xl text-slate-950">
                {state.assignments.length}
              </div>
              <div className="text-xs text-indigo-700 font-bold">
                {uploadedMaterialsList.length} Ders Notu / PDF
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: Submissions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-emerald-400 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ödev Teslimleri</div>
              <div className="font-heading font-extrabold text-3xl text-slate-950">
                {totalSubmissions}
              </div>
              <div className="text-xs text-emerald-700 font-bold">Tamamlanan Teslimat</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4: Class Average */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">En Yüksek Skor</div>
              <div className="font-heading font-extrabold text-3xl text-slate-950">
                {gradebookMetrics.highestScore !== null ? `%${gradebookMetrics.highestScore}` : '—'}
              </div>
              <div className="text-xs text-amber-700 font-bold">
                {gradebookMetrics.overallAverage !== null ? `Ortalama: %${gradebookMetrics.overallAverage}` : 'Henüz notlanmadı'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 3. Ana Masa Giriş Kartları (3 Sayfa) */}
      {view === 'home' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kart 1: İstatistikler */}
          <Link
            href="/teacher-dashboard/istatistikler"
            className="group p-6 rounded-2xl bg-white border border-slate-300 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col gap-4 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-lg text-slate-950">İstatistikler</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                Teslim oranı, sınıf başarı ortalaması ve performans metrikleri.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Teslimat: <b className="text-blue-700">%{gradebookMetrics.completionPercent}</b></span>
              <span className="text-slate-700">
                Ortalama:{' '}
                <b className="text-blue-700">
                  {gradebookMetrics.overallAverage !== null ? `%${gradebookMetrics.overallAverage}` : '—'}
                </b>
              </span>
            </div>
          </Link>

          {/* Kart 2: Öğrenci Ekle / Görüntüle */}
          <Link
            href="/teacher-dashboard/ogrenciler"
            className="group p-6 rounded-2xl bg-white border border-slate-300 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col gap-4 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-lg text-slate-950">Öğrenci Ekle / Görüntüle</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                Sınıf şubeleri, öğrenci kaydı ve her öğrencinin not çizelgesi.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Öğrenci: <b className="text-emerald-700">{state.students.length}</b></span>
              <span className="text-slate-700">Sınıf: <b className="text-emerald-700">{state.classrooms.length}</b></span>
            </div>
          </Link>

          {/* Kart 3: Materyaller */}
          <Link
            href="/teacher-dashboard/materyaller"
            className="group p-6 rounded-2xl bg-white border border-slate-300 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col gap-4 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-lg text-slate-950">Materyaller</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                PDF & ders notu paylaşımı, ödev ve test yönetimi.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Ödev/Test: <b className="text-indigo-700">{state.assignments.length}</b></span>
              <span className="text-slate-700">Not/PDF: <b className="text-indigo-700">{uploadedMaterialsList.length}</b></span>
            </div>
          </Link>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 1: MATERYALLER & ÖDEVLER (ASSIGNMENTS & MATERIAL UPLOAD)           */}
      {/* ========================================================================= */}
      {view === 'materials' && (
        <div className="space-y-6 animate-fade">
          {/* A. Materyal & PDF Yükleme Alanı (Direct Upload & Sharing Zone) */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-950">
                    Ders Materyali & PDF Paylaşım Masası
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Öğrencileriniz için PDF çalışma kâğıtları, ders notları veya formül özetlerini doğrudan paylaşın.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Materyal Başlığı
                  </label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Örn: 10. Sınıf Biyoloji Özet PDF"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Klasör / Ünite
                  </label>
                  <input
                    type="text"
                    value={materialFolder}
                    onChange={(e) => setMaterialFolder(e.target.value)}
                    placeholder="Örn: Hücre Bölünmeleri"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Hedef Sınıf
                  </label>
                  <select
                    value={materialClassId}
                    onChange={(e) => setMaterialClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium focus:outline-none transition-all"
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
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Açıklama / Öğretmen Notu
                </label>
                <textarea
                  rows={2}
                  value={materialDesc}
                  onChange={(e) => setMaterialDesc(e.target.value)}
                  placeholder="Materyalle ilgili dikkat edilmesi gereken noktaları veya yönergeleri yazabilirsiniz..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Drag & Drop File Select Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/80 hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2"
              >
                <FileUp className="w-7 h-7 text-blue-600" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    {selectedFile ? (
                      <span className="text-blue-700 font-extrabold">✓ Seçilen Dosya: {selectedFile.name}</span>
                    ) : (
                      <>
                        PDF veya Belge Seçmek İçin <span className="text-blue-600 underline">Tıklayın</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-700 font-medium">
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
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
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-300 shadow-sm">
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    typeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  )}
                >
                  Tüm İçerikler ({state.assignments.length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('note')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    typeFilter === 'note'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  )}
                >
                  Ders Notları & PDF ({state.assignments.filter((a) => a.type === 'note').length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('test')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    typeFilter === 'test'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  )}
                >
                  İnteraktif Testler ({state.assignments.filter((a) => a.type === 'test').length})
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter('book')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    typeFilter === 'book'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  )}
                >
                  Yazılı Ödevler ({state.assignments.filter((a) => a.type === 'book').length})
                </button>
              </div>

              {/* Target & Search */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ödev veya ünite ara..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs font-medium placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                {state.students.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={studentFilter}
                      onChange={(e) => setStudentFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs font-bold focus:outline-none"
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

            {/* Assignments Grid (Deskio High Contrast Cards) */}
            {filteredAssignments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 shadow-sm space-y-3">
                <FileText className="w-8 h-8 mx-auto text-slate-500" />
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-950">
                    Yayınlanmış ödev veya materyal bulunamadı
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    Öğrencileriniz için ders notları yükleyebilir, süreli testler veya yazılı ödev teslimleri oluşturabilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalPrefill(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
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
                      className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 group shadow-sm"
                    >
                      <div className="space-y-3">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-md text-xs font-bold',
                              isNote
                                ? 'bg-sky-50 text-sky-800 border border-sky-300'
                                : isTest
                                ? 'bg-purple-50 text-purple-800 border border-purple-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            )}
                          >
                            {isNote ? 'Ders Notu / PDF' : isTest ? 'İnteraktif Test' : 'Yazılı Ödev'}
                          </span>

                          <span className="text-slate-600 font-semibold text-xs">{timeAgo(a.createdAt)}</span>
                        </div>

                        {/* Title & Unit */}
                        <div>
                          <h3 className="font-heading font-extrabold text-lg text-slate-950 group-hover:text-blue-700 transition-colors line-clamp-1">
                            {a.title}
                          </h3>
                          <div className="text-xs text-slate-700 font-semibold flex items-center gap-1 mt-0.5">
                            <span>Ünite:</span>
                            <span className="text-slate-950 font-bold">{a.folder}</span>
                            {a.classroomName && (
                              <span className="ml-1 text-blue-700 font-bold">• {a.classroomName}</span>
                            )}
                          </div>
                        </div>

                        {/* File Attachment Pill */}
                        {a.fileName && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
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
                          <p className="text-xs sm:text-[13px] text-slate-800 font-medium line-clamp-2 leading-relaxed">
                            {a.desc}
                          </p>
                        )}

                        {/* Completion Progress Bar */}
                        {!isNote && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                              <span>Teslimat:</span>
                              <span className="font-extrabold text-emerald-700">
                                {completedCount} / {targetStudents.length || 1} Öğrenci
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full transition-all"
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
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isNote && (
                            <button
                              type="button"
                              onClick={() => setViewingNote(a)}
                              className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
                                'px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border',
                                completedCount > 0
                                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
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
                          className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-500 hover:text-red-700 transition-all cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 3: SINIFLARIM & ÖĞRENCİLER (CLASSROOMS & ROSTER)                    */}
      {/* ========================================================================= */}
      {view === 'students' && (
        <div className="space-y-6 animate-fade">
          {/* Classrooms Grid & Management */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-950">
                    Sınıf Şubeleri ({state.classrooms.length})
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Öğrencileriniz 6 haneli katılım kodu ile doğrudan ilgili sınıfa üye olabilir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateClassModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Sınıf Aç</span>
              </button>
            </div>

            {state.classrooms.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                <School className="w-7 h-7 mx-auto text-slate-500" />
                <h4 className="font-bold text-slate-950 text-xs sm:text-sm">Henüz oluşturulmuş bir sınıf yok</h4>
                <p className="text-xs text-slate-700 font-medium">
                  Yeni bir sınıf şubesi açarak öğrencilerinize katılım kodunu iletebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.classrooms.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-slate-950 truncate">{c.name}</h4>
                      {c.subject && <div className="text-xs text-slate-700 font-semibold">{c.subject}</div>}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.joinCode, c.id)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-xs font-mono text-emerald-800 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedCodeId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{c.joinCode}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteClass(c.id, c.name)}
                      className="text-slate-500 hover:text-red-700 text-xs transition-colors p-1.5 cursor-pointer"
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
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-950">
                    Öğrenci Yönetim Listesi ({state.students.length})
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Her öğrencinin yanındaki <b className="text-slate-900">Not Çizelgesi</b> butonu ile doğrudan o öğrencinin gelişim raporuna gidebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Öğrenci adı ile ara..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs font-bold placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Öğrenci Numarası ile Ekleme */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
              <div className="flex items-start gap-2">
                <IdCard className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Her öğrenci hesabına kayıt sırasında <b className="text-slate-950">6 haneli bir öğrenci numarası</b> verilir.
                  Numarayı girip sorgulayın; gizlilik gereği isim maskeli görünür. Öğrenci isteği onayladığında tüm bilgileri açılır.
                </p>
              </div>

              <form onSubmit={handleLookupStudent} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-9">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={studentNoInput}
                    onChange={(e) => {
                      setStudentNoInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 8));
                      setLookupResult(null);
                    }}
                    placeholder="Öğrenci Numarası (örn: 482913)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-slate-950 text-sm font-mono font-bold tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-500 placeholder:font-medium focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={isLookingUp || !studentNoInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs min-h-[44px] active:scale-95"
                  >
                    {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Sorgula</span>
                  </button>
                </div>
              </form>

              {/* Maskeli Öğrenci Önizleme Kartı */}
              {lookupResult && (
                <div className="p-4 rounded-xl bg-white border border-blue-300 shadow-xs space-y-3 animate-fade">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-heading font-extrabold text-sm shrink-0">
                      {lookupResult.maskedName.charAt(0)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-heading font-extrabold text-base text-slate-950 tracking-wide">
                        {lookupResult.maskedName}
                      </h4>
                      <div className="text-xs text-slate-700 font-semibold flex flex-wrap items-center gap-x-2">
                        <span>No: <b className="font-mono text-slate-950">{studentNoInput}</b></span>
                        {lookupResult.gradeLevel && <span>• Hedef: <b className="text-slate-950">{lookupResult.gradeLevel}</b></span>}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Gizlilik için ad-soyad maskelenmiştir. Öğrenci isteği kabul ettiğinde tam ad, e-posta ve tüm gelişim verileri görünür olur.
                  </p>

                  {lookupResult.requestStatus === 'accepted' ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Bu öğrenci zaten listenizde.</span>
                    </div>
                  ) : lookupResult.requestStatus === 'pending' ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      <Hourglass className="w-4 h-4" />
                      <span>İstek gönderildi, öğrencinin onayı bekleniyor.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleSendStudentRequest}
                        disabled={isSendingRequest}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs min-h-[44px] active:scale-95"
                      >
                        {isSendingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        <span>{lookupResult.requestStatus === 'rejected' ? 'Tekrar İstek Gönder' : 'Ekleme İsteği Gönder'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLookupResult(null);
                          setStudentNoInput('');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] active:scale-95"
                      >
                        Vazgeç
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Onay Bekleyen İstekler */}
            {pendingRequests.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-amber-600" />
                    <h4 className="font-heading font-extrabold text-sm text-slate-950">
                      Onay Bekleyen İstekler ({pendingRequests.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadStudentRequests()}
                    disabled={isLoadingRequests}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    title="Listeyi yenile"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', isLoadingRequests && 'animate-spin')} />
                    <span className="hidden sm:inline">Yenile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {pendingRequests.map((r) => (
                    <div
                      key={r.requestId}
                      className="p-3 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-950 tracking-wide truncate">{r.displayName}</div>
                        <div className="text-xs text-slate-700 font-semibold">
                          No: <b className="font-mono text-slate-950">{r.studentNo}</b>
                        </div>
                        <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                          {r.status === 'rejected' ? 'Reddedildi' : 'Onay bekleniyor'} · {timeAgo(r.createdAt)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(r.requestId, r.displayName)}
                        className="text-slate-500 hover:text-red-700 transition-colors p-1.5 cursor-pointer shrink-0"
                        title="İsteği kaldır"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Students List + Öğrenci Bazlı Not Çizelgesi */}
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                <Users className="w-7 h-7 mx-auto text-slate-500" />
                <h4 className="font-bold text-slate-950 text-xs sm:text-sm">
                  {state.students.length === 0 ? 'Henüz kayıtlı öğrenci yok' : 'Aramanızla eşleşen öğrenci bulunamadı'}
                </h4>
                <p className="text-xs text-slate-700 font-medium">
                  Yukarıdan öğrenci numarası ile istek gönderebilir veya sınıf katılım kodunu paylaşabilirsiniz.
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((s) => {
                const row = gradebookByStudentId[s.id];
                const completionRate = row?.completionRate ?? 0;
                const averageScore = row?.averageScore ?? null;
                const completedCount = row?.completedAssignmentsCount ?? 0;
                const totalAssigned = row?.totalAssigned ?? 0;
                const lastActivityDate = row?.lastActivityDate ?? null;

                return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 flex flex-col gap-3 shadow-2xs hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-heading font-extrabold text-xs text-white shadow-xs shrink-0"
                        style={{ backgroundColor: s.color || '#2563eb' }}
                      >
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-950 truncate">{s.name}</h4>
                        <div className="text-xs text-slate-700 font-semibold flex flex-wrap items-center gap-x-2 mt-0.5">
                          {s.studentNo ? (
                            <span>No: <b className="font-mono text-slate-950 font-bold">{s.studentNo}</b></span>
                          ) : (
                            <span>Kullanıcı: <b className="font-mono text-slate-950 font-bold">{s.username}</b></span>
                          )}
                          {s.gradeLevel && <span className="truncate">• {s.gradeLevel}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(s)}
                      className="text-slate-500 hover:text-red-700 text-xs transition-colors p-1.5 cursor-pointer shrink-0"
                      title="Öğrenciyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Öğrenci Not Çizelgesi Özeti */}
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">
                        Teslim: <b className="text-slate-950">{completedCount}</b>
                        <span className="text-slate-600"> / {totalAssigned}</span>
                      </span>
                      {averageScore !== null ? (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md font-mono font-extrabold border',
                            averageScore >= 85
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : averageScore >= 70
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : averageScore >= 50
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          )}
                        >
                          %{averageScore}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">Not yok</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Tamamlama</span>
                        <span>%{completionRate}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 font-semibold">
                      Son aktivite: {lastActivityDate ? timeAgo(lastActivityDate) : 'Henüz işlem yok'}
                    </div>

                    <button
                      type="button"
                      onClick={() => setReportStudent(s)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-900 hover:text-blue-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] active:scale-95"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Not Çizelgesi & Gelişim Raporu</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
