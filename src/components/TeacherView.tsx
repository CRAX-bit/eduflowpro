'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, AssignmentType, Student, Question } from '@/types';
import { initials, timeAgo } from '@/lib/utils';
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
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';
import { FeedbackModal } from './FeedbackModal';
import { NoteModal } from './NoteModal';
import { PhotoModal } from './PhotoModal';

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
    createAssignment,
    logout,
    showToast,
    getStudentById,
  } = useEduFlow();

  const contentFormRef = React.useRef<HTMLDivElement>(null);

  const scrollToContentForm = () => {
    contentFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');

  // Content form state
  const [contentType, setContentType] = useState<AssignmentType>('note');
  const [targetStudent, setTargetStudent] = useState('all');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [desc, setDesc] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([
    { q: '', a: '' },
    { q: '', a: '' },
  ]);
  const [noteFileName, setNoteFileName] = useState<string | null>(null);
  const [noteFileData, setNoteFileData] = useState<string | null>(null);

  // Monitor filter state
  const [monitorFilter, setMonitorFilter] = useState('all');

  // Modals state
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
      setContentType('test');
      setTitle(externalGeneratedQuiz.title || '');
      setFolder(externalGeneratedQuiz.folder || '');
      setDesc(externalGeneratedQuiz.desc || '');
      setTimeLimitMinutes(Math.round((externalGeneratedQuiz.timeLimit || 120) / 60));
      if (externalGeneratedQuiz.questions?.length) {
        setQuestions(externalGeneratedQuiz.questions);
      }
    }
  }, [externalGeneratedQuiz]);

  // React to external AI generated note
  React.useEffect(() => {
    if (externalGeneratedNote) {
      setContentType('note');
      setTitle(externalGeneratedNote.title || '');
      setFolder(externalGeneratedNote.folder || '');
      setDesc(externalGeneratedNote.content || '');
    }
  }, [externalGeneratedNote]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (addStudent(newStudentName, newStudentPass)) {
      setNewStudentName('');
      setNewStudentPass('');
    }
  };

  const handleQuestionChange = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addQuestionRow = () => {
    setQuestions([...questions, { q: '', a: '' }]);
  };

  const removeQuestionRow = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleNoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNoteFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setNoteFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (state.students.length === 0) {
      showToast('Lütfen önce en az bir öğrenci ekleyin.', 'warn');
      return;
    }

    if (contentType === 'test') {
      const validQuestions = questions.filter((q) => q.q.trim() && q.a.trim());
      if (validQuestions.length === 0) {
        showToast('Test için en az 1 adet soru ve cevap ekleyin.', 'warn');
        return;
      }
    }

    const success = createAssignment({
      type: contentType,
      title,
      folder: folder || 'Genel',
      target: targetStudent,
      desc,
      fileName: noteFileName,
      fileData: noteFileData,
      timeLimit: timeLimitMinutes * 60,
      questions: questions.filter((q) => q.q.trim() && q.a.trim()),
    });

    if (success) {
      setTitle('');
      setFolder('');
      setDesc('');
      setTimeLimitMinutes(0);
      setNoteFileName(null);
      setNoteFileData(null);
      setQuestions([
        { q: '', a: '' },
        { q: '', a: '' },
      ]);
    }
  };

  const existingFolders = Array.from(new Set(state.assignments.map((a) => a.folder)));

  return (
    <div className="space-y-8 animate-fade pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0d1424] to-[#0a0f1d] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <span>👨‍🏫 Öğretmen Hesabı</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Hoş Geldiniz, <span className="text-emerald-400">{state.session?.name || 'Öğretmenim'}</span> 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Öğrencilerinizi yönetin, ödev atayın, canlı izleme tablosundan anında geri bildirim verin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Gemini AI</span>
            </button>
          )}

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

      {/* Sınıf Yönetimi (Student Management Card) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.06)] relative">
        <h3 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2.5">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Sınıf Yönetimi & Öğrenci Hesapları</span>
        </h3>

        {/* Add Student Row */}
        <form onSubmit={handleAddStudent} className="flex flex-wrap gap-2.5 mb-6">
          <input
            type="text"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Öğrenci adı (örn: Ali Vural)"
            className="flex-1 min-w-[200px] px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <input
            type="text"
            value={newStudentPass}
            onChange={(e) => setNewStudentPass(e.target.value)}
            placeholder="Şifre / erişim kodu (örn: ali123)"
            className="w-48 px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Öğrenci Ekle</span>
          </button>
        </form>

        {/* Student Chips Grid / Empty State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.students.length === 0 ? (
            <div className="col-span-full py-10 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Henüz Öğrenci Eklenmedi</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Yukarıdaki forma öğrenci adı ve şifresini yazarak sınıfınıza öğrenci ekleyebilir ve ödev atayabilirsiniz.
              </p>
            </div>
          ) : (
            state.students.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm text-white shrink-0 shadow-md"
                    style={{ backgroundColor: s.color }}
                  >
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-white truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Kullanıcı: <b className="text-cyan-400">{s.username}</b> · Şifre:{' '}
                      <b className="text-slate-300">{s.password}</b>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setReportStudent(s)}
                    title="Gelişim Karnesi Gör"
                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`${s.name} ve tüm ödev kayıtları silinecek. Emin misiniz?`)) {
                        deleteStudent(s.id);
                      }
                    }}
                    title="Öğrenciyi Sil"
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Main 2-Column Split: Content Creator & Live Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Assignment Creator */}
        <section
          ref={contentFormRef}
          className="lg:col-span-5 p-6 rounded-3xl bg-white/[0.02] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.04)] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Yeni İçerik & Ödev Ekle</span>
            </h3>

            {onOpenAiAssistant && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI ile Üret</span>
              </button>
            )}
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Content Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                İçerik Türü
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setContentType('note')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    contentType === 'note'
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-semibold'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Ders Notu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentType('test')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    contentType === 'test'
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-semibold'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <ListCheck className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">İnteraktif Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentType('book')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    contentType === 'book'
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-semibold'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Kitap Ödevi</span>
                </button>
              </div>
            </div>

            {/* Target Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Kime Atanacak?
              </label>
              <select
                value={targetStudent}
                onChange={(e) => setTargetStudent(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value="all">Tüm Sınıfa (Genel)</option>
                {state.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    Yalnızca: {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Başlık
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Past Simple Tense Konu Anlatımı"
                required
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Folder / Unit */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Klasör / Ünite Adı
              </label>
              <input
                type="text"
                list="folder-list"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Örn: Past Simple Tense veya Genel"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
              />
              <datalist id="folder-list">
                {existingFolders.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>

            {/* Note Fields */}
            {contentType === 'note' && (
              <div className="space-y-3 pt-1 animate-fade">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Ders Notu Metni / Açıklama
                  </label>
                  <textarea
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Ders notlarını, formülleri veya açıklamaları buraya yazabilirsiniz..."
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Ek Dosya (PDF veya Görsel - İsteğe Bağlı)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="note-file"
                      accept=".pdf,image/*"
                      onChange={handleNoteFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="note-file"
                      className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/20 hover:border-emerald-400/50 bg-white/[0.02] text-xs text-slate-300 hover:text-white cursor-pointer transition-all"
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>{noteFileName ? `Seçildi: ${noteFileName}` : 'PDF veya Görsel Yükle (Maks 10MB)'}</span>
                    </label>
                    {noteFileName && (
                      <button
                        type="button"
                        onClick={() => {
                          setNoteFileName(null);
                          setNoteFileData(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Test Fields */}
            {contentType === 'test' && (
              <div className="space-y-3 pt-1 animate-fade">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Süre Sınırı (Dakika - 0 = Süresiz)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={timeLimitMinutes || ''}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    placeholder="Örn: 5 dakika (boş bırakılırsa 0 = limitsiz)"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Test Açıklaması / Yönerge
                  </label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Örn: Boşlukları uygun kalıplarla doldurunuz."
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Sorular & Doğru Cevaplar ({questions.length})
                    </label>
                    <button
                      type="button"
                      onClick={addQuestionRow}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <span>+ Soru Ekle</span>
                    </button>
                  </div>

                  {questions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 relative">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Soru {idx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestionRow(idx)}
                            className="text-slate-500 hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={q.q}
                        onChange={(e) => handleQuestionChange(idx, 'q', e.target.value)}
                        placeholder="Soru metni (örn: 'I ___ happy yesterday.')"
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-lg text-white text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={q.a}
                        onChange={(e) => handleQuestionChange(idx, 'a', e.target.value)}
                        placeholder="Beklenen doğru cevap (örn: was)"
                        className="w-full px-3 py-2 bg-emerald-500/5 border border-emerald-500/30 focus:border-emerald-400 rounded-lg text-emerald-300 text-xs focus:outline-none placeholder:text-emerald-500/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Assignment Fields */}
            {contentType === 'book' && (
              <div className="space-y-3 pt-1 animate-fade">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Ödev Yönergesi / Sayfa Bilgisi
                  </label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Örn: İngilizce soru bankası sayfa 48'deki tüm alıştırmaları çözüp sayfanın net fotoğrafını yükleyin."
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              <span>İçeriği Yayınla & Öğrencilere İlet</span>
            </button>
          </form>
        </section>

        {/* Column 2: Live Monitor & Tracking Table */}
        <section className="lg:col-span-7 p-6 rounded-3xl bg-white/[0.02] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Canlı İzleme & Teslim Tablosu</span>
            </h3>

            {/* Filter by Student */}
            {state.students.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={monitorFilter}
                  onChange={(e) => setMonitorFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#0a0f1d] border border-white/10 focus:border-emerald-400 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="all">Tüm Öğrenciler</option>
                  {state.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Assignments / Monitor Table or Empty State */}
          {state.assignments.length === 0 ? (
            <div className="py-12 px-6 text-center rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-950/10 space-y-4 animate-fade">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-heading font-bold text-base text-white">
                  Henüz aktif bir ödev veya sınıf oluşturmadınız.
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Öğrencilerinize ders notu paylaşmak, süreli testler atamak veya kitap ödevi vermek için içerik oluşturucuyu kullanabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={scrollToContentForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ İlk Ödevinizi Oluşturun</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400 font-semibold">
                    <th className="p-3">Ödev / Başlık</th>
                    <th className="p-3">Hedef</th>
                    <th className="p-3">Tür</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Sonuç / İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  {state.assignments
                    .filter((a) => monitorFilter === 'all' || a.target === 'all' || a.target === monitorFilter)
                    .map((a) => {
                      const targetLabel =
                        a.target === 'all' ? 'Tüm Sınıf' : getStudentById(a.target)?.name || '—';

                      // Details for all view vs specific student
                      if (monitorFilter === 'all') {
                        const targetStudents =
                          a.target === 'all'
                            ? state.students
                            : state.students.filter((s) => s.id === a.target);

                        let doneCount = 0;
                        let averageText = '—';

                        if (a.type === 'test') {
                          const testSubs = targetStudents
                            .map((s) => a.submissions?.[s.id])
                            .filter(Boolean);
                          doneCount = testSubs.length;
                          const avg = testSubs.length
                            ? Math.round(
                                testSubs.reduce((acc, sub) => acc + (sub.percent || 0), 0) /
                                  testSubs.length
                              )
                            : 0;
                          averageText = testSubs.length ? `%${avg} ort.` : 'Sonuç yok';
                        } else if (a.type === 'book') {
                          const bookSubs = targetStudents
                            .map((s) => a.submissions?.[s.id])
                            .filter((sub) => sub?.photo);
                          doneCount = bookSubs.length;
                          averageText = `${doneCount} teslim`;
                        } else {
                          averageText = a.fileData || a.fileName ? 'Dosya Notu' : 'Metin Notu';
                        }

                        return (
                          <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-white">{a.title}</div>
                              <div className="text-[10px] text-slate-500">{timeAgo(a.createdAt)}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-medium">
                                {targetLabel}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  a.type === 'note'
                                    ? 'bg-cyan-500/15 text-cyan-300'
                                    : a.type === 'test'
                                    ? 'bg-purple-500/15 text-purple-300'
                                    : 'bg-amber-500/15 text-amber-300'
                                }`}
                              >
                                {a.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                {a.type === 'note' ? 'Yayında' : `${doneCount}/${targetStudents.length || 1}`}
                              </span>
                            </td>
                            <td className="p-3">
                              {a.type === 'note' ? (
                                <button
                                  onClick={() => setViewingNote(a)}
                                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Görüntüle</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[11px]">{averageText}</span>
                              )}
                            </td>
                          </tr>
                        );
                      } else {
                        // Filtered to specific student
                        const sub = a.submissions?.[monitorFilter];
                        const studentObj = getStudentById(monitorFilter);

                        let statusBadge = (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                            Bekliyor
                          </span>
                        );
                        let resultCell: React.ReactNode = <span className="text-slate-500">—</span>;

                        if (a.type === 'note') {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px]">
                              Yayında
                            </span>
                          );
                          resultCell = (
                            <button
                              onClick={() => setViewingNote(a)}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Görüntüle</span>
                            </button>
                          );
                        } else if (a.type === 'test') {
                          if (sub) {
                            statusBadge = (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                Tamamlandı
                              </span>
                            );
                            resultCell = (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold ${
                                    sub.percent! >= 70
                                      ? 'text-emerald-400'
                                      : sub.percent! >= 40
                                      ? 'text-amber-400'
                                      : 'text-red-400'
                                  }`}
                                >
                                  %{sub.percent} ({sub.correct}/{sub.total})
                                </span>
                                {studentObj && (
                                  <button
                                    onClick={() =>
                                      setFeedbackItem({
                                        assignment: a,
                                        student: studentObj,
                                      })
                                    }
                                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 ${
                                      sub.feedback
                                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    <MessageSquareQuote className="w-3 h-3 text-purple-400" />
                                    <span>{sub.feedback ? 'Yorumu Düzenle' : '+ Yorum'}</span>
                                  </button>
                                )}
                              </div>
                            );
                          }
                        } else if (a.type === 'book') {
                          if (sub?.photo) {
                            statusBadge = (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                Teslim Edildi
                              </span>
                            );
                            resultCell = (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setViewingPhoto({
                                      url: sub.photo!,
                                      title: a.title,
                                      studentName: studentObj?.name,
                                    })
                                  }
                                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                                >
                                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Fotoğrafı Gör</span>
                                </button>
                                {studentObj && (
                                  <button
                                    onClick={() =>
                                      setFeedbackItem({
                                        assignment: a,
                                        student: studentObj,
                                      })
                                    }
                                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 ${
                                      sub.feedback
                                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    <MessageSquareQuote className="w-3 h-3 text-purple-400" />
                                    <span>{sub.feedback ? 'Yorumu Düzenle' : '+ Yorum'}</span>
                                  </button>
                                )}
                              </div>
                            );
                          }
                        }

                        return (
                          <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-white">{a.title}</div>
                              <div className="text-[10px] text-slate-500">{a.folder}</div>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] text-slate-400">{targetLabel}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] font-semibold uppercase">{a.type}</span>
                            </td>
                            <td className="p-3">{statusBadge}</td>
                            <td className="p-3">{resultCell}</td>
                          </tr>
                        );
                      }
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
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
