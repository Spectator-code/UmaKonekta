'use client';

/**
 * @file page.js
 * @description React Component / Page for Agrarian Equipment Marketplace.
 * Handles UI rendering, search/filters, Quick Specs modal, side-by-side comparison drawer, and pagination.
 * @module page
 */

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

  // Quick Specs Modal state
  const [quickSpecsModalItem, setQuickSpecsModalItem] = useState(null);

  // Comparison State (Slide-over drawer)
  const [compareList, setCompareList] = useState([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  // Numbered Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const gridTopRef = useRef(null);

  // Modal State (Cognitive Load Reduction)
  const [bookingModalItem, setBookingModalItem] = useState(null);
  const [userId, setUserId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Hidden details state (optional)
  const [bookingHectares, setBookingHectares] = useState(1.5);
  const [paymentOption, setPaymentOption] = useState('cash-on-dike');

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
              rawDescription: asset.description || '',
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
  // 4. PAGINATION & COMPARISON LOGIC
  // ============================================================================
  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, searchQuery, itemsPerPage]);

  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedList = filteredList.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleCompare = (item, e) => {
    if (e) e.stopPropagation();
    setCompareList((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      if (exists) {
        return prev.filter((m) => m.id !== item.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const handleRemoveFromCompare = (itemId, e) => {
    if (e) e.stopPropagation();
    setCompareList((prev) => prev.filter((m) => m.id !== itemId));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const isCompared = (id) => compareList.some((m) => m.id === id);

  const handleOpenBookingFromSpecs = (item) => {
    setQuickSpecsModalItem(null);
    handleOpenBooking(item);
  };

  // ============================================================================
  // 5. ACTION HANDLERS
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
          PAGE HEADER & BREADCRUMBS
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
              Browse verified tractors, combine harvesters, precision drones, and solar implements across 10 municipal cooperatives.
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
          7. EQUIPMENT CARDS GRID (MINIMALIST CLEAN GRID)
          ============================================================================ */}
      <div ref={gridTopRef} className="scroll-mt-6" />

      {/* Grid Status Header */}
      {!isLoading && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-soil-slate">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface">
              {totalItems} Machine{totalItems === 1 ? '' : 's'} Found
            </span>
            {selectedCategory !== 'All' && (
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                Category: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-surface-container text-soil-slate font-medium">
                Keyword: "{searchQuery}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-soil-slate">
              Showing page {currentPage} of {totalPages}
            </span>
            {compareList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCompareDrawerOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                <span>{compareList.length} in Comparison</span>
              </button>
            )}
          </div>
        </div>
      )}

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
          : // Minimalist Clean Grid Content
          paginatedList.map((item) => (
            <div
              key={item.id}
              onClick={() => setQuickSpecsModalItem(item)}
              className="group bg-white rounded-2xl border border-border-soft hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div>
                {/* Image Cover Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container-high">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-soil-dark backdrop-blur-md shadow-2xs border border-white/60 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary">{item.imageIcon}</span>
                      <span>{item.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => handleToggleCompare(item, e)}
                        title={isCompared(item.id) ? "Remove from comparison" : "Add to side-by-side comparison"}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1 shadow-2xs ${
                          isCompared(item.id)
                            ? 'bg-primary text-white border border-primary ring-2 ring-primary/30'
                            : 'bg-white/90 hover:bg-white text-soil-slate hover:text-on-surface border border-white/60 backdrop-blur-md'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {isCompared(item.id) ? 'check' : 'compare_arrows'}
                        </span>
                        <span>{isCompared(item.id) ? 'Comparing' : 'Compare'}</span>
                      </button>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-2xs border ${
                          item.status === 'available'
                            ? 'bg-emerald-600/95 text-white border-emerald-400/40'
                            : 'bg-amber-600/95 text-white border-amber-400/40'
                        }`}
                      >
                        {item.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Bottom overlay inside image: Depot Location & Quick Specs trigger */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
                    <span className="flex items-center gap-1 text-[11px] font-medium drop-shadow-md truncate max-w-[200px]">
                      <span className="material-symbols-outlined text-[14px] text-emerald-300">corporate_fare</span>
                      <span className="truncate">{item.providerName}</span>
                    </span>
                    <span className="text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Quick Specs</span>
                      <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                    </span>
                  </div>
                </div>

                {/* Card Title & Core Operating Specs */}
                <div className="p-4 sm:p-5 pb-3">
                  <h3 className="font-extrabold text-base text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Minimalist Core Specs Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-surface-container-low border border-border-soft flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0">speed</span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-mono uppercase text-soil-slate leading-tight">Horsepower</p>
                        <p className="font-bold text-on-surface truncate text-[11px]">{item.horsepower}</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-container-low border border-border-soft flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-field-ochre shrink-0">check_circle</span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-mono uppercase text-soil-slate leading-tight">Status</p>
                        <p className="font-bold text-on-surface truncate text-[11px]">{item.statusLabel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Operator details */}
                  <div className="mt-2.5 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-soil-slate font-medium">
                      <span className="material-symbols-outlined text-[15px] text-primary shrink-0">location_on</span>
                      <span className="truncate text-on-surface font-semibold text-[11px]">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-soil-slate font-medium">
                      <span className="material-symbols-outlined text-[15px] text-soil-slate shrink-0">person</span>
                      <span className="truncate text-soil-slate text-[11px]">{item.operator.split('(')[0]}</span>
                    </div>
                  </div>

                  {/* Settlement Badge */}
                  <div className="p-2 rounded-lg bg-surface-container-low border border-border-soft text-on-surface flex items-center gap-2 mt-2.5">
                    <span className="material-symbols-outlined text-[15px] text-primary shrink-0">payments</span>
                    <span className="font-semibold text-[10px] truncate text-soil-slate">{item.paymentTerms}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Booking Footer */}
              <div className="p-4 sm:p-5 pt-3 bg-surface-container-lowest border-t border-border-soft flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-mono text-soil-slate uppercase font-bold tracking-wider">Custom Rate</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-on-surface font-mono">
                      ₱{item.rate.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-soil-slate">{item.rateUnit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'available' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBooking(item);
                      }}
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
          PAGINATION CONTROLS (NUMBERED WITH PER-PAGE SELECTOR)
          ============================================================================ */}
      {!isLoading && totalItems > 0 && (
        <div className="mt-8 pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Item count & Items per page */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-soil-slate font-medium">
            <span>
              Showing <strong className="text-on-surface font-bold">{startIndex + 1}</strong>–
              <strong className="text-on-surface font-bold">{endIndex}</strong> of{' '}
              <strong className="text-on-surface font-bold">{totalItems}</strong> units
            </span>
            <span className="text-border-soft">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-soil-slate font-bold">Per Page:</span>
              {[12, 24].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                    itemsPerPage === size
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-container-low text-soil-slate hover:text-on-surface border border-border-soft'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Numbered pagination controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-xl border border-border-soft bg-white text-xs font-bold text-soil-slate hover:text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, array) => {
                  const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1;
                  return (
                    <span key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-1 text-xs text-soil-slate font-mono">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-white text-soil-slate hover:text-on-surface border border-border-soft hover:bg-surface-container-low'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-xl border border-border-soft bg-white text-xs font-bold text-soil-slate hover:text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
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

      {/* ============================================================================
          9. INTERACTIVE QUICK SPECS MODAL
          ============================================================================ */}
      {quickSpecsModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border-soft animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-soft pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-surface-container-low text-soil-slate border border-border-soft">
                    {quickSpecsModalItem.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      quickSpecsModalItem.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {quickSpecsModalItem.statusLabel}
                  </span>
                </div>
                <h3 className="text-xl font-black text-on-surface">
                  {quickSpecsModalItem.name}
                </h3>
                <p className="text-xs text-soil-slate font-medium mt-0.5">
                  {quickSpecsModalItem.providerName} • {quickSpecsModalItem.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickSpecsModalItem(null)}
                className="text-soil-slate hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Main Grid: Image & Core Operating Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left: Image & Meta */}
              <div className="space-y-3">
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-container-high border border-border-soft">
                  <img
                    src={quickSpecsModalItem.image}
                    alt={quickSpecsModalItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-soil-slate font-medium">Co-op Depot:</span>
                    <span className="font-bold text-on-surface truncate max-w-[160px]">{quickSpecsModalItem.providerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-soil-slate font-medium">Registry ID:</span>
                    <span className="font-mono text-soil-slate">{quickSpecsModalItem.providerRegistryId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-soil-slate font-medium">Location:</span>
                    <span className="font-bold text-on-surface truncate max-w-[160px]">{quickSpecsModalItem.location}</span>
                  </div>
                </div>
              </div>

              {/* Right: Core Operating Specs */}
              <div className="space-y-3">
                {/* Rate Highlight Card */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Verified Rental Rate</p>
                    <p className="text-2xl font-black font-mono text-emerald-950 mt-0.5">
                      ₱{quickSpecsModalItem.rate.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 px-2 py-1 bg-white/80 rounded-lg border border-emerald-200">
                    {quickSpecsModalItem.rateUnit}
                  </span>
                </div>

                {/* Horsepower / Engine */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
                    <p className="text-[10px] font-mono uppercase text-soil-slate font-bold">Horsepower & Implements</p>
                  </div>
                  <p className="text-xs font-bold text-on-surface">{quickSpecsModalItem.horsepower}</p>
                </div>

                {/* Status & Operator */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-field-ochre">engineering</span>
                    <p className="text-[10px] font-mono uppercase text-soil-slate font-bold">Operator & Service Scope</p>
                  </div>
                  <p className="text-xs font-bold text-on-surface">{quickSpecsModalItem.operator}</p>
                </div>

                {/* Fuel & Settlement */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-soil-slate">
                    <span className="material-symbols-outlined text-[15px] text-soil-slate">local_gas_station</span>
                    <span className="font-medium text-soil-slate">{quickSpecsModalItem.fuelTerms}</span>
                  </div>
                  <div className="flex items-center gap-2 text-soil-slate">
                    <span className="material-symbols-outlined text-[15px] text-primary">payments</span>
                    <span className="font-bold text-on-surface">{quickSpecsModalItem.paymentTerms}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Description Notes */}
            {quickSpecsModalItem.rawDescription && (
              <div className="mt-4 p-3 rounded-xl bg-surface-container-lowest border border-border-soft text-xs text-soil-slate leading-relaxed">
                <strong className="text-on-surface font-bold block mb-1">Technical Fleet Notes:</strong>
                {quickSpecsModalItem.rawDescription}
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-border-soft flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleCompare(quickSpecsModalItem)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isCompared(quickSpecsModalItem.id)
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-container-low text-soil-slate hover:text-on-surface border border-border-soft'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isCompared(quickSpecsModalItem.id) ? 'check' : 'compare_arrows'}
                  </span>
                  <span>{isCompared(quickSpecsModalItem.id) ? 'In Comparison' : 'Add to Comparison'}</span>
                </button>

                {compareList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSpecsModalItem(null);
                      setIsCompareDrawerOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-surface-container-low text-primary border border-primary/20 text-xs font-bold hover:bg-primary/10 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">view_column</span>
                    <span>Open Drawer ({compareList.length})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickSpecsModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container"
                >
                  Close
                </button>
                {quickSpecsModalItem.status === 'available' ? (
                  <button
                    type="button"
                    onClick={() => handleOpenBookingFromSpecs(quickSpecsModalItem)}
                    className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-xs transition-colors"
                  >
                    Request Schedule
                  </button>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-surface-container-high text-soil-slate font-mono text-xs font-bold">
                    {quickSpecsModalItem.statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          10. SLIDE-OVER COMPARISON DRAWER
          ============================================================================ */}
      {isCompareDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsCompareDrawerOpen(false)}
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-border-soft animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-border-soft bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[22px]">compare_arrows</span>
                  <div>
                    <h3 className="text-base font-black text-on-surface">Equipment Comparison</h3>
                    <p className="text-[11px] text-soil-slate font-mono font-medium">
                      {compareList.length} of 4 units selected for side-by-side evaluation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {compareList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCompare}
                      className="px-2.5 py-1 text-xs text-soil-slate hover:text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCompareDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-soil-slate hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {compareList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-soil-slate space-y-3">
                    <span className="material-symbols-outlined text-5xl text-soil-slate/40">
                      balance
                    </span>
                    <h4 className="text-sm font-bold text-on-surface">No Machinery Selected</h4>
                    <p className="text-xs text-soil-slate max-w-xs leading-relaxed">
                      Click the <strong>Compare</strong> button on any equipment card or inside the Quick Specs modal to evaluate machines side-by-side.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Horizontal comparison grid */}
                    <div className="overflow-x-auto pb-4">
                      <div
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns: `repeat(${compareList.length}, minmax(220px, 1fr))`
                        }}
                      >
                        {compareList.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-border-soft p-3.5 flex flex-col justify-between shadow-2xs space-y-3"
                          >
                            {/* Header: Remove & Image */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => handleRemoveFromCompare(item.id, e)}
                                title="Remove from comparison"
                                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                              <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-container">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface-container-low text-soil-slate border border-border-soft">
                                {item.category}
                              </span>
                              <h4 className="font-extrabold text-xs text-on-surface line-clamp-2 mt-1">
                                {item.name}
                              </h4>
                            </div>

                            {/* Comparative Spec 1: Horsepower */}
                            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft">
                              <p className="text-[9px] font-mono uppercase text-soil-slate font-bold">Horsepower / Model</p>
                              <p className="text-xs font-bold text-on-surface mt-0.5">{item.horsepower}</p>
                            </div>

                            {/* Comparative Spec 2: Rental Rate */}
                            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                              <p className="text-[9px] font-mono uppercase text-emerald-800 font-bold">Rental Rate</p>
                              <p className="text-sm font-black font-mono text-emerald-900 mt-0.5">
                                ₱{item.rate.toLocaleString()} <span className="text-[10px] font-normal text-emerald-700">{item.rateUnit}</span>
                              </p>
                            </div>

                            {/* Comparative Spec 3: Availability */}
                            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft">
                              <p className="text-[9px] font-mono uppercase text-soil-slate font-bold">Availability Status</p>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  item.status === 'available'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.statusLabel}
                              </span>
                            </div>

                            {/* Comparative Spec 4: Provider & Location */}
                            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft text-[11px] space-y-1">
                              <p className="text-[9px] font-mono uppercase text-soil-slate font-bold">Provider & Location</p>
                              <p className="font-bold text-on-surface truncate">{item.providerName}</p>
                              <p className="text-soil-slate truncate">{item.location}</p>
                            </div>

                            {/* Comparative Spec 5: Fuel Arrangement */}
                            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft text-[11px]">
                              <p className="text-[9px] font-mono uppercase text-soil-slate font-bold">Fuel Agreement</p>
                              <p className="text-soil-slate truncate mt-0.5">{item.fuelTerms}</p>
                            </div>

                            {/* Action: Book This Unit */}
                            <div className="pt-2">
                              {item.status === 'available' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCompareDrawerOpen(false);
                                    handleOpenBooking(item);
                                  }}
                                  className="w-full py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[15px]">event</span>
                                  <span>Book This Unit</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-2 rounded-xl bg-surface-container-high text-soil-slate font-bold text-xs cursor-not-allowed text-center"
                                >
                                  Unavailable
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border-soft bg-surface-container-low flex items-center justify-between">
                <span className="text-xs text-soil-slate font-medium">
                  Side-by-side spec comparison
                </span>
                <button
                  type="button"
                  onClick={() => setIsCompareDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-border-soft text-xs font-bold text-soil-slate hover:text-on-surface shadow-2xs"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          11. FLOATING COMPARISON ACTION DOCK
          ============================================================================ */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsCompareDrawerOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-xl hover:bg-primary-container hover:scale-105 active:scale-95 transition-all border border-white/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
            <span>Compare ({compareList.length}/4)</span>
            <span className="bg-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
              View
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
