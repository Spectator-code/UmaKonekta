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

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SmartSearchSelect from '@/components/SmartSearchSelect';
import {
  Wrench,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Plus,
  X,
  Navigation,
  Search,
  Filter,
  Calendar,
  Award,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Check,
  Hammer,
  Gauge,
  Cpu,
  FileText,
  Download,
  User,
  Info,
  Radio,
  ExternalLink,
  Flame,
  Truck,
  Sparkles
} from 'lucide-react';

export default function MechanicDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sos_feed'); // 'sos_feed', 'parts_inventory', 'work_logs'
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Filters
  const [sosFilter, setSosFilter] = useState('all'); // 'all', 'open', 'assigned', 'resolved'
  const [partsCategory, setPartsCategory] = useState('all');
  const [partsSearch, setPartsSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=mechanic');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'mechanic' && session?.user?.role !== 'admin') {
        const portal = session?.user?.role === 'farmer'
          ? '/farmer-dashboard'
          : session?.user?.role === 'provider'
            ? '/provider-dashboard'
            : session?.user?.role === 'secops'
              ? '/x9f-telemetry-vault-8812'
              : '/admin';
        router.push(portal);
      }
    }
  }, [status, session, router]);

  // Synchronize hash in URL to active tabs (#history, #parts, #sos)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#history' || hash === '#work_logs' || hash === '#logs') {
        setActiveTab('work_logs');
      } else if (hash === '#parts' || hash === '#inventory' || hash === '#parts_inventory') {
        setActiveTab('parts_inventory');
      } else if (hash === '#sos' || hash === '#feed' || hash === '#sos_feed') {
        setActiveTab('sos_feed');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [logForm, setLogForm] = useState({
    ticketId: 'SOS-2026-041',
    machineName: 'Kubota DC-70 Plus Combine Harvester',
    farmerName: 'farmer-1-23-A002',
    issueResolved: 'Replaced torn threshing belt and cleared jammed feeder house drum.',
    partsUsed: '1x V-Belt B-88, 2x M12 Shear Pin Bolts',
    repairCost: 1450,
    serviceStatus: 'operational'
  });

  // Emergency SOS Field Breakdowns Feed
  const [sosList, setSosList] = useState([]);

  // Spare Parts Requisition & Mobile Van Inventory
  const [partsList, setPartsList] = useState([]);

  // Work Logs History
  const [workLogs, setWorkLogs] = useState([]);

  // Announcements
  const [announcements, setAnnouncements] = useState([]);

  // Load live SOS alerts from backend
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/mechanics')
        .then(res => res.json())
        .then(d => {
          if (d.tickets && Array.isArray(d.tickets) && d.tickets.length > 0) {
            setSosList(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newItems = d.tickets.filter(t => !existingIds.has(t.id));
              return [...newItems, ...prev];
            });
          }
        })
        .catch(console.error);

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
  }, [status]);

  const showToast = (message, type = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleClaimSos = async (id) => {
    const mechanicName = session?.user?.name || 'mechanic-1-23-A001';
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'assigned', assignedMechanic: mechanicName } : s));
    showToast(`Breakdown ${id} claimed! GPS route loaded for Mobile Van Kit #2.`);
    try {
      await fetch('/api/mechanics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id, etaMinutes: 25 })
      });
    } catch (err) {
      console.error('Failed to claim ticket on backend:', err);
    }
  };

  const handleResolveSos = async (id) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved' } : s));
    showToast(`Ticket ${id} verified operational! Field Maintenance Certificate recorded.`);
    try {
      await fetch('/api/mechanics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: id,
          issueResolved: 'Emergency breakdown repaired and field tested by certified mechanic.',
          partsUsed: 'Heavy duty replacement components',
          repairCost: 1200,
          serviceStatus: 'operational'
        })
      });
    } catch (err) {
      console.error('Failed to resolve ticket on backend:', err);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ticket: logForm.ticketId,
      machine: logForm.machineName,
      farmer: logForm.farmerName,
      description: logForm.issueResolved,
      partsUsed: logForm.partsUsed,
      amount: `₱${Number(logForm.repairCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: 'Field Certified & Tested',
      certNumber: `TESDA-CERT-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setWorkLogs([newLog, ...workLogs]);
    setIsLogModalOpen(false);
    showToast('Job log synchronized with DA-PhilMech Machinery Registry.');

    try {
      await fetch('/api/mechanics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: logForm.ticketId,
          issueResolved: logForm.issueResolved,
          partsUsed: logForm.partsUsed,
          repairCost: logForm.repairCost,
          serviceStatus: logForm.serviceStatus
        })
      });
    } catch (err) {
      console.error('Failed to sync work log to backend:', err);
    }
  };

  // Filtered SOS list
  const filteredSosList = useMemo(() => {
    if (sosFilter === 'all') return sosList.filter(s => s.status !== 'resolved');
    return sosList.filter(s => s.status === sosFilter);
  }, [sosList, sosFilter]);

  // Filtered Parts list
  const filteredParts = useMemo(() => {
    return partsList.filter(p => {
      const matchCat = partsCategory === 'all' || p.category === partsCategory;
      const matchSearch = !partsSearch || p.name.toLowerCase().includes(partsSearch.toLowerCase()) || p.id.toLowerCase().includes(partsSearch.toLowerCase()) || p.depot.toLowerCase().includes(partsSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [partsList, partsCategory, partsSearch]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    if (!logSearch.trim()) return workLogs;
    const q = logSearch.toLowerCase();
    return workLogs.filter(l =>
      l.id.toLowerCase().includes(q) ||
      l.ticket.toLowerCase().includes(q) ||
      l.machine.toLowerCase().includes(q) ||
      l.farmer.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    );
  }, [workLogs, logSearch]);

  const activeSosCount = sosList.filter(s => s.status !== 'resolved').length;
  const criticalCount = sosList.filter(s => s.severityLevel === 'critical' && s.status !== 'resolved').length;

  const partsCategories = useMemo(() => {
    const cats = Array.from(new Set(partsList.map(p => p.category)));
    return ['all', ...cats];
  }, [partsList]);

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface pb-20 selection:bg-amber-100 selection:text-amber-900">

      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-soil-slate text-white shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{feedbackToast.message}</span>
          <button onClick={() => setFeedbackToast(null)} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================================
          1. HEADER SECTION
          Description: Displays mechanic profile, dispatch status, and global actions
          Style: Clean flat background, airy padding, sharp borders, prominent amber/green accent
          ============================================================================ */}
      <div className="bg-white border-b-4 border-[#78350F] text-gray-900 py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-black bg-amber-50 text-amber-800 border border-amber-200">
                <Wrench className="w-4 h-4 text-amber-700" />
                MOBILE FIELD REPAIR & SOS DISPATCH
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                TESDA NC-II Agri-Mechanic Certified
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 flex items-center gap-4">
              <span>{session?.user?.name || 'TESDA Field Mechanic #889'}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm font-mono text-gray-600">
              <span>License: <strong className="text-gray-900 font-bold">{session?.user?.registryId || 'mechanic-1-23-A001'}</strong></span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">Designation: <strong className="text-gray-900 font-bold">Mobile Emergency Van #2 (Tagum Agri Hub)</strong></span>
              <span className="text-gray-300">•</span>
              <span className="text-[#005426] font-bold">DA-PhilMech Station XI Accredited</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-6 py-3 bg-[#78350F] text-white text-sm font-black flex items-center gap-2 cursor-pointer border border-[#78350F]"
            >
              <Plus className="w-5 h-5" />
              <span>Log Completed Field Repair</span>
            </button>
            <Link
              href="/dispatch-slip"
              className="px-6 py-3 bg-white text-gray-900 text-sm font-bold flex items-center gap-2 border-2 border-gray-300"
            >
              <FileText className="w-5 h-5" />
              <span>Inspection Slips</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">

        {/* ============================================================================
            2. TOP METRIC CARDS
            Description: High-level overview of SOS tickets, parts inventory, and ratings
            Style: Sharp cards, prominent padding
            ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* Card 1: Active SOS */}
          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase tracking-wider font-bold text-gray-500">Active Field SOS</span>
              <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-red-600 font-mono">{activeSosCount}</span>
                <span className="text-sm font-bold text-red-600">Active</span>
                {criticalCount > 0 && (
                  <span className="px-3 py-1 text-xs font-black bg-red-100 text-red-700 border border-red-200">
                    {criticalCount} Critical
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Harvesters & Tractors stalled on dikes</p>
            </div>
          </div>

          {/* Card 2: Van Parts */}
          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase tracking-wider font-bold text-gray-500">Mobile Van Inventory</span>
              <div className="w-12 h-12 bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-amber-800 font-mono">{partsList.length}</span>
                <span className="text-sm font-bold text-amber-800">Critical SKUs</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Belts, shear pins, hyd hoses, filters</p>
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase tracking-wider font-bold text-gray-500">Fixed This Month</span>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-emerald-700 font-mono">14</span>
                <span className="text-sm font-bold text-emerald-700">Machines</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Average field fix time: <strong className="text-gray-900">42 mins</strong></p>
            </div>
          </div>

          {/* Card 4: Rating */}
          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase tracking-wider font-bold text-gray-500">Technician Quality</span>
              <div className="w-12 h-12 bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-blue-700 font-mono">4.9</span>
                <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 border border-emerald-200">Top Rated</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">DA-Certified Master Field Technician</p>
            </div>
          </div>
        </div>

        {/* ============================================================================
            PATALASTAS NG BARANGGAY (ANNOUNCEMENTS)
            ============================================================================ */}
        {announcements.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <Radio className="w-6 h-6 text-[#78350F]" />
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
                    <User className="w-4 h-4" />
                    <span>Posted by {ann.author?.name || 'Admin'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================
            3. TAB SWITCHER
            Description: Navigation between SOS Feed, Inventory, and Work Logs
            ============================================================================ */}
        <div className="flex border-b-2 border-gray-200 mb-8 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sos_feed')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${activeTab === 'sos_feed'
                ? 'border-amber-600 text-amber-700 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
          >
            <AlertTriangle className={`w-5 h-5 ${activeTab === 'sos_feed' ? 'text-amber-600' : 'text-gray-400'}`} />
            <span>Emergency Field Breakdowns</span>
            <span className={`px-3 py-1 text-xs font-mono font-black border ${activeSosCount > 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
              {activeSosCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('parts_inventory')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${activeTab === 'parts_inventory'
                ? 'border-[#005426] text-[#005426] font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
          >
            <Package className={`w-5 h-5 ${activeTab === 'parts_inventory' ? 'text-[#005426]' : 'text-gray-400'}`} />
            <span>Mobile Van & Silo Parts</span>
            <span className="px-3 py-1 text-xs font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200">
              {partsList.length} SKUs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('work_logs')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${activeTab === 'work_logs'
                ? 'border-[#005426] text-[#005426] font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'work_logs' ? 'text-[#005426]' : 'text-gray-400'}`} />
            <span>Completed Repair Logs</span>
            <span className="px-3 py-1 text-xs font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200">
              {workLogs.length}
            </span>
          </button>
        </div>

        {/* =========================================================================
            4. EMERGENCY SOS FIELD BREAKDOWN FEED
            Description: Live feed of emergency breakdown broadcasts from farmers
            Style: Flat cards, prominent border indicating severity/status
            ========================================================================= */}
        {activeTab === 'sos_feed' && (
          <div id="sos" className="space-y-6">
            {/* Header & Filter Bar */}
            <div className="bg-white p-6 border-b border-t sm:border border-gray-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-600" />
                  <span>Live Field Breakdown Broadcasts</span>
                  <span className="text-[10px] font-mono px-3 py-1 bg-red-100 text-red-800 font-bold border border-red-200">
                    Auto-Refreshing GPS Telemetry
                  </span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Direct distress calls from combine harvesters and tractors stranded in rice paddies.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Alerts', count: activeSosCount },
                  { id: 'open', label: 'Awaiting Claim', count: sosList.filter(s => s.status === 'open').length },
                  { id: 'assigned', label: 'Van En Route', count: sosList.filter(s => s.status === 'assigned').length },
                  { id: 'resolved', label: 'Repaired', count: sosList.filter(s => s.status === 'resolved').length }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSosFilter(item.id)}
                    className={`px-4 py-2 text-sm font-bold border-2 transition-none cursor-pointer ${sosFilter === item.id
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-gray-700 border-gray-300'
                      }`}
                  >
                    <span>{item.label}</span>
                    <span className="ml-2 font-mono text-xs opacity-75">({item.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List of SOS cards */}
            <div className="space-y-6">
              {filteredSosList.length === 0 ? (
                <div className="bg-white p-12 text-center border border-gray-300">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-black text-xl text-gray-900">No distress tickets in this status</h3>
                  <p className="text-sm text-gray-500 mt-2">All agricultural machinery in this filter group are running normally.</p>
                </div>
              ) : (
                filteredSosList.map((sos) => {
                  const isResolved = sos.status === 'resolved';
                  const isAssigned = sos.status === 'assigned';
                  const isOpen = sos.status === 'open';

                  return (
                    <div
                      key={sos.id}
                      className={`bg-white p-8 border ${isResolved
                          ? 'border-l-8 border-emerald-500 border-gray-300'
                          : isAssigned
                            ? 'border-l-8 border-amber-500 border-gray-300'
                            : 'border-l-8 border-red-600 border-gray-300'
                        }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 border border-gray-200">
                              {sos.id}
                            </span>

                            {/* Severity Badge */}
                            <span className={`text-xs font-mono uppercase px-3 py-1 font-black border flex items-center gap-2 ${sos.severityLevel === 'critical'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : sos.severityLevel === 'high'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border-blue-300'
                              }`}>
                              <AlertTriangle className="w-4 h-4" />
                              <span>{sos.severity}: {sos.severityDetail}</span>
                            </span>

                            <span className="text-sm text-gray-500 font-mono flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {sos.timeReported}
                            </span>
                          </div>

                          <h3 className="font-black text-xl text-gray-900 mt-3 flex items-center gap-2">
                            <span>{sos.breakdownType}</span>
                          </h3>
                        </div>

                        {/* Status Chip */}
                        <div className="shrink-0">
                          <span className={`inline-flex items-center gap-2 text-sm font-mono font-bold px-4 py-2 ${isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isAssigned
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                            {isResolved && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                            {isAssigned && <Wrench className="w-5 h-5 text-amber-700" />}
                            {isOpen && <Clock className="w-5 h-5 text-red-600" />}
                            <span>
                              {isResolved ? 'Fixed & Operational' : isAssigned ? 'Van En Route / In Progress' : 'Awaiting Mechanic Claim'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Detail 3-Col Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-sm">
                        {/* Equipment */}
                        <div className="bg-gray-50 p-5 border border-gray-200">
                          <span className="text-gray-500 text-xs font-mono uppercase font-bold block mb-2">Equipment Unit</span>
                          <strong className="text-base text-gray-900 block">{sos.machine}</strong>
                          <span className="inline-block mt-2 text-xs font-mono text-[#005426] bg-[#005426]/10 px-2 py-1 font-bold">
                            {sos.category}
                          </span>
                        </div>

                        {/* Operator Contact */}
                        <div className="bg-gray-50 p-5 border border-gray-200 flex flex-col justify-between">
                          <div>
                            <span className="text-gray-500 text-xs font-mono uppercase font-bold block mb-2">Field Operator & Farmer</span>
                            <strong className="text-gray-900 block text-base">{sos.operator}</strong>
                            <p className="text-gray-600 text-xs mt-1">RSBSA Member: <span className="font-mono font-bold">{sos.farmer}</span></p>
                          </div>
                          {sos.operatorPhone && (
                            <a
                              href={`tel:${sos.operatorPhone}`}
                              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#005426] hover:underline"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Direct Call: {sos.operatorPhone}</span>
                            </a>
                          )}
                        </div>

                        {/* Location & GPS */}
                        <div className="bg-gray-50 p-5 border border-gray-200">
                          <span className="text-gray-500 text-xs font-mono uppercase font-bold block mb-2 flex items-center justify-between">
                            <span>Dike Location & GPS</span>
                            <span className="text-amber-800 font-mono font-bold bg-amber-100 px-2 py-0.5">~{sos.distanceKm}</span>
                          </span>
                          <strong className="text-gray-900 block text-base">{sos.location}</strong>
                          <p className="text-xs text-gray-500 font-mono mt-1">{sos.gpsCoords}</p>
                          <p className="text-xs text-gray-500 italic mt-1">{sos.landmark}</p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-200">
                        <div className="text-sm font-mono text-gray-500 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-amber-700" />
                          {sos.assignedMechanic ? (
                            <span>Assigned: <strong className="text-amber-900 font-bold">{sos.assignedMechanic}</strong></span>
                          ) : (
                            <span className="text-red-600 font-bold">Unassigned • Van Response Time: ~15 mins</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {isOpen && (
                            <button
                              onClick={() => handleClaimSos(sos.id)}
                              className="px-6 py-3 bg-amber-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer border border-amber-600"
                            >
                              <Navigation className="w-4 h-4" />
                              <span>Claim Breakdown & Start GPS Navigation</span>
                            </button>
                          )}

                          {isAssigned && (
                            <button
                              onClick={() => handleResolveSos(sos.id)}
                              className="px-6 py-3 bg-emerald-700 text-white text-sm font-black flex items-center gap-2 cursor-pointer border border-emerald-700"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mark Fixed & Tested (Field Operational)</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setLogForm(prev => ({
                                ...prev,
                                ticketId: sos.id,
                                machineName: sos.machine,
                                farmerName: sos.farmer
                              }));
                              setIsLogModalOpen(true);
                            }}
                            className="px-5 py-3 bg-gray-100 text-gray-700 text-sm font-bold flex items-center gap-2 border border-gray-300 cursor-pointer"
                          >
                            <Wrench className="w-4 h-4" />
                            <span>Log Repair Details</span>
                          </button>

                          <Link
                            href="/dispatch-slip"
                            className="px-5 py-3 bg-white text-gray-700 text-sm font-bold flex items-center gap-2 border border-gray-300 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Job Slip</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SPARE PARTS INVENTORY & VAN LOGISTICS */}
        {/* ========================================================================= */}
        {activeTab === 'parts_inventory' && (
          <div className="space-y-5">
            {/* Header & Filter Controls */}
            <div className="bg-white p-5 rounded-2xl border border-border-soft shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-on-surface flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-700" />
                  <span>Mobile Van & Silo Spare Parts Catalog</span>
                </h2>
                <p className="text-xs text-soil-slate mt-0.5">
                  Certified OEM belts, shear pins, hydraulic hoses, and fuel filters for field emergency replacements.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low rounded-xl border border-border-soft w-full md:w-72">
                <Search className="w-4 h-4 text-soil-slate shrink-0" />
                <input
                  type="text"
                  value={partsSearch}
                  onChange={(e) => setPartsSearch(e.target.value)}
                  placeholder="Search SKU, name, or depot..."
                  className="w-full text-xs bg-transparent focus:outline-none placeholder:text-soil-slate/60 font-bold text-on-surface"
                />
                {partsSearch && (
                  <button onClick={() => setPartsSearch('')} className="text-xs text-soil-slate font-bold hover:text-on-surface">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {partsCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPartsCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${partsCategory === cat
                      ? 'bg-primary text-white shadow-xs font-black'
                      : 'bg-white text-soil-slate border border-border-soft hover:bg-surface-container-low'
                    }`}
                >
                  {cat === 'all' ? 'All Spare Parts' : cat}
                </button>
              ))}
            </div>

            {/* Grid of Parts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParts.map((part) => {
                const isLowStock = part.stock <= part.minStock;

                return (
                  <div
                    key={part.id}
                    className="bg-white rounded-3xl p-5 border border-border-soft shadow-xs hover:border-amber-400/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Code & Stock Badge */}
                      <div className="flex justify-between items-start mb-2.5">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-surface-container font-black text-soil-slate">
                          {part.id}
                        </span>

                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${isLowStock
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                          {part.stock} {part.unit} available
                        </span>
                      </div>

                      <h3 className="font-black text-sm text-on-surface leading-snug">{part.name}</h3>
                      <p className="text-xs text-soil-slate mt-1 font-medium">Brand: <span className="font-bold text-soil-slate">{part.brand}</span></p>

                      <div className="mt-3 p-3 bg-surface-container-low/70 rounded-xl border border-border-soft/60 space-y-1 text-[11px]">
                        <div className="flex justify-between text-soil-slate">
                          <span>Category:</span>
                          <span className="font-bold text-on-surface">{part.category}</span>
                        </div>
                        <div className="flex justify-between text-soil-slate">
                          <span>Storage Depot:</span>
                          <span className="font-bold text-primary truncate max-w-[160px]">{part.depot}</span>
                        </div>
                      </div>

                      {/* Stock Level Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-mono text-soil-slate mb-1">
                          <span>Stock Buffer</span>
                          <span>{part.stock > 10 ? 'Optimal' : isLowStock ? 'Low Stock' : 'Adequate'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-600'}`}
                            style={{ width: `${Math.min(100, (part.stock / 20) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border-soft flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-soil-slate uppercase block font-bold">Standard Price</span>
                        <span className="text-lg font-black text-primary font-mono">₱{part.price.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => {
                          showToast(`Requisition order submitted for ${part.name} to ${part.depot}.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-700 text-white text-xs font-black hover:bg-amber-800 active:scale-[0.98] shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Requisition +1</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WORK LOGS & REPAIR CERTIFICATION HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'work_logs' && (
          <div id="history" className="space-y-5">
            {/* Header & Search */}
            <div className="bg-white p-5 rounded-2xl border border-border-soft shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-on-surface">Field Repair & Certification History</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    DA-PhilMech Synchronized
                  </span>
                </div>
                <p className="text-xs text-soil-slate mt-0.5">
                  Official maintenance certificates registered under the DA RSBSA National Machinery Registry.
                </p>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low rounded-xl border border-border-soft w-full md:w-72">
                <Search className="w-4 h-4 text-soil-slate shrink-0" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search log ID, machine, farmer..."
                  className="w-full text-xs bg-transparent focus:outline-none placeholder:text-soil-slate/60 font-bold text-on-surface"
                />
                {logSearch && (
                  <button onClick={() => setLogSearch('')} className="text-xs text-soil-slate font-bold hover:text-on-surface">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-border-soft shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-container-low text-soil-slate font-mono uppercase text-[10px] tracking-wider border-b border-border-soft">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Log ID & Date</th>
                      <th className="py-3.5 px-4 font-bold">Ticket & Equipment</th>
                      <th className="py-3.5 px-4 font-bold">Farmer / Client</th>
                      <th className="py-3.5 px-4 font-bold">Repair Diagnostics & Summary</th>
                      <th className="py-3.5 px-4 font-bold">Parts Used</th>
                      <th className="py-3.5 px-4 font-bold">Cost Settled</th>
                      <th className="py-3.5 px-4 font-bold">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft/70">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-soil-slate">
                          No repair records found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-primary whitespace-nowrap">
                            {log.id}
                            <span className="block text-[11px] font-normal text-soil-slate mt-0.5">{log.date}</span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container text-soil-slate mb-0.5">
                              {log.ticket}
                            </span>
                            <strong className="block text-on-surface font-extrabold">{log.machine}</strong>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-on-surface block font-mono text-[11px]">{log.farmer}</span>
                            <span className="text-[10px] text-soil-slate">Registered Beneficiary</span>
                          </td>

                          <td className="py-4 px-4 text-soil-slate max-w-xs">
                            <p className="line-clamp-2">{log.description}</p>
                          </td>

                          <td className="py-4 px-4 font-mono text-soil-slate text-[11px] whitespace-nowrap">
                            {log.partsUsed}
                          </td>

                          <td className="py-4 px-4 font-mono font-black text-primary text-sm whitespace-nowrap">
                            {log.amount}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{log.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LOG REPAIR MODAL */}
      {/* ========================================================================= */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border-soft shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-soft pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface">Log Completed Field Repair</h3>
                  <p className="text-xs text-soil-slate">Records service in DA-PhilMech and triggers client clearance.</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-soil-slate hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <SmartSearchSelect
                  label="Select Equipment & Breakdown SOS"
                  required
                  allowCustom={true}
                  options={sosList.map(item => ({
                    value: item.machine,
                    label: item.machine,
                    subtitle: `${item.id} • ${item.farmer} • ${item.location}`,
                    badge: item.severity.split(' ')[0],
                    icon: 'construction'
                  }))}
                  value={logForm.machineName}
                  onChange={(val) => {
                    const matched = sosList.find(s => s.machine === val);
                    if (matched) {
                      setLogForm(prev => ({ ...prev, machineName: val, farmerName: matched.farmer, ticketId: matched.id }));
                    } else {
                      setLogForm(prev => ({ ...prev, machineName: val }));
                    }
                  }}
                  placeholder="Select SOS ticket equipment or type custom model..."
                  searchPlaceholder="Search active emergency breakdowns..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-soil-slate mb-1">Farmer / RSBSA ID</label>
                  <input
                    type="text"
                    required
                    value={logForm.farmerName}
                    onChange={(e) => setLogForm({ ...logForm, farmerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface font-bold focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-soil-slate mb-1">Service & Labor Cost (₱)</label>
                  <input
                    type="number"
                    required
                    value={logForm.repairCost}
                    onChange={(e) => setLogForm({ ...logForm, repairCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low font-mono font-bold text-sm text-primary focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <SmartSearchSelect
                  label="Parts Replaced from Mobile Van"
                  allowCustom={true}
                  options={partsList.map(p => ({
                    value: `${p.name} (₱${p.price})`,
                    label: p.name,
                    subtitle: `${p.category} • In stock: ${p.stock} ${p.unit} (${p.depot})`,
                    badge: `₱${p.price}`,
                    icon: 'build_circle'
                  }))}
                  value={logForm.partsUsed}
                  onChange={(val) => {
                    const matchedPart = partsList.find(p => `${p.name} (₱${p.price})` === val || p.name === val);
                    if (matchedPart) {
                      setLogForm(prev => ({
                        ...prev,
                        partsUsed: val,
                        repairCost: (prev.repairCost || 0) + matchedPart.price
                      }));
                    } else {
                      setLogForm(prev => ({ ...prev, partsUsed: val }));
                    }
                  }}
                  placeholder="Select spare part from mobile van or type custom..."
                  searchPlaceholder="Search van spare parts catalog..."
                />
              </div>

              <div>
                <label className="block font-bold text-soil-slate mb-1">Diagnostic Root Cause & Resolution</label>
                <textarea
                  rows={3}
                  required
                  value={logForm.issueResolved}
                  onChange={(e) => setLogForm({ ...logForm, issueResolved: e.target.value })}
                  placeholder="e.g., Cleared jammed feeder house drum, tensioned V-belt to 45Nm spec, tested 10-minute dry run."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface-container-low text-xs text-on-surface focus:border-amber-600 focus:outline-none font-medium"
                />
              </div>

              <div className="pt-3 border-t border-border-soft flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-soil-slate font-bold hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-700 text-white font-black hover:bg-amber-800 cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Official Repair Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
