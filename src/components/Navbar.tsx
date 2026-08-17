'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();
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

  const handleNavigateHome = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleNavigateTeacher = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (session?.role !== 'teacher') {
      openAuthModal('teacher');
      return;
    }
    setActiveTab('teacher');
    if (pathname !== '/' && !pathname.includes('teacher-dashboard')) {
      router.push('/');
    }
  };

  const handleNavigateStudent = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (session?.role !== 'student') {
      openAuthModal('student');
      return;
    }
    setActiveTab('student');
    if (pathname !== '/' && !pathname.includes('student-dashboard')) {
      router.push('/');
    }
  };

  const handleNavigateDashboard = () => {
    setIsProfileMenuOpen(false);
    if (session?.role === 'teacher') {
      setActiveTab('teacher');
      if (pathname !== '/') router.push('/');
    } else if (session?.role === 'student') {
      setActiveTab('student');
      if (pathname !== '/') router.push('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#090a0f]/95 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div
          onClick={handleNavigateHome}
          className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
        >
          <GraduationCap className="w-5 h-5 text-zinc-200 transition-transform group-hover:scale-105" />
          <div className="font-heading font-semibold text-lg tracking-tight text-zinc-100 flex items-center">
            <span>EduFlow</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              PRO
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop - Instant & Fluid Switch) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleNavigateHome}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer select-none',
              activeTab === 'home'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold border border-zinc-700/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            )}
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </button>

          <button
            type="button"
            onClick={handleNavigateTeacher}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer select-none',
              activeTab === 'teacher'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            )}
          >
            <span>👨‍🏫 Öğretmen Paneli</span>
          </button>

          <button
            type="button"
            onClick={handleNavigateStudent}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer select-none',
              activeTab === 'student'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            )}
          >
            <span>🎓 Öğrenci Portalı</span>
          </button>
        </nav>

        {/* Right Session & Actions Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Model Status Badge */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs select-none backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium text-zinc-300">Gemini 2.5 Pro • Devrede</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {session ? (
            /* Interactive Profile Dropdown */
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:pr-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer select-none"
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
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {session.name || (session.role === 'teacher' ? 'Öğretmen' : currentStudent?.name || 'Öğrenci')}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium leading-none">
                    {session.role === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci'}
                  </span>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-zinc-400 transition-transform ml-1', isProfileMenuOpen && 'rotate-180')} />
              </button>

              {/* Floating Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 p-2 bg-[#0c0d12] border border-zinc-800 rounded-2xl shadow-2xl space-y-1.5 z-50 animate-fade backdrop-blur-2xl">
                  {/* User Info Header */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-xs text-white truncate max-w-[140px]">
                        {session.name || 'Kullanıcı'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {session.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                      </span>
                    </div>
                    {session.email && (
                      <p className="text-[11px] text-zinc-400 font-mono truncate">{session.email}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={handleNavigateDashboard}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>{session.role === 'teacher' ? 'Öğretmen Paneli' : 'Öğrenci Portalı'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        setIsProfileMenuOpen(false);
                        handleNavigateHome(e);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer text-left"
                    >
                      <Home className="w-4 h-4 text-zinc-400" />
                      <span>Ana Sayfa</span>
                    </button>

                    <div className="my-1 border-t border-zinc-800" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest Login Buttons */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('teacher')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Giriş Yap</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('teacher')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <span>Kayıt Ol</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
