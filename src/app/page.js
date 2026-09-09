'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
  };

  // 4 Primary Directory Workflow Pillars (In-Scope)
  const featureCards = [
    {
      title: 'Resource Marketplace',
      tagline: 'Search & Discover Farm Machinery',
      desc: 'Location and category-based text search. Filter tractors, harvesters, transplanters, and implements across neighboring barangays with transparent per-hectare rates.',
      icon: 'agriculture',
      href: '/marketplace',
      badge: 'Text & Category Search',
      color: 'border-primary/20 hover:border-primary',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-primary text-on-primary',
    },
    {
      title: 'Farmer Request Portal',
      tagline: 'Simple Equipment Request Submissions',
      desc: 'RSBSA registered farmers can submit simple machinery requests, specify parcel sectors and target dates, and review request statuses.',
      icon: 'person',
      href: '/farmer-dashboard',
      badge: 'Simple Request Submission',
      color: 'border-secondary/20 hover:border-secondary',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-field-ochre text-white',
    },
    {
      title: 'Provider Resource Hub',
      tagline: 'Manual Creation & Editing of Listings',
      desc: 'Agrarian cooperatives and machinery owners can manually create, update specifications, adjust pricing, and manage equipment availability in real-time.',
      icon: 'corporate_fare',
      href: '/provider-dashboard',
      badge: 'Manual Listing Management',
      color: 'border-soil-slate/20 hover:border-soil-slate',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-soil-slate text-cream-surface',
    },
    {
      title: 'Admin Directory & Roles',
      tagline: 'User Registration & Role Management',
      desc: 'LGU Municipal Agriculture Office oversight for registering farmers, creating official physical ID slips, and managing directory roles (Admin, Provider, Farmer).',
      icon: 'shield_person',
      href: '/admin',
      badge: 'Role & User Management',
      color: 'border-leaf-green/20 hover:border-leaf-green',
      bgGradient: 'from-surface-container-low to-cream-surface',
      iconBg: 'bg-leaf-green text-white',
    },
  ];

  return (
    <div className="flex flex-col pb-16">
      {/* 1. Global Text & Category Search Bar */}
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
              placeholder="Search by equipment category, model, or barangay location..."
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
          {/* Quick Category Filter Tags */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 text-xs">
            <span className="font-mono text-soil-slate font-medium">Quick Categories:</span>
            {['Combine Harvester', '4WD Tractor', 'Rice Transplanter', 'Irrigation Pump', 'Grain Dryer'].map((tag) => (
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

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low/80 via-surface/40 to-cream-surface pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border-soft text-center sm:text-left">
        {/* Faded Background Watermark / Graphic with smooth mask gradient */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25 bg-cover bg-center sm:bg-right mix-blend-multiply"
          style={{ 
            backgroundImage: `url('/UMAKONEKTA%20(5).png')`,
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.95) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.95) 100%)'
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto flex flex-col items-center sm:items-start">
          {/* Official Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Philippine Agrarian Resource Directory & Exchange
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight max-w-4xl mb-6">
            Connecting Farmers with Essential Agricultural Equipment.
          </h1>
          <p className="text-base sm:text-xl text-soil-slate max-w-3xl leading-relaxed font-medium mb-8">
            A streamlined agricultural resource directory. Empowering <strong className="text-primary font-black">Farmers</strong> to submit simple requests, <strong className="text-primary font-black">Providers</strong> to manage equipment listings, and <strong className="text-primary font-black">Admins</strong> to maintain user registrations and roles across barangays.
          </p>

          {/* Call To Action Buttons based on Auth */}
          <div className="flex flex-wrap items-center gap-3">
            {session ? (
              <Link
                href={session.user?.role === 'provider' ? '/provider-dashboard' : session.user?.role === 'admin' ? '/admin' : '/farmer-dashboard'}
                className="px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm sm:text-base hover:bg-primary-container shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Go to My Dashboard ({session.user?.name?.split(' ')[0] || 'Member'})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm sm:text-base hover:bg-primary-container shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Sign In to Access Directory & Requests</span>
              </Link>
            )}

            <Link
              href="/marketplace"
              className="px-6 py-3.5 rounded-2xl bg-white border-2 border-border-soft text-on-surface font-extrabold text-sm sm:text-base hover:border-primary hover:text-primary transition-all flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[20px]">travel_explore</span>
              <span>Search Directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. In-Scope Feature Modules Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Directory Modules & Role Portals</h2>
            <p className="text-sm text-soil-slate font-medium">Core workflows for farmers, equipment providers, and administrators</p>
          </div>
          <span className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hidden sm:inline">
            Directory Portals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group p-5 rounded-2xl bg-gradient-to-br ${card.bgGradient} border ${card.color} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs`}>
                    <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-border-soft text-soil-slate inline-block mb-2">
                  {card.badge}
                </span>
                <h3 className="text-base font-black text-on-surface group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-bold text-soil-slate mt-0.5 mb-2">{card.tagline}</p>
                <p className="text-xs text-soil-slate/80 leading-relaxed font-medium">{card.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-border-soft/60 flex items-center justify-between text-xs font-black text-primary group-hover:translate-x-1 transition-transform">
                <span>Enter Portal</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
