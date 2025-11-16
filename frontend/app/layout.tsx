import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import HashConverter from '@/components/HashConverter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flask SSO Demo',
  description: 'Single Sign-On authentication demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HashConverter />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

