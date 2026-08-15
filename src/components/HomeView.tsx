'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  Sparkles,
  Users,
  Timer,
  MessageSquareQuote,
  FileSpreadsheet,
  ArrowRight,
  BrainCircuit,
  FileQuestion,
  BookOpen,
  HelpCircle,
  Zap,
} from 'lucide-react';

export function HomeView() {
  const { state, openAuthModal, setActiveTab } = useEduFlow();

  const handleTeacherClick = () => {
    if (state.session?.role === 'teacher') {
      setActiveTab('teacher');
    } else {
      openAuthModal('teacher');
    }
  };

  const handleStudentClick = () => {
    if (state.session?.role === 'student') {
      setActiveTab('student');
    } else {
      openAuthModal('student');
    }
  };

  return (
    <div className="space-y-16 animate-fade">
      {/* Hero Section */}
      <section className="text-center pt-8 sm:pt-14 pb-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 mb-6 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Türkiye'nin En Dinamik Özel Ders Platformu + Gemini Pro AI</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none text-white">
          Özel Ders Takibinde Kaosu Bitirin,{' '}
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            Başarıyı Ölçün.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Ders notları, interaktif testler, fotoğraflı ödev teslimi ve yapay zeka destekli soru çözümlerini tek çatı altında toplayın.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={handleTeacherClick}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm sm:text-base shadow-[0_6px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all cursor-pointer"
          >
            <span>👨‍🏫 Öğretmen Girişi</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleStudentClick}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-sm sm:text-base shadow-[0_6px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_10px_45px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all cursor-pointer"
          >
            <span>🎓 Öğrenci Girişi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-slate-400 font-sans">
            Neden EduFlow Pro?
          </h2>
          <p className="font-heading text-xl sm:text-2xl font-bold text-white mt-1.5">
            Öğretmen ve Öğrenci İçin Kusursuz Deneyim
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="group p-6 rounded-2xl bg-white/[0.02] border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_15px_40px_rgba(0,242,254,0.15)] hover:-translate-y-1.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Güvenli Çoklu Giriş</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Her öğrenci kendi özel kullanıcı adı ve şifresiyle giriş yapar; yalnızca kendine ve sınıfa atanan ödevleri görür.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group p-6 rounded-2xl bg-white/[0.02] border border-purple-500/20 hover:border-purple-400/50 hover:shadow-[0_15px_40px_rgba(157,78,221,0.15)] hover:-translate-y-1.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-[0_0_20px_rgba(157,78,221,0.2)]">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Süreli İnteraktif Test</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Geri sayımlı zamanlayıcı ile gerçek sınav heyecanı. Süre dolunca otomatik teslim ve anında sonuç analizi.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group p-6 rounded-2xl bg-white/[0.02] border border-amber-500/20 hover:border-amber-400/50 hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Öğretmen & AI Yorumu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Teslim edilen test ve fotoğraflı ödevlere anında not düşün ya da Gemini AI ile tek tıkla pedagojik yorum oluşturun.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group p-6 rounded-2xl bg-white/[0.02] border border-rose-500/20 hover:border-rose-400/50 hover:shadow-[0_15px_40px_rgba(244,63,94,0.15)] hover:-translate-y-1.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Gelişim Karnesi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğrencinin tüm doğruluk oranlarını ve tamamladığı üniteleri tek tıkla şık, yazdırılabilir PDF karnesine dönüştürün.
            </p>
          </div>
        </div>
      </section>

      {/* Powered by Google Gemini Pro Section */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-cyan-950/40 border border-cyan-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(0,242,254,0.08)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold shadow-[0_0_16px_rgba(0,242,254,0.25)]">
              <Zap className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
              <span>⚡ Powered by Google Gemini Pro Altyapısı</span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              Ders Hazırlığında Saatler Harcamayın, Saniyeler İçinde Üretin.
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Google Gemini Pro motoru sayesinde müfredata tam uyumlu testler ve konu özetleri oluşturun; öğrencilerin takıldığı her soruyu 7/24 adım adım yapay zeka koçuyla çözün.
            </p>
          </div>

          {/* Three Feature Cards with click actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div
              onClick={handleTeacherClick}
              className="p-4 rounded-2xl bg-white/[0.04] border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FileQuestion className="w-5 h-5" />
              </div>
              <div className="text-cyan-300 font-bold text-sm">🤖 Test Üretici</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Konu & soru adediyle saniyeler içinde test oluşturun</div>
              <div className="text-[10px] text-cyan-400/80 font-semibold mt-2 group-hover:underline flex items-center justify-center gap-1">
                <span>Öğretmen Girişi</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div
              onClick={handleTeacherClick}
              className="p-4 rounded-2xl bg-white/[0.04] border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-purple-300 font-bold text-sm">📝 Not Hazırlayıcı</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Özet konu anlatımı ve formül tabloları çıkarın</div>
              <div className="text-[10px] text-purple-400/80 font-semibold mt-2 group-hover:underline flex items-center justify-center gap-1">
                <span>Öğretmen Girişi</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div
              onClick={handleStudentClick}
              className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-emerald-300 font-bold text-sm">💡 Soru Çözücü</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Takıldığınız soruları adım adım çözen 7/24 koç</div>
              <div className="text-[10px] text-emerald-400/80 font-semibold mt-2 group-hover:underline flex items-center justify-center gap-1">
                <span>Öğrenci Girişi</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Platform Statistics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center hover:border-cyan-500/30 transition-all">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            +10.000
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1.5">Çözülen İnteraktif Soru</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Süreli ve anlık analizli</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center hover:border-emerald-500/30 transition-all">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            %98
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1.5">Öğrenci Başarı Artışı</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ölçülebilir gelişim karnesi</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center hover:border-purple-500/30 transition-all">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            3 Kat
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1.5">Daha Hızlı Ders & Ödev Takibi</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Öğretmenler için tam kontrol</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center hover:border-amber-500/30 transition-all">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            7/24
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1.5">Gemini Pro Destekli Soru Çözümü</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Anında yapay zeka desteği</div>
        </div>
      </section>
    </div>
  );
}
