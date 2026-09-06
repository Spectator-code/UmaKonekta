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
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isEcoMonochrome ? 'bg-white text-black font-mono' : ''}`}>
      {/* Action Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/farmer-dashboard" className="hover:text-primary">Farmer Ledger</Link>
          <span>/</span>
          <span className="text-primary font-bold">Scale Ticket #ST-7712</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEcoMonochrome(!isEcoMonochrome)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              isEcoMonochrome
                ? 'bg-black text-white border-black'
                : 'bg-white text-soil-slate border-border-soft hover:border-primary'
            }`}
          >
            {isEcoMonochrome ? '✓ Eco Monochrome Active' : 'Switch to Eco Thermal B&W'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Thermal Scale Ticket Card */}
      <div
        className={`rounded-2xl p-6 sm:p-8 transition-colors ${
          isEcoMonochrome
            ? 'bg-white border-2 border-black font-mono text-black shadow-none'
            : 'bg-white border border-border-soft shadow-md'
        }`}
      >
        {/* Ticket Header */}
        <div className="border-b-2 border-dashed border-soil-slate/40 pb-6 mb-6 text-center">
          <div className="text-xs uppercase font-bold tracking-widest text-soil-slate">
            Cooperative Development Authority (CDA) Reg. #9520-00124
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1 text-on-surface tracking-tight">
            SAN MANUEL AGRARIAN COOPERATIVE (SMABC)
          </h1>
          <p className="text-xs text-soil-slate mt-0.5">
            Central Palay Weighing Station • Municipal Silo Bodega
          </p>
          <div className="mt-3 inline-block px-3 py-1 rounded bg-surface-container font-mono text-xs font-bold">
            PALAY HARVEST SACCO SCALE TICKET # ST-2026-7712
          </div>
        </div>

        {/* Member Details */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-6 font-mono border-b border-dashed border-soil-slate/30 pb-4">
          <div>
            <span className="text-soil-slate block text-[10px] uppercase">Farmer Member</span>
            <span className="font-extrabold text-sm text-on-surface">Juan Dela Cruz</span>
            <span className="text-soil-slate block text-[10px]">RSBSA-03-49-12-00481</span>
          </div>
          <div className="text-right">
            <span className="text-soil-slate block text-[10px] uppercase">Date & Weigh Time</span>
            <span className="font-bold text-on-surface">Oct 11, 2026 • 14:45</span>
            <span className="text-soil-slate block text-[10px]">Scale Master: R. Bautista</span>
          </div>
          <div>
            <span className="text-soil-slate block text-[10px] uppercase">Grain Variety</span>
            <span className="font-bold text-on-surface">NSIC Rc 222 (Tubigan 21)</span>
          </div>
          <div className="text-right">
            <span className="text-soil-slate block text-[10px] uppercase">Passbook Account</span>
            <span className="font-bold text-primary font-mono">PB-2026-08841</span>
          </div>
        </div>

        {/* Interactive Scale Weights */}
        <div className="mb-6 space-y-3">
          <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-soil-slate border-b border-border-soft pb-1">
            ⚖️ Weighbridge Gross, Tare & Moisture
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft">
              <label className="block text-[10px] font-mono text-soil-slate uppercase">Gross Weight</label>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-on-surface focus:outline-none"
                />
                <span className="text-[10px] text-soil-slate">kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft">
              <label className="block text-[10px] font-mono text-soil-slate uppercase">Tare (Bags/Pallet)</label>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="number"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-on-surface focus:outline-none"
                />
                <span className="text-[10px] text-soil-slate">kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft">
              <label className="block text-[10px] font-mono text-soil-slate uppercase">Moisture Content</label>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="number"
                  step="0.1"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-field-ochre focus:outline-none"
                />
                <span className="text-[10px] text-soil-slate">%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-border-soft">
              <label className="block text-[10px] font-mono text-soil-slate uppercase">NFA Base Price</label>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-soil-slate">₱</span>
                <input
                  type="number"
                  step="0.25"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-black text-sm text-primary focus:outline-none"
                />
                <span className="text-[10px] text-soil-slate">/kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-soft text-xs font-mono space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-soil-slate">Net Weighed Grain:</span>
            <span className="font-bold">{netWeight.toLocaleString()} kg ({Math.round(netWeight / 50)} sacks @ 50kg)</span>
          </div>
          {mcExcess > 0 && (
            <div className="flex justify-between text-status-urgent">
              <span>MC Adjustment ({moistureContent}% vs 14.0% base):</span>
              <span>- {mcDeductionKg.toFixed(1)} kg</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border-soft pt-1.5 font-bold">
            <span>Clean & Dry Net Basis:</span>
            <span>{adjustedNetKg.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between text-soil-slate">
            <span>Gross Value (@ ₱{basePrice.toFixed(2)}/kg):</span>
            <span className="font-bold">₱{grossVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-field-ochre">
            <span>Combine Harvester Split (8%):</span>
            <span>- ₱{harvesterSplit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-soil-slate">
            <span>Co-op Drying & Silo Handling (2%):</span>
            <span>- ₱{coopDryingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="border-t-2 border-soil-slate/40 pt-2 flex justify-between items-baseline text-sm font-black text-primary">
            <span>NET PAYABLE TO FARMER:</span>
            <span className="text-xl">
              ₱{netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Payout Settlement Radio */}
        <div className="mb-6 p-4 rounded-xl border border-border-soft text-xs no-print">
          <span className="font-bold block text-on-surface mb-2 font-mono uppercase text-[11px]">
            Cooperative Settlement Choice:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="pt-4 border-t-2 border-dashed border-soil-slate/40 grid grid-cols-2 gap-6 text-center text-xs font-mono">
          <div>
            <div className="h-10 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm">
              Juan Dela Cruz
            </div>
            <span className="text-[10px] text-soil-slate uppercase mt-1 block">Farmer / Member Signature</span>
          </div>

          <div>
            <div className="h-10 border-b border-soil-slate/40 flex items-end justify-center font-serif italic text-sm">
              R. Bautista
            </div>
            <span className="text-[10px] text-soil-slate uppercase mt-1 block">Authorized Weigher / Scale Master</span>
          </div>
        </div>
      </div>
    </div>
  );
}
