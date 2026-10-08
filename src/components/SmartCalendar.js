'use client';

/**
 * @file SmartCalendar.js
 * @description React Component / Page for SmartCalendar.js. Handles UI rendering and local state.
 * @module SmartCalendar
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getEquipmentImage } from '@/lib/equipmentImages';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wrench,
  Building2,
  FileText,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// ============================================================================
// 1. DATA INITIALIZATION & CONSTANTS
// ============================================================================
// Preset sample demonstration operations for key fleet units
const DEMO_BOOKINGS = [
  {
    nameMatch: 'Kubota DC-70 Plus Combine Harvester',
    startDay: 10,
    endDay: 14,
    status: 'in_progress',
    farmerName: 'Farmer Member A (RSBSA-11-23-0042)',
    sector: 'Sitio Balite, Purok 3 (18.5 Ha)',
    operator: 'Operator 01 (NC-II)',
    rate: '₱2,800/ha',
    fuel: '120L Bio-Diesel'
  },
  {
    nameMatch: 'Yanmar EF494T 4WD Heavy Duty Tractor',
    startDay: 4,
    endDay: 8,
    status: 'completed',
    farmerName: 'Farmer Member B (RSBSA-11-49-0192)',
    sector: 'North Basin Polder A (12.0 Ha)',
    operator: 'Operator 02',
    rate: '₱2,400/ha',
    fuel: '75L Diesel'
  },
  {
    nameMatch: 'DJI Agras T40 Precision Crop Sprayer Drone',
    startDay: 13,
    endDay: 15,
    status: 'in_progress',
    farmerName: 'Farmer Member C (RSBSA-03-12-8821)',
    sector: 'East Terraces Sector B (28.0 Ha)',
    operator: 'Pilot 01',
    rate: '₱950/ha',
    fuel: '6x Fast-Charge Lipo'
  },
  {
    nameMatch: 'Siam Kubota SPW-68C 6-Row Rice Transplanter',
    startDay: 16,
    endDay: 18,
    status: 'approved',
    farmerName: 'Farmer Member D (RSBSA-11-09-5510)',
    sector: 'Canocotan Zone 4 (9.5 Ha)',
    operator: 'Coop Mechanization Team Beta',
    rate: '₱3,200/ha',
    fuel: '30L Regular Diesel'
  },
  {
    nameMatch: 'Buhler 5-Ton Grain Recirculating Batch Dryer',
    startDay: 12,
    endDay: 19,
    status: 'in_progress',
    farmerName: 'Tagum Beneficiaries Pool',
    sector: 'Central Post-Harvest Facility',
    operator: 'Technician 01',
    rate: '₱45/bag',
    fuel: 'Biomass Husk-Fired'
  },
  {
    nameMatch: 'Kubota M7040 4WD Heavy Duty Mud Tractor',
    startDay: 21,
    endDay: 24,
    status: 'approved',
    farmerName: 'Farmer Member E (RSBSA-11-77-3312)',
    sector: 'Mankilam Wetland (15.0 Ha)',
    operator: 'Operator 03',
    rate: '₱2,600/ha',
    fuel: '90L Shell Diesel'
  },
  {
    nameMatch: 'BIDA 5HP Solar Powered Deep Well Mobile Pump',
    startDay: 8,
    endDay: 12,
    status: 'maintenance',
    farmerName: 'Scheduled TESDA Service',
    sector: 'Depot Maintenance Bay 2',
    operator: 'TESDA Field Mechanic #889',
    rate: '₱450/day',
    fuel: 'Solar Inverter Inspection'
  },
  {
    nameMatch: 'Yanmar AW70V Tracked Rice Combine Harvester',
    startDay: 22,
    endDay: 26,
    status: 'approved',
    farmerName: 'Farmer Member F (RSBSA-11-88-0091)',
    sector: 'Sitio Riverside (16.0 Ha)',
    operator: 'Operator Team Charlie',
    rate: '₱2,900/ha',
    fuel: '110L Diesel'
  }
];

export default function SmartCalendar() {
  // Month State: Default to October 2026 (simulation calendar cycle)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [selectedDay, setSelectedDay] = useState(14); // default selected day: Oct 14
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Data State
  const [fleetAssets, setFleetAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ============================================================================
  // 2. LIFECYCLE & STATE EFFECTS
  // ============================================================================
  // Fetch real assets from operations API
  const loadFleet = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/operations/calendar');
      if (res.ok) {
        const data = await res.json();
        if (data.assets) {
          setFleetAssets(data.assets);
        }
      } else {
        setFetchError('Failed to load schedule from server.');
      }
    } catch (err) {
      console.error('Failed to load operations calendar:', err);
      setFetchError('Unable to connect to operations calendar service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  // ============================================================================
  // 3. CALENDAR CALCULATIONS
  // ============================================================================
  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const shortMonth = currentDate.toLocaleString('default', { month: 'short' });
  
  // First day of month weekday (0 = Sun, 6 = Sat)
  const firstDayWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentSimDay = (year === 2026 && month === 9) ? 14 : -1;

  // Month navigation
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleResetToday = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDay(14);
  };

  // Machinery Categories
  const categories = [
    { key: 'all', label: 'All Fleet' },
    { key: 'harvester', label: 'Harvesters' },
    { key: 'tractor', label: 'Tractors' },
    { key: 'drone', label: 'Drones' },
    { key: 'pump', label: 'Pumps' },
    { key: 'dryer', label: 'Dryers' }
  ];

  // ============================================================================
  // 4. DATA AGGREGATION
  // ============================================================================
  // Aggregate operations across the month: Map day -> array of machine bookings
  const monthlyOperations = useMemo(() => {
    const dayMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dayMap[d] = [];
    }

    fleetAssets.forEach(asset => {
      // 1. Live requests from DB
      if (asset.requests && asset.requests.length > 0) {
        asset.requests.forEach(req => {
          const reqDate = new Date(req.date);
          if (reqDate.getFullYear() === year && reqDate.getMonth() === month) {
            const startDay = reqDate.getDate();
            const duration = Math.max(1, Math.min(4, Math.round((req.hectares || 10) / 4)));
            const endDay = Math.min(daysInMonth, startDay + duration);

            for (let d = startDay; d <= endDay; d++) {
              if (dayMap[d]) {
                dayMap[d].push({
                  id: req.id,
                  asset,
                  status: req.status === 'in_progress' ? 'in_progress' : req.status === 'approved' ? 'approved' : 'completed',
                  farmerName: req.farmer?.name || 'RSBSA Beneficiary',
                  sector: req.notes || `${asset.location} Sector`,
                  operator: 'Accredited Dispatcher',
                  rate: `₱${asset.rate}/${asset.unit.replace('per_', '')}`,
                  isLive: true
                });
              }
            }
          }
        });
      }

      // 2. Demonstration sample schedule overlay (if matches key model)
      if (year === 2026 && month === 9) {
        const demoMatch = DEMO_BOOKINGS.find(d => asset.name.toLowerCase().includes(d.nameMatch.toLowerCase().slice(0, 20)));
        if (demoMatch) {
          for (let d = demoMatch.startDay; d <= demoMatch.endDay; d++) {
            if (dayMap[d] && !dayMap[d].some(b => b.asset.id === asset.id)) {
              dayMap[d].push({
                id: `demo-${asset.id}-${d}`,
                asset,
                status: demoMatch.status,
                farmerName: demoMatch.farmerName,
                sector: demoMatch.sector,
                operator: demoMatch.operator,
                rate: demoMatch.rate,
                fuel: demoMatch.fuel
              });
            }
          }
        }
      }
    });

    return dayMap;
  }, [fleetAssets, year, month, daysInMonth]);

  // Filter operations for selected day based on active category
  const activeDayBookings = useMemo(() => {
    const list = monthlyOperations[selectedDay] || [];
    if (activeCategory === 'all') return list;
    return list.filter(item => {
      const type = (item.asset.type || '').toLowerCase();
      return type.includes(activeCategory);
    });
  }, [monthlyOperations, selectedDay, activeCategory]);

  // Monthly summary metrics
  const monthStats = useMemo(() => {
    let activeDays = 0;
    let totalDispatches = 0;
    Object.keys(monthlyOperations).forEach(d => {
      if (monthlyOperations[d].length > 0) activeDays++;
      totalDispatches += monthlyOperations[d].length;
    });
    return {
      activeDays,
      totalDispatches
    };
  }, [monthlyOperations]);

  return (
    <div className="w-full bg-white rounded-2xl border border-border-soft shadow-xs p-4 sm:p-5">
      {/* ============================================================================
          5. CALENDAR HEADER
          ============================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-soft/70">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-on-surface tracking-tight">
            Smart Operations Calendar
          </h3>
          <span className="text-[10px] font-mono font-bold text-soil-slate px-2 py-0.5 rounded bg-surface-container-low border border-border-soft/60">
            {monthName}
          </span>
          {fetchError && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Offline / Demo Mode</span>
              <button
                type="button"
                onClick={loadFleet}
                className="ml-1 text-primary hover:underline font-bold"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Minimal Month Navigator & Quick Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-border-soft/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:text-primary transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-black text-on-surface text-[11px] min-w-[70px] text-center">
              {shortMonth} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:text-primary transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetToday}
            className="px-2 py-1 text-[11px] font-bold text-soil-slate hover:text-primary rounded-lg border border-border-soft/80 hover:border-primary/40 transition-colors cursor-pointer bg-white"
          >
            Today
          </button>
        </div>
      </div>

      {/* ============================================================================
          6. CATEGORY SELECTOR BAR
          ============================================================================ */}
      <div className="py-2.5 flex items-center justify-between gap-2 text-xs border-b border-border-soft/50 overflow-x-auto">
        <div className="flex items-center gap-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-container-lowest text-soil-slate hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-soil-slate font-mono shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Booked</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Service</span>
          </span>
        </div>
      </div>

      {/* ============================================================================
          7. MONTH GRID & DAY INSPECTOR
          ============================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3.5">
        
        {/* LEFT: Minimal 7-Column Month Calendar Grid */}
        <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-3 border border-border-soft/70">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-soil-slate/70 mb-1.5">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset days for month start */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`offset-${i}`} className="h-9 sm:h-10" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isSelected = selectedDay === day;
              const isToday = day === currentSimDay;
              const dayBookings = monthlyOperations[day] || [];
              const hasInProgress = dayBookings.some(b => b.status === 'in_progress');
              const hasApproved = dayBookings.some(b => b.status === 'approved');
              const hasMaintenance = dayBookings.some(b => b.status === 'maintenance');

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-9 sm:h-10 rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white font-black shadow-xs ring-2 ring-primary/20'
                      : isToday
                        ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                        : 'hover:bg-surface-container text-on-surface hover:text-primary'
                  }`}
                >
                  <span className="text-xs leading-none">{day}</span>

                  {/* Micro indicator dots under day */}
                  <div className="flex items-center gap-0.5 mt-1">
                    {hasInProgress && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                    )}
                    {hasApproved && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-amber-500'}`} />
                    )}
                    {hasMaintenance && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-rose-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Minimal Day Operation Inspector */}
        <div className="md:col-span-5 bg-surface-container-lowest rounded-xl p-3 border border-border-soft/70 flex flex-col justify-between">
          <div>
            {/* Day Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border-soft/60">
              <div>
                <span className="text-[10px] font-mono uppercase text-soil-slate font-bold block">
                  Selected Date
                </span>
                <h4 className="text-xs font-black text-on-surface">
                  {shortMonth} {selectedDay}, {year}
                </h4>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeDayBookings.length > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-surface-container text-soil-slate'
              }`}>
                {activeDayBookings.length} {activeDayBookings.length === 1 ? 'Machine' : 'Machines'}
              </span>
            </div>

            {/* List of Machines operating on this day */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
              {isLoading ? (
                <div className="py-6 text-center text-soil-slate text-xs">
                  <div className="w-4 h-4 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-1" />
                  <span>Loading schedule...</span>
                </div>
              ) : fetchError ? (
                <div className="py-6 text-center text-soil-slate text-xs space-y-2 p-3 bg-red-50/60 rounded-xl border border-red-200">
                  <AlertTriangle className="w-5 h-5 mx-auto text-red-500" />
                  <p className="font-bold text-red-800 text-[11px]">{fetchError}</p>
                  <button
                    type="button"
                    onClick={loadFleet}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-red-50 text-red-700 text-[11px] font-bold rounded-lg border border-red-200 transition-colors shadow-2xs cursor-pointer mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Connection</span>
                  </button>
                </div>
              ) : activeDayBookings.length === 0 ? (
                <div className="py-7 text-center text-soil-slate text-xs space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500/80 mb-1" />
                  <p className="font-bold text-on-surface text-[11px]">No machinery dispatched.</p>
                  <p className="text-[10px] text-soil-slate/80">All fleet units available for reservation.</p>
                </div>
              ) : (
                activeDayBookings.map((item, idx) => {
                  const imagePath = getEquipmentImage(item.asset);
                  const isDispatched = item.status === 'in_progress';
                  const isApproved = item.status === 'approved';
                  return (
                    <div
                      key={item.id || idx}
                      className="p-2 rounded-lg bg-white border border-border-soft/80 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={imagePath}
                          alt={item.asset.name}
                          className="w-8 h-7 object-cover rounded bg-surface-container shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-on-surface truncate leading-tight">
                            {item.asset.name}
                          </p>
                          <p className="text-[10px] text-soil-slate truncate">
                            {item.farmerName?.split(' ')[0]} • {item.sector}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                          isDispatched
                            ? 'bg-emerald-100 text-emerald-800'
                            : isApproved
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isDispatched ? 'In-Field' : isApproved ? 'Booked' : 'Service'}
                        </span>
                        <span className="text-[9px] font-mono text-soil-slate block font-semibold mt-0.5">
                          {item.rate}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Marketplace Action Link */}
          <div className="pt-2 mt-2 border-t border-border-soft/60 flex items-center justify-between text-[11px]">
            <span className="text-soil-slate">Need machinery?</span>
            <Link
              href="/marketplace"
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
