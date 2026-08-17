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

    if (file.size > 5 * 1024 * 1024) {
      showToast('Dosya boyutu 5MB üzerinde olamaz.', 'warn');
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
      targetMode: targetMode,
      deadline: parsedDeadline,
      classroomId: selectedClassroomId || undefined,
      classroomName: selectedClass?.name || undefined,
      timeLimit: contentType === 'test' && timeLimitMinutes > 0 ? timeLimitMinutes * 60 : undefined,
      questions: contentType === 'test' ? questions.filter((q) => q.q.trim() && q.a.trim()) : undefined,
      fileName: contentType === 'note' ? noteFileName : null,
      fileData: contentType === 'note' ? noteFileData : null,
    });

    setIsSubmitting(false);

    if (isSuccess) {
      showToast('İçerik başarıyla yayınlandı!', 'success');
      onClose();
    }
  };

  const existingFolders = Array.from(new Set(state.assignments.map((a) => a.folder).filter(Boolean)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative shadow-2xl my-8 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
          <div>
            <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Yeni Ödev & Materyal Tanımla</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Öğrencileriniz veya sınıflarınız için ödev, test veya ders notu oluşturun.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              İçerik Türünü Seçin
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setContentType('note')}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  contentType === 'note'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                )}
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-xs">📄 Ders Notu / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('test')}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  contentType === 'test'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                )}
              >
                <ListCheck className="w-5 h-5 text-purple-600" />
                <span className="text-xs">📝 İnteraktif Test</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('book')}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  contentType === 'book'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                )}
              >
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">📚 Yazılı Ödev</span>
              </button>
            </div>
          </div>

          {/* Assignment Target Mode + Classroom + Deadline */}
          <div className="space-y-3.5">
            {/* Row 1: Classroom + Folder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  🏫 Hangi Sınıfa?
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  📁 Klasör / Ünite
                </label>
                <input
                  type="text"
                  list="modal-folder-list"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Örn: Ünite 1 veya Genel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                👥 Atama Hedefi
              </label>
              <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setTargetMode('all'); setTargetStudent('all'); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    targetMode === 'all'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>👥 Tüm Sınıfa Ata</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('individual')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    targetMode === 'individual'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                📅 Son Teslim Tarihi <span className="text-slate-400 normal-case font-normal">(isteğe bağlı)</span>
              </label>
              <input
                type="date"
                value={deadlineDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
              />
              {deadlineDate && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                  <span>⏰</span>
                  <span>Öğrenciler bu tarihe kadar teslim edebilecek.</span>
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ödev / İçerik Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                contentType === 'note'
                  ? 'Örn: Past Simple Tense Konu Anlatımı'
                  : contentType === 'test'
                  ? 'Örn: Present Perfect Alıştırma Testi'
                  : 'Örn: Soru Bankası Sayfa 42'
              }
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Description / Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
              className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none resize-none"
            />
          </div>

          {/* Note File Attachment */}
          {contentType === 'note' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Doküman / PDF Ekle (Opsiyonel)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all">
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
                  <span className="text-xs text-blue-700 font-semibold truncate max-w-xs bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    {noteFileName}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Test Specific Fields */}
          {contentType === 'test' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <ListCheck className="w-4 h-4 text-purple-600" />
                    <span>Test Soruları & Doğru Cevaplar</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Soruları ve doğru cevapları giriniz. Öğrenci testi çözerken bu cevaplar üzerinden değerlendirilir.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-slate-400" />
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
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
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        Soru {i + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionRow(i)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
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
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                    />

                    <input
                      type="text"
                      value={q.a}
                      onChange={(e) => handleQuestionChange(i, 'a', e.target.value)}
                      placeholder="Doğru cevabı yazınız..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestionRow}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yeni Soru Ekle</span>
              </button>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Yayınlanıyor...' : 'İçeriği Yayınla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
