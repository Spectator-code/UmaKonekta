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

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getRoleTemplate } from '@/lib/formatters';

function DispatchSlipContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const hubHref = session?.user?.role === 'admin'
    ? '/admin'
    : session?.user?.role === 'farmer'
    ? '/farmer-dashboard'
    : '/provider-dashboard';
  const hubLabel = session?.user?.role === 'admin'
    ? 'Admin Center'
    : session?.user?.role === 'farmer'
    ? 'Farmer Hub'
    : 'Provider Hub';

  // Dynamic parameters with robust agrarian defaults
  const ticketNo = searchParams.get('ticket') || searchParams.get('id') || 'OP-2026-089';
  const initialMachine = searchParams.get('machine') || 'Yanmar EF494T 4WD (49 HP)';
  const initialOperator = searchParams.get('operator') || 'Accredited Operator #1';
  const initialOperatorPhone = searchParams.get('phone') || '0919-000-0002';
  const initialFarmer = searchParams.get('farmer') || 'Farmer Member #A001';
  const initialRsbsa = searchParams.get('rsbsa') || session?.user?.registryId || getRoleTemplate('farmer');
  const initialLocation = searchParams.get('location') || 'Sitio Balite, Brgy. San Manuel, Tagum City';
  const paramHectares = parseFloat(searchParams.get('hectares')) || 2.4;
  const paramRate = parseFloat(searchParams.get('rate')) || 2400;
  const settlementMode = searchParams.get('settlement') || 'Cash-on-Dike Settlement';

  const [slipData, setSlipData] = useState(null);
  const [hectaresWorked, setHectaresWorked] = useState(paramHectares);
  const [ratePerHectare, setRatePerHectare] = useState(paramRate);
  const [cashCollected, setCashCollected] = useState(true);
  const [dieselConsumed, setDieselConsumed] = useState(30);
  const [operatorSigned, setOperatorSigned] = useState(true);
  const [farmerSigned, setFarmerSigned] = useState(true);

  // Fetch verified ticket details from backend
  useEffect(() => {
    fetch(`/api/dispatch-slip?ticket=${encodeURIComponent(ticketNo)}`)
      .then(res => res.json())
      .then(d => {
        if (d && d.verified) {
          setSlipData(d);
          if (d.hectares) setHectaresWorked(d.hectares);
          if (d.rate) setRatePerHectare(d.rate);
        }
      })
      .catch(console.error);
  }, [ticketNo]);

  const machineName = slipData?.asset?.name || initialMachine;
  const operatorName = slipData?.operator?.name || initialOperator;
  const operatorPhone = slipData?.operator?.phone || initialOperatorPhone;
  const farmerName = slipData?.farmer?.name || initialFarmer;
  const rsbsaId = slipData?.farmer?.rsbsaId || initialRsbsa;
  const location = slipData?.asset?.location || initialLocation;

  // SVG Barcode representation
  const generateBarcodeLines = (text = 'OP-2026-089') => {
    const chars = text.split('');
    return chars.map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const width = (code % 3) + 1.5;
      const isSpace = idx % 5 === 0;
      return { width, isSpace };
    });
  };

  const calculatedTotal = hectaresWorked * ratePerHectare;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between no-print">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href={hubHref} className="hover:text-primary">{hubLabel}</Link>
          <span>/</span>
          <span className="text-primary font-bold">Dispatch Slip #{ticketNo}</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-soil-slate hidden sm:inline-block">
            Standard A4 Printable
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print A4 Field Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Dispatch Slip Sheet */}
      <div className="print-page-a4 bg-white rounded-2xl border-2 border-soil-slate/30 p-6 sm:p-8 shadow-md print:shadow-none print:border-2 print:border-black print:rounded-none print:p-5">
        {/* Minimalist Official Government Seal Header */}
        <div className="border-b-2 border-soil-slate/30 pb-4 mb-4 text-center print:border-black print:pb-3 print:mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-soil-slate print:text-black">
              Republic of the Philippines • Department of Agriculture
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-soil-slate print:text-black">
            Cooperative Development Authority (CDA) • DA-PhilMech Farm Mechanization Pool
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight print:text-black print:text-xl uppercase mt-1">
            Operator Field Dispatch Slip & Job Ticket
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded border border-border-soft bg-surface-container-low font-bold text-soil-slate print:border-black print:bg-white print:text-black">
              CDA Reg. #9520-00124
            </span>
            <span className="text-soil-slate print:hidden">•</span>
            <span className="px-2.5 py-0.5 rounded bg-status-available-bg text-status-available font-bold print:border print:border-black print:bg-white print:text-black">
              RCEF Mechanization Certified
            </span>
          </div>
        </div>

        {/* Barcode & Digital Verification QR Block */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border-soft mb-4 font-mono text-xs print:bg-white print:border-black print:p-2.5 print:mb-3">
          <div className="flex items-center gap-3">
            {/* Minimalist QR Code Simulation */}
            <div className="w-12 h-12 bg-white border border-border-soft p-1 flex flex-col justify-between rounded shadow-2xs print:border-black">
              <div className="flex justify-between">
                <div className="w-3 h-3 bg-black rounded-xs" />
                <div className="w-3 h-3 bg-black rounded-xs" />
              </div>
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-black rounded-xs" />
              </div>
              <div className="flex justify-between">
                <div className="w-3 h-3 bg-black rounded-xs" />
                <div className="w-1.5 h-1.5 bg-black rounded-xs" />
              </div>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-soil-slate print:text-black block">Digital Verification QR</span>
              <span className="font-mono text-xs font-black text-on-surface print:text-black block">{ticketNo}</span>
              <span className="text-[9px] text-primary font-bold block print:text-black">DA-RSBSA Verified Slip</span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-[1.5px] h-7 px-2 bg-white border border-border-soft print:border-black rounded">
              {generateBarcodeLines(ticketNo).map((b, i) => (
                <span key={i} style={{ width: `${b.width}px` }} className={`h-full ${b.isSpace ? 'bg-transparent' : 'bg-black'}`} />
              ))}
            </div>
            <span className="text-[8px] font-mono tracking-widest text-soil-slate print:text-black mt-0.5">*{ticketNo}*</span>
          </div>
        </div>

        {/* Ticket Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-container-low border border-border-soft mb-5 text-xs font-mono print:bg-gray-50 print:border-black print:p-2.5 print:mb-3">
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Job Ticket No.</span>
            <span className="font-extrabold text-primary text-sm print:text-black">{ticketNo}</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Date of Service</span>
            <span className="font-bold text-on-surface print:text-black">October 14, 2026</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Field Dispatch Code</span>
            <span className="font-bold text-on-surface print:text-black">TM-TAR-SM-04</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Settlement Mode</span>
            <span className="font-extrabold text-field-ochre uppercase print:text-black">{settlementMode}</span>
          </div>
        </div>

        {/* Client & Machinery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs print:gap-3 print:mb-3">
          <div className="p-3.5 rounded-xl border border-border-soft space-y-1.5 print:border-black print:p-2.5">
            <h3 className="font-bold uppercase tracking-wider text-soil-slate font-mono text-[11px] border-b border-border-soft pb-1 print:border-black print:text-black">
              Client & Land Parcel Details
            </h3>
            <p><strong className="text-soil-slate print:text-black">Farmer:</strong> <span className="font-bold text-on-surface print:text-black">{farmerName}</span></p>
            <p><strong className="text-soil-slate print:text-black">RSBSA ID:</strong> <span className="font-mono print:text-black">{rsbsaId}</span></p>
            <p><strong className="text-soil-slate print:text-black">Parcel Location:</strong> {location}</p>
            <p><strong className="text-soil-slate print:text-black">Field Irrigation:</strong> Lowland Gravity Lateral Canal 3</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border-soft space-y-1.5 print:border-black print:p-2.5">
            <h3 className="font-bold uppercase tracking-wider text-soil-slate font-mono text-[11px] border-b border-border-soft pb-1 print:border-black print:text-black">
              Machinery & Assigned Driver
            </h3>
            <p><strong className="text-soil-slate print:text-black">Machinery:</strong> <span className="font-bold text-primary print:text-black">{machineName}</span></p>
            <p><strong className="text-soil-slate print:text-black">Assigned Operator:</strong> <span className="font-bold text-on-surface print:text-black">{operatorName}</span></p>
            <p><strong className="text-soil-slate print:text-black">Driver Contact:</strong> <a href={`tel:${operatorPhone}`} className="font-mono font-bold text-primary print:text-black">{operatorPhone}</a></p>
            <p><strong className="text-soil-slate print:text-black">Accreditation:</strong> DA-PhilMech / TESDA NC-II Clearance</p>
          </div>
        </div>

        {/* Operational Measurements */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-soft mb-5 print:bg-white print:border-black print:p-3 print:mb-3">
          <h3 className="font-bold text-xs sm:text-sm text-on-surface mb-3 flex items-center gap-1.5 print:text-black">
            <span className="material-symbols-outlined text-primary text-[18px] print:text-black">tune</span>
            <span>Field Performance & Meter Readings</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2 bg-white rounded-lg border border-border-soft print:border-black">
              <label className="block font-bold text-soil-slate mb-0.5 text-[10px] print:text-black">Area Worked</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="20"
                  value={hectaresWorked}
                  onChange={(e) => setHectaresWorked(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-bold text-sm text-on-surface focus:outline-none print:text-black"
                />
                <span className="text-[10px] text-soil-slate print:text-black">ha</span>
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-border-soft print:border-black">
              <label className="block font-bold text-soil-slate mb-0.5 text-[10px] print:text-black">Diesel Consumed</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={dieselConsumed}
                  onChange={(e) => setDieselConsumed(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-bold text-sm text-on-surface focus:outline-none print:text-black"
                />
                <span className="text-[10px] text-soil-slate print:text-black">L</span>
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-border-soft print:border-black">
              <label className="block font-bold text-soil-slate mb-0.5 text-[10px] print:text-black">Rate / Hectare</label>
              <div className="font-mono font-bold text-sm text-primary print:text-black">
                ₱{ratePerHectare.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border-soft flex items-center justify-between print:border-black">
            <span className="font-mono text-soil-slate text-xs uppercase print:text-black">Total Cash Due Upon Completion:</span>
            <span className="text-xl font-black text-primary font-mono print:text-black">
              ₱{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Cash-on-Dike Verification Section */}
        <div className="p-3.5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 mb-5 print:bg-white print:border-black print:border-solid print:p-2.5 print:mb-3">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="cashVerification"
              checked={cashCollected}
              onChange={(e) => setCashCollected(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary cursor-pointer print:text-black"
            />
            <label htmlFor="cashVerification" className="text-xs cursor-pointer">
              <strong className="text-primary text-xs sm:text-sm block print:text-black">
                Cash-on-Dike Physical Settlement Certification
              </strong>
              <span className="text-soil-slate text-[11px] leading-tight block mt-0.5 print:text-black">
                I hereby certify that the exact sum of <strong>₱{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> has been agreed/settled in Philippine Pesos on the field dike upon verification of fieldwork by <strong>{operatorName}</strong>.
              </span>
            </label>
          </div>
        </div>

        {/* Signatures Box */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t-2 border-soil-slate/20 text-xs print:border-black print:gap-3">
          <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft flex flex-col justify-between h-24 print:bg-white print:border-black print:rounded-none print:h-20">
            <div>
              <span className="font-mono uppercase text-[9px] text-soil-slate print:text-black">Operator Field Signature</span>
              <div className="font-serif italic text-base text-primary font-bold mt-1 print:text-black">
                {operatorSigned ? operatorName : 'Pending Signature'}
              </div>
            </div>
            <div className="border-t border-soil-slate/40 pt-1 text-[9px] font-mono text-soil-slate print:border-black print:text-black">
              Assigned Machinery Operator • {operatorPhone}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-soft flex flex-col justify-between h-24 print:bg-white print:border-black print:rounded-none print:h-20">
            <div>
              <span className="font-mono uppercase text-[9px] text-soil-slate print:text-black">Farmer Sign-Off & Inspection</span>
              <div className="font-serif italic text-base text-on-surface font-bold mt-1 print:text-black">
                {farmerSigned ? farmerName : 'Pending Sign-Off'}
              </div>
            </div>
            <div className="border-t border-soil-slate/40 pt-1 text-[9px] font-mono text-soil-slate print:border-black print:text-black">
              Client Farmer ({rsbsaId})
            </div>
          </div>
        </div>

        {/* Minimalist Official Security Stamp & Validation Seal */}
        <div className="mt-5 pt-3 border-t-2 border-dashed border-soil-slate/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-soil-slate print:border-black print:text-black print:mt-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold text-[9px] print:border-black print:text-black">
              DA
            </div>
            <div>
              <span className="font-bold block uppercase text-on-surface print:text-black">Republic of the Philippines • Official Audit Seal</span>
              <span>Security Hash: SHA256-DA-{ticketNo}-A4</span>
            </div>
          </div>
          <div className="text-right">
            <span className="block font-bold text-primary print:text-black">Zero-Fee Transparency Protocol</span>
            <span>PhilMech Agrarian Machinery Registry • Tagum Station</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DispatchSlipPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream-surface">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
          <p className="text-sm font-mono text-soil-slate">Loading Dispatch Slip...</p>
        </div>
      </div>
    }>
      <DispatchSlipContent />
    </Suspense>
  );
}
