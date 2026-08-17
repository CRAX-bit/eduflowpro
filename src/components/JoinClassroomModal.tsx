'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { X, KeyRound, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JoinClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinClassroomModal({ isOpen, onClose }: JoinClassroomModalProps) {
  const { joinClassroom, showToast } = useEduFlow();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Lütfen 6 haneli katılım kodunu giriniz.', 'warn');
      return;
    }

    setLoading(true);
    try {
      const success = await joinClassroom(cleanCode);
      if (success) {
        setCode('');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-classroom-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Deskio Sınıf Katılımı
              </div>
              <h2 id="join-classroom-title" className="font-heading font-extrabold text-lg sm:text-2xl text-slate-950">
                Sınıfa Katıl
              </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-center">
              6 Haneli Katılım Kodunu Giriniz
            </label>
            <input
              type="text"
              maxLength={8}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Örn: DSK92A"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-2xl text-center text-slate-950 text-xl sm:text-2xl font-mono font-extrabold tracking-widest uppercase placeholder:text-slate-500 focus:outline-none shadow-xs min-h-[50px]"
            />
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-medium">
              Öğretmeninizin paylaştığı 6 haneli kodu girerek sınıfa dahil olabilir, sınıf ödevlerine ve ders materyallerine anında erişebilirsiniz.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] active:scale-95"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Sınıfa Katıl</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
