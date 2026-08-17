'use client';

import React, { useState, useRef } from 'react';
import { Assignment } from '@/types';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  FileText,
  CheckCircle2,
  Award,
  BookOpen,
  Camera,
  RotateCcw,
  School,
  TrendingUp,
  AlertCircle,
  MessageSquareQuote,
  Check,
  UploadCloud,
  FileUp,
  FileCode,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface AssignmentSubmitModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName?: string, fileType?: string) {
  const name = (fileName || '').toLowerCase();
  const type = (fileType || '').toLowerCase();
  if (type.includes('pdf') || name.endsWith('.pdf')) {
    return <FileText className="w-6 h-6 text-rose-500 shrink-0" />;
  }
  if (type.startsWith('image') || name.match(/\.(png|jpe?g|webp|gif)$/)) {
    return <Camera className="w-6 h-6 text-blue-500 shrink-0" />;
  }
  if (name.match(/\.(doc|docx)$/)) {
    return <FileText className="w-6 h-6 text-blue-600 shrink-0" />;
  }
  return <FileUp className="w-6 h-6 text-blue-500 shrink-0" />;
}

export function AssignmentSubmitModal({
  assignment,
  isOpen,
  onClose,
}: AssignmentSubmitModalProps) {
  const { state, submitAssignmentResponse, uploadAssignmentFile, showToast } = useEduFlow();
  const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || '';

  const [responseText, setResponseText] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !assignment) return null;

  const currentSubmission = assignment.submissions?.[studentId];
  const isSubmitted = !!currentSubmission;
  const isReviewed = currentSubmission?.status === 'reviewed';
  const isPending = isSubmitted && !isReviewed;

  // Deadline helpers
  const now = Date.now();
  const deadline = assignment.deadline;
  const isOverdue = deadline ? now > deadline : false;
  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const daysLeft = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null;

  const validateAndSetFile = (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('Dosya boyutu en fazla 10 MB olabilir.', 'warn');
      return;
    }

    const acceptedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'doc'];

    if (!acceptedTypes.includes(file.type) && (!fileExt || !validExtensions.includes(fileExt))) {
      showToast('Desteklenen dosya formatları: PDF, PNG, JPG, DOCX', 'warn');
      return;
    }

    setSelectedFile(file);
    showToast(`${file.name} seçildi.`, 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() && !selectedFile) {
      showToast('Lütfen bir ödev yanıtı yazın veya dosya yükleyin.', 'warn');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Ödev iletiliyor...');

    try {
      let fileAttachment: { fileUrl: string; fileName: string; fileType: string; fileSize: number } | undefined = undefined;

      if (selectedFile) {
        setUploadStatus('Dosya Supabase depolama alanına yükleniyor...');
        const uploadResult = await uploadAssignmentFile(assignment.id, selectedFile);
        if (uploadResult && uploadResult.success && uploadResult.fileAttachment) {
          fileAttachment = uploadResult.fileAttachment;
        } else {
          showToast('Dosya yüklenirken sorun oluştu ancak ödev metni iletiliyor.', 'warn');
        }
      }

      setUploadStatus('Ödev durumu güncelleniyor...');
      const res = await submitAssignmentResponse(
        assignment.id,
        responseText.trim(),
        fileAttachment,
        undefined,
        studentNote.trim() || undefined
      );

      if (res && res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('Ödeviniz başarıyla teslim edildi! 🚀', 'success');
        onClose();
      } else {
        showToast('Ödev iletilemedi. Lütfen tekrar deneyiniz.', 'error');
      }
    } catch (err) {
      showToast('İşlem sırasında bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadStatus(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl relative shadow-2xl my-8 transition-all flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {assignment.folder || 'Genel'}
              </span>
              {assignment.type === 'book' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  📚 Yazılı Ödev
                </span>
              )}
              {assignment.classroomName && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  🏫 {assignment.classroomName}
                </span>
              )}
              {deadlineLabel && (
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                    isOverdue
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : daysLeft !== null && daysLeft <= 2
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}
                >
                  📅 Son Teslim: {deadlineLabel}
                  {daysLeft !== null && !isOverdue && (
                    <span className="ml-1 font-bold">({daysLeft === 0 ? 'Bugün son gün' : `${daysLeft} gün kaldı`})</span>
                  )}
                  {isOverdue && <span className="ml-1 font-bold">(Süresi Geçti)</span>}
                </span>
              )}
            </div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
              {assignment.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Assignment Description */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Ödev Yönergesi & Açıklaması</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {assignment.desc || 'Bu ödev için özel bir yönerge bulunmuyor. Yanıtınızı aşağıdaki metin veya dosya alanından iletebilirsiniz.'}
            </p>
          </div>

          {/* If already submitted: Display Evaluation Card */}
          {isSubmitted && (
            <div className="space-y-4">
              {isReviewed ? (
                /* Approved Review Card */
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                        {currentSubmission.finalScore !== undefined
                          ? currentSubmission.finalScore
                          : currentSubmission.aiScore || 85}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          Öğretmen Değerlendirmesi
                        </div>
                        <div className="text-xs text-emerald-700">100 Üzerinden Nihai Not</div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Değerlendirildi</span>
                    </span>
                  </div>

                  {/* Teacher Feedback Note */}
                  {currentSubmission.feedback && (
                    <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        <span>Öğretmeninin Geri Bildirimi:</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {currentSubmission.feedback}
                      </p>
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  {((currentSubmission.aiStrengths && currentSubmission.aiStrengths.length > 0) ||
                    (currentSubmission.aiImprovements && currentSubmission.aiImprovements.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {currentSubmission.aiStrengths && currentSubmission.aiStrengths.length > 0 && (
                        <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs space-y-1.5">
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Güçlü Yönlerin:</span>
                          </span>
                          <ul className="space-y-1 text-slate-700 list-disc list-inside">
                            {currentSubmission.aiStrengths.map((str, idx) => (
                              <li key={idx} className="leading-snug">
                                {str}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentSubmission.aiImprovements && currentSubmission.aiImprovements.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                          <span className="font-bold text-amber-700 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Geliştirme Tavsiyesi:</span>
                          </span>
                          <ul className="space-y-1 text-amber-900 list-disc list-inside">
                            {currentSubmission.aiImprovements.map((imp, idx) => (
                              <li key={idx} className="leading-snug">
                                {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Pending Review Card */
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-amber-950 text-sm">
                          Ödeviniz Başarıyla Teslim Edildi
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          Öğretmeninizin inceleme paneline iletildi.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold">
                      ⏳ Değerlendirme Bekleniyor
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed pt-1">
                    Öğretmeniniz ödevinizi inceleyip onayladığında nihai notunuz ve yapıcı geri bildiriminiz bu ekranda görüntülenecektir.
                  </p>
                </div>
              )}

              {/* Student's Sent Response */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700">Teslim Ettiğiniz Yanıt & Ekler:</span>
                {currentSubmission.responseText && (
                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {currentSubmission.responseText}
                  </p>
                )}

                {/* Uploaded File View */}
                {currentSubmission.fileUrl && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(currentSubmission.fileName, currentSubmission.fileType)}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {currentSubmission.fileName || 'Yüklenen Ek Dosya'}
                        </div>
                        {currentSubmission.fileSize && (
                          <div className="text-[11px] text-slate-500">
                            {formatFileSize(currentSubmission.fileSize)}
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={currentSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Görüntüle / İndir</span>
                    </a>
                  </div>
                )}

                {/* Legacy Photo fallback */}
                {!currentSubmission.fileUrl && currentSubmission.photo && (
                  <div className="pt-2">
                    <img
                      src={currentSubmission.photo}
                      alt="Ödev görseli"
                      className="max-h-48 rounded-xl border border-slate-200 object-cover shadow-2xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If NOT submitted yet: Submission Form */}
          {!isSubmitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Ödev Yanıtınız / Çözüm Açıklamanız</span>
                  <span className="text-[11px] text-slate-500">Öğretmeninize iletilecektir</span>
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Ödev çözümünüzü, metninizi veya notlarınızı buraya yazınız..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none leading-relaxed transition-all resize-none"
                />
              </div>

              {/* Student Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>💬</span>
                  <span>Hocama Notum <span className="text-slate-400 font-normal">(isteğe bağlı)</span></span>
                </label>
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  rows={2}
                  placeholder="Örn: Hocam bu soruyu tam anlayamadım / Zamanla teslim edemedim..."
                  className="w-full p-3 bg-amber-50 border border-amber-200 focus:bg-white focus:border-amber-400 rounded-xl text-amber-950 text-xs placeholder:text-amber-600/60 focus:outline-none leading-relaxed transition-all resize-none"
                />
              </div>

              {/* Drag & Drop File Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ödev Dosyası / Belge Yükle (PDF, Görsel, DOCX)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Maks 10 MB</span>
                </label>

                {selectedFile ? (
                  /* Selected File Badge */
                  <div className="p-4 rounded-2xl bg-slate-50 border border-blue-200 flex items-center justify-between gap-3 animate-fade shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(selectedFile.name, selectedFile.type)}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatFileSize(selectedFile.size)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Kaldır</span>
                    </button>
                  </div>
                ) : (
                  /* Dropzone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5',
                      isDragOver
                        ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                        : 'border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-slate-100'
                    )}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Dosyayı buraya sürükleyin veya <span className="text-blue-600 underline">seçin</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        PDF, Word (.docx) veya net çekilmiş görsel (.png, .jpg)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Form Action Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{uploadStatus || 'Ödev Gönderiliyor...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Ödevi Öğretmenime Teslim Et</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
