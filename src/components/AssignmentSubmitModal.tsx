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
    return <FileText className="w-6 h-6 text-rose-400 shrink-0" />;
  }
  if (type.startsWith('image') || name.match(/\.(png|jpe?g|webp|gif)$/)) {
    return <Camera className="w-6 h-6 text-cyan-400 shrink-0" />;
  }
  if (name.match(/\.(doc|docx)$/)) {
    return <FileText className="w-6 h-6 text-blue-400 shrink-0" />;
  }
  return <FileUp className="w-6 h-6 text-indigo-400 shrink-0" />;
}

export function AssignmentSubmitModal({
  assignment,
  isOpen,
  onClose,
}: AssignmentSubmitModalProps) {
  const { state, submitAssignmentResponse, uploadAssignmentFile, showToast } = useEduFlow();
  const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || '';

  const [responseText, setResponseText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !assignment) return null;

  const currentSubmission = assignment.submissions?.[studentId];
  const isSubmitted = !!currentSubmission;
  const isReviewed = currentSubmission?.status === 'reviewed';

  const validateAndSetFile = (file: File) => {
    // 10 MB limit
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
      showToast('Lütfen bir metin yanıtı yazın veya dosya yükleyin.', 'warn');
      return;
    }

    setIsSubmitting(true);
    let fileAttachment: { fileUrl: string; fileName: string; fileType: string; fileSize: number } | undefined = undefined;

    // If a file is selected, upload to Supabase Storage
    if (selectedFile) {
      setUploadStatus('Dosya Supabase Storage sistemine yükleniyor...');
      const uploadRes = await uploadAssignmentFile(assignment.id, selectedFile);
      if (uploadRes.success && uploadRes.fileAttachment) {
        fileAttachment = uploadRes.fileAttachment;
      }
    }

    setUploadStatus('Ödev yanıtınız kaydediliyor...');
    const result = await submitAssignmentResponse(
      assignment.id,
      responseText,
      fileAttachment
    );

    setIsSubmitting(false);
    setUploadStatus(null);

    if (result.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/50 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                📁 {assignment.folder}
              </span>
              {assignment.classroomName && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1">
                  <School className="w-3 h-3" />
                  <span>{assignment.classroomName}</span>
                </span>
              )}
            </div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
              {assignment.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Assignment Description & Instructions */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Ödev Yönergesi & Açıklaması</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {assignment.desc || 'Bu ödev için özel bir yönerge bulunmuyor. Yanıtınızı aşağıdaki metin veya dosya alanından iletebilirsiniz.'}
            </p>
          </div>

          {/* If already submitted: Display Evaluation Card */}
          {isSubmitted && (
            <div className="space-y-4">
              {isReviewed ? (
                /* Approved Review Card */
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-md">
                        {currentSubmission.finalScore !== undefined
                          ? currentSubmission.finalScore
                          : currentSubmission.aiScore || 85}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Öğretmen Değerlendirmesi
                        </div>
                        <div className="text-xs text-slate-400">100 Üzerinden Nihai Not</div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Değerlendirildi</span>
                    </span>
                  </div>

                  {/* Teacher Feedback Note */}
                  {currentSubmission.feedback && (
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-xs space-y-1.5">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        <span>Öğretmeninin Geri Bildirimi:</span>
                      </div>
                      <p className="text-slate-100 font-medium leading-relaxed">
                        {currentSubmission.feedback}
                      </p>
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  {((currentSubmission.aiStrengths && currentSubmission.aiStrengths.length > 0) ||
                    (currentSubmission.aiImprovements && currentSubmission.aiImprovements.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {currentSubmission.aiStrengths && currentSubmission.aiStrengths.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Güçlü Yönlerin:</span>
                          </span>
                          <ul className="space-y-1 text-slate-300 list-disc list-inside">
                            {currentSubmission.aiStrengths.map((str, idx) => (
                              <li key={idx} className="leading-snug">
                                {str}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentSubmission.aiImprovements && currentSubmission.aiImprovements.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Geliştirme Tavsiyesi:</span>
                          </span>
                          <ul className="space-y-1 text-slate-300 list-disc list-inside">
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
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-white text-sm">
                          Ödeviniz Başarıyla Teslim Edildi
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Öğretmeninizin inceleme paneline iletildi.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                      ⏳ Değerlendirme Bekleniyor
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Öğretmeniniz ödevinizi inceleyip onayladığında nihai notunuz ve yapıcı geri bildiriminiz bu ekranda görüntülenecektir.
                  </p>
                </div>
              )}

              {/* Student's Sent Response */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400">Teslim Ettiğiniz Yanıt & Ekler:</span>
                {currentSubmission.responseText && (
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentSubmission.responseText}
                  </p>
                )}

                {/* Uploaded File View */}
                {currentSubmission.fileUrl && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(currentSubmission.fileName, currentSubmission.fileType)}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
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
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
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
                      className="max-h-48 rounded-xl border border-slate-800 object-cover"
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
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Ödev Yanıtınız / Çözüm Açıklamanız</span>
                  <span className="text-[11px] text-slate-500">Öğretmeninize iletilecektir</span>
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Ödev çözümünüzü, metninizi veya notlarınızı buraya yazınız..."
                  className="w-full p-4 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-2xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none leading-relaxed transition-all resize-none"
                />
              </div>

              {/* Drag & Drop File Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ödev Dosyası / Belge Yükle (PDF, Görsel, DOCX)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Maks 10 MB</span>
                </label>

                {selectedFile ? (
                  /* Selected File Badge */
                  <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3 animate-fade">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(selectedFile.name, selectedFile.type)}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
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
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
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
                        ? 'border-indigo-400 bg-indigo-500/10 scale-[0.99]'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/80'
                    )}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        Dosyayı buraya sürükleyin veya <span className="text-indigo-400 underline">Gözatın</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        PDF, PNG, JPG veya DOCX formatları desteklenir (En fazla 10 MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,application/pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Upload Status / Progress Indicator */}
              {uploadStatus && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2.5 animate-fade">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || (!responseText.trim() && !selectedFile)}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ödeviniz İletiliyor...</span>
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
