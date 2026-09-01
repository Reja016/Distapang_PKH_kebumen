import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import AiChatWidget from '@/components/ai-chat-widget';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SiMantap — Sistem Informasi Manajemen Peternakan Terpadu',
  description:
    'Portal resmi Bidang Peternakan dan Kesehatan Hewan, Dinas Pertanian dan Pangan Kabupaten Kebumen. Merangkum data Perbibitan & Produksi, Kesehatan Hewan, dan Kesehatan Masyarakat Veteriner.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-600 selection:text-white">
        {children}
        <AiChatWidget />
      </body>
    </html>
  );
}