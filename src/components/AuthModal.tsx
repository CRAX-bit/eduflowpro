'use client';

import React, { useState, useEffect } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { supabase } from '@/lib/supabase';
import {
  GraduationCap,
  X,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  User,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalInitialRole,
    setActiveTab,
    showToast,
    state,
  } = useEduFlow();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setRole(authModalInitialRole);
      setEmail('');
      setPassword('');
      setFullName('');
      setMode('signin');
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      showToast('Lütfen e-posta ve şifre giriniz.', 'warn');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          showToast('Lütfen ad ve soyadınızı giriniz.', 'warn');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role,
            },
          },
        });

        if (error) {
          showToast(`Kayıt hatası: ${error.message}`, 'error');
          setLoading(false);
          return;
        }

        showToast('Kayıt başarılı! Giriş yapılıyor...', 'success');

        // Automatically activate session in EduFlow context
        if (role === 'teacher') {
          setActiveTab('teacher');
        } else {
          setActiveTab('student');
        }
        closeAuthModal();
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (error) {
          // If Supabase auth fails, provide graceful notification
          showToast(`Giriş başarısız: ${error.message}`, 'error');
          setLoading(false);
          return;
        }

        const userRole = (data.user?.user_metadata?.role as 'teacher' | 'student') || role;
        const userName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Kullanıcı';

        showToast(`Hoş geldiniz, ${userName}! 👋`, 'success');
        if (userRole === 'teacher') {
          setActiveTab('teacher');
        } else {
          setActiveTab('student');
        }
        closeAuthModal();
      }
    } catch (err: any) {
      showToast(`Bir hata oluştu: ${err.message || 'Lütfen tekrar deneyin.'}`, 'error');
    } finally {
      setLoading(false);
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
            'absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all',
            role === 'teacher' ? 'bg-emerald-500' : 'bg-blue-500'
          )}
        />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
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
          <h3 className="font-heading font-bold text-2xl text-white">
            {mode === 'signin' ? "EduFlow Pro'ya Giriş" : 'EduFlow Pro Hesabı Oluştur'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Hesabınıza erişmek için bilgilerinizi giriniz'
              : 'Ücretsiz hesabınızı saniyeler içinde oluşturun'}
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              role === 'teacher'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span>👨‍🏫 Öğretmen</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              role === 'student'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span>🎓 Öğrenci</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="animate-fade">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ad Soyad</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>E-posta Adresi</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@eduflow.com"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Şifre</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-2',
              role === 'teacher'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>
              {loading
                ? 'İşlem yapılıyor...'
                : mode === 'signin'
                ? 'Giriş Yap'
                : 'Hesap Oluştur'}
            </span>
          </button>
        </form>

        {/* Mode Toggle (Sign In <-> Sign Up) */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-400">
              Henüz bir hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1"
              >
                Kayıt Ol
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Zaten bir hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1"
              >
                Giriş Yap
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
