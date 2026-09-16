import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import AiChatWidget from '@/components/ai-chat-widget';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SiMantap — Sistem Informasi Manajemen Peternakan Terpadu',
  description:
    'Portal resmi Bidang Peternakan dan Kesehatan Hewan, Dinas Pertanian dan Pangan Kabupaten Kebumen. Merangkum data Perbibitan & Produksi, Kesehatan Hewan, dan Kesehatan Masyarakat Veteriner.',
  icons: {
    icon: [
      { url: '/logo-circle.svg', type: 'image/svg+xml' },
      { url: '/logo-simantap.png', type: 'image/png' },
    ],
    shortcut: '/logo-circle.svg',
    apple: '/logo-circle.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var theme = localStorage.getItem('simantap_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-600 selection:text-white">
        {children}
        <AiChatWidget />
      </body>
    </html>
  );
}