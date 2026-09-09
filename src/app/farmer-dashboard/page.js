'use client';

<<<<<<< HEAD
import { useSession } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
=======
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364

export default function FarmerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState({ requests: [] })
  const [isLoading, setIsLoading] = useState(true)
<<<<<<< HEAD
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'in_progress', 'scheduled', 'completed'

  // Quick Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [farmerUserId, setFarmerUserId] = useState('')
  const [selectedMachine, setSelectedMachine] = useState('Kubota DC-70 Plus Combine Harvester')
  const [parcelSector, setParcelSector] = useState('Purok 2 (Sitio Balite)')
  const [hectares, setHectares] = useState(2.0)
  const [scheduleDate, setScheduleDate] = useState('2026-10-14')
  const [contactPhone, setContactPhone] = useState('0917-555-4092')
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Curated requests state
  const [requestsList, setRequestsList] = useState([
    {
      id: 'REQ-2026-0891',
      machineName: 'Kubota DC-70 Plus Combine Harvester',
      machineCategory: 'Harvester',
      icon: 'agriculture',
      driverName: 'Ka Nestor Panganiban',
      driverPhone: '0919-445-1234',
      driverRating: '4.9 ★ (DA-Certified Master Operator)',
      depot: 'Tagum FCA Machinery Depot',
      parcel: 'Purok 2 (Sitio Balite, Parcel #04)',
      hectares: 2.5,
      date: 'Oct 14, 2026',
      timeSlot: '06:30 AM – 02:00 PM',
      estimatedRate: '₱7,000 (₱2,800/ha)',
      fuelAllocation: '45L Diesel (Supplied by Farmer)',
      settlementType: 'Cash-on-Dike Settlement',
      status: 'dispatched', // 'dispatched', 'in_progress', 'completed', 'pending'
      statusLabel: 'Driver En Route to Dike',
      statusBadge: 'bg-primary/10 text-primary border-primary/20',
      dispatchSlipUrl: '/dispatch-slip',
    },
    {
      id: 'REQ-2026-0884',
      machineName: 'Yanmar EF494T 4WD Heavy Duty Tractor + Rotary Tiller',
      machineCategory: 'Tractor',
      icon: 'precision_manufacturing',
      driverName: 'Mang Danilo Ramos',
      driverPhone: '0928-882-9901',
      driverRating: '4.8 ★ (Agrarian Mechanic & Driver)',
      depot: 'Apokon Agrarian Co-op Pool',
      parcel: 'Purok 3 (East Rice Basin)',
      hectares: 1.8,
      date: 'Oct 16, 2026',
      timeSlot: '07:00 AM – 03:00 PM',
      estimatedRate: '₱4,320 (₱2,400/ha)',
      fuelAllocation: 'Fuel Inclusive within 10km',
      settlementType: 'Co-op Passbook Charge',
      status: 'scheduled',
      statusLabel: 'Scheduled / Reserved',
      statusBadge: 'bg-harvest-amber/15 text-[#9E5D00] border-harvest-amber/30',
      dispatchSlipUrl: '/dispatch-slip',
    },
    {
      id: 'REQ-2026-0798',
      machineName: 'DJI Agras T40 Precision Crop Sprayer',
      machineCategory: 'Drone',
      icon: 'flight',
      driverName: 'Engr. Aris Valdez (Licensed Pilot)',
      driverPhone: '0908-112-3344',
      driverRating: '5.0 ★ (CAAP & DA Remote Pilot)',
      depot: 'Muñoz Precision Drone Center',
      parcel: 'North Ridge Bio-Parcel',
      hectares: 3.0,
      date: 'Oct 08, 2026',
      timeSlot: '05:30 AM – 08:30 AM',
      estimatedRate: '₱2,850 (₱950/ha)',
      fuelAllocation: 'Solar Battery Charged',
      settlementType: 'Cash-on-Dike Certified',
      status: 'completed',
      statusLabel: 'Completed & Signed',
      statusBadge: 'bg-status-available-bg text-status-available border-status-available/20',
      dispatchSlipUrl: '/sacco-receipt',
    }
  ]);
=======
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=farmer')
    } else if (status === 'authenticated') {
      setFarmerUserId(session?.user?.registryId || session?.user?.id || '03-49-12-00841');
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(d => {
          setData(d)
          setIsLoading(false)
        })
<<<<<<< HEAD
        .catch(() => setIsLoading(false))
    }
  }, [status, router])

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const ha = Number(hectares) || 1.0;

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerUserId: farmerUserId || session?.user?.registryId || '03-49-12-00841',
          machineName: selectedMachine,
          parcelSector,
          hectares: ha,
          scheduleDate,
          contactPhone,
        }),
      });

      const json = await res.json();
      const newReq = {
        id: json?.request?.id ? `REQ-${json.request.id.slice(0, 8).toUpperCase()}` : `REQ-${Date.now().toString().slice(-4)}`,
        machineName: selectedMachine,
        machineCategory: 'Harvester',
        icon: 'agriculture',
        driverName: 'Ka Nestor Panganiban (Assigned Operator)',
        driverPhone: contactPhone || '0919-445-1234',
        driverRating: '4.9 ★ (DA-Certified)',
        depot: 'Tagum FCA Machinery Depot',
        parcel: parcelSector,
        hectares: ha,
        date: scheduleDate,
        timeSlot: '07:00 AM – 01:00 PM',
        estimatedRate: `₱${(ha * 2800).toLocaleString()} (Estimated)`,
        fuelAllocation: `${Math.round(ha * 18)}L Diesel`,
        settlementType: 'Cash-on-Dike Settlement',
        status: 'pending',
        statusLabel: 'Pending Depot Verification',
        statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
        dispatchSlipUrl: '/dispatch-slip',
      };

      setRequestsList([newReq, ...requestsList]);
      setRequestSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setRequestSubmitted(false);
      }, 1200);
    } catch (err) {
      console.error('Request creation error:', err);
    }
  };

  const filteredRequests = requestsList.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

=======
    }
  }, [status, router])

>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-surface">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-cream-surface text-on-surface pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#004720] via-primary to-[#005c2a] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <span className="material-symbols-outlined text-[32px]">account_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-headline-sm tracking-tight">{session?.user?.name || 'Juan Dela Cruz'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#a3f5b2]/20 text-[#a3f5b2] border border-[#a3f5b2]/30">
                  Verified RSBSA
                </span>
              </div>
              <p className="text-white/80 font-mono text-xs mt-1">
                Registry ID: <span className="font-bold text-white">{session?.user?.registryId || '03-49-12-00841'}</span> • San Manuel Agrarian Beneficiaries Co-op (SMABC)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-harvest-amber text-on-surface font-extrabold text-sm hover:bg-harvest-amber/90 active:scale-[0.98] transition-all shadow-md self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Request Farm Machinery</span>
=======
    <div className="min-h-screen bg-cream-surface text-on-surface">
      <div className="bg-field-ochre text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline-sm">{session?.user?.name}</h1>
            <p className="text-white/80 font-label-md mt-1">RSBSA ID: {session?.user?.registryId}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
          </button>
        </div>
      </div>

<<<<<<< HEAD
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* 2. Top Metric Cards (Simplified) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-border-soft shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-soil-slate font-bold block mb-1">Active Fleet Units</span>
              <p className="text-2xl sm:text-3xl font-black text-primary font-mono">{requestsList.length} Units</p>
              <p className="text-xs text-soil-slate mt-1 font-medium">Currently tracked machinery requests</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">agriculture</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border-soft shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-soil-slate font-bold block mb-1">Scheduled / In-Progress</span>
              <p className="text-2xl sm:text-3xl font-black text-field-ochre font-mono">
                {requestsList.filter(r => r.status === 'scheduled' || r.status === 'dispatched' || r.status === 'in_progress').length} Requests
              </p>
              <p className="text-xs text-soil-slate mt-1 font-medium">Reserved dates & en-route operators</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-harvest-amber/15 text-harvest-amber flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">event_available</span>
            </div>
          </div>
        </div>

        {/* 3. Section Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-soft mb-6">
          <div>
            <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">agriculture</span>
              <span>My Equipment Requests & Status</span>
            </h2>
            <p className="text-xs text-soil-slate mt-0.5 font-medium">
              Track submitted machinery requests, provider contacts, hectare rates, and scheduling.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-border-soft self-start sm:self-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'dispatched', label: 'En Route' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterStatus === tab.key
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-soil-slate hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Requests Cards List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border-soft border-dashed p-6">
            <span className="material-symbols-outlined text-4xl text-soil-slate/40">agriculture</span>
            <p className="mt-2 text-sm font-bold text-soil-slate">No requests match the selected filter.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container shadow-xs"
            >
              Request Farm Machinery
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-border-soft shadow-xs hover:border-primary/40 transition-all flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Left info: Machinery & Driver Details */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="material-symbols-outlined text-[26px]">{req.icon}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-on-surface">{req.machineName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${req.statusBadge}`}>
                        {req.statusLabel}
                      </span>
                    </div>

                    {/* Assigned Driver Box */}
                    <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-xl">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                          <span className="material-symbols-outlined text-field-ochre text-[18px]">person</span>
                          <span><strong>Assigned Driver:</strong> {req.driverName}</span>
                        </div>
                        <p className="text-[11px] text-soil-slate mt-0.5 ml-6">{req.driverRating} • {req.depot}</p>
                      </div>

                      <a
                        href={`tel:${req.driverPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-2xs self-start sm:self-auto whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>Call Driver ({req.driverPhone})</span>
                      </a>
                    </div>

                    {/* Field & Parcel Specifics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-soil-slate pt-1">
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                        <span><strong>Parcel:</strong> {req.parcel}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-primary">straighten</span>
                        <span><strong>Area:</strong> {req.hectares} Hectares</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                        <span><strong>Target:</strong> {req.date}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right info: Financial Rate & Field Ticket Link */}
                <div className="flex flex-col justify-between lg:items-end border-t lg:border-t-0 lg:border-l border-border-soft pt-4 lg:pt-0 lg:pl-6 shrink-0 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-soil-slate uppercase block lg:text-right">Estimated Cash-on-Dike</span>
                    <p className="text-xl font-black text-primary font-mono lg:text-right">{req.estimatedRate}</p>
                    <span className="text-[11px] text-field-ochre font-semibold block lg:text-right mt-0.5">{req.settlementType}</span>
                    <span className="text-[10px] text-soil-slate/80 block lg:text-right">{req.fuelAllocation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={req.dispatchSlipUrl}
                      className="px-4 py-2 rounded-xl bg-surface-container border border-border-soft text-xs font-bold text-soil-slate hover:text-primary hover:border-primary transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      <span>Job Ticket Slip</span>
                    </Link>
                  </div>
=======
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border-soft pb-2 mb-6">
          <span className="material-symbols-outlined text-primary">history</span>
          My Dispatch Requests
        </h2>
        
        {data.requests?.length === 0 ? (
          <div className="text-center py-12 bg-surface-container rounded-xl border border-border-soft border-dashed">
            <span className="material-symbols-outlined text-4xl text-soil-slate/50">history</span>
            <p className="mt-2 text-soil-slate font-bold">You have not requested any machinery yet.</p>
            <button onClick={() => router.push('/marketplace')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">Browse Marketplace</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.requests?.map(req => (
              <div key={req.id} className="bg-surface-container rounded-xl p-5 shadow-sm border border-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-field-ochre">store</span>
                    <span className="font-bold text-lg">{req.asset?.provider?.name || 'Provider'}</span>
                  </div>
                  <p className="text-sm text-soil-slate mt-1">Machine: <span className="font-semibold text-on-surface">{req.asset?.name}</span></p>
                  <p className="text-sm text-soil-slate mt-1">Requested Hectares: <span className="font-semibold">{req.hectares || 'Not specified'} Ha</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="text-sm px-3 py-1 rounded-full bg-status-pending-bg text-status-pending font-bold uppercase">
                    {req.status}
                  </span>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">Ref: {req.id}</p>
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
                </div>
              </div>
            ))}
          </div>
        )}
<<<<<<< HEAD

      </div>

      {/* 5. Quick Request Farm Machinery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border-soft shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">agriculture</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface">Request Farm Machinery</h3>
                  <p className="text-xs text-soil-slate">Direct Municipal Depot & Driver Dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-border-soft flex items-center justify-center text-soil-slate hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-status-available-bg text-status-available flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h4 className="text-lg font-extrabold text-on-surface">Machinery Request Queued!</h4>
                <p className="text-xs text-soil-slate max-w-sm mx-auto">
                  Your request has been filed with the cooperative depot. The assigned driver will contact you prior to field arrival.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    User ID / RSBSA Member ID
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerUserId}
                    onChange={(e) => setFarmerUserId(e.target.value)}
                    placeholder="e.g., 03-49-12-00841"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft bg-white text-xs sm:text-sm font-bold text-on-surface font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Select Farm Machinery
                  </label>
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft bg-white text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="Kubota DC-70 Plus Combine Harvester">Kubota DC-70 Plus Combine Harvester (₱2,800/ha)</option>
                    <option value="Yanmar EF494T 4WD Heavy Duty Tractor">Yanmar EF494T 4WD Tractor + Tiller (₱2,400/ha)</option>
                    <option value="DJI Agras T40 Precision Crop Sprayer">DJI Agras T40 Drone Sprayer (₱950/ha)</option>
                    <option value="Siam Kubota SPW-68C 6-Row Rice Transplanter">Siam Kubota 6-Row Transplanter (₱3,200/ha)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                      Hectares (Ha)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="50"
                      required
                      value={hectares}
                      onChange={(e) => setHectares(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-soft text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                      Target Schedule Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-soft text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Barangay Sector / Parcel Location
                  </label>
                  <input
                    type="text"
                    required
                    value={parcelSector}
                    onChange={(e) => setParcelSector(e.target.value)}
                    placeholder="e.g., Purok 2, Sitio Balite"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Contact Phone (For Driver Call)
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft text-xs space-y-1">
                  <div className="flex justify-between font-bold text-on-surface">
                    <span>Estimated Custom Fee:</span>
                    <span className="text-primary font-mono">₱{(hectares * 2800).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-soil-slate">
                    *Settled via <strong>Cash-on-Dike</strong> directly with the operator upon field inspection or charged to SACCO Passbook.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border-soft text-xs font-bold text-soil-slate hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Confirm & Send to Depot</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

=======
      </div>
    </div>
  )
}
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
