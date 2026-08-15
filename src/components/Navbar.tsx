'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  GraduationCap,
  Home,
  LogOut,
  LogIn,
  Sparkles,
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div
          onClick={() => {
            if (session?.role === 'teacher') {
              setActiveTab('teacher');
            } else if (session?.role === 'student') {
              setActiveTab('student');
            } else {
              setActiveTab('home');
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.35)] group-hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] transition-all">
            <div className="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center">
            Edu<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Flow</span>
            <span className="text-[10px] sm:text-xs ml-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-cyan-500/30 font-mono">PRO</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
              activeTab === 'home'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </button>

          {session?.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('teacher')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
                activeTab === 'teacher'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <span>👨‍🏫 Öğretmen Paneli</span>
            </button>
          )}

          {session?.role === 'student' && (
            <button
              onClick={() => setActiveTab('student')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <span>🎓 Öğrenci Portalı</span>
            </button>
          )}
        </nav>

        {/* Right Session & Actions Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Status Indicator (Hidden on ultra-small screens) */}
          <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-300 text-xs font-semibold select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide text-[11px]">Sistem Canlı · Gemini Pro</span>
          </div>

          {session ? (
            <div className="flex items-center gap-2">
              {/* User badge */}
              <div className="flex items-center gap-2 p-1 sm:pr-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-md shrink-0"
                  style={{
                    backgroundColor:
                      session.role === 'teacher'
                        ? '#10b981'
                        : currentStudent?.color || '#3b82f6',
                  }}
                >
                  {session.role === 'teacher'
                    ? session.name ? initials(session.name) : 'ÖĞ'
                    : initials(session.name || currentStudent?.name || '?')}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {session.name || (session.role === 'teacher' ? 'Öğretmen' : currentStudent?.name || 'Öğrenci')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none">
                    {session.role === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Çıkış Yap"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('teacher')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="flex md:hidden border-t border-slate-800/80 px-3 py-1.5 gap-2 bg-[#0B0F17]/95">
        <button
          onClick={() => setActiveTab('home')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            activeTab === 'home'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Ana Sayfa</span>
        </button>

        {session?.role === 'teacher' && (
          <button
            onClick={() => setActiveTab('teacher')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === 'teacher'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <span>👨‍🏫 Öğretmen Paneli</span>
          </button>
        )}

        {session?.role === 'student' && (
          <button
            onClick={() => setActiveTab('student')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === 'student'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <span>🎓 Öğrenci Portalı</span>
          </button>
        )}
      </div>
    </header>
  );
}
