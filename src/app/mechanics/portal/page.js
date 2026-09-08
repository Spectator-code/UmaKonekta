'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MechanicPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sos_feed'); // 'sos_feed', 'parts_inventory', 'work_logs'
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    ticketId: 'SOS-2026-041',
    machineName: 'Kubota DC-70 Plus Combine Harvester',
    farmerName: 'Danilo Ramos',
    issueResolved: 'Replaced torn threshing belt and cleared jammed feeder house drum.',
    partsUsed: '1x V-Belt B-88, 2x M12 Shear Pin Bolts',
    repairCost: 1450,
    serviceStatus: 'operational'
  });

  // Emergency SOS Field Breakdowns Feed
  const [sosList, setSosList] = useState([
    {
      id: 'SOS-2026-041',
      machine: 'Kubota DC-70 Plus Combine Harvester',
      category: 'Combine Harvester',
      operator: 'Ka Nestor Panganiban (0919-445-1234)',
      farmer: 'Danilo Ramos',
      location: 'Sitio Balite, Brgy. San Manuel, Tagum City',
      gpsCoords: '7.4472° N, 125.8035° E (Field Dike Lateral 3)',
      breakdownType: 'Threshing Drum Jammed & Broken V-Belt',
      severity: 'CRITICAL (Harvest Stalled)',
      severityBadge: 'bg-status-urgent-bg text-status-urgent border-status-urgent/30',
      timeReported: '25 mins ago',
      status: 'assigned', // 'open', 'assigned', 'resolved'
      assignedMechanic: 'Mario Santos (TESDA NC-II)'
    },
    {
      id: 'SOS-2026-039',
      machine: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      category: '4WD Tractor',
      operator: 'Mang Danilo Ramos (0928-882-9901)',
      farmer: 'Elena Cruz',
      location: 'Purok 4, Brgy. Mankilam, Tagum City',
      gpsCoords: '7.4521° N, 125.8110° E (Muddy Lowland)',
      breakdownType: 'Hydraulic 3-Point Hitch Lift Failure',
      severity: 'HIGH (Rotavator Stuck in Mud)',
      severityBadge: 'bg-status-urgent-bg text-status-urgent border-status-urgent/30',
      timeReported: '1 hour ago',
      status: 'open',
      assignedMechanic: null
    },
    {
      id: 'SOS-2026-034',
      machine: 'DJI Agras T40 Spray Drone',
      category: 'Agricultural Drone',
      operator: 'Engr. Aris Valdez (0908-112-3344)',
      farmer: 'Rogelio Bato',
      location: 'Sitio Riverside, Brgy. Pagsabangan',
      gpsCoords: '7.4610° N, 125.7990° E',
      breakdownType: 'Nozzle Pump Clogging & ESC Error 24',
      severity: 'MEDIUM (Minor Maintenance)',
      severityBadge: 'bg-status-pending-bg text-status-pending border-status-pending/30',
      timeReported: '3 hours ago',
      status: 'resolved',
      assignedMechanic: 'Mario Santos (TESDA NC-II)'
    }
  ]);

  // Spare Parts Requisition & Mobile Van Inventory
  const [partsList, setPartsList] = useState([
    { id: 'PRT-01', name: 'Heavy Duty V-Belt B-88 (Kubota Spec)', stock: 6, unit: 'pcs', category: 'Belts & Pulleys', price: 650, depot: 'Tagum Central Silo Bodega' },
    { id: 'PRT-02', name: 'High-Tensile Shear Pins M12 (Grade 8.8)', stock: 24, unit: 'pcs', category: 'Hardware', price: 120, depot: 'Mobile Van Kit #2' },
    { id: 'PRT-03', name: 'Diesel Fuel Filter Element (Yanmar EF Series)', stock: 8, unit: 'pcs', category: 'Filters', price: 420, depot: 'Tagum FCA Pool' },
    { id: 'PRT-04', name: 'Hydraulic Hose Assembly 1/2" 2-Wire (1.5m)', stock: 4, unit: 'pcs', category: 'Hydraulics', price: 1250, depot: 'Mobile Van Kit #2' },
    { id: 'PRT-05', name: 'Rotary Tiller Blade C-Shape (Forged Steel)', stock: 32, unit: 'pcs', category: 'Tillage Implements', price: 280, depot: 'Tagum Central Silo Bodega' },
    { id: 'PRT-06', name: 'Centrifugal Spray Nozzle Atomizer (T40 Drone)', stock: 5, unit: 'sets', category: 'Drone Avionics', price: 1850, depot: 'Regional Tech Hub' }
  ]);

  // Work Logs History
  const [workLogs, setWorkLogs] = useState([
    {
      id: 'LOG-8812',
      date: 'Oct 11, 2026',
      ticket: 'SOS-2026-034',
      machine: 'DJI Agras T40 Spray Drone',
      farmer: 'Rogelio Bato',
      description: 'Ultrasonic cleaning of dual atomized nozzles and reset ESC sensor firmware.',
      partsUsed: '1x Nozzle Seal Kit',
      amount: '₱650.00',
      status: 'Certified Safe for Flight'
    },
    {
      id: 'LOG-8809',
      date: 'Oct 09, 2026',
      ticket: 'SOS-2026-028',
      machine: 'Solis 50 4WD Utility Tractor',
      farmer: 'J. Madronero',
      description: 'Replaced broken hydraulic return line and refilled 5L ISO 68 Hydraulic Oil.',
      partsUsed: '1x Hyd Hose, 5L Oil',
      amount: '₱2,100.00',
      status: 'Dispatched to Tilling'
    }
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=mechanic');
    }
  }, [status, router]);

  const handleClaimSos = (id) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'assigned', assignedMechanic: session?.user?.name || 'Mario Santos (TESDA NC-II)' } : s));
    alert('Breakdown ticket claimed! GPS navigation & dispatch route opened for your Mobile Repair Van.');
  };

  const handleResolveSos = (id) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved' } : s));
    alert('Machinery verified operational! Maintenance certificate recorded.');
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ticket: logForm.ticketId,
      machine: logForm.machineName,
      farmer: logForm.farmerName,
      description: logForm.issueResolved,
      partsUsed: logForm.partsUsed,
      amount: `₱${logForm.repairCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: 'Field Certified & Tested'
    };
    setWorkLogs([newLog, ...workLogs]);
    setIsLogModalOpen(false);
    alert('Job log saved and synchronized with DA-PhilMech Machinery Registry.');
  };

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface pb-16">
      {/* Header Banner */}
      <div className="bg-[#8F4700] text-white py-6 sm:py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white border border-white/30">
                🔧 MOBILE REPAIR & MECHANIC DISPATCH PORTAL
              </span>
              <span className="text-xs text-white/90 font-mono">TESDA NC-II Certified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {session?.user?.name || 'Mario Santos'}
            </h1>
            <p className="text-white font-mono text-xs sm:text-sm mt-1">
              License: <span className="font-bold text-white">{session?.user?.registryId || 'MECH-TESDA-889'}</span> • <span className="text-white/90">Unit: Mobile Emergency Van #2 (Tagum Hub)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-[#8F4700] text-xs sm:text-sm font-bold hover:bg-white/90 shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">build_circle</span>
              <span>+ Log Completed Repair</span>
            </button>

            <a
              href="tel:1343"
              className="px-4 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              <span>SOS Hotline 1343</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Metric Quick Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Active SOS Breakdowns</span>
              <span className="material-symbols-outlined text-status-urgent text-xl">warning</span>
            </div>
            <div className="mt-2 text-2xl font-black text-status-urgent">{sosList.filter(s => s.status !== 'resolved').length} Active</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Harvesters & Tractors on dikes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Mobile Van Spare Parts</span>
              <span className="material-symbols-outlined text-[#8F4700] text-xl">inventory_2</span>
            </div>
            <div className="mt-2 text-2xl font-black text-[#8F4700]">{partsList.length} SKUs</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Belts, hoses, shear pins, filters</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Resolved This Month</span>
              <span className="material-symbols-outlined text-status-available text-xl">verified</span>
            </div>
            <div className="mt-2 text-2xl font-black text-status-available">14 Repairs</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Average field fix time: 42 mins</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Mechanic Rating</span>
              <span className="material-symbols-outlined text-primary text-xl">star</span>
            </div>
            <div className="mt-2 text-2xl font-black text-primary">4.9 ★</div>
            <span className="text-[11px] text-soil-slate mt-1 block">DA-Certified Master Technician</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border-soft mb-6 gap-2">
          <button
            onClick={() => setActiveTab('sos_feed')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sos_feed'
                ? 'border-[#8F4700] text-[#8F4700]'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">car_repair</span>
            <span>Emergency Field Breakdowns ({sosList.filter(s => s.status !== 'resolved').length})</span>
            <span className="w-2 h-2 rounded-full bg-status-urgent animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('parts_inventory')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'parts_inventory'
                ? 'border-primary text-primary'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory</span>
            <span>Mobile Van Parts Stock ({partsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('work_logs')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'work_logs'
                ? 'border-primary text-primary'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
            <span>Completed Repair Logs ({workLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: SOS BREAKDOWN FEED */}
        {activeTab === 'sos_feed' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
                <span>🚨 Active Mud Stuck & Mechanical SOS Alerts</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-status-urgent-bg text-status-urgent font-bold border border-status-urgent/20">
                  Real-time Field Dispatch
                </span>
              </h2>
              <p className="text-xs text-soil-slate">
                Live breakdown broadcasts from combine operators and tractor drivers stranded in paddy fields.
              </p>
            </div>

            <div className="space-y-4">
              {sosList.map((sos) => (
                <div
                  key={sos.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    sos.status === 'resolved'
                      ? 'border-status-available/40 bg-status-available-bg/10'
                      : sos.status === 'assigned'
                      ? 'border-[#8F4700] shadow-md'
                      : 'border-status-urgent/40 shadow-xs hover:border-status-urgent'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border-soft">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-primary">{sos.id}</span>
                        <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${sos.severityBadge}`}>
                          {sos.severity}
                        </span>
                        <span className="text-xs text-soil-slate font-mono">• {sos.timeReported}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-on-surface mt-1">{sos.breakdownType}</h3>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg font-bold ${
                        sos.status === 'resolved'
                          ? 'bg-status-available-bg text-status-available'
                          : sos.status === 'assigned'
                          ? 'bg-[#8F4700]/15 text-[#8F4700]'
                          : 'bg-status-urgent-bg text-status-urgent'
                      }`}>
                        {sos.status === 'resolved' ? '✓ Repaired & Operational' : sos.status === 'assigned' ? '🔧 In Progress (Mechanic on Dike)' : '⏳ Awaiting Mechanic'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3 text-xs">
                    <div>
                      <span className="text-soil-slate text-[10px] font-mono uppercase block">Equipment & Category</span>
                      <strong className="text-on-surface">{sos.machine}</strong>
                      <p className="text-soil-slate font-mono text-[11px]">Type: {sos.category}</p>
                    </div>

                    <div>
                      <span className="text-soil-slate text-[10px] font-mono uppercase block">Operator & Client</span>
                      <strong className="text-on-surface">{sos.operator}</strong>
                      <p className="text-soil-slate text-[11px]">Farmer: {sos.farmer}</p>
                    </div>

                    <div>
                      <span className="text-soil-slate text-[10px] font-mono uppercase block">Dike Location & GPS</span>
                      <strong className="text-primary">{sos.location}</strong>
                      <p className="text-soil-slate font-mono text-[11px]">{sos.gpsCoords}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-soft/70">
                    <div className="text-[11px] font-mono text-soil-slate">
                      {sos.assignedMechanic ? (
                        <span>Assigned Technician: <strong className="text-[#8F4700]">{sos.assignedMechanic}</strong></span>
                      ) : (
                        <span className="text-status-urgent font-bold">Unassigned • Van Response Distance: ~3.2 km</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {sos.status === 'open' && (
                        <button
                          onClick={() => handleClaimSos(sos.id)}
                          className="px-4 py-2 rounded-xl bg-[#8F4700] text-white text-xs font-bold hover:bg-[#703800] shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">navigation</span>
                          <span>Dispatch Van & Navigate</span>
                        </button>
                      )}

                      {sos.status === 'assigned' && (
                        <button
                          onClick={() => handleResolveSos(sos.id)}
                          className="px-4 py-2 rounded-xl bg-status-available text-white text-xs font-bold hover:bg-status-available/90 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Mark Fixed & Tested</span>
                        </button>
                      )}

                      <Link
                        href="/dispatch-slip"
                        className="px-3.5 py-2 rounded-xl bg-surface-container text-soil-slate text-xs font-bold hover:bg-surface-container-high transition-colors"
                      >
                        Inspect Job Slip
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SPARE PARTS INVENTORY */}
        {activeTab === 'parts_inventory' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-black text-on-surface">Mobile Van & Silo Spare Parts Stock</h2>
                <p className="text-xs text-soil-slate">Certified OEM belts, pins, hydraulic hoses, and filters available for instant field replacement.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partsList.map((part) => (
                <div key={part.id} className="bg-white rounded-2xl p-5 border border-border-soft shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-surface-container font-bold text-soil-slate">
                        {part.id}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {part.stock} {part.unit} in stock
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-on-surface">{part.name}</h3>
                    <p className="text-xs text-soil-slate mt-1">Category: <strong>{part.category}</strong></p>
                    <p className="text-[11px] font-mono text-soil-slate mt-0.5">Depot: {part.depot}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-soil-slate uppercase block">Standard Price</span>
                      <span className="text-base font-black text-primary font-mono">₱{part.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => alert(`Requisition requested for ${part.name} from ${part.depot}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#8F4700] text-white text-xs font-bold hover:bg-[#703800] cursor-pointer"
                    >
                      Requisition +1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WORK LOGS */}
        {activeTab === 'work_logs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-black text-on-surface">Field Repair & Maintenance Certification History</h2>
                <p className="text-xs text-soil-slate">Official logs synchronized with DA RSBSA Machinery Registry.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container text-soil-slate font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Log ID / Date</th>
                    <th className="p-3.5">Machinery & Client</th>
                    <th className="p-3.5">Repair Summary</th>
                    <th className="p-3.5">Parts Replaced</th>
                    <th className="p-3.5">Settlement</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {workLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low/50">
                      <td className="p-3.5 font-mono font-bold text-primary">
                        {log.id}
                        <span className="block text-[10px] font-normal text-soil-slate">{log.date}</span>
                      </td>
                      <td className="p-3.5">
                        <strong className="block text-on-surface">{log.machine}</strong>
                        <span className="text-soil-slate">Farmer: {log.farmer}</span>
                      </td>
                      <td className="p-3.5 text-soil-slate">{log.description}</td>
                      <td className="p-3.5 font-mono text-soil-slate">{log.partsUsed}</td>
                      <td className="p-3.5 font-mono font-bold text-primary">{log.amount}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-status-available-bg text-status-available border border-status-available/20">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* LOG REPAIR MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border-soft shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8F4700] text-2xl">build</span>
                <h3 className="text-lg font-black text-on-surface">Log Completed Field Repair</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-soil-slate hover:text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-soil-slate mb-1">Equipment Name & Model</label>
                <input
                  type="text"
                  required
                  value={logForm.machineName}
                  onChange={(e) => setLogForm({ ...logForm, machineName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low font-bold text-sm text-on-surface focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-soil-slate mb-1">Farmer / Owner</label>
                  <input
                    type="text"
                    required
                    value={logForm.farmerName}
                    onChange={(e) => setLogForm({ ...logForm, farmerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface"
                  />
                </div>

                <div>
                  <label className="block font-bold text-soil-slate mb-1">Service & Parts Cost (₱)</label>
                  <input
                    type="number"
                    required
                    value={logForm.repairCost}
                    onChange={(e) => setLogForm({ ...logForm, repairCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low font-mono font-bold text-sm text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-soil-slate mb-1">Parts Replaced</label>
                <input
                  type="text"
                  value={logForm.partsUsed}
                  onChange={(e) => setLogForm({ ...logForm, partsUsed: e.target.value })}
                  placeholder="e.g. 1x V-Belt B-88, 2x M12 Bolts"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-soil-slate mb-1">Repair Diagnostics & Summary</label>
                <textarea
                  rows={3}
                  required
                  value={logForm.issueResolved}
                  onChange={(e) => setLogForm({ ...logForm, issueResolved: e.target.value })}
                  placeholder="Describe root cause and corrective maintenance steps taken."
                  className="w-full px-3.5 py-2 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface"
                />
              </div>

              <div className="pt-3 border-t border-border-soft flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-soil-slate font-bold hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8F4700] text-white font-bold hover:bg-[#703800] cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Official Repair Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
