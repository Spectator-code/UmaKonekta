'use client';

/**
 * @file DailyDispatchRoster.js
 * @description React Component / Page for DailyDispatchRoster.js. Handles UI rendering and local state.
 * @module DailyDispatchRoster
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState } from 'react';
import Link from 'next/link';

export default function DailyDispatchRoster({
  depotName = 'Tagum FCA Machinery Depot',
  depotCode = 'DEPOT-TAG-01',
  cdaReg = 'provider-1-23-A001',
  cluster = 'Davao del Norte Agrarian Cluster',
  initialDate = '2026-10-14',
  dispatches = [],
  onClose = null,
  isModal = false,
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [thermalMode, setThermalMode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState('');

  // ============================================================================
  // 1. DATA & STATE INITIALIZATION
  // ============================================================================
  const activeDispatches = dispatches.length > 0 ? dispatches : [
    {
      ticketNo: 'OP-2026-089',
      timeSlot: '06:00 AM – 12:30 PM',
      machineName: 'Kubota DC-70 Plus Combine Harvester',
      plateNo: 'DA-HARV-041',
      operatorName: 'Accredited Operator #1',
      operatorPhone: '0919-000-0002',
      operatorCert: 'TESDA NC-II / DA-Cert #819',
      farmerName: 'Farmer Member #A002',
      rsbsaId: 'farmer-1-23-A002',
      location: 'Sitio Balite, Brgy. San Manuel, Tagum City',
      hectares: 2.5,
      fuelTerms: 'Farmer supplies 45L Diesel',
      fuelLiters: 45,
      settlementType: 'Cash-on-Dike (₱2,800/ha)',
      estimatedTotal: 7000,
      status: 'Dispatched / On-Field',
    },
    {
      ticketNo: 'OP-2026-092',
      timeSlot: '06:30 AM – 02:00 PM',
      machineName: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      plateNo: 'DA-TRAC-028',
      operatorName: 'Accredited Operator #2',
      operatorPhone: '0928-000-0003',
      operatorCert: 'TESDA NC-II / DA-Cert #402',
      farmerName: 'Farmer Member #A003',
      rsbsaId: 'farmer-1-23-A003',
      location: 'Purok 3, Brgy. Canocotan, Tagum City',
      hectares: 1.8,
      fuelTerms: 'Fuel Inclusive (Depot Diesel)',
      fuelLiters: 32,
      settlementType: 'Co-op Passbook (₱2,400/ha)',
      estimatedTotal: 4320,
      status: 'Dispatched / En Route',
    },
    {
      ticketNo: 'OP-2026-095',
      timeSlot: '05:30 AM – 09:00 AM',
      machineName: 'DJI Agras T40 Precision Crop Sprayer',
      plateNo: 'DRN-T40-8841',
      operatorName: 'Licensed Drone Pilot #1',
      operatorPhone: '0908-000-0004',
      operatorCert: 'CAAP Remote Pilot #RP-2024',
      farmerName: 'Farmer Member #A004',
      rsbsaId: 'farmer-1-23-A004',
      location: 'Purok 1, Brgy. Pagsabangan, Tagum City',
      hectares: 3.2,
      fuelTerms: 'Solar Battery Charged (4 Packs)',
      fuelLiters: 0,
      settlementType: 'Cash-on-Dike (₱950/ha)',
      estimatedTotal: 3040,
      status: 'Ready for Deployment',
    },
    {
      ticketNo: 'OP-2026-098',
      timeSlot: '07:00 AM – 04:00 PM',
      machineName: 'Kubota SPV-6MD Riding Transplanter',
      plateNo: 'DA-TRNS-014',
      operatorName: 'Accredited Transplanter Operator #1',
      operatorPhone: '0918-000-0005',
      operatorCert: 'PhilMech Certified Operator',
      farmerName: 'Farmer Member #A005',
      rsbsaId: 'farmer-1-23-A005',
      location: 'Purok 4, Brgy. Mankilam, Tagum City',
      hectares: 2.0,
      fuelTerms: 'Farmer supplies 20L Gasoline',
      fuelLiters: 20,
      settlementType: 'Cash-on-Dike (₱3,200/ha)',
      estimatedTotal: 6400,
      status: 'Scheduled',
    },
    {
      ticketNo: 'OP-2026-101',
      timeSlot: '08:00 AM – 05:00 PM',
      machineName: 'Buhler 5-Ton Grain Recirculating Dryer',
      plateNo: 'SILO-BDRY-01',
      operatorName: 'Accredited Silo Technician #1',
      operatorPhone: '0917-000-0004',
      operatorCert: 'PhilMech Post-Harvest Specialist',
      farmerName: 'San Manuel Rice Cropping Cluster',
      rsbsaId: 'farmer-1-23-A006',
      location: 'Municipal Silo Bodega, Tagum City',
      hectares: 100, // 100 bags
      fuelTerms: 'Biomass Paddy Husk Fired',
      fuelLiters: 0,
      settlementType: 'SACCO Grain Split (₱45/bag)',
      estimatedTotal: 4500,
      status: 'Batch In-Progress',
    }
  ];

  // Aggregate Metrics
  const totalUnits = activeDispatches.length;
  const totalHectares = activeDispatches.reduce((acc, d) => acc + (d.machineName.includes('Dryer') ? 0 : d.hectares), 0);
  const totalSettlement = activeDispatches.reduce((acc, d) => acc + d.estimatedTotal, 0);
  const totalDiesel = activeDispatches.reduce((acc, d) => acc + d.fuelLiters, 0);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Job Ticket', 'Time Slot', 'Machinery', 'Plate No', 'Operator', 'Operator Phone', 'Farmer', 'RSBSA ID', 'Location', 'Hectares', 'Fuel Terms', 'Settlement', 'Estimated Total (PHP)', 'Status'];
    const rows = activeDispatches.map(d => [
      d.ticketNo,
      `"${d.timeSlot}"`,
      `"${d.machineName}"`,
      d.plateNo,
      `"${d.operatorName}"`,
      d.operatorPhone,
      `"${d.farmerName}"`,
      d.rsbsaId,
      `"${d.location}"`,
      d.hectares,
      `"${d.fuelTerms}"`,
      `"${d.settlementType}"`,
      d.estimatedTotal,
      d.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Dispatch_Roster_${depotCode}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedMessage('Daily Roster CSV downloaded successfully!');
    setTimeout(() => setCopiedMessage(''), 4000);
  };

  return (
    <div className={`w-full ${thermalMode ? 'bg-white text-black font-mono' : 'bg-white text-on-surface'}`}>
      {/* ============================================================================
          2. CONTROL BAR (Hidden on Print)
          ============================================================================ */}
      <div className="no-print bg-cream-surface border-b border-border-soft p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-on-surface">
                Daily Operations & Dispatch Roster
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-field-ochre/15 text-field-ochre uppercase">
                5:00 AM Briefing Sheet
              </span>
            </div>
            <p className="text-xs text-soil-slate">
              {depotName} • DA-PhilMech Fleet Deployment Protocol
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft bg-white text-xs font-mono">
            <span className="material-symbols-outlined text-soil-slate text-[16px]">calendar_today</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer"
            />
          </div>

          {/* Thermal Mode Toggle */}
          <button
            type="button"
            onClick={() => setThermalMode(!thermalMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              thermalMode
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-soil-slate border-border-soft hover:text-on-surface hover:border-primary/50'
            }`}
            title="Toggle Monochrome High-Contrast layout for 58mm/80mm Bluetooth thermal printers"
          >
            <span className="material-symbols-outlined text-[16px]">receipt</span>
            <span>{thermalMode ? 'Eco-Thermal: ON' : 'Eco-Thermal (80mm)'}</span>
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white text-soil-slate border border-border-soft hover:text-on-surface hover:border-primary/50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          {/* Print A4 */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Roster</span>
          </button>

          {/* Modal Close Button */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-soil-slate hover:text-on-surface cursor-pointer ml-1"
            >
              X
            </button>
          )}
        </div>
      </div>

      {copiedMessage && (
        <div className="no-print mx-4 mt-3 p-3 rounded-xl bg-status-available-bg text-status-available border border-status-available/30 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{copiedMessage}</span>
        </div>
      )}

      {/* ============================================================================
          3. MAIN PRINTABLE DOCUMENT
          ============================================================================ */}
      <div className={`p-4 sm:p-8 ${thermalMode ? 'max-w-2xl mx-auto border-2 border-black print:border-none' : 'max-w-7xl mx-auto'}`}>
        {/* Document Header */}
        <div className={`border-b-2 ${thermalMode ? 'border-black pb-4 mb-4 text-center' : 'border-border-soft pb-6 mb-6'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`material-symbols-outlined ${thermalMode ? 'text-black' : 'text-primary'} text-[28px]`}>
                  agriculture
                </span>
                <span className={`font-mono text-xs uppercase tracking-widest font-extrabold ${thermalMode ? 'text-black' : 'text-soil-slate'}`}>
                  Republic of the Philippines • Department of Agriculture
                </span>
              </div>
              <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${thermalMode ? 'text-black font-mono' : 'text-primary'}`}>
                {depotName}
              </h1>
              <p className={`text-xs font-mono mt-0.5 ${thermalMode ? 'text-black' : 'text-soil-slate'}`}>
                Depot Registry: <strong className="text-on-surface font-bold">{cdaReg}</strong> • Station Code: <strong className="font-bold">{depotCode}</strong> • {cluster}
              </p>
            </div>

            <div className={`sm:text-right p-3 rounded-xl ${thermalMode ? 'border border-black' : 'bg-surface-container-low border border-border-soft'} font-mono text-xs`}>
              <div className="text-[10px] uppercase text-soil-slate font-bold">Roster Operational Date</div>
              <div className="text-sm font-extrabold text-on-surface mt-0.5">{selectedDate}</div>
              <div className="text-[10px] text-soil-slate mt-1">Briefing Time: 05:00 AM • Shift: AM/PM</div>
            </div>
          </div>

          {/* Meteorological & Field Conditions Advisory */}
          <div className={`mt-4 p-3 rounded-xl flex items-center justify-between text-xs ${
            thermalMode
              ? 'border border-black bg-gray-100 text-black'
              : 'bg-primary/5 border border-primary/20 text-on-surface'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${thermalMode ? 'text-black' : 'text-primary'}`}>
                partly_cloudy_day
              </span>
              <span>
                <strong>Field Condition Advisory:</strong> Soil moisture optimal (84% dry firm dikes). Lateral NIA canal gates active in East Sector.
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-soil-slate hidden md:inline">
              PhilMech Operations Bulletin
            </span>
          </div>
        </div>

        {/* ============================================================================
            4. QUICK SUMMARY METRICS GRID
            ============================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={`p-3.5 rounded-xl border ${thermalMode ? 'border-black' : 'border-border-soft bg-surface-container-low'}`}>
            <span className="text-[10px] font-mono uppercase text-soil-slate block">Dispatched Fleet</span>
            <div className="text-xl font-black text-on-surface mt-1">{totalUnits} Units</div>
            <span className="text-[10px] text-soil-slate">Assigned to field tickets</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${thermalMode ? 'border-black' : 'border-border-soft bg-surface-container-low'}`}>
            <span className="text-[10px] font-mono uppercase text-soil-slate block">Total Scheduled Area</span>
            <div className="text-xl font-black text-primary mt-1">{totalHectares.toFixed(1)} ha</div>
            <span className="text-[10px] text-soil-slate">Palay, corn & crops</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${thermalMode ? 'border-black' : 'border-border-soft bg-surface-container-low'}`}>
            <span className="text-[10px] font-mono uppercase text-soil-slate block">Est. Settlement Value</span>
            <div className="text-xl font-black text-field-ochre mt-1">₱{totalSettlement.toLocaleString()}</div>
            <span className="text-[10px] text-soil-slate">Cash-on-Dike & SACCO</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${thermalMode ? 'border-black' : 'border-border-soft bg-surface-container-low'}`}>
            <span className="text-[10px] font-mono uppercase text-soil-slate block">Total Diesel Requisition</span>
            <div className="text-xl font-black text-on-surface mt-1">{totalDiesel} Liters</div>
            <span className="text-[10px] text-soil-slate">Depot + Farmer supply</span>
          </div>
        </div>

        {/* ============================================================================
            5. DISPATCH MOVEMENTS TABLE
            ============================================================================ */}
        <div className={`overflow-x-auto rounded-2xl border ${thermalMode ? 'border-black' : 'border-border-soft'}`}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`font-mono uppercase text-[10px] tracking-wider ${
                thermalMode ? 'bg-black text-white' : 'bg-surface-container text-soil-slate border-b border-border-soft'
              }`}>
                <th className="p-3">Ticket & Time</th>
                <th className="p-3">Machinery & Plate</th>
                <th className="p-3">Assigned Operator & Driver Contact</th>
                <th className="p-3">Farmer & Location</th>
                <th className="p-3">Hectares & Fuel</th>
                <th className="p-3">Settlement</th>
                <th className="p-3 text-center">Departure / Sign</th>
                <th className="p-3 no-print text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {activeDispatches.map((row, idx) => (
                <tr key={row.ticketNo || idx} className={`${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'} hover:bg-surface-container-low/50 transition-colors`}>
                  {/* Ticket & Time */}
                  <td className="p-3 font-mono">
                    <span className="font-extrabold text-primary text-xs block">{row.ticketNo}</span>
                    <span className="text-[10px] text-soil-slate block mt-0.5">{row.timeSlot}</span>
                    <span className={`inline-block mt-1 text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border ${
                      thermalMode
                        ? 'border-black text-black'
                        : row.status.includes('Dispatched')
                        ? 'bg-status-available-bg text-status-available border-status-available/30'
                        : 'bg-status-pending-bg text-status-pending border-status-pending/30'
                    }`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Machinery */}
                  <td className="p-3">
                    <strong className="text-on-surface font-bold text-xs block">{row.machineName}</strong>
                    <span className="text-[11px] font-mono text-soil-slate block mt-0.5">
                      Plate: <strong className="text-on-surface font-bold">{row.plateNo}</strong>
                    </span>
                  </td>

                  {/* Assigned Operator & Contact */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-[16px] ${thermalMode ? 'text-black' : 'text-primary'}`}>
                        engineering
                      </span>
                      <strong className="text-on-surface font-bold text-xs">{row.operatorName}</strong>
                    </div>
                    <div className="text-[11px] font-mono mt-0.5 flex items-center gap-1 text-soil-slate">
                      <span className="material-symbols-outlined text-[12px]">phone</span>
                      <a href={`tel:${row.operatorPhone}`} className="hover:underline font-bold text-primary">
                        {row.operatorPhone}
                      </a>
                    </div>
                    <span className="text-[10px] text-soil-slate font-mono block mt-0.5">
                      {row.operatorCert}
                    </span>
                  </td>

                  {/* Farmer & Location */}
                  <td className="p-3">
                    <strong className="text-on-surface font-bold text-xs block">{row.farmerName}</strong>
                    <span className="text-[10px] font-mono text-soil-slate block">{row.rsbsaId}</span>
                    <p className="text-[11px] text-soil-slate mt-0.5">{row.location}</p>
                  </td>

                  {/* Hectares & Fuel */}
                  <td className="p-3 font-mono">
                    <div className="font-extrabold text-xs text-on-surface">
                      {row.machineName.includes('Dryer') ? `${row.hectares} bags` : `${row.hectares} ha`}
                    </div>
                    <span className="text-[10px] text-soil-slate block mt-0.5">
                      {row.fuelTerms}
                    </span>
                  </td>

                  {/* Settlement */}
                  <td className="p-3">
                    <div className="font-black text-xs text-field-ochre font-mono">
                      ₱{row.estimatedTotal.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-soil-slate block mt-0.5">
                      {row.settlementType}
                    </span>
                  </td>

                  {/* Sign-off Box */}
                  <td className="p-3 text-center font-mono">
                    <div className={`w-24 h-10 mx-auto rounded border border-dashed ${thermalMode ? 'border-black' : 'border-soil-slate/40'} flex items-center justify-center text-[9px] text-soil-slate`}>
                      Sign-out / Dispatched
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3 no-print text-right">
                    <Link
                      href={`/dispatch-slip?ticket=${encodeURIComponent(row.ticketNo)}&machine=${encodeURIComponent(row.machineName)}&operator=${encodeURIComponent(row.operatorName)}&phone=${encodeURIComponent(row.operatorPhone)}&farmer=${encodeURIComponent(row.farmerName)}&rsbsa=${encodeURIComponent(row.rsbsaId)}&location=${encodeURIComponent(row.location)}&hectares=${row.hectares}&settlement=${encodeURIComponent(row.settlementType)}`}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-bold text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">print</span>
                      <span>Slip</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================================
            6. FOOTER PROTOCOL & SIGNATURE BLOCKS
            ============================================================================ */}
        <div className={`mt-8 pt-6 border-t-2 ${thermalMode ? 'border-black' : 'border-border-soft'} text-xs font-mono`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-soil-slate uppercase text-[10px] block">Prepared By (Depot Dispatcher)</span>
              <div className="mt-8 border-b border-on-surface/40 pb-1 font-bold text-on-surface">
                Cooperative Machinery Dispatcher
              </div>
              <span className="text-[10px] text-soil-slate">Timestamp: 05:00 AM PHT</span>
            </div>

            <div>
              <span className="text-soil-slate uppercase text-[10px] block">Inspected By (Chief Field Mechanic)</span>
              <div className="mt-8 border-b border-on-surface/40 pb-1 font-bold text-on-surface">
                TESDA Master Mechanic #889
              </div>
              <span className="text-[10px] text-soil-slate">Safety & Fuel Clearance OK</span>
            </div>

            <div>
              <span className="text-soil-slate uppercase text-[10px] block">Approved By (Depot Operations Head)</span>
              <div className="mt-8 border-b border-on-surface/40 pb-1 font-bold text-on-surface">
                Engr. Agrarian Operations Officer
              </div>
              <span className="text-[10px] text-soil-slate">Municipal Agriculture Office / CDA</span>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-soil-slate border-t border-border-soft/60 pt-3">
            DA-PhilMech Memorandum Circular No. 2026-44 • Official Agrarian Resource Exchange Dispatch Protocol • UmaKonekta Agrarian Suite
          </div>
        </div>
      </div>
    </div>
  );
}
