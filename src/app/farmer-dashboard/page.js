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

import { useSession } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FarmerLoadingScreen from '@/components/FarmerLoadingScreen'
import SmartSearchSelect from '@/components/SmartSearchSelect'
import FarmerIDCard from '@/components/FarmerIDCard'
import { useUserProfilePhoto } from '@/lib/userProfile'
import { MACHINERY_CATALOG_PRESETS, SETTLEMENT_METHODS, formatRegistryId, getRoleTemplate } from '@/lib/formatters'
import {
  Tractor,
  Wrench,
  AlertTriangle,
  PhoneCall,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Calendar,
  MapPin,
  Ruler,
  FileText,
  X,
  Sparkles,
  Flame,
  Check,
  Clock,
  Radio,
  ChevronRight,
  Layers,
  ArrowUpRight,
  BadgeAlert,
  IdCard,
  Building,
  Activity,
  Wheat,
  Phone,
  Siren,
  HelpCircle,
  Truck
} from 'lucide-react';

export default function FarmerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { photo: userPhoto } = useUserProfilePhoto(session?.user)
  const [data, setData] = useState({ requests: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'in_progress', 'scheduled', 'completed'
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false)

  // Quick Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [farmerUserId, setFarmerUserId] = useState('')
  const [selectedMachine, setSelectedMachine] = useState('Kubota DC-70 Plus Combine Harvester')
  const [parcelSector, setParcelSector] = useState('Purok 2 (Sitio Balite)')
  const [hectares, setHectares] = useState(2.0)
  const [scheduleDate, setScheduleDate] = useState('2026-10-14')
  const [contactPhone, setContactPhone] = useState('0917-000-0001')
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [activeFleetCount, setActiveFleetCount] = useState(100)
  const [activeProvidersCount, setActiveProvidersCount] = useState(10)

  // Emergency SOS Breakdown Modal State
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [sosMachine, setSosMachine] = useState('Kubota DC-70 Plus Combine Harvester')
  const [sosParcel, setSosParcel] = useState('Purok 2 (Sitio Balite, Dike Lateral 3)')
  const [sosIssue, setSosIssue] = useState('Threshing Drum Jammed / Broken Belt')
  const [sosPhone, setSosPhone] = useState('0917-000-0001')
  const [sosSubmitted, setSosSubmitted] = useState(false)

  // Curated requests state
  const [requestsList, setRequestsList] = useState([]);
  
  // Announcements
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=farmer')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'farmer' && session?.user?.role !== 'admin') {
        const portal = session?.user?.role === 'provider'
          ? '/provider-dashboard'
          : session?.user?.role === 'mechanic'
          ? '/mechanic-dashboard'
          : session?.user?.role === 'secops'
          ? '/x9f-telemetry-vault-8812'
          : '/admin';
        router.push(portal);
        return;
      }
      setFarmerUserId(session?.user?.registryId || session?.user?.id || getRoleTemplate('farmer'));
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(d => {
          setData(d)
          if (d.requests && Array.isArray(d.requests) && d.requests.length > 0) {
            const mappedDbRequests = d.requests.map(r => ({
              id: r.id.startsWith('REQ-') ? r.id : `REQ-${r.id.slice(0, 8).toUpperCase()}`,
              machineName: r.asset?.name || r.notes?.split(' | ')?.[0] || 'Agricultural Machinery',
              machineCategory: r.asset?.type || 'Machinery',
              icon: r.asset?.type?.toLowerCase()?.includes('tractor') ? 'precision_manufacturing' : 'agriculture',
              driverName: r.asset?.provider?.name || 'Accredited Operator',
              driverPhone: r.asset?.provider?.registryId || '0919-000-0002',
              driverRating: '4.9 (DA-Certified)',
              depot: r.asset?.location || 'Tagum FCA Machinery Depot',
              parcel: r.notes?.split(' | ')?.[1] || 'Registered Farmland',
              hectares: r.hectares || 1.0,
              date: r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Schedule',
              timeSlot: '07:00 AM – 02:00 PM',
              estimatedRate: `₱${((r.hectares || 1) * 2800).toLocaleString()}`,
              fuelAllocation: `${Math.round((r.hectares || 1) * 18)}L Diesel`,
              settlementType: 'Cash-on-Dike Settlement',
              status: r.status || 'pending',
              statusLabel: r.status === 'dispatched' ? 'Driver En Route' : r.status === 'completed' ? 'Completed & Signed' : 'Pending Depot Verification',
              statusBadge: r.status === 'dispatched' ? 'bg-primary/10 text-primary border-primary/20' : r.status === 'completed' ? 'bg-status-available-bg text-status-available border-status-available/20' : 'bg-blue-50 text-blue-700 border-blue-200',
              dispatchSlipUrl: '/dispatch-slip',
            }));
            setRequestsList(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newItems = mappedDbRequests.filter(m => !existingIds.has(m.id));
              return [...newItems, ...prev];
            });
          }
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))

      fetch('/api/assets')
        .then(res => res.json())
        .then(assets => {
          if (Array.isArray(assets) && assets.length > 0) {
            setActiveFleetCount(assets.length);
            const distinctProviders = new Set(assets.map(a => a.provider?.name || a.providerId));
            setActiveProvidersCount(distinctProviders.size || 10);
          }
        })
        .catch(() => {});

      // Fetch Patalastas ng Baranggay
      fetch('/api/announcements')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.announcements) {
            setAnnouncements(data.announcements);
          }
        })
        .catch(console.error);
    }
  }, [status, session, router])

  // Synchronize hash in URL to scroll to #sos or open #farmer-id
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#sos' || hash === '#emergency') {
        const el = document.getElementById('sos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#farmer-id' || hash === '#id-card') {
        setIsIdCardModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const ha = Number(hectares) || 1.0;

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerUserId: farmerUserId || session?.user?.registryId || getRoleTemplate('farmer'),
          machineName: selectedMachine,
          parcelSector,
          hectares: ha,
          scheduleDate,
          contactPhone,
        }),
      });

      const json = await res.json();
      const newReq = {
        id: json?.request?.id ? `REQ-${json.request.id.slice(0, 8).toUpperCase()}` : `REQ-${Date.now().toString().slice(-4)}`,
        machineName: selectedMachine,
        machineCategory: 'Harvester',
        icon: 'agriculture',
        driverName: 'Accredited Depot Operator',
        driverPhone: contactPhone || '0919-000-0002',
        driverRating: '4.9 (DA-Certified)',
        depot: 'Tagum FCA Machinery Depot',
        parcel: parcelSector,
        hectares: ha,
        date: scheduleDate,
        timeSlot: '07:00 AM – 01:00 PM',
        estimatedRate: `₱${(ha * 2800).toLocaleString()} (Estimated)`,
        fuelAllocation: `${Math.round(ha * 18)}L Diesel`,
        settlementType: 'Cash-on-Dike Settlement',
        status: 'pending',
        statusLabel: 'Pending Depot Verification',
        statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
        dispatchSlipUrl: '/dispatch-slip',
      };

      setRequestsList([newReq, ...requestsList]);
      setRequestSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setRequestSubmitted(false);
      }, 1200);
    } catch (err) {
      console.error('Request creation error:', err);
    }
  };

  const handleBroadcastSos = async (e) => {
    e.preventDefault();
    setSosSubmitted(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerUserId: session?.user?.id || session?.user?.registryId || farmerUserId,
          machineName: sosMachine,
          parcelSector: sosParcel,
          contactPhone: sosPhone,
          notes: sosIssue,
          isEmergency: true,
          hectares: 1.0
        })
      });
      const data = await res.json();
      const newReq = {
        id: data?.request?.id ? `SOS-${data.request.id.slice(0, 8).toUpperCase()}` : `SOS-2026-${Math.floor(100 + Math.random() * 900)}`,
        machineName: `${sosMachine} (EMERGENCY SOS)`,
        machineCategory: 'Emergency Breakdown',
        icon: 'emergency',
        driverName: 'Mobile Emergency Van #2 (Field Mechanic #889)',
        driverPhone: sosPhone || '0919-000-0002',
        driverRating: '5.0 (TESDA NC-II Master Mechanic)',
        depot: 'Tagum Rapid Field Repair Hub',
        parcel: sosParcel,
        hectares: 1.0,
        date: 'TODAY (URGENT DISPATCH)',
        timeSlot: 'Within 20–35 Mins',
        estimatedRate: 'Co-op Warranty Service',
        fuelAllocation: 'Service Van En Route',
        settlementType: 'Co-op Warranty Service',
        status: 'dispatched',
        statusLabel: 'Mobile Van Dispatched',
        statusBadge: 'bg-status-urgent-bg text-status-urgent border-status-urgent/30',
        dispatchSlipUrl: '/dispatch-slip',
      };
      setRequestsList(prev => [newReq, ...prev]);
    } catch (err) {
      console.error('Failed to broadcast SOS to backend:', err);
    } finally {
      setTimeout(() => {
        setIsSosModalOpen(false);
        setSosSubmitted(false);
      }, 1500);
    }
  };

  const filteredRequests = requestsList.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  if (status === 'loading' || isLoading) {
    return (
      <FarmerLoadingScreen 
        message="Gina-preparar ang imo UmaKonekta Workspace" 
        subtext="Ginakuha ang mga datos sa uma kag forecast sa tyempo" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-16">
      
      {/* ============================================================================
          1. HEADER SECTION
          Description: Displays farmer profile, verified status, and global actions
          Style: Clean flat background, airy padding, sharp borders, prominent green accent
          ============================================================================ */}
      <div className="bg-white border-b-4 border-[#005426] text-gray-900 py-10 px-6 sm:px-10">
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-900 border border-gray-300 shrink-0">
              {userPhoto ? (
                <img src={userPhoto} alt={session?.user?.name || 'Farmer Photo'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#005426] flex items-center justify-center text-white font-black text-2xl">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'F'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white" title="Online & Registered" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                  {session?.user?.name || 'Farmer Member'}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified RSBSA</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2 flex flex-wrap items-center gap-x-3">
                <span>Registry: <strong className="text-gray-900">{session?.user?.registryId || getRoleTemplate('farmer')}</strong></span>
                <span className="text-gray-300">•</span>
                <span>San Manuel Agrarian Beneficiaries Co-op (SMABC)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsIdCardModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold text-sm border-2 border-gray-300 cursor-pointer"
              title="View, upload photo, and print my RSBSA Farmer Identification Card"
            >
              <IdCard className="w-5 h-5 text-gray-500" />
              <span>My RSBSA Farmer ID</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#005426] text-white font-bold text-sm cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>Request Farm Machinery</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 mt-10">
        
        {/* ============================================================================
            2. TOP METRIC CARDS
            Description: At-a-glance statistics for fleet, schedule, and ledger
            Style: Sharp cards (rounded-none), prominent padding (p-8), static
            ============================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-white border border-gray-300 flex items-start justify-between">
            <div>
              <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Active Fleet Units
              </span>
              <p className="text-3xl sm:text-4xl font-black text-gray-900">{activeFleetCount} Units</p>
              <p className="text-sm text-gray-500 mt-2">Across {activeProvidersCount} municipal depots</p>
            </div>
            <Link 
              href="/marketplace" 
              className="w-14 h-14 bg-gray-50 text-[#005426] flex items-center justify-center border border-gray-200" 
              title="Browse Equipment Marketplace"
            >
              <Tractor className="w-7 h-7" />
            </Link>
          </div>

          <div className="p-8 bg-white border border-gray-300 flex items-start justify-between">
            <div>
              <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Scheduled / Dispatched
              </span>
              <p className="text-3xl sm:text-4xl font-black text-gray-900">
                {requestsList.filter(r => r.status === 'scheduled' || r.status === 'dispatched' || r.status === 'in_progress').length} Requests
              </p>
              <p className="text-sm text-gray-500 mt-2">Reserved dates & en-route operators</p>
            </div>
            <div className="w-14 h-14 bg-gray-50 text-amber-700 flex items-center justify-center border border-gray-200">
              <Calendar className="w-7 h-7" />
            </div>
          </div>

          <div className="p-8 bg-white border border-gray-300 flex items-start justify-between">
            <div>
              <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Co-op Sacco Ledger
              </span>
              <p className="text-3xl sm:text-4xl font-black text-gray-900">ST-2026</p>
              <p className="text-sm text-[#005426] mt-2 font-bold flex items-center gap-1">
                <span>Scale Ticket Ready</span>
                <ArrowUpRight className="w-4 h-4" />
              </p>
            </div>
            <Link 
              href="/sacco-receipt" 
              className="w-14 h-14 bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200" 
              title="Open Scale Ticket & Passbook Ledger"
            >
              <FileText className="w-7 h-7" />
            </Link>
          </div>
        </div>

        {/* ============================================================================
            PATALASTAS NG BARANGGAY (ANNOUNCEMENTS)
            ============================================================================ */}
        {announcements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <Radio className="w-6 h-6 text-[#005426]" />
              <span>Patalastas ng {session?.user?.baranggay || 'Baranggay'}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((ann, idx) => (
                <div key={ann.id || idx} className="bg-amber-50 border-l-4 border-amber-500 p-6">
                  <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Admin Announcement • {new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{ann.title}</h3>
                  <p className="text-sm text-gray-700">{ann.content}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
                    <UserCheck className="w-4 h-4" />
                    <span>Posted by {ann.author?.name || 'Admin'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================
            3. SECTION HEADER & FILTER TABS
            Description: Controls for filtering the requests list
            Style: Flat tabs, large text
            ============================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b-2 border-gray-200 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Tractor className="w-6 h-6 text-[#005426]" />
              <span>My Equipment Requests</span>
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Track submitted machinery requests, provider contacts, hectare rates, and scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'dispatched', label: 'En Route' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4 py-2 text-sm font-bold border-2 transition-none cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-[#005426] text-white border-[#005426]'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================================
            4. REQUESTS CARDS LIST
            Description: Lists out individual machinery requests (empty state & populated)
            Style: Sharp cards, no shadows, static hover
            ============================================================================ */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-300 px-8">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Tractor className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-gray-700">No requests match the selected filter.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-6 py-3 bg-[#005426] text-white text-sm font-bold cursor-pointer"
            >
              Request Farm Machinery
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-8 border border-gray-300 flex flex-col lg:flex-row justify-between gap-8"
              >
                {/* Left info: Machinery & Driver Details */}
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-emerald-50 text-[#005426] flex items-center justify-center shrink-0 border border-emerald-200">
                    <Tractor className="w-8 h-8" />
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-gray-900">{req.machineName}</h3>
                      <span className={`px-3 py-1 text-xs font-bold border ${req.statusBadge}`}>
                        {req.statusLabel}
                      </span>
                    </div>

                    {/* Assigned Driver Box */}
                    <div className="p-4 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-xl">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <UserCheck className="w-5 h-5 text-amber-700" />
                          <span><strong>Assigned Driver:</strong> {req.driverName}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-7">{req.driverRating} • {req.depot}</p>
                      </div>

                      <a
                        href={`tel:${req.driverPhone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#005426] text-white text-sm font-bold self-start sm:self-auto whitespace-nowrap cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Call Driver</span>
                      </a>
                    </div>

                    {/* Field & Parcel Specifics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 pt-2">
                      <p className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-gray-200 pb-2 sm:pb-0 pr-4">
                        <MapPin className="w-4 h-4 text-[#005426] shrink-0" />
                        <span className="truncate"><strong>Parcel:</strong> {req.parcel}</span>
                      </p>
                      <p className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-gray-200 pb-2 sm:pb-0 px-4">
                        <Ruler className="w-4 h-4 text-[#005426] shrink-0" />
                        <span><strong>Area:</strong> {req.hectares} Ha</span>
                      </p>
                      <p className="flex items-center gap-2 pl-0 sm:pl-4">
                        <Calendar className="w-4 h-4 text-[#005426] shrink-0" />
                        <span><strong>Target:</strong> {req.date}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right info: Financial Rate & Field Ticket Link */}
                <div className="flex flex-col justify-between lg:items-end border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-8 shrink-0 gap-4">
                  <div>
                    <span className="text-xs font-mono text-gray-500 uppercase block lg:text-right font-bold">
                      Estimated Custom Rate
                    </span>
                    <p className="text-3xl font-black text-[#005426] font-mono lg:text-right">{req.estimatedRate}</p>
                    <span className="text-sm text-amber-800 font-bold block lg:text-right mt-1">{req.settlementType}</span>
                    <span className="text-xs text-gray-500 block lg:text-right mt-1">{req.fuelAllocation}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={req.dispatchSlipUrl}
                      className="px-6 py-3 bg-white border-2 border-gray-300 text-sm font-bold text-gray-900 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Job Ticket Slip</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================================
            5. EMERGENCY SOS BROADCAST CARD
            Description: High priority alert card for field emergencies
            ============================================================================ */}
        <div id="sos" className="mt-12 p-8 bg-white border-l-8 border-red-600 shadow-none scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <Siren className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-gray-900">Emergency Field Mechanic SOS</h3>
                  <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    24/7 Mobile Dispatch
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                  Combine harvester belt rupture, tractor stuck in deep mud, or hydraulic failure during harvest?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
              <a
                href="tel:09190000002"
                className="px-6 py-3 bg-white border-2 border-red-600 text-sm font-bold text-red-700 flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 text-red-600" />
                <span>Hotline: 0919-000-0002</span>
              </a>
              <button
                type="button"
                onClick={() => setIsSosModalOpen(true)}
                className="px-6 py-3 bg-red-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Broadcast SOS Alert</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Quick Request Farm Machinery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#DDE3DA] shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE3DA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#005426] text-white flex items-center justify-center shadow-xs">
                  <Tractor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-950">Request Farm Machinery</h3>
                  <p className="text-xs text-gray-500">Direct Municipal Depot & Driver Dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#005426] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-gray-950">Machinery Request Queued!</h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Your request has been filed with the cooperative depot. The assigned driver will contact you prior to field arrival.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                    User ID / RSBSA Member ID
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerUserId}
                    onChange={(e) => setFarmerUserId(formatRegistryId(e.target.value, 'farmer'))}
                    placeholder="e.g., farmer-0-0-F0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] bg-white text-xs sm:text-sm font-bold text-gray-900 font-mono focus:border-[#005426] focus:outline-none"
                  />
                </div>

                {/* Smart Search Selection for Farm Machinery */}
                <div>
                  <SmartSearchSelect
                    label="Select Farm Machinery"
                    options={MACHINERY_CATALOG_PRESETS}
                    value={selectedMachine}
                    onChange={(val) => setSelectedMachine(val)}
                    placeholder="Search and choose machinery..."
                    searchPlaceholder="Search by model, brand, or implement..."
                    icon="agriculture"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                      Hectares (Ha)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="50"
                      required
                      value={hectares}
                      onChange={(e) => setHectares(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] text-xs sm:text-sm font-bold text-gray-900 focus:border-[#005426] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                      Target Schedule Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] text-xs sm:text-sm font-bold text-gray-900 focus:border-[#005426] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Smart Search Selection for Barangay Sector */}
                <div>
                  <SmartSearchSelect
                    label="Barangay Sector / Parcel Location"
                    options={[
                      { value: 'Purok 1, Central Rice Terraces', label: 'Purok 1, Central Rice Terraces', subtitle: 'Brgy. San Manuel, Tagum City', icon: 'location_on' },
                      { value: 'Purok 2 (Sitio Balite)', label: 'Purok 2 (Sitio Balite)', subtitle: 'Field Dike Lateral 3, Tagum City', icon: 'location_on' },
                      { value: 'Purok 3, Riverside Lateral', label: 'Purok 3, Riverside Lateral', subtitle: 'Brgy. Pagsabangan Irrigation Canal', icon: 'location_on' },
                      { value: 'Purok 4, Mankilam Lowland', label: 'Purok 4, Mankilam Lowland', subtitle: 'Brgy. Mankilam Soft Clay Basin', icon: 'location_on' },
                      { value: 'Purok 5, North Ridge Bio-Parcel', label: 'Purok 5, North Ridge Bio-Parcel', subtitle: 'Certified Organic Rice Block', icon: 'location_on' },
                      { value: 'Purok 6, Sitio Malasin', label: 'Purok 6, Sitio Malasin', subtitle: 'Panabo City Agrarian Agriland', icon: 'location_on' }
                    ]}
                    value={parcelSector}
                    onChange={(val) => setParcelSector(val)}
                    placeholder="Search or enter location..."
                    searchPlaceholder="Search barangay, purok, or sitio..."
                    icon="location_on"
                    allowCustom={true}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                    Contact Phone (For Driver Call)
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] text-xs sm:text-sm font-bold text-gray-900 focus:border-[#005426] focus:outline-none font-mono"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Estimated Custom Fee:</span>
                    <span className="text-[#005426] font-mono text-sm">₱{(hectares * 2800).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    *Settled via <strong>Cash-on-Dike</strong> directly with operator upon completion or charged to SACCO Passbook.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#005426] hover:bg-[#004720] text-white text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Send to Depot</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. Emergency SOS Breakdown Broadcast Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-red-300 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE3DA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/25">
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-950">Broadcast Field Breakdown SOS</h3>
                  <p className="text-xs text-gray-500">Direct Alert to Mobile Repair Van & TESDA Technicians</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSosModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sosSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-gray-950">Emergency SOS Dispatched!</h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Alert sent to Mobile Van #2 (Field Mechanic #889). The technician will call your mobile number directly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBroadcastSos} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                    Stalled Machine
                  </label>
                  <input
                    type="text"
                    required
                    value={sosMachine}
                    onChange={(e) => setSosMachine(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] bg-white text-xs sm:text-sm font-bold text-gray-900 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                    Breakdown / Failure Description
                  </label>
                  <input
                    type="text"
                    required
                    value={sosIssue}
                    onChange={(e) => setSosIssue(e.target.value)}
                    placeholder="e.g., Threshing drum jammed, broken V-belt, stuck in deep mud"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] bg-white text-xs sm:text-sm font-bold text-gray-900 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                    Field Location / Dike Sector
                  </label>
                  <input
                    type="text"
                    required
                    value={sosParcel}
                    onChange={(e) => setSosParcel(e.target.value)}
                    placeholder="e.g., Sitio Balite, Lateral 3 Dike"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] bg-white text-xs sm:text-sm font-bold text-gray-900 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={sosPhone}
                    onChange={(e) => setSosPhone(e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DA] bg-white text-xs sm:text-sm font-bold text-gray-900 focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSosModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Send Urgent SOS</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* My RSBSA Farmer ID Card Modal */}
      {isIdCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-[#DDE3DA] flex flex-col gap-5 my-8 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDE3DA] pb-3.5 no-print">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#005426] flex items-center justify-center shrink-0 border border-emerald-100">
                  <IdCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-950">
                    My Official RSBSA Farmer ID Card
                  </h3>
                  <p className="text-xs text-gray-500">
                  Upload official 2x2 photo(Limit: 5MB) and print for field & dike transactions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIdCardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <FarmerIDCard
              farmer={session?.user}
              farmerName={session?.user?.name || 'Farmer Member'}
              rsbsaId={session?.user?.registryId || getRoleTemplate('farmer')}
              customData={{
                coopName: 'San Manuel Agrarian Beneficiaries Co-op (SMABC)',
                barangay: 'Brgy. San Manuel, Tagum City',
                farmType: 'Lowland Irrigated Palay (Rice)',
                hectares: '2.5 Ha',
                validUntil: 'DEC 2028'
              }}
              allowUpload={true}
            />
          </div>
        </div>
      )}

    </div>
  )
}

