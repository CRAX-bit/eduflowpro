'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toast() {
  const { toast, hideToast } = useEduFlow();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warn: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100',
    warn: 'border-amber-500/30 bg-amber-950/40 text-amber-100',
    info: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-100',
    error: 'border-red-500/30 bg-red-950/40 text-red-100',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade">
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all',
          borders[toast.type]
        )}
      >
        {icons[toast.type]}
        <span className="text-sm font-medium pr-2">{toast.message}</span>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
