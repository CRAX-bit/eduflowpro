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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Teslim Edilen Ödev Fotoğrafı</h3>
              <p className="text-xs text-slate-500">
                {studentName ? `${studentName} · ` : ''}
                <span className="text-blue-600 font-semibold">{title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
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
