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
  BarChart3,
  Award,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-20 sm:space-y-28 animate-fade pb-16">
      {/* 1. HERO SECTION (Clean Airy EdTech SaaS Style) */}
      <section className="text-center pt-4 sm:pt-10 pb-2 relative space-y-7 max-w-5xl mx-auto">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-50/90 border border-blue-200/80 text-blue-800 shadow-xs hover:bg-blue-100/90 transition-colors">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            YENİ 2.5
          </span>
          <span className="text-blue-300">|</span>
          <span className="flex items-center gap-1 text-blue-900 font-semibold">
            <span>Yeni Nesil Özel Ders & Sınıf Yönetim Ekosistemi</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
          </span>
        </div>

        {/* High-Contrast Soft Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-slate-800 leading-[1.14]">
            Öğretmenler için Akıllı Asistan,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Öğrenciler için Kişisel Koç
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
            Müfredata uyumlu testler hazırlayın, yapay zeka destekli rubrik analiziyle saniyeler içinde değerlendirin ve öğrencilerinize 7/24 yaşayan kişisel bir öğrenme alanı sunun.
          </p>
        </div>

        {/* Primary CTA Group */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={handleTeacherClick}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>👨‍🏫 Öğretmen Olarak Başla</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={handleStudentClick}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>🎓 Öğrenci Portalı</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>%100 Öğretmen Kontrolü</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>KVKK & Kurumsal Güvenlik</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Google Gemini Pro AI Altyapısı</span>
          </span>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE SHOWCASE CARD (Clean Paper Window Style) */}
      <section className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden">
          {/* Top Window Chrome Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>eduflow-ai-evaluator</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700 font-semibold">rubric-engine.tsx</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Canlı Değerlendirme Modu</span>
              </span>
            </div>
          </div>

          {/* Split View Body (Student Writing vs AI Rubric Analysis) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left: Student Submission (6 Kolon) */}
            <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-slate-50/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                    ZK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Zeynep Kaya</div>
                    <div className="text-[11px] text-slate-500">10-A Biyoloji Şubesi · Ödev #14</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Teslim Edildi
                </span>
              </div>

              {/* Homework Prompt & Student Answer */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ödev Sorusu:
                  </span>
                  <p className="font-semibold text-slate-800">
                    Mitoz ve mayoz bölünme arasındaki 3 temel farkı biyolojik mekanizmalarıyla açıklayınız.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Öğrenci Yanıtı:
                  </span>
                  <p>
                    1. Mitoz sonucunda 2 adet 2n kromozomlu genetik olarak özdeş hücre oluşurken; mayoz bölünmede krossing-over ve homolog kromozom ayrılması nedeniyle n kromozomlu, genetik çeşitliliğe sahip 4 yeni gamet hücresi meydana gelir.
                  </p>
                  <p>
                    2. Mitoz vücut (somatik) hücrelerinde ömür boyu büyüme ve onarım için gerçekleşir; mayoz ise sadece üreme ana hücrelerinde eşey hücrelerini üretmek için gerçekleşir.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: AI Auto-Grading & Teacher Review (6 Kolon) */}
            <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Gemini AI Rubrik Değerlendirmesi</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Önerilen Puan:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs">
                    %92 / 100
                  </span>
                </div>
              </div>

              {/* Rubric Criteria Cards */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-slate-800">Kavramsal Doğruluk:</span>
                    <p className="text-slate-500 leading-snug">
                      Krossing-over ve kromozom sayıları eksiksiz aktarılmış.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-slate-800">Pedagojik Geri Bildirim:</span>
                    <p className="text-slate-500 leading-snug">
                      &quot;Tebrikler Zeynep! Mitoz-Mayoz farkını çok net kurmuşsun. Anafaz evresindeki kromatit ayrılmasını da eklersen kusursuz olur.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Teacher One-Click Approval Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Öğretmen tek tıkla onaylayabilir veya puanı düzenleyebilir.
                </span>

                <button
                  type="button"
                  onClick={handleTeacherClick}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Notu Onayla & Gönder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES (6 Temel Modül) */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
            Platform Yetenekleri
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">
            Eğitim Süreçleriniz için Güçlü Araçlar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Öğretmenler için hazırlık kolaylığı, öğrenciler için başarı odaklı modern çalışma deneyimi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Otomatik Değerlendirme */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-sm group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 group-hover:text-blue-600 transition-colors">
                Yapay Zeka Destekli Notlama
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Yazılı metin ve yüklenen belgeleri yönergeye göre saniyeler içinde analiz eder, rubrik puan taslağı ve geri bildirim üretir.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Saniyeler İçinde Taslak</span>
              <span className="text-slate-400">Rubrik Analizi</span>
            </div>
          </div>

          {/* Card 2: Sınav & Test Yapılandırıcı */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-sm group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 group-hover:text-indigo-600 transition-colors">
                MEB Uyumlu Soru Üretici
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                LGS, YKS, KPSS veya ortaokul seviyesine göre kazanım odaklı çoktan seçmeli veya açık uçlu sorular hazırlayın.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>5 Farklı Seviye</span>
              <span className="text-slate-400">MEB & ÖSYM</span>
            </div>
          </div>

          {/* Card 3: 7/24 AI Soru Koçu */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-sm group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 group-hover:text-cyan-600 transition-colors">
                7/24 Canlı Soru Danışmanı
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Öğrenciler için anında geri bildirimli pratik alanı. Yanlış cevaplarda mantığı adım adım anlatan kişisel soru çözücü.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-600">
              <span>Bireysel Koçluk</span>
              <span className="text-slate-400">Sürekli Aktif</span>
            </div>
          </div>

          {/* Card 4: Sınıf & Şube Yönetimi */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-sm group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 group-hover:text-emerald-600 transition-colors">
                Kolay Sınıf & Şube Yönetimi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                6 haneli kodla şubeler oluşturun. Tüm sınıfa tek tıkla ödev atayın veya bireysel öğrenci seçerek kişiselleştirin.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>6 Haneli Kod</span>
              <span className="text-slate-400">Hızlı Katılım</span>
            </div>
          </div>

          {/* Card 5: Gelişim Karnesi & Donut Analitik */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-sm group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 group-hover:text-amber-600 transition-colors">
                Gelişim Karnesi & Başarı Takibi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Öğretmenler için detaylı Not Çizelgesi (Gradebook), öğrenciler için Konu Hakimiyeti ve Başarı Donut grafiği.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Donut Analitik</span>
              <span className="text-slate-400">PDF Karne</span>
            </div>
          </div>

          {/* Card 6: KVKK & Kurumsal Güvenlik */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-sm group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-800 group-hover:text-purple-600 transition-colors">
                %100 Güvenli & KVKK Uyumlu
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Öğrenci verileri izole tutulur, asla üçüncü taraflarla paylaşılmaz. Supabase Postgres ve RLS korumalı kurumsal bulut.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>İzole Bulut</span>
              <span className="text-slate-400">RLS Korumalı</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION (3 Basit Adım) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 max-w-5xl mx-auto space-y-8 shadow-sm">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
            Sistematik İş Akışı
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">
            3 Kolay Adımda Başlayın
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              01
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-800">Sınıfını Aç & Kod Paylaş</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Öğretmen 6 haneli katılım kodunu üretir, öğrenciler tek tıkla şubeye dahil olur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              02
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-800">Ödev & Test Yayınla</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Müfredata uygun sorular, PDF materyaller veya son teslim tarihli ödevler saniyeler içinde atanır.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              03
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-800">İncele & Geri Bildirim Ver</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI rubrik analizini gözden geçirin, tek tıkla onaylayarak yapıcı geri bildirimi iletin.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center space-y-6 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Eğitim Süreçlerinizi Kolaylaştırmaya Bugün Başlayın
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Öğretmenler için hazırlık ve okuma kolaylığı, öğrenciler için başarı odaklı modern çalışma deneyimi.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          <button
            onClick={handleTeacherClick}
            className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            👨‍🏫 Öğretmen Olarak Başla
          </button>
          <button
            onClick={handleStudentClick}
            className="px-7 py-3.5 rounded-xl bg-blue-800/60 hover:bg-blue-800/80 border border-white/20 text-white font-semibold text-xs sm:text-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            🎓 Öğrenci Portalı
          </button>
        </div>
      </section>
    </div>
  );
}
