'use client';

import React from 'react';
import { Assignment } from '@/types';
import { X, FileText, Download, Folder } from 'lucide-react';

interface NoteModalProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export function NoteModal({ assignment, onClose }: NoteModalProps) {
  if (!assignment) return null;

  const handleDownload = () => {
    if (assignment.fileData) {
      const link = document.createElement('a');
      link.href = assignment.fileData;
      link.download = assignment.fileName || 'ders_notu';
      link.click();
    } else if (assignment.desc) {
      const blob = new Blob([`${assignment.title}\n\n${assignment.desc}`], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assignment.title}.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative shadow-2xl max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 mb-1 font-semibold">
              <Folder className="w-3.5 h-3.5" />
              <span>{assignment.folder}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                DERS NOTU
              </span>
            </div>
            <h3 className="font-heading font-bold text-xl text-slate-900">{assignment.title}</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              title="Notu İndir"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-600 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          {assignment.desc && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {assignment.desc}
            </div>
          )}

          {assignment.fileData?.startsWith('data:image') && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
              <img
                src={assignment.fileData}
                alt={assignment.title}
                className="w-full h-auto object-contain max-h-[60vh]"
              />
            </div>
          )}

          {assignment.fileData?.startsWith('data:application/pdf') && (
            <iframe
              src={assignment.fileData}
              title={assignment.title}
              className="w-full h-[60vh] rounded-2xl border border-slate-200 shadow-2xs"
            />
          )}

          {!assignment.fileData && !assignment.desc && (
            <div className="text-center py-10 text-slate-400 text-sm">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>İçerik bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
