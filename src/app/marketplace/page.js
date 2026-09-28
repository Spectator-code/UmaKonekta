'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SmartSearchSelect from '@/components/SmartSearchSelect';
import { SETTLEMENT_METHODS, formatRegistryId, getRoleTemplate } from '@/lib/formatters';
import { getEquipmentImage } from '@/lib/equipmentImages';

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-soil-slate font-bold">Loading Agrarian Marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // ============================================================================
  // 1. STATE & LIFECYCLE MANAGEMENT
  // ============================================================================
  // Sync search query and category from URL parameters
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q !== null && q !== undefined) setSearchQuery(q);
    if (cat !== null && cat !== undefined) setSelectedCategory(cat);
  }, [searchParams]);

  // Modal State (Cognitive Load Reduction)
  const [bookingModalItem, setBookingModalItem] = useState(null);
  const [userId, setUserId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Hidden details state (optional)
  const [bookingHectares, setBookingHectares] = useState(1.5);
  const [paymentOption, setPaymentOption] = useState('cash-on-dike');

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Simulate network delay for skeleton loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const [machineryList, setMachineryList] = useState([]);
  const [totalFleetCount, setTotalFleetCount] = useState(100);
  const [totalDepotsCount, setTotalDepotsCount] = useState(10);

  // ============================================================================
  // 2. DATA FETCHING (ASSETS)
  // ============================================================================
  useEffect(() => {
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((asset) => {
            const rawType = (asset.type || '').toLowerCase();
            const cat = rawType.includes('tractor') ? 'Tractor'
              : rawType.includes('harvester') ? 'Harvester'
                : rawType.includes('drone') ? 'Drone'
                  : rawType.includes('transplanter') ? 'Transplanter'
                    : rawType.includes('pump') || rawType.includes('irrigation') ? 'Irrigation'
                      : rawType.includes('dryer') ? 'Dryer'
                        : 'Tractor';

            const icon = cat === 'Harvester' ? 'agriculture'
              : cat === 'Drone' ? 'flight'
                : cat === 'Transplanter' ? 'grass'
                  : cat === 'Irrigation' ? 'solar_power'
                    : cat === 'Dryer' ? 'grain'
                      : 'forklift';

            return {
              id: asset.id,
              name: asset.name,
              category: cat,
              image: getEquipmentImage({ ...asset, category: cat }),
              horsepower: asset.description?.split('•')[0]?.trim() || asset.description || 'Verified DA-PhilMech Spec',
              operator: asset.provider?.name ? `${asset.provider.name} (Accredited Operator)` : 'Certified Operator Included',
              providerName: asset.provider?.name || 'Municipal Machinery Depot',
              providerRegistryId: asset.provider?.registryId || 'provider-1-23-A001',
              location: asset.location || 'Tagum City, Davao del Norte',
              rate: asset.rate,
              rateUnit: asset.unit === 'per_ha' ? '/ hectare' : asset.unit === 'per_bag' ? '/ bag' : asset.unit === 'per_day' ? '/ day' : '/ cycle',
              fuelTerms: asset.description?.toLowerCase().includes('diesel') ? 'Farmer supplies diesel / Custom agreement' : 'Standard Co-op Terms',
              paymentTerms: 'Cash-on-Dike or Co-op Passbook',
              status: asset.status || 'available',
              statusLabel: asset.status === 'available' ? 'Available Now' : asset.status === 'dispatched' ? 'Dispatched' : 'Maintenance',
              imageIcon: icon
            };
          });
          setMachineryList(mapped);
          setTotalFleetCount(mapped.length);
          const distinctProviders = new Set(mapped.map(m => m.providerName));
          setTotalDepotsCount(distinctProviders.size || 10);
        }
      })
      .catch((err) => {
        console.error('Error fetching assets:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ============================================================================
  // 3. SEARCH & FILTERING LOGIC
  // ============================================================================
  const filteredList = machineryList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'All' || item.status === selectedStatus;

    if (!searchQuery.trim()) {
      return matchesCategory && matchesStatus;
    }

    // Clean query: strip out helper text like "(All Barangays)" so searches like "Tagum City (All Barangays)" match "Tagum City"
    const cleanQuery = searchQuery.replace(/\s*\(all\s+barangays\)/gi, '').trim().toLowerCase();
    if (!cleanQuery) return matchesCategory && matchesStatus;

    const queryTerms = cleanQuery.split(/\s+/).filter(Boolean);
    const targetString = `${item.name} ${item.location} ${item.operator} ${item.providerName || ''} ${item.category}`.toLowerCase();

    const matchesSearch = queryTerms.every(term => targetString.includes(term));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // ============================================================================
  // 4. ACTION HANDLERS
  // ============================================================================
  const handleOpenBooking = (item) => {
    if (!session) {
      router.push(`/login?intent=request&asset=${encodeURIComponent(item.name)}`);
      return;
    }
    setBookingModalItem(item);
    setBookingSuccess(false);
    setUserId(session?.user?.registryId || session?.user?.id || getRoleTemplate('farmer'));
    setContactNumber(session?.user?.phone || '0917-000-0001');
    setBookingDateTime('');
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    // Persist to offline local queue
    try {
      const existingQueue = JSON.parse(localStorage.getItem('umakonekta_offline_queue') || '[]');
      existingQueue.push({
        id: `book-${Date.now()}`,
        machinery: bookingModalItem.name,
        userId: userId,
        contact: contactNumber,
        dateTime: bookingDateTime,
        date: new Date().toISOString(),
      });
      localStorage.setItem('umakonekta_offline_queue', JSON.stringify(existingQueue));
    } catch (err) {
      // Local fallback
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ============================================================================
          5. PAGE HEADER & BREADCRUMBS
          ============================================================================ */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate mb-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-primary font-bold">Marketplace</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight flex flex-wrap items-center gap-3">
              <span>Agrarian Equipment Marketplace</span>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {totalFleetCount} Active Fleet Units
              </span>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-field-ochre/15 text-field-ochre border border-field-ochre/30">
                {totalDepotsCount} Accredited Depots
              </span>
            </h1>
            <p className="text-sm text-soil-slate mt-1">
              Browse 100 verified tractors, combine harvesters, precision drones, and solar implements across 10 municipal cooperatives.
            </p>
          </div>
        </div>
      </div>

      {/* Warning & Academic Testing Disclaimer Banner */}
      <aside
        aria-label="Academic Testing Notice"
        className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex items-start sm:items-center gap-3 shadow-2xs"
      >
        <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 font-bold">
          warning
        </span>
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="font-black uppercase tracking-wide text-amber-900 mr-1.5">
            Notice — Simulated Equipment for Testing:
          </strong>
          All photos, machinery specifications, operators, and rates displayed are strictly for educational demonstration and testing purposes. These are not real commercial equipment units available for physical hire or contract.
        </div>
      </aside>

      {/* ============================================================================
          6. SEARCH & CATEGORY FILTERS
          ============================================================================ */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-border-soft mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Real-time search with scrollable suggestions dropdown */}
        <div className="relative w-full lg:w-96" ref={searchContainerRef}>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-border-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs">
            <span className="material-symbols-outlined text-soil-slate text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search model, operator, or location..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-soil-slate/60 font-bold text-on-surface"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="text-soil-slate hover:text-on-surface text-xs font-bold px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Scrollable Available Models, Operators & Locations Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-border-soft shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-2 border-b border-border-soft/60 bg-surface-container-low flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-soil-slate tracking-wider">
                  Available Machinery & Depots ({machineryList.length})
                </span>
                <span className="text-[10px] text-primary font-bold">Scroll to browse</span>
              </div>

              {/* Scrollable list */}
              <div className="max-h-64 overflow-y-auto divide-y divide-border-soft/50 overscroll-contain">
                {machineryList.filter(item =>
                  !searchQuery ||
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.category.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.name);
                      setIsSearchFocused(false);
                    }}
                    className="w-full p-2.5 text-left hover:bg-surface-container-low transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-border-soft shadow-2xs">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-black text-on-surface truncate group-hover:text-primary transition-colors">
                          {item.name}
                        </p>
                        <span className="text-[10px] font-mono font-bold text-primary shrink-0">
                          ₱{item.rate.toLocaleString()} {item.rateUnit}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-soil-slate">
                        <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                          <span className="material-symbols-outlined text-[12px] text-field-ochre">person</span>
                          <span className="truncate">{item.operator.split('(')[0]}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                          <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                          <span className="truncate">{item.location}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* No match fallback in scrollable list */}
                {machineryList.filter(item =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.location.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                    <div className="p-4 text-center">
                      <span className="material-symbols-outlined text-soil-slate/40 text-2xl">search_off</span>
                      <p className="text-xs font-bold text-soil-slate mt-1">No matching model, operator, or location.</p>
                      <p className="text-[10px] text-soil-slate/70">Try searching "Kubota", "Tagum", or "Tractor".</p>
                    </div>
                  )}
              </div>

              {/* Quick Suggestion Pills Footer */}
              <div className="p-2 bg-cream-surface border-t border-border-soft/60 flex flex-wrap items-center gap-1">
                <span className="text-[9px] font-mono font-bold uppercase text-soil-slate mr-1">Quick Select:</span>
                {['Tagum City', 'Brgy. San Manuel', 'Ka Nestor', 'Harvester', 'DJI Agras'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsSearchFocused(false);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white border border-border-soft text-[10px] font-bold text-soil-slate hover:border-primary hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {['All', 'Harvester', 'Tractor', 'Drone', 'Transplanter', 'Irrigation', 'Dryer'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedCategory === cat
                ? 'bg-primary text-on-primary shadow-xs border border-primary'
                : 'bg-white text-soil-slate border border-border-soft hover:border-primary hover:text-on-surface'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================================
          7. EQUIPMENT CARDS GRID
          ============================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Skeleton Loading State (Gray placeholders matching layout)
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="aspect-[16/10] w-full bg-surface-container-high" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                  <div className="space-y-2 pt-1">
                    <div className="h-3 bg-surface-container-low rounded w-full"></div>
                    <div className="h-3 bg-surface-container-low rounded w-5/6"></div>
                    <div className="h-3 bg-surface-container-low rounded w-4/6"></div>
                  </div>
                  <div className="h-8 bg-surface-container-high rounded w-full mt-2"></div>
                </div>
              </div>
              <div className="p-5 pt-3 border-t border-border-soft/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-2 bg-surface-container-high rounded w-12"></div>
                  <div className="h-5 bg-surface-container-high rounded w-24"></div>
                </div>
                <div className="h-9 bg-surface-container-high rounded-xl w-32"></div>
              </div>
            </div>
          ))
          : // Actual Content
          filteredList.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-border-soft shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image Cover Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container-high">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-soil-dark backdrop-blur-md shadow-xs border border-white/50 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary">{item.imageIcon}</span>
                      <span>{item.category}</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border ${item.status === 'available'
                        ? 'bg-emerald-600/95 text-white border-emerald-400/40'
                        : 'bg-amber-600/95 text-white border-amber-400/40'
                        }`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>

                  {/* Bottom overlay inside image: Depot Location */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/95 text-xs pointer-events-none">
                    <span className="flex items-center gap-1 text-[11px] font-medium drop-shadow-md truncate">
                      <span className="material-symbols-outlined text-[14px] text-emerald-300">corporate_fare</span>
                      <span className="truncate max-w-[200px]">{item.providerName}</span>
                    </span>
                  </div>
                </div>

                {/* Card Title & Specs */}
                <div className="p-5 pb-3">
                  <h3 className="font-extrabold text-base text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Specs & Location */}
                  <div className="mt-3.5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate shrink-0">speed</span>
                      <span className="truncate">{item.horsepower}</span>
                    </div>
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate shrink-0">person</span>
                      <span className="truncate">{item.operator}</span>
                    </div>
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0">location_on</span>
                      <span className="text-on-surface font-bold truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate shrink-0">local_gas_station</span>
                      <span className="truncate">{item.fuelTerms}</span>
                    </div>

                    {/* Settlement badge */}
                    <div className="p-2.5 rounded-lg bg-surface-container-low border border-border-soft text-on-surface flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0">payments</span>
                      <span className="font-bold text-[11px] truncate">{item.paymentTerms}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Booking Footer */}
              <div className="p-5 pt-3 bg-surface-container-lowest border-t border-border-soft flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-soil-slate uppercase font-bold">Custom Rate</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-on-surface font-mono">
                      ₱{item.rate.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-soil-slate">{item.rateUnit}</span>
                  </div>
                </div>

                {item.status === 'available' ? (
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(item)}
                    className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Request Schedule
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-surface-container-high text-soil-slate font-mono text-xs font-bold">
                    {item.statusLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>

      {!isLoading && filteredList.length === 0 && (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-border-soft">
          <span className="material-symbols-outlined text-soil-slate text-[48px] mb-2">search_off</span>
          <h3 className="text-base font-bold text-on-surface">No agricultural machinery found</h3>
          <p className="text-xs text-soil-slate mt-1 font-medium">Try clearing filters or searching another barangay.</p>
        </div>
      )}

      {/* ============================================================================
          8. BOOKING REQUEST MODAL
          ============================================================================ */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-soft animate-in fade-in zoom-in-95 duration-150">
            {!bookingSuccess ? (
              <form onSubmit={handleConfirmBooking}>
                <div className="flex items-start justify-between border-b border-border-soft pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-on-surface">
                      Request Schedule
                    </h3>
                    <p className="text-xs text-soil-slate font-medium mt-1">Operator will contact you to confirm.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="text-soil-slate hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* STRICTLY MODAL FIELDS */}
                <div className="space-y-4">
                  {/* Field 1: Asset Preview with Image */}
                  <div>
                    <label className="block font-bold text-xs text-soil-slate mb-1">
                      Selected Asset
                    </label>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-border-soft/60">
                        <img
                          src={bookingModalItem.image}
                          alt={bookingModalItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-on-surface truncate">{bookingModalItem.name}</p>
                        <p className="text-[11px] text-soil-slate font-medium truncate">{bookingModalItem.providerName} • {bookingModalItem.location}</p>
                        <p className="text-xs font-mono font-black text-primary mt-0.5">₱{bookingModalItem.rate.toLocaleString()} {bookingModalItem.rateUnit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Field 2: User ID / RSBSA Member ID */}
                  <div>
                    <label className="block font-bold text-xs text-on-surface mb-1">
                      User ID / RSBSA Member ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., farmer-0-0-F0000"
                      value={userId}
                      onChange={(e) => setUserId(formatRegistryId(e.target.value, 'farmer'))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-border-soft text-sm font-bold text-on-surface font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-soil-slate/50"
                    />
                  </div>

                  {/* Field 3: Contact Number */}
                  <div>
                    <label className="block font-bold text-xs text-on-surface mb-1">
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., 0917 123 4567"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-border-soft text-sm font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-soil-slate/50"
                    />
                  </div>

                  {/* Field 4: Date/Time String */}
                  <div>
                    <label className="block font-bold text-xs text-on-surface mb-1">
                      Preferred Date & Time
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Tomorrow morning around 6am"
                      value={bookingDateTime}
                      onChange={(e) => setBookingDateTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-border-soft text-sm font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-soil-slate/50"
                    />
                  </div>
                </div>

                {/* Cognitive Load Reduction: Hidden Details Accordion */}
                <details className="mt-4 group">
                  <summary className="text-xs font-bold text-primary cursor-pointer hover:underline list-none flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] group-open:rotate-180 transition-transform">expand_more</span>
                    Read More: Rates & Settlement Terms
                  </summary>
                  <div className="mt-3 p-4 rounded-xl bg-surface-container-low border border-border-soft text-xs space-y-3">
                    <div>
                      <span className="font-bold text-soil-slate block mb-1">Custom Rate Estimator</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={bookingHectares}
                          onChange={(e) => setBookingHectares(parseFloat(e.target.value) || 1)}
                          className="w-20 px-2 py-1 rounded border border-border-soft text-on-surface font-mono font-bold"
                        />
                        <span className="font-medium text-soil-slate">ha × ₱{bookingModalItem.rate.toLocaleString()} = </span>
                        <span className="font-black text-on-surface font-mono text-sm">₱{(bookingModalItem.rate * bookingHectares).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <SmartSearchSelect
                        label="Settlement Method"
                        options={SETTLEMENT_METHODS}
                        value={paymentOption}
                        onChange={(val) => setPaymentOption(val)}
                        placeholder="Select settlement method..."
                      />
                    </div>

                    <p className="text-soil-slate pt-2 border-t border-border-soft/60">
                      Operator <strong className="text-on-surface">{bookingModalItem.operator}</strong> will verify exact hectares and coordinate settlement mode upon physical inspection at the field dike.
                    </p>
                  </div>
                </details>

                <div className="mt-6 pt-4 border-t border-border-soft flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-md"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-low text-primary mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h3 className="text-xl font-black text-on-surface">
                  Request Sent
                </h3>
                <p className="text-sm text-soil-slate leading-relaxed font-medium">
                  We've forwarded your request for <strong className="text-on-surface">{bookingModalItem.name}</strong> to the operator.
                </p>
                <div className="p-4 bg-surface-container-low rounded-xl border border-border-soft text-xs text-left space-y-1.5 font-medium">
                  <p><span className="text-soil-slate">Contact:</span> <strong className="text-on-surface">{contactNumber}</strong></p>
                  <p><span className="text-soil-slate">Target:</span> <strong className="text-on-surface">{bookingDateTime}</strong></p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href="/farmer-dashboard"
                    onClick={() => setBookingModalItem(null)}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container-low text-primary border border-primary/20 font-bold text-xs hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    <span>View in Farmer Ledger</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
