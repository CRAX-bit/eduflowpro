'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Student } from '@/types';
import { initials } from '@/lib/utils';
import { X, Printer, Award, FileText, CheckCircle2, BookOpen } from 'lucide-react';

interface ReportCardModalProps {
  student: Student | null;
  onClose: () => void;
}

export function ReportCardModal({ student, onClose }: ReportCardModalProps) {
  const { state } = useEduFlow();

  if (!student) return null;

  const sid = student.id;
  const assignments = state.assignments.filter((a) => a.target === 'all' || a.target === sid);

  const tests = assignments.filter((a) => a.type === 'test');
  const doneTests = tests.filter((a) => a.submissions && a.submissions[sid]);
  const avgAccuracy = doneTests.length
    ? Math.round(
        doneTests.reduce((acc, a) => acc + (a.submissions[sid]?.percent || 0), 0) /
          doneTests.length
      )
    : 0;

  const books = assignments.filter((a) => a.type === 'book');
  const doneBooks = books.filter((a) => a.submissions && a.submissions[sid]?.photo);

  const notes = assignments.filter((a) => a.type === 'note');
  const uniqueFolders = Array.from(new Set(assignments.map((a) => a.folder)));

  let gradeLabel = 'Veri Yok';
  let gradeColor = '#94a3b8';
  if (doneTests.length > 0) {
    if (avgAccuracy >= 85) {
      gradeLabel = 'Mükemmel (A+)';
      gradeColor = '#10b981';
    } else if (avgAccuracy >= 70) {
      gradeLabel = 'Çok İyi (A)';
      gradeColor = '#3b82f6';
    } else if (avgAccuracy >= 50) {
      gradeLabel = 'Gelişmekte (B)';
      gradeColor = '#f59e0b';
    } else {
      gradeLabel = 'Desteklenmeli (C)';
      gradeColor = '#ef4444';
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade overflow-y-auto print:p-0 print:bg-white">
      <div className="w-full max-w-3xl bg-[#0d1424] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl my-8 print:border-none print:shadow-none print:bg-white print:text-slate-900 print:my-0">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-[#0a0f1d] via-[#121a30] to-[#0a0f1d] border-b border-white/10 flex items-center justify-between print:border-b-2 print:border-slate-200">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400">
              Öğrenci Performans Raporu
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-white print:text-slate-900">
              Gelişim Karnesi
            </h2>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="p-6 border-b border-white/[0.08] flex items-center gap-4 bg-white/[0.02]">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-2xl text-white shadow-lg shrink-0"
            style={{ backgroundColor: student.color }}
          >
            {initials(student.name)}
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white print:text-slate-900">
              {student.name}
            </h3>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              Rapor Tarihi:{' '}
              {new Date().toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-white/[0.08]">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center print:border-slate-200">
            <div className="font-heading font-bold text-2xl" style={{ color: gradeColor }}>
              %{avgAccuracy}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 mt-1">Ortalama Doğruluk</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center print:border-slate-200">
            <div className="font-heading font-bold text-2xl text-blue-400 print:text-blue-600">
              {doneTests.length} / {tests.length}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 mt-1">Çözülen Test</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center print:border-slate-200">
            <div className="font-heading font-bold text-2xl text-amber-400 print:text-amber-600">
              {doneBooks.length} / {books.length}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 mt-1">Kitap Teslimi</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center print:border-slate-200">
            <div className="font-heading font-bold text-2xl text-cyan-400 print:text-cyan-600">
              {notes.length}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 mt-1">Ders Notu</div>
          </div>
        </div>

        {/* Overall Grade Banner */}
        <div className="mx-6 my-5 p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between print:border-slate-300">
          <div className="flex items-center gap-2 text-sm text-slate-300 print:text-slate-700 font-medium">
            <Award className="w-5 h-5" style={{ color: gradeColor }} />
            <span>Genel Başarı Değerlendirmesi:</span>
          </div>
          <div className="font-heading font-bold text-lg" style={{ color: gradeColor }}>
            {gradeLabel}
          </div>
        </div>

        {/* Test Breakdown Table */}
        <div className="p-6 space-y-3">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 print:text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Test Sonuçları Dökümü</span>
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] print:border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 print:bg-slate-100 print:text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Test Başlığı</th>
                  <th className="p-3">Ünite / Konu</th>
                  <th className="p-3">Başarı</th>
                  <th className="p-3">Doğru / Toplam</th>
                  <th className="p-3">Öğretmen Notu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] print:divide-slate-200 text-slate-300 print:text-slate-800">
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Atanmış test bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  tests.map((t) => {
                    const sub = t.submissions && t.submissions[sid];
                    if (!sub) {
                      return (
                        <tr key={t.id}>
                          <td className="p-3 font-medium">{t.title}</td>
                          <td className="p-3 text-slate-400">{t.folder}</td>
                          <td className="p-3 text-slate-500">Çözülmedi</td>
                          <td className="p-3 text-slate-500">—</td>
                          <td className="p-3 text-slate-500">—</td>
                        </tr>
                      );
                    }
                    const scoreColor =
                      sub.percent! >= 70
                        ? 'text-emerald-400 print:text-emerald-600 font-bold'
                        : sub.percent! >= 40
                        ? 'text-amber-400 print:text-amber-600 font-bold'
                        : 'text-red-400 print:text-red-600 font-bold';

                    return (
                      <tr key={t.id}>
                        <td className="p-3 font-medium">{t.title}</td>
                        <td className="p-3 text-slate-400">{t.folder}</td>
                        <td className={`p-3 ${scoreColor}`}>%{sub.percent}</td>
                        <td className="p-3">
                          {sub.correct} / {sub.total} {sub.timedOut && '⏱️'}
                        </td>
                        <td className="p-3 italic text-purple-300 print:text-purple-700">
                          {sub.feedback || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Working Units Tags */}
        <div className="px-6 pb-6 space-y-2">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 print:text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Çalışılan Konular</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueFolders.map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 print:bg-slate-100 print:text-slate-800 print:border-slate-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] text-center text-[11px] text-slate-500 print:text-slate-400">
          Bu karne EduFlow Pro sistemi tarafından otomatik oluşturulmuştur · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
