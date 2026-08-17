# EduFlow Pro – Clean EdTech SaaS Açık Tema (Light Theme) Dönüşüm Planı

Bu plan, EduFlow Pro'nun tüm arayüzünü koyu temadan modern, ferah ve kurumsal bir **Clean EdTech SaaS Açık Temasına (Slate-50 + Cobalt Blue)** dönüştürür.

---

## 🎨 1. Tasarım Sistemi & Renk Mimarisi

| Öğe | Eski (Dark Theme) | Yeni (Clean EdTech Light Theme) |
|---|---|---|
| **Sayfa Arka Planı** | `#0a0f1d`, `#0c0d12`, `#090a0f` | `bg-slate-50`, `bg-white` |
| **Birincil Vurgu (Primary)** | Neon Cyan / Yeşil (`#00f2fe`, `#10b981`) | **Kurumsal Kobalt Mavi (`bg-blue-600`, `hover:bg-blue-700`, `text-blue-600`)** |
| **Kartlar & Paneller** | `bg-[#0c0d12]`, `border-zinc-800` | `bg-white`, `border border-slate-200/80`, `rounded-2xl`, `shadow-sm hover:shadow-md` |
| **Tipografi (Başlıklar)** | `text-white font-bold` | `text-slate-900 font-bold tracking-tight` |
| **Tipografi (Gövde & Açıklama)** | `text-zinc-400`, `text-slate-400` | `text-slate-600`, `text-slate-500` |
| **Giriş / Form Elemanları** | `bg-zinc-900`, `border-zinc-800` | `bg-white`, `border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900` |
| **Gezinme / Navbar** | `bg-[#090a0f]/95`, `border-zinc-800` | `bg-white/90 backdrop-blur-md`, `border-slate-200/80`, `shadow-sm` |
| **AI Çekmeceleri** | Koyu zeminli slide-over | Ferah beyaz `bg-white border-l border-slate-200 shadow-2xl`, mavi AI vurguları |

---

## 📊 2. Donut Grafik & Analiz Modülleri

### A. Öğretmen Paneli: Sınıf Başarı & Tamamlama Donut Modülü
- Sınıfın genel ödev tamamlama oranını ve başarı dağılımını gösteren **interaktif SVG Donut Grafiği** (Tamamlananlar / İncelenenler / Bekleyenler).
- İstatistik kartları (Kayıtlı Öğrenci, Yayındaki Materyal, Ödev Teslimleri, Sınıf Ortalaması) yeni beyaz kart yapısına uyarlanır.

### B. Öğrenci Paneli: "Bireysel Başarı & Konu Hakimiyeti" Donut Modülü (YENİ)
- **Öğrenci Donut Grafiği**:
  - Bireysel Ödev Tamamlama Yüzdesi (Örn: `%85`)
  - Puan & Doğru/Yanlış Başarı Dağılımı
- **Konu Hakimiyeti Rozetleri**:
  - 🟢 **Güçlü Olduğun Konular** (Örn: *Fotosentez*, *Fonksiyonlar & Parabol*)
  - 🟡 **Tekrar Edilmesi Gerekenler** (Örn: *Newton Yasaları*, *Kimyasal Türler*)

---

## 🛠️ 3. Değişiklik Yapılacak Dosyalar

### 1. Temel Altyapı & Global Stiller
- [`src/app/globals.css`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/app/globals.css) & [`src/app/layout.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/app/layout.tsx)
  - `dark` class'ı kaldırılır / aydınlık temaya uyarlanır
  - Slate-50 / White zemin, temiz açık mavi scrollbar ve yumuşak ışık gradyanları

### 2. Navbar & Footer
- [`src/components/Navbar.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/Navbar.tsx)
  - Temiz beyaz navbar (`bg-white/90 border-slate-200 shadow-sm`), kobalt mavi butonlar ve açık tema profil menüsü
- [`src/app/page.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/app/page.tsx)
  - Açık tema footer (`bg-white border-t border-slate-200/80 text-slate-600`)

### 3. Ana Sayfa (Landing Page)
- [`src/components/HomeView.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/HomeView.tsx)
  - Resend/Linear esintili, aydınlık kurumsal EdTech SaaS landing page
  - Ferah Hero alanı, temiz 6'lı özellik bento grid'i ve canlı demo inceleme kartı

### 4. Öğretmen Paneli (Teacher Dashboard)
- [`src/components/TeacherView.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/TeacherView.tsx)
  - Açık tema kartlar, Sınıf Başarı Donut grafiği, beyaz tablo ve açık ödev listeleri

### 5. Öğrenci Paneli (Student Dashboard)
- [`src/components/StudentView.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/StudentView.tsx)
  - Yeni **"Bireysel Başarı & Konu Hakimiyeti" Donut Analiz Modülü**
  - Seviye rozeti, açık tema görev kartları ve başarı metrikleri

### 6. AI Slide-Over Çekmeceleri & Modallar
- [`src/components/TeacherAiDrawer.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/TeacherAiDrawer.tsx) & [`src/components/StudentAiDrawer.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/StudentAiDrawer.tsx)
  - Sağ alttaki buton ve açılan çekmeceler açık temaya (`bg-white`, kobalt mavi sohbet balonları) giydirilir
- Modallar: [`AuthModal.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/AuthModal.tsx), [`CreateAssignmentModal.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/CreateAssignmentModal.tsx), [`AssignmentSubmitModal.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/AssignmentSubmitModal.tsx), [`AssignmentReviewModal.tsx`](file:///c:/Users/yunus/OneDrive/Masaüstü/eduflowpro/src/components/AssignmentReviewModal.tsx)

---

## 🔍 Doğrulama Planı
1. `npx tsc --noEmit` ile derleme ve tip güvenliği doğrulaması.
2. Tüm Supabase fonksiyonlarının (giriş, ödev oluşturma, teslimat, AI araçları) aydınlık temada eksiksiz çalıştığının teyidi.
