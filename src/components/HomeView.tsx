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
  BookOpen,
  FileCheck2,
  CheckCircle2,
  Camera,
  GraduationCap,
} from 'lucide-react';

export function HomeView() {
  const { state, openAuthModal, setActiveTab } = useEduFlow();

  // Calculate live dynamic statistics
  const assignments = state.assignments;
  let doneCount = 0;
  let photoCount = 0;
  let totalPercentSum = 0;
  let testSubCount = 0;

  assignments.forEach((a) => {
    Object.values(a.submissions || {}).forEach((s) => {
      if (a.type === 'test' && s.percent !== undefined) {
        doneCount++;
        totalPercentSum += s.percent;
        testSubCount++;
      } else if (a.type === 'book' && s.photo) {
        doneCount++;
        photoCount++;
      }
    });
  });

  const avgAccuracy = testSubCount > 0 ? Math.round(totalPercentSum / testSubCount) : 0;

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

      {/* AI Superpowers Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 border border-cyan-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Google Gemini Pro Entegrasyonu</span>
            </div>
            <h3 className="font-heading font-bold text-2xl text-white">
              Yapay Zeka ile Ders İçeriklerini Saniyeler İçinde Üretin
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Öğretmenler için tek tıkla test ve konu anlatımı oluşturucu; öğrenciler için adım adım soru çözüm asistanı.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-cyan-400 font-bold text-sm">🤖 Test Üretici</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Konu & soru adedi girin</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-purple-400 font-bold text-sm">📝 Not Hazırlayıcı</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zengin konu özetleri</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-emerald-400 font-bold text-sm">💡 Soru Çözücü</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Öğrenciye anında açıklama</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reactive Statistics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {assignments.length}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">Yüklenen İçerik</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {doneCount}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">Tamamlanan Ödev</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            %{avgAccuracy}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">Ortalama Doğruluk</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {photoCount}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">Teslim Edilen Fotoğraf</div>
        </div>
      </section>
    </div>
  );
}
