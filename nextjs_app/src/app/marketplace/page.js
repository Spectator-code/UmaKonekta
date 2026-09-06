'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State (Cognitive Load Reduction)
  const [bookingModalItem, setBookingModalItem] = useState(null);
  const [contactNumber, setContactNumber] = useState('');
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Hidden details state (optional)
  const [bookingHectares, setBookingHectares] = useState(1.5);
  const [paymentOption, setPaymentOption] = useState('cash-on-dike');

  useEffect(() => {
    // Simulate network delay for skeleton loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Initial check for municipality filter
    const applyMunicipality = () => {
      const saved = localStorage.getItem('umakonekta_municipality');
      if (saved) {
        setSearchQuery(saved);
      }
    };
    
    applyMunicipality();

    // Listen for onboarding selection
    window.addEventListener('municipality_selected', applyMunicipality);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('municipality_selected', applyMunicipality);
    };
  }, []);

  const machineryList = [
    {
      id: 'eq-01',
      name: 'Kubota DC-70 Plus Combine Harvester',
      category: 'Harvester',
      horsepower: '70 HP Turbo Diesel',
      operator: 'Ka Nestor Panganiban (Certified Operator Included)',
      location: 'Brgy. San Manuel, Tarlac',
      rate: 2800,
      rateUnit: '/ hectare',
      fuelTerms: 'Operator provides machine; Farmer supplies 18L Diesel/ha',
      paymentTerms: 'Cash-on-Dike or 8% Palay SACCO Split',
      status: 'available',
      statusLabel: 'Available Now',
      imageIcon: 'agriculture',
    },
    {
      id: 'eq-02',
      name: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      category: 'Tractor',
      horsepower: '49 HP 4WD with Rotary Tiller',
      operator: 'Mang Danilo Ramos (Mechanic & Operator)',
      location: 'Brgy. San Nicolas, Nueva Ecija',
      rate: 2400,
      rateUnit: '/ hectare',
      fuelTerms: 'Fuel Inclusive within 10km radius',
      paymentTerms: 'Cash-on-Dike or Co-op Passbook',
      status: 'available',
      statusLabel: 'Available Now',
      imageIcon: 'forklift',
    },
    {
      id: 'eq-03',
      name: 'DJI Agras T40 Precision Crop Sprayer',
      category: 'Drone',
      horsepower: '40L Payload Dual Atomized Sprayer',
      operator: 'Licensed Pilot: Engr. Aris Valdez',
      location: 'Brgy. Bantug, Muñoz',
      rate: 950,
      rateUnit: '/ hectare',
      fuelTerms: 'Battery Charging via Solar Gen Included',
      paymentTerms: 'Cash-on-Dike upon flight completion',
      status: 'available',
      statusLabel: 'Available Now',
      imageIcon: 'flight',
    },
    {
      id: 'eq-04',
      name: 'Siam Kubota SPW-68C 6-Row Rice Transplanter',
      category: 'Transplanter',
      horsepower: '5.5 HP Petrol OHV',
      operator: 'Operator Included + 2 tray loaders',
      location: 'Brgy. Malasin, Isabela',
      rate: 3200,
      rateUnit: '/ hectare',
      fuelTerms: 'Petrol included in custom rate',
      paymentTerms: 'Co-op Passbook Credit or Cash',
      status: 'booked',
      statusLabel: 'Booked until Oct 14',
      imageIcon: 'grass',
    },
    {
      id: 'eq-05',
      name: 'BIDA 5HP Solar Powered Deep Well Pump',
      category: 'Irrigation',
      horsepower: '5HP with 16-Panel Mobile Array',
      operator: 'Self-operation (Barangay Briefing)',
      location: 'Brgy. Sto. Tomas, Pampanga',
      rate: 450,
      rateUnit: '/ 4-hour cycle',
      fuelTerms: '100% Solar Powered (Zero Diesel)',
      paymentTerms: 'Cash to Treasurer or Co-op Debit',
      status: 'available',
      statusLabel: 'Available Now',
      imageIcon: 'solar_power',
    },
    {
      id: 'eq-06',
      name: 'New Holland TT4.75 75HP Field Ripper',
      category: 'Tractor',
      horsepower: '75 HP Turbo with 3-Shank Subsoiler',
      operator: 'Ka Ramon Dizon',
      location: 'Brgy. Cruz, Tarlac',
      rate: 3500,
      rateUnit: '/ hectare',
      fuelTerms: 'Diesel on Farmer Account (25L/ha)',
      paymentTerms: 'Cash-on-Dike Settlement',
      status: 'maintenance',
      statusLabel: 'In Scheduled Maintenance',
      imageIcon: 'build',
    },
  ];

  const filteredList = machineryList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'All' || item.status === selectedStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.operator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleOpenBooking = (item) => {
    setBookingModalItem(item);
    setBookingSuccess(false);
    setContactNumber('');
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
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate mb-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-primary font-bold">Marketplace</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">
              Agrarian Equipment Marketplace
            </h1>
            <p className="text-sm text-soil-slate mt-1">
              Browse verified tractors, combine harvesters, and solar implements.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-border-soft mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Real-time search */}
        <div className="w-full lg:w-96 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-border-soft">
          <span className="material-symbols-outlined text-soil-slate text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search model, operator, or location..."
            className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-soil-slate/60 font-bold text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-soil-slate hover:text-on-surface text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {['All', 'Harvester', 'Tractor', 'Drone', 'Transplanter', 'Irrigation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary shadow-xs border border-primary'
                  : 'bg-white text-soil-slate border border-border-soft hover:border-primary hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Skeleton Loading State (Gray placeholders matching layout)
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-border-soft shadow-xs p-5 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-surface-container-high rounded w-1/4"></div>
                      <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-surface-container-low rounded w-full"></div>
                    <div className="h-3 bg-surface-container-low rounded w-5/6"></div>
                    <div className="h-3 bg-surface-container-low rounded w-4/6"></div>
                    <div className="h-8 bg-surface-container-high rounded w-full mt-2"></div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border-soft/60 flex items-center justify-between">
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
                className="bg-white rounded-2xl border border-border-soft shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 pb-3 border-b border-border-soft/60 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px]">{item.imageIcon}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase font-bold text-soil-slate">
                          {item.category}
                        </span>
                        <h3 className="font-extrabold text-base text-on-surface leading-snug mt-0.5">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Specs & Location */}
                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate">speed</span>
                      <span>{item.horsepower}</span>
                    </div>
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate">person</span>
                      <span>{item.operator}</span>
                    </div>
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate">location_on</span>
                      <span className="text-on-surface font-bold">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-soil-slate font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-soil-slate">local_gas_station</span>
                      <span>{item.fuelTerms}</span>
                    </div>

                    {/* Settlement badge */}
                    <div className="p-2.5 rounded-lg bg-surface-container-low border border-border-soft text-on-surface flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                      <span className="font-bold text-[11px]">{item.paymentTerms}</span>
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
                      className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-xs transition-colors"
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

      {/* Progressive Onboarding / Cognitive Load Reduction Modal */}
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

                {/* STRICTLY 3 FIELDS */}
                <div className="space-y-4">
                  {/* Field 1: Asset (Read-only) */}
                  <div>
                    <label className="block font-bold text-xs text-soil-slate mb-1">
                      Selected Asset
                    </label>
                    <div className="px-3 py-2.5 rounded-xl bg-surface-container-low border border-border-soft text-sm font-bold text-on-surface">
                      {bookingModalItem.name}
                    </div>
                  </div>

                  {/* Field 2: Contact Number */}
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

                  {/* Field 3: Date/Time String */}
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
                    
                    <div>
                      <span className="font-bold text-soil-slate block mb-1">Settlement Method</span>
                      <select 
                        value={paymentOption}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border-soft text-on-surface font-bold bg-white"
                      >
                        <option value="cash-on-dike">Cash-on-Dike (Pay after completion)</option>
                        <option value="co-op-passbook">Co-op Passbook Debit</option>
                      </select>
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
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container shadow-sm"
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
