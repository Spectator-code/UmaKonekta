'use client';

<<<<<<< HEAD
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useLanguage } from '@/lib/LanguageContext';
=======
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
<<<<<<< HEAD
  const { language, setLanguage, t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: t('marketplace'), href: '/marketplace' },
    { label: t('smartCalendar'), href: '/bulletin-notice' },
    { label: t('farmerLedger'), href: '/farmer-dashboard' },
    { label: t('operatorDispatch'), href: '/dispatch-slip' },
    { label: t('saccoSplitReceipt'), href: '/sacco-receipt' },
  ];

  const dashboardUrl = session?.user?.role === 'provider' 
    ? '/provider-dashboard' 
    : session?.user?.role === 'mechanic'
    ? '/mechanics/portal'
    : session?.user?.role === 'admin' 
    ? '/admin' 
    : '/farmer-dashboard';

=======

  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Farmer Ledger', href: '/farmer-dashboard' },
    { label: 'Operator Dispatch', href: '/dispatch-slip' },
    { label: 'SACCO Split Receipt', href: '/sacco-receipt' },
    { label: 'Barangay Bulletin', href: '/bulletin-notice' },
  ];

>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
  return (
    <header className="fixed top-0 w-full z-50 bg-cream-surface/95 backdrop-blur-xl border-b border-border-soft shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
<<<<<<< HEAD
          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-primary/20 overflow-hidden">
            <img 
              src="/umakonekta-logo.jpg" 
              alt="UMAKONEKTA Logo" 
              className="w-full h-full object-contain"
            />
=======
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
            <span className="material-symbols-outlined text-[24px]">agriculture</span>
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-lg font-extrabold tracking-tight text-primary">UMAKONEKTA</span>
            <span className="text-[11px] font-mono tracking-wider text-soil-slate uppercase hidden sm:inline">
              Agri Resource Exchange • DA-LGU
            </span>
          </div>
        </Link>

        {/* Primary Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Hotline Button */}
          <a
            href="tel:1343"
            aria-label="Call Emergency Hotline 1343"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-status-urgent-bg text-status-urgent font-bold text-xs hover:bg-status-urgent hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">emergency</span>
            <span className="hidden md:inline">Hotline 1343</span>
          </a>

<<<<<<< HEAD
          {/* User Profile Avatar with Dropdown & Sign Out */}
          {status === 'loading' ? (
            <div className="w-9 h-9 rounded-full bg-surface-container animate-pulse" />
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:ring-2 hover:ring-primary/40 focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold uppercase shadow-xs"
                title={session.user.name}
              >
                {session.user.name?.[0] || <span className="material-symbols-outlined text-[20px]">person</span>}
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-border-soft shadow-xl py-3 px-3 z-50 flex flex-col gap-2 animate-in fade-in duration-150">
                  {/* User Info Header */}
                  <div className="px-3 py-2 bg-surface-container-low rounded-xl border border-border-soft/60">
                    <p className="text-sm font-black text-on-surface truncate">{session.user.name}</p>
                    <p className="text-[11px] font-mono text-soil-slate truncate mt-0.5">
                      ID: {session.user.registryId || 'Verified Member'}
                    </p>
                    <span className="inline-block px-2 py-0.5 mt-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {session.user.role || 'Member'}
                    </span>
                  </div>

                  {/* Navigation Links inside Profile */}
                  <div className="flex flex-col gap-1 py-1">
                    <Link
                      href={dashboardUrl}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      <span>{t('dashboard')}</span>
                    </Link>
                    <Link
                      href="/marketplace"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">agriculture</span>
                      <span>{t('marketplace')}</span>
                    </Link>
                  </div>

                  {/* Quick Role Portals Navigation */}
                  <div className="pt-2 border-t border-border-soft/80">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-soil-slate font-bold px-1 mb-1.5 block">
                      Switch Role Portal
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Link
                        href="/farmer-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                          session?.user?.role === 'farmer' ? 'bg-primary/10 text-primary font-black' : 'bg-surface-container-low text-soil-slate hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">person</span>
                        <span>Farmer</span>
                      </Link>
                      <Link
                        href="/provider-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                          session?.user?.role === 'provider' ? 'bg-primary/10 text-primary font-black' : 'bg-surface-container-low text-soil-slate hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">corporate_fare</span>
                        <span>Provider</span>
                      </Link>
                      <Link
                        href="/mechanics/portal"
                        onClick={() => setProfileOpen(false)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                          session?.user?.role === 'mechanic' ? 'bg-primary/10 text-primary font-black' : 'bg-surface-container-low text-soil-slate hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">handyman</span>
                        <span>Mechanic</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                          session?.user?.role === 'admin' ? 'bg-primary/10 text-primary font-black' : 'bg-surface-container-low text-soil-slate hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">shield_person</span>
                        <span>Admin</span>
                      </Link>
                    </div>
                  </div>

                  {/* Multi-Language Selector: English • Tagalog • Bisaya */}
                  <div className="pt-2 border-t border-border-soft/80">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-soil-slate font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">translate</span>
                        <span>{t('language')}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-primary">
                        {language === 'en' ? 'EN' : language === 'tl' ? 'FIL' : 'CEB'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-xl border border-border-soft">
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                          language === 'en'
                            ? 'bg-primary text-white shadow-2xs font-extrabold'
                            : 'text-soil-slate hover:text-primary hover:bg-white'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('tl')}
                        className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                          language === 'tl'
                            ? 'bg-primary text-white shadow-2xs font-extrabold'
                            : 'text-soil-slate hover:text-primary hover:bg-white'
                        }`}
                      >
                        Tagalog
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('ceb')}
                        className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                          language === 'ceb'
                            ? 'bg-primary text-white shadow-2xs font-extrabold'
                            : 'text-soil-slate hover:text-primary hover:bg-white'
                        }`}
                      >
                        Bisaya
                      </button>
                    </div>
                  </div>

                  {/* Transferred Sign Out Button */}
                  <div className="pt-2 border-t border-border-soft">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-field-ochre text-white text-xs font-bold hover:bg-field-ochre/90 active:scale-[0.98] transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
=======
          {/* User Profile Avatar Link / Auth Button */}
          {status === 'loading' ? (
            <div className="w-9 h-9 rounded-full bg-surface-container animate-pulse" />
          ) : session ? (
            <Link
              href={session.user.role === 'provider' ? '/provider-dashboard' : '/farmer-dashboard'}
              aria-label="Go to Dashboard"
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:ring-2 hover:ring-primary/40 transition-all font-bold uppercase"
              title={session.user.name}
            >
              {session.user.name?.[0] || <span className="material-symbols-outlined text-[20px]">person</span>}
            </Link>
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
          ) : (
            <button
              onClick={() => signIn()}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
