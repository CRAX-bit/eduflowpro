'use client';

import React, { useState, useEffect } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  GraduationCap,
  X,
  LogIn,
  KeyRound,
  User,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalInitialRole,
    loginTeacher,
    loginStudent,
    state,
  } = useEduFlow();

  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setRole(authModalInitialRole);
      setUsername('');
      setPassword('');
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'teacher') {
      loginTeacher(username, password);
    } else {
      loginStudent(username, password);
    }
  };

  const handleQuickDemo = (roleType: 'teacher' | 'student', u: string, p: string) => {
    setRole(roleType);
    setUsername(u);
    setPassword(p);
    if (roleType === 'teacher') {
      loginTeacher(u, p);
    } else {
      loginStudent(u, p);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0d1424] border border-white/10 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Ambient Glow */}
        <div
          className={cn(
            'absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none',
            role === 'teacher' ? 'bg-emerald-500' : 'bg-blue-500'
          )}
        />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-purple-600 p-[1px] shadow-[0_0_30px_rgba(0,242,254,0.35)]">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[15px] flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-7 h-7 text-cyan-300" />
            </div>
          </div>
          <h3 className="font-heading font-bold text-2xl text-white">EduFlow Pro'ya Giriş</h3>
          <p className="text-xs text-slate-400 mt-1">Devam etmek için kullanıcı hesabınızı seçin</p>
        </div>

        {/* Role Switcher */}
        <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              role === 'teacher'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span>👨‍🏫 Öğretmen</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              role === 'student'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span>🎓 Öğrenci</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kullanıcı Adı</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'teacher' ? 'ogretmen' : 'ayse'}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Şifre</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className={cn(
              'w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all',
              role === 'teacher'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
            )}
          >
            <LogIn className="w-4 h-4" />
            <span>Giriş Yap</span>
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tek Tıkla Demo Girişi</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher', 'ogretmen', '1234')}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-left transition-all"
            >
              <div className="font-bold">Öğretmen Hesabı</div>
              <div className="text-[10px] text-emerald-400/70">ogretmen · 1234</div>
            </button>

            {state.students.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  handleQuickDemo(
                    'student',
                    state.students[0].username,
                    state.students[0].password || 'ayse123'
                  )
                }
                className="px-3 py-2 text-xs font-medium rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-left transition-all"
              >
                <div className="font-bold">{state.students[0].name.split(' ')[0]} (Öğrenci)</div>
                <div className="text-[10px] text-blue-400/70">
                  {state.students[0].username} · {state.students[0].password || '***'}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
