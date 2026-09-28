import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OfflineIndicator from '../components/OfflineIndicator';
import MunicipalityOnboarding from '../components/MunicipalityOnboarding';
import NextAuthSessionProvider from '@/components/SessionProvider';
import { AccessibilityProvider } from '@/lib/AccessibilityContext';
import SkipToContent from '@/components/SkipToContent';
import CommandPalette from '@/components/CommandPalette';
import MainContentWrapper from '@/components/MainContentWrapper';
import TrafficTracker from '@/components/TrafficTracker';
import FloatingScrollControls from '@/components/FloatingScrollControls';
import { ConfirmDialogProvider } from '@/components/ConfirmDialogProvider';
import ContentProtection from '@/components/ContentProtection';

export const metadata = {
  title: 'UMAKONEKTA - Philippine Agricultural Resource Exchange Platform',
  description:
    'Decentralized agrarian machinery rental, operator dispatch, palay harvest SACCO scale ticketing, and cooperative passbook ledgers for Philippine farmers.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  keywords: [
    'Umakonekta',
    'Philippine Agriculture',
    'Tractor Rental',
    'Combine Harvester',
    'Palay Harvest',
    'RSBSA',
    'Cooperative Passbook',
    'Cash on Dike',
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#005426',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-surface text-on-surface antialiased selection:bg-primary selection:text-on-primary select-none">
        <NextAuthSessionProvider>
            <AccessibilityProvider>
              <ConfirmDialogProvider>
                <ContentProtection />
                <SkipToContent />
                <TrafficTracker />
                <Navbar />
                <CommandPalette />
                <MunicipalityOnboarding />
                <MainContentWrapper>
                  {children}
                </MainContentWrapper>
                <Footer />
                <OfflineIndicator />
                <FloatingScrollControls />
              </ConfirmDialogProvider>
            </AccessibilityProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
