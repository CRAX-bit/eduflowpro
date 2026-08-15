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

    if (file.size > 2 * 1024 * 1024) {
      showToast('Dosya boyutu 2MB üzerinde olamaz.', 'warn');
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
        showToast('Test için en az 1 adet soru ve doğru cevap ekleyin.', 'warn');
        return;
      }
    }

    setIsSubmitting(true);

    const selectedClass = state.classrooms.find((c) => c.id === selectedClassroomId);

    const success = createAssignment({
      type: contentType,
      title: title.trim(),
      folder: folder.trim() || 'Genel',
      target: targetStudent,
      classroomId: selectedClassroomId || undefined,
      classroomName: selectedClass ? selectedClass.name : undefined,
      desc: desc.trim(),
      fileName: noteFileName,
      fileData: noteFileData,
      timeLimit: timeLimitMinutes * 60,
      questions: questions.filter((q) => q.q.trim() && q.a.trim()),
    });

    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const existingFolders = Array.from(new Set(state.assignments.map((a) => a.folder)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-assignment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0D131F] border border-slate-800 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(0,0,0,0.7)] max-h-[90vh] overflow-y-auto"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Yeni Materyal & Ödev
            </div>
            <h2 id="create-assignment-title" className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              İçerik Oluştur ve Yayınla
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              İçerik Türünü Seçin
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setContentType('note')}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  contentType === 'note'
                    ? 'bg-indigo-500/15 border-indigo-400 text-indigo-300 font-bold shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                )}
              >
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="text-xs">📄 Ders Notu</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('test')}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  contentType === 'test'
                    ? 'bg-purple-500/15 border-purple-400 text-purple-300 font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                )}
              >
                <ListCheck className="w-5 h-5 text-purple-400" />
                <span className="text-xs">📝 İnteraktif Test</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('book')}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  contentType === 'book'
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                )}
              >
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">📚 Kitap Ödevi</span>
              </button>
            </div>
          </div>

          {/* Classroom Selection & Target & Folder Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                🏫 Hangi Sınıfa?
              </label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                👤 Hedef Öğrenci
              </label>
              <select
                value={targetStudent}
                onChange={(e) => setTargetStudent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value="all">👥 Sınıftaki Herkese</option>
                {state.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    👤 Yalnızca: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                📁 Klasör / Ünite
              </label>
              <input
                type="text"
                list="modal-folder-list"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Örn: Ünite 1 veya Genel"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
              />
              <datalist id="modal-folder-list">
                {existingFolders.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
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
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Description / Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {contentType === 'note'
                ? 'Ders Notu Metni / Açıklaması'
                : contentType === 'test'
                ? 'Test Yönergesi (İsteğe Bağlı)'
                : 'Ödev Talimatı & Sayfa Bilgisi'}
            </label>
            <textarea
              rows={contentType === 'note' ? 4 : 3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={
                contentType === 'note'
                  ? 'Ders notlarını, formülleri veya açıklamaları buraya yazabilirsiniz...'
                  : contentType === 'test'
                  ? 'Örn: Boşlukları uygun zaman kalıplarıyla doldurunuz.'
                  : 'Örn: Kitabın 42. sayfasındaki tüm kelime sorularını çözüp sayfanın fotoğrafını yükleyin.'
              }
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Note Specific: File Attachment */}
          {contentType === 'note' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Ek Dosya (PDF veya Görsel - İsteğe Bağlı)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="modal-note-file"
                  accept=".pdf,image/*"
                  onChange={handleNoteFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="modal-note-file"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-400 bg-slate-900/50 text-xs text-slate-300 hover:text-white cursor-pointer transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-indigo-400" />
                  <span>
                    {noteFileName ? `Seçildi: ${noteFileName}` : 'PDF veya Görsel Yükle (Maks 10MB)'}
                  </span>
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
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Test Specific: Timer and Questions */}
          {contentType === 'test' && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Süre Sınırı (Dakika · 0 = Limitsiz)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Timer className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={timeLimitMinutes || ''}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      placeholder="Örn: 5 dakika (boş bırakılırsa 0 = limitsiz)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-purple-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {timeLimitMinutes > 0 ? `${timeLimitMinutes} Dakika` : 'Limitsiz Süre'}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sorular ve Doğru Cevaplar ({questions.length})
                  </label>
                  <button
                    type="button"
                    onClick={addQuestionRow}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Soru Ekle</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Soru {idx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestionRow(idx)}
                            className="text-slate-500 hover:text-red-400 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={q.q}
                        onChange={(e) => handleQuestionChange(idx, 'q', e.target.value)}
                        placeholder="Soru metni (örn: 'I ___ never visited London.')"
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-purple-400 rounded-lg text-white text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={q.a}
                        onChange={(e) => handleQuestionChange(idx, 'a', e.target.value)}
                        placeholder="Beklenen doğru cevap (örn: have)"
                        className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 focus:border-purple-400 rounded-lg text-purple-300 text-xs focus:outline-none placeholder:text-purple-500/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer',
                contentType === 'note'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 shadow-indigo-500/20 hover:shadow-indigo-500/40'
                  : contentType === 'test'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-slate-950 shadow-purple-500/20 hover:shadow-purple-500/40'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/40'
              )}
            >
              <Send className="w-4 h-4" />
              <span>İçeriği Yayınla</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
