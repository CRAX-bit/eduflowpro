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
      const headers = await getAuthHeaders(state.session);
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
        showToast('Gemini AI öğrenciye özel geri bildirim oluşturdu! ✨', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 relative shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Öğretmen Geri Bildirimi</h3>
              <p className="text-xs text-slate-500">
                {student.name} · <span className="text-blue-600">{assignment.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Generator Helper Button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleGenerateAiFeedback}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600" />
            )}
            <span>
              {isGenerating
                ? 'Gemini AI Yorum Hazırlıyor...'
                : '✨ Gemini AI ile Öğrenciye Özel Yorum Üret'}
            </span>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          rows={5}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Öğrencinin performansına dair teşvik edici ve öğretici notlarınızı buraya yazın..."
          className="w-full p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none transition-all resize-y"
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Geri Bildirimi Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
