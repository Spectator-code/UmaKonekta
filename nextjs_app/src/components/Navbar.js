'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState('Farmer');

  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Farmer Ledger', href: '/farmer-dashboard' },
    { label: 'Operator Dispatch', href: '/dispatch-slip' },
    { label: 'SACCO Split Receipt', href: '/sacco-receipt' },
    { label: 'Barangay Bulletin', href: '/bulletin-notice' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-cream-surface/95 backdrop-blur-xl border-b border-border-soft shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
            <span className="material-symbols-outlined text-[24px]">agriculture</span>
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
          {/* Active Role Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg text-xs font-mono">
            <span className="text-soil-slate">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              aria-label="Active Agrarian Role"
              className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="Farmer">🌾 Farmer Member</option>
              <option value="Provider">🚜 Resource Provider</option>
              <option value="Operator">⚙️ Machine Operator</option>
              <option value="Barangay">🏛️ Barangay Desk</option>
            </select>
          </div>

          {/* Emergency Hotline Button */}
          <a
            href="tel:1343"
            aria-label="Call Emergency Hotline 1343"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-status-urgent-bg text-status-urgent font-bold text-xs hover:bg-status-urgent hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">emergency</span>
            <span className="hidden md:inline">Hotline 1343</span>
          </a>

          {/* User Profile Avatar Link */}
          <Link
            href="/farmer-dashboard"
            aria-label="Go to Farmer Dashboard Profile"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:ring-2 hover:ring-primary/40 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
