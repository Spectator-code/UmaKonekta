'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Search,
  X,
  ChevronDown,
  Sparkles,
  Tractor,
  Wheat,
  Sprout,
  Droplets,
  Sun,
  Plane,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  SlidersHorizontal,
  Check,
  AlertTriangle
} from 'lucide-react';

const quickCategories = [
  { key: 'Harvester', label: 'Combine Harvester', shortLabel: 'Harvester', desc: 'Palay Harvesting', icon: Wheat, badge: 'Popular', bg: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300' },
  { key: 'Tractor', label: '4WD Tractor', shortLabel: 'Tractor', desc: 'Land Prep & Plowing', icon: Tractor, badge: 'High Demand', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' },
  { key: 'Transplanter', label: 'Rice Transplanter', shortLabel: 'Transplanter', desc: 'Fast Seedling', icon: Sprout, badge: 'Planting', bg: 'bg-green-50 text-green-900 border-green-200 hover:bg-green-100 hover:border-green-300' },
  { key: 'Drone', label: 'Agri Spray Drone', shortLabel: 'Spray Drone', desc: 'Precision Spraying', icon: Plane, badge: 'Tech', bg: 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100 hover:border-sky-300' },
  { key: 'Irrigation', label: 'Irrigation Pump', shortLabel: 'Water Pump', desc: 'Field Flooding', icon: Droplets, badge: 'Subsidized', bg: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100 hover:border-blue-300' },
  { key: 'Dryer', label: 'Grain Dryer', shortLabel: 'Grain Dryer', desc: 'Mechanical Drying', icon: Sun, badge: 'Post-Harvest', bg: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100 hover:border-orange-300' },
];

const popularEquipment = [
  { name: 'Kubota DC-70 Plus Combine Harvester', category: 'Harvester', location: 'Brgy. Mankilam', rate: '₱3,800 / ha', icon: Wheat },
  { name: 'Yanmar EF494T 4WD Tractor (Rotavator)', category: 'Tractor', location: 'Brgy. Apokon', rate: '₱2,200 / ha', icon: Tractor },
  { name: 'DJI Agras T40 Precision Spray Drone', category: 'Drone', location: 'Brgy. San Miguel', rate: '₱850 / ha', icon: Plane },
  { name: 'Kubota NSP-4W Walk-Behind Transplanter', category: 'Transplanter', location: 'Brgy. Canocotan', rate: '₱1,800 / ha', icon: Sprout },
  { name: 'Kubota Diesel 4" Irrigation Water Pump', category: 'Irrigation', location: 'Brgy. Magugpo', rate: '₱1,200 / day', icon: Droplets },
  { name: 'Mechanical Flatbed Grain Dryer 6-Ton', category: 'Dryer', location: 'Brgy. Visayan Village', rate: '₱45 / bag', icon: Sun },
];




export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-surface flex items-center justify-center text-soil-slate font-bold">Loading Umakonekta...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLocation, setActiveLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Sync active location from URL parameter or localStorage
  useEffect(() => {
    const locParam = searchParams.get('location');
    if (locParam) {
      setActiveLocation(locParam);
      localStorage.setItem('umakonekta_municipality', locParam);
      window.dispatchEvent(new Event('municipality_selected'));
    } else {
      const saved = localStorage.getItem('umakonekta_municipality');
      if (saved) setActiveLocation(saved);
    }

    const handleLocUpdate = () => {
      const saved = localStorage.getItem('umakonekta_municipality');
      if (saved) setActiveLocation(saved);
    };

    window.addEventListener('municipality_selected', handleLocUpdate);
    return () => window.removeEventListener('municipality_selected', handleLocUpdate);
  }, [searchParams]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setIsCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsCategoryMenuOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    const queryStr = params.toString();
    router.push(`/marketplace${queryStr ? `?${queryStr}` : ''}`);
  };

  const handleCategorySelect = (catKey) => {
    setSelectedCategory(catKey);
    setIsCategoryMenuOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (catKey && catKey !== 'All') {
      params.set('category', catKey);
    }
    const queryStr = params.toString();
    router.push(`/marketplace${queryStr ? `?${queryStr}` : ''}`);
  };


  const handleSuggestionSelect = (item) => {
    setSearchQuery(item.name);
    setSelectedCategory(item.category);
    setIsDropdownOpen(false);
    router.push(`/marketplace?q=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category)}`);
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
      {/* ============================================================================
          1. EDUCATIONAL NOTICE BANNER
          ============================================================================ */}
      <aside
        aria-label="Testing Environment Warning"
        className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2.5 sm:py-3 text-amber-950"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-amber-600 text-lg sm:text-xl shrink-0 font-bold animate-pulse">
              warning
            </span>
            <p className="leading-snug">
              <strong className="font-black uppercase tracking-wider text-amber-900 mr-1.5">
                Educational Demonstration System:
              </strong>
              <span>
                All machinery, equipment data, photos, and rates shown are <strong>simulated for testing purposes only. None of the listed equipment is real or available for commercial and Industrial transactions</strong>.
              </span>
            </p>
          </div>
          <span className="shrink-0 hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-amber-500/20 text-amber-900 border border-amber-500/30">
            Academic / Test Build
          </span>
        </div>
      </aside>

      {/* ============================================================================
          2. GLOBAL TEXT & CATEGORY SEARCH BAR
          ============================================================================ */}
      <section className="bg-gradient-to-b from-surface-container-lowest to-surface-container-low/30 border-b border-border-soft px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="max-w-4xl mx-auto" ref={searchContainerRef}>


          {/* Unified Search Capsule Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl sm:rounded-full border-2 border-primary/25 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 shadow-lg shadow-emerald-900/5 transition-all p-1.5 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Category Dropdown Selector */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryMenuOpen(!isCategoryMenuOpen);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-full text-xs font-black transition-colors border cursor-pointer ${selectedCategory !== 'All'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-border-soft'
                    }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>
                      {selectedCategory === 'All'
                        ? 'All Equipment'
                        : quickCategories.find((c) => c.key === selectedCategory)?.label || selectedCategory}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Category Dropdown Menu */}
                {isCategoryMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl border border-border-soft shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-soil-slate border-b border-border-soft/60">
                      Filter by Machine Type
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('All')}
                      className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer ${selectedCategory === 'All' ? 'text-primary font-black bg-emerald-50/60' : 'text-on-surface'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-soil-slate/40" />
                        <span>All Equipment Categories</span>
                      </span>
                      {selectedCategory === 'All' && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    {quickCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleCategorySelect(cat.key)}
                          className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer ${isSelected ? 'text-primary font-black bg-emerald-50/60' : 'text-on-surface'
                            }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-primary" />
                            <span>{cat.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-px h-7 bg-border-soft/80 shrink-0" />

              {/* Search Text Input */}
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="w-5 h-5 text-primary ml-2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    setIsCategoryMenuOpen(false);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Search machinery, model (e.g. Kubota DC-70), or brand..."
                  className="w-full pl-2.5 pr-8 py-2 text-sm sm:text-base font-bold text-on-surface bg-transparent placeholder:text-soil-slate/50 placeholder:font-normal focus:outline-none truncate"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(true);
                    }}
                    className="p-1 rounded-full text-soil-slate hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0 mr-1 cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-primary hover:bg-primary-container text-white font-extrabold text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 active:scale-[0.98] cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </div>

            {/* Smart Live Autocomplete / Suggestions Overlay */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-3xl border border-border-soft shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-surface-container-low border-b border-border-soft/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-soil-slate uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span>Popular Machinery & Direct Shortcuts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-xs font-bold text-soil-slate hover:text-on-surface cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="p-3 max-h-72 overflow-y-auto">
                  <div className="px-2 py-1 text-[11px] font-bold text-soil-slate flex items-center justify-between mb-1.5">
                    <span>Accredited Machinery Units</span>
                    <span className="text-[10px] text-primary">Click to search directory</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {popularEquipment
                      .filter(
                        (item) =>
                          !searchQuery ||
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => handleSuggestionSelect(item)}
                            className="p-2.5 rounded-xl text-left hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2.5 group cursor-pointer border border-border-soft/60 hover:border-primary/40 bg-white"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-soil-slate truncate">
                                  {item.location} • {item.category}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-primary shrink-0 bg-primary/5 px-2 py-0.5 rounded border border-primary/15">
                              {item.rate}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="p-2.5 bg-cream-surface/70 border-t border-border-soft flex items-center justify-between text-[11px] text-soil-slate">
                  <span>Tip: Select any machinery above or choose a category below to filter directory results.</span>
                </div>
              </div>
            )}
          </form>

          {/* Quick Categories Redesign (Rich, Visual, Informative & Clickable) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <Sparkles className="w-3.5 h-3.5 text-field-ochre" />
                <span>Quick Categories:</span>
              </div>
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect('All')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Reset to All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {quickCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleCategorySelect(cat.key)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer ${isSelected
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                      : `${cat.bg} shadow-2xs hover:shadow-md hover:-translate-y-0.5`
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-primary shadow-2xs'
                        }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/80 text-soil-slate border border-border-soft/60'
                        }`}>
                        {cat.badge}
                      </span>
                    </div>
                    <div>
                      <strong className={`block text-xs font-black leading-tight ${isSelected ? 'text-white' : 'text-on-surface'
                        }`}>
                        {cat.shortLabel}
                      </strong>
                      <span className={`text-[10px] block leading-tight mt-0.5 ${isSelected ? 'text-white/80' : 'text-soil-slate'
                        }`}>
                        {cat.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>



        </div>
      </section>

      {/* ============================================================================
          3. HERO SECTION
          ============================================================================ */}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold mb-4 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Academic Demonstration • All Equipment Simulated for Testing</span>
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
                href={
                  session.user?.role === 'provider'
                    ? '/provider-dashboard'
                    : session.user?.role === 'admin'
                      ? '/admin'
                      : session.user?.role === 'mechanic'
                        ? '/mechanic-dashboard'
                        : session.user?.role === 'secops'
                          ? '/x9f-telemetry-vault-8812'
                          : '/farmer-dashboard'
                }
                className="px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm sm:text-base hover:bg-primary-container shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Go to My Dashboard ({session.user?.name?.split(' ')[0] || 'Member'})</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm sm:text-base hover:bg-primary-container shadow-md transition-all flex items-center gap-2 active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  <span>Register / Sign Up</span>
                </Link>

                <Link
                  href="/login"
                  className="px-6 py-3.5 rounded-2xl bg-white border-2 border-primary text-primary font-extrabold text-sm sm:text-base hover:bg-primary/10 transition-all flex items-center gap-2 shadow-xs active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>Sign In</span>
                </Link>
              </>
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

      {/* ============================================================================
          4. IN-SCOPE FEATURE MODULES GRID
          ============================================================================ */}
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
