'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Assignment, Student } from '@/types';
import { X, MessageSquareQuote, Sparkles, Loader2, Save } from 'lucide-react';

interface FeedbackModalProps {
  assignment: Assignment | null;
  student: Student | null;
  onClose: () => void;
}

export function FeedbackModal({ assignment, student, onClose }: FeedbackModalProps) {
  const { saveFeedback, showToast } = useEduFlow();

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
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        showToast('Yapay zeka yanıtı alınamadı.', 'warn');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
      <div className="w-full max-w-lg bg-[#0d1424] border border-white/10 rounded-3xl p-6 relative shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Öğretmen Geri Bildirimi</h3>
              <p className="text-xs text-slate-400">
                {student.name} · <span className="text-cyan-400">{assignment.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-all"
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
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(157,78,221,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-pink-400" />
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
          className="w-full p-4 bg-white/[0.04] border border-white/10 focus:border-purple-400 rounded-2xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all resize-y"
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] border border-white/10 transition-all"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Geri Bildirimi Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
