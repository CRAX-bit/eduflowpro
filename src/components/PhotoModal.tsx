'use client';

import React from 'react';
import { X, Camera } from 'lucide-react';

interface PhotoModalProps {
  photoUrl: string | null;
  title: string;
  studentName?: string;
  onClose: () => void;
}

export function PhotoModal({ photoUrl, title, studentName, onClose }: PhotoModalProps) {
  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 relative shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-950 truncate">Teslim Edilen Ödev Fotoğrafı</h3>
              <p className="text-xs text-slate-700 font-semibold truncate">
                {studentName ? `${studentName} · ` : ''}
                <span className="text-blue-700 font-bold">{title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo view */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[70vh] p-2">
          <img src={photoUrl} alt="Ödev Teslimi" className="w-full h-auto object-contain max-h-[68vh] rounded-xl shadow-xs" />
        </div>
      </div>
    </div>
  );
}
