'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState({ assets: [], requests: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('machinery'); // 'machinery', 'farmer_needs', 'dispatches'
  
  // Post Machine Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: 'Kubota M7040 4WD Heavy Tractor',
    type: 'tractor',
    horsepower: '70 HP Turbo',
    rate: 2500,
    unit: 'per_ha',
    location: 'Tagum City, Davao del Norte',
    description: 'Heavy duty disc plowing and rotavator service. Includes certified operator.',
    fuelTerms: 'Farmer supplies diesel (18L/ha) or +₱400/ha inclusive'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState('');

  // Machinery Local State with demo fallback
  const [localAssets, setLocalAssets] = useState([
    {
      id: 'ast-01',
      name: 'Kubota DC-70 Plus Combine Harvester',
      type: 'harvester',
      horsepower: '70 HP',
      location: 'Brgy. San Manuel, Tagum City',
      rate: 2800,
      unit: 'per_ha',
      status: 'available',
      fuelTerms: 'Farmer supplies 18L Diesel/ha',
      operator: 'Ka Nestor Panganiban (Cert #819)'
    },
    {
      id: 'ast-02',
      name: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      type: 'tractor',
      horsepower: '49 HP',
      location: 'Brgy. Apokon, Tagum City',
      rate: 2400,
      unit: 'per_ha',
      status: 'dispatched',
      fuelTerms: 'Fuel Inclusive within 10km radius',
      operator: 'Mang Danilo Ramos'
    },
    {
      id: 'ast-03',
      name: 'Buhler 5-Ton Grain Recirculating Batch Dryer',
      type: 'dryer',
      horsepower: 'Biomass Husk Fired',
      location: 'Municipal Silo Bodega, Tagum',
      rate: 45,
      unit: 'per_bag',
      status: 'available',
      fuelTerms: 'Husk biomass fuel included',
      operator: 'Co-op Silo Operator'
    }
  ]);

  // Farmer Needs / Community Requests Feed
  const [farmerNeeds, setFarmerNeeds] = useState([
    {
      id: 'FNEED-101',
      farmerName: 'Danilo Ramos',
      rsbsaId: 'RSBSA-03-49-12-00481',
      location: 'Sitio Balite, Brgy. San Manuel, Tagum City',
      serviceNeeded: 'Emergency Harvester Needed (Rain approaching)',
      machineType: 'Combine Harvester',
      hectares: 2.5,
      urgency: 'URGENT (Within 24 Hours)',
      urgencyBadge: 'bg-status-urgent-bg text-status-urgent border-status-urgent/30',
      targetDate: 'Tomorrow, Oct 12, 2026',
      offeredBudget: '₱2,800 / ha (Standard Cash-on-Dike)',
      notes: 'Palay lodging in low-lying parcel. Ground firm enough for tracked harvester.',
      status: 'open'
    },
    {
      id: 'FNEED-102',
      farmerName: 'Elena Cruz',
      rsbsaId: 'RSBSA-03-49-12-00992',
      location: 'Purok 4, Brgy. Mankilam, Tagum City',
      serviceNeeded: 'Primary Land Preparation & Disc Plowing',
      machineType: '4WD Heavy Tractor',
      hectares: 4.0,
      urgency: 'Scheduled (Within 3 Days)',
      urgencyBadge: 'bg-status-pending-bg text-status-pending border-status-pending/30',
      targetDate: 'Oct 15, 2026',
      offeredBudget: '₱2,400 / ha (Co-op Passbook)',
      notes: 'Heavy clay soil, requires 4WD tractor with 2.2m rotavator implement.',
      status: 'open'
    },
    {
      id: 'FNEED-103',
      farmerName: 'Rogelio Bato',
      rsbsaId: 'RSBSA-03-49-12-00122',
      location: 'Sitio Riverside, Brgy. Pagsabangan, Tagum City',
      serviceNeeded: 'Precision Drone Bio-Fertilizer Spraying',
      machineType: 'Spraying Drone',
      hectares: 3.2,
      urgency: 'Standard',
      urgencyBadge: 'bg-status-available-bg text-status-available border-status-available/30',
      targetDate: 'Oct 18, 2026',
      offeredBudget: '₱950 / ha (Cash-on-Dike)',
      notes: 'Foliar feeding during panicle initiation stage.',
      status: 'open'
    }
  ]);

  // Dispatch requests state
  const [requestsList, setRequestsList] = useState([
    {
      id: 'REQ-2026-089',
      farmerName: 'Danilo Ramos',
      machine: 'Kubota DC-70 Plus Combine Harvester',
      hectares: 2.4,
      date: 'Oct 11, 2026',
      location: 'Brgy. San Manuel',
      totalEstimated: '₱6,720',
      status: 'dispatched',
      actionSlip: '/dispatch-slip'
    },
    {
      id: 'REQ-2026-092',
      farmerName: 'Juanita Reyes',
      machine: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      hectares: 1.5,
      date: 'Oct 14, 2026',
      location: 'Brgy. Canocotan',
      totalEstimated: '₱3,600',
      status: 'pending',
      actionSlip: '/dispatch-slip'
    }
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=provider');
    } else if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(d => {
          if (d.assets && d.assets.length > 0) {
            setLocalAssets(prev => [...d.assets, ...prev]);
          }
          setData(d);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [status, router]);

  const handlePostMachine = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMachine.name,
          type: newMachine.type,
          rate: newMachine.rate,
          unit: newMachine.unit,
          location: newMachine.location,
          description: `${newMachine.description} (${newMachine.fuelTerms})`,
          providerId: session?.user?.id
        })
      });

      const newAssetItem = {
        id: `ast-${Date.now()}`,
        name: newMachine.name,
        type: newMachine.type,
        horsepower: newMachine.horsepower,
        location: newMachine.location,
        rate: parseFloat(newMachine.rate),
        unit: newMachine.unit,
        status: 'available',
        fuelTerms: newMachine.fuelTerms,
        operator: session?.user?.name || 'Authorized Depot Operator'
      };

      setLocalAssets([newAssetItem, ...localAssets]);
      setPostSuccessMessage(`Successfully registered ${newMachine.name}! Now visible to farmers in the Marketplace.`);
      setIsPostModalOpen(false);

      setTimeout(() => {
        setPostSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptNeed = (needId) => {
    setFarmerNeeds(prev => prev.map(n => n.id === needId ? { ...n, status: 'accepted' } : n));
    alert('Accepted! Dispatch Ticket created. You can now send your operator and machinery to the farmer dike.');
  };

  const handleRequestStatus = (id, newStatus) => {
    setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-surface">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
          <p className="text-sm font-mono text-soil-slate">Loading Provider Depot & Fleet Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface">
      {/* Header Banner */}
      <div className="bg-primary text-white py-6 sm:py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white border border-white/30">
                🚜 MACHINERY PROVIDER & SACCO DEPOT
              </span>
              <span className="text-xs text-white/80 font-mono">DA-PhilMech Station</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{session?.user?.name || 'Tagum FCA Machinery Depot'}</h1>
            <p className="text-white font-mono text-xs sm:text-sm mt-1">
              Registry: <span className="font-bold text-white">{session?.user?.registryId || 'CDA-FCA-2024-9140'}</span> • <span className="text-white/90">Station: Davao del Norte Cluster</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-field-ochre text-white text-xs sm:text-sm font-bold hover:bg-[#8F5400] shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Post Tractor / Machinery</span>
            </button>

            <Link
              href="/marketplace"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>View Marketplace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {postSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="p-4 rounded-xl bg-status-available-bg border border-status-available/30 text-status-available text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{postSuccessMessage}</span>
            </div>
            <button onClick={() => setPostSuccessMessage('')} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Metric Quick Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Active Fleet</span>
              <span className="material-symbols-outlined text-primary text-xl">agriculture</span>
            </div>
            <div className="mt-2 text-2xl font-black text-on-surface">{localAssets.length} Units</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Tractors, Harvesters & Dryers</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Farmer Needs Feed</span>
              <span className="material-symbols-outlined text-field-ochre text-xl">campaign</span>
            </div>
            <div className="mt-2 text-2xl font-black text-field-ochre">{farmerNeeds.filter(n => n.status === 'open').length} Open</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Farmers needing machinery</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Active Dispatches</span>
              <span className="material-symbols-outlined text-status-available text-xl">assignment_turned_in</span>
            </div>
            <div className="mt-2 text-2xl font-black text-status-available">{requestsList.length} Slips</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Tilling & harvesting on field</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Settlements</span>
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
            </div>
            <div className="mt-2 text-2xl font-black text-primary">₱10,320</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Cash-on-Dike & SACCO Split</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border-soft mb-6 gap-2">
          <button
            onClick={() => setActiveTab('machinery')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'machinery'
                ? 'border-primary text-primary'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">agriculture</span>
            <span>My Registered Machinery ({localAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('farmer_needs')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'farmer_needs'
                ? 'border-field-ochre text-field-ochre'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span>Farmer Needs Feed ({farmerNeeds.filter(n => n.status === 'open').length})</span>
            <span className="w-2 h-2 rounded-full bg-status-urgent animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('dispatches')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'dispatches'
                ? 'border-primary text-primary'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Incoming Equipment Requests ({requestsList.length})</span>
          </button>
        </div>

        {/* TAB 1: MACHINERY FLEET */}
        {activeTab === 'machinery' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-on-surface">Registered Machinery Fleet</h2>
                <p className="text-xs text-soil-slate">Tractors, harvesters, planters and post-harvest equipment available for rental.</p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Post New Equipment</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localAssets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-2xl p-5 border border-border-soft shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-surface-container font-bold text-soil-slate">
                        {asset.type}
                      </span>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        asset.status === 'available'
                          ? 'bg-status-available-bg text-status-available border border-status-available/20'
                          : 'bg-status-urgent-bg text-status-urgent border border-status-urgent/20'
                      }`}>
                        {asset.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-on-surface">{asset.name}</h3>
                    <p className="text-xs text-soil-slate mt-1 flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span>{asset.location}</span>
                    </p>

                    <div className="mt-3 p-3 rounded-xl bg-surface-container-low border border-border-soft/60 space-y-1 text-xs">
                      {asset.operator && (
                        <p className="text-soil-slate">
                          <strong className="text-on-surface">Operator:</strong> {asset.operator}
                        </p>
                      )}
                      {asset.fuelTerms && (
                        <p className="text-soil-slate text-[11px]">
                          <strong className="text-on-surface">Fuel Terms:</strong> {asset.fuelTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-soil-slate uppercase block">Service Rate</span>
                      <span className="text-base font-black text-field-ochre">
                        ₱{asset.rate?.toLocaleString()} <span className="text-xs font-normal text-soil-slate">/ {asset.unit === 'per_ha' ? 'ha' : asset.unit === 'per_bag' ? 'bag' : 'day'}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href="/dispatch-slip"
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-soil-slate transition-colors"
                      >
                        Dispatch Slip
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FARMER NEEDS FEED */}
        {activeTab === 'farmer_needs' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
                <span>🌾 Farmer Machinery Needs & Service Requests</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-field-ochre/15 text-field-ochre font-bold">
                  Live Barangay Broadcast
                </span>
              </h2>
              <p className="text-xs text-soil-slate">
                Farmers in your cluster looking for tractors, harvesters, and sprayers. Accept to send your equipment and operators directly.
              </p>
            </div>

            <div className="space-y-4">
              {farmerNeeds.map((need) => (
                <div
                  key={need.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    need.status === 'accepted'
                      ? 'border-status-available bg-status-available-bg/20'
                      : 'border-border-soft hover:border-field-ochre/60 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border-soft">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-primary">{need.id}</span>
                        <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${need.urgencyBadge}`}>
                          {need.urgency}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-on-surface mt-1">{need.serviceNeeded}</h3>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-[10px] font-mono text-soil-slate uppercase block">Target Schedule Date</span>
                      <span className="font-bold text-xs text-on-surface">{need.targetDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3 text-xs">
                    <div>
                      <span className="text-soil-slate text-[10px] font-mono uppercase block">Farmer & Location</span>
                      <strong className="text-on-surface">{need.farmerName}</strong>
                      <p className="text-soil-slate font-mono text-[11px]">{need.location}</p>
                    </div>

                    <div>
                      <span className="text-soil-slate text-[10px] font-mono uppercase block">Land Parcel Size</span>
                      <strong className="text-on-surface">{need.hectares} Hectares</strong>
                      <p className="text-soil-slate text-[11px]">Type: {need.machineType}</p>
                    </div>

                    <div>
                      <span className="text-soil-slate text-[10px] font-mono uppercase block">Offered Compensation</span>
                      <strong className="text-field-ochre">{need.offeredBudget}</strong>
                      <p className="text-soil-slate text-[11px]">Settlement on dike</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft/60 text-xs text-soil-slate mb-3">
                    <strong className="text-on-surface">Farmer Field Notes: </strong>
                    {need.notes}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] font-mono text-soil-slate">
                      RSBSA: {need.rsbsaId} • Guaranteed by Barangay MAO Desk
                    </span>

                    {need.status === 'accepted' ? (
                      <div className="flex items-center gap-2 text-status-available font-bold text-xs">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Accepted! Dispatch ticket active</span>
                        <Link href="/dispatch-slip" className="ml-2 underline text-primary">Open Dispatch Slip</Link>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptNeed(need.id)}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">task_alt</span>
                          <span>Accept & Dispatch Machinery</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISPATCH TICKETS */}
        {activeTab === 'dispatches' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-black text-on-surface">Field Job Tickets & Dispatches</h2>
                <p className="text-xs text-soil-slate">Official DA-PhilMech operational tickets with Cash-on-Dike verification.</p>
              </div>
            </div>

            <div className="space-y-3">
              {requestsList.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-5 border border-border-soft shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-primary">{req.id}</span>
                      <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                        req.status === 'dispatched'
                          ? 'bg-status-available-bg text-status-available'
                          : req.status === 'completed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-status-pending-bg text-status-pending'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface">{req.machine}</h3>
                    <p className="text-xs text-soil-slate">
                      Client: <strong>{req.farmerName}</strong> • {req.hectares} ha • {req.location} • {req.date}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-soil-slate uppercase block">Settlement Value</span>
                      <span className="text-base font-black text-primary font-mono">{req.totalEstimated}</span>
                    </div>

                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleRequestStatus(req.id, 'dispatched')}
                          className="px-3 py-1.5 rounded-lg bg-status-available text-white text-xs font-bold hover:bg-status-available/90 cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <Link
                        href={req.actionSlip}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">print</span>
                        <span>A4 Slip</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POST TRACTOR / MACHINERY MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border-soft shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">agriculture</span>
                <h3 className="text-lg font-black text-on-surface">Post New Tractor / Machinery</h3>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-soil-slate hover:text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostMachine} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-soil-slate mb-1">Equipment Name & Model</label>
                <input
                  type="text"
                  required
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  placeholder="e.g. Kubota M7040 4WD Heavy Tractor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low font-bold text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-soil-slate mb-1">Category Type</label>
                  <select
                    value={newMachine.type}
                    onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface font-semibold"
                  >
                    <option value="tractor">4WD Heavy Tractor</option>
                    <option value="harvester">Combine Harvester</option>
                    <option value="drone">Precision Spray Drone</option>
                    <option value="dryer">Recirculating Batch Dryer</option>
                    <option value="transplanter">Mechanical Transplanter</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-soil-slate mb-1">Horsepower / Rating</label>
                  <input
                    type="text"
                    value={newMachine.horsepower}
                    onChange={(e) => setNewMachine({ ...newMachine, horsepower: e.target.value })}
                    placeholder="e.g. 70 HP Turbo"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-soil-slate mb-1">Custom Rate (₱ PHP)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    value={newMachine.rate}
                    onChange={(e) => setNewMachine({ ...newMachine, rate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft bg-surface-container-low font-mono font-bold text-sm text-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-soil-slate mb-1">Billing Unit</label>
                  <select
                    value={newMachine.unit}
                    onChange={(e) => setNewMachine({ ...newMachine, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface font-semibold"
                  >
                    <option value="per_ha">Per Hectare (/ha)</option>
                    <option value="per_day">Per Day (/day)</option>
                    <option value="per_bag">Per Sacco Bag (/bag)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-soil-slate mb-1">Depot / Barangay Location</label>
                <input
                  type="text"
                  required
                  value={newMachine.location}
                  onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                  placeholder="e.g. Brgy. San Manuel, Tagum City"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-soil-slate mb-1">Fuel & Operator Policy</label>
                <input
                  type="text"
                  value={newMachine.fuelTerms}
                  onChange={(e) => setNewMachine({ ...newMachine, fuelTerms: e.target.value })}
                  placeholder="e.g. Farmer supplies 18L Diesel/ha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-soil-slate mb-1">Description & Implements</label>
                <textarea
                  rows={2}
                  value={newMachine.description}
                  onChange={(e) => setNewMachine({ ...newMachine, description: e.target.value })}
                  placeholder="Details on attached implements (rotavator, disc plow, trailer) and operator certification."
                  className="w-full px-3.5 py-2 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface"
                />
              </div>

              <div className="pt-3 border-t border-border-soft flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-soil-slate font-bold hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-container cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                  <span>Publish Machinery Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

