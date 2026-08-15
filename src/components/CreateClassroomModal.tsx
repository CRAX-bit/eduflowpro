'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { X, School, Plus, Sparkles, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClassroomModal({ isOpen, onClose }: CreateClassroomModalProps) {
  const { createClassroom, showToast } = useEduFlow();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Lütfen sınıf adını giriniz.', 'warn');
      return;
    }

    setLoading(true);
    try {
      const created = await createClassroom(name.trim(), subject.trim(), description.trim());
      if (created) {
        setName('');
        setSubject('');
        setDescription('');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const subjectSuggestions = [
    'İngilizce',
    'Matematik',
    'Fen Bilimleri',
    'Türkçe',
    'Fizik',
    'Kimya',
    'Biyoloji',
    'Tarih',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-classroom-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0D131F] border border-slate-800 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
      >
        {/* Glow Ambient */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Sınıf & Şube Yönetimi
              </div>
              <h2 id="create-classroom-title" className="font-heading font-extrabold text-xl text-white">
                Yeni Sınıf Oluştur
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Sınıf / Şube Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 8-A Şubesi veya LGS Hazırlık Grubu"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ders / Branş
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Örn: İngilizce veya Matematik"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subjectSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSubject(s)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Açıklama / Hedef (İsteğe Bağlı)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: 2026 Eğitim yılı haftalık ödev ve test takip sınıfı."
              className="w-full px-4 py-2 bg-slate-900/90 border border-slate-800 focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Join Code Callout Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              Sınıf oluşturulduğunda otomatik olarak <b>6 haneli özel bir Katılım Kodu (Join Code)</b> üretilecektir. Bu kodu öğrencilerinizle paylaşarak sınıfa katılmalarını sağlayabilirsiniz.
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Oluşturuluyor...' : 'Sınıfı Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
