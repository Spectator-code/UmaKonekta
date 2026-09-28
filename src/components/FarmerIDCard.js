'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useUserProfilePhoto } from '@/lib/userProfile';

export default function FarmerIDCard({ farmer, customData = {}, allowUpload = true, ...restProps }) {
  const [activeSide, setActiveSide] = useState('front'); // 'front' or 'back'
  const [printMode, setPrintMode] = useState('both'); // 'both', 'front', 'back'
  const fileInputRef = useRef(null);

  const farmerData = farmer || {
    name: restProps.farmerName,
    registryId: restProps.rsbsaId,
  };

  const {
    photo: userPhoto,
    isUploading,
    errorMessage: photoError,
    successMessage: photoSuccess,
    uploadPhoto,
    removePhoto,
    clearMessages,
  } = useUserProfilePhoto(farmerData);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const data = {
    name: farmerData?.name || restProps.farmerName || 'Farmer Member',
    registryId: farmerData?.registryId || restProps.rsbsaId || 'farmer-1-23-A001',
    coopName: customData.coopName || restProps.coopName || 'San Manuel Agrarian Beneficiaries Co-op (SMABC)',
    barangay: customData.barangay || restProps.barangay || 'Brgy. San Manuel, Tagum City',
    farmType: customData.farmType || restProps.farmType || 'Lowland Irrigated Palay (Rice)',
    hectares: customData.hectares || restProps.hectares || '2.5 Ha',
    validUntil: customData.validUntil || restProps.validUntil || 'DEC 2028',
    emergencyContactName: customData.emergencyContactName || restProps.emergencyContactName || 'Designated Beneficiary',
    emergencyContactPhone: customData.emergencyContactPhone || restProps.emergencyContactPhone || '0917-000-0000',
    barangayCaptain: customData.barangayCaptain || restProps.barangayCaptain || 'Barangay Captain (Official Signatory)',
    barangayHotline: customData.barangayHotline || restProps.barangayHotline || '(084) 000-0000 / 0900-000-0000',
    depotProviderName: customData.depotProviderName || restProps.depotProviderName || 'Tagum FCA Machinery Depot (Operations Head)',
    depotProviderPhone: customData.depotProviderPhone || restProps.depotProviderPhone || '0919-000-0002 / 0928-000-0003',
  };

  // ============================================================================
  // 1. HELPERS & UTILITIES
  // ============================================================================
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
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Hidden File Input for 5MB Photo Upload */}
      {allowUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
          onChange={handlePhotoUpload}
          className="hidden"
          aria-label="Upload official farmer 2x2 photo"
        />
      )}

      {/* ============================================================================
          2. CONTROLS (NO-PRINT)
          ============================================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-xl no-print bg-white p-3 rounded-2xl border border-border-soft shadow-xs">
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-border-soft">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSide === 'both'
                ? 'bg-primary text-white shadow-xs'
                : 'text-soil-slate hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            <span>Both Sides</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {allowUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Upload official 2x2 photo (Limit 5MB)"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>{userPhoto ? 'Change Photo' : 'Upload Photo'}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary font-extrabold">5MB</span>
            </button>
          )}

          {allowUpload && userPhoto && (
            <button
              type="button"
              onClick={removePhoto}
              className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
              title="Remove photo"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Card</span>
          </button>
        </div>
      </div>

      {/* ============================================================================
          3. NOTIFICATIONS & ALERTS
          ============================================================================ */}
      {/* Error Message for 5MB Limit Violation */}
      {photoError && (
        <div className="no-print w-full max-w-xl p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
            <div>
              <span className="font-bold">Upload Failed: </span>
              <span>{photoError}</span>
            </div>
          </div>
          <button type="button" onClick={clearMessages} className="text-red-500 font-bold hover:text-red-800 text-base leading-none">×</button>
        </div>
      )}

      {/* Success Notification */}
      {photoSuccess && (
        <div className="no-print w-full max-w-xl p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#005426] text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#1B6E39] shrink-0">check_circle</span>
            <span className="font-bold">{photoSuccess}</span>
          </div>
          <button type="button" onClick={clearMessages} className="text-emerald-700 font-bold hover:text-emerald-900 text-base leading-none">×</button>
        </div>
      )}

      {/* ============================================================================
          4. PRINTABLE ID CONTAINER
          ============================================================================ */}
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
                <div 
                  onClick={() => allowUpload && fileInputRef.current?.click()}
                  title={allowUpload ? "Click to upload/change photo (Limit: 5MB)" : undefined}
                  className={`w-20 h-24 rounded-xl bg-surface-container-high border-2 border-primary/30 overflow-hidden flex flex-col items-center justify-center relative shadow-xs group ${allowUpload ? 'cursor-pointer hover:border-primary' : ''}`}
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt={data.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-primary/70">person</span>
                      <span className="text-[7px] font-bold text-soil-slate uppercase tracking-wider mt-1">VERIFIED</span>
                    </>
                  )}

                  {/* No-print Hover overlay to upload */}
                  {allowUpload && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] font-bold no-print text-center px-1">
                      <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                      <span>{userPhoto ? 'Change' : 'Upload'}</span>
                      <span className="text-[7px] text-white/80">Max 5MB</span>
                    </div>
                  )}

                  {/* Hologram Badge */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-harvest-amber/80 flex items-center justify-center shadow-xs pointer-events-none">
                    <span className="material-symbols-outlined text-[10px] text-white">verified</span>
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center no-print">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {allowUpload && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="no-print mt-1 text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[11px]">photo_camera</span>
                    <span>{userPhoto ? 'Change Photo' : 'Add Photo'}</span>
                  </button>
                )}
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
