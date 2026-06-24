import React from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'QuizVerse AI — Learn, Play, Conquer',
  description: 'A next-generation AI-powered real-time multiplayer quiz platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="bg-dark-900 text-white min-h-screen overflow-x-hidden antialiased font-sans">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f0f2d',
                color: '#fff',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(8px)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
