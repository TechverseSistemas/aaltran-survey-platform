import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from '@/shared/providers';
import { Toaster } from 'sonner';
import { AuthContextProvider } from '@/context/authProvider';

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${montSerrat.className} antialiased`}>
        <AuthContextProvider>
          
          <Providers>{children}</Providers>

          <Toaster richColors duration={5000} />
        </AuthContextProvider>
      </body>
    </html>
  );
}
