'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, Student } from '@/types';
import { X, MessageSquareQuote, Sparkles, Loader2, Save } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

interface FeedbackModalProps {
  assignment: Assignment | null;
  student: Student | null;
  onClose: () => void;
}

export function FeedbackModal({ assignment, student, onClose }: FeedbackModalProps) {
  const { saveFeedback, showToast, state } = useEduFlow();

  const [feedbackText, setFeedbackText] = useState(() => {
    if (!assignment || !student) return '';
    return assignment.submissions[student.id]?.feedback || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!assignment || !student) return null;

  const sub = assignment.submissions[student.id];

  const handleSave = () => {
    saveFeedback(assignment.id, student.id, feedbackText);
    onClose();
  };

  const handleGenerateAiFeedback = async () => {
    setIsGenerating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_feedback',
          studentName: student.name,
          topic: assignment.title,
          score: sub?.correct,
          total: sub?.total,
          mistakes: sub?.answers?.filter((a) => !a.ok),
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedbackText(data.feedback);
        showToast('Deskio AI öğrenciye özel geri bildirim oluşturdu! ✨', 'success');
      } else {
        showToast(data.error || 'Yapay zeka yanıtı alınamadı.', 'warn');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-lg bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 relative shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto touch-scroll">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-base sm:text-xl text-slate-950 truncate">Öğretmen Geri Bildirimi</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold truncate">
                {student.name} · <span className="text-blue-700 font-bold">{assignment.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Generator Helper Button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleGenerateAiFeedback}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600" />
            )}
            <span>
              {isGenerating
                ? 'Deskio AI Yorum Hazırlıyor...'
                : '✨ Deskio AI ile Öğrenciye Özel Yorum Üret'}
            </span>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          rows={4}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Öğrencinin güçlü yanlarını ve gelişmesi gereken noktaları belirten yapıcı bir geri bildirim yazınız..."
          className="w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none transition-all resize-y leading-relaxed mb-4"
        />

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] active:scale-95"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-sm shadow-blue-600/25 transition-all cursor-pointer min-h-[44px] active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Kaydet & İlet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
