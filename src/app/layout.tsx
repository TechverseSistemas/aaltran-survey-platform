import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montSerrat = Montserrat({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AALTRAN - Sistema de Formulários',
  description: 'Sistema de gerenciamento de formulários da AALTRAN',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montSerrat.className} antialiased`}>{children}</body>
    </html>
  );
}
