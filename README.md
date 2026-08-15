# EduFlow Pro — Özel Ders Yönetim Platformu & Gemini AI

EduFlow Pro, birebir ve grup özel ders veren öğretmenler ile öğrencileri tek çatı altında toplayan, modern, ultra hızlı ve responsive bir **React / Next.js 14 (App Router)** uygulamasıdır.

Arka planda **Google Gemini Pro / Flash AI API** rotası ile entegre edilmiştir.

---

## 🌟 Öne Çıkan Özellikler

### 👨‍🏫 1. Öğretmen Paneli
- **Sınıf & Öğrenci Yönetimi:** Tek tıkla şifreli öğrenci hesabı açma, otomatik kullanıcı adı ve avatar renk ataması.
- **Ders Notu Yayınlama:** PDF / Görsel veya zengin metin formatında ders notu ekleme ve öğrencilere atama.
- **İnteraktif Süreli Test Oluşturucu:** Dakika bazlı geri sayım sayacı, soru-cevap havuzu.
- **Kitap Ödevi Teslimi:** Kitap sayfası çözümü talimatı ve fotoğraflı teslim alma.
- **Canlı İzleme Tablosu:** Sınıfın veya tek bir öğrencinin teslim durumunu, test başarı oranlarını anlık izleme.
- **Öğretmen Geri Bildirimi:** Testlere ve fotoğraflara anında not ve yönlendirme ekleme.
- **Yazdırılabilir Gelişim Karnesi (PDF):** Öğrencinin tüm başarı metriklerini, soru dökümünü ve ünitelerini tek tıkla şık bir PDF karnesine dönüştürme.

### 🎓 2. Öğrenci Portalı
- **Kişiselleştirilmiş Akış:** Sadece öğrenciye ve tüm sınıfa atanan ödevleri görme.
- **Geri Sayımlı İnteraktif Test Çözücü:** Süre bitince otomatik teslim, anlık puanlama, doğru/yanlış cevap analizi ve konfeti kutlaması.
- **Ders Notu Görüntüleyici & İndirici:** PDF, görsel ve metin notlarını tek tıkla cihazına indirme.
- **Fotoğraflı Kitap Ödevi Teslimi:** Çözülen test kitabı sayfasının fotoğrafını çekip/yükleyip hocaya iletme.

### 🤖 3. Google Gemini Pro AI Yetenekleri (`/api/ai`)
- **Otomatik Test Üretici (AI Quiz Generator):** Öğretmenin girdiği konu başlığından anında soru, doğru cevap ve çözümleri üretir.
- **Ders Notu & Özet Hazırlayıcı (AI Lesson Notes):** Herhangi bir konu için anlaşılır, formüllü, örnekli ders özeti çıkarır.
- **Akıllı Öğretmen Yorumu (AI Pedagogical Feedback):** Öğrencinin test skorunu ve hatalarını analiz ederek motive edici öğretmen yorumu yazar.
- **Adım Adım Soru Çözüm Asistanı (AI Soru Açıklayıcı):** Öğrencinin yanlış yaptığı soruları samimi bir dille adım adım çözer ve açıklar.
- **Eğitim Danışmanı (AI Chat Assistant):** Ders planlama ve soru sorma robotu.

---

## 🚀 Kurulum ve Yerel Çalıştırma

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Gemini API Anahtarınızı Tanımlayın (İsteğe Bağlı):**
   `.env.local` dosyasını açıp [Google AI Studio](https://aistudio.google.com/app/apikey) üzerinden aldığınız anahtarı ekleyin:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
   *(Not: API anahtarı eklenmese dahi akıllı şablon motoru sayesinde tüm özellikler sorunsuz çalışır.)*

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

4. **Projeyi Derleyin (Production Build):**
   ```bash
   npm run build
   ```

---

## ☁️ Vercel'e Deploy Etme

Bu proje Vercel ile %100 uyumlu Next.js App Router standartlarında geliştirilmiştir.

1. Projeyi GitHub reponuza push edin:
   ```bash
   git add .
   git commit -m "feat: EduFlow Pro Next.js and Gemini AI migration"
   git push origin main
   ```
2. [Vercel Dashboard](https://vercel.com/new) üzerinden GitHub reponuzu bağlayıp **Deploy** butonuna tıklayın.
3. Environment Variables kısmına `GEMINI_API_KEY` değerinizi ekleyin.

---

## 🔐 Kimlik Doğrulama & Veritabanı Mimarisi

- **Kurumsal Supabase Auth:** Öğretmen ve öğrenciler kendi e-posta ve şifreleri ile güvenli şekilde kayıt olabilir (`fullName` ve `role` metadata aktarımı ile).
- **E-posta Doğrulama:** Otomatik e-posta onay akışı ve callback yakalayıcı.
- **Sınıf Yönetimi:** Öğretmenler sınıflarına doğrudan öğrenci profili tanımlayabilir ve şifre atayabilir.
- **Dinamik Veri Akışı:** Ödevler ve teslim kayıtları kullanıcı bazlı gerçek Supabase tabloları ve yerel reaktif önbellek ile anlık senkronize edilir.

