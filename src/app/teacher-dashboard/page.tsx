'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEduFlow } from '@/context/EduFlowContext';
import { Navbar } from '@/components/Navbar';
import { TeacherView } from '@/components/TeacherView';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { state, isLoaded, openAuthModal, setActiveTab } = useEduFlow();

  useEffect(() => {
    setActiveTab('teacher');
  }, [setActiveTab]);

  useEffect(() => {
    if (isLoaded) {
      if (!state.session) {
        openAuthModal('teacher');
        router.replace('/');
      } else if (state.session.role !== 'teacher') {
        openAuthModal('teacher');
        router.replace('/');
      }
    }
  }, [isLoaded, state.session, openAuthModal, router]);

  // If still loading session or not authorized, render calm guard state
  if (!isLoaded || !state.session || state.session.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading font-semibold text-white text-base">
            Öğretmen Çalışma Alanı Doğrulanıyor
          </h3>
          <p className="text-xs text-slate-400">
            Güvenli oturum kontrolü yapılıyor, lütfen bekleyiniz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-[#0B0F17]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
        <TeacherView />
      </main>
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500 relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-slate-300">EduFlow Pro</span>
            <span>© {new Date().getFullYear()}</span>
            <span>·</span>
            <span className="text-slate-400">Öğretmen Çalışma Alanı</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <a
              href="/gizlilik-politikasi"
              className="hover:text-cyan-400 transition-colors underline-offset-4 hover:underline"
            >
              Gizlilik & KVKK
            </a>
            <span>·</span>
            <a
              href="/kullanim-kosullari"
              className="hover:text-cyan-400 transition-colors underline-offset-4 hover:underline"
            >
              Kullanım Koşulları
            </a>
          </div>
          <div className="text-[11px] text-slate-500">
            Güvenli & Doğrulanmış Oturum
          </div>
        </div>
      </footer>
    </div>
  );
}
