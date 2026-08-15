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
  CheckCircle2,
  School,
  Flame,
  Award,
  TrendingUp,
  Clock,
  Check,
  KeyRound,
  ShieldCheck,
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
        {/* Glow ambient background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Feature Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_24px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>✨ Yapay Zeka Destekli Geleceğin Eğitim Ekosistemi · Gemini Pro v2</span>
        </div>

        {/* Main Hook Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15] sm:leading-[1.1]">
            Yapay Zeka Destekli{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Geleceğin Eğitim Ekosistemi
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Öğretmenler için saniyeler içinde sınav ve ödev hazırlama, <b>Gemini AI ile anında otomatik puanlama</b>; öğrenciler için ödev olmasa bile <b>7/24 yaşayan kişisel AI çalışma koçu</b>.
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
            <span>Google Gemini Pro Altyapısı</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Otomatik AI Rubrik Notlandırma</span>
          </span>
        </div>
      </section>

      {/* 2. INTERACTIVE DEMO PREVIEW (HERO ALTINDAKİ CANLI DASHBOARD SİMÜLATÖRÜ) */}
      <section className="relative max-w-5xl mx-auto">
        <div className="rounded-3xl bg-[#0B0F17]/90 border border-slate-800/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                EduFlow Pro — Canlı Gemini AI Ödev & Notlandırma Simülatörü
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Canlı AI Değerlendirmesi Aktif</span>
            </div>
          </div>

          {/* Body Content: Split View (Student Submission vs Gemini AI Evaluation) */}
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
                  Ödev: Pisagor Bağıntısı ve Alan Bağıntıları
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  "Pisagor Teoremi, bir dik üçgende dik kenarların uzunluklarının kareleri toplamının hipotenüsün karesine eşit olduğunu belirtir (<b className="text-cyan-300">a² + b² = c²</b>). Örneğin dik kenarları 3 cm ve 4 cm olan bir dik üçgende hipotenüs 5 cm çıkar: 3² + 4² = 9 + 16 = 25 = 5²."
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sınıf: 8-A Geometri Grubu</span>
                </span>
                <span className="font-mono text-[11px] text-cyan-400">Kod: EDF92A</span>
              </div>
            </div>

            {/* Right: Gemini AI Instant Evaluation Card */}
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
                      <span>Gemini AI Otomatik Notu</span>
                    </div>
                    <div className="text-[11px] text-slate-400">100 Üzerinden Puanlama</div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  ✓ Değerlendirildi
                </span>
              </div>

              {/* Gemini Constructive Feedback */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-500/20 text-xs space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Yapay Zeka Pedagojik Değerlendirmesi:</span>
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
                <span>Öğretmen Olarak AI Notunu Tek Tıkla Onayla</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS GRID (ÖNE ÇIKAN 4 ANA ÖZELLİK) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs uppercase font-bold tracking-[0.25em] text-indigo-400 font-sans">
            Gelişmiş Özellikler
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
            Eğitim Süreçlerini 10 Kat Hızlandıran Güçlü Modüller
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Geleneksel ödev ve sınav takibini yapay zeka hızında, ölçülebilir ve zahmetsiz bir deneyime dönüştürün.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Gemini Pro Otomatik Notlandırma */}
          <div className="group p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-indigo-500/50 hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                🤖 Gemini Pro Otomatik Notlandırma
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Öğrenci yanıtını yüklediği an yapıcı geri bildirim ve puan önerisi hazır. Öğretmenin saatler süren okuma yüküne son.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
              <span>Rubrik & Puan Analizi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: 7/24 Kişisel AI Çalışma Koçu */}
          <div className="group p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_15px_40px_rgba(6,182,212,0.15)] hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                🎯 7/24 Kişisel AI Çalışma Koçu
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ödevin olmasa bile boş kalma! İstediğin derste anında mini quizler çöz, takıldığın konuları Gemini ile pekiştir.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>Canlı Soru & Konu Koçu</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Akıllı Sınıf & Eşleşme Sistemi */}
          <div className="group p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-purple-500/50 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                🏫 Akıllı Sınıf & Eşleşme Sistemi
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tek tıkla 6 haneli sınıf kodu üret, öğrencilerini topla ve sınıfa özel ödevler ata.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
              <span>Hızlı Katılım Kodu (EDFxxx)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Anlık İlerleme ve Streak Takibi */}
          <div className="group p-6 sm:p-7 rounded-3xl bg-[#111827]/80 border border-slate-800 hover:border-amber-500/50 hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                📊 Anlık İlerleme ve Streak Takibi
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Öğrencinin haftalık çalışma temposunu, tamamlanan görevlerini ve başarı serisini canlı izle.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Günlük Seri & Başarı Karnesi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 ADIMDA ÇALIŞMA PRENSİBİ) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#111827] via-[#0F172A] to-slate-950 border border-slate-800 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Kolay 3 Adımlı Süreç
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Eğitimde Yeni Çağ Nasıl İşliyor?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-heading font-bold text-base text-white">Sınıf Oluştur & Ödev Ata</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğretmen sınıfını açar, 6 haneli katılım kodunu öğrencileriyle paylaşır ve Gemini AI ile saniyeler içinde zengin testler veya ödevler hazırlar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-heading font-bold text-base text-white">Öğrenci Yanıtını Teslim Eder</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğrenci ödev metnini veya defter fotoğrafını yükler. İsterse ödev dışında da Gemini AI çalışma koçuyla 7/24 sınırsız pratik yapar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-heading font-bold text-base text-white">Gemini Puanlar, Öğretmen Onaylar</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini anında 100 üzerinden puan ve pedagojik analiz üretir. Öğretmen tek tıkla onaylar veya kendi nihai notunu vererek süreci tamamlar.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM METRICS & STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[#111827]/70 border border-slate-800 text-center hover:border-cyan-500/30 transition-all shadow-lg">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            +10.000
          </div>
          <div className="text-xs font-bold text-slate-200 mt-2">Çözülen Soru & Test</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Süreli ve yapay zeka analizli</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#111827]/70 border border-slate-800 text-center hover:border-emerald-500/30 transition-all shadow-lg">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            %98
          </div>
          <div className="text-xs font-bold text-slate-200 mt-2">Öğrenci Başarı Artışı</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Düzenli çalışma serisi ile</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#111827]/70 border border-slate-800 text-center hover:border-purple-500/30 transition-all shadow-lg">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            3 Kat
          </div>
          <div className="text-xs font-bold text-slate-200 mt-2">Daha Hızlı Ödev İnceleme</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Gemini hazır notlandırma ile</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#111827]/70 border border-slate-800 text-center hover:border-amber-500/30 transition-all shadow-lg">
          <div className="font-heading font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            7/24
          </div>
          <div className="text-xs font-bold text-slate-200 mt-2">Canlı AI Koç Desteği</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Her zaman ve her derste aktif</div>
        </div>
      </section>

      {/* 6. BOTTOM CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
            Eğitimin Geleceğine Bugün Adım Atın
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            İster öğretmen olun sınıflarınızı dakikalar içinde yönetin, ister öğrenci olun Gemini AI çalışma koçunuzla hedeflerinize ulaşın.
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
