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
import { useSession } from 'next-auth/react';
import { getRoleTemplate } from '@/lib/formatters';
import {
  Printer,
  Scale,
  Droplets,
  Coins,
  FileText,
  CheckCircle2,
  Building2,
  UserCheck,
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  Wheat,
  CreditCard,
  Banknote
} from 'lucide-react';

export default function SaccoReceiptPage() {
  const { data: session } = useSession();
  const [isEcoMonochrome, setIsEcoMonochrome] = useState(false);

  // SVG Barcode representation
  const generateBarcodeLines = (text = 'ST-2026-7712') => {
    const chars = text.split('');
    return chars.map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const width = (code % 3) + 1.5;
      const isSpace = idx % 5 === 0;
      return { width, isSpace };
    });
  };

  const hubHref = session?.user?.role === 'admin'
    ? '/admin'
    : session?.user?.role === 'provider'
    ? '/provider-dashboard'
    : '/farmer-dashboard';
  const hubLabel = session?.user?.role === 'admin'
    ? 'Admin Center'
    : session?.user?.role === 'provider'
    ? 'Provider Hub'
    : 'Farmer Ledger';

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

  // Quick Preset Helper
  const applyPreset = (gross, tare, mc, price) => {
    setGrossWeight(gross);
    setTareWeight(tare);
    setMoistureContent(mc);
    setBasePrice(price);
  };

  const getMcStatus = (mc) => {
    if (mc <= 14.0) return { label: 'Optimal Dry (Standard 14.0%)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (mc <= 16.0) return { label: `Minor Deduction (+${(mc - 14.0).toFixed(1)}% MC)`, color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: `High Moisture Penalty (+${(mc - 14.0).toFixed(1)}% MC)`, color: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const mcStatus = getMcStatus(moistureContent);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0 print:min-h-0 ${isEcoMonochrome ? 'bg-white text-black font-mono' : ''}`}>
      <div className="max-w-4xl mx-auto print:max-w-none">
        
        {/* Top Action & Breadcrumb Navigation (Hidden in Print) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <nav className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Link href="/" className="hover:text-[#005426] flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link href={hubHref} className="hover:text-[#005426] transition-colors">{hubLabel}</Link>
            <span>/</span>
            <span className="text-[#005426] font-bold">Scale Ticket #ST-2026-7712</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEcoMonochrome(!isEcoMonochrome)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isEcoMonochrome
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-[#DDE3DA] hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEcoMonochrome ? 'Eco Monochrome Active' : 'Eco Thermal B&W'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#005426] hover:bg-[#004720] text-white text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Ticket</span>
            </button>
          </div>
        </div>

        {/* Quick Simulator Presets Pill Bar (No-Print) */}
        <div className="mb-5 p-3 rounded-2xl bg-white border border-[#DDE3DA] flex flex-wrap items-center justify-between gap-2 shadow-2xs no-print">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Weighbridge Test Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset(5420, 120, 14.0, 23.50)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            >
              Standard 5.4T (14% MC)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(6850, 150, 16.5, 23.00)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            >
              Wet Crop 6.8T (16.5% MC)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(4200, 100, 13.8, 24.00)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            >
              Prime Dry 4.2T (Clean)
            </button>
          </div>
        </div>

        {/* Main Thermal / Scale Ticket Card */}
        <div
          className={`print-page-a4 rounded-3xl p-6 sm:p-9 transition-colors print:rounded-none print:p-6 print:border-2 print:border-black print:shadow-none ${
            isEcoMonochrome
              ? 'bg-white border-2 border-black font-mono text-black shadow-none'
              : 'bg-white border border-[#DDE3DA] shadow-xl shadow-gray-200/50'
          }`}
        >
          {/* Minimalist Official Government Seal Header */}
          <div className="border-b-2 border-black/80 pb-4 mb-5 text-center print:border-black print:pb-3 print:mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-gray-500 print:text-black">
                Republic of the Philippines • Department of Agriculture
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-gray-500 print:text-black">
              Cooperative Development Authority (CDA) • DA-PhilMech Post-Harvest Station
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight print:text-black uppercase mt-1">
              San Manuel Agrarian Cooperative (SMABC)
            </h1>
            <p className="text-xs text-gray-600 mt-0.5 font-medium print:text-black">
              Central Palay Weighing Station • Municipal Silo Bodega • Tagum City Corridors
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2.5 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded border border-gray-300 bg-gray-50 font-bold text-gray-700 print:border-black print:bg-white print:text-black">
                CDA Reg. #9520-00124
              </span>
              <span className="text-gray-400 print:hidden">•</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-[#005426] border border-emerald-200 font-bold print:border print:border-black print:bg-white print:text-black">
                PALAY HARVEST SACCO SCALE TICKET # ST-2026-7712
              </span>
            </div>
          </div>

          {/* Barcode & Digital Verification QR Block */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 mb-5 font-mono text-xs print:bg-white print:border-black print:p-2.5 print:mb-3">
            <div className="flex items-center gap-3">
              {/* Minimalist QR Code Simulation */}
              <div className="w-12 h-12 bg-white border border-gray-300 p-1 flex flex-col justify-between rounded shadow-2xs print:border-black">
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
                <span className="text-[9px] uppercase tracking-wider text-gray-500 print:text-black block">Digital Verification QR</span>
                <span className="font-mono text-xs font-black text-gray-900 print:text-black block">ST-2026-7712</span>
                <span className="text-[9px] text-[#005426] font-bold block print:text-black">CDA-SACCO Certified Scale Slip</span>
              </div>
            </div>

            {/* Barcode Simulation */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-[1.5px] h-7 px-2 bg-white border border-gray-300 print:border-black rounded">
                {generateBarcodeLines('ST-2026-7712').map((b, i) => (
                  <span key={i} style={{ width: `${b.width}px` }} className={`h-full ${b.isSpace ? 'bg-transparent' : 'bg-black'}`} />
                ))}
              </div>
              <span className="text-[8px] font-mono tracking-widest text-gray-500 print:text-black mt-0.5">*ST-2026-7712*</span>
            </div>
          </div>

          {/* Member & Weighmaster Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6 font-mono border-b border-dashed border-gray-300 pb-5 print:border-black print:mb-4 print:pb-3">
            <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-200/60 print:bg-white print:border-none print:p-0">
              <span className="text-gray-500 block text-[10px] uppercase font-semibold print:text-gray-700">Farmer Member</span>
              <span className="font-extrabold text-sm text-gray-900 block mt-0.5 print:text-black">{session?.user?.name || 'Farmer Member'}</span>
              <span className="text-gray-500 text-[10px] block font-mono print:text-gray-700">ID: {session?.user?.registryId || getRoleTemplate('farmer')}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-200/60 print:bg-white print:border-none print:p-0">
              <span className="text-gray-500 block text-[10px] uppercase font-semibold print:text-gray-700">Date & Scale Time</span>
              <span className="font-bold text-gray-900 block mt-0.5 print:text-black">Oct 11, 2026</span>
              <span className="text-gray-500 text-[10px] block print:text-gray-700">14:45 PST (Batch #04)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-200/60 print:bg-white print:border-none print:p-0">
              <span className="text-gray-500 block text-[10px] uppercase font-semibold print:text-gray-700">Grain Variety</span>
              <span className="font-bold text-gray-900 block mt-0.5 print:text-black">NSIC Rc 222</span>
              <span className="text-gray-500 text-[10px] block print:text-gray-700">Tubigan 21 (Wet Paddy)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-200/60 print:bg-white print:border-none print:p-0">
              <span className="text-gray-500 block text-[10px] uppercase font-semibold print:text-gray-700">Passbook Account</span>
              <span className="font-extrabold text-[#005426] block mt-0.5 font-mono print:text-black">PB-2026-08841</span>
              <span className="text-gray-500 text-[10px] block print:text-gray-700">Verified Co-op Active</span>
            </div>
          </div>

          {/* Interactive Scale Inputs (Form Controls with Print View) */}
          <div className="mb-6 space-y-3 print:mb-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 print:border-black">
              <h3 className="font-black text-xs uppercase font-mono tracking-wider text-gray-800 flex items-center gap-1.5 print:text-black">
                <Scale className="w-4 h-4 text-[#005426] print:hidden" />
                <span>Weighbridge Gross, Tare & Moisture Calibration</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${mcStatus.color} print:border-black print:bg-white print:text-black`}>
                {mcStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Gross Weight */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-[#DDE3DA] focus-within:border-[#005426] focus-within:bg-white transition-all print:bg-white print:border-black">
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider print:text-black">
                  Gross Scale
                </label>
                <div className="flex items-baseline gap-1 mt-1">
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-black text-base text-gray-900 focus:outline-none print:text-black"
                  />
                  <span className="text-[11px] font-bold text-gray-500 font-mono print:text-black">kg</span>
                </div>
              </div>

              {/* Tare Weight */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-[#DDE3DA] focus-within:border-[#005426] focus-within:bg-white transition-all print:bg-white print:border-black">
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider print:text-black">
                  Tare (Bags/Pallet)
                </label>
                <div className="flex items-baseline gap-1 mt-1">
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-black text-base text-gray-900 focus:outline-none print:text-black"
                  />
                  <span className="text-[11px] font-bold text-gray-500 font-mono print:text-black">kg</span>
                </div>
              </div>

              {/* Moisture Content */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-[#DDE3DA] focus-within:border-amber-600 focus-within:bg-white transition-all print:bg-white print:border-black">
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider print:text-black">
                  Moisture Content
                </label>
                <div className="flex items-baseline gap-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-black text-base text-amber-700 focus:outline-none print:text-black"
                  />
                  <span className="text-[11px] font-bold text-gray-500 font-mono print:text-black">%</span>
                </div>
              </div>

              {/* Base Price */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-[#DDE3DA] focus-within:border-[#005426] focus-within:bg-white transition-all print:bg-white print:border-black">
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider print:text-black">
                  NFA / Co-op Rate
                </label>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-mono font-bold text-gray-600 print:text-black">₱</span>
                  <input
                    type="number"
                    step="0.25"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-black text-base text-[#005426] focus:outline-none print:text-black"
                  />
                  <span className="text-[11px] font-bold text-gray-500 font-mono print:text-black">/kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Ledger Calculation Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#DDE3DA] text-xs font-mono space-y-2 mb-6 print:bg-white print:border-black print:p-3 print:mb-4">
            
            <div className="flex justify-between items-center text-gray-700 print:text-black">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                <span>Gross Scale Minus Tare Weight:</span>
              </span>
              <span className="font-bold text-gray-900 print:text-black">
                {netWeight.toLocaleString()} kg &nbsp;
                <span className="text-gray-500 font-normal">({Math.round(netWeight / 50)} sacks @ 50kg)</span>
              </span>
            </div>

            {mcExcess > 0 ? (
              <div className="flex justify-between items-center text-rose-700 print:text-black">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 print:hidden" />
                  <span>MC Excess Deduction ({moistureContent}% vs 14.0% base standard):</span>
                </span>
                <span className="font-bold">- {mcDeductionKg.toFixed(1)} kg</span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-emerald-700 print:text-black">
                <span>Moisture Standard (Clean & Dry 14.0%):</span>
                <span className="font-bold">Zero MC Deduction (Grade A)</span>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-bold text-gray-900 print:border-black print:text-black">
              <span>Clean & Dry Net Basis Weight:</span>
              <span className="text-sm font-black">{adjustedNetKg.toFixed(1)} kg</span>
            </div>

            <div className="flex justify-between items-center text-gray-600 print:text-black pt-1">
              <span>Gross Harvest Value (@ ₱{basePrice.toFixed(2)}/kg):</span>
              <span className="font-bold text-gray-900 print:text-black">
                ₱{grossVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-amber-800 print:text-black">
              <span>Combine Harvester Share (8% Operator Split):</span>
              <span className="font-bold">
                - ₱{harvesterSplit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-600 print:text-black">
              <span>Cooperative Drying & Silo Handling Fee (2%):</span>
              <span className="font-bold">
                - ₱{coopDryingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Net Payable Highlight */}
            <div className="border-t-2 border-gray-400 pt-3 mt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm font-black text-[#005426] print:border-black print:text-black">
              <div className="flex items-center gap-1.5 uppercase tracking-wide">
                <Coins className="w-4 h-4 print:hidden" />
                <span>NET PAYABLE TO FARMER:</span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight print:text-xl">
                ₱{netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payout Settlement Choice Cards (No-print) */}
          <div className="mb-6 p-4 rounded-2xl border border-[#DDE3DA] bg-white no-print">
            <span className="font-bold block text-gray-900 mb-2.5 font-mono uppercase text-xs">
              Cooperative Settlement Channel:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  payoutOption === 'passbook'
                    ? 'border-[#005426] bg-emerald-50/50 ring-1 ring-[#005426]/30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payout"
                  checked={payoutOption === 'passbook'}
                  onChange={() => setPayoutOption('passbook')}
                  className="mt-0.5 text-[#005426] focus:ring-[#005426]"
                />
                <div className="space-y-0.5">
                  <strong className="block text-gray-900 font-bold text-xs flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#005426]" />
                    <span>Credit to Co-op Passbook</span>
                  </strong>
                  <span className="text-[11px] text-gray-500 block leading-tight">
                    Instant credit for tractor rental offset or fertilizer purchase.
                  </span>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  payoutOption === 'cash'
                    ? 'border-[#005426] bg-emerald-50/50 ring-1 ring-[#005426]/30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payout"
                  checked={payoutOption === 'cash'}
                  onChange={() => setPayoutOption('cash')}
                  className="mt-0.5 text-[#005426] focus:ring-[#005426]"
                />
                <div className="space-y-0.5">
                  <strong className="block text-gray-900 font-bold text-xs flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-amber-700" />
                    <span>Physical Cash at Silo Bodega</span>
                  </strong>
                  <span className="text-[11px] text-gray-500 block leading-tight">
                    Disbursed directly at Cooperative Treasury Counter upon ticket surrender.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="pt-4 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-8 text-center text-xs font-mono print:border-black print:pt-3">
            <div>
              <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-sm pb-1 print:border-black print:text-black">
                Farmer Member Signature
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1 block font-bold print:text-black">
                Farmer / RSBSA Signatory
              </span>
            </div>

            <div>
              <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-sm pb-1 print:border-black print:text-black">
                Authorized Scale Master
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1 block font-bold print:text-black">
                Certified Weigher / CDA Silo Master
              </span>
            </div>
          </div>

          {/* Minimalist Official Security Stamp & Validation Seal */}
          <div className="mt-5 pt-3 border-t-2 border-dashed border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-gray-500 print:border-black print:text-black print:mt-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full border-2 border-[#005426] text-[#005426] flex items-center justify-center font-bold text-[9px] print:border-black print:text-black">
                CDA
              </div>
              <div>
                <span className="font-bold block uppercase text-gray-900 print:text-black">Republic of the Philippines • Official Audit Seal</span>
                <span>Security Hash: SHA256-SMABC-7712-A4</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-bold text-[#005426] print:text-black">Zero-Fee Transparency Protocol</span>
              <span>PhilMech Agrarian Silo Bodega • Tagum Station</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
