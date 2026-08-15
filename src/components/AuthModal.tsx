'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REMEMBER_EMAIL_KEY = 'eduflow_remember_email';

function getTurkishAuthErrorMessage(error: any): string {
  const msg = error?.message?.toLowerCase() || '';
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
  }
  if (msg.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki (veya spam klasöründeki) onay bağlantısına tıklayın.';
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('already registered') ||
    msg.includes('user_already_exists')
  ) {
    return 'Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen giriş yapın.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.';
  }
  if (
    msg.includes('rate limit') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests')
  ) {
    return 'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyip tekrar deneyin.';
  }
  if (msg.includes('signup disabled') || msg.includes('signups not allowed')) {
    return 'Yeni kullanıcı kaydı şu anda geçici olarak kapalıdır.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin.';
  }
  return error?.message || 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.';
}

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalInitialRole,
    loginSupabaseUser,
    showToast,
    state,
  } = useEduFlow();

  const [mode, setMode] = useState<'signin' | 'signup' | 'verification_sent'>('signin');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email verification state
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and initialize form on modal open
  useEffect(() => {
    if (isAuthModalOpen) {
      setRole(authModalInitialRole);
      setEmail('');
      setPassword('');
      setFullName('');
      setShowPassword(false);
      setErrorMessage(null);
      setMode('signin');
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Resend Verification Email Action
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resendLoading || !submittedEmail) return;

    setResendLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: submittedEmail,
      });

      if (error) {
        const trError = getTurkishAuthErrorMessage(error);
        setErrorMessage(trError);
        showToast(trError, 'error');
        return;
      }

      setResendCooldown(60);
      showToast('Doğrulama bağlantısı e-posta adresinize tekrar gönderildi! ✉️', 'success');
    } catch (err: any) {
      const trError = getTurkishAuthErrorMessage(err);
      setErrorMessage(trError);
      showToast(trError, 'error');
    } finally {
      setResendLoading(false);
    }
  };

  // Switch back to Sign In
  const handleBackToSignIn = () => {
    setMode('signin');
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMessage(null);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Lütfen e-posta ve şifre alanlarını eksiksiz doldurunuz.');
      showToast('Lütfen tüm zorunlu alanları doldurunuz.', 'warn');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const cleanName = fullName.trim();
        if (!cleanName) {
          setErrorMessage('Lütfen ad ve soyadınızı giriniz.');
          showToast('Ad ve soyad alanı zorunludur.', 'warn');
          setLoading(false);
          return;
        }

        if (cleanPass.length < 6) {
          setErrorMessage('Şifreniz en az 6 karakter uzunluğunda olmalıdır.');
          showToast('Şifreniz en az 6 karakter olmalıdır.', 'warn');
          setLoading(false);
          return;
        }

        // 1. Supabase Sign Up with exact metadata transfer
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: cleanName,
              role: role, // 'teacher' | 'student'
            },
          },
        });

        if (error) {
          const trError = getTurkishAuthErrorMessage(error);
          setErrorMessage(trError);
          showToast(`Kayıt hatası: ${trError}`, 'error');
          setLoading(false);
          return;
        }

        // If session exists immediately
        if (data.session && data.user) {
          loginSupabaseUser({
            role: role,
            name: cleanName,
            email: cleanEmail,
            supabaseId: data.user.id,
          });
          return;
        }

        // 2. Email confirmation is pending
        setSubmittedEmail(cleanEmail);
        setMode('verification_sent');
        setResendCooldown(60);
        showToast('Kayıt başarılı! Doğrulama e-postası gönderildi. ✉️', 'success');
      } else {
        // Sign In Flow with Strict Role Guard

        // 1. Check if student credentials match a teacher-created classroom account
        const matchedStudent = state.students.find(
          (s) =>
            (s.username.toLowerCase() === cleanEmail.toLowerCase() ||
              s.name.toLowerCase() === cleanEmail.toLowerCase()) &&
            s.password === cleanPass
        );

        if (matchedStudent) {
          if (role !== 'student') {
            const mismatchMsg = '⚠️ Bu hesap bir Öğrenci hesabıdır. Lütfen Öğrenci Girişi sekmesini kullanın.';
            setErrorMessage(mismatchMsg);
            showToast(mismatchMsg, 'warn');
            setPassword('');
            setLoading(false);
            return;
          }

          loginSupabaseUser({
            role: 'student',
            name: matchedStudent.name,
            email: cleanEmail.includes('@') ? cleanEmail : `${matchedStudent.username}@eduflow.pro`,
            supabaseId: matchedStudent.id,
          });
          return;
        }

        // 2. Standard Supabase Sign In with Email & Password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (error) {
          const trError = getTurkishAuthErrorMessage(error);
          setErrorMessage(trError);
          showToast(`Giriş başarısız: ${trError}`, 'error');
          setLoading(false);
          return;
        }

        if (data.user) {
          let actualRole: 'teacher' | 'student' =
            (data.user.user_metadata?.role as 'teacher' | 'student') || 'student';
          let userFullName: string = data.user.user_metadata?.full_name || '';

          // Fetch verified role from profiles table
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, full_name')
              .eq('id', data.user.id)
              .single();

            if (profile?.role) {
              actualRole = profile.role as 'teacher' | 'student';
            }
            if (profile?.full_name) {
              userFullName = profile.full_name;
            }
          } catch (e) {
            // fallback to user_metadata
          }

          // Strict Role Guard Check
          if (role === 'student' && actualRole === 'teacher') {
            await supabase.auth.signOut();
            setPassword('');
            const mismatchMsg = '⚠️ Bu hesap bir Öğretmen hesabıdır. Lütfen Öğretmen Girişi sekmesini kullanın.';
            setErrorMessage(mismatchMsg);
            showToast(mismatchMsg, 'warn');
            setLoading(false);
            return;
          }

          if (role === 'teacher' && actualRole === 'student') {
            await supabase.auth.signOut();
            setPassword('');
            const mismatchMsg = '⚠️ Bu hesap bir Öğrenci hesabıdır. Lütfen Öğrenci Girişi sekmesini kullanın.';
            setErrorMessage(mismatchMsg);
            showToast(mismatchMsg, 'warn');
            setLoading(false);
            return;
          }

          const userName =
            userFullName ||
            data.user.email?.split('@')[0] ||
            (actualRole === 'teacher' ? 'Öğretmen' : 'Öğrenci');

          loginSupabaseUser({
            role: actualRole,
            name: userName,
            email: data.user.email || cleanEmail,
            supabaseId: data.user.id,
          });
        }
      }
    } catch (err: any) {
      const trError = getTurkishAuthErrorMessage(err);
      setErrorMessage(trError);
      showToast(`Bir hata oluştu: ${trError}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0d1424] border border-white/10 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all"
      >
        {/* Ambient Radial Glow */}
        <div
          className={cn(
            'absolute -top-24 -left-24 w-52 h-52 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700',
            role === 'teacher' ? 'bg-emerald-500' : 'bg-blue-500'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-24 -right-24 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700',
            mode === 'verification_sent' ? 'bg-cyan-400' : 'bg-purple-600'
          )}
        />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          type="button"
          aria-label="Kapat"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ==================================================================== */}
        {/* SCREEN 1: VERIFICATION EMAIL SENT NOTICE SCREEN                      */}
        {/* ==================================================================== */}
        {mode === 'verification_sent' ? (
          <div className="text-center py-2 space-y-6 animate-fade">
            {/* Animated Email Envelope Badge */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              {/* Outer pulsing wave */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 animate-ping opacity-30" />
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 opacity-60 blur-md animate-pulse" />

              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0e1b30] to-[#0a1020] border border-cyan-400/40 flex items-center justify-center shadow-[0_0_35px_rgba(0,242,254,0.35)]">
                <Mail className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]" />
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0d1424] flex items-center justify-center text-white shadow-lg">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Hesap Aktivasyonu Gerekli</span>
              </div>

              <h3 id="auth-modal-title" className="font-heading font-extrabold text-2xl text-white tracking-tight">
                Doğrulama E-postası Gönderildi!
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
                <span className="inline-block px-2.5 py-1 my-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-medium text-xs break-all">
                  {submittedEmail}
                </span>{' '}
                adresine bir onay bağlantısı gönderdik. Hesabınızı aktifleştirmek için lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
              </p>
            </div>

            {/* Security Callout Box */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                E-postadaki bağlantıya tıkladıktan sonra hesabınız anında aktif hale gelecek ve doğrudan sisteme giriş yapabileceksiniz.
              </p>
            </div>

            {/* Error Message if Resend Fails */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 text-left animate-fade">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:shadow-[0_0_35px_rgba(0,242,254,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Ekranına Dön</span>
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || resendLoading}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className={cn('w-3.5 h-3.5 text-cyan-400', resendLoading && 'animate-spin')} />
                <span>
                  {resendLoading
                    ? 'E-posta Gönderiliyor...'
                    : resendCooldown > 0
                    ? `Tekrar Gönder (${resendCooldown}s)`
                    : 'Doğrulama E-postasını Tekrar Gönder'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* SCREEN 2: SIGN IN & SIGN UP FORMS                                   */
          /* ==================================================================== */
          <>
            {/* Logo & Header */}
            <div className="text-center mb-5">
              <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-purple-600 p-[1px] shadow-[0_0_28px_rgba(0,242,254,0.35)]">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[15px] flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <h3 id="auth-modal-title" className="font-heading font-bold text-xl sm:text-2xl text-white">
                {mode === 'signin' ? "EduFlow Pro'ya Giriş" : 'EduFlow Pro Hesabı Oluştur'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'signin'
                  ? 'Kurumsal hesabınıza erişmek için bilgilerinizi giriniz'
                  : 'Öğretmen veya öğrenci hesabınızı saniyeler içinde oluşturun'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Hesap Rolü</span>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Zorunlu</span>
              </div>
              <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setRole('teacher');
                    setEmail('');
                    setPassword('');
                    setFullName('');
                    setErrorMessage(null);
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                    role === 'teacher'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <span>👨‍🏫 Öğretmen</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setRole('student');
                    setEmail('');
                    setPassword('');
                    setFullName('');
                    setErrorMessage(null);
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                    role === 'student'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <span>🎓 Öğrenci</span>
                </button>
              </div>
            </div>

            {/* Inline Error Alert Box */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fade">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form with Autofill Blocking */}
            <form onSubmit={handleSubmit} method="POST" action="#" autoComplete="off" className="space-y-3.5">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div className="animate-fade">
                  <label
                    htmlFor="auth-fullname"
                    className="text-xs font-medium text-slate-300 mb-1 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ad Soyad</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">* Zorunlu</span>
                  </label>
                  <input
                    id="auth-fullname"
                    name="eduflow_reg_fullname_field"
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    required
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={role === 'teacher' ? 'Örn: Ahmet Yılmaz' : 'Örn: Zeynep Kaya'}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Email / Username Input */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="text-xs font-medium text-slate-300 mb-1 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{mode === 'signup' ? 'E-posta Adresi' : 'E-posta veya Kullanıcı Adı'}</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">* Zorunlu</span>
                </label>
                <input
                  id="auth-email"
                  name={mode === 'signup' ? 'eduflow_reg_email_field' : 'eduflow_auth_identity_field'}
                  type={mode === 'signup' ? 'email' : 'text'}
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={
                    mode === 'signup'
                      ? 'ornek@eduflow.com'
                      : role === 'teacher'
                      ? 'ornek@eduflow.com veya ogretmen'
                      : 'ornek@eduflow.com veya ayse'
                  }
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label
                  htmlFor="auth-password"
                  className="text-xs font-medium text-slate-300 mb-1 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Şifre</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">* Zorunlu</span>
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    name={mode === 'signup' ? 'eduflow_reg_secret_field' : 'eduflow_auth_secret_field'}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    required
                    disabled={loading}
                    minLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox (Sign In only) */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      name="remember"
                      disabled={loading}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-4 h-4 rounded-md border flex items-center justify-center transition-all',
                        rememberMe
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.5)]'
                          : 'border-white/20 bg-white/[0.03] group-hover:border-white/40',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                      Beni Hatırla
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    {role === 'teacher' ? 'Öğretmen Hesabı' : 'Öğrenci Hesabı'}
                  </span>
                </div>
              )}

              {/* Submit Button with Loading Spinner */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2',
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
                    ? mode === 'signin'
                      ? 'Giriş yapılıyor...'
                      : 'Hesap oluşturuluyor...'
                    : mode === 'signin'
                    ? 'Giriş Yap'
                    : 'Hesap Oluştur'}
                </span>
              </button>
            </form>

            {/* Mode Switch (Sign In <-> Sign Up) */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] text-center">
              {mode === 'signin' ? (
                <p className="text-xs text-slate-400">
                  Henüz bir hesabınız yok mu?{' '}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setMode('signup');
                      setEmail('');
                      setPassword('');
                      setFullName('');
                      setErrorMessage(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1 disabled:opacity-50"
                  >
                    Kayıt Ol
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Zaten bir hesabınız var mı?{' '}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setMode('signin');
                      setEmail('');
                      setPassword('');
                      setFullName('');
                      setErrorMessage(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1 disabled:opacity-50"
                  >
                    Giriş Yap
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
