import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OfflineIndicator from '../components/OfflineIndicator';
import MunicipalityOnboarding from '../components/MunicipalityOnboarding';
import NextAuthSessionProvider from '@/components/SessionProvider';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata = {
  title: 'UMAKONEKTA - Philippine Agricultural Resource Exchange Platform',
  description:
    'Decentralized agrarian machinery rental, operator dispatch, palay harvest SACCO scale ticketing, and cooperative passbook ledgers for Philippine farmers.',
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
      <body className="min-h-screen flex flex-col bg-cream-surface text-on-surface antialiased selection:bg-primary selection:text-on-primary">
        <NextAuthSessionProvider>
          <LanguageProvider>
            <Navbar />
            <MunicipalityOnboarding />
            <main className="flex-1 pt-20">
              {children}
            </main>
            <Footer />
            <OfflineIndicator />
          </LanguageProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
