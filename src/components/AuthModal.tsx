'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { supabase } from '@/lib/supabase';
import {
  X,
  LogIn,
  UserPlus,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Standard Grade Level / Target Exam scale
export const GRADE_LEVEL_OPTIONS = [
  'Ortaokul (5-8. Sınıf / LGS Hazırlık)',
  'Lise (9-12. Sınıf / YKS Hazırlık - Sayısal)',
  'Lise (9-12. Sınıf / YKS Hazırlık - Eşit Ağırlık / Sözel)',
  'Lisans & Mezun (KPSS / ALES Hazırlık)',
  'Genel Gelişim / Dil Eğitimi',
];

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalInitialRole,
    closeAuthModal,
    loginSupabaseUser,
    showToast,
  } = useEduFlow();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'teacher' | 'student'>(authModalInitialRole || 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>(GRADE_LEVEL_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync role when modal opens with explicit role
  React.useEffect(() => {
    if (authModalInitialRole) {
      setRole(authModalInitialRole);
    }
  }, [authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(error.message || 'Giriş yapılamadı. E-posta ve şifrenizi kontrol ediniz.');
        } else if (data?.user) {
          const userMeta = data.user.user_metadata || {};
          const userRole = (userMeta.role as 'teacher' | 'student') || role;
          const userName = userMeta.name || data.user.email?.split('@')[0] || 'Kullanıcı';
          
          loginSupabaseUser({
            role: userRole,
            name: userName,
            email: data.user.email || '',
            supabaseId: data.user.id,
            gradeLevel: userMeta.grade_level || (userRole === 'student' ? gradeLevel : undefined),
          });
          showToast(`Hoş geldiniz, ${userName}! 👋`, 'success');
          closeAuthModal();
        }
      } else {
        if (!name.trim()) {
          setErrorMsg('Lütfen adınızı ve soyadınızı giriniz.');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              role: role,
              grade_level: role === 'student' ? gradeLevel : undefined,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message || 'Kayıt işlemi tamamlanamadı.');
        } else if (data?.user) {
          loginSupabaseUser({
            role,
            name: name.trim(),
            email: email.trim(),
            supabaseId: data.user.id,
            gradeLevel: role === 'student' ? gradeLevel : undefined,
          });
          showToast('Hesabınız başarıyla oluşturuldu ve oturum açıldı!', 'success');
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Beklenmedik bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
      <div className="bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[95vh] overflow-y-auto flex flex-col shadow-2xl touch-scroll">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-lg text-slate-950 flex items-center gap-1.5">
                <span>Deskio</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-extrabold">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                {mode === 'login' ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Mode Switcher Tabs (Giriş Yap vs Kayıt Ol) */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[40px] active:scale-95',
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              )}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[40px] active:scale-95',
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              )}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Role Selector Tabs (Öğretmen vs Öğrenci) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Kullanıcı Rolü
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={cn(
                  'p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] active:scale-95',
                  role === 'teacher'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                )}
              >
                <span>👨‍🏫 Öğretmen</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={cn(
                  'p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] active:scale-95',
                  role === 'student'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                )}
              >
                <span>🎓 Öğrenci</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            )}

            {/* If Student & Signup: Grade Level Selector */}
            {mode === 'signup' && role === 'student' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Eğitim Seviyesi & Hedef Sınav
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none min-h-[44px]"
                  >
                    {GRADE_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  Yapay zeka asistanı ve testler bu seviyeye göre kişiselleştirilir.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@okul.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[48px] active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Lütfen Bekleyiniz...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Hesabı Oluştur & Başla</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
