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
  title: 'EduFlow Pro — Özel Ders Yönetim Platformu & Yapay Zeka Asistanı',
  description:
    'Özel ders takibinde kaosu bitirin. Ders notları, interaktif süreli testler, fotoğraflı ödev teslimi ve Google Gemini Pro yapay zeka gücüyle öğrenci başarısını katlayın.',
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
    <html lang="tr" className="dark">
      <body className="antialiased bg-[#0a0f1d] text-[#e8edf7] selection:bg-[#00f2fe] selection:text-[#04121a]">
        <EduFlowProvider>
          {children}
          <AuthModal />
          <Toast />
        </EduFlowProvider>
      </body>
    </html>
  );
}
