'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function FarmerIDCard({ farmer, customData = {} }) {
  const [activeSide, setActiveSide] = useState('front'); // 'front' or 'back'
  const [printMode, setPrintMode] = useState('both'); // 'both', 'front', 'back'

  const data = {
    name: farmer?.name || 'Juan Dela Cruz',
    registryId: farmer?.registryId || '03-49-12-00841',
    coopName: customData.coopName || 'San Manuel Agrarian Beneficiaries Co-op (SMABC)',
    barangay: customData.barangay || 'Brgy. San Manuel, Tagum City',
    farmType: customData.farmType || 'Lowland Irrigated Palay (Rice)',
    hectares: customData.hectares || '2.5 Ha',
    validUntil: customData.validUntil || 'DEC 2028',
    emergencyContactName: customData.emergencyContactName || 'Elena Dela Cruz (Spouse)',
    emergencyContactPhone: customData.emergencyContactPhone || '0917-889-4091',
    barangayCaptain: customData.barangayCaptain || 'Hon. Artemio Santos',
    barangayHotline: customData.barangayHotline || '(084) 216-4401 / 0920-111-9988',
    depotProviderName: customData.depotProviderName || 'Tagum FCA Machinery Depot (Engr. R. Dizon)',
    depotProviderPhone: customData.depotProviderPhone || '0919-445-1234 / 0928-882-9901',
  };

  // SVG Barcode representation of RSBSA ID
  const generateBarcodeLines = (text) => {
    const chars = text.split('');
    return chars.map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const width = (code % 3) + 1.5;
      const isSpace = idx % 5 === 0;
      return { width, isSpace };
    });
  };

  const barcodeBars = generateBarcodeLines(data.registryId);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Controls (No Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-xl no-print bg-white p-3 rounded-2xl border border-border-soft shadow-xs">
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-border-soft">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSide === 'front'
                ? 'bg-primary text-white shadow-xs'
                : 'text-soil-slate hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Front ID</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('back')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSide === 'back'
                ? 'bg-primary text-white shadow-xs'
                : 'text-soil-slate hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">contact_phone</span>
            <span>Back Emergency & Contacts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSide === 'both'
                ? 'bg-primary text-white shadow-xs'
                : 'text-soil-slate hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            <span>Both Sides</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          <span>Print Verified ID Card</span>
        </button>
      </div>

      {/* Printable ID Container (Standard CR80 Credit Card Ratio ~ 85.6mm x 53.98mm) */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full print:flex-col print:gap-6 print:items-center">
        
        {/* ================= FRONT SIDE OF ID ================= */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div className="w-[360px] sm:w-[390px] h-[240px] sm:h-[250px] rounded-2xl bg-white border-2 border-primary/40 shadow-xl overflow-hidden relative flex flex-col justify-between p-4 print:shadow-none print:border-2 print:border-black text-on-surface">
            {/* Illustrated Agrarian Background Backdrop */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none" 
              style={{ backgroundImage: "url('/umakonekta-id-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/90 pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            {/* Front Header Strip */}
            <div className="relative z-10 flex items-center justify-between border-b border-primary/20 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white p-0.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  <img src="/umakonekta-logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs tracking-tight text-primary leading-none">UMAKONEKTA</span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-soil-slate mt-0.5">Republic of the Philippines • DA-LGU</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-primary text-white uppercase tracking-wider">
                RSBSA FARMER ID
              </span>
            </div>

            {/* Front Middle Body */}
            <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto">
              {/* Photo & Hologram */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="w-20 h-24 rounded-xl bg-surface-container-high border-2 border-primary/30 overflow-hidden flex flex-col items-center justify-center relative shadow-xs">
                  <span className="material-symbols-outlined text-4xl text-primary/70">person</span>
                  <span className="text-[7px] font-bold text-soil-slate uppercase tracking-wider mt-1">VERIFIED</span>
                  {/* Hologram Badge */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-harvest-amber/80 flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[10px] text-white">verified</span>
                  </div>
                </div>
              </div>

              {/* Farmer Profile Info */}
              <div className="col-span-8 space-y-1">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-soil-slate font-bold block">Farmer Name</span>
                  <p className="text-sm sm:text-base font-black text-on-surface leading-tight uppercase truncate">{data.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-soil-slate font-bold block">RSBSA ID NO.</span>
                    <span className="font-mono font-extrabold text-primary block">{data.registryId}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-soil-slate font-bold block">Valid Until</span>
                    <span className="font-mono font-bold text-on-surface block">{data.validUntil}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[8px] uppercase tracking-wider text-soil-slate font-bold block">Cooperative / Association</span>
                  <p className="text-[10px] font-semibold text-soil-slate truncate">{data.coopName}</p>
                </div>
              </div>
            </div>

            {/* Front Footer Barcode Strip */}
            <div className="relative z-10 border-t border-dashed border-border-soft pt-1.5 flex items-center justify-between">
              {/* Simulated High-Res Barcode */}
              <div className="flex flex-col">
                <div className="flex items-center gap-[2px] h-5 px-1 bg-white border border-border-soft rounded">
                  {barcodeBars.map((bar, i) => (
                    <span
                      key={i}
                      style={{ width: `${bar.width}px` }}
                      className={`h-full bg-black ${bar.isSpace ? 'ml-0.5' : ''}`}
                    />
                  ))}
                  {barcodeBars.slice(0, 8).map((bar, i) => (
                    <span
                      key={`extra-${i}`}
                      style={{ width: `${bar.width}px` }}
                      className="h-full bg-black"
                    />
                  ))}
                </div>
                <span className="text-[7px] font-mono text-center tracking-widest text-soil-slate mt-0.5">
                  *{data.registryId}*
                </span>
              </div>

              <div className="text-right">
                <span className="text-[8px] font-mono text-soil-slate block">Secured Agrarian Identity</span>
                <span className="text-[9px] font-bold text-primary font-mono">Zero-Fee Cash-on-Dike Certified</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= BACK SIDE OF ID ================= */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div className="w-[360px] sm:w-[390px] h-[240px] sm:h-[250px] rounded-2xl bg-white border-2 border-[#C26D1A]/40 shadow-xl overflow-hidden relative flex flex-col justify-between p-4 print:shadow-none print:border-2 print:border-black text-on-surface">
            {/* Illustrated Agrarian Background Backdrop */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" 
              style={{ backgroundImage: "url('/umakonekta-id-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9]/95 via-white/85 to-white/90 pointer-events-none" />

            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-field-ochre/20 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-field-ochre text-[18px]">contact_emergency</span>
                <span className="font-extrabold text-xs tracking-tight text-on-surface">EMERGENCY & FIELD CONTACTS</span>
              </div>
              <span className="text-[8px] font-mono text-field-ochre font-bold uppercase">
                DA-PhilMech Protocol
              </span>
            </div>

            {/* Back Content Grid */}
            <div className="relative z-10 space-y-2 text-[10px] my-auto">
              {/* 1. Emergency Kin Contact */}
              <div className="p-1.5 rounded-lg bg-surface-container-low border border-border-soft flex items-center justify-between">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-soil-slate font-bold block">In Case of Emergency (ICE)</span>
                  <p className="font-bold text-on-surface text-xs leading-none">{data.emergencyContactName}</p>
                </div>
                <span className="font-mono font-black text-field-ochre text-xs">{data.emergencyContactPhone}</span>
              </div>

              {/* 2. Barangay Hall & Agrarian Officer Contact */}
              <div className="p-1.5 rounded-lg bg-surface-container-low border border-border-soft flex items-center justify-between">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-soil-slate font-bold block">Barangay Hall / LGU Contact</span>
                  <p className="font-bold text-on-surface text-xs leading-none">{data.barangayCaptain} ({data.barangay.split(',')[0]})</p>
                </div>
                <span className="font-mono font-bold text-soil-slate text-[11px]">{data.barangayHotline}</span>
              </div>

              {/* 3. Assigned Machinery Provider & Operator Depot Cellphone */}
              <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-primary font-bold block">Machinery Provider & Depot Contact</span>
                  <p className="font-bold text-primary text-xs leading-none">{data.depotProviderName}</p>
                </div>
                <span className="font-mono font-black text-primary text-[11px]">{data.depotProviderPhone.split('/')[0]}</span>
              </div>
            </div>

            {/* Back Footer Credential */}
            <div className="relative z-10 border-t border-border-soft pt-1.5 flex items-center justify-between text-[8px] font-mono text-soil-slate">
              <span className="font-semibold text-primary">
                RSBSA Agri-Registry Verified
              </span>
              <span className="text-right font-medium">
                Official DA-LGU Passbook Credential
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
