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
  Menu,
  X,
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
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
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
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
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
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
    setIsMobileNavOpen(false);
    if (session?.role === 'teacher') {
      setActiveTab('teacher');
      if (pathname !== '/') router.push('/');
    } else if (session?.role === 'student') {
      setActiveTab('student');
      if (pathname !== '/') router.push('/');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo - Deskio */}
          <div
            onClick={handleNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0 min-h-[44px] py-1"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/20 transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="font-heading font-extrabold text-xl tracking-tight text-slate-950 flex items-center">
              <span>Deskio</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop Pill Switcher) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200 rounded-2xl">
            <button
              type="button"
              onClick={handleNavigateHome}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none min-h-[40px] active:scale-95',
                activeTab === 'home'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              )}
            >
              <Home className="w-4 h-4" />
              <span>Ana Sayfa</span>
            </button>

            <button
              type="button"
              onClick={handleNavigateTeacher}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none min-h-[40px] active:scale-95',
                activeTab === 'teacher'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              )}
            >
              <span>👨‍🏫 Öğretmen Masası</span>
            </button>

            <button
              type="button"
              onClick={handleNavigateStudent}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none min-h-[40px] active:scale-95',
                activeTab === 'student'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              )}
            >
              <span>🎓 Öğrenci Masası</span>
            </button>
          </nav>

          {/* Right Session & Actions Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Model Status Badge (Desktop) */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-xs select-none">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-800">Deskio AI 2.5 • Aktif</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>

            {session ? (
              /* Interactive Profile Dropdown */
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-all cursor-pointer select-none min-h-[44px] active:scale-95"
                  aria-expanded={isProfileMenuOpen}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-extrabold text-xs text-white shadow-xs shrink-0"
                    style={{
                      backgroundColor:
                        session.role === 'teacher'
                          ? '#2563eb'
                          : currentStudent?.color || '#4f46e5',
                    }}
                  >
                    {session.role === 'teacher'
                      ? session.name ? initials(session.name) : 'ÖĞ'
                      : initials(session.name || currentStudent?.name || '?')}
                  </div>
                  <div className="hidden sm:flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-slate-950 truncate max-w-[120px]">
                      {session.name || (session.role === 'teacher' ? 'Öğretmen' : currentStudent?.name || 'Öğrenci')}
                    </span>
                    <span className="text-[10px] text-slate-700 font-semibold leading-none">
                      {session.role === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci'}
                    </span>
                  </div>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform ml-0.5', isProfileMenuOpen && 'rotate-180')} />
                </button>

                {/* Floating Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 p-2 bg-white border border-slate-300 rounded-2xl shadow-2xl space-y-1.5 z-50 animate-fade">
                    {/* User Info Header */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-extrabold text-xs text-slate-950 truncate max-w-[140px]">
                          {session.name || 'Kullanıcı'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {session.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                        </span>
                      </div>
                      {session.email && (
                        <p className="text-[11px] text-slate-700 font-mono font-medium truncate">{session.email}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-1 pt-1">
                      <button
                        type="button"
                        onClick={handleNavigateDashboard}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-800 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer text-left font-bold min-h-[44px] active:scale-95"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>{session.role === 'teacher' ? 'Öğretmen Masası' : 'Öğrenci Masası'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          setIsProfileMenuOpen(false);
                          handleNavigateHome(e);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer text-left font-bold min-h-[44px] active:scale-95"
                      >
                        <Home className="w-4 h-4 text-slate-600" />
                        <span>Ana Sayfa</span>
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer text-left font-bold min-h-[44px] active:scale-95"
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
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[44px] active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Giriş Yap</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('teacher')}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm shadow-blue-600/25 transition-all cursor-pointer min-h-[44px] active:scale-95"
                >
                  <span>Ücretsiz Başla</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Menüyü aç/kapat"
              className="md:hidden p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-fade">
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={handleNavigateHome}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left min-h-[44px] active:scale-95',
                  activeTab === 'home'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'text-slate-800 hover:bg-slate-50'
                )}
              >
                <Home className="w-4 h-4 text-blue-600" />
                <span>Ana Sayfa</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateTeacher}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left min-h-[44px] active:scale-95',
                  activeTab === 'teacher'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'text-slate-800 hover:bg-slate-50'
                )}
              >
                <span>👨‍🏫 Öğretmen Masası</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateStudent}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left min-h-[44px] active:scale-95',
                  activeTab === 'student'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'text-slate-800 hover:bg-slate-50'
                )}
              >
                <span>🎓 Öğrenci Masası</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
