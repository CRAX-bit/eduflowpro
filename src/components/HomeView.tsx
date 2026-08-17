'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  School,
  TrendingUp,
  KeyRound,
  ShieldCheck,
  FileCheck,
  Compass,
  Zap,
  Lock,
  BookOpen,
  Check,
  Layers,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomeView() {
  const { state, openAuthModal, setActiveTab } = useEduFlow();
  const [activeDemoTab, setActiveDemoTab] = useState<'essay' | 'quiz'>('essay');

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
    <div className="space-y-24 sm:space-y-32 animate-fade pb-16">
      {/* 1. HERO SECTION (Resend / Linear Minimalist SaaS Aesthetic) */}
      <section className="text-center pt-6 sm:pt-14 pb-4 relative space-y-8 max-w-5xl mx-auto">
        {/* Subtle Radial Glow Beam */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm backdrop-blur-md hover:border-zinc-700 transition-colors">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Beta 2.4
          </span>
          <span className="text-zinc-500">|</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <span>Yeni Nesil Özel Ders & Sınıf Ekosistemi</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </span>
        </div>

        {/* High-Contrast Bold Headline */}
        <div className="space-y-5 max-w-4xl mx-auto">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.12]">
            Öğretmenler için Akıllı Asistan,{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              Öğrenciler için Kusursuz Pratik
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Müfredata uyumlu testler hazırlayın, yapay zeka destekli rubrik analiziyle dakikalar içinde değerlendirin ve öğrencilerinize 7/24 yaşayan kişisel bir öğrenme alanı sunun.
          </p>
        </div>

        {/* Primary CTA Group */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={handleTeacherClick}
            className="flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>👨‍🏫 Öğretmen Olarak Başla</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" />
          </button>

          <button
            onClick={handleStudentClick}
            className="flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>🎓 Öğrenci Portalı</span>
          </button>
        </div>

        {/* Subtle Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-zinc-400 font-normal">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kredi Kartı Gerekmez</span>
          </span>
          <span className="text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>%100 Öğretmen Kontrolü</span>
          </span>
          <span className="text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>KVKK Uyumlu Altyapı</span>
          </span>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE SHOWCASE CARD (Resend / Linear Showcase Box Style) */}
      <section className="max-w-5xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl bg-[#0b0c10] border border-zinc-800/80 shadow-[0_20px_70px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-2xl">
          {/* Top Window Chrome Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-zinc-950/90 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              </div>
              <div className="h-4 w-px bg-zinc-800" />
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>eduflow-ai-evaluator</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-300">rubric-engine.tsx</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Canlı Değerlendirme Modu</span>
              </span>
            </div>
          </div>

          {/* Split View Body (Student Writing vs AI Rubric Analysis) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
            {/* Left: Student Submission (5 Kolon) */}
            <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-[#090a0e]">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">
                    ZK
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Zeynep Kaya</div>
                    <div className="text-[11px] text-zinc-400">10-A Biyoloji Şubesi · Ödev #14</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800/60 text-zinc-300 border border-zinc-700/50">
                  Teslim Edildi
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Konu: Fotosentez Işık Reaksiyonları</span>
                  <span>142 Kelime</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/70 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans space-y-2">
                  <p>
                    &ldquo;Fotosentezin ışığa bağımlı reaksiyonları kloroplastın <strong className="text-emerald-300">tilakoit zarlarında</strong> gerçekleşir. Işık fotonları klorofil pigmentlerini uyararak elektron taşıma sistemini (ETS) aktive eder.
                  </p>
                  <p>
                    Suyun fotolizi ile açığa çıkan elektronlar ETS&apos;den aktarılırken proton gradyanı oluşur ve ATP sentaz enzimi aracılığıyla <strong className="text-cyan-300">ATP ile NADPH</strong> sentezlenir. Bu ürünler daha sonra stromadaki Calvin döngüsüne aktarılır.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Sınıf: 10-A Fen Grubu</span>
                </span>
                <span className="font-mono text-[11px] text-emerald-400/80">Kod: BIO-10A</span>
              </div>
            </div>

            {/* Right: AI Rubric Evaluation & Feedback (7 Kolon) */}
            <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-[#0b0d13]">
              {/* Score Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-xl text-emerald-400">95</span>
                    <span className="text-xs text-zinc-400 font-medium">/ 100</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AI Rubrik Analizi & Not Önerisi</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Öğretmen Onayına Hazır Taslak</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  A+ Mükemmel
                </span>
              </div>

              {/* Rubric Criteria Chips */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 mb-0.5">Terminoloji</div>
                  <div className="text-xs font-bold text-emerald-400">5 / 5 ✓</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 mb-0.5">Kavramsal Netlik</div>
                  <div className="text-xs font-bold text-emerald-400">5 / 5 ✓</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 mb-0.5">Örnek/Akış</div>
                  <div className="text-xs font-bold text-cyan-400">4.5 / 5</div>
                </div>
              </div>

              {/* Pedagogical Feedback Box */}
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs space-y-1.5">
                <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Öğretmen Geri Bildirim Önerisi:</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  &ldquo;Tebrikler Zeynep! Tilakoit zar ve stroma ayrımını çok net açıklamışsın. Suyun fotolizi ile ATP/NADPH üretim ilişkisini doğru kurman anlatımını zenginleştirmiş.&rdquo;
                </p>
              </div>

              {/* 1-Click Approve Button */}
              <button
                onClick={handleTeacherClick}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Öğretmen Olarak Taslağı Onayla & Gönder</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES (3 Kolonlu Modern SaaS Bento Kartları) */}
      <section className="space-y-10 max-w-5xl mx-auto">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
            Platform Yetenekleri
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Eğitim Süreçlerini Hızlandıran 3 Ana Sütun
          </h2>
          <p className="text-sm text-zinc-400">
            Öğretmenin tam kontrolünde, öğrencinin kendi hızında esnek çalışma ortamı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Bento Card 1: Hızlı Değerlendirme */}
          <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#0c0d12] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                  Hızlı Değerlendirme
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Öğretmenler için saatler süren manuel ödev okuma sürecini saniyelere indirin. Akıllı taslak notu tek tıkla onaylayın veya dilediğiniz gibi düzenleyin.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="text-emerald-400">%80 Zaman Tasarrufu</span>
              <span className="text-zinc-400">Manuel / AI Kontrolü</span>
            </div>
          </div>

          {/* Bento Card 2: İnteraktif AI Quiz */}
          <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#0c0d12] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  İnteraktif AI Quiz & Pratik
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Öğrenciler için anında geri bildirimli pratik alanı. Yanlış cevaplanan sorularda adım adım mantık anlatan rehber ve kişisel soru çözücü.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="text-cyan-400">7/24 Soru Koçu</span>
              <span className="text-zinc-400">Canlı Analiz</span>
            </div>
          </div>

          {/* Bento Card 3: Güvenli & KVKK Uyumlu */}
          <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#0c0d12] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                  %100 Güvenli & KVKK Uyumlu
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Öğrenci verileri izole tutulur, asla genel modellerin eğitimi için paylaşılmaz. Uçtan uca şifreli ve pedagojik güvenlik kurallarıyla korunan altyapı.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="text-indigo-400">KVKK & GDPR Hazır</span>
              <span className="text-zinc-400">İzole Veri</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION (3 Basit Adım) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            Sistematik İş Akışı
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            3 Kolay Adımda Başlayın
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="font-heading font-bold text-sm text-white">Sınıfını Aç & Kod Paylaş</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Öğretmen 6 haneli katılım kodunu üretir, öğrenciler tek tıkla şubeye dahil olur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="font-heading font-bold text-sm text-white">Ödev & Test Yayınla</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Müfredata uygun sorular veya ders özeti saniyeler içinde öğrencilere atanır.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h4 className="font-heading font-bold text-sm text-white">İncele & Geri Bildirim Ver</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI rubrik analizini gözden geçirin, tek tıkla onaylayarak yapıcı notu iletin.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM MINIMALIST CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 text-center space-y-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Eğitim Süreçlerinizi Kolaylaştırmaya Bugün Başlayın
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Öğretmenler için hazırlık ve okuma kolaylığı, öğrenciler için başarı odaklı çalışma deneyimi.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          <button
            onClick={handleTeacherClick}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            👨‍🏫 Öğretmen Olarak Başla
          </button>
          <button
            onClick={handleStudentClick}
            className="px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-xs sm:text-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            🎓 Öğrenci Portalı
          </button>
        </div>
      </section>
    </div>
  );
}
