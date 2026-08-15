'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  GraduationCap,
  Home,
  LogOut,
  LogIn,
  Sparkles,
  User,
  ChevronDown,
  LayoutDashboard,
  Shield,
  CheckCircle2,
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

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const session = state.session;
  const currentStudent = session?.role === 'student' ? getStudentById(session.studentId) : null;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigateHome = () => {
    setActiveTab('home');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  const handleNavigateDashboard = () => {
    setIsProfileMenuOpen(false);
    if (session?.role === 'teacher') {
      setActiveTab('teacher');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('teacher-dashboard')) {
        window.location.href = '/teacher-dashboard';
      }
    } else if (session?.role === 'student') {
      setActiveTab('student');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('student-dashboard')) {
        window.location.href = '/student-dashboard';
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F17]/95 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div
          onClick={handleNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-sm group-hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all">
            <div className="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center">
            Edu<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Flow</span>
            <span className="text-[10px] sm:text-xs ml-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">PRO</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
          <button
            onClick={handleNavigateHome}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </button>

          {session?.role === 'teacher' && (
            <button
              onClick={() => {
                setActiveTab('teacher');
                if (typeof window !== 'undefined' && !window.location.pathname.includes('teacher-dashboard')) {
                  window.location.href = '/teacher-dashboard';
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
                activeTab === 'teacher'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <span>👨‍🏫 Öğretmen Paneli</span>
            </button>
          )}

          {session?.role === 'student' && (
            <button
              onClick={() => {
                setActiveTab('student');
                if (typeof window !== 'undefined' && !window.location.pathname.includes('student-dashboard')) {
                  window.location.href = '/student-dashboard';
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
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
            <span className="tracking-wide text-[11px]">Sistem Aktif · Akıllı Asistan Devrede</span>
          </div>

          {session ? (
            /* Interactive Profile Dropdown */
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:pr-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer select-none"
                aria-expanded={isProfileMenuOpen}
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-sm shrink-0"
                  style={{
                    backgroundColor:
                      session.role === 'teacher'
                        ? '#10b981'
                        : currentStudent?.color || '#6366f1',
                  }}
                >
                  {session.role === 'teacher'
                    ? session.name ? initials(session.name) : 'ÖĞ'
                    : initials(session.name || currentStudent?.name || '?')}
                </div>
                <div className="hidden sm:flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[110px]">
                    {session.name || (session.role === 'teacher' ? 'Öğretmen' : currentStudent?.name || 'Öğrenci')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none">
                    {session.role === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci'}
                  </span>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform ml-1', isProfileMenuOpen && 'rotate-180')} />
              </button>

              {/* Floating Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 p-2 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl space-y-1.5 z-50 animate-fade">
                  {/* User Info Header */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-xs text-white truncate max-w-[140px]">
                        {session.name || 'Kullanıcı'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                        {session.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                      </span>
                    </div>
                    {session.email && (
                      <p className="text-[11px] text-slate-400 font-mono truncate">{session.email}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-1 pt-1">
                    <button
                      onClick={handleNavigateDashboard}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-all cursor-pointer text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      <span>{session.role === 'teacher' ? 'Öğretmen Paneli' : 'Öğrenci Portalı'}</span>
                    </button>

                    <button
                      onClick={handleNavigateHome}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-all cursor-pointer text-left"
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      <span>Ana Sayfaya Dön</span>
                    </button>
                  </div>

                  {/* Divider & Logout */}
                  <div className="pt-1.5 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Oturumu Kapat (Çıkış Yap)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('teacher')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
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
          onClick={handleNavigateHome}
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
            onClick={() => {
              setActiveTab('teacher');
              if (typeof window !== 'undefined' && !window.location.pathname.includes('teacher-dashboard')) {
                window.location.href = '/teacher-dashboard';
              }
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === 'teacher'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <span>👨‍🏫 Öğretmen</span>
          </button>
        )}

        {session?.role === 'student' && (
          <button
            onClick={() => {
              setActiveTab('student');
              if (typeof window !== 'undefined' && !window.location.pathname.includes('student-dashboard')) {
                window.location.href = '/student-dashboard';
              }
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === 'student'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <span>🎓 Öğrenci</span>
          </button>
        )}
      </div>
    </header>
  );
}
