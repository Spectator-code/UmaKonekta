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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between no-print">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/farmer-dashboard" className="hover:text-primary">Ledger</Link>
          <span>/</span>
          <span className="text-primary font-bold">Dispatch Slip #OP-2026-089</span>
        </nav>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          <span>Print Field Ticket</span>
        </button>
      </div>

      {/* Main Dispatch Slip Sheet */}
      <div className="bg-white rounded-2xl border-2 border-soil-slate/30 p-6 sm:p-8 shadow-md">
        {/* Official Header */}
        <div className="border-b-2 border-soil-slate/20 pb-6 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[28px]">agriculture</span>
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-on-surface">
              Republic of the Philippines • Department of Agriculture
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
            OPERATOR FIELD DISPATCH SLIP & JOB TICKET
          </h1>
          <p className="text-xs font-mono text-soil-slate mt-1">
            DA-PhilMech Custom Machinery Service Ticket • Standard Field Protocol #81-A
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-available-bg text-status-available text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
            JOB COMPLETED • READY FOR SETTLEMENT
          </div>
        </div>

        {/* Ticket Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low border border-border-soft mb-6 text-xs font-mono">
          <div>
            <span className="text-soil-slate uppercase text-[10px] block">Job Ticket No.</span>
            <span className="font-extrabold text-primary text-sm">OP-2026-089</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block">Date of Service</span>
            <span className="font-bold text-on-surface">October 11, 2026</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block">Field Dispatch Code</span>
            <span className="font-bold text-on-surface">TM-TAR-SM-04</span>
          </div>
          <div>
            <span className="text-soil-slate uppercase text-[10px] block">Settlement Mode</span>
            <span className="font-extrabold text-field-ochre uppercase">Cash-on-Dike</span>
          </div>
        </div>

        {/* Client & Machinery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs">
          <div className="p-4 rounded-xl border border-border-soft space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-soil-slate font-mono text-[11px] border-b border-border-soft pb-1">
              🌾 Client & Land Parcel Details
            </h3>
            <p><strong className="text-soil-slate">Farmer:</strong> <span className="font-bold text-on-surface">Danilo Ramos</span></p>
            <p><strong className="text-soil-slate">RSBSA ID:</strong> <span className="font-mono">RSBSA-03-49-12-00481</span></p>
            <p><strong className="text-soil-slate">Parcel Location:</strong> Sitio Balite, Brgy. San Manuel, Tagum City</p>
            <p><strong className="text-soil-slate">Field Irrigation:</strong> Lowland Gravity Lateral Canal 3</p>
          </div>

          <div className="p-4 rounded-xl border border-border-soft space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-soil-slate font-mono text-[11px] border-b border-border-soft pb-1">
              🚜 Machinery & Assigned Driver
            </h3>
            <p><strong className="text-soil-slate">Machinery:</strong> <span className="font-bold text-primary">Yanmar EF494T 4WD (49 HP)</span></p>
            <p><strong className="text-soil-slate">Implement:</strong> 2.2m Rotary Tiller & Harrow</p>
            <p><strong className="text-soil-slate">Operator:</strong> Ka Nestor Panganiban (Cert #819)</p>
            <p><strong className="text-soil-slate">Provider Sacco:</strong> San Manuel Agrarian Co-op</p>
          </div>
        </div>

        {/* Operational Measurements */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-border-soft mb-6">
          <h3 className="font-bold text-sm text-on-surface mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <span>Field Performance & Meter Readings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-soil-slate mb-1">Area Worked (Hectares)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={hectaresWorked}
                onChange={(e) => setHectaresWorked(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-border-soft font-mono font-bold text-sm text-on-surface"
              />
            </div>

            <div>
              <label className="block font-bold text-soil-slate mb-1">Diesel Consumed (Liters)</label>
              <input
                type="number"
                value={dieselConsumed}
                onChange={(e) => setDieselConsumed(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-border-soft font-mono font-bold text-sm text-on-surface"
              />
            </div>

            <div>
              <label className="block font-bold text-soil-slate mb-1">Custom Rate per Hectare</label>
              <div className="px-3 py-2 bg-white rounded-xl border border-border-soft font-mono font-bold text-sm text-primary">
                ₱{ratePerHectare.toLocaleString()} / ha
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border-soft flex items-center justify-between">
            <span className="font-mono text-soil-slate text-xs uppercase">Total Cash Due Upon Completion:</span>
            <span className="text-2xl font-black text-primary font-mono">
              ₱{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Cash-on-Dike Verification Section */}
        <div className="p-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 mb-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="cashVerification"
              checked={cashCollected}
              onChange={(e) => setCashCollected(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="cashVerification" className="text-xs cursor-pointer">
              <strong className="text-primary text-sm block">
                Cash-on-Dike Physical Settlement Received
              </strong>
              <span className="text-soil-slate">
                I hereby certify that the exact sum of <strong>₱{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> has been physically paid in Philippine Pesos (cash) on the field dike upon complete inspection of tilled hectares.
              </span>
            </label>
          </div>
        </div>

        {/* Signatures Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-soil-slate/20 text-xs">
          <div className="p-4 rounded-xl bg-surface-container-low border border-border-soft flex flex-col justify-between h-32">
            <div>
              <span className="font-mono uppercase text-[10px] text-soil-slate">Operator Field Signature</span>
              <div className="font-serif italic text-lg text-primary font-bold mt-2">
                {operatorSigned ? 'Ka Nestor Panganiban' : 'Pending Signature'}
              </div>
            </div>
            <div className="border-t border-soil-slate/40 pt-1 text-[10px] font-mono text-soil-slate">
              Machinery Operator (Cert #819) • Oct 11, 2026
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-border-soft flex flex-col justify-between h-32">
            <div>
              <span className="font-mono uppercase text-[10px] text-soil-slate">Farmer Sign-Off & Inspection</span>
              <div className="font-serif italic text-lg text-on-surface font-bold mt-2">
                {farmerSigned ? 'Danilo Ramos' : 'Pending Sign-Off'}
              </div>
            </div>
            <div className="border-t border-soil-slate/40 pt-1 text-[10px] font-mono text-soil-slate">
              Client Farmer (RSBSA Verified) • Oct 11, 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
