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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade">
      <div className="w-full max-w-2xl bg-[#0d1424] border border-white/10 rounded-3xl p-6 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Teslim Edilen Ödev Fotoğrafı</h3>
              <p className="text-xs text-slate-400">
                {studentName ? `${studentName} · ` : ''}
                <span className="text-amber-400">{title}</span>
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

        {/* Photo view */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center max-h-[70vh]">
          <img src={photoUrl} alt="Ödev Teslimi" className="w-full h-auto object-contain max-h-[70vh]" />
        </div>
      </div>
    </div>
  );
}
