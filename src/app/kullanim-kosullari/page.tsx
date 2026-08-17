import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  FileCheck,
  Scale,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Lock,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | EduFlow Pro',
  description: 'EduFlow Pro platformu kullanım şartları, kullanıcı hak ve yükümlülükleri, AI etik kuralları ve hizmet sözleşmesi.',
};

export default function KullanimKosullariPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070b14]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>EduFlow Pro Ana Sayfasına Dön</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">Şartlar Sürüm 2.4</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <FileCheck className="w-4 h-4" />
            <span>Hizmet & Kullanıcı Sözleşmesi</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Kullanım Koşulları
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
            EduFlow Pro platformunu ziyaret ederek, üye olarak veya platformun sunduğu yapay zeka destekli eğitim araçlarını kullanarak bu sayfada belirtilen koşulları kabul etmiş sayılırsınız.
          </p>
          <div className="text-xs text-slate-500 pt-2 font-mono">
            Son Güncelleme: 17 Ağustos 2026 · Yürürlük Durumu: Aktif
          </div>
        </div>

        {/* Section 1: Scope */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">1. Genel Hükümler ve Hizmet Kapsamı</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            EduFlow Pro; öğretmenler, öğrenciler ve eğitim kurumları için ödev atama, sınav hazırlama, akıllı değerlendirme, ders notu oluşturma ve yapay zeka destekli çalışma rehberliği sunan dijital bir eğitim platformudur. Platform, hizmetleri geliştirme veya değiştirme hakkını saklı tutar.
          </p>
        </section>

        {/* Section 2: User Responsibilities */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">2. Hesap Güvenliği ve Kullanıcı Sorumlulukları</h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Hesap Bilgilerinin Doğruluğu:</strong> Kayıt sırasında sağlanan e-posta, ad ve soyad gibi bilgilerin doğru ve güncel tutulması kullanıcının sorumluluğundadır.</span>
            </li>
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Şifre Güvenliği:</strong> Kullanıcı, hesap şifresinin gizliliğini korumakla yükümlüdür. Hesap üzerinden yapılan tüm işlemler hesap sahibinin sorumluluğundadır.</span>
            </li>
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Öğretmen Yetkileri:</strong> Öğretmenler sınıflarına ekledikleri öğrencilerin eğitim verilerini gizlilik ilkelerine uygun şekilde yönetmeyi kabul eder.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: AI Acceptable Use & Ethics */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900/50 to-cyan-950/30 border border-indigo-500/20 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">3. Yapay Zeka Özellikleri ve Akademik Dürüstlük</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            EduFlow Pro&apos;nun sunduğu Google Gemini tabanlı yapay zeka araçları (soru üretici, otomatik ödev puanlama, soru çözüm asistanı) öğrencilerin öğrenme sürecini desteklemek amacıyla tasarlanmıştır:
          </p>
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Kötüye Kullanım Yasağı:</strong> Yapay zeka servislerine tersine mühendislik (prompt injection), zararlı kod enjeksiyonu veya servisleri aşırı yükleyici otomatik bot istekleri göndermek kesinlikle yasaktır.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Akademik Dürüstlük:</strong> AI asistanı bir kopya aracı değil, kavram yanılgılarını gideren pedagojik bir destek mekanizmasıdır.</span>
            </div>
          </div>
        </section>

        {/* Section 4: Intellectual Property */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">4. Fikri Mülkiyet ve İçerik Hakları</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Platform arayüzü, logolar, yazılım kodları, tasarım ögeleri ve algoritmalar EduFlow Pro&apos;ya aittir. Kullanıcıların yüklediği ders notları ve ödev içerikleri ise içerik sahibinin mülkiyetinde kalır; EduFlow Pro bu içerikleri yalnızca platform servislerini ifa etmek üzere işler.
          </p>
        </section>

        {/* Section 5: Termination */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">5. Hizmetin Askıya Alınması ve Fesih</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Kullanım koşullarına aykırı davranış, yetkisiz API kullanımı, siber saldırı girişimi veya diğer kullanıcıların güvenliğini tehdit eden durumlarda EduFlow Pro, ilgili kullanıcının hesabını önceden bildirimde bulunmaksızın geçici olarak askıya alma veya kalıcı olarak sonlandırma hakkını saklı tutar.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">6. İletişim ve Destek</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Kullanım koşulları, kurumsal üyelik veya platform desteği ile ilgili her türlü soru için destek ekibimizle iletişime geçebilirsiniz:
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Hukuk & Destek E-Postası:</div>
              <div className="font-mono text-sm sm:text-base font-bold text-indigo-300">destek@eduflowpro.app</div>
            </div>
            <a
              href="mailto:destek@eduflowpro.app"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>İletişime Geç</span>
            </a>
          </div>
        </section>

        {/* Bottom Back Button */}
        <div className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EduFlow Pro Ana Sayfasına Dön</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
