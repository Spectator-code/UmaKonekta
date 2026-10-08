'use client';

/**
 * @file Navbar.js
 * @description React Component / Page for Navbar.js. Handles UI rendering and local state.
 * @module Navbar
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAccessibility } from '../lib/AccessibilityContext';
import { useUserProfilePhoto } from '../lib/userProfile';
import ErrorMessage from '@/components/ErrorMessage';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { toggleMobileNav, mobileNavOpen, toggleCommandPalette } = useAccessibility();
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync active municipality/barangay location
  useEffect(() => {
    const updateLoc = () => {
      const saved = localStorage.getItem('umakonekta_municipality');
      if (saved) setCurrentLocation(saved);
    };
    updateLoc();
    window.addEventListener('municipality_selected', updateLoc);
    return () => window.removeEventListener('municipality_selected', updateLoc);
  }, []);

  const {
    photo: userPhoto,
    isUploading: isPhotoUploading,
    errorMessage: photoError,
    successMessage: photoSuccess,
    uploadPhoto,
    removePhoto,
    clearMessages,
  } = useUserProfilePhoto(session?.user);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ============================================================================
  // 1. DYNAMIC ROLE-CONTEXTUAL NAV LINKS
  // ============================================================================
  const navLinks = [
    { label: 'Pamilihan ng Makinarya', href: '/marketplace' },
  ];

  if (!session) {
    navLinks.push({ label: 'Barangay Bulletin', href: '/bulletin-notice' });
  } else if (session.user?.role === 'farmer') {
    navLinks.push({ label: 'Aking Dashboard', href: '/farmer-dashboard' });
  } else if (session.user?.role === 'provider') {
    navLinks.push({ label: 'Provider Hub', href: '/provider-dashboard' });
  } else if (session.user?.role === 'mechanic') {
    navLinks.push({ label: 'Mechanic SOS Portal', href: '/mechanic-dashboard' });
  } else if (session.user?.role === 'admin') {
    navLinks.push({ label: 'Admin Command', href: '/admin' });
  } else if (session.user?.role === 'secops') {
    navLinks.push({ label: 'SecOps Vault', href: '/x9f-telemetry-vault-8812' });
  }

  const dashboardUrl = session?.user?.role === 'provider' 
    ? '/provider-dashboard' 
    : session?.user?.role === 'admin' 
    ? '/admin' 
    : session?.user?.role === 'mechanic'
    ? '/mechanic-dashboard'
    : session?.user?.role === 'secops'
    ? '/x9f-telemetry-vault-8812'
    : '/farmer-dashboard';

  const role = session?.user?.role || 'farmer';

  // ============================================================================
  // 2. ROLE VISUAL AESTHETICS METADATA
  // ============================================================================
  const roleMetaConfig = {
    farmer: {
      label: 'Farmer',
      icon: 'person',
      badge: 'RSBSA Beneficiary',
      avatarBg: 'bg-gradient-to-br from-[#005426] to-[#01381a]',
      pillBg: 'bg-[#EAF5EE] text-[#005426] border-[#1B6E39]/30',
      watermarkIcon: 'agriculture',
    },
    provider: {
      label: 'Provider',
      icon: 'corporate_fare',
      badge: 'FCA Machinery Pool',
      avatarBg: 'bg-gradient-to-br from-[#006064] to-[#00363a]',
      pillBg: 'bg-teal-50 text-teal-800 border-teal-300/40',
      watermarkIcon: 'precision_manufacturing',
    },
    mechanic: {
      label: 'Mechanic',
      icon: 'handyman',
      badge: 'TESDA NC-II Unit',
      avatarBg: 'bg-gradient-to-br from-[#b45309] to-[#78350f]',
      pillBg: 'bg-amber-50 text-amber-800 border-amber-300/40',
      watermarkIcon: 'construction',
    },
    admin: {
      label: 'Admin',
      icon: 'shield_person',
      badge: 'LGU MAO Command',
      avatarBg: 'bg-gradient-to-br from-[#4c1d95] to-[#1e1b4b]',
      pillBg: 'bg-purple-50 text-purple-800 border-purple-300/40',
      watermarkIcon: 'shield_person',
    },
    secops: {
      label: 'SecOps',
      icon: 'radar',
      badge: 'Cyber Telemetry',
      avatarBg: 'bg-gradient-to-br from-[#0f172a] to-[#022c22]',
      pillBg: 'bg-slate-900 text-emerald-400 border-emerald-500/40',
      watermarkIcon: 'radar',
    },
  };
  const currentRoleMeta = roleMetaConfig[role] || roleMetaConfig.farmer;

  // ============================================================================
  // 3. ROLE-SPECIFIC NAVIGATION ITEMS
  // ============================================================================
  const getNavSections = () => {
    switch (role) {
      case 'provider':
        return [
          {
            items: [
              { label: 'Aking Dashboard', href: '/provider-dashboard', icon: 'grid_view' },
              { label: 'Pila ng Dispatch (Arawang Roster)', href: '/daily-roster', icon: 'assignment' },
              { label: 'Pamilihan ng Makinarya', href: '/marketplace', icon: 'agriculture' },
              { label: 'Imbentaryo ng Makinarya', href: '/provider-dashboard#fleet', icon: 'precision_manufacturing' },
              { label: 'Pila ng Dispatch', href: '/provider-dashboard#queue', icon: 'pending_actions' },
              { label: 'Resibo ng SACCO', href: '/sacco-receipt', icon: 'account_balance_wallet' },
              { label: 'Patalastas ng Barangay', href: '/bulletin-notice', icon: 'campaign' },
            ],
          },
        ];

      case 'mechanic':
        return [
          {
            items: [
              { label: 'Aking Dashboard', href: '/mechanic-dashboard', icon: 'grid_view' },
              { label: 'SOS Breakdown Feed', href: '/mechanic-dashboard#sos', icon: 'emergency' },
              { label: 'Mga Work Order at Tala', href: '/mechanic-dashboard#history', icon: 'engineering' },
              { label: 'Pamilihan ng Makinarya', href: '/marketplace', icon: 'agriculture' },
              { label: 'Patalastas ng Barangay', href: '/bulletin-notice', icon: 'campaign' },
            ],
          },
        ];

      case 'admin':
        return [
          {
            items: [
              { label: 'Sentro ng Pangangasiwa', href: '/admin', icon: 'shield_person' },
              { label: 'Pagsusuri ng RSBSA Registry', href: '/admin#farmers', icon: 'badge' },
              { label: 'SecOps Telemetry Vault', href: '/x9f-telemetry-vault-8812', icon: 'security' },
              { label: 'Pamilihan ng Makinarya', href: '/marketplace', icon: 'agriculture' },
              { label: 'Slip ng Dispatch', href: '/dispatch-slip', icon: 'receipt_long' },
              { label: 'Resibo ng SACCO', href: '/sacco-receipt', icon: 'account_balance_wallet' },
            ],
          },
        ];

      case 'secops':
        return [
          {
            items: [
              { label: 'SecOps Telemetry Vault', href: '/x9f-telemetry-vault-8812', icon: 'security' },
              { label: 'Threat Center & SIEM', href: '/x9f-telemetry-vault-8812#threats', icon: 'radar' },
              { label: 'Direktoryo ng Gumagamit', href: '/x9f-telemetry-vault-8812#directory', icon: 'badge' },
              { label: 'Pamilihan ng Makinarya', href: '/marketplace', icon: 'agriculture' },
              { label: 'Patalastas ng Barangay', href: '/bulletin-notice', icon: 'campaign' },
            ],
          },
        ];

      case 'farmer':
      default:
        return [
          {
            items: [
              { label: 'Aking Dashboard', href: '/farmer-dashboard', icon: 'grid_view' },
              { label: 'RSBSA Farmer ID Card', href: '/farmer-dashboard#farmer-id', icon: 'badge' },
              { label: 'Pamilihan ng Makinarya', href: '/marketplace', icon: 'agriculture' },
              { label: 'Mga Slip ng Dispatch', href: '/dispatch-slip', icon: 'receipt_long' },
              { label: 'Resibo ng SACCO', href: '/sacco-receipt', icon: 'account_balance_wallet' },
              { label: 'Emergency SOS ng Mekaniko', href: '/farmer-dashboard#sos', icon: 'emergency' },
              { label: 'Patalastas ng Barangay', href: '/bulletin-notice', icon: 'campaign' },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <header role="banner" className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* ============================================================================
            4. LEFT SECTION (Mobile Menu Trigger + Logo)
            ============================================================================ */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session && (
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label={profileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={profileOpen}
              className="lg:hidden p-2 rounded-xl text-soil-slate hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">
                {profileOpen ? 'close' : 'menu'}
              </span>
            </button>
          )}

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity shrink-0">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-primary/20 overflow-hidden shrink-0">
              <img 
                src="/umakonekta-logo.jpg" 
                alt="UMAKONEKTA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-base sm:text-lg font-extrabold tracking-tight text-primary whitespace-nowrap">UMAKONEKTA</span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-soil-slate uppercase hidden xl:inline whitespace-nowrap">
                Agricultural Resource Directory & Exchange
              </span>
            </div>
          </Link>
        </div>

        {/* ============================================================================
            5. PRIMARY DESKTOP NAV
            ============================================================================ */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ============================================================================
            6. ACTIONS & HANGING BAR TRIGGER
            ============================================================================ */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Location Selector Pill */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('open_location_modal'))}
            aria-label="Select or change agricultural sector location"
            title={`Active location: ${currentLocation || 'Select Sector'}. Click to change.`}
            className="h-9 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 text-primary border border-emerald-200/80 transition-all shadow-2xs text-xs font-bold cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[17px] text-primary shrink-0">location_on</span>
            <span className="truncate max-w-[85px] sm:max-w-[130px] md:max-w-[150px] text-left">
              {currentLocation ? currentLocation.split(',')[0] : 'Select Sector'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-primary opacity-60 shrink-0">expand_more</span>
          </button>

          {/* Quick Search Button (hidden on landing page where main search bar is already featured) */}
          {pathname && pathname !== '/' && (
            <button
              type="button"
              onClick={toggleCommandPalette}
              aria-label="Open quick search"
              title="Quick Search & Actions"
              className="h-9 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface-container-low/80 text-soil-slate hover:text-primary hover:bg-surface-container transition-all border border-border-soft shadow-2xs text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0">search</span>
              <span className="hidden sm:inline whitespace-nowrap">Search</span>
            </button>
          )}

          {/* User Profile Avatar with Hanging Bar Menu */}
          {status === 'loading' ? (
            <div className="w-9 h-9 rounded-xl bg-surface-container animate-pulse shrink-0" />
          ) : session ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                aria-label="Open profile menu and navigation"
                className={`h-9 flex items-center gap-2 sm:gap-2.5 p-1 sm:pl-1.5 sm:pr-3 rounded-xl border transition-all cursor-pointer select-none group shrink-0 whitespace-nowrap ${
                  profileOpen
                    ? 'bg-[#EAF5EE] border-[#1B6E39]/40 ring-2 ring-[#1B6E39]/20 shadow-sm'
                    : 'bg-surface-container-low/90 hover:bg-surface-container border-border-soft hover:border-soil-slate/30 shadow-2xs'
                }`}
                title={`${session.user.name} (${currentRoleMeta.label})`}
              >
                {/* Avatar with Status Dot */}
                <div className="relative shrink-0">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={session.user.name || 'User Profile'}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full sm:rounded-xl object-cover ring-2 ring-white shadow-xs"
                    />
                  ) : (
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full sm:rounded-xl ${currentRoleMeta.avatarBg} flex items-center justify-center text-white font-extrabold uppercase shadow-xs text-xs tracking-wider ring-2 ring-white`}>
                      {session.user.name?.[0] || <span className="material-symbols-outlined text-[18px]">{currentRoleMeta.icon}</span>}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" title="Online & Synced" />
                </div>

                {/* Rotating Chevron */}
                <span 
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ml-0.5 ${
                    profileOpen ? 'rotate-180 text-primary font-bold' : 'text-soil-slate group-hover:text-soil-dark'
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Hanging Bar Dropdown Menu - 100% Solid Opaque White Background */}
              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#DDE7E1] shadow-2xl p-3 z-50 flex flex-col gap-2.5 max-h-[85vh] overflow-y-auto"
                  style={{ backgroundColor: '#ffffff', opacity: 1 }}
                >
                  {/* User Profile Info Header Card with Profile Photo */}
                  <div className="p-3 bg-[#F4F9F6] rounded-2xl border border-[#DDE7E1]">
                    <div className="flex items-start gap-3">
                      {/* Interactive Avatar with Upload Trigger */}
                      <div className="relative shrink-0 group">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          title="Click to upload/change photo (Max 5MB)"
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-[#1B6E39]/30 bg-white shadow-xs cursor-pointer relative flex items-center justify-center transition-transform active:scale-95"
                        >
                          {userPhoto ? (
                            <img
                              src={userPhoto}
                              alt={session.user.name || 'User Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full ${currentRoleMeta.avatarBg} flex items-center justify-center text-white font-extrabold text-base sm:text-lg uppercase`}>
                              {session.user.name?.[0] || (
                                <span className="material-symbols-outlined text-[24px]">{currentRoleMeta.icon}</span>
                              )}
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                            <span>{userPhoto ? 'Change' : 'Upload'}</span>
                          </div>

                          {/* Upload Spinner */}
                          {isPhotoUploading && (
                            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center">
                              <span className="w-4 h-4 border-2 border-[#1B6E39] border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Quick Camera Icon Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Upload profile photo"
                          title="Upload profile photo (Limit 5MB)"
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1B6E39] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#005426] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                        </button>
                      </div>

                      {/* User Info Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-extrabold text-sm sm:text-base text-soil-dark truncate leading-snug">
                            {session.user.name || 'Member'}
                          </p>
                          <span className="material-symbols-outlined text-[18px] text-[#1B6E39] shrink-0" title="Verified Member">
                            verified
                          </span>
                        </div>
                        <p className="text-xs font-mono text-soil-slate truncate mt-0.5">
                          {session.user.registryId || session.user.email || 'Verified Member'}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#EAF5EE] text-[#1B6E39] border border-[#1B6E39]/25">
                            {role.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-soil-slate font-bold truncate">
                            {currentRoleMeta.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hidden Native File Input (5MB Limit Enforcement) */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      aria-label="Choose profile photo"
                    />

                    {/* Action Bar with Limit 5MB Label and Remove Option */}
                    <div className="mt-2.5 pt-2 border-t border-[#DDE7E1]/80 flex items-center justify-between gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPhotoUploading}
                        className="font-bold text-[#1B6E39] hover:text-[#004720] hover:underline flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {userPhoto ? 'edit' : 'add_photo_alternate'}
                        </span>
                        <span>{userPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-mono text-soil-slate bg-white px-1.5 py-0.5 rounded border border-[#DDE7E1] font-semibold tracking-wide"
                          title="File size limit is strictly 5MB"
                        >
                          Limit: 5MB
                        </span>

                        {userPhoto && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="font-bold text-red-600 hover:text-red-800 hover:underline text-[10px] transition-colors cursor-pointer"
                            title="Remove uploaded profile photo"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Error Banner (e.g. file exceeds 5MB limit) */}
                    <ErrorMessage error={photoError} onDismiss={clearMessages} />

                    {/* Success Banner */}
                    {photoSuccess && (
                      <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#005426] text-[11px] leading-tight flex items-center gap-1.5 animate-fadeIn">
                        <span className="material-symbols-outlined text-[15px] shrink-0 text-[#1B6E39]">check_circle</span>
                        <span className="font-semibold">{photoSuccess}</span>
                      </div>
                    )}
                  </div>

                  {/* Transferred Sidebar Navigation Links */}
                  <div className="flex flex-col gap-1 py-1">
                    {navSections.map((section, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        {section.title && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-soil-slate font-bold px-2 pt-1 block">
                            {section.title}
                          </span>
                        )}
                        {section.items.map((item) => {
                          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.href.includes('#'));
                          return (
                            <Link
                              key={item.href + item.label}
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                isActive
                                  ? 'bg-[#EAF5EE] text-[#1B6E39] font-black'
                                  : 'text-[#1a1a1a] hover:bg-surface-container-low hover:text-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px] shrink-0 text-on-surface">
                                {item.icon}
                              </span>
                              <span className="truncate flex-1">{item.label}</span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-[#1B6E39] shrink-0" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* 4 Core Roles Switcher: Farmer, Provider, Mechanic, Admin */}
                  {session?.user?.role !== 'secops' && (
                    <div className="pt-2 border-t border-border-soft">
                      <div className="flex items-center justify-between px-1 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-soil-slate font-bold block">
                          {session?.user?.role === 'admin' ? 'ADMIN FLEET DIRECTORY' : 'SWITCH ACCOUNT / PORTAL'}
                        </span>
                        <span className="text-[9px] font-mono text-soil-slate/70">4 Portals</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { roleKey: 'farmer', label: 'Farmer', icon: 'person', path: '/farmer-dashboard' },
                          { roleKey: 'provider', label: 'Provider', icon: 'corporate_fare', path: '/provider-dashboard' },
                          { roleKey: 'mechanic', label: 'Mechanic', icon: 'handyman', path: '/mechanic-dashboard' },
                          { roleKey: 'admin', label: 'Admin', icon: 'shield_person', path: '/admin' }
                        ].map(({ roleKey, label, icon, path }) => {
                          const isCurrent = session?.user?.role === roleKey;
                          const targetHref = (session?.user?.role === 'admin' || isCurrent) ? path : `/login?role=${roleKey}`;
                          return (
                            <Link
                              key={roleKey}
                              href={targetHref}
                              onClick={() => setProfileOpen(false)}
                              title={isCurrent ? `Current Active Account (${label})` : session?.user?.role === 'admin' ? `View ${label} Dashboard` : `Switch Account to ${label}`}
                              className={`px-1 py-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all text-center border cursor-pointer relative ${
                                isCurrent 
                                  ? 'bg-[#EAF5EE] text-[#1B6E39] border-[#1B6E39]/30 font-black' 
                                  : 'bg-surface-container-low text-soil-slate border-transparent hover:text-on-surface hover:bg-neutral-100'
                              }`}
                            >
                              {isCurrent && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1B6E39]" />
                              )}
                              <span className="material-symbols-outlined text-[18px]">{icon}</span>
                              <span>{label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}



                  {/* Prominent Sign Out Button */}
                  <div className="pt-2 border-t border-border-soft">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#C36616] hover:bg-[#a8550e] text-white text-xs sm:text-sm font-extrabold active:scale-[0.98] transition-all shadow-md cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/login"
                className="h-9 px-3 text-soil-dark hover:text-primary font-bold text-xs sm:text-sm hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-center shrink-0 whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="h-9 px-3.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-all text-xs sm:text-sm shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">person_add</span>
                <span className="whitespace-nowrap font-bold">Sign Up</span>
              </Link>
            </div>
          )}


        </div>
      </div>
    </header>
  );
}
