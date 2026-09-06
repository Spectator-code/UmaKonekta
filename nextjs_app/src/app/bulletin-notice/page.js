'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BulletinNoticePage() {
  const [isEcoPrint, setIsEcoPrint] = useState(false);

  const scheduleRows = [
    {
      dates: 'Oct 12 – Oct 14',
      sector: 'Purok 1 & 2 (Sitio Balite)',
      area: '24 Hectares',
      machinery: 'Kubota DC-70G Harvester (Fleet Unit #1)',
      operator: 'Ka Nestor Panganiban',
      waterStatus: 'NIA Canal Gate 3: Active Full Flow',
      statusColor: 'text-status-available',
    },
    {
      dates: 'Oct 15 – Oct 17',
      sector: 'Purok 3 (Centro / East Field)',
      area: '18 Hectares',
      machinery: 'Yanmar EF494T 4WD Tractor + Harrow',
      operator: 'Mang Danilo Ramos',
      waterStatus: 'Tail-end Lateral Drainage Active',
      statusColor: 'text-primary',
    },
    {
      dates: 'Oct 18 – Oct 21',
      sector: 'Purok 4 & 5 (North Irrigation)',
      area: '32 Hectares',
      machinery: 'Combine Harvester Fleet #2 & Solar Dryer',
      operator: 'Ka Ramon Dizon & Co-op Crew',
      waterStatus: 'Gate Closure for Pre-Harvest Drying',
      statusColor: 'text-field-ochre',
    },
  ];

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isEcoPrint ? 'bg-white text-black font-serif' : ''}`}>
      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-primary font-bold">Barangay Public Bulletin</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEcoPrint(!isEcoPrint)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              isEcoPrint
                ? 'bg-black text-white border-black'
                : 'bg-white text-soil-slate border-border-soft hover:border-primary'
            }`}
          >
            {isEcoPrint ? '✓ Eco Monochrome Active' : 'Eco Ink-Saving Preview'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Official Notice</span>
          </button>
        </div>
      </div>

      {/* Official Bulletin Notice Board */}
      <div
        className={`rounded-2xl p-6 sm:p-10 border ${
          isEcoPrint
            ? 'border-2 border-black bg-white shadow-none'
            : 'bg-white border-border-soft shadow-lg'
        }`}
      >
        {/* Republic of the Philippines Header */}
        <div className="text-center border-b-2 border-soil-slate/40 pb-6 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-soil-slate">
            Republic of the Philippines • Province of Tarlac
          </p>
          <p className="text-sm font-bold text-on-surface">
            MUNICIPALITY OF SAN MANUEL • BARANGAY SAN MANUEL
          </p>
          <p className="text-xs text-soil-slate font-medium">
            Office of the Barangay Agricultural Council & Agrarian Reform Committee
          </p>

          <div className="mt-4 pt-3 border-t border-soil-slate/20">
            <span className="inline-block px-3 py-1 rounded bg-harvest-amber/20 text-field-ochre font-mono text-xs font-bold uppercase mb-2">
              Official Advisory Bulletin # BAC-2026-10
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              COMBINE HARVESTER ROTATION SCHEDULE & NIA CANAL WATER RELEASE ADVISORY
            </h1>
            <p className="text-xs font-mono text-soil-slate mt-1">
              Dry/Wet Cropping Season 2026 • Valid: October 12 to October 25, 2026
            </p>
          </div>
        </div>

        {/* Advisory Context Notice */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-soft mb-6 text-xs text-soil-slate leading-relaxed">
          <p>
            <strong className="text-on-surface">MGA KABABAYANG MAGSASAKA:</strong> Alinsunod sa napagkasunduan sa nakaraang Pulong ng Barangay Agricultural Council at ng San Manuel Agrarian Beneficiaries Cooperative, narito ang opisyal na iskedyul ng ikot ng combine harvesters at pagpapakawala ng patubig mula sa NIA Lateral Canal Gate 3. Mangyaring makipag-ugnayan sa inyong itinalagang Purok Leader upang maihanda ang pilapil bago dumating ang makinarya.
          </p>
        </div>

        {/* Machinery Rotation Schedule Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border border-border-soft">
            <thead className="bg-surface-container border-b border-border-soft font-mono uppercase text-soil-slate">
              <tr>
                <th className="p-3 border-r border-border-soft">Inclusive Dates</th>
                <th className="p-3 border-r border-border-soft">Purok / Sector</th>
                <th className="p-3 border-r border-border-soft">Assigned Machinery & Operator</th>
                <th className="p-3">NIA Water Canal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft font-medium">
              {scheduleRows.map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low/50">
                  <td className="p-3 border-r border-border-soft font-mono font-bold whitespace-nowrap text-on-surface">
                    {row.dates}
                  </td>
                  <td className="p-3 border-r border-border-soft">
                    <strong className="text-on-surface block">{row.sector}</strong>
                    <span className="text-[11px] text-soil-slate">{row.area}</span>
                  </td>
                  <td className="p-3 border-r border-border-soft">
                    <strong className="text-primary block">{row.machinery}</strong>
                    <span className="text-[11px] text-soil-slate">{row.operator}</span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${row.statusColor}`}>{row.waterStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Diesel Fuel Subsidy Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-xs">
          <div className="p-4 rounded-xl border border-border-soft space-y-1.5">
            <h4 className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-field-ochre text-[18px]">local_gas_station</span>
              <span>DA Fuel Subsidy Card Distribution</span>
            </h4>
            <p className="text-soil-slate leading-relaxed">
              Maaari nang kubrahin ang Fuel Discount Cards (₱3,000 halaga ng krudo) sa Barangay Hall tuwing Lunes hanggang Biyernes. Dalhin ang inyong RSBSA Stub at isang Valid ID.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border-soft space-y-1.5">
            <h4 className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
              <span>Cash-on-Dike & Passbook Guidelines</span>
            </h4>
            <p className="text-soil-slate leading-relaxed">
              Ang bayad sa combine harvester ay <strong>₱2,800 bawat ektarya</strong> (o 8% palay split) at ibibigay nang direkta sa operator pagkatapos ng pag-gapas o ibabawas sa SACCO Passbook.
            </p>
          </div>
        </div>

        {/* Signatories & Official Seal */}
        <div className="pt-6 border-t-2 border-soil-slate/30 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm">
              Hon. Artemio V. Santos
            </div>
            <span className="text-[10px] text-soil-slate uppercase mt-1 block">Barangay Captain / Punong Barangay</span>
          </div>

          <div>
            <div className="h-10 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm">
              Ka Nestor Panganiban
            </div>
            <span className="text-[10px] text-soil-slate uppercase mt-1 block">Cooperative Machinery Coordinator</span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="h-10 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm">
              Engr. Melchor Ramos
            </div>
            <span className="text-[10px] text-soil-slate uppercase mt-1 block">NIA Watermaster District 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
