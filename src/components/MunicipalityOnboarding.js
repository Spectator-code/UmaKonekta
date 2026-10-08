'use client';

/**
 * @file MunicipalityOnboarding.js
 * @description React Component / Page for MunicipalityOnboarding.js. Handles UI rendering and local state.
 * @module MunicipalityOnboarding
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Check,
  Sparkles,
  ArrowRight,
  Search,
  X,
  Building2,
  Tractor,
  Wheat,
  Compass
} from 'lucide-react';

// ============================================================================
// 1. STATIC DATA CONFIGURATION
// ============================================================================
const locationGroups = [
  {
    group: 'Tagum City Agrarian Hub (Primary Fleet Area)',
    icon: Tractor,
    items: [
      { id: 'tagum-all', name: 'Tagum City (All Barangays)', sub: 'Primary Agri-Mechanization Hub', badge: '100+ Units' },
      { id: 'apokon', name: 'Brgy. Apokon, Tagum City', sub: 'FCA Machinery Pool #1', badge: '24 Units' },
      { id: 'mankilam', name: 'Brgy. Mankilam, Tagum City', sub: 'Grain & Harvester Central Depot', badge: '18 Units' },
      { id: 'canocotan', name: 'Brgy. Canocotan, Tagum City', sub: 'Smallholder Rice Irrigators Sector', badge: '15 Units' },
      { id: 'visayan-village', name: 'Brgy. Visayan Village, Tagum City', sub: 'Agrarian Fleet Repair & Transit', badge: '20 Units' },
      { id: 'san-miguel', name: 'Brgy. San Miguel, Tagum City', sub: 'Precision Spray Drone Cooperative', badge: '12 Units' },
      { id: 'magugpo', name: 'Brgy. Magugpo, Tagum City', sub: 'Agri-Trading & Commercial Desk', badge: '10 Units' },
    ],
  },
  {
    group: 'Neighboring Davao del Norte Municipalities',
    icon: Building2,
    items: [
      { id: 'carmen', name: 'Carmen, Davao del Norte', sub: 'Davao Rice Basin Cooperative Hub', badge: 'Co-op Exchange' },
      { id: 'panabo', name: 'Panabo City, Davao del Norte', sub: 'Agri-Industrial Banana & Corn Sector', badge: 'Municipal Fleet' },
      { id: 'santo-tomas', name: 'Santo Tomas, Davao del Norte', sub: 'Lowland Agrarian Agritech Pool', badge: 'Accredited Depot' },
      { id: 'asuncion', name: 'Asuncion, Davao del Norte', sub: 'River Basin Irrigation Zone', badge: 'Active Partner' },
      { id: 'samal', name: 'Island Garden City of Samal, Davao del Norte', sub: 'Coastal Island Farm Machinery', badge: 'Island Logistics' },
    ],
  },
];

export default function MunicipalityOnboarding() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSavedLocation, setHasSavedLocation] = useState(false);

  // ============================================================================
  // 2. LIFECYCLE & EVENT LISTENERS
  // ============================================================================
  useEffect(() => {
    // Check if municipality is already selected
    const saved = localStorage.getItem('umakonekta_municipality');
    if (saved) {
      setSelectedMunicipality(saved);
      setHasSavedLocation(true);
    } else {
      setIsVisible(true);
    }

    // Listen for manual trigger from navbar or landing page
    const handleOpen = () => {
      setIsVisible(true);
      setSearchTerm('');
    };

    window.addEventListener('open_location_modal', handleOpen);
    return () => window.removeEventListener('open_location_modal', handleOpen);
  }, []);

  // ============================================================================
  // 3. ACTION HANDLERS
  // ============================================================================
  const handleSave = () => {
    const loc = selectedMunicipality || 'Tagum City (All Barangays)';
    localStorage.setItem('umakonekta_municipality', loc);
    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event('municipality_selected'));
    setIsVisible(false);
    setHasSavedLocation(true);

    // Immediately jump to the landing page with location applied
    router.push(`/?location=${encodeURIComponent(loc)}`);
  };

  const handleQuickSelect = (name) => {
    setSelectedMunicipality(name);
    localStorage.setItem('umakonekta_municipality', name);
    window.dispatchEvent(new Event('municipality_selected'));
    setIsVisible(false);
    setHasSavedLocation(true);

    // Immediately jump to the landing page with location applied
    router.push(`/?location=${encodeURIComponent(name)}`);
  };

  if (!isVisible) return null;

  // ============================================================================
  // 4. SEARCH FILTERING
  // ============================================================================
  // Filter locations by search term
  const filteredGroups = locationGroups.map((group) => {
    const filteredItems = group.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && hasSavedLocation) {
          setIsVisible(false);
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-border-soft flex flex-col max-h-[92vh] overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Top Dismiss Button if already set */}
        {hasSavedLocation && (
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-soil-slate hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ============================================================================
            5. MODAL HEADER
            ============================================================================ */}
        <div className="text-center mb-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-3 shadow-inner">
            <MapPin className="w-7 h-7 text-primary" />
          </div>

          <h2 id="location-modal-title" className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
            Choose Your Location
          </h2>
          <p className="text-xs text-soil-slate mt-1 max-w-sm mx-auto leading-relaxed">
            Select your barangay or municipality to view localized farm machinery, subsidized rates, and municipal fleets.
          </p>
        </div>

        {/* ============================================================================
            6. LIVE SEARCH FILTER BOX
            ============================================================================ */}
        <div className="relative mb-3 shrink-0">
          <Search className="w-4 h-4 text-soil-slate absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to filter barangay or municipality (e.g. Apokon, Mankilam)..."
            className="w-full pl-9 pr-8 py-2.5 bg-surface-container-low rounded-xl text-xs sm:text-sm font-bold text-on-surface border border-border-soft focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-soil-slate/60 placeholder:font-normal"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-soil-slate hover:text-on-surface p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ============================================================================
            7. LOCATIONS LIST
            ============================================================================ */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <Compass className="w-8 h-8 text-soil-slate/40 mx-auto mb-2" />
              <p className="text-xs font-bold text-soil-slate">No matching location found.</p>
              <p className="text-[11px] text-soil-slate/70 mt-0.5">Try searching &quot;Apokon&quot;, &quot;Mankilam&quot;, or &quot;Tagum&quot;.</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.group} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-[11px] font-mono font-bold text-soil-slate uppercase tracking-wider">
                    <GroupIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{group.group}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {group.items.map((item) => {
                      const isSelected = selectedMunicipality === item.name;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMunicipality(item.name)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                              : 'bg-white hover:bg-surface-container-low border-border-soft'
                            }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-soil-slate/40 bg-white'
                                }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate leading-snug ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                                {item.name}
                              </p>
                              <p className="text-[11px] text-soil-slate truncate mt-0.5">
                                {item.sub}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${isSelected
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface-container-low text-soil-slate border-border-soft'
                              }`}>
                              {item.badge}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickSelect(item.name);
                              }}
                              className="p-1 rounded-lg hover:bg-primary hover:text-white text-soil-slate transition-colors text-[11px] font-bold flex items-center gap-0.5"
                              title="Select and go directly to landing page"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ============================================================================
            8. MODAL ACTION FOOTER
            ============================================================================ */}
        <div className="shrink-0 pt-3 border-t border-border-soft flex flex-col sm:flex-row gap-2">
          {hasSavedLocation && (
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="py-3 px-4 rounded-xl border border-border-soft hover:bg-surface-container text-soil-slate font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedMunicipality}
            className="flex-1 py-3.5 px-5 rounded-xl bg-primary text-on-primary font-black text-xs sm:text-sm hover:bg-primary-container shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <span>Confirm Location & Jump to Landing Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
