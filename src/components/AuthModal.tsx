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
  Check,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REMEMBER_EMAIL_KEY = 'eduflow_remember_email';

function getTurkishAuthErrorMessage(error: any): string {
  const msg = error?.message?.toLowerCase() || '';
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
  }
  if (msg.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki onay bağlantısına tıklayın.';
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
  } = useEduFlow();

  const [mode, setMode] = useState<'signin' | 'signup' | 'verification_sent' | 'forgot_password' | 'reset_sent'>('signin');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Ortaokul (5-8. Sınıf / LGS Hazırlık)');
  const [teacherBranch, setTeacherBranch] = useState('Matematik');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email verification & reset state
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
      setGradeLevel('Ortaokul (5-8. Sınıf / LGS Hazırlık)');
      setTeacherBranch('Matematik');
      setShowPassword(false);
      setAcceptedTerms(false);
      setErrorMessage(null);
      setMode('signin');

      try {
        const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        // non-blocking
      }
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Cooldown countdown timer for resend email
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        const trError = getTurkishAuthErrorMessage(error);
        setErrorMessage(trError);
        showToast(trError, 'error');
      } else {
        setSubmittedEmail(cleanEmail);
        setMode('reset_sent');
        showToast('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! ✉️', 'success');
      }
    } catch (err: any) {
      const trError = getTurkishAuthErrorMessage(err);
      setErrorMessage(trError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !submittedEmail) return;
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
      } else {
        setResendCooldown(60);
        showToast('Doğrulama e-postası tekrar gönderildi. ✉️', 'success');
      }
    } catch (err: any) {
      const trError = getTurkishAuthErrorMessage(err);
      setErrorMessage(trError);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    setErrorMessage(null);
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Lütfen şifrenizi giriniz.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMessage('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (mode === 'signup') {
      if (!cleanName) {
        setErrorMessage('Lütfen adınızı ve soyadınızı giriniz.');
        return;
      }
      if (!acceptedTerms) {
        setErrorMessage('Devam etmek için Kullanım Koşulları ve KVKK metnini onaylamanız gerekmektedir.');
        return;
      }
    }

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, cleanEmail);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch (e) {
      // ignore
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: cleanName,
              role: role,
              grade_level: role === 'student' ? gradeLevel : undefined,
              branch: role === 'teacher' ? teacherBranch : undefined,
            },
          },
        });

        if (error) {
          const trError = getTurkishAuthErrorMessage(error);
          setErrorMessage(trError);
          showToast(`Kayıt başarısız: ${trError}`, 'error');
          setLoading(false);
          return;
        }

        if (data.user?.id) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: cleanName,
              role: role,
              email: cleanEmail,
              grade_level: role === 'student' ? gradeLevel : null,
              branch: role === 'teacher' ? teacherBranch : null,
              updated_at: new Date().toISOString(),
            });
          } catch (e) {
            // non-blocking
          }
        }

        if (data.session && data.user) {
          loginSupabaseUser({
            role: role,
            name: cleanName,
            email: cleanEmail,
            supabaseId: data.user.id,
            gradeLevel: role === 'student' ? gradeLevel : undefined,
            branch: role === 'teacher' ? teacherBranch : undefined,
          });
          return;
        }

        setSubmittedEmail(cleanEmail);
        setMode('verification_sent');
        setResendCooldown(60);
        showToast('Kayıt başarılı! Doğrulama e-postası gönderildi. ✉️', 'success');
      } else {
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
          let userGradeLevel: string | undefined = data.user.user_metadata?.grade_level;
          let userBranch: string | undefined = data.user.user_metadata?.branch;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, full_name, grade_level, branch')
              .eq('id', data.user.id)
              .single();

            if (profile?.role) actualRole = profile.role as 'teacher' | 'student';
            if (profile?.full_name) userFullName = profile.full_name;
            if (profile?.grade_level) userGradeLevel = profile.grade_level;
            if (profile?.branch) userBranch = profile.branch;
          } catch (e) {
            // fallback
          }

          if (role === 'student' && actualRole === 'teacher') {
            await supabase.auth.signOut();
            setPassword('');
            const mismatchMsg = '⚠️ Bu hesap bir Öğretmen hesabıdır. Lütfen Öğretmen Girişi sekmesini seçin.';
            setErrorMessage(mismatchMsg);
            showToast(mismatchMsg, 'warn');
            setLoading(false);
            return;
          }

          if (role === 'teacher' && actualRole === 'student') {
            await supabase.auth.signOut();
            setPassword('');
            const mismatchMsg = '⚠️ Bu hesap bir Öğrenci hesabıdır. Lütfen Öğrenci Girişi sekmesini seçin.';
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
            gradeLevel: userGradeLevel,
            branch: userBranch,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden transition-all"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          type="button"
          aria-label="Kapat"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SCREEN 1: VERIFICATION EMAIL SENT NOTICE */}
        {mode === 'verification_sent' && (
          <div className="text-center py-2 space-y-5 animate-fade">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Hesap Aktivasyonu Gerekli</span>
              </div>

              <h3 id="auth-modal-title" className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                Doğrulama E-postası Gönderildi
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
                <span className="inline-block px-2.5 py-1 my-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-medium text-xs break-all">
                  {submittedEmail}
                </span>{' '}
                adresine bir onay bağlantısı ilettik. Hesabınızı aktifleştirmek için gelen kutunuzu kontrol edin.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                E-postadaki bağlantıya tıkladıktan sonra hesabınız hemen aktif hale gelecektir.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left animate-fade">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Ekranına Dön</span>
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || resendLoading}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={cn('w-3.5 h-3.5 text-slate-500', resendLoading && 'animate-spin')} />
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
        )}

        {/* SCREEN 3: FORGOT PASSWORD */}
        {mode === 'forgot_password' && (
          <div className="space-y-5 animate-fade">
            <div className="text-center space-y-1.5">
              <div className="w-11 h-11 mx-auto mb-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Key className="w-5 h-5" />
              </div>
              <h3 id="auth-modal-title" className="font-heading font-bold text-xl text-slate-900 tracking-tight">
                Şifremi Unuttum
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hesabınıza kayıtlı e-posta adresinizi giriniz. Size şifre sıfırlama bağlantısı ileteceğiz.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-posta Adresi
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="ornek@mail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Bağlantı Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-white" />
                    <span>Sıfırlama Bağlantısı Gönder</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Giriş Ekranına Dön</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: PASSWORD RESET SENT */}
        {mode === 'reset_sent' && (
          <div className="text-center py-2 space-y-5 animate-fade">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Bağlantı Gönderildi</span>
              </div>

              <h3 id="auth-modal-title" className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                Şifre Sıfırlama E-postası
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
                <span className="inline-block px-2.5 py-1 my-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-medium text-xs break-all">
                  {submittedEmail}
                </span>{' '}
                adresine şifrenizi yenilemeniz için bir bağlantı gönderdik. Lütfen gelen kutunuzu kontrol edin.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackToSignIn}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Ekranına Dön</span>
            </button>
          </div>
        )}

        {/* SCREEN 2: SIGN IN & SIGN UP FORMS */}
        {(mode === 'signin' || mode === 'signup') && (
          <>
            {/* Header */}
            <div className="text-center mb-5 space-y-1.5">
              <div className="w-11 h-11 mx-auto mb-2 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 id="auth-modal-title" className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                {mode === 'signin' ? 'EduFlow Pro Giriş' : 'Yeni Hesap Oluştur'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'signin'
                  ? 'Çalışma alanınıza erişmek için bilgilerinizi giriniz'
                  : 'Öğretmen veya öğrenci hesabınızı saniyeler içinde açın'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="mb-4">
              <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
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
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50',
                    role === 'teacher'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  )}
                >
                  <span>👨‍🏫 Öğretmen Girişi</span>
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
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50',
                    role === 'student'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  )}
                >
                  <span>🎓 Öğrenci Girişi</span>
                </button>
              </div>
            </div>

            {/* Inline Error Alert Box */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} method="POST" action="#" autoComplete="off" className="space-y-3">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div className="animate-fade">
                  <label
                    htmlFor="auth-fullname"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Ad Soyad
                  </label>
                  <input
                    id="auth-fullname"
                    name="eduflow_reg_fullname_field"
                    type="text"
                    autoComplete="off"
                    required
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={role === 'teacher' ? 'Örn: Ahmet Yılmaz' : 'Örn: Zeynep Kaya'}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>
              )}

              {/* Email Address Input */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  E-posta Adresi
                </label>
                <input
                  id="auth-email"
                  name={mode === 'signup' ? 'eduflow_reg_email_field' : 'eduflow_auth_identity_field'}
                  type="email"
                  autoComplete="off"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="ornek@mail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Şifre
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                    >
                      Şifremi unuttum?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    name={mode === 'signup' ? 'eduflow_reg_secret_field' : 'eduflow_auth_secret_field'}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    minLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 pr-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Education Level (Student) Dropdown */}
              {mode === 'signup' && role === 'student' && (
                <div className="space-y-1 animate-fade">
                  <label
                    htmlFor="auth-grade-level"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Eğitim Seviyesi / Hedef Sınav <span className="text-blue-600">*</span>
                  </label>
                  <select
                    id="auth-grade-level"
                    disabled={loading}
                    value={gradeLevel}
                    onChange={(e) => {
                      setGradeLevel(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Ortaokul (5-8. Sınıf / LGS Hazırlık)">
                      Ortaokul (5-8. Sınıf / LGS Hazırlık)
                    </option>
                    <option value="Lise (9-12. Sınıf / YKS Hazırlık - Sayısal)">
                      Lise (9-12. Sınıf / YKS Hazırlık - Sayısal)
                    </option>
                    <option value="Lise (9-12. Sınıf / YKS Hazırlık - Eşit Ağırlık / Sözel)">
                      Lise (9-12. Sınıf / YKS Hazırlık - Eşit Ağırlık / Sözel)
                    </option>
                    <option value="Lisans & Mezun (KPSS / ALES Hazırlık)">
                      Lisans & Mezun (KPSS / ALES Hazırlık)
                    </option>
                    <option value="Genel Gelişim / Dil Eğitimi">
                      Genel Gelişim / Dil Eğitimi
                    </option>
                  </select>
                </div>
              )}

              {/* Teacher Branch Dropdown */}
              {mode === 'signup' && role === 'teacher' && (
                <div className="space-y-1 animate-fade">
                  <label
                    htmlFor="auth-teacher-branch"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Branş / Uzmanlık Alanı
                  </label>
                  <select
                    id="auth-teacher-branch"
                    disabled={loading}
                    value={teacherBranch}
                    onChange={(e) => {
                      setTeacherBranch(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Matematik">Matematik</option>
                    <option value="Fen Bilimleri / Biyoloji">Fen Bilimleri / Biyoloji</option>
                    <option value="Fizik / Kimya">Fizik / Kimya</option>
                    <option value="Türkçe / Türk Dili ve Edebiyatı">Türkçe / Türk Dili ve Edebiyatı</option>
                    <option value="İngilizce / Yabancı Dil">İngilizce / Yabancı Dil</option>
                    <option value="Sosyal Bilgiler / Tarih / Coğrafya">Sosyal Bilgiler / Tarih / Coğrafya</option>
                    <option value="Rehberlik / Özel Eğitim / Diğer">Rehberlik / Özel Eğitim / Diğer</option>
                  </select>
                </div>
              )}

              {/* Remember Me Checkbox */}
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
                        'w-4 h-4 rounded border flex items-center justify-center transition-all',
                        rememberMe
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'border-slate-300 bg-white group-hover:border-blue-400',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                      Beni Hatırla
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {role === 'teacher' ? 'Öğretmen Hesabı' : 'Öğrenci Hesabı'}
                  </span>
                </div>
              )}

              {/* Terms Checkbox */}
              {mode === 'signup' && (
                <div className="pt-1.5 animate-fade">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      name="eduflow_terms_consent"
                      disabled={loading}
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0',
                        acceptedTerms
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'border-slate-300 bg-white group-hover:border-blue-400',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {acceptedTerms && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                      <a
                        href="/kullanim-kosullari"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Kullanım Koşulları&apos;nı
                      </a>{' '}
                      ve{' '}
                      <a
                        href="/gizlilik-politikasi"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        KVKK Aydınlatma Metni&apos;ni
                      </a>{' '}
                      okudum, onaylıyorum.
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
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
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              {mode === 'signin' ? (
                <p className="text-xs text-slate-500">
                  Henüz bir hesabınız yok mu?{' '}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setMode('signup');
                      setEmail('');
                      setPassword('');
                      setFullName('');
                      setAcceptedTerms(false);
                      setErrorMessage(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer ml-1 disabled:opacity-50"
                  >
                    Kayıt Ol
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Zaten bir hesabınız var mı?{' '}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setMode('signin');
                      setEmail('');
                      setPassword('');
                      setFullName('');
                      setAcceptedTerms(false);
                      setErrorMessage(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer ml-1 disabled:opacity-50"
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
