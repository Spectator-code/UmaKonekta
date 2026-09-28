'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import FarmerLoadingScreen from '@/components/FarmerLoadingScreen';
import { formatRegistryId, getRoleTemplate, getRoleInitial } from '@/lib/formatters';
import {
  User,
  Building2,
  Wrench,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Loader2,
  Headphones,
  IdCard,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

const roleMeta = {
  farmer: {
    roleTitle: 'Farmer',
    title: 'Farmer & Landowner Registration',
    badge: 'RSBSA Beneficiary',
    icon: User,
    subtext: 'Register with your Agrarian Member ID to access subsidized equipment rental rates and submit machinery dispatch requests.',
    idLabel: 'Farmer Member ID',
    idPlaceholder: 'e.g., farmer-0-0-F0000',
    idHelp: 'Format: role-0-0-F0000. Hyphens and role initial are auto-embedded as you type.',
    pwdLabel: 'Password',
    pwdPlaceholder: '••••••••••••',
    btnText: 'Create Farmer Account & Enter Portal',
    targetUrl: '/farmer-dashboard',
  },
  provider: {
    roleTitle: 'Provider',
    title: 'Equipment Provider / Depot Registration',
    badge: 'FCA Machinery Pool',
    icon: Building2,
    subtext: 'Register your cooperative or private machinery pool to list tractors, combine harvesters, and dryers for community dispatch.',
    idLabel: 'Provider Registry ID',
    idPlaceholder: 'e.g., provider-0-0-P0000',
    idHelp: 'Format: role-0-0-P0000. Hyphens and role initial are auto-embedded as you type.',
    pwdLabel: 'Depot Password',
    pwdPlaceholder: '••••••••••••',
    btnText: 'Create Provider Account & Access Depot',
    targetUrl: '/provider-dashboard',
  },
  mechanic: {
    roleTitle: 'Mechanic',
    title: 'Field Mechanic & Mobile Van Unit',
    badge: 'TESDA NC-II Unit',
    icon: Wrench,
    subtext: 'Register as an accredited agrarian technician or mobile repair unit to respond to field breakdowns and emergency SOS calls.',
    idLabel: 'Mechanic Registry ID',
    idPlaceholder: 'e.g., mechanic-0-0-M0000',
    idHelp: 'Format: role-0-0-M0000. Hyphens and role initial are auto-embedded as you type.',
    pwdLabel: 'Technician Password',
    pwdPlaceholder: 'enter your password',
    btnText: 'Create Mechanic Account & Access SOS Feed',
    targetUrl: '/mechanic-dashboard',
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<FarmerLoadingScreen message="Preparing Registration..." subtext="RSBSA & Cooperative Credentials Setup" />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get('role');
  const initialRole = (roleParam && roleMeta[roleParam]) ? roleParam : 'farmer';

  const { data: session, status: authStatus } = useSession();
  const [activeRole, setActiveRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showNumberErrorModal, setShowNumberErrorModal] = useState(false);
  const [registryId, setRegistryId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentMeta = roleMeta[activeRole] || roleMeta.farmer;
  const RoleIcon = currentMeta.icon || User;

  // If already authenticated, redirect to appropriate portal immediately
  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user?.role) {
      const userRole = session.user.role;
      const target = {
        farmer: '/farmer-dashboard',
        provider: '/provider-dashboard',
        mechanic: '/mechanic-dashboard',
        admin: '/admin',
        secops: '/x9f-telemetry-vault-8812'
      }[userRole] || '/farmer-dashboard';

      window.location.href = target;
    }
  }, [authStatus, session]);

  useEffect(() => {
    const currentParam = searchParams.get('role');
    if (currentParam && roleMeta[currentParam] && currentParam !== activeRole) {
      setActiveRole(currentParam);
    }
  }, [searchParams, activeRole]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMessage('');
    setNameError('');
    setShowNumberErrorModal(false);
    // Auto-update registry ID template if empty or was previously a template
    if (!registryId || /^([a-z]+)-\d{1,2}-\d{1,2}-[a-z]\d{3,4}$/i.test(registryId)) {
      setRegistryId(getRoleTemplate(role));
    }
    setPassword('');
    setConfirmPassword('');
    router.replace(`/register?role=${role}`, { scroll: false });
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (activeRole !== 'provider' && /\d/.test(val)) {
      setShowNumberErrorModal(true);
      setNameError('Numbers (0-9) are not allowed in your legal DA-registered name.');
      setName(val.replace(/\d/g, ''));
      return;
    }
    if (nameError) setNameError('');
    setName(val);
  };

  const handleNameKeyDown = (e) => {
    if (activeRole !== 'provider' && /[0-9]/.test(e.key)) {
      e.preventDefault();
      setShowNumberErrorModal(true);
      setNameError('Numbers (0-9) are not allowed in your legal DA-registered name.');
    }
  };

  const handleNamePaste = (e) => {
    const pastedText = e.clipboardData?.getData('text') || '';
    if (activeRole !== 'provider' && /\d/.test(pastedText)) {
      e.preventDefault();
      const sanitized = pastedText.replace(/\d/g, '');
      const input = e.target;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const current = name;
      const updated = current.substring(0, start) + sanitized + current.substring(end);
      setName(updated);
      setShowNumberErrorModal(true);
      setNameError('Numbers (0-9) are not allowed and were removed from your name.');
    }
  };

  const handleRegistryIdChange = (e) => {
    const nextVal = e.target.value;
    const isDeleting = nextVal.length < registryId.length;
    if (isDeleting) {
      setRegistryId(nextVal);
    } else {
      setRegistryId(formatRegistryId(nextVal, activeRole));
    }
    if (errorMessage) setErrorMessage('');
  };

  const passwordsMatch = useMemo(() => {
    return confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedId = registryId.trim();

    // Client-side validations
    if (!trimmedName) {
      setErrorMessage(activeRole === 'provider' ? 'Please enter the cooperative or depot organization name.' : 'Please enter your full name as registered with DA.');
      return;
    }

    if (activeRole !== 'provider' && /\d/.test(trimmedName)) {
      setShowNumberErrorModal(true);
      setNameError('Numbers (0-9) are not allowed in your legal DA-registered name.');
      setErrorMessage('Full Name cannot contain numeric digits.');
      return;
    }

    if (!trimmedId) {
      setErrorMessage(`Please enter your ${currentMeta.idLabel}.`);
      return;
    }

    // ID Format Validation: (user role-month-day register-F0000) e.g., farmer-0-0-F0000
    const idPattern = /^(farmer|provider|mechanic|admin)-\d{1,2}-\d{1,2}-[A-Za-z]\d{3,4}$/i;
    if (!idPattern.test(trimmedId)) {
      setErrorMessage(`Registry ID must follow the format role-0-0-F0000, e.g., ${getRoleTemplate(activeRole)}.`);
      return;
    }

    if (!trimmedId.toLowerCase().startsWith(activeRole.toLowerCase() + '-')) {
      setErrorMessage(`Registry ID for ${currentMeta.roleTitle || activeRole} must start with "${activeRole}-", e.g., ${getRoleTemplate(activeRole)}.`);
      return;
    }

    // Password validation: no spaces allowed
    if (/\s/.test(password)) {
      setErrorMessage('Password must not contain any spaces.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    if (!hasSpecialChar) {
      setErrorMessage('Password must contain at least one special character (e.g. @, $, !, %, *, ?, &, #).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password entries.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          registryId: trimmedId,
          password,
          role: activeRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please check your information.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);

      // Automatically sign in the newly registered user
      const loginResult = await signIn('credentials', {
        redirect: false,
        registryId: trimmedId,
        password,
      });

      if (!loginResult?.ok || loginResult?.error) {
        window.location.href = `/login?role=${activeRole}&registered=true`;
      } else {
        setTimeout(() => {
          window.location.href = currentMeta.targetUrl;
        }, 400);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('A network error occurred. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col relative w-full min-h-[calc(100vh-80px)] lg:flex-row bg-cream-surface selection:bg-emerald-100 selection:text-emerald-900">

      {/* LEFT SIDE: Institutional Trust & Agrarian Context */}
      <div className="relative lg:w-5/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-[#003618] via-[#005426] to-[#01505e] text-white overflow-hidden min-h-[460px] lg:min-h-full">
        {/* Ambient Backdrops */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25 pointer-events-none"
          style={{ backgroundImage: "url('/umakonekta-bg-4.png')" }}
        />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#a3f5b2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#F4A228]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-emerald-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#a3f5b2]" />
            <span>Republic of the Philippines • Department of Agriculture</span>
          </div>
        </div>

        {/* Hero Copy & Agrarian Mission */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4">
            Join the Agrarian <br />
            <span className="text-[#a3f5b2]">Resource Network.</span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed">
            Register your government RSBSA identification, cooperative fleet credentials, or technician certification to access and participate in the community exchange.
          </p>
        </div>

        {/* Bottom Verification Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 text-xs text-white/70 flex items-center justify-between">
          <span className="font-mono text-[11px]">Tagum City Agri-Mechanization Hub</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            RSBSA Offline-Ready System
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Registration Form */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,84,38,0.07)] border border-[#DDE3DA] flex flex-col gap-6">

          {/* Role Selector Segmented Bar */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Choose Your Account Role</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-primary font-bold border border-emerald-200">
                Step 1 of 2
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-border-soft">
              {[
                { key: 'farmer', label: 'Farmer', sub: 'Landowner', Icon: User },
                { key: 'provider', label: 'Provider', sub: 'Fleet Depot', Icon: Building2 },
                { key: 'mechanic', label: 'Mechanic', sub: 'Mobile Van', Icon: Wrench }
              ].map(({ key, label, sub, Icon }) => {
                const isActive = activeRole === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleChange(key)}
                    className={`py-2.5 px-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${isActive
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-[1.02]'
                      : 'text-soil-slate font-medium hover:text-on-surface hover:bg-white/60'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-soil-slate'}`} />
                    <span className="font-extrabold">{label}</span>
                    <span className={`text-[10px] -mt-0.5 opacity-80 ${isActive ? 'text-white' : 'text-soil-slate'}`}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Header */}
          <div className="border-b border-border-soft pb-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
                {currentMeta.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                {currentMeta.badge}
              </span>
            </div>
            <p className="text-xs text-soil-slate mt-1.5 leading-relaxed">
              {currentMeta.subtext}
            </p>
          </div>

          {/* Error / Success Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account successfully registered! Logging you into your dashboard...</span>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="register-fullname-input" className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  {activeRole === 'provider' ? 'Depot / Co-op Organization Name' : 'Full Name (as registered with DA)'}
                </label>
                {activeRole !== 'provider' && (
                  <span className="text-[11px] text-soil-slate font-medium">Letters only • No numbers</span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-soil-slate">
                  <User className="w-4 h-4 text-soil-slate" />
                </span>
                <input
                  id="register-fullname-input"
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  onKeyDown={handleNameKeyDown}
                  onPaste={handleNamePaste}
                  placeholder={activeRole === 'provider' ? 'e.g., Tagum Central FCA Depot' : 'e.g., Farmer Name'}
                  className={`w-full pl-10 pr-4 py-3 bg-white text-on-surface text-sm rounded-xl border ${nameError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-border-soft focus:border-primary focus:ring-primary/20'} focus:ring-2 focus:outline-none transition-all placeholder:text-soil-slate/50 font-medium`}
                />
              </div>
              {nameError && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Registry ID (Redesigned without clutter) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  {currentMeta.idLabel}
                </label>

                {/* Clean, single Auto-Template Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setRegistryId(getRoleTemplate(activeRole));
                    if (errorMessage.includes('ID must follow')) setErrorMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-primary text-[11px] font-mono font-bold transition-all border border-emerald-200 cursor-pointer"
                  title={`Apply template: ${getRoleTemplate(activeRole)}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Auto Template: {getRoleTemplate(activeRole)}</span>
                </button>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-soil-slate">
                  <IdCard className="w-4 h-4 text-soil-slate" />
                </span>
                <input
                  type="text"
                  required
                  value={registryId}
                  onChange={handleRegistryIdChange}
                  placeholder={getRoleTemplate(activeRole)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-on-surface text-sm rounded-xl border border-border-soft focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono font-bold transition-all placeholder:text-soil-slate/50"
                />
              </div>

              <p className="text-[11px] text-soil-slate leading-tight">
                {currentMeta.idHelp}
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  {currentMeta.pwdLabel}
                </label>
                <span className="text-[11px] text-soil-slate font-medium">Min. 8 characters</span>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-soil-slate">
                  <Lock className="w-4 h-4 text-soil-slate" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw.includes(' ')) {
                      setErrorMessage('Spaces are not allowed in the password.');
                      setPassword(raw.replace(/\s/g, ''));
                    } else {
                      if (errorMessage === 'Spaces are not allowed in the password.') {
                        setErrorMessage('');
                      }
                      setPassword(raw);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                      setErrorMessage('Spaces are not allowed in the password.');
                    }
                  }}
                  placeholder={currentMeta.pwdPlaceholder}
                  className="w-full pl-10 pr-11 py-3 bg-white text-on-surface text-sm rounded-xl border border-border-soft focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-soil-slate hover:text-on-surface cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-soil-slate leading-tight">
                Must be at least 8 characters with a special character (no spaces allowed).
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between min-h-[18px]">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  Confirm {currentMeta.pwdLabel}
                </label>
                {passwordsMatch && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passwords match</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-soil-slate">
                  <ShieldCheck className="w-4 h-4 text-soil-slate" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw.includes(' ')) {
                      setErrorMessage('Spaces are not allowed in the password.');
                      setConfirmPassword(raw.replace(/\s/g, ''));
                    } else {
                      setConfirmPassword(raw);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                      setErrorMessage('Spaces are not allowed in the password.');
                    }
                  }}
                  placeholder="Re-enter to confirm password"
                  className="w-full pl-10 pr-4 py-3 bg-white text-on-surface text-sm rounded-xl border border-border-soft focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono transition-all placeholder:text-soil-slate/50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full mt-3 py-3.5 px-4 bg-primary text-white text-sm font-black rounded-xl shadow-md hover:bg-primary-container focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Account & Initializing...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Account Registered! Entering Portal...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{currentMeta.btnText}</span>
                </>
              )}
            </button>
          </form>

          {/* Direct Link to Login */}
          <div className="text-center pt-3 border-t border-border-soft text-xs text-soil-slate">
            <span>Already registered? </span>
            <Link href={`/login?role=${activeRole}`} className="font-bold text-primary hover:underline ml-1 inline-flex items-center gap-1">
              <span>Sign In here</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Helpdesk Footer */}
          <div className="bg-surface-container-low p-3.5 rounded-2xl flex items-center justify-between text-xs text-soil-slate border border-border-soft/60">
            <span className="flex items-center gap-2 font-bold text-on-surface">
              <Headphones className="w-4 h-4 text-[#C26D1A]" />
              Barangay Agrarian Desk
            </span>
            <span className="text-[11px] text-soil-slate font-medium">Free registration assistance</span>
          </div>

        </div>
      </div>

      {/* Error Dialog Modal: Numbers Not Allowed in Full Name */}
      {showNumberErrorModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="num-error-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNumberErrorModal(false);
              const input = document.getElementById('register-fullname-input');
              if (input) input.focus();
            }
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowNumberErrorModal(false);
                const input = document.getElementById('register-fullname-input');
                if (input) input.focus();
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-soil-slate hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
            </div>

            {/* Category Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>DA-RSBSA Regulatory Validation</span>
            </div>

            <h3 id="num-error-title" className="text-xl font-black text-on-surface tracking-tight mb-2">
              Numbers Are Not Allowed
            </h3>

            <p className="text-sm text-soil-slate leading-relaxed mb-4">
              You entered a number into the <strong className="text-on-surface">Full Name (as registered with DA)</strong> field.
              Under Department of Agriculture regulations, legal identity records in the RSBSA masterlist must consist of alphabetical characters and standard name extensions only (e.g. <em>Farmer Name Jr.</em>).
            </p>

            <div className="w-full p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left mb-5">
              <strong className="block font-bold text-amber-950 mb-1">Looking for your Registry ID?</strong>
              If you intended to enter an identification code such as <span className="font-mono font-bold text-primary">{getRoleTemplate(activeRole)}</span>, please enter it in the <strong>{currentMeta.idLabel}</strong> field below.
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNumberErrorModal(false);
                const input = document.getElementById('register-fullname-input');
                if (input) input.focus();
              }}
              className="w-full py-3.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              Understood, Correct My Name
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
