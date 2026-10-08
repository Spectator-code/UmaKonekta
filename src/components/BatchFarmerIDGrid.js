'use client';

/**
 * @file BatchFarmerIDGrid.js
 * @description React Component / Page for BatchFarmerIDGrid.js. Handles UI rendering and local state.
 * @module BatchFarmerIDGrid
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState } from 'react';

/**
 * BatchFarmerIDGrid - Multi-Card A4 Batch RSBSA Farmer ID Generator
 * Renders print-ready A4 grid layouts (4-up or 8-up per sheet) with trim/crop marks.
 */
export default function BatchFarmerIDGrid({
  farmers = [],
  customData = {},
  initialGridFormat = '4up', // '4up' or '8up'
  initialSideMode = 'side_by_side', // 'side_by_side', 'front_only', 'back_only'
  onClose,
}) {
  const [gridFormat, setGridFormat] = useState(initialGridFormat); // '4up' or '8up'
  const [sideMode, setSideMode] = useState(initialSideMode); // 'side_by_side', 'front_only', 'back_only'
  const [showCropMarks, setShowCropMarks] = useState(true);

  // ============================================================================
  // 1. HELPERS & UTILITIES
  // ============================================================================
  const generateBarcodeLines = (text = 'farmer-1-23-A001') => {
    const chars = text.split('');
    return chars.map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const width = (code % 3) + 1.2;
      const isSpace = idx % 5 === 0;
      return { width, isSpace };
    });
  };

  // ============================================================================
  // 2. PAGINATION & GROUPING
  // ============================================================================
  // Group items into A4 sheets depending on grid format and side mode
  // 4up side_by_side = 2 farmers per sheet (2 front + 2 back = 4 cards per sheet)
  // 4up front_only = 4 farmers front per sheet
  // 4up back_only = 4 farmers back per sheet
  // 8up front_only = 8 farmers front per sheet
  // 8up side_by_side = 4 farmers per sheet (4 front + 4 back = 8 cards per sheet)
  const cardsPerPage = gridFormat === '4up' ? 4 : 8;
  const farmersPerPage = sideMode === 'side_by_side' ? (gridFormat === '4up' ? 2 : 4) : cardsPerPage;

  // Chunk farmers array into pages
  const pages = [];
  for (let i = 0; i < farmers.length; i += farmersPerPage) {
    pages.push(farmers.slice(i, i + farmersPerPage));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      
      {/* ============================================================================
          3. TOP HEADER & CONTROLS (NO-PRINT)
          ============================================================================ */}
      <div className="no-print bg-white border-b border-border-soft px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-on-surface flex items-center gap-2">
              <span>A4 Batch RSBSA Farmer ID Grid</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary text-white">
                {farmers.length} Farmer{farmers.length > 1 ? 's' : ''} Selected
              </span>
            </h2>
            <p className="text-xs text-soil-slate">
              Calibrated A4 print sheets ({pages.length} Sheet{pages.length > 1 ? 's' : ''}) for LGU village distribution.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Grid Format Switcher */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-border-soft">
            <button
              type="button"
              onClick={() => setGridFormat('4up')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                gridFormat === '4up' ? 'bg-primary text-white shadow-xs' : 'text-soil-slate hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_4x4</span>
              <span>4-Up Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setGridFormat('8up')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                gridFormat === '8up' ? 'bg-primary text-white shadow-xs' : 'text-soil-slate hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>8-Up Grid</span>
            </button>
          </div>

          {/* Side Mode Switcher */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-border-soft">
            <button
              type="button"
              onClick={() => setSideMode('side_by_side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                sideMode === 'side_by_side' ? 'bg-primary text-white shadow-xs' : 'text-soil-slate hover:text-on-surface'
              }`}
              title="Pair Front & Back side-by-side per farmer"
            >
              <span className="material-symbols-outlined text-[16px]">view_column</span>
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setSideMode('front_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                sideMode === 'front_only' ? 'bg-primary text-white shadow-xs' : 'text-soil-slate hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Front Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => setSideMode('back_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                sideMode === 'back_only' ? 'bg-primary text-white shadow-xs' : 'text-soil-slate hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">contact_emergency</span>
              <span>Back Sheet</span>
            </button>
          </div>

          {/* Toggle Crop Marks */}
          <button
            type="button"
            onClick={() => setShowCropMarks(!showCropMarks)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showCropMarks
                ? 'bg-field-ochre/15 text-field-ochre border-field-ochre/30'
                : 'bg-white border-border-soft text-soil-slate'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">crop</span>
            <span>{showCropMarks ? 'Crop Marks ON' : 'Crop Marks OFF'}</span>
          </button>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md hover:bg-primary-container flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print A4 Batch Sheets</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-soil-slate hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              title="Close Preview"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================================
          4. MAIN PREVIEW CONTAINER (PRINTABLE AREA)
          ============================================================================ */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-12 print:p-0 print:overflow-visible print:bg-white print:gap-0">
        {pages.map((pageFarmers, pageIdx) => (
          <div
            key={`page-${pageIdx}`}
            className="bg-white rounded-xl shadow-2xl print:shadow-none print:rounded-none w-[210mm] min-h-[297mm] p-[10mm] flex flex-col justify-between relative box-border border border-gray-200 print:border-none print:m-0 print:p-[8mm] print:w-full print:h-auto break-after-page"
            style={{ pageBreakAfter: 'always' }}
          >
            {/* Sheet Header Banner (No-Print) */}
            <div className="no-print flex items-center justify-between border-b border-gray-200 pb-2 mb-4 text-xs font-mono text-soil-slate">
              <span className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">description</span>
                A4 SHEET #{pageIdx + 1} OF {pages.length}
              </span>
              <span>FORMAT: {gridFormat.toUpperCase()} • MODE: {sideMode.replace('_', ' ').toUpperCase()}</span>
            </div>

            {/* Grid Container */}
            <div
              className={`grid gap-4 w-full h-full items-center justify-items-center ${
                gridFormat === '4up' ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2 grid-rows-4 gap-2'
              }`}
            >
              {pageFarmers.map((farmer, fIdx) => {
                const farmerData = {
                  name: farmer.name || 'Farmer Member',
                  registryId: farmer.registryId || 'farmer-1-23-A001',
                  coopName: farmer.coopName || customData.coopName || 'San Manuel Agrarian Beneficiaries Co-op (SMABC)',
                  barangay: farmer.barangay || customData.barangay || 'Brgy. San Manuel, Tagum City',
                  validUntil: customData.validUntil || 'DEC 2028',
                  emergencyContactName: customData.emergencyContactName || `${farmer.name || 'Farmer'} (Kin)`,
                  emergencyContactPhone: customData.emergencyContactPhone || '0917-000-0000',
                  barangayCaptain: customData.barangayCaptain || 'Barangay Captain (Signatory)',
                  barangayHotline: customData.barangayHotline || '(084) 000-0000',
                  depotProviderName: customData.depotProviderName || 'Tagum FCA Machinery Depot',
                  depotProviderPhone: customData.depotProviderPhone || '0919-000-0002',
                };

                const barcodeBars = generateBarcodeLines(farmerData.registryId);

                // Render Front Card
                const renderFrontCard = () => (
                  <div
                    key={`front-${farmer.id || fIdx}`}
                    className={`relative w-[85.6mm] h-[53.98mm] bg-white border-2 border-primary/40 rounded-xl overflow-hidden flex flex-col justify-between p-2.5 shadow-xs print:shadow-none print:border-black text-on-surface ${
                      gridFormat === '8up' ? 'scale-90 origin-center' : ''
                    }`}
                  >
                    {/* Crop Marks */}
                    {showCropMarks && (
                      <>
                        <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none" />
                        <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none" />
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none" />
                      </>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-primary/20 pb-1">
                      <div className="flex items-center gap-1.5">
                        <img src="/umakonekta-logo.jpg" alt="Logo" className="w-5 h-5 object-contain" />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[10px] text-primary leading-none">UMAKONEKTA</span>
                          <span className="text-[6px] font-mono uppercase text-soil-slate">DA-LGU RSBSA</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-[7px] font-mono font-black bg-primary text-white uppercase">
                        FARMER ID
                      </span>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-12 gap-2 items-center my-auto">
                      <div className="col-span-4 flex justify-center">
                        <div className="w-14 h-16 rounded-lg bg-surface-container-high border border-primary/30 overflow-hidden flex flex-col items-center justify-center relative">
                          {farmer.photoUrl || farmer.photo ? (
                            <img src={farmer.photoUrl || farmer.photo} alt={farmerData.name} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-2xl text-primary/70">person</span>
                              <span className="text-[5px] font-bold text-soil-slate uppercase">VERIFIED</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="col-span-8 space-y-0.5">
                        <div>
                          <span className="text-[6px] uppercase tracking-wider text-soil-slate font-bold block">Farmer Name</span>
                          <p className="text-[11px] font-black text-on-surface leading-tight uppercase truncate">{farmerData.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[8px]">
                          <div>
                            <span className="text-[6px] uppercase text-soil-slate font-bold block">RSBSA NO.</span>
                            <span className="font-mono font-extrabold text-primary block truncate">{farmerData.registryId}</span>
                          </div>
                          <div>
                            <span className="text-[6px] uppercase text-soil-slate font-bold block">Valid Until</span>
                            <span className="font-mono font-bold text-on-surface block">{farmerData.validUntil}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[6px] uppercase text-soil-slate font-bold block">Cooperative</span>
                          <p className="text-[8px] font-semibold text-soil-slate truncate">{farmerData.coopName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Barcode Strip */}
                    <div className="border-t border-dashed border-border-soft pt-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-[1px] h-3 px-1 bg-white border border-border-soft rounded">
                          {barcodeBars.slice(0, 10).map((bar, i) => (
                            <span
                              key={i}
                              style={{ width: `${bar.width}px` }}
                              className={`h-full bg-black ${bar.isSpace ? 'ml-0.5' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-[6px] font-mono text-center text-soil-slate mt-0.5">*{farmerData.registryId}*</span>
                      </div>
                      <span className="text-[7px] font-bold text-primary font-mono">Cash-on-Dike Certified</span>
                    </div>
                  </div>
                );

                // Render Back Card
                const renderBackCard = () => (
                  <div
                    key={`back-${farmer.id || fIdx}`}
                    className={`relative w-[85.6mm] h-[53.98mm] bg-white border-2 border-[#C26D1A]/40 rounded-xl overflow-hidden flex flex-col justify-between p-2.5 shadow-xs print:shadow-none print:border-black text-on-surface ${
                      gridFormat === '8up' ? 'scale-90 origin-center' : ''
                    }`}
                  >
                    {/* Crop Marks */}
                    {showCropMarks && (
                      <>
                        <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none" />
                        <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none" />
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none" />
                      </>
                    )}

                    {/* Back Header */}
                    <div className="flex items-center justify-between border-b border-field-ochre/20 pb-1">
                      <span className="font-extrabold text-[10px] text-on-surface">EMERGENCY & FIELD CONTACTS</span>
                      <span className="text-[6px] font-mono text-field-ochre font-bold uppercase">DA-PhilMech Protocol</span>
                    </div>

                    {/* Back Body */}
                    <div className="space-y-1 text-[8px] my-auto">
                      <div className="p-1 rounded bg-surface-container-low border border-border-soft flex items-center justify-between">
                        <div>
                          <span className="text-[6px] uppercase text-soil-slate font-bold block">In Emergency (ICE)</span>
                          <p className="font-bold text-on-surface leading-none truncate">{farmerData.emergencyContactName}</p>
                        </div>
                        <span className="font-mono font-black text-field-ochre">{farmerData.emergencyContactPhone}</span>
                      </div>

                      <div className="p-1 rounded bg-surface-container-low border border-border-soft flex items-center justify-between">
                        <div>
                          <span className="text-[6px] uppercase text-soil-slate font-bold block">Barangay LGU Contact</span>
                          <p className="font-bold text-on-surface leading-none truncate">{farmerData.barangayCaptain}</p>
                        </div>
                        <span className="font-mono font-bold text-soil-slate">{farmerData.barangayHotline}</span>
                      </div>

                      <div className="p-1 rounded bg-primary/5 border border-primary/20 flex items-center justify-between">
                        <div>
                          <span className="text-[6px] uppercase text-primary font-bold block">Depot Contact</span>
                          <p className="font-bold text-primary leading-none truncate">{farmerData.depotProviderName}</p>
                        </div>
                        <span className="font-mono font-black text-primary">{farmerData.depotProviderPhone.split('/')[0]}</span>
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="border-t border-border-soft pt-1 flex items-center justify-between text-[6px] font-mono text-soil-slate">
                      <span className="font-semibold text-primary">RSBSA Verified</span>
                      <span>DA-LGU Passbook Credential</span>
                    </div>
                  </div>
                );

                if (sideMode === 'side_by_side') {
                  return [renderFrontCard(), renderBackCard()];
                } else if (sideMode === 'front_only') {
                  return renderFrontCard();
                } else {
                  return renderBackCard();
                }
              })}
            </div>

            {/* Printable Page Footer */}
            <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-[8px] font-mono text-gray-500">
              <span>UMAKONEKTA • Official DA-LGU RSBSA Agrarian ID Register Sheet</span>
              <span>Printed: {new Date().toLocaleDateString('en-US')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
