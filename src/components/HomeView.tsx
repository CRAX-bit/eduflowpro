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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-50/80 border border-blue-200 text-blue-800 shadow-xs hover:bg-blue-100/80 transition-colors">
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

        {/* High-Contrast Bold Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 leading-[1.14]">
            Öğretmenler için Akıllı Asistan,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Öğrenciler için Kişisel Koç
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
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
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
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
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Top Window Chrome Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>eduflow-ai-evaluator</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-800 font-semibold">rubric-engine.tsx</span>
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
            {/* Left: Student Submission (5 Kolon) */}
            <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-slate-50/50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    ZK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Zeynep Kaya</div>
                    <div className="text-[11px] text-slate-500">10-A Biyoloji Şubesi · Ödev #14</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Teslim Edildi
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Konu: Fotosentez Işık Reaksiyonları</span>
                  <span>142 Kelime</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans space-y-2 shadow-xs">
                  <p>
                    &ldquo;Fotosentezin ışığa bağımlı reaksiyonları kloroplastın <strong className="text-blue-700 font-semibold">tilakoit zarlarında</strong> gerçekleşir. Işık fotonları klorofil pigmentlerini uyararak elektron taşıma sistemini (ETS) aktive eder.
                  </p>
                  <p>
                    Suyun fotolizi ile açığa çıkan elektronlar ETS&apos;den aktarılırken proton gradyanı oluşur ve ATP sentaz enzimi aracılığıyla <strong className="text-indigo-700 font-semibold">ATP ile NADPH</strong> sentezlenir. Bu ürünler daha sonra stromadaki Calvin döngüsüne aktarılır.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sınıf: 10-A Fen Grubu</span>
                </span>
                <span className="font-mono text-[11px] text-blue-600 font-semibold">Kod: BIO-10A</span>
              </div>
            </div>

            {/* Right: AI Rubric Evaluation & Feedback (7 Kolon) */}
            <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-white">
              {/* Score Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-xl text-emerald-600">95</span>
                    <span className="text-xs text-emerald-700 font-medium">/ 100</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Rubrik Analizi & Not Önerisi</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Öğretmen Onayına Hazır Taslak</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  A+ Mükemmel
                </span>
              </div>

              {/* Rubric Criteria Chips */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 mb-0.5">Terminoloji</div>
                  <div className="text-xs font-bold text-emerald-600">5 / 5 ✓</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 mb-0.5">Kavramsal Netlik</div>
                  <div className="text-xs font-bold text-emerald-600">5 / 5 ✓</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 mb-0.5">Örnek/Akış</div>
                  <div className="text-xs font-bold text-blue-600">4.5 / 5</div>
                </div>
              </div>

              {/* Pedagogical Feedback Box */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs space-y-1.5">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Öğretmen Geri Bildirim Önerisi:</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  &ldquo;Tebrikler Zeynep! Tilakoit zar ve stroma ayrımını çok net açıklamışsın. Suyun fotolizi ile ATP/NADPH üretim ilişkisini doğru kurman anlatımını zenginleştirmiş.&rdquo;
                </p>
              </div>

              {/* 1-Click Approve Button */}
              <button
                onClick={handleTeacherClick}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Öğretmen Olarak Taslağı Onayla & Gönder</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6-ITEM CLEAN BENTO GRID FEATURES */}
      <section className="space-y-10 max-w-5xl mx-auto">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600">
            Platform Yetenekleri
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Eğitim Süreçlerini Hızlandıran 6 Güçlü Modül
          </h2>
          <p className="text-sm text-slate-600">
            Öğretmenin tam kontrolünde, öğrencinin kendi hızında esnek ve modern bir çalışma ortamı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Hızlı & Akıllı Değerlendirme */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                Hızlı & Akıllı Değerlendirme
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Öğretmenler için saatler süren manuel ödev okuma sürecini saniyelere indirin. Akıllı taslak notu tek tıkla onaylayın.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>%80 Zaman Tasarrufu</span>
              <span className="text-slate-400">Rubrik Analizi</span>
            </div>
          </div>

          {/* Card 2: İnteraktif Soru Üretici */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                Müfredata Uyumlu Soru Üretici
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                MEB, LGS ve YKS kazanımlarına tam uyumlu interaktif test ve sınav sorularını saniyeler içinde oluşturun ve yayınlayın.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>5 Farklı Seviye</span>
              <span className="text-slate-400">MEB & ÖSYM</span>
            </div>
          </div>

          {/* Card 3: 7/24 AI Soru Koçu */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-cyan-600 transition-colors">
                7/24 Canlı Soru Danışmanı
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Öğrenciler için anında geri bildirimli pratik alanı. Yanlış cevaplarda mantığı adım adım anlatan kişisel soru çözücü.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-600">
              <span>Bireysel Koçluk</span>
              <span className="text-slate-400">Sürekli Aktif</span>
            </div>
          </div>

          {/* Card 4: Sınıf & Şube Yönetimi */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                Kolay Sınıf & Şube Yönetimi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                6 haneli kodla şubeler oluşturun. Tüm sınıfa tek tıkla ödev atayın veya bireysel öğrenci seçerek kişiselleştirin.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>6 Haneli Kod</span>
              <span className="text-slate-400">Hızlı Katılım</span>
            </div>
          </div>

          {/* Card 5: Gelişim Karnesi & Donut Analitik */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                Gelişim Karnesi & Başarı Takibi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Öğretmenler için detaylı Not Çizelgesi (Gradebook), öğrenciler için Konu Hakimiyeti ve Başarı Donut grafiği.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Donut Analitik</span>
              <span className="text-slate-400">PDF Karne</span>
            </div>
          </div>

          {/* Card 6: KVKK & Kurumsal Güvenlik */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 shadow-xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                %100 Güvenli & KVKK Uyumlu
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
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
      <section className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 max-w-5xl mx-auto space-y-8 shadow-sm">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
            Sistematik İş Akışı
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            3 Kolay Adımda Başlayın
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              01
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-900">Sınıfını Aç & Kod Paylaş</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Öğretmen 6 haneli katılım kodunu üretir, öğrenciler tek tıkla şubeye dahil olur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              02
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-900">Ödev & Test Yayınla</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Müfredata uygun sorular, PDF materyaller veya son teslim tarihli ödevler saniyeler içinde atanır.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
              03
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-900">İncele & Geri Bildirim Ver</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
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
