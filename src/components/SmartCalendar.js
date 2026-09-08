'use client';

import { useState } from 'react';

export default function SmartCalendar() {
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [selectedDay, setSelectedDay] = useState(14);
  const [filterType, setFilterType] = useState('all'); // 'all', 'tillage', 'harvest', 'irrigation', 'spray'

  // Agricultural seasonal timeline & rotation schedules
  const calendarDays = [
    { day: 1, events: [] },
    { day: 2, events: [] },
    { day: 3, events: [{ type: 'irrigation', title: 'Canal Gate 1 Open', sector: 'Purok 1' }] },
    { day: 4, events: [] },
    { day: 5, events: [{ type: 'tillage', title: '4WD Tillage Batch A', sector: 'East Fields' }] },
    { day: 6, events: [{ type: 'tillage', title: 'Rotary Harrowing', sector: 'Sitio Balite' }] },
    { day: 7, events: [] },
    { day: 8, events: [{ type: 'spray', title: 'Drone Spraying Test', sector: 'North Sector' }] },
    { day: 9, events: [] },
    { day: 10, events: [{ type: 'irrigation', title: 'Canal Gate 2 Rotation', sector: 'Purok 2 & 3' }] },
    { day: 11, events: [] },
    { day: 12, events: [{ type: 'harvest', title: 'Kubota Harvester #1', sector: 'Purok 1' }] },
    { day: 13, events: [{ type: 'harvest', title: 'Kubota Harvester #1', sector: 'Purok 1' }] },
    { day: 14, events: [
      { type: 'harvest', title: 'Peak Harvest: Kubota DC-70G', sector: 'Sitio Balite (24 Ha)', time: '06:00 AM - 04:00 PM', operator: 'Ka Nestor Panganiban', dieselReq: '120L Shell Diesel' },
      { type: 'irrigation', title: 'NIA Canal Gate 3 Full Flow', sector: 'Main Siphon Feed', time: 'All Day' }
    ]},
    { day: 15, events: [{ type: 'tillage', title: 'Yanmar 4WD + Harrow', sector: 'Purok 3' }] },
    { day: 16, events: [{ type: 'tillage', title: 'Yanmar 4WD + Harrow', sector: 'Purok 3' }] },
    { day: 17, events: [{ type: 'tillage', title: 'Final Puddle & Leveling', sector: 'Purok 3' }] },
    { day: 18, events: [{ type: 'harvest', title: 'Combine Harvester Fleet #2', sector: 'Purok 4 & 5' }] },
    { day: 19, events: [{ type: 'harvest', title: 'Solar Drying Yard Allocation', sector: 'Barangay Multi-Purpose' }] },
    { day: 20, events: [{ type: 'irrigation', title: 'Pre-Harvest Canal Drain', sector: 'Purok 4' }] },
    { day: 21, events: [{ type: 'spray', title: 'Nutrient Bio-Drone Run', sector: 'South Ridge' }] },
    { day: 22, events: [] },
    { day: 23, events: [] },
    { day: 24, events: [{ type: 'tillage', title: 'Disc Plow Rotation', sector: 'Purok 6' }] },
    { day: 25, events: [] },
    { day: 26, events: [{ type: 'irrigation', title: 'Water Gate Rotation #4', sector: 'Purok 6' }] },
    { day: 27, events: [] },
    { day: 28, events: [{ type: 'harvest', title: 'Late Crop Palay Combine', sector: 'East Basin' }] },
    { day: 29, events: [] },
    { day: 30, events: [{ type: 'tillage', title: 'Post-Harvest Ratooning prep', sector: 'Purok 1' }] },
    { day: 31, events: [] },
  ];

  const activeDayData = calendarDays.find(d => d.day === selectedDay) || { day: selectedDay, events: [] };

  const getEventBadge = (type) => {
    switch (type) {
      case 'harvest':
        return { bg: 'bg-harvest-amber/15 text-[#9E5D00] border-harvest-amber/30', icon: 'agriculture', label: 'Harvesting' };
      case 'tillage':
        return { bg: 'bg-primary/10 text-primary border-primary/20', icon: 'precision_manufacturing', label: 'Tillage / Land Prep' };
      case 'irrigation':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'water_drop', label: 'NIA Irrigation' };
      case 'spray':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'flight', label: 'Drone & Spraying' };
      default:
        return { bg: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'event', label: 'Schedule' };
    }
  };

  const filteredDays = calendarDays.map(d => {
    if (filterType === 'all') return d;
    return {
      ...d,
      events: d.events.filter(e => e.type === filterType)
    };
  });

  return (
    <div className="w-full bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-border-soft shadow-sm">
      {/* Header & Seasonal Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border-soft">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-primary text-white shadow-xs">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              Smart Agrarian Operations Calendar
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-soil-slate font-medium">
            Synchronized machinery rotation, communal NIA water gates, and weather-safe harvest windows.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-border-soft shadow-2xs">
          {[
            { key: 'all', label: 'All Operations', icon: 'apps' },
            { key: 'harvest', label: 'Harvesting', icon: 'agriculture' },
            { key: 'tillage', label: 'Tillage & 4WD', icon: 'precision_manufacturing' },
            { key: 'irrigation', label: 'NIA Water', icon: 'water_drop' },
            { key: 'spray', label: 'Drone Runs', icon: 'flight' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === tab.key
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-soil-slate hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid & Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* LEFT: 7-Day Week Interactive Monthly Grid */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-border-soft shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-base sm:text-lg font-extrabold text-on-surface">{currentMonth}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-field-ochre/10 text-field-ochre border border-field-ochre/20">
                Wet Season Palay Cycle
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                type="button"
                className="w-8 h-8 rounded-lg border border-border-soft flex items-center justify-center text-soil-slate hover:text-primary hover:border-primary transition-colors"
                title="Previous month"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button 
                type="button"
                className="w-8 h-8 rounded-lg border border-border-soft flex items-center justify-center text-soil-slate hover:text-primary hover:border-primary transition-colors"
                title="Next month"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-soil-slate/70">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {filteredDays.map((item) => {
              const isSelected = selectedDay === item.day;
              const hasEvents = item.events.length > 0;
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => setSelectedDay(item.day)}
                  className={`min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl text-left flex flex-col justify-between transition-all border ${
                    isSelected
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-surface-container-lowest border-border-soft/60 hover:border-primary/40 hover:bg-cream-surface'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                      {item.day}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-field-ochre animate-pulse" />
                    )}
                  </div>
                  
                  {/* Miniature Event Indicator Dots/Pills */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.events.slice(0, 2).map((ev, i) => {
                      const badge = getEventBadge(ev.type);
                      return (
                        <span
                          key={i}
                          className={`text-[9px] font-bold px-1 py-0.5 rounded truncate max-w-full block leading-none border ${badge.bg}`}
                        >
                          {ev.type === 'harvest' ? '🌾 Harvester' : ev.type === 'tillage' ? '🚜 4WD' : '💧 NIA'}
                        </span>
                      );
                    })}
                    {item.events.length > 2 && (
                      <span className="text-[8px] font-mono text-soil-slate font-bold">
                        +{item.events.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Selected Day Operation Ticket & Field Details */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-border-soft shadow-xs flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-soil-slate font-semibold">Scheduled Date</span>
                <h4 className="text-lg font-black text-on-surface">Oct {selectedDay}, 2026</h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-primary/10 text-primary border border-primary/20">
                {activeDayData.events.length} Event{activeDayData.events.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* List of Events for the Day */}
            <div className="mt-4 space-y-3.5">
              {activeDayData.events.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-soil-slate/40">event_available</span>
                  <p className="text-xs font-bold text-soil-slate mt-2">No heavy machinery rotation scheduled.</p>
                  <p className="text-[11px] text-soil-slate/70 mt-0.5">Open window for ad-hoc farmer reservations.</p>
                </div>
              ) : (
                activeDayData.events.map((ev, idx) => {
                  const badge = getEventBadge(ev.type);
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low border border-border-soft space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                          {badge.label}
                        </span>
                        {ev.time && (
                          <span className="text-[10px] font-mono text-soil-slate font-bold">{ev.time}</span>
                        )}
                      </div>

                      <h5 className="text-xs font-extrabold text-on-surface leading-snug">
                        {ev.title}
                      </h5>

                      <div className="text-[11px] text-soil-slate space-y-1 pt-1 border-t border-border-soft/60">
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                          <span><strong>Sector:</strong> {ev.sector}</span>
                        </p>
                        {ev.operator && (
                          <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-field-ochre">person</span>
                            <span><strong>Operator:</strong> {ev.operator}</span>
                          </p>
                        )}
                        {ev.dieselReq && (
                          <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-soil-slate">local_gas_station</span>
                            <span><strong>Fuel Allocation:</strong> {ev.dieselReq}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Action Button */}
            <div className="mt-5 pt-4 border-t border-border-soft flex flex-col gap-2">
              <a
                href="/marketplace"
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold text-center hover:bg-primary-container transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Request Dispatch on this Date</span>
              </a>
              <a
                href="/bulletin-notice"
                className="w-full py-2 rounded-xl bg-surface-container border border-border-soft text-soil-slate text-xs font-bold text-center hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>View Full Barangay Bulletin</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
