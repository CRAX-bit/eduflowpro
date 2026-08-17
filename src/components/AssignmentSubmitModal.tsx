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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSizeBytes) {
      showToast('Dosya boyutu en fazla 25 MB olabilir.', 'warn');
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responseText.trim() && !selectedFile) {
      showToast('Lütfen yazılı bir yanıt girin veya bir ödev dosyası yükleyin.', 'warn');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Ödev yükleniyor ve kaydediliyor...');

    try {
      let fileAttachment: { fileUrl: string; fileName: string; fileType: string; fileSize: number } | undefined = undefined;

      if (selectedFile) {
        setUploadStatus('Dosya güvenli depolama alanına yükleniyor...');
        const uploaded = await uploadAssignmentFile(assignment.id, selectedFile);
        if (uploaded.success && uploaded.fileAttachment) {
          fileAttachment = uploaded.fileAttachment;
        } else {
          showToast('Dosya yüklenemedi, ancak metin yanıtınız kaydediliyor.', 'warn');
        }
      }

      setUploadStatus('Öğretmen paneline iletiliyor...');
      const success = await submitAssignmentResponse(
        assignment.id,
        responseText.trim(),
        fileAttachment,
        undefined,
        studentNote.trim() || undefined
      );

      if (success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
        showToast('Ödeviniz başarıyla teslim edildi!', 'success');
        setResponseText('');
        setStudentNote('');
        setSelectedFile(null);
        onClose();
      } else {
        showToast('Teslim edilirken bir sorun oluştu. Lütfen tekrar deneyiniz.', 'error');
      }
    } catch (err: any) {
      showToast('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
      <div className="bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                Deskio Ödev Masası
              </span>
              <span className="text-xs text-slate-700 font-bold truncate">• {assignment.folder}</span>
              {assignment.classroomName && (
                <span className="text-xs text-slate-700 font-bold truncate">• {assignment.classroomName}</span>
              )}
            </div>
            <h2 className="font-heading font-extrabold text-base sm:text-xl text-slate-950 tracking-tight truncate">
              {assignment.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 touch-scroll">
          {/* Assignment Description */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Ödev Yönergesi & Açıklaması</span>
            </div>
            <p className="text-sm sm:text-[15px] text-slate-950 leading-relaxed whitespace-pre-wrap font-medium">
              {assignment.desc || 'Bu ödev için özel bir yönerge bulunmuyor. Yanıtınızı aşağıdaki metin veya dosya alanından iletebilirsiniz.'}
            </p>
          </div>

          {/* If already submitted: Display Evaluation Card */}
          {isSubmitted && (
            <div className="space-y-4">
              {isReviewed ? (
                /* Approved Review Card */
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs shrink-0">
                        {currentSubmission.finalScore !== undefined
                          ? currentSubmission.finalScore
                          : currentSubmission.aiScore || 85}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                          Öğretmen Değerlendirmesi
                        </div>
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-emerald-950">
                          Notlandırıldı ve Onaylandı
                        </h3>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
                      ✓ Not Girildi
                    </span>
                  </div>

                  {currentSubmission.feedback && (
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm text-slate-950 font-medium leading-relaxed">
                      <b className="text-emerald-800 font-bold block mb-1">Öğretmen Notu / Geri Bildirim:</b>
                      {currentSubmission.feedback}
                    </div>
                  )}
                </div>
              ) : (
                /* Pending Review Card */
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Ödeviniz Başarıyla İletildi (Öğretmen İncelemesinde)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Bekliyor
                    </span>
                  </div>

                  {currentSubmission.responseText && (
                    <div className="p-3 rounded-xl bg-white border border-blue-200 text-xs sm:text-sm text-slate-950 font-medium">
                      <span className="font-bold text-slate-800 block mb-1">İletilen Metin Yanıtı:</span>
                      <p className="line-clamp-3 whitespace-pre-wrap">{currentSubmission.responseText}</p>
                    </div>
                  )}

                  {currentSubmission.fileAttachment && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-950 font-bold">
                      {getFileIcon(currentSubmission.fileAttachment.fileName, currentSubmission.fileAttachment.fileType)}
                      <span className="truncate flex-1">{currentSubmission.fileAttachment.fileName}</span>
                      <a
                        href={currentSubmission.fileAttachment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>Aç</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submission Form (Shown if not submitted or allowed to re-submit) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Written Response Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Yazılı Yanıtınız (Metin / Rapor)
              </label>
              <textarea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Cevabınızı, konu analizini veya çözüm adımlarını detaylıca buraya yazabilirsiniz..."
                className="w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm sm:text-[15px] font-medium placeholder:text-slate-500 focus:outline-none transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Drag & Drop File Upload Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Dosya / Doküman / Fotoğraf Ekle (Opsiyonel)
              </label>

              {!selectedFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[110px] active:bg-slate-100',
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.zip,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-blue-700 hover:underline">
                      Dosya seçmek için dokunun
                    </span>
                    <span className="text-xs text-slate-700 font-medium block">
                      PDF, Word, JPEG, PNG vb. (Maksimum 25 MB)
                    </span>
                  </div>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 animate-fade">
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(selectedFile.name, selectedFile.type)}
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-950 truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[11px] text-slate-700 font-semibold">
                        {formatFileSize(selectedFile.size)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-300 hover:border-red-300 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95 shrink-0"
                    title="Dosyayı kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Note to Teacher */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Öğretmene Özel Not (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder="Örn: Hocam 3. soruda takıldım, çözüm yolumu kontrol edebilir misiniz?"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || (!responseText.trim() && !selectedFile)}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[48px] active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadStatus || 'Ödev Gönderiliyor...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isSubmitted ? 'Ödevi Güncelle & Yeniden Gönder' : 'Ödevi Teslim Et'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
