'use client';

import React, { useEffect } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Navbar } from '@/components/Navbar';
import { TeacherView } from '@/components/TeacherView';

export default function TeacherDashboardPage() {
  const { state, openAuthModal, setActiveTab } = useEduFlow();

  useEffect(() => {
    setActiveTab('teacher');
  }, [setActiveTab]);

  useEffect(() => {
    if (state.session && state.session.role !== 'teacher') {
      openAuthModal('teacher');
    } else if (!state.session) {
      openAuthModal('teacher');
    }
  }, [state.session, openAuthModal]);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
        <TeacherView />
      </main>
      <footer className="border-t border-white/[0.08] bg-[#0a0f1d]/90 py-8 px-4 text-center text-xs text-slate-500 relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-300">EduFlow Pro</span>
            <span>© {new Date().getFullYear()}</span>
            <span>·</span>
            <span className="text-cyan-400">Google Gemini Pro Destekli</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Öğretmen Çalışma Alanı
          </div>
        </div>
      </footer>
    </div>
  );
}
