'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const roleConfigs = {
  farmer: {
    heading: 'Farmer & Requestor Login',
    badge: 'RSBSA Auth',
    subtext: 'Enter your RSBSA Registry ID or Barangay FCA Member Passbook number to search directory resources and submit equipment requests.',
    idLabel: 'RSBSA ID Number / Member Passbook ID',
    idPlaceholder: 'e.g., 03-49-12-00841',
    idHelp: 'Printed on your physical DA RSBSA enrollment slip or FCA passbook.',
    idIcon: 'badge',
    pwdLabel: '4-Digit Security PIN / SMS Code',
    demoId: '03-49-12-00841',
    demoPwd: '4092',
    btnText: 'Verify Identity & Enter Farmer Dashboard',
    targetUrl: '/farmer-dashboard'
  },
  provider: {
    heading: 'Resource Provider Depot Login',
    badge: 'FCA Depot Auth',
    subtext: 'Sign in with your Cooperative SEC / CDA registration number to manually create and manage resource listings, and review incoming requests.',
    idLabel: 'Cooperative Registration (CDA/SEC) or Provider ID',
    idPlaceholder: 'e.g., CDA-FCA-2024-9140',
    idHelp: 'Accredited DA-RFO XI Depot & Machinery Pool certificate number.',
    idIcon: 'domain',
    pwdLabel: 'Depot Security Keycode',
    demoId: 'CDA-FCA-2024-9140',
    demoPwd: 'TagumAdmin2024!',
    btnText: 'Authenticate & Access Provider Hub',
    targetUrl: '/provider-dashboard'
  },
  admin: {
    heading: 'LGU & Municipal Admin Directory',
    badge: 'Gov Admin',
    subtext: 'Municipal Agriculture Office (MAO) administration for user registrations, role management, and farmer directory audits.',
    idLabel: 'Government Employee ID / MAO Dispatch ID',
    idPlaceholder: 'e.g., GOV-MAO-R11-0042',
    idHelp: 'Official @da.gov.ph or municipal officer credentials.',
    idIcon: 'admin_panel_settings',
    pwdLabel: 'Multi-Factor Hardware / Security Token',
    demoId: 'GOV-MAO-R11-0042',
    demoPwd: 'MAO-Command-9912',
    btnText: 'Enter Admin Moderation Command',
    targetUrl: '/admin'
  }
};

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream-surface"><span className="material-symbols-outlined text-[40px] animate-spin text-primary">sync</span></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeRole, setActiveRole] = useState('farmer');
  const [idValue, setIdValue] = useState('');
  const [pwdValue, setPwdValue] = useState('');
  const [pwdVisible, setPwdVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const config = roleConfigs[activeRole] || roleConfigs.farmer;
  const intent = searchParams.get('intent');
  const asset = searchParams.get('asset');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && roleConfigs[roleParam]) {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setIdValue('');
    setPwdValue('');
  };

  const handleFillDemo = () => {
    setIdValue(config.demoId);
    setPwdValue(config.demoPwd);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await signIn('credentials', {
      redirect: false,
      registryId: idValue,
      password: pwdValue
    });

    if (result?.error) {
      alert("Invalid credentials. Please check your Registry ID and PIN/Password.");
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        if (intent === 'request' && activeRole === 'farmer') {
          router.push(`/farmer-dashboard?${searchParams.toString()}`);
        } else {
          router.push(config.targetUrl);
        }
      }, 600);
    }
  };

  return (
    <div className="flex flex-col relative w-full min-h-[calc(100vh-80px)] lg:flex-row bg-cream-surface">
      {/* LEFT SIDE: Brand Showcase & Institutional Trust Section */}
      <div className="relative lg:w-5/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-[#003618] via-[#005426] to-[#01505e] text-white overflow-hidden min-h-[420px] lg:min-h-full">
        {/* Ambient Visual Elements & Terraces Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" 
          style={{ backgroundImage: "url('/umakonekta-bg-4.png')" }}
        />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#a3f5b2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#F4A228]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Center Hero Message & Scope Pillars */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs mb-4 border border-white/20">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            Directory Workflow Standard
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            Connecting Every Farmer, <br/><span className="text-[#a3f5b2]">Empowering Every Community.</span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6">
            Sign in to discover machinery resources, manually manage equipment listings, or moderate municipal farmer and cooperative directory records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/90">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 border border-white/15">
              <span className="material-symbols-outlined text-[#a3f5b2] text-[20px]">manage_accounts</span>
              <span>3 Core Roles: Admin, Provider, Farmer</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 border border-white/15">
              <span className="material-symbols-outlined text-[#a3f5b2] text-[20px]">location_searching</span>
              <span>Category & Text Search</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Multi-Role Interactive Login Portal */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,84,38,0.08)] border border-[#DDE3DA] flex flex-col gap-6">
          
          {/* Portal Role Selector Tabs (3 In-Scope Roles: Farmer, Provider, Admin) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Select Account Portal</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#e5f0eb] rounded-xl border border-[#DDE3DA]/80">
              {['farmer', 'provider', 'admin'].map(role => (
                <button 
                  key={role}
                  type="button" 
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 px-1 rounded-lg text-xs flex flex-col items-center gap-1 transition-all ${activeRole === role ? 'bg-primary text-white font-bold shadow-md' : 'text-[#475953] font-medium hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {role === 'farmer' ? 'person' : role === 'provider' ? 'corporate_fare' : 'shield_person'}
                  </span>
                  <span className="capitalize">{role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Context Header */}
          <div className="border-b border-[#DDE3DA]/80 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                {config.heading}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5EE] text-[#1B6E39] text-xs font-bold uppercase">
                {config.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#404940] mt-1">
              {config.subtext}
            </p>
          </div>

          {intent === 'request' && asset && (
            <div className="p-3 rounded-xl bg-[#EAF5EE] text-[#1B6E39] text-xs font-semibold flex items-center gap-2 border border-[#1B6E39]/20">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Log in to finalize request for {asset}.</span>
            </div>
          )}

          {/* Interactive Form */}
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                {config.idLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475953]">
                  <span className="material-symbols-outlined text-[20px]">{config.idIcon}</span>
                </span>
                <input 
                  type="text" 
                  required 
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                  placeholder={config.idPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white text-on-surface text-sm rounded-xl border border-[#DDE3DA] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono transition-all placeholder:text-[#475953]/60"
                />
              </div>
              <p className="text-[11px] text-[#475953]">
                {config.idHelp}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  {config.pwdLabel}
                </label>
                <button 
                  type="button" 
                  onClick={handleFillDemo}
                  className="text-xs font-mono font-bold text-[#8F4700] hover:text-[#C26D1A] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  Fill Demo
                </button>
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475953]">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input 
                  type={pwdVisible ? "text" : "password"} 
                  required 
                  value={pwdValue}
                  onChange={(e) => setPwdValue(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white text-on-surface text-sm rounded-xl border border-[#DDE3DA] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setPwdVisible(!pwdVisible)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#475953] hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {pwdVisible ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className="w-full mt-2 py-3.5 px-4 bg-primary text-on-primary text-sm font-extrabold rounded-xl shadow-md hover:bg-primary-container hover:text-on-primary-container focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : isSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Identity Verified! Redirecting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>{config.btnText}</span>
                </>
              )}
            </button>
          </form>


          <div className="bg-[#F3F4EE] p-3 rounded-xl flex items-center justify-between text-xs text-[#475953]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#C26D1A] text-[18px]">support_agent</span>
              Barangay Desk Assistance
            </span>
            <span className="text-soil-slate/70 font-medium">Available during LGU office hours</span>
          </div>

        </div>
      </div>
    </div>
  );
}
