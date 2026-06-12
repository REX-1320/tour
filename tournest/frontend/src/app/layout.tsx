import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TourNest | Premium Travel Experiences',
  description: 'Curated premium travel experiences for the modern explorer. Discover the world with unparalleled elegance and comfort.',
};

import { AuthProvider } from '@/context/AuthContext';
import { RegionProvider } from '@/context/RegionContext';
import FloatingConcierge from '@/components/ui/FloatingConcierge';
import WeatherFluidBackground from '@/components/ui/WeatherFluidBackground';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <RegionProvider>
            <WeatherFluidBackground forcedWeather="default" />
            <Navbar />
            <main className="flex-grow flex flex-col relative z-10 w-full overflow-x-hidden">
              {children}
            </main>
            <Footer />
            <FloatingConcierge />
          </RegionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
