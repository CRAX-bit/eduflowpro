import type { Metadata, Viewport } from 'next';
import './globals.css';
import { EduFlowProvider } from '@/context/EduFlowContext';
import { Toast } from '@/components/Toast';
import { AuthModal } from '@/components/AuthModal';
import { Analytics } from '@vercel/analytics/next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Deskio | Akıllı Ödev ve Sınıf Masası',
  description:
    'Öğretmenler ve öğrenciler için yeni nesil akıllı ödev, ders notu ve sınıf çalışma masası. Yapay zeka destekli rubrik analizi ve başarı takibi.',
  keywords: [
    'Deskio',
    'Sınıf Masası',
    'Ödev Masası',
    'Özel Ders',
    'Ödev Takip',
    'Yapay Zeka Notlama',
    'İnteraktif Test',
  ],
  authors: [{ name: 'Deskio Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-[#f8fafc]">
      <body className="antialiased bg-[#f8fafc] text-slate-950 selection:bg-blue-600 selection:text-white min-h-screen">
        <EduFlowProvider>
          {children}
          <AuthModal />
          <Toast />
        </EduFlowProvider>
        <Analytics />
      </body>
    </html>
  );
}
