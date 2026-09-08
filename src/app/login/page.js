'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const roleConfigs = {
  farmer: {
    heading: 'Farmer & Requestor Login',
    badge: 'RSBSA Auth',
    subtext: 'Enter your RSBSA Registry ID or Barangay FCA Member Passbook number to schedule farm machinery and review dispatches.',
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
    subtext: 'Sign in with your Cooperative SEC / CDA registration number to manage depot machinery, review incoming requests, and dispatch combine harvesters.',
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
  mechanic: {
    heading: 'Mobile Repair & Mechanic Dispatch',
    badge: 'TESDA NC-II',
    subtext: 'Technician access for real-time field breakdowns, spare parts requisitions, emergency machinery rescue, and daily job logs.',
    idLabel: 'Technician ID / TESDA Mechanic License',
    idPlaceholder: 'e.g., MECH-TESDA-889',
    idHelp: 'Authorized Agricultural Machinery Servicing NC-II ID.',
    idIcon: 'handyman',
    pwdLabel: 'Field Terminal Access PIN',
    demoId: 'MECH-TESDA-889',
    demoPwd: '8890',
    btnText: 'Open Field Mechanics Portal',
    targetUrl: '/mechanics/portal'
  },
  admin: {
    heading: 'LGU & Municipal Admin Moderation',
    badge: 'Gov Admin',
    subtext: 'Restricted to Municipal Agriculture Office (MAO) officers and Regional Supervising Officers for policy enforcement and dispatch audits.',
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
  
  const config = roleConfigs[activeRole];
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


        {/* Center Hero Message & Pillars */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            Connecting Every Farmer, <br/><span className="text-[#a3f5b2]">Securing Every Harvest.</span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-8">
            Sign in to request combine harvesters, manage municipal machinery depots, dispatch mobile repair technicians, or proxy-file physical SACCO scale tickets.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE: Multi-Role Interactive Login Portal */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,84,38,0.08)] border border-[#DDE3DA] flex flex-col gap-6">
          
          {/* Portal Role Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Select Account Portal</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#e5f0eb] rounded-xl border border-[#DDE3DA]/80">
              {['farmer', 'provider', 'mechanic', 'admin'].map(role => (
                <button 
                  key={role}
                  type="button" 
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 px-1 rounded-lg text-xs flex flex-col items-center gap-1 transition-all ${activeRole === role ? 'bg-primary text-white font-bold shadow-md' : 'text-[#475953] font-medium hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {role === 'farmer' ? 'person' : role === 'provider' ? 'corporate_fare' : role === 'mechanic' ? 'handyman' : 'shield_person'}
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
              <span>Log in to finalize booking for {asset}.</span>
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
                <button type="button" onClick={handleFillDemo} className="text-[11px] text-primary font-bold hover:underline">
                  Auto-fill Demo
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475953]">
                  <span className="material-symbols-outlined text-[20px]">pin</span>
                </span>
                <input 
                  type={pwdVisible ? 'text' : 'password'} 
                  required 
                  value={pwdValue}
                  onChange={(e) => setPwdValue(e.target.value)}
                  placeholder="••••"
                  maxLength={16}
                  className="w-full pl-11 pr-11 py-3 bg-white text-on-surface text-sm rounded-xl border border-[#DDE3DA] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono transition-all"
                />
                <button type="button" onClick={() => setPwdVisible(!pwdVisible)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#475953] hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">{pwdVisible ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                Municipal Cluster / Hub
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475953]">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </span>
                <select className="w-full pl-11 pr-10 py-3 bg-white text-on-surface text-sm rounded-xl border border-[#DDE3DA] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none transition-all cursor-pointer">
                  <option value="talavera" defaultValue>Tagum City, Davao del Norte (Region XI Hub)</option>
                  <option value="sanjose">Panabo City, Davao del Norte</option>
                  <option value="munoz">Island Garden City of Samal, Davao del Norte</option>
                  <option value="guimba">Carmen, Davao del Norte</option>
                  <option value="cabanatuan">Santo Tomas, Davao del Norte</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#475953]">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#ebf6f1] border border-[#DDE3DA]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
                <div>
                  <span className="block text-xs font-bold text-on-surface">2G / Low-Data Light Mode</span>
                  <span className="block text-[11px] text-[#475953]">Streamlines UI for remote farm plots</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-[#707a6f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-[#1b6e39] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span>Verifying Credentials with LGU Registry...</span>
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

          <div className="pt-4 border-t border-[#DDE3DA]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-[#475953] uppercase tracking-wider">Direct Role Showcase Access</span>
              <a href="/how-it-works" className="text-[11px] text-primary font-bold hover:underline">How It Works →</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <a href="/farmer-dashboard" className="py-2 px-2 rounded-lg bg-[#e5f0eb] hover:bg-primary hover:text-white text-on-surface text-xs font-semibold border border-[#DDE3DA] transition-all flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>Farmer</span>
              </a>
              <a href="/provider-dashboard" className="py-2 px-2 rounded-lg bg-[#e5f0eb] hover:bg-primary hover:text-white text-on-surface text-xs font-semibold border border-[#DDE3DA] transition-all flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                <span>Provider</span>
              </a>
              <a href="/mechanics/portal" className="py-2 px-2 rounded-lg bg-[#e5f0eb] hover:bg-[#C26D1A] hover:text-white text-on-surface text-xs font-semibold border border-[#DDE3DA] transition-all flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">handyman</span>
                <span>Mechanic</span>
              </a>
              <a href="/admin" className="py-2 px-2 rounded-lg bg-[#e5f0eb] hover:bg-primary hover:text-white text-on-surface text-xs font-semibold border border-[#DDE3DA] transition-all flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
                <span>Admin</span>
              </a>
            </div>
          </div>

          <div className="bg-[#F3F4EE] p-3 rounded-xl flex items-center justify-between text-xs text-[#475953]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#C26D1A] text-[18px]">support_agent</span>
              Barangay Desk Assistance:
            </span>
            <a href="/emergency" className="font-bold text-[#ba1a1a] hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">emergency</span> Hotline 1343
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
