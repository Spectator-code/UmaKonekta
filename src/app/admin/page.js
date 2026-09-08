'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FarmerIDCard from '@/components/FarmerIDCard';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for new Farmer Registration / ID generation
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newRegistryId, setNewRegistryId] = useState('');
  const [coopName, setCoopName] = useState('San Manuel Agrarian Beneficiaries Co-op (SMABC)');
  const [barangay, setBarangay] = useState('Brgy. San Manuel, Tagum City');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('0917-889-4091');
  const [barangayHotline, setBarangayHotline] = useState('(084) 216-4401 / 0920-111-9988');
  const [depotProviderName, setDepotProviderName] = useState('Tagum FCA Machinery Depot (Engr. R. Dizon)');
  const [depotProviderPhone, setDepotProviderPhone] = useState('0919-445-1234');
  const [formSuccess, setFormSuccess] = useState(false);

  const [adminTab, setAdminTab] = useState('farmer_ids'); // 'farmer_ids', 'fleet_audit', 'dispatch_logs'

  // Municipal Fleet Oversight Data
  const [fleetAuditList, setFleetAuditList] = useState([
    { id: 'FLT-01', name: 'Kubota DC-70 Plus Combine Harvester', depot: 'Tagum FCA Depot', type: 'Combine Harvester', status: 'Certified & Active', engineNo: 'V2403-CR-TE4', lastInspection: 'Oct 02, 2026' },
    { id: 'FLT-02', name: 'Yanmar EF494T 4WD Heavy Duty Tractor', depot: 'Apokon Agrarian Co-op', type: '4WD Tractor', status: 'Certified & Active', engineNo: '4TNV88-GGE', lastInspection: 'Oct 05, 2026' },
    { id: 'FLT-03', name: 'DJI Agras T40 Precision Crop Sprayer', depot: 'Muñoz Precision Center', type: 'Agri Drone', status: 'CAAP Pilot Approved', engineNo: 'T40-SN-8841', lastInspection: 'Oct 08, 2026' },
    { id: 'FLT-04', name: 'Buhler 5-Ton Grain Recirculating Dryer', depot: 'Municipal Silo Bodega', type: 'Biomass Batch Dryer', status: 'Calibration Verified', engineNo: 'BHL-DRY-9901', lastInspection: 'Oct 01, 2026' }
  ]);

  // Municipal Dispatch Audit Logs
  const [dispatchAuditLogs, setDispatchAuditLogs] = useState([
    { id: 'AUD-991', ticketNo: 'OP-2026-089', farmer: 'Danilo Ramos', provider: 'Tagum FCA Depot', hectares: 2.4, amount: '₱5,760', settlement: 'Cash-on-Dike Certified', status: 'Settled & Verified' },
    { id: 'AUD-990', ticketNo: 'ST-2026-7712', farmer: 'J. Madronero', provider: 'San Manuel Co-op (SMABC)', hectares: 1.8, amount: '₱116,913', settlement: '8% SACCO Split Validated', status: 'Settled & Verified' },
    { id: 'AUD-989', ticketNo: 'SOS-2026-034', farmer: 'Rogelio Bato', provider: 'Mobile Van Kit #2 (Mario Santos)', hectares: 3.2, amount: '₱650', settlement: 'TESDA Repair Complete', status: 'Settled & Verified' }
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=admin');
    } else {
      fetchFarmers();
    }
  }, [status, router]);

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/farmers');
      const data = await res.json();
      if (data.farmers && data.farmers.length > 0) {
        setFarmers(data.farmers);
        setSelectedFarmer(data.farmers[0]);
      } else {
        // Default demo farmers if empty
        const fallback = [
          {
            id: 'f-1',
            name: 'Juan Dela Cruz',
            registryId: '03-49-12-00841',
            role: 'farmer',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'f-2',
            name: 'Danilo Ramos',
            registryId: '03-49-12-00481',
            role: 'farmer',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'f-3',
            name: 'J. Madronero',
            registryId: '03-49-12-00912',
            role: 'farmer',
            createdAt: new Date().toISOString(),
          }
        ];
        setFarmers(fallback);
        setSelectedFarmer(fallback[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFarmer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFarmerName,
          registryId: newRegistryId,
          password: '4092'
        })
      });
      const data = await res.json();
      if (data.success && data.farmer) {
        setFarmers([data.farmer, ...farmers]);
        setSelectedFarmer(data.farmer);
        setFormSuccess(true);
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setFormSuccess(false);
          setNewFarmerName('');
          setNewRegistryId('');
        }, 1000);
      } else {
        alert(data.error || 'Failed to create farmer.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const filteredFarmers = farmers.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.registryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface pb-16">
      
      {/* Admin Top Header Strip */}
      <div className="bg-gradient-to-r from-[#003618] via-primary to-[#01505e] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-headline-sm tracking-tight text-white">
                  LGU Command Center & Moderation Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#a3f5b2]/20 text-[#a3f5b2] border border-[#a3f5b2]/30">
                  MAO Official
                </span>
              </div>
              <p className="text-white font-mono text-xs mt-0.5">
                Municipal Agriculture Office • <span className="text-white font-bold">{session?.user?.name || 'LGU Admin Officer'}</span> ({session?.user?.registryId || 'GOV-MAO-R11-0042'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-harvest-amber text-on-surface font-extrabold text-xs sm:text-sm hover:bg-harvest-amber/90 active:scale-[0.98] transition-all shadow-md self-start md:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Register & Generate Farmer ID</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Metric Quick Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">RSBSA Farmers</span>
              <span className="material-symbols-outlined text-primary text-xl">groups</span>
            </div>
            <div className="mt-2 text-2xl font-black text-on-surface">{farmers.length} Enrolled</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Tagged with Barcodes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Certified Machinery</span>
              <span className="material-symbols-outlined text-field-ochre text-xl">agriculture</span>
            </div>
            <div className="mt-2 text-2xl font-black text-field-ochre">{fleetAuditList.length} Units</div>
            <span className="text-[11px] text-soil-slate mt-1 block">DA-PhilMech Inspected</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Audited Dispatches</span>
              <span className="material-symbols-outlined text-status-available text-xl">task_alt</span>
            </div>
            <div className="mt-2 text-2xl font-black text-status-available">{dispatchAuditLogs.length} Verified</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Cash-on-Dike & SACCO Splits</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-soil-slate">Municipal Region</span>
              <span className="material-symbols-outlined text-primary text-xl">location_city</span>
            </div>
            <div className="mt-2 text-2xl font-black text-primary">Region XI</div>
            <span className="text-[11px] text-soil-slate mt-1 block">Davao del Norte Station Hub</span>
          </div>
        </div>

        {/* Tab Selector Navigation */}
        <div className="flex border-b border-border-soft mb-6 gap-2 no-print">
          <button
            onClick={() => setAdminTab('farmer_ids')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              adminTab === 'farmer_ids'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Farmer ID System Creator ({farmers.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('fleet_audit')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              adminTab === 'fleet_audit'
                ? 'border-field-ochre text-field-ochre font-black'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Depot Machinery Certification ({fleetAuditList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('dispatch_logs')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              adminTab === 'dispatch_logs'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-soil-slate hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Municipal Dispatch Audit Logs ({dispatchAuditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: FARMER ID CREATOR */}
        {adminTab === 'farmer_ids' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Registered Farmers Roster (5 Cols) (No Print) */}
            <div className="lg:col-span-5 flex flex-col gap-4 no-print">
              <div className="bg-white rounded-3xl p-5 border border-border-soft shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                      <span>Registered RSBSA Farmers</span>
                    </h2>
                    <p className="text-xs text-soil-slate">Select a farmer to verify credentials and print ID card.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    {farmers.length} Total
                  </span>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-xl border border-border-soft">
                  <span className="material-symbols-outlined text-soil-slate text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search farmer name or RSBSA ID..."
                    className="w-full text-xs bg-transparent focus:outline-none placeholder:text-soil-slate/60 font-bold text-on-surface"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-soil-slate font-bold cursor-pointer">Clear</button>
                  )}
                </div>

                {/* Farmer List */}
                <div className="divide-y divide-border-soft/60 max-h-[500px] overflow-y-auto overscroll-contain">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-3xl animate-spin text-primary">sync</span>
                      <p className="text-xs font-bold text-soil-slate mt-2">Loading Farmer Registry...</p>
                    </div>
                  ) : filteredFarmers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-3xl text-soil-slate/40">person_off</span>
                      <p className="text-xs font-bold text-soil-slate mt-1">No registered farmers found.</p>
                    </div>
                  ) : (
                    filteredFarmers.map((f) => {
                      const isSelected = selectedFarmer?.id === f.id || selectedFarmer?.registryId === f.registryId;
                      return (
                        <button
                          key={f.id || f.registryId}
                          type="button"
                          onClick={() => setSelectedFarmer(f)}
                          className={`w-full p-3 text-left transition-all flex items-center justify-between gap-3 rounded-xl my-1 cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-white shadow-xs font-bold'
                              : 'hover:bg-surface-container-low text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm uppercase ${
                              isSelected ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
                            }`}>
                              {f.name?.[0] || 'F'}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold leading-tight">{f.name}</p>
                              <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-white/80' : 'text-soil-slate'}`}>
                                RSBSA: {f.registryId}
                              </p>
                            </div>
                          </div>

                          <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-white' : 'text-soil-slate/40'}`}>
                            chevron_right
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-border-soft text-xs space-y-2">
                <h3 className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                  <span>DA-LGU Accreditation Protocols</span>
                </h3>
                <p className="text-soil-slate text-[11px] leading-relaxed">
                  All generated farmer IDs contain high-density barcodes synchronized with the municipal registry for quick optical verification during machine dispatch and SACCO grain weighing.
                </p>
              </div>
            </div>

            {/* RIGHT: Live ID Card Creator & Print Preview (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-center gap-6">
              <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-border-soft shadow-xs flex flex-col items-center">
                
                <div className="w-full flex items-center justify-between pb-4 border-b border-border-soft mb-6 no-print">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                      <span>Verified Farmer ID Card • Live Generator</span>
                    </h2>
                    <p className="text-xs text-soil-slate">
                      Front side with RSBSA Barcode & Back side with Emergency & Barangay Contacts
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-status-available-bg text-status-available border border-status-available/30">
                    CR80 Compliant
                  </span>
                </div>

                {/* Render ID Card Component */}
                <FarmerIDCard
                  farmer={selectedFarmer}
                  customData={{
                    coopName,
                    barangay,
                    emergencyContactName,
                    emergencyContactPhone,
                    barangayHotline,
                    depotProviderName,
                    depotProviderPhone,
                  }}
                />

                {/* Editable Emergency Contact Fields (No Print) */}
                <div className="w-full mt-8 pt-6 border-t border-border-soft no-print space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-field-ochre text-[18px]">edit_note</span>
                      <span>Customize Back Side Contacts for Selected ID</span>
                    </h3>
                    <span className="text-[10px] font-mono text-soil-slate">Real-time sync</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-soil-slate mb-1">In Case of Emergency (Kin Name)</label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g., Elena Dela Cruz (Spouse)"
                        className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface-container-low font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-soil-slate mb-1">Emergency Kin Phone</label>
                      <input
                        type="text"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface-container-low font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-soil-slate mb-1">Barangay Hall Contact / Phone</label>
                      <input
                        type="text"
                        value={barangayHotline}
                        onChange={(e) => setBarangayHotline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface-container-low font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-soil-slate mb-1">Machinery Depot / Provider Contact</label>
                      <input
                        type="text"
                        value={depotProviderPhone}
                        onChange={(e) => setDepotProviderPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface-container-low font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MACHINERY FLEET CERTIFICATION AUDIT */}
        {adminTab === 'fleet_audit' && (
          <div className="bg-white rounded-3xl p-6 border border-border-soft shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-on-surface">DA-PhilMech Accredited Machinery Fleet Roster</h2>
                <p className="text-xs text-soil-slate">Compliance verification, engine serial validation, and maintenance safety clearance.</p>
              </div>
              <button
                onClick={() => alert('Exporting Official DA-RFO XI Machinery Certificate PDF...')}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Accreditation Roster</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container text-soil-slate font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Fleet ID</th>
                    <th className="p-3.5">Machinery & Model</th>
                    <th className="p-3.5">Depot Provider</th>
                    <th className="p-3.5">Engine / Serial No.</th>
                    <th className="p-3.5">Last Inspection</th>
                    <th className="p-3.5">Certification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {fleetAuditList.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/50">
                      <td className="p-3.5 font-mono font-bold text-primary">{item.id}</td>
                      <td className="p-3.5 font-bold text-on-surface">{item.name}</td>
                      <td className="p-3.5 text-soil-slate">{item.depot}</td>
                      <td className="p-3.5 font-mono text-soil-slate">{item.engineNo}</td>
                      <td className="p-3.5 text-soil-slate">{item.lastInspection}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-status-available-bg text-status-available border border-status-available/20">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DISPATCH AUDIT LOGS */}
        {adminTab === 'dispatch_logs' && (
          <div className="bg-white rounded-3xl p-6 border border-border-soft shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-on-surface">Municipal Dispatch & Settlement Ledger</h2>
                <p className="text-xs text-soil-slate">Audited job tickets cross-verified with RSBSA farmer registries and SACCO scale weigh tickets.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container text-soil-slate font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Audit ID</th>
                    <th className="p-3.5">Job Ticket No.</th>
                    <th className="p-3.5">Farmer Client</th>
                    <th className="p-3.5">Service Provider</th>
                    <th className="p-3.5">Hectares</th>
                    <th className="p-3.5">Settlement Value</th>
                    <th className="p-3.5">Settlement Mode</th>
                    <th className="p-3.5">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {dispatchAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low/50">
                      <td className="p-3.5 font-mono font-bold text-primary">{log.id}</td>
                      <td className="p-3.5 font-mono font-bold text-on-surface">{log.ticketNo}</td>
                      <td className="p-3.5 font-bold text-on-surface">{log.farmer}</td>
                      <td className="p-3.5 text-soil-slate">{log.provider}</td>
                      <td className="p-3.5 font-mono">{log.hectares} ha</td>
                      <td className="p-3.5 font-mono font-bold text-primary">{log.amount}</td>
                      <td className="p-3.5 text-soil-slate">{log.settlement}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-status-available-bg text-status-available border border-status-available/20">
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

      {/* Register New Farmer Modal (No Print) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border-soft shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface">Register Farmer in Database</h3>
                  <p className="text-xs text-soil-slate">RSBSA Registry & Biometric ID Issuance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full border border-border-soft flex items-center justify-center text-soil-slate hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {formSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-status-available-bg text-status-available flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h4 className="text-lg font-extrabold text-on-surface">Farmer Registered Successfully!</h4>
                <p className="text-xs text-soil-slate">Generated barcode and added to official registry.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateFarmer} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Farmer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarmerName}
                    onChange={(e) => setNewFarmerName(e.target.value)}
                    placeholder="e.g., Ricardo M. Santos"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    RSBSA Registry ID Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newRegistryId}
                    onChange={(e) => setNewRegistryId(e.target.value)}
                    placeholder="e.g., 03-49-12-00994"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-soft text-xs sm:text-sm font-bold text-on-surface focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-soil-slate mt-1">Official Department of Agriculture enrollment ID.</p>
                </div>

                <div className="pt-3 border-t border-border-soft flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border-soft text-xs font-bold text-soil-slate hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save & Generate ID Card</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
