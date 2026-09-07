import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BEECARBONIT — Facility Management',
  description: 'Plateforme de gestion de patrimoine, GMAO et ESG pour les bâtiments tertiaires',
  keywords: ['GMAO', 'BIM', 'ESG', 'CSRD', 'Facility Management', 'BEECARBONIT'],
};

export const viewport: Viewport = {
  themeColor: '#f38020',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
