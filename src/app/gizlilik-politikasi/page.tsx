import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShieldCheck,
  Lock,
  FileText,
  Eye,
  Server,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Cookie,
  UserCheck,
  Scale,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | EduFlow Pro',
  description: 'EduFlow Pro platformu kişisel veri işleme, veri güvenliği, çerez politikası ve 6698 sayılı KVKK aydınlatma metni.',
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">KVKK Uyumlu Sürüm 2.4</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Hukuki Uyum & Veri Güvenliği Standardı</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Gizlilik Politikası & KVKK Aydınlatma Metni
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
            EduFlow Pro olarak öğrenci, öğretmen ve eğitimcilerimizin kişisel verilerinin güvenliğine en üst düzeyde önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla hazırlanan bu metin, haklarınızı ve veri işleme ilkelerimizi açıklamaktadır.
          </p>
          <div className="text-xs text-slate-500 pt-2 font-mono">
            Son Güncelleme: 17 Ağustos 2026 · Yürürlük Durumu: Aktif
          </div>
        </div>

        {/* Section 1: Data Controller */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">1. Veri Sorumlusu Sıfatı</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            6698 sayılı KVKK uyarınca, <strong>EduFlow Pro Eğitim Teknolojileri</strong> (&quot;Platform&quot; veya &quot;Şirket&quot;) veri sorumlusu sıfatıyla hareket etmektedir. Platformumuz üzerinden paylaşılan kişisel veriler, aşağıda belirtilen amaçlar doğrultusunda hukuka ve dürüstlük kurallarına uygun olarak işlenmekte, güvenle saklanmakta ve korunmaktadır.
          </p>
        </section>

        {/* Section 2: Collected Personal Data */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">2. İşlenen Kişisel Veriler</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            EduFlow Pro servislerini kullanırken işlenen temel kişisel veri kategorileri şunlardır:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Kimlik & Hesap:</strong> Ad, soyad, kullanıcı adı, profil fotoğrafı ve rol (Öğretmen / Öğrenci).</span>
            </li>
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>İletişim & Giriş:</strong> E-posta adresi, şifrelenmiş parola hash&apos;leri, oturum token&apos;ları.</span>
            </li>
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Eğitim & Performans:</strong> Gönderilen ödevler, sınav cevapları, puanlar, öğretmen ve AI geri bildirimleri.</span>
            </li>
            <li className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Teknik Veriler:</strong> Giriş zamanı, IP adresi, tarayıcı türü, temel hata kayıtları.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Purposes and Legal Grounds */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">3. Kişisel Verilerin İşlenme Amaçları & Hukuki Sebepleri</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen şartlara uygun olarak aşağıdaki amaçlarla işlenmektedir:
          </p>
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <strong>Sözleşmenin Kurulması ve İfası:</strong> Kullanıcı kaydının açılması, sınıf yönetimi, ödev atama ve tamamlama süreçlerinin yürütülmesi.
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <strong>Eğitsel Değerlendirme & AI Desteği:</strong> Öğrencilere yapay zeka destekli konu özeti, kişiselleştirilmiş geri bildirim ve otomatik sınav analizi sunulması.
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <strong>Platform Güvenliği:</strong> Kötüye kullanım, yetkisiz erişim ve siber saldırıların tespiti ve engellenmesi.
            </div>
          </div>
        </section>

        {/* Section 4: AI Privacy & Security */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-slate-900/50 to-indigo-950/30 border border-cyan-500/20 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">4. Yapay Zeka (AI) ve Veri Güvenliği Prensipleri</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            EduFlow Pro, eğitimde yapay zeka kullanımında katı etik ve güvenlik prensiplerini benimser:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Öğrenci Verileri Model Eğitiminde Kullanılmaz:</strong> Öğrenci ödevleri ve yanıtları, genel yapay zeka modellerinin herkese açık eğitimi için asla üçüncü taraflara satılmaz veya paylaşılmaz.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Uçtan Uca Şifreli İletim:</strong> AI API endpoint&apos;lerine iletilen tüm istekler TLS/SSL şifrelemesi ve yetkilendirilmiş API anahtarlarıyla korunur.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Prompt İzolasyonu & Filtreleme:</strong> Girdiler kötü amaçlı enjeksiyonlara karşı filtrelenir ve kullanıcı bağlamı izole tutulur.</span>
            </li>
          </ul>
        </section>

        {/* Section 5: Cookies and Session Storage */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Cookie className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">5. Çerezler ve İzleme Teknolojileri</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Platformumuzda yalnızca hizmetin temel fonksiyonlarını yerine getirebilmek amacıyla <strong>zorunlu oturum ve güvenlik çerezleri</strong> kullanılmaktadır:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-bold text-white mb-1">Oturum & Kimlik Doğrulama</div>
              <p className="text-slate-400">Öğretmen ve öğrenci oturumlarının güvenle devam etmesini sağlar.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-bold text-white mb-1">Güvenlik & Anti-Abuse</div>
              <p className="text-slate-400">Yetkisiz API çağrılarını ve sahte istekleri engellemek amacıyla çalışır.</p>
            </div>
          </div>
        </section>

        {/* Section 6: Rights under KVKK Article 11 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">6. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Kişisel veri sahibi olarak KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-300">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">✓ Kişisel verilerinizin işlenip işlenmediğini öğrenme,</div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">✓ İşlenmişse buna ilişkin bilgi talep etme,</div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">✓ Amacına uygun kullanılıp kullanılmadığını öğrenme,</div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">✓ Eksik veya yanlış işlenmişse düzeltilmesini isteme,</div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">✓ KVKK 7. maddesi uyarınca silinmesini veya yok edilmesini isteme,</div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">✓ Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</div>
          </div>
        </section>

        {/* Section 7: Contact and DPO */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">7. İletişim ve Başvuru</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            KVKK kapsamındaki haklarınızı kullanmak, veri silme veya bilgi talebinde bulunmak için kayıtlı e-posta adresiniz üzerinden bizimle iletişime geçebilirsiniz:
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Veri Sorumlusu İrtibat E-Postası:</div>
              <div className="font-mono text-sm sm:text-base font-bold text-cyan-300">kvkk@eduflowpro.app</div>
            </div>
            <a
              href="mailto:kvkk@eduflowpro.app"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Talebi İlet</span>
            </a>
          </div>
        </section>

        {/* Bottom Back Button */}
        <div className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EduFlow Pro Ana Sayfasına Dön</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
