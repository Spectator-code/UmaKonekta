'use client';

/**
 * @file page.js
 * @description React Component / Page for page.js. Handles UI rendering and local state.
 * @module page
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState } from 'react';
import Link from 'next/link';
import SmartCalendar from '@/components/SmartCalendar';
import {
  Calendar,
  Table as TableIcon,
  SlidersHorizontal,
  ArrowLeft,
  Fuel,
  Coins,
  Droplets,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  FileCheck
} from 'lucide-react';

export default function BulletinNoticePage() {
  const [isEcoPrint, setIsEcoPrint] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [selectedPurok, setSelectedPurok] = useState('all');

  const scheduleRows = [
    {
      id: 'sec-1',
      purokKey: 'purok1_2',
      dates: 'Oct 12 – Oct 14, 2026',
      sector: 'Purok 1 & 2 (Sitio Balite)',
      area: '24 Hectares',
      machinery: 'Kubota DC-70G Harvester (Fleet Unit #1)',
      operator: 'Accredited Operator #1 (0919-000-0002)',
      waterStatus: 'NIA Canal Gate 3: Active Full Flow',
      waterBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      statusColor: 'text-[#005426]',
      turnaround: '3 Days Rotation'
    },
    {
      id: 'sec-2',
      purokKey: 'purok3',
      dates: 'Oct 15 – Oct 17, 2026',
      sector: 'Purok 3 (Centro / East Field)',
      area: '18 Hectares',
      machinery: 'Yanmar EF494T 4WD Tractor + Harrow',
      operator: 'Accredited Operator #2 (0928-000-0003)',
      waterStatus: 'Tail-end Lateral Drainage Active',
      waterBadge: 'bg-blue-50 text-blue-800 border-blue-200',
      statusColor: 'text-[#005426]',
      turnaround: '3 Days Rotation'
    },
    {
      id: 'sec-3',
      purokKey: 'purok4_5',
      dates: 'Oct 18 – Oct 21, 2026',
      sector: 'Purok 4 & 5 (North Irrigation)',
      area: '32 Hectares',
      machinery: 'Combine Harvester Fleet #2 & Solar Dryer',
      operator: 'Accredited Operator #3 & Co-op Crew',
      waterStatus: 'Gate Closure for Pre-Harvest Drying',
      waterBadge: 'bg-amber-50 text-amber-800 border-amber-200',
      statusColor: 'text-amber-700',
      turnaround: '4 Days Rotation'
    },
  ];

  const filteredRows = selectedPurok === 'all'
    ? scheduleRows
    : scheduleRows.filter(r => r.purokKey === selectedPurok);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0 print:min-h-0 ${isEcoPrint ? 'bg-white text-black font-serif' : ''}`}>
      <div className="max-w-4xl mx-auto print:max-w-none">
        
        {/* Action Bar (No-Print) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <nav className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Link href="/" className="hover:text-[#005426] flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-[#005426] font-bold">Barangay Public Bulletin</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEcoPrint(!isEcoPrint)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isEcoPrint
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-[#DDE3DA] hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEcoPrint ? 'High-Contrast Monochrome' : 'Monochrome View'}</span>
            </button>
          </div>
        </div>

        {/* Official Bulletin Notice Board Card */}
        <div
          className={`rounded-3xl p-6 sm:p-10 border transition-colors ${
            isEcoPrint
              ? 'border-2 border-black bg-white shadow-none'
              : 'bg-white border-[#DDE3DA] shadow-xl shadow-gray-200/50'
          }`}
        >
          {/* Republic of the Philippines Header */}
          <div className="text-center border-b-2 border-gray-300 pb-7 mb-6 print:border-black print:pb-4 print:mb-4">
            <div className="flex items-center justify-center gap-2 mb-2 print:hidden">
              <span className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#005426] flex items-center justify-center border border-emerald-200">
                <Building className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 font-semibold">
                Republic of the Philippines • Province of Davao del Norte
              </span>
            </div>

            <p className="text-sm font-black text-gray-900 tracking-wide uppercase font-sans print:text-black">
              CITY OF TAGUM • BARANGAY APOKON
            </p>
            <p className="text-xs text-gray-600 font-medium mt-0.5 print:text-black">
              Office of the Barangay Agricultural Council & Agrarian Reform Committee
            </p>

            <div className="mt-4 pt-4 border-t border-gray-200 print:border-black">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-bold uppercase mb-2.5 print:border print:border-black print:bg-gray-100 print:text-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 print:hidden" />
                <span>Official Advisory Bulletin # BAC-2026-10</span>
              </span>
              
              <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight max-w-2xl mx-auto print:text-black print:text-xl">
                COMBINE HARVESTER ROTATION SCHEDULE & NIA CANAL WATER RELEASE ADVISORY
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500 mt-2 print:text-black">
                <Clock className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                <span>Dry/Wet Cropping Season 2026 • Valid: October 12 to October 25, 2026</span>
              </div>
            </div>
          </div>

          {/* Tagalog Public Advisory Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#DDE3DA] mb-6 text-xs text-gray-700 leading-relaxed print:bg-white print:border-black">
            <p>
              <strong className="text-gray-950 font-bold">MGA KABABAYANG MAGSASAKA:</strong> Alinsunod sa napagkasunduan sa nakaraang Pulong ng Barangay Agricultural Council at ng San Manuel Agrarian Beneficiaries Cooperative, narito ang opisyal na iskedyul ng ikot ng combine harvesters at pagpapakawala ng patubig mula sa NIA Lateral Canal Gate 3. Mangyaring makipag-ugnayan sa inyong itinalagang Purok Leader upang maihanda ang pilapil bago dumating ang makinarya.
            </p>
          </div>

          {/* View Mode & Filter Controls (No-print) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 no-print">
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'calendar'
                    ? 'bg-[#005426] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#005426]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Smart Calendar View</span>
              </button>
              
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-[#005426] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#005426]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Official Matrix Table</span>
              </button>
            </div>

            {/* Purok Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">Purok Filter:</span>
              <select
                value={selectedPurok}
                onChange={(e) => setSelectedPurok(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#DDE3DA] text-xs font-semibold text-gray-800 focus:border-[#005426] focus:outline-none shadow-2xs"
              >
                <option value="all">All Puroks & Sectors</option>
                <option value="purok1_2">Purok 1 & 2 (Sitio Balite)</option>
                <option value="purok3">Purok 3 (Centro / East)</option>
                <option value="purok4_5">Purok 4 & 5 (North)</option>
              </select>
            </div>
          </div>

          {/* Smart Calendar Section View */}
          {viewMode === 'calendar' && (
            <div className="mb-8 rounded-2xl border border-[#DDE3DA] p-1 bg-white shadow-2xs">
              <SmartCalendar />
            </div>
          )}

          {/* Machinery Rotation Schedule Table (Visible in table mode or print) */}
          <div className={`overflow-x-auto mb-6 rounded-2xl border border-[#DDE3DA] ${viewMode !== 'table' ? 'print:block hidden' : ''}`}>
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 font-mono uppercase text-gray-600 text-[11px]">
                <tr>
                  <th className="p-3.5 border-r border-gray-200">Inclusive Dates</th>
                  <th className="p-3.5 border-r border-gray-200">Purok / Sector</th>
                  <th className="p-3.5 border-r border-gray-200">Assigned Machinery & Operator</th>
                  <th className="p-3.5">NIA Water Canal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 border-r border-gray-200 font-mono font-bold whitespace-nowrap text-gray-900">
                      <div>{row.dates}</div>
                      <span className="text-[10px] text-gray-500 font-normal">{row.turnaround}</span>
                    </td>
                    <td className="p-3.5 border-r border-gray-200">
                      <strong className="text-gray-900 block font-bold">{row.sector}</strong>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#005426]" />
                        <span>{row.area}</span>
                      </span>
                    </td>
                    <td className="p-3.5 border-r border-gray-200">
                      <strong className="text-[#005426] block font-bold">{row.machinery}</strong>
                      <span className="text-[11px] text-gray-600 mt-0.5 block">{row.operator}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${row.waterBadge}`}>
                        <Droplets className="w-3 h-3" />
                        <span>{row.waterStatus}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Diesel Fuel Subsidy & Financial Guideline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-xs">
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-1.5 print:bg-white print:border-black">
              <h4 className="font-bold text-gray-950 flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-700" />
                <span>DA Fuel Subsidy Card Distribution</span>
              </h4>
              <p className="text-gray-600 leading-relaxed print:text-black">
                Maaari nang kubrahin ang Fuel Discount Cards (₱3,000 halaga ng krudo) sa Barangay Hall tuwing Lunes hanggang Biyernes. Dalhin ang inyong RSBSA Stub at isang Valid ID.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5 print:bg-white print:border-black">
              <h4 className="font-bold text-gray-950 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#005426]" />
                <span>Cash-on-Dike & Passbook Guidelines</span>
              </h4>
              <p className="text-gray-600 leading-relaxed print:text-black">
                Ang bayad sa combine harvester ay <strong>₱2,800 bawat ektarya</strong> (o 8% palay split) at ibibigay nang direkta sa operator pagkatapos ng pag-gapas o ibabawas sa SACCO Passbook.
              </p>
            </div>
          </div>

          {/* Official Signatories & Validation Seals */}
          <div className="pt-6 border-t-2 border-gray-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs print:border-black">
            <div>
              <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-sm pb-1 print:border-black print:text-black">
                Hon. Council Chair
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1 block font-bold print:text-black">
                Punong Barangay / Council Chair
              </span>
            </div>

            <div>
              <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-sm pb-1 print:border-black print:text-black">
                Engr. Coordinator
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1 block font-bold print:text-black">
                Cooperative Machinery Coordinator
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-sm pb-1 print:border-black print:text-black">
                Atty. District Rep
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1 block font-bold print:text-black">
                NIA Watermaster District 1
              </span>
            </div>
          </div>

          {/* Digital Verification Footnote */}
          <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-400 print:hidden">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certified Official Public Document</span>
            </span>
            <span>UmaKonekta Smart Bulletin Sync</span>
          </div>

        </div>

      </div>
    </div>
  );
}
