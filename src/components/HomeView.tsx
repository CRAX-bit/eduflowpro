'use client';

import React from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  Sparkles,
  Users,
  ArrowRight,
  BrainCircuit,
  BookOpen,
  CheckCircle2,
  School,
  Flame,
  Award,
  TrendingUp,
  Clock,
  Check,
  KeyRound,
  ShieldCheck,
  PenTool,
  Compass,
  FileCheck,
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
    <div className="space-y-20 sm:space-y-28 animate-fade pb-12">
      {/* 1. HERO SECTION */}
      <section className="text-center pt-8 sm:pt-16 pb-4 relative space-y-8">
        {/* Ambient subtle glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[360px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Top Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 shadow-[0_0_24px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Yeni Nesil Özel Ders & Sınıf Yönetim Ekosistemi</span>
        </div>

        {/* Main Hook Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15] sm:leading-[1.1]">
            Öğretmenlerin Hazırlık ve Değerlendirme Yükünü Azaltan,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Öğrencileri Motive Eden Platform
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Saniyeler içinde müfredata uyumlu ödev ve testler hazırlayın, <b>akıllı asistan taslaklarıyla</b> saatler süren okuma sürecini kısaltın. Öğrencileriniz için <b>7/24 yaşayan kişisel bir öğrenme alanı</b> sunun.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={handleTeacherClick}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-[0_8px_32px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_44px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>👨‍🏫 Öğretmen Olarak Başla</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleStudentClick}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-[0_8px_32px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_44px_rgba(99,102,241,0.55)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>🎓 Öğrenci Olarak Katıl</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Small trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Kredi Kartı Gerektirmez</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Öğretmen Onaylı Değerlendirme</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>6 Haneli Kod ile Hızlı Sınıf Kurulumu</span>
          </span>
        </div>
      </section>

      {/* 2. REAL VALUE PROPOSITIONS (GERÇEK DEĞER ÖNERİLERİ) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-emerald-500/40 backdrop-blur-xl shadow-lg transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
            %80
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Hazırlık Süresi Tasarrufu</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Saniyeler içinde test ve konu özeti oluşturarak saatler süren manuel hazırlık sürecini ortadan kaldırın.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-indigo-500/40 backdrop-blur-xl shadow-lg transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Tek Tıkla 6 Haneli Sınıf Kurulumu</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Karmaşık kayıt formlarına gerek kalmadan, tek bir katılım koduyla tüm sınıfı dakikalar içinde platforma dahil edin.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl shadow-lg transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Her Öğrenciye Özel Yapıcı Geri Bildirim</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Yalnızca doğru/yanlış değil; öğrencinin güçlü yönlerini öne çıkaran ve eksiklerini gösteren pedagojik analizler sunun.
          </p>
        </div>
      </section>

      {/* 3. INTERACTIVE DEMO PREVIEW (HERO ALTINDAKİ CANLI ÇALIŞMA ALANI SİMÜLATÖRÜ) */}
      <section className="relative max-w-5xl mx-auto">
        <div className="rounded-3xl bg-[#0B0F17]/90 border border-slate-800/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                EduFlow Pro — Akıllı Ödev Değerlendirme ve İnceleme Süreci
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Öğretmen İnceleme Modu</span>
            </div>
          </div>

          {/* Body Content: Split View (Student Submission vs Teacher Review & Assistant Draft) */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Student Submission Mockup */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 text-xs">
                    AV
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ali Vural (Öğrenci)</div>
                    <div className="text-[11px] text-slate-400">8-A Matematik Şubesi</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300">
                  Teslim Edildi
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Ödev: Pisagor Bağıntısı ve Alan Uygulamaları
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  "Pisagor Teoremi, bir dik üçgende dik kenarların uzunluklarının kareleri toplamının hipotenüsün uzunluğunun karesine eşit olduğunu belirtir (<b className="text-cyan-300">a² + b² = c²</b>). Örneğin dik kenarları 3 cm ve 4 cm olan bir dik üçgende hipotenüs 5 cm çıkar: 3² + 4² = 9 + 16 = 25 = 5²."
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sınıf: 8-A Geometri Grubu</span>
                </span>
                <span className="font-mono text-[11px] text-cyan-400">Katılım Kodu: EDF92A</span>
              </div>
            </div>

            {/* Right: Teacher Review & Assistant Draft */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
              {/* Score strip */}
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg shadow-emerald-500/25">
                    95
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Akıllı Asistan Taslak Önerisi</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Öğretmen Onayına Hazır Not</div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  ✓ Taslak Hazır
                </span>
              </div>

              {/* Pedagojik Değerlendirme */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-500/20 text-xs space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Önerilen Değerlendirme Notu:</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">
                  "Harika bir çalışma Ali! Pisagor formülünü tam doğru ifade etmiş ve 3-4-5 özel üçgeni örneğiyle desteklemişsin. Mantıksal kurgun ve anlatımın son derece akıcı."
                </p>
              </div>

              {/* Strengths & Improvements */}
              <div className="space-y-1.5 text-xs">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Güçlü Yön: Formül ve kavramsal tanım eksiksiz aktarılmış.</span>
                </div>
                <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Geliştirme Tavsiyesi: Bir sonraki ödevde koordinat düzlemi uygulamasını da ekleyebilirsin.</span>
                </div>
              </div>

              {/* Teacher 1-click approve button */}
              <button
                onClick={handleTeacherClick}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Öğretmen Olarak Öneriyi Onayla & Öğrenciye İlet</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE CORE PILLARS (PLATFORMUN ASIL POTANSİYELİNİ GÖSTEREN 3 SÜTUN) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs uppercase font-bold tracking-[0.25em] text-indigo-400 font-sans">
            Temel Yetenekler
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
            Eğitim Süreçlerini Kolaylaştıran 3 Ana Sütun
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Öğretmenin kontrolünde, öğrencinin hızında esnek bir çalışma ortamı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sütun 1: Sınıf & Öğrenci Yönetimi */}
          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-purple-500/50 backdrop-blur-xl shadow-lg transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-purple-300 transition-colors">
                Sınıf & Öğrenci Yönetimi
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                6 haneli benzersiz katılım kodları ile saniyeler içinde sınıf oluşturun. Şube bazlı ödev dağıtımı yapın ve kimin ne zaman teslim ettiğini anlık tablodan izleyin.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
              <span>Hızlı Katılım Kodu & Şube Takibi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Sütun 2: Esnek Değerlendirme */}
          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-emerald-500/50 backdrop-blur-xl shadow-lg transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-emerald-300 transition-colors">
                Esnek Değerlendirme
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                İster kendi kriterlerinizle tamamen manuel notlandırın, ister akıllı asistanın hazırladığı taslak notu ve yapıcı geri bildirimi tek tıkla onaylayıp öğrenciye ulaştırın.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span>%100 Öğretmen Kontrollü İnceleme</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Sütun 3: Öğrenci Odaklı Çalışma Alanı */}
          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-cyan-500/50 backdrop-blur-xl shadow-lg transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-cyan-300 transition-colors">
                Öğrenci Odaklı Çalışma Alanı
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Öğrencinin ödev beklemesine gerek kalmaz. Dilediği derste anında konu tekrarı yapar, takıldığı soruların adım adım mantığını öğrenir ve çalışma serisini canlı tutar.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>Seri Takibi & Kişisel Koç</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 ADIMLI İŞ AKIŞI) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#111827] via-[#0F172A] to-slate-950 border border-slate-800 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Kolay İş Akışı
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Platform Nasıl Çalışıyor?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-heading font-bold text-base text-white">Sınıf Oluştur & Ödev Yayınla</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğretmen sınıfını açar, katılım kodunu paylaşır ve ders materyallerini veya testlerini saniyeler içinde öğrencilerine atar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-heading font-bold text-base text-white">Öğrenci Teslim Eder</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğrenci yanıt metnini veya defter fotoğrafını yükler; ödev haricinde de dilediği zaman pratik yapabilir.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-heading font-bold text-base text-white">Öğretmen İnceler ve Onaylar</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Akıllı asistanın hazırladığı taslak notu inceleyen öğretmen tek tıkla onaylar veya kendi puanını vererek süreci tamamlar.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
            Eğitim Süreçlerinizi Kolaylaştırmaya Bugün Başlayın
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            İster öğretmen olun sınıflarınızı dakikalar içinde yönetin, ister öğrenci olun kişisel çalışma alanınızla hedeflerinize emin adımlarla ilerleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleTeacherClick}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            👨‍🏫 Öğretmen Olarak Başla
          </button>
          <button
            onClick={handleStudentClick}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            🎓 Öğrenci Olarak Katıl
          </button>
        </div>
      </section>
    </div>
  );
}
