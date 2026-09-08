'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DispatchSlipPage() {
  const [hectaresWorked, setHectaresWorked] = useState(2.4);
  const [cashCollected, setCashCollected] = useState(true);
  const [dieselConsumed, setDieselConsumed] = useState(30);
  const [operatorSigned, setOperatorSigned] = useState(true);
  const [farmerSigned, setFarmerSigned] = useState(true);

  const ratePerHectare = 2400;
  const calculatedTotal = hectaresWorked * ratePerHectare;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between no-print">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/farmer-dashboard" className="hover:text-primary">Ledger</Link>
          <span>/</span>
          <span className="text-primary font-bold">Dispatch Slip #OP-2026-089</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-soil-slate hidden sm:inline-block">
            📄 Standard A4 Printable
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
        {/* Official Header */}
        <div className="border-b-2 border-soil-slate/20 pb-5 mb-5 text-center print:border-black print:pb-3 print:mb-3">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-primary text-[28px] print:text-black">agriculture</span>
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-on-surface print:text-black">
              Republic of the Philippines • Department of Agriculture
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight print:text-black print:text-xl">
            OPERATOR FIELD DISPATCH SLIP & JOB TICKET
          </h1>
          <p className="text-xs font-mono text-soil-slate mt-1 print:text-black">
            DA-PhilMech Custom Machinery Service Ticket • Standard Field Protocol #81-A
          </p>
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-available-bg text-status-available text-xs font-mono font-bold print:border print:border-black print:text-black print:bg-gray-100">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse print:hidden" />
            JOB COMPLETED • READY FOR SETTLEMENT
          </div>
        </div>

        {/* Ticket Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-container-low border border-border-soft mb-5 text-xs font-mono print:bg-gray-50 print:border-black print:p-2.5 print:mb-3">
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Job Ticket No.</span>
            <span className="font-extrabold text-primary text-sm print:text-black">OP-2026-089</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Date of Service</span>
            <span className="font-bold text-on-surface print:text-black">October 11, 2026</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Field Dispatch Code</span>
            <span className="font-bold text-on-surface print:text-black">TM-TAR-SM-04</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block print:text-gray-700">Settlement Mode</span>
            <span className="font-extrabold text-field-ochre uppercase print:text-black">Cash-on-Dike</span>
          </div>
        </div>

        {/* Client & Machinery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs print:gap-3 print:mb-3">
          <div className="p-3.5 rounded-xl border border-border-soft space-y-1.5 print:border-black print:p-2.5">
            <h3 className="font-bold uppercase tracking-wider text-soil-slate font-mono text-[11px] border-b border-border-soft pb-1 print:border-black print:text-black">
              🌾 Client & Land Parcel Details
            </h3>
            <p><strong className="text-soil-slate print:text-black">Farmer:</strong> <span className="font-bold text-on-surface print:text-black">Danilo Ramos</span></p>
            <p><strong className="text-soil-slate print:text-black">RSBSA ID:</strong> <span className="font-mono print:text-black">RSBSA-03-49-12-00481</span></p>
            <p><strong className="text-soil-slate print:text-black">Parcel Location:</strong> Sitio Balite, Brgy. San Manuel, Tagum City</p>
            <p><strong className="text-soil-slate print:text-black">Field Irrigation:</strong> Lowland Gravity Lateral Canal 3</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border-soft space-y-1.5 print:border-black print:p-2.5">
            <h3 className="font-bold uppercase tracking-wider text-soil-slate font-mono text-[11px] border-b border-border-soft pb-1 print:border-black print:text-black">
              🚜 Machinery & Assigned Driver
            </h3>
            <p><strong className="text-soil-slate print:text-black">Machinery:</strong> <span className="font-bold text-primary print:text-black">Yanmar EF494T 4WD (49 HP)</span></p>
            <p><strong className="text-soil-slate print:text-black">Implement:</strong> 2.2m Rotary Tiller & Harrow</p>
            <p><strong className="text-soil-slate print:text-black">Operator:</strong> Ka Nestor Panganiban (Cert #819)</p>
            <p><strong className="text-soil-slate print:text-black">Provider Sacco:</strong> San Manuel Agrarian Co-op</p>
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
                Cash-on-Dike Physical Settlement Received
              </strong>
              <span className="text-soil-slate text-[11px] leading-tight block mt-0.5 print:text-black">
                I hereby certify that the exact sum of <strong>₱{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> has been physically paid in Philippine Pesos (cash) on the field dike upon complete inspection of tilled hectares.
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
                {operatorSigned ? 'Ka Nestor Panganiban' : 'Pending Signature'}
              </div>
            </div>
            <div className="border-t border-soil-slate/40 pt-1 text-[9px] font-mono text-soil-slate print:border-black print:text-black">
              Machinery Operator (Cert #819) • Oct 11, 2026
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft flex flex-col justify-between h-24 print:bg-white print:border-black print:rounded-none print:h-20">
            <div>
              <span className="font-mono uppercase text-[9px] text-soil-slate print:text-black">Farmer Sign-Off & Inspection</span>
              <div className="font-serif italic text-base text-on-surface font-bold mt-1 print:text-black">
                {farmerSigned ? 'Danilo Ramos' : 'Pending Sign-Off'}
              </div>
            </div>
            <div className="border-t border-soil-slate/40 pt-1 text-[9px] font-mono text-soil-slate print:border-black print:text-black">
              Client Farmer (RSBSA Verified) • Oct 11, 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
