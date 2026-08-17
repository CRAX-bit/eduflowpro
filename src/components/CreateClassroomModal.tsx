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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Deskio Sınıf Yönetimi
              </div>
              <h2 id="create-classroom-title" className="font-heading font-extrabold text-lg sm:text-2xl text-slate-950">
                Yeni Sınıf Masası Aç
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
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Sınıf / Şube Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 8-A Şubesi veya LGS Hazırlık Masası"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Ders / Branş
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Örn: İngilizce veya Matematik"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subjectSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSubject(s)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold hover:text-blue-800 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Açıklama / Hedef (İsteğe Bağlı)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: 2026 Eğitim yılı haftalık ödev ve test takip sınıfı."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Join Code Callout Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-medium">
              Sınıf oluşturulduğunda otomatik olarak <b>6 haneli özel bir Katılım Kodu (Join Code)</b> üretilecektir. Bu kodu öğrencilerinizle paylaşarak sınıfa katılmalarını sağlayabilirsiniz.
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95"
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
