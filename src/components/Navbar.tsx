'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  GraduationCap,
  Home,
  UserCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { initials, cn } from '@/lib/utils';

interface NavbarProps {
  onOpenAiAssistant?: () => void;
}

export function Navbar({ onOpenAiAssistant }: NavbarProps) {
  const {
    state,
    activeTab,
    setActiveTab,
    openAuthModal,
    logout,
    getStudentById,
  } = useEduFlow();

  const session = state.session;
  const currentStudent = session?.role === 'student' ? getStudentById(session.studentId) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-purple-600 p-[1px] shadow-[0_0_24px_rgba(0,242,254,0.4)] group-hover:shadow-[0_0_32px_rgba(0,242,254,0.6)] transition-all">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-xl tracking-tight text-white">
            Edu<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Flow</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-cyan-500/30">PRO</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === 'home'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            )}
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </button>

          {session?.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('teacher')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeTab === 'teacher'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              )}
            >
              <div className="w-4 h-4 flex items-center justify-center font-bold">👨‍🏫</div>
              <span>Öğretmen Paneli</span>
            </button>
          )}

          {session?.role === 'student' && (
            <button
              onClick={() => setActiveTab('student')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              )}
            >
              <div className="w-4 h-4 flex items-center justify-center font-bold">🎓</div>
              <span>Öğrenci Portalı</span>
            </button>
          )}
        </nav>

        {/* Right Status Badge & Session Area */}
        <div className="flex items-center gap-2">
          {/* Live SaaS Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-300 text-xs font-semibold shadow-[0_0_16px_rgba(16,185,129,0.15)] select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide text-[11px] sm:text-xs">Sistem Canlı | Gemini Pro v2</span>
          </div>

          {session && (
            <div className="flex items-center gap-2 ml-1">
              <div className="flex items-center gap-2 p-1 pr-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-md"
                  style={{
                    backgroundColor:
                      session.role === 'teacher'
                        ? '#10b981'
                        : currentStudent?.color || '#3b82f6',
                  }}
                >
                  {session.role === 'teacher' ? 'ÖĞ' : initials(currentStudent?.name || '?')}
                </div>
                <span className="text-xs font-semibold text-white hidden sm:inline">
                  {session.role === 'teacher' ? 'Öğretmen' : currentStudent?.name?.split(' ')[0] || 'Öğrenci'}
                </span>
              </div>

              <button
                onClick={logout}
                title="Çıkış Yap"
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-white/[0.06] px-4 py-2 gap-2 bg-[#0a0f1d]/90">
        <button
          onClick={() => setActiveTab('home')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium',
            activeTab === 'home' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400'
          )}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Ana Sayfa</span>
        </button>

        {session?.role === 'teacher' && (
          <button
            onClick={() => setActiveTab('teacher')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium',
              activeTab === 'teacher' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'
            )}
          >
            <span>👨‍🏫 Panel</span>
          </button>
        )}

        {session?.role === 'student' && (
          <button
            onClick={() => setActiveTab('student')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium',
              activeTab === 'student' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400'
            )}
          >
            <span>🎓 Portal</span>
          </button>
        )}
      </div>
    </header>
  );
}
