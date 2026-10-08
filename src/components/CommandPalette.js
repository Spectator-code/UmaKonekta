'use client';

/**
 * @file CommandPalette.js
 * @description React Component / Page for CommandPalette.js. Handles UI rendering and local state.
 * @module CommandPalette
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessibility } from '@/lib/AccessibilityContext';

export default function CommandPalette() {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleHighContrast,
    cycleFontScale,
    announce,
  } = useAccessibility();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // ============================================================================
  // 1. STATE MANAGEMENT & EFFECTS
  // ============================================================================
  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [commandPaletteOpen]);

  // ============================================================================
  // 2. SEARCHABLE COMMAND CATALOG
  // ============================================================================
  // Catalog of searchable actions, pages, and equipment
  const items = useMemo(() => [
    // 1. Portals
    { category: 'Portals & Pages', title: 'Farmer Dashboard & Requests', href: '/farmer-dashboard', icon: 'dashboard', keywords: 'farmer request ledger passbook' },
    { category: 'Portals & Pages', title: 'Equipment Marketplace', href: '/marketplace', icon: 'agriculture', keywords: 'tractor harvester rent booking machine' },
    { category: 'Portals & Pages', title: 'Provider Machinery Depot', href: '/provider-dashboard', icon: 'corporate_fare', keywords: 'coop inventory fleet provider' },
    { category: 'Portals & Pages', title: 'Field Mechanic SOS Feed', href: '/mechanic-dashboard#sos', icon: 'handyman', keywords: 'repair breakdown emergency mechanic' },
    { category: 'Portals & Pages', title: 'Executive Admin Command', href: '/admin', icon: 'shield_person', keywords: 'admin rsbsa audit government mao' },
    { category: 'Portals & Pages', title: 'Daily Dispatch Roster (5:00 AM Briefing)', href: '/daily-roster', icon: 'assignment', keywords: 'roster dispatch thermal 80mm a4 operator provider briefing' },
    { category: 'Portals & Pages', title: 'Thermal Dispatch Slip', href: '/dispatch-slip', icon: 'receipt_long', keywords: 'slip print operator trip ticket' },
    { category: 'Portals & Pages', title: 'SACCO Palay Scale Ticket', href: '/sacco-receipt', icon: 'scale', keywords: 'sacco palay ticket scale passbook' },
    { category: 'Portals & Pages', title: 'Barangay Bulletin Notice', href: '/bulletin-notice', icon: 'campaign', keywords: 'news notice da advisory' },
    { category: 'Portals & Pages', title: 'SecOps Telemetry Vault', href: '/x9f-telemetry-vault-8812', icon: 'security', keywords: 'secops telemetry vault siem cyber defense' },

    // 2. Machinery Search
    { category: 'Fleet Machinery', title: 'Kubota DC-70 Plus Combine Harvester', href: '/marketplace?type=harvester', icon: 'agriculture', keywords: 'kubota harvester palay rice 70hp' },
    { category: 'Fleet Machinery', title: 'Yanmar EF494T 4WD Heavy Tractor', href: '/marketplace?type=tractor', icon: 'precision_manufacturing', keywords: 'yanmar tractor 4wd rotavator plowing' },
    { category: 'Fleet Machinery', title: 'DJI Agras T40 Precision Crop Sprayer', href: '/marketplace?type=drone', icon: 'flight', keywords: 'drone spray dji uav fertilizer' },
    { category: 'Fleet Machinery', title: 'Buhler 5-Ton Grain Recirculating Dryer', href: '/marketplace?type=dryer', icon: 'heat', keywords: 'dryer palay grain biomass' },
    { category: 'Fleet Machinery', title: 'Yanmar VP8D 8-Row Rice Transplanter', href: '/marketplace?type=transplanter', icon: 'yard', keywords: 'transplanter seedling rice 8 row' },

    // 3. Quick Actions & A11y Tools
    {
      category: 'Quick Actions',
      title: 'Toggle Outdoor Sunlight Contrast',
      icon: 'contrast',
      action: () => {
        toggleHighContrast();
        announce('High contrast sunlight mode toggled');
      },
      keywords: 'contrast sunlight outdoor dark light vision a11y'
    },
    {
      category: 'Quick Actions',
      title: 'Cycle Text Size (Normal / Large / Extra Large)',
      icon: 'format_size',
      action: () => {
        cycleFontScale();
        announce('Font size adjusted');
      },
      keywords: 'font text size zoom bigger scale a11y'
    },
    {
      category: 'Quick Actions',
      title: 'Report Emergency Breakdown (SOS)',
      href: '/farmer-dashboard#sos',
      icon: 'emergency',
      keywords: 'emergency breakdown stalled fix repair urgent'
    },
  ], [toggleHighContrast, cycleFontScale, announce]);

  // ============================================================================
  // 3. SEARCH & NAVIGATION LOGIC
  // ============================================================================
  // Filter items by query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const cleanQ = query.toLowerCase().trim();
    return items.filter(item => 
      item.title.toLowerCase().includes(cleanQ) ||
      item.category.toLowerCase().includes(cleanQ) ||
      item.keywords.toLowerCase().includes(cleanQ)
    );
  }, [query, items]);

  // Handle item selection
  const handleSelect = (item) => {
    setCommandPaletteOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  // Auto-scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector('[aria-selected="true"]');
      activeElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette Quick Search"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        role="presentation"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border-soft overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================================
            4. SEARCH HEADER BAR
            ============================================================================ */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-soft bg-surface-container-low/50">
          <span className="material-symbols-outlined text-[24px] text-primary shrink-0 mr-3">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="command-results-list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search machinery, dispatches, or portals..."
            className="w-full bg-transparent text-on-surface text-base placeholder:text-soil-slate/70 focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="text-soil-slate hover:text-on-surface p-1 rounded-md text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            aria-label="Close search"
            className="ml-2 px-2.5 py-1.5 text-xs font-bold text-soil-slate hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* ============================================================================
            5. RESULTS LIST
            ============================================================================ */}
        <div
          ref={listRef}
          id="command-results-list"
          role="listbox"
          className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-border-soft/40"
        >
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-soil-slate">
              <span className="material-symbols-outlined text-[36px] text-soil-slate/40 block mb-2">
                manage_search
              </span>
              <p className="text-sm font-bold">No results found for "{query}"</p>
              <p className="text-xs text-soil-slate/80 mt-1">
                Try searching "tractor", "harvester", "sacco", "contrast", or "farmer".
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={`${item.category}-${item.title}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`material-symbols-outlined text-[20px] p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-container-low text-primary'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <p className="text-sm truncate">{item.title}</p>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider block ${
                          isSelected ? 'text-white/80' : 'text-soil-slate'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`material-symbols-outlined text-[16px] shrink-0 ml-2 ${
                      isSelected ? 'text-white' : 'text-soil-slate/50'
                    }`}
                  >
                    arrow_forward
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* ============================================================================
            6. FOOTER HELPER
            ============================================================================ */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-border-soft flex items-center justify-between text-[11px] text-soil-slate">
          <span>Click or tap any item to open</span>
          <span className="text-[10px] font-mono font-bold">
            {filteredItems.length} match{filteredItems.length === 1 ? '' : 'es'}
          </span>
        </div>
      </div>
    </div>
  );
}
