'use client';

import React, { useState, useEffect } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { AssignmentType, Question } from '@/types';
import {
  X,
  FileText,
  ListCheck,
  BookOpen,
  PlusCircle,
  Trash2,
  UploadCloud,
  Send,
  Sparkles,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: AssignmentType;
  prefillData?: {
    type?: AssignmentType;
    title?: string;
    folder?: string;
    desc?: string;
    timeLimit?: number;
    questions?: Question[];
  } | null;
}

export function CreateAssignmentModal({
  isOpen,
  onClose,
  initialType = 'note',
  prefillData,
}: CreateAssignmentModalProps) {
  const { state, createAssignment, showToast } = useEduFlow();

  const [contentType, setContentType] = useState<AssignmentType>(initialType);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [targetMode, setTargetMode] = useState<'all' | 'individual'>('all');
  const [targetStudent, setTargetStudent] = useState('all');
  const [deadlineDate, setDeadlineDate] = useState<string>(''); // 'YYYY-MM-DD'
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (prefillData) {
        if (prefillData.type) setContentType(prefillData.type);
        setTitle(prefillData.title || '');
        setFolder(prefillData.folder || '');
        setDesc(prefillData.desc || '');
        setTimeLimitMinutes(prefillData.timeLimit ? Math.round(prefillData.timeLimit / 60) : 0);
        if (prefillData.questions && prefillData.questions.length > 0) {
          setQuestions(prefillData.questions);
        }
      } else {
        setContentType(initialType);
        setSelectedClassroomId(state.classrooms.length > 0 ? state.classrooms[0].id : '');
        setTargetMode('all');
        setTargetStudent('all');
        setDeadlineDate('');
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
    }
  }, [isOpen, prefillData, initialType, state.classrooms]);

  if (!isOpen) return null;

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

    if (file.size > 10 * 1024 * 1024) {
      showToast('Dosya boyutu 10MB üzerinde olamaz.', 'warn');
      return;
    }

    setNoteFileName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEv) => {
      setNoteFileData(loadEv.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Lütfen başlık giriniz.', 'warn');
      return;
    }

    if (contentType === 'test') {
      const validQuestions = questions.filter((q) => q.q.trim() && q.a.trim());
      if (validQuestions.length === 0) {
        showToast('Lütfen en az bir geçerli soru ve doğru cevap giriniz.', 'warn');
        return;
      }
    }

    setIsSubmitting(true);

    const selectedClass = state.classrooms.find((c) => c.id === selectedClassroomId);
    const finalTarget = targetMode === 'individual' ? targetStudent : 'all';
    const parsedDeadline = deadlineDate ? new Date(`${deadlineDate}T23:59:59`).getTime() : undefined;

    const isSuccess = createAssignment({
      type: contentType,
      title: title.trim(),
      folder: folder.trim() || 'Genel',
      desc: desc.trim(),
      target: finalTarget,
      classroomId: selectedClass?.id,
      classroomName: selectedClass?.name,
      deadline: parsedDeadline,
      timeLimit: timeLimitMinutes > 0 ? timeLimitMinutes * 60 : undefined,
      questions: contentType === 'test' ? questions.filter((q) => q.q.trim() && q.a.trim()) : undefined,
      fileName: noteFileName,
      fileData: noteFileData,
    });

    setIsSubmitting(false);

    if (isSuccess) {
      showToast('Ödev başarıyla oluşturuldu!', 'success');
      onClose();
    } else {
      showToast('Ödev oluşturulurken bir sorun oluştu.', 'error');
    }
  };

  const existingFolders = Array.from(new Set(state.assignments.map((a) => a.folder))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
      <div className="bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <span className="text-xs font-bold font-mono uppercase text-blue-700">
              Deskio Öğretmen Masası
            </span>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-950">
              Yeni Ödev / İçerik Tanımla
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 touch-scroll">
          {/* Content Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              İçerik Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setContentType('note')}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5',
                  contentType === 'note'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-extrabold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">Ders Notu / PDF</div>
                  <div className="text-[10px] text-slate-600 font-medium hidden sm:block">Bilgi & Materyal Paylaşımı</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setContentType('test')}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5',
                  contentType === 'test'
                    ? 'bg-purple-50 border-purple-300 text-purple-800 font-extrabold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                <ListCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">İnteraktif Test</div>
                  <div className="text-[10px] text-slate-600 font-medium hidden sm:block">Çoktan Seçmeli Sınav</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setContentType('book')}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5',
                  contentType === 'book'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">Yazılı Ödev</div>
                  <div className="text-[10px] text-slate-600 font-medium hidden sm:block">Belge & Fotoğraf Teslimi</div>
                </div>
              </button>
            </div>
          </div>

          {/* Assignment Target Mode + Classroom + Deadline */}
          <div className="space-y-3.5">
            {/* Row 1: Classroom + Folder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  🏫 Hangi Sınıfa?
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs font-bold focus:outline-none"
                >
                  <option value="">🌐 Tüm Sınıflar</option>
                  {state.classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏫 {c.name} ({c.joinCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  📁 Klasör / Ünite
                </label>
                <input
                  type="text"
                  list="modal-folder-list"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Örn: Ünite 1 veya Genel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium placeholder:text-slate-500 focus:outline-none"
                />
                <datalist id="modal-folder-list">
                  {existingFolders.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Row 2: Target Mode Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                👥 Atama Hedefi
              </label>
              <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setTargetMode('all'); setTargetStudent('all'); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    targetMode === 'all'
                      ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  <span>👥 Tüm Sınıfa Ata</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('individual')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    targetMode === 'individual'
                      ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  <span>👤 Bireysel Öğrenci Seç</span>
                </button>
              </div>

              {/* Individual student selector */}
              {targetMode === 'individual' && (
                <div className="mt-2 animate-fade">
                  <select
                    value={targetStudent}
                    onChange={(e) => setTargetStudent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">-- Öğrenci seçin --</option>
                    {state.students.map((s) => (
                      <option key={s.id} value={s.id}>
                        👤 {s.name} ({s.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Row 3: Deadline Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                📅 Son Teslim Tarihi <span className="text-slate-600 normal-case font-medium">(isteğe bağlı)</span>
              </label>
              <input
                type="date"
                value={deadlineDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none"
              />
              {deadlineDate && (
                <p className="text-xs text-amber-800 mt-1 flex items-center gap-1 font-bold">
                  <span>⏰</span>
                  <span>Öğrenciler bu tarihe kadar teslim edebilecek.</span>
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Ödev / İçerik Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                contentType === 'note'
                  ? 'Örn: Fotosentez ve Hücresel Solunum Özeti'
                  : contentType === 'test'
                  ? 'Örn: Fonksiyonlar ve Parabol Tarama Testi'
                  : 'Örn: Soru Bankası Sayfa 42'
              }
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Description / Content */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              {contentType === 'note'
                ? 'Ders Notu Metni / Açıklaması'
                : contentType === 'test'
                ? 'Test Açıklaması & Yönergeler'
                : 'Ödev Yönergesi'}
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={
                contentType === 'note'
                  ? 'Konu anlatım özetini buraya yazabilir veya aşağıdan dosya ekleyebilirsiniz...'
                  : 'Öğrencinin dikkat etmesi gereken kurallar...'
              }
              className="w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Note File Attachment */}
          {contentType === 'note' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Doküman / PDF Ekle (Opsiyonel)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>{noteFileName ? 'Dosyayı Değiştir' : 'PDF / Dosya Seç'}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleNoteFileChange}
                    className="hidden"
                  />
                </label>
                {noteFileName && (
                  <span className="text-xs text-blue-800 font-extrabold truncate max-w-xs bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    {noteFileName}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Test Specific Fields */}
          {contentType === 'test' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-950 flex items-center gap-2">
                    <ListCheck className="w-4 h-4 text-purple-600" />
                    <span>Test Soruları & Doğru Cevaplar</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium">
                    Soruları ve doğru cevapları giriniz. Öğrenci testi çözerken bu cevaplar üzerinden değerlendirilir.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-950 font-bold text-xs focus:outline-none"
                  >
                    <option value={0}>Süre Sınırı Yok</option>
                    <option value={5}>5 Dakika</option>
                    <option value={10}>10 Dakika</option>
                    <option value={15}>15 Dakika</option>
                    <option value={30}>30 Dakika</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-950 font-mono">
                        Soru {i + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionRow(i)}
                          className="text-slate-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={q.q}
                      onChange={(e) => handleQuestionChange(i, 'q', e.target.value)}
                      placeholder="Soru metnini yazınız..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
                    />

                    <input
                      type="text"
                      value={q.a}
                      onChange={(e) => handleQuestionChange(i, 'a', e.target.value)}
                      placeholder="Doğru cevabı yazınız..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-emerald-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestionRow}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-800 hover:text-blue-700 hover:border-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yeni Soru Satırı Ekle</span>
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[48px] active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>İçeriği & Ödevi Yayınla</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
