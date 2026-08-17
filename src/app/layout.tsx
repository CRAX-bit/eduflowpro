import type { Metadata, Viewport } from 'next';
import './globals.css';
import { EduFlowProvider } from '@/context/EduFlowContext';
import { Toast } from '@/components/Toast';
import { AuthModal } from '@/components/AuthModal';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'EduFlow Pro — Özel Ders & Sınıf Yönetim Platformu',
  description:
    'Özel ders ve sınıf takibinde kaosu bitirin. Ders notları, interaktif süreli testler, fotoğraflı ödev teslimi ve yapay zeka gücüyle öğrenci başarısını katlayın.',
  keywords: [
    'Özel Ders',
    'EduFlow Pro',
    'Ders Takip',
    'Ödev Takip',
    'Gemini AI',
    'İnteraktif Test',
    'Gelişim Karnesi',
  ],
  authors: [{ name: 'EduFlow Pro Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-[#f8fafc]">
      <body className="antialiased bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white min-h-screen">
        <EduFlowProvider>
          {children}
          <AuthModal />
          <Toast />
        </EduFlowProvider>
      </body>
    </html>
  );
}
