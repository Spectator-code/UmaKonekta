'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
  };

  const featureCards = [
    {
      title: 'Equipment Marketplace',
      tagline: '4WD Tractors, Harvesters & Implements',
      desc: 'Discover vetted agricultural machinery across neighboring barangays. Review operator inclusion, diesel terms, and transparent per-hectare rates.',
      icon: 'agriculture',
      href: '/marketplace',
      badge: '840+ Machines Active',
      color: 'border-primary/20 hover:border-primary',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-primary text-on-primary',
    },
    {
      title: 'Farmer Passbook & Ledger',
      tagline: 'Cooperative Balances & Booking History',
      desc: 'View your RSBSA member balance, track upcoming tillage and harvesting requests, and inspect palay sack credits without needing internet banking.',
      icon: 'account_balance_wallet',
      href: '/farmer-dashboard',
      badge: 'Zero Transaction Fee',
      color: 'border-secondary/20 hover:border-secondary',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-field-ochre text-white',
    },
    {
      title: 'Operator Field Dispatch Slip',
      tagline: 'Digital Job Tickets for Machine Drivers',
      desc: 'Complete field slips with diesel tank readings, worked hectares, and client cash-on-dike collection verifications right from tractor cabs.',
      icon: 'receipt_long',
      href: '/dispatch-slip',
      badge: 'Works 100% Offline',
      color: 'border-soil-slate/20 hover:border-soil-slate',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-soil-slate text-cream-surface',
    },
    {
      title: 'Palay SACCO Scale Ticket',
      tagline: 'Grain Moisture & Harvest Split Thermal Receipt',
      desc: 'Calculate gross, tare, and net weights with official moisture deductions (MC 14% base). Generates high-contrast thermal printable scale tickets.',
      icon: 'scale',
      href: '/sacco-receipt',
      badge: 'Eco Print Ready',
      color: 'border-leaf-green/20 hover:border-leaf-green',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-leaf-green text-white',
    },
    {
      title: 'Barangay Hall Public Bulletin',
      tagline: 'Official Rotation & Irrigation Schedules',
      desc: 'Official DA-LGU community advisory notice board. View shared combine harvester schedules, NIA water canal releases, and fuel subsidy alerts.',
      icon: 'campaign',
      href: '/bulletin-notice',
      badge: 'DA-LGU Certified',
      color: 'border-harvest-amber/30 hover:border-harvest-amber',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-harvest-amber text-on-surface',
    },
  ];

  return (
    <div className="flex flex-col pb-16">
      
      {/* 1. Slim, High-Visibility Emergency Strip (Absolute Top) */}
      <div className="bg-status-urgent-bg border-b border-status-urgent/30 w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-status-urgent">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="font-bold text-xs sm:text-sm">Urgent Machinery Breakdown or Flood Gate Advisory?</span>
          </div>
          <a
            href="tel:1343"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-status-urgent text-white font-bold text-xs hover:bg-status-urgent/90 transition-colors shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">call</span>
            Call 1343 Action Center
          </a>
        </div>
      </div>

      {/* 2. Simplified & Prominent Global Search Bar */}
      <section className="bg-surface-container-lowest border-b border-border-soft px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <div className="absolute left-4 text-primary">
              <span className="material-symbols-outlined text-[28px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What equipment do you need? (e.g., Tractor, Harvester, Drone)..."
              className="w-full pl-14 pr-32 py-4 rounded-2xl bg-white border-2 border-border-soft focus:border-primary focus:outline-none text-base sm:text-lg font-bold text-on-surface placeholder:text-soil-slate/50 shadow-sm transition-colors"
            />
            <div className="absolute right-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container shadow-md transition-all flex items-center gap-2"
              >
                <span>Search</span>
              </button>
            </div>
          </form>
          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 text-xs">
            <span className="font-mono text-soil-slate font-medium">Trending:</span>
            {['Combine Harvester', 'Rotary Tiller 4WD', 'Rice Transplanter', 'Palay Solar Dryer'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  router.push(`/marketplace?q=${encodeURIComponent(tag)}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-border-soft text-soil-slate font-bold hover:text-primary hover:border-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Hero Section (Re-positioned below search) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low/80 via-surface/40 to-cream-surface pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border-soft text-center sm:text-left">
        <div className="max-w-6xl mx-auto flex flex-col items-center sm:items-start">
          {/* Official Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Official Philippine Agrarian Resource Exchange • DA-LGU
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight max-w-4xl mb-6">
            Modern Farm Machinery within Reach of Every Barangay.
          </h1>
          <p className="text-base sm:text-xl text-soil-slate max-w-3xl leading-relaxed font-medium">
            Decentralized 4WD tractor and combine harvester bookings for smallholder farmers. Settle directly on the field dike via <strong className="text-primary font-black">Cash-on-Dike</strong> or charge to your accredited <strong className="text-primary font-black">Cooperative Passbook</strong>. Zero payment gateway commissions.
          </p>
        </div>
      </section>

      {/* Metrics Ribbon */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface-container-low border border-border-soft">
          <div className="border-r border-border-soft/60 last:border-0 pr-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">842+</p>
            <p className="text-xs text-soil-slate font-bold mt-1">Verified Implements & Machinery</p>
          </div>
          <div className="border-r border-border-soft/60 last:border-0 pr-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-field-ochre font-mono">₱0.00</p>
            <p className="text-xs text-soil-slate font-bold mt-1">Digital Checkout / Gateway Fees</p>
          </div>
          <div className="border-r border-border-soft/60 last:border-0 pr-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-leaf-green font-mono">2,410</p>
            <p className="text-xs text-soil-slate font-bold mt-1">RSBSA Registered Beneficiaries</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">47</p>
            <p className="text-xs text-soil-slate font-bold mt-1">Agrarian Barangays Connected</p>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Agrarian Operations Suite</h2>
            <p className="text-sm text-soil-slate font-medium">Interconnected modules built for Philippine rice and crop cycles</p>
          </div>
          <span className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hidden sm:inline">
            5 Core Pathways
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group p-6 rounded-2xl bg-gradient-to-br ${card.bgGradient} border ${card.color} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs`}>
                    <span className="material-symbols-outlined text-[26px]">{card.icon}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-white border border-border-soft text-soil-slate">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-lg font-black text-on-surface group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-bold text-soil-slate mt-0.5 mb-3">{card.tagline}</p>
                <p className="text-xs text-soil-slate/80 leading-relaxed font-medium">{card.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border-soft/60 flex items-center justify-between text-xs font-black text-primary group-hover:translate-x-1 transition-transform">
                <span>Open Module</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cash-on-Dike & Passbook Standard Explainer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
        <div className="p-8 rounded-3xl bg-surface-container-low border border-border-soft grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-harvest-amber/20 text-field-ochre font-bold text-xs mb-3">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Agrarian Financial Architecture
            </div>
            <h3 className="text-2xl font-black text-on-surface tracking-tight mb-3">
              Why UMAKONEKTA Has Zero Digital Checkout Gateways
            </h3>
            <p className="text-sm text-soil-slate leading-relaxed font-medium mb-4">
              Unlike consumer platforms that mandate credit cards or digital e-wallets, Philippine agrarian operations thrive on trusted physical relationships and cooperative trust. Machinery operators inspect soil moisture directly at the dike, verify hectare boundary markers, and settle payments in cash or through SACCO palay grain share splits.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-border-soft">
                <div className="font-bold text-primary flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Cash-on-Dike Protocol
                </div>
                <p className="text-soil-slate font-medium">Payment is handed to machine operators only after field completion is verified.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-border-soft">
                <div className="font-bold text-primary flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Cooperative Passbook Ledger
                </div>
                <p className="text-soil-slate font-medium">Costs are debited against member harvest shares at the municipal agricultural cooperative.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-soft shadow-xs text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-status-available-bg text-status-available flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">shield_person</span>
            </div>
            <h4 className="font-black text-base text-on-surface">PhilMech Certified</h4>
            <p className="text-xs text-soil-slate font-medium mt-1 mb-4">
              Standardized custom rate cards conforming to DA-Bureau of Agricultural and Fisheries Engineering standards.
            </p>
            <Link
              href="/sacco-receipt"
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
            >
              Inspect SACCO Scale Formula
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
