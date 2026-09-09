'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SaccoReceiptPage() {
  const [isEcoMonochrome, setIsEcoMonochrome] = useState(false);
  const [grossWeight, setGrossWeight] = useState(5420);
  const [tareWeight, setTareWeight] = useState(120);
  const [moistureContent, setMoistureContent] = useState(14.2);
  const [basePrice, setBasePrice] = useState(23.50);
  const [payoutOption, setPayoutOption] = useState('passbook');

  // Mathematical computations
  const netWeight = Math.max(0, grossWeight - tareWeight);
  // Standard MC penalty: 0.5% per point above 14.0%
  const mcExcess = Math.max(0, moistureContent - 14.0);
  const mcDeductionKg = netWeight * (mcExcess * 0.005);
  const adjustedNetKg = Math.max(0, netWeight - mcDeductionKg);

  const grossVal = adjustedNetKg * basePrice;
  const harvesterSplit = grossVal * 0.08; // 8% Harvester Share
  const coopDryingFee = grossVal * 0.02; // 2% Cooperative Drying & Handling
  const netPayable = grossVal - harvesterSplit - coopDryingFee;

  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none ${isEcoMonochrome ? 'bg-white text-black font-mono' : ''}`}>
      {/* Action Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/farmer-dashboard" className="hover:text-primary">Farmer Ledger</Link>
          <span>/</span>
          <span className="text-primary font-bold">Scale Ticket #ST-7712</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-soil-slate hidden sm:inline-block">
            📄 Standard A4 Printable
          </span>
          <button
            type="button"
            onClick={() => setIsEcoMonochrome(!isEcoMonochrome)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${isEcoMonochrome
              ? 'bg-black text-white border-black'
              : 'bg-white text-soil-slate border-border-soft hover:border-primary'
              }`}
          >
            {isEcoMonochrome ? '✓ Eco Monochrome Active' : 'Switch to Eco Thermal B&W'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print A4 Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Thermal / Scale Ticket Card */}
      <div
        className={`print-page-a4 rounded-2xl p-6 sm:p-8 transition-colors print:rounded-none print:p-6 print:border-2 print:border-black print:shadow-none ${isEcoMonochrome
          ? 'bg-white border-2 border-black font-mono text-black shadow-none'
          : 'bg-white border border-border-soft shadow-md'
          }`}
      >
        {/* Ticket Header */}
        <div className="border-b-2 border-dashed border-soil-slate/40 pb-5 mb-5 text-center print:border-black print:pb-3 print:mb-3">
          <div className="text-xs uppercase font-bold tracking-widest text-soil-slate print:text-black">
            Cooperative Development Authority (CDA) Reg. #9520-00124
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1 text-on-surface tracking-tight print:text-black print:text-xl">
            SAN MANUEL AGRARIAN COOPERATIVE (SMABC)
          </h1>
          <p className="text-xs text-soil-slate mt-0.5 print:text-black">
            Central Palay Weighing Station • Municipal Silo Bodega
          </p>
          <div className="mt-2.5 inline-block px-3 py-1 rounded bg-surface-container font-mono text-xs font-bold print:border print:border-black print:bg-gray-100 print:text-black">
            PALAY HARVEST SACCO SCALE TICKET # ST-2026-7712
          </div>
        </div>

        {/* Member Details */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-5 font-mono border-b border-dashed border-soil-slate/30 pb-3.5 print:border-black print:mb-3 print:pb-2.5">
          <div>
            <span className="text-soil-slate block text-[10px] uppercase print:text-gray-700">Farmer Member</span>
            <span className="font-extrabold text-sm text-on-surface print:text-black">J. Madronero</span>
            <span className="text-soil-slate block text-[10px] print:text-gray-700">RSBSA-03-49-12-00481</span>
          </div>
          <div className="text-right">
            <span className="text-soil-slate block text-[10px] uppercase print:text-gray-700">Date & Weigh Time</span>
            <span className="font-bold text-on-surface print:text-black">Oct 11, 2026 • 14:45</span>
            <span className="text-soil-slate block text-[10px] print:text-gray-700">Scale Master: K. Wangdali</span>
          </div>
          <div>
            <span className="text-soil-slate block text-[10px] uppercase print:text-gray-700">Grain Variety</span>
            <span className="font-bold text-on-surface print:text-black">NSIC Rc 222 (Tubigan 21)</span>
          </div>
          <div className="text-right">
            <span className="text-soil-slate block text-[10px] uppercase print:text-gray-700">Passbook Account</span>
            <span className="font-bold text-primary font-mono print:text-black">PB-2026-08841</span>
          </div>
        </div>

        {/* Interactive Scale Weights */}
        <div className="mb-5 space-y-2.5 print:mb-3">
          <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-soil-slate border-b border-border-soft pb-1 print:border-black print:text-black">
            ⚖️ Weighbridge Gross, Tare & Moisture
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft print:bg-white print:border-black">
              <label className="block text-[10px] font-mono text-soil-slate uppercase print:text-black">Gross Weight</label>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-on-surface focus:outline-none print:text-black"
                />
                <span className="text-[10px] text-soil-slate print:text-black">kg</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft print:bg-white print:border-black">
              <label className="block text-[10px] font-mono text-soil-slate uppercase print:text-black">Tare (Bags/Pallet)</label>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  type="number"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-on-surface focus:outline-none print:text-black"
                />
                <span className="text-[10px] text-soil-slate print:text-black">kg</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft print:bg-white print:border-black">
              <label className="block text-[10px] font-mono text-soil-slate uppercase print:text-black">Moisture Content</label>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  type="number"
                  step="0.1"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-field-ochre focus:outline-none print:text-black"
                />
                <span className="text-[10px] text-soil-slate print:text-black">%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-soft print:bg-white print:border-black">
              <label className="block text-[10px] font-mono text-soil-slate uppercase print:text-black">NFA Base Price</label>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-soil-slate print:text-black">₱</span>
                <input
                  type="number"
                  step="0.25"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-primary focus:outline-none print:text-black"
                />
                <span className="text-[10px] text-soil-slate print:text-black">/kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-soft text-xs font-mono space-y-1.5 mb-5 print:bg-white print:border-black print:p-3 print:mb-3">
          <div className="flex justify-between">
            <span className="text-soil-slate print:text-black">Net Weighed Grain:</span>
            <span className="font-bold print:text-black">{netWeight.toLocaleString()} kg ({Math.round(netWeight / 50)} sacks @ 50kg)</span>
          </div>
          {mcExcess > 0 && (
            <div className="flex justify-between text-status-urgent print:text-black">
              <span>MC Adjustment ({moistureContent}% vs 14.0% base):</span>
              <span>- {mcDeductionKg.toFixed(1)} kg</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border-soft pt-1 font-bold print:border-black print:text-black">
            <span>Clean & Dry Net Basis:</span>
            <span>{adjustedNetKg.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between text-soil-slate print:text-black">
            <span>Gross Value (@ ₱{basePrice.toFixed(2)}/kg):</span>
            <span className="font-bold print:text-black">₱{grossVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-field-ochre print:text-black">
            <span>Combine Harvester Split (8%):</span>
            <span>- ₱{harvesterSplit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-soil-slate print:text-black">
            <span>Co-op Drying & Silo Handling (2%):</span>
            <span>- ₱{coopDryingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="border-t-2 border-soil-slate/40 pt-1.5 flex justify-between items-baseline text-sm font-black text-primary print:border-black print:text-black">
            <span>NET PAYABLE TO FARMER:</span>
            <span className="text-lg sm:text-xl print:text-lg">
              ₱{netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Payout Settlement Radio */}
        <div className="mb-5 p-3 rounded-xl border border-border-soft text-xs no-print">
          <span className="font-bold block text-on-surface mb-2 font-mono uppercase text-[11px]">
            Cooperative Settlement Choice:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border-soft cursor-pointer hover:bg-surface-container-low">
              <input
                type="radio"
                name="payout"
                checked={payoutOption === 'passbook'}
                onChange={() => setPayoutOption('passbook')}
                className="text-primary focus:ring-primary"
              />
              <div>
                <strong className="block text-on-surface font-semibold">Credit to Co-op Passbook</strong>
                <span className="text-[10px] text-soil-slate">Available immediately for machinery rental offset.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border-soft cursor-pointer hover:bg-surface-container-low">
              <input
                type="radio"
                name="payout"
                checked={payoutOption === 'cash'}
                onChange={() => setPayoutOption('cash')}
                className="text-primary focus:ring-primary"
              />
              <div>
                <strong className="block text-on-surface font-semibold">Physical Cash at Silo Bodega</strong>
                <span className="text-[10px] text-soil-slate">Disbursed by Cooperative Cashier counter.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Thermal Receipt Tear-Off Signatures */}
        <div className="pt-3 border-t-2 border-dashed border-soil-slate/40 grid grid-cols-2 gap-6 text-center text-xs font-mono print:border-black print:pt-2">
          <div>
            <div className="h-8 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm print:border-black print:text-black">
              J. Madronero
            </div>
            <span className="text-[9px] text-soil-slate uppercase mt-1 block print:text-black">Farmer / Member Signature</span>
          </div>

          <div>
            <div className="h-8 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm print:border-black print:text-black">
              K. Wangdali
            </div>
            <span className="text-[9px] text-soil-slate uppercase mt-1 block print:text-black">Authorized Weigher / Scale Master</span>
          </div>
        </div>
      </div>
    </div>
  );
}
