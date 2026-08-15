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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0D131F] border border-slate-800 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
      >
        {/* Glow Ambient */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Sınıf Katılımı
              </div>
              <h2 id="join-classroom-title" className="font-heading font-extrabold text-xl text-white">
                Sınıfa Katıl
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
              6 Haneli Katılım Kodunu Giriniz
            </label>
            <input
              type="text"
              maxLength={8}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Örn: EDF92A"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-2xl text-center text-white text-xl sm:text-2xl font-mono tracking-widest uppercase placeholder:text-slate-600 focus:outline-none shadow-inner"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/90 leading-relaxed">
              Öğretmeninizin paylaştığı 6 haneli kodu girerek sınıfa dahil olabilir, sınıf ödevlerine ve ders materyallerine anında erişebilirsiniz.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
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
