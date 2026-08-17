'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toast() {
  const { toast, hideToast } = useEduFlow();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warn: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-emerald-950 shadow-emerald-500/10',
    warn: 'border-amber-200 bg-white text-amber-950 shadow-amber-500/10',
    info: 'border-blue-200 bg-white text-blue-950 shadow-blue-500/10',
    error: 'border-rose-200 bg-white text-rose-950 shadow-rose-500/10',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade">
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl transition-all',
          borders[toast.type]
        )}
      >
        {icons[toast.type]}
        <span className="text-xs sm:text-sm font-semibold pr-2">{toast.message}</span>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
