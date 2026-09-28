'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FarmerIDCard from '@/components/FarmerIDCard';
import BatchFarmerIDGrid from '@/components/BatchFarmerIDGrid';
import SmartSearchSelect from '@/components/SmartSearchSelect';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import {
  formatRegistryId,
  getRoleTemplate,
  MACHINERY_CATEGORIES,
  MACHINERY_CATALOG_PRESETS,
  SETTLEMENT_METHODS,
  BILLING_UNITS,
  FUEL_POLICY_OPTIONS
} from '@/lib/formatters';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Tractor,
  Users,
  FileText,
  Printer,
  Download,
  Plus,
  X,
  Search,
  ChevronRight,
  Filter,
  ExternalLink,
  PlusCircle,
  UserCheck,
  Layers,
  ClipboardCheck,
  UserPlus,
  Grid,
  UserX,
  Loader2,
  Sparkles,
  Phone,
  MapPin,
  Building2,
  Check,
  FileEdit,
  ArrowUpRight,
  Receipt,
  Inbox
} from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Core Data States
  const [farmers, setFarmers] = useState([]);
  const [userStats, setUserStats] = useState({ farmersCount: 0, providersCount: 0, mechanicsCount: 0 });
  const [requests, setRequests] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedBatchFarmerIds, setSelectedBatchFarmerIds] = useState([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminTab, setAdminTab] = useState('requests_hub'); // 'requests_hub', 'farmer_ids', 'fleet_audit', 'dispatch_logs'

  // Request Moderation Filters & State
  const [requestFilterStatus, setRequestFilterStatus] = useState('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedRequestForNote, setSelectedRequestForNote] = useState(null);
  const [auditNoteText, setAuditNoteText] = useState('');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Farmer Registration
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false); // Dual-Tab Intake Modal
  const [intakeTab, setIntakeTab] = useState('farmer_request'); // 'farmer_request', 'provider_asset'

  // Farmer Registration Form State
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newRegistryId, setNewRegistryId] = useState('');
  const [coopName, setCoopName] = useState('San Manuel Agrarian Beneficiaries Co-op (SMABC)');
  const [barangay, setBarangay] = useState('Brgy. San Manuel, Tagum City');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('0917-000-0000');
  const [barangayHotline, setBarangayHotline] = useState('(084) 000-0000 / 0900-000-0000');
  const [depotProviderName, setDepotProviderName] = useState('Tagum FCA Machinery Depot (Operations Head)');
  const [depotProviderPhone, setDepotProviderPhone] = useState('0919-000-0002');
  const [formSuccess, setFormSuccess] = useState(false);
  const [newFarmerPassword, setNewFarmerPassword] = useState('');
  const [newFarmerConfirmPassword, setNewFarmerConfirmPassword] = useState('');
  const [showFarmerPassword, setShowFarmerPassword] = useState(false);
  const [showFarmerConfirmPassword, setShowFarmerConfirmPassword] = useState(false);
  const [farmerFormError, setFarmerFormError] = useState('');
  const [showNumberErrorModal, setShowNumberErrorModal] = useState(false);

  // Dual Intake Form State (Farmer Request)
  const [intakeFarmerId, setIntakeFarmerId] = useState('');
  const [intakeMachineId, setIntakeMachineId] = useState('');
  const [intakeHectares, setIntakeHectares] = useState(2.0);
  const [intakeDate, setIntakeDate] = useState('2026-10-15');
  const [intakeSector, setIntakeSector] = useState('Purok 2 (Sitio Balite)');
  const [intakePhone, setIntakePhone] = useState('0917-000-0001');
  const [intakeSettlement, setIntakeSettlement] = useState('Cash-on-Dike Standard');
  const [intakeInitialStatus, setIntakeInitialStatus] = useState('pending');
  const [intakeNotes, setIntakeNotes] = useState('Assisted desk booking via Municipal Agriculture Office.');
  const [isIntakeSubmitting, setIsIntakeSubmitting] = useState(false);
  const [intakeSuccessMessage, setIntakeSuccessMessage] = useState('');

  // Dual Intake Form State (Provider Equipment Registration)
  const [assetProviderId, setAssetProviderId] = useState('provider-1-23-A001');
  const [assetName, setAssetName] = useState('Kubota DC-70 Plus Combine Harvester');
  const [assetType, setAssetType] = useState('harvester');
  const [assetHorsepower, setAssetHorsepower] = useState('70 HP Turbo');
  const [assetRate, setAssetRate] = useState(2800);
  const [assetUnit, setAssetUnit] = useState('per_ha');
  const [assetLocation, setAssetLocation] = useState('Brgy. San Manuel, Tagum City');
  const [assetFuelTerms, setAssetFuelTerms] = useState('Farmer supplies 18L Diesel/ha');
  const [assetEngineNo, setAssetEngineNo] = useState('V2403-CR-TE4');

  // Municipal Fleet Oversight Static Data (Fallback & Seeded)
  const [fleetAuditList, setFleetAuditList] = useState([
    { id: 'FLT-01', name: 'Kubota DC-70 Plus Combine Harvester', depot: 'Tagum FCA Depot', type: 'Combine Harvester', status: 'Certified & Active', engineNo: 'V2403-CR-TE4', lastInspection: 'Oct 02, 2026', rate: '₱2,800/ha' },
    { id: 'FLT-02', name: 'Yanmar EF494T 4WD Heavy Duty Tractor', depot: 'Apokon Agrarian Co-op', type: '4WD Tractor', status: 'Certified & Active', engineNo: '4TNV88-GGE', lastInspection: 'Oct 05, 2026', rate: '₱2,400/ha' },
    { id: 'FLT-03', name: 'DJI Agras T40 Precision Crop Sprayer', depot: 'Muñoz Precision Center', type: 'Agri Drone', status: 'CAAP Pilot Approved', engineNo: 'T40-SN-8841', lastInspection: 'Oct 08, 2026', rate: '₱950/ha' },
    { id: 'FLT-04', name: 'Buhler 5-Ton Grain Recirculating Dryer', depot: 'Municipal Silo Bodega', type: 'Biomass Batch Dryer', status: 'Calibration Verified', engineNo: 'BHL-DRY-9901', lastInspection: 'Oct 01, 2026', rate: '₱120/sack' }
  ]);

  // Municipal Dispatch Audit Logs
  const [dispatchAuditLogs, setDispatchAuditLogs] = useState([
    { id: 'AUD-991', ticketNo: 'OP-2026-089', farmer: 'Farmer Member #00481', provider: 'Tagum FCA Depot', hectares: 2.4, amount: '₱5,760', settlement: 'Cash-on-Dike Certified', status: 'Settled & Verified' },
    { id: 'AUD-990', ticketNo: 'ST-2026-7712', farmer: 'Farmer Member #00001', provider: 'San Manuel Co-op (SMABC)', hectares: 1.8, amount: '₱116,913', settlement: '8% SACCO Split Validated', status: 'Settled & Verified' },
    { id: 'AUD-989', ticketNo: 'SOS-2026-034', farmer: 'Farmer Member #00122', provider: 'Mobile Van Kit #2 (Field Mechanic #889)', hectares: 3.2, amount: '₱650', settlement: 'TESDA Repair Complete', status: 'Settled & Verified' }
  ]);

  // Initial Auth & Data Load
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=admin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        const portal = session?.user?.role === 'provider'
          ? '/provider-dashboard'
          : session?.user?.role === 'mechanic'
          ? '/mechanic-dashboard'
          : session?.user?.role === 'secops'
          ? '/x9f-telemetry-vault-8812'
          : '/farmer-dashboard';
        router.push(portal);
        return;
      }
      fetchAllData();
    }
  }, [status, session, router]);

  // Synchronize hash in URL to active tabs (#farmers, #requests, #fleet, #logs)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#farmers' || hash === '#farmer_ids') {
        setAdminTab('farmer_ids');
      } else if (hash === '#requests' || hash === '#requests_hub') {
        setAdminTab('requests_hub');
      } else if (hash === '#fleet' || hash === '#fleet_audit') {
        setAdminTab('fleet_audit');
      } else if (hash === '#logs' || hash === '#dispatch_logs' || hash === '#audit') {
        setAdminTab('dispatch_logs');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchFarmers(), fetchRequests(), fetchAssets()]);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await fetch('/api/admin/farmers');
      const data = await res.json();
      if (data.stats) {
        setUserStats(data.stats);
      }
      if (data.farmers && data.farmers.length > 0) {
        setFarmers(data.farmers);
        setSelectedFarmer(data.farmers[0]);
        if (!intakeFarmerId) setIntakeFarmerId(data.farmers[0].registryId || data.farmers[0].id);
      } else {
        const fallback = [
          { id: 'f-1', name: 'Farmer Member #00001', registryId: 'farmer-0-0-F0001', role: 'farmer', createdAt: new Date().toISOString() },
          { id: 'f-2', name: 'Farmer Member #00481', registryId: 'farmer-0-0-F0002', role: 'farmer', createdAt: new Date().toISOString() },
          { id: 'f-3', name: 'Farmer Member #00992', registryId: 'farmer-0-0-F0003', role: 'farmer', createdAt: new Date().toISOString() }
        ];
        setFarmers(fallback);
        setSelectedFarmer(fallback[0]);
        setIntakeFarmerId(fallback[0].registryId);
      }
    } catch (e) {
      console.error('Error loading farmers:', e);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.requests && data.requests.length > 0) {
        setRequests(data.requests);
      } else {
        setRequests([
          {
            id: 'REQ-2026-0891',
            farmer: { name: 'Farmer Member #00001', registryId: 'farmer-0-0-F0001' },
            asset: { name: 'Kubota DC-70 Plus Combine Harvester', type: 'harvester', rate: 2800, provider: { name: 'Tagum FCA Machinery Depot' } },
            hectares: 2.5,
            totalCost: 7000,
            date: new Date('2026-10-14').toISOString(),
            status: 'approved',
            notes: 'Sector: Purok 2 (Sitio Balite) | Phone: 0917-000-0001 | Cash-on-Dike settlement.'
          },
          {
            id: 'REQ-2026-0884',
            farmer: { name: 'Farmer Member #00481', registryId: 'farmer-0-0-F0002' },
            asset: { name: 'Yanmar EF494T 4WD Heavy Duty Tractor', type: 'tractor', rate: 2400, provider: { name: 'Apokon Agrarian Co-op Pool' } },
            hectares: 1.8,
            totalCost: 4320,
            date: new Date('2026-10-16').toISOString(),
            status: 'pending',
            notes: 'Sector: Purok 3 (East Rice Basin) | Phone: 0928-000-0003 | Lodging clay soil.'
          },
          {
            id: 'REQ-2026-0798',
            farmer: { name: 'Farmer Member #00992', registryId: 'farmer-1-23-A004' },
            asset: { name: 'DJI Agras T40 Spray Drone', type: 'drone', rate: 950, provider: { name: 'Muñoz Precision Center' } },
            hectares: 3.2,
            totalCost: 3040,
            date: new Date('2026-10-18').toISOString(),
            status: 'in_progress',
            notes: 'Sector: Purok 4 (Mankilam) | Bio-fertilizer foliar spray.'
          }
        ]);
      }
    } catch (e) {
      console.error('Error loading requests:', e);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAssetsList(data);
        if (!intakeMachineId) setIntakeMachineId(data[0].id);
      }
    } catch (e) {
      console.error('Error loading assets:', e);
    }
  };

  // Status transition handler via PATCH API
  const handleUpdateStatus = async (requestId, nextStatus) => {
    try {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));

      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: nextStatus })
      });

      if (!res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchRequests();
    }
  };

  // Save audit note via PATCH API
  const handleSaveAuditNote = async () => {
    if (!selectedRequestForNote) return;
    try {
      const updatedNotes = `${selectedRequestForNote.notes || ''} [MAO Audit Note: ${auditNoteText}]`;
      setRequests(prev => prev.map(r => r.id === selectedRequestForNote.id ? { ...r, notes: updatedNotes } : r));

      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRequestForNote.id, notes: updatedNotes })
      });

      setSelectedRequestForNote(null);
      setAuditNoteText('');
    } catch (err) {
      console.error('Failed to save audit note:', err);
    }
  };

  // Submit Farmer Request Intake
  const handleSubmitFarmerIntake = async (e) => {
    e.preventDefault();
    setIsIntakeSubmitting(true);
    setIntakeSuccessMessage('');

    try {
      const matchedAsset = assetsList.find(a => a.id === intakeMachineId) || assetsList[0];
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerUserId: intakeFarmerId,
          assetId: intakeMachineId || matchedAsset?.id,
          hectares: parseFloat(intakeHectares),
          scheduleDate: intakeDate,
          parcelSector: intakeSector,
          contactPhone: intakePhone,
          status: intakeInitialStatus,
          notes: `${intakeNotes} | Settlement: ${intakeSettlement}`,
        })
      });

      const data = await res.json();
      if (res.ok && data.request) {
        setRequests(prev => [data.request, ...prev]);
        setIntakeSuccessMessage('Successfully encoded and logged farmer machinery request!');
        setTimeout(() => {
          setIsIntakeModalOpen(false);
          setIntakeSuccessMessage('');
        }, 1200);
      } else {
        alert(data.error || 'Failed to submit request.');
      }
    } catch (err) {
      alert('Network error submitting request.');
    } finally {
      setIsIntakeSubmitting(false);
    }
  };

  // Submit Provider Equipment Certification
  const handleSubmitProviderAsset = async (e) => {
    e.preventDefault();
    setIsIntakeSubmitting(true);
    setIntakeSuccessMessage('');

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: assetProviderId,
          name: assetName,
          type: assetType,
          rate: parseFloat(assetRate),
          unit: assetUnit,
          location: assetLocation,
          description: `${assetHorsepower} (Engine: ${assetEngineNo}) - ${assetFuelTerms}. Certified by MAO.`,
        })
      });

      const data = await res.json();
      if (res.ok && data.asset) {
        setAssetsList(prev => [data.asset, ...prev]);
        setFleetAuditList(prev => [
          {
            id: `FLT-${Date.now().toString().slice(-3)}`,
            name: data.asset.name,
            depot: 'Registered Cooperative Depot',
            type: data.asset.type,
            status: 'Certified & Active',
            engineNo: assetEngineNo,
            lastInspection: 'Today',
            rate: `₱${data.asset.rate}/${data.asset.unit}`
          },
          ...prev
        ]);
        setIntakeSuccessMessage(`Successfully registered & certified ${assetName}! Published to Marketplace.`);
        setTimeout(() => {
          setIsIntakeModalOpen(false);
          setIntakeSuccessMessage('');
        }, 1200);
      } else {
        alert(data.error || 'Failed to register machinery.');
      }
    } catch (err) {
      alert('Network error registering machinery.');
    } finally {
      setIsIntakeSubmitting(false);
    }
  };

  // Create Farmer Registration
  const handleCreateFarmer = async (e) => {
    e.preventDefault();
    setFarmerFormError('');

    const trimmedName = newFarmerName.trim();
    const trimmedId = newRegistryId.trim();

    if (!trimmedName) {
      setFarmerFormError('Please enter the farmer full legal name.');
      return;
    }

    if (/\d/.test(trimmedName)) {
      setShowNumberErrorModal(true);
      setFarmerFormError('Full Name cannot contain numeric digits.');
      return;
    }

    if (!trimmedId) {
      setFarmerFormError('Please enter or generate a DA RSBSA Member ID.');
      return;
    }

    const idPattern = /^farmer-\d{1,2}-\d{1,2}-[A-Za-z]\d{3,4}$/i;
    if (!idPattern.test(trimmedId)) {
      setFarmerFormError(`Registry ID must follow format farmer-0-0-F0000, e.g., ${getRoleTemplate('farmer')}.`);
      return;
    }

    if (/\s/.test(newFarmerPassword)) {
      setFarmerFormError('Password must not contain any spaces.');
      return;
    }

    if (newFarmerPassword.length < 8) {
      setFarmerFormError('Password must be at least 8 characters long.');
      return;
    }

    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newFarmerPassword);
    if (!hasSpecialChar) {
      setFarmerFormError('Password must contain at least one special character (e.g. @, $, !, %, *, ?).');
      return;
    }

    if (newFarmerPassword !== newFarmerConfirmPassword) {
      setFarmerFormError('Passwords do not match. Please verify both password entries.');
      return;
    }

    try {
      const res = await fetch('/api/admin/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          registryId: trimmedId,
          password: newFarmerPassword
        })
      });
      const data = await res.json();
      if (data.success && data.farmer) {
        setFarmers([data.farmer, ...farmers]);
        setSelectedFarmer(data.farmer);
        setFormSuccess(true);
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setFormSuccess(false);
          setNewFarmerName('');
          setNewRegistryId('');
          setNewFarmerPassword('');
          setNewFarmerConfirmPassword('');
          setFarmerFormError('');
        }, 1200);
      } else {
        setFarmerFormError(data.error || 'Failed to create farmer.');
      }
    } catch (err) {
      setFarmerFormError('Error connecting to server.');
    }
  };

  // Filtered Lists
  const filteredFarmers = farmers.filter(f =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.registryId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(r => {
    const matchesStatus = requestFilterStatus === 'all' || r.status === requestFilterStatus;
    const farmerText = (r.farmer?.name || '') + ' ' + (r.farmer?.registryId || '');
    const assetText = (r.asset?.name || '') + ' ' + (r.notes || '');
    const matchesSearch = !requestSearch || farmerText.toLowerCase().includes(requestSearch.toLowerCase()) || assetText.toLowerCase().includes(requestSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface pb-16">
      
      {/* ============================================================================
          1. HEADER SECTION
          Description: Top admin header with actions
          Style: Sharp flat box, prominent green, no gradients
          ============================================================================ */}
      <div className="bg-white border-b-4 border-[#003618] text-gray-900 py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#003618]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                  LGU Command Center & Moderation Hub
                </h1>
                <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  MAO Official
                </span>
              </div>
              <p className="text-gray-600 font-mono text-sm mt-2">
                Municipal Agriculture Office • <strong className="text-gray-900">{session?.user?.name || 'LGU Admin Officer'}</strong> ({session?.user?.registryId || 'admin-1-23-A001'})
              </p>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIntakeTab('farmer_request');
                setIsIntakeModalOpen(true);
              }}
              className="px-6 py-3 bg-[#003618] text-white font-black text-sm border border-[#003618] flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>+ Intake Request / Form</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewRegistryId(getRoleTemplate('farmer'));
                setIsCreateModalOpen(true);
              }}
              className="px-6 py-3 bg-white text-[#003618] border-2 border-[#003618] font-black text-sm flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Enroll Farmer ID</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ============================================================================
            2. TOP METRIC CARDS
            Description: Admin top statistics
            Style: Sharp bordered cards, flat layout
            ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 no-print">
          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Service Requests</span>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black text-gray-900 font-mono">
                {pendingRequestsCount} <span className="text-sm font-bold text-amber-600 uppercase font-sans">Pending</span>
              </div>
              <span className="text-sm text-gray-500 mt-2 block">{requests.length} Total Bookings</span>
            </div>
          </div>

          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Registered Users</span>
              <div className="w-12 h-12 bg-emerald-50 text-[#005426] flex items-center justify-center border border-emerald-200">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <div className="text-2xl font-black text-gray-900 font-mono">
                {userStats.farmersCount || farmers.length} <span className="text-xs font-bold text-[#005426] font-sans uppercase">Farmers</span>
              </div>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {userStats.providersCount || 0} <span className="text-xs font-bold text-amber-700 font-sans uppercase">Providers</span>
              </div>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {userStats.mechanicsCount || 0} <span className="text-xs font-bold text-blue-700 font-sans uppercase">Mechanics</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Certified Machinery</span>
              <div className="w-12 h-12 bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Tractor className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black text-amber-800 font-mono">{assetsList.length > 0 ? assetsList.length : fleetAuditList.length} <span className="text-sm font-bold text-amber-800 font-sans">Units</span></div>
              <span className="text-sm text-gray-500 mt-2 block">PhilMech Calibrated • 10 Depots</span>
            </div>
          </div>

          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Audited Dispatches</span>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black text-emerald-700 font-mono">{dispatchAuditLogs.length} <span className="text-sm font-bold text-emerald-700 font-sans">Verified</span></div>
              <span className="text-sm text-gray-500 mt-2 block">Cash-on-Dike & SACCO Splits</span>
            </div>
          </div>
        </div>

        {/* ============================================================================
            3. TAB NAVIGATION
            ============================================================================ */}
        <div className="flex mb-8 gap-4 no-print overflow-x-auto">
          <button
            onClick={() => setAdminTab('requests_hub')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 cursor-pointer whitespace-nowrap ${
              adminTab === 'requests_hub'
                ? 'text-[#003618] font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className={`w-5 h-5 ${adminTab === 'requests_hub' ? 'text-[#003618]' : 'text-gray-400'}`} />
            <span>Live Requests & Moderation Hub</span>
            {pendingRequestsCount > 0 && (
              <span className="px-3 py-1 text-xs font-mono font-black bg-amber-100 text-amber-900 border border-amber-300">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('farmer_ids')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 cursor-pointer whitespace-nowrap ${
              adminTab === 'farmer_ids'
                ? 'text-[#003618] font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserCheck className={`w-5 h-5 ${adminTab === 'farmer_ids' ? 'text-[#003618]' : 'text-gray-400'}`} />
            <span>Farmer RSBSA & ID Creator ({farmers.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('fleet_audit')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 cursor-pointer whitespace-nowrap ${
              adminTab === 'fleet_audit'
                ? 'text-amber-700 font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${adminTab === 'fleet_audit' ? 'text-amber-600' : 'text-gray-400'}`} />
            <span>Fleet Certification & Listings ({assetsList.length > 0 ? assetsList.length : fleetAuditList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('dispatch_logs')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 cursor-pointer whitespace-nowrap ${
              adminTab === 'dispatch_logs'
                ? 'text-[#003618] font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Receipt className={`w-5 h-5 ${adminTab === 'dispatch_logs' ? 'text-[#003618]' : 'text-gray-400'}`} />
            <span>Audit Reports & Settlement Logs ({dispatchAuditLogs.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE REQUESTS & MODERATION HUB */}
        {/* ========================================================================= */}
        {adminTab === 'requests_hub' && (
          <div id="requests" className="flex flex-col gap-6">
            {/* Filter & Action Toolbar */}
            <div className="bg-white p-6 border border-gray-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'All Requests' },
                  { key: 'pending', label: 'Pending Review' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'in_progress', label: 'Dispatched / In Field' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRequestFilterStatus(tab.key)}
                    className={`px-4 py-2 text-xs font-bold border transition-none cursor-pointer ${
                      requestFilterStatus === tab.key
                        ? 'bg-[#003618] text-white border-[#003618]'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 w-full md:w-80">
                <Search className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="Filter farmer, machine, or sector..."
                  className="w-full text-sm bg-transparent focus:outline-none placeholder:text-gray-400 font-bold text-gray-900"
                />
                {requestSearch && (
                  <button onClick={() => setRequestSearch('')} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Requests Moderation Table */}
            <div className="bg-white border border-gray-300">
              <div className="p-6 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-[#003618]" />
                    <span>Municipal Machinery Requests Queue</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Review incoming equipment requests from farmers, match with cooperative pools, and approve dispatches.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIntakeTab('farmer_request');
                    setIsIntakeModalOpen(true);
                  }}
                  className="px-6 py-3 bg-[#003618] text-white text-sm font-black flex items-center gap-2 cursor-pointer border border-[#003618]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>New Assisted Request</span>
                </button>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="text-center py-20">
                  <Inbox className="w-16 h-16 text-gray-300 mx-auto" />
                  <p className="text-base font-bold text-gray-500 mt-4">No service requests matching this filter.</p>
                  <button
                    onClick={() => { setRequestFilterStatus('all'); setRequestSearch(''); }}
                    className="mt-4 text-sm text-[#003618] font-black underline cursor-pointer hover:text-gray-900"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-xs font-bold border-b border-gray-300">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Request Details</th>
                        <th className="py-3.5 px-4 font-bold">Farmer / RSBSA ID</th>
                        <th className="py-3.5 px-4 font-bold">Requested Machinery</th>
                        <th className="py-3.5 px-4 font-bold">Parcel & Hectares</th>
                        <th className="py-3.5 px-4 font-bold">Total / Settlement</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 font-bold text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft/60 font-medium">
                      {filteredRequests.map((req) => {
                        const statusColors = {
                          pending: 'bg-amber-50 text-amber-900 border-amber-300',
                          approved: 'bg-[#003618]/10 text-[#003618] border-[#003618]/30',
                          in_progress: 'bg-amber-100 text-amber-800 border-amber-400',
                          completed: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                          cancelled: 'bg-red-50 text-red-700 border-red-300',
                        };

                        return (
                          <tr key={req.id} className="hover:bg-gray-50 border-b border-gray-200 transition-none">
                            <td className="py-5 px-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-gray-900 block">{req.id}</span>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </td>

                            <td className="py-5 px-4 whitespace-nowrap">
                              <span className="font-black text-gray-900 block">{req.farmer?.name || 'Walk-in Farmer'}</span>
                              <span className="font-mono text-xs text-gray-500 mt-1 block">{req.farmer?.registryId || 'RSBSA Pending'}</span>
                            </td>

                            <td className="py-5 px-4">
                              <span className="font-bold text-gray-900 block">{req.asset?.name || 'Custom Harvester/Tractor'}</span>
                              <span className="text-xs text-[#003618] font-bold mt-1 block">
                                {req.asset?.provider?.name || 'Municipal Co-op Pool'}
                              </span>
                            </td>

                            <td className="py-5 px-4">
                              <span className="font-black text-gray-900 block">{req.hectares || 1.0} ha</span>
                              <span className="text-xs text-gray-500 line-clamp-1 mt-1 block">{req.notes?.split('|')?.[0] || 'Tagum Lowland'}</span>
                            </td>

                            <td className="py-5 px-4 whitespace-nowrap">
                              <span className="font-black text-gray-900 block text-base">₱{(req.totalCost || 0).toLocaleString()}</span>
                              <span className="text-xs font-mono uppercase text-gray-500 mt-1 block">
                                {req.notes?.includes('Settlement:') ? req.notes.split('Settlement:')?.[1]?.trim() : 'Cash-on-Dike'}
                              </span>
                            </td>

                            <td className="py-5 px-4 whitespace-nowrap">
                              <span className={`inline-block px-3 py-1 text-xs font-bold border uppercase tracking-wider ${statusColors[req.status] || 'bg-gray-100 text-gray-800'}`}>
                                {req.status?.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {/* Dynamic Status Action Buttons */}
                                {req.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(req.id, 'approved')}
                                    className="px-4 py-2 bg-[#003618] text-white text-xs font-black border border-[#003618] cursor-pointer"
                                    title="Approve request"
                                  >
                                    Approve
                                  </button>
                                )}

                                {req.status === 'approved' && (
                                  <button
                                    onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                                    className="px-4 py-2 bg-amber-600 text-white text-xs font-black border border-amber-600 cursor-pointer"
                                    title="Dispatch operator to field"
                                  >
                                    Dispatch
                                  </button>
                                )}

                                {req.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleUpdateStatus(req.id, 'completed')}
                                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-black border border-emerald-700 cursor-pointer"
                                    title="Mark completed"
                                  >
                                    Complete
                                  </button>
                                )}

                                {req.status !== 'cancelled' && req.status !== 'completed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                                    className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer"
                                    title="Cancel request"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}

                                <Link
                                  href="/dispatch-slip"
                                  className="p-2 text-gray-500 hover:text-[#003618] border border-transparent hover:border-gray-300 cursor-pointer inline-flex items-center"
                                  title="Open A4 Dispatch Ticket"
                                >
                                  <Printer className="w-4 h-4" />
                                </Link>

                                  <button
                                    onClick={() => {
                                      setSelectedRequestForNote(req);
                                      setAuditNoteText('');
                                    }}
                                    className="p-2 text-gray-500 hover:text-[#003618] border border-transparent hover:border-gray-300 cursor-pointer"
                                    title="Add MAO Verification Note"
                                  >
                                    <FileEdit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ========================================================================= */}
        {/* TAB 2: FARMER ID CREATOR */}
        {/* ========================================================================= */}
        {adminTab === 'farmer_ids' && (
          <div id="farmers" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Registered Farmers Roster (5 Cols) (No Print) */}
            <div className="lg:col-span-5 flex flex-col gap-6 no-print">
              <div className="bg-white p-6 border border-gray-300 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#003618]" />
                      <span>Registered RSBSA Farmers</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Select a farmer to verify credentials and print ID card.</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                    {farmers.length} Total
                  </span>
                </div>

                {/* Search Bar & Batch Controls */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300">
                    <Search className="w-4 h-4 text-gray-500 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search farmer name or RSBSA ID..."
                      className="w-full text-sm bg-transparent focus:outline-none placeholder:text-gray-400 font-bold text-gray-900"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-gray-400 font-bold cursor-pointer hover:text-gray-900">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Batch Selection Action Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-bold border border-gray-300">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={filteredFarmers.length > 0 && filteredFarmers.every(f => selectedBatchFarmerIds.includes(f.id || f.registryId))}
                        onChange={() => {
                          const allFilteredIds = filteredFarmers.map(f => f.id || f.registryId);
                          const isAllSelected = allFilteredIds.every(id => selectedBatchFarmerIds.includes(id));
                          if (isAllSelected) {
                            setSelectedBatchFarmerIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                          } else {
                            setSelectedBatchFarmerIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                          }
                        }}
                        className="w-4 h-4 rounded-none text-[#003618] border-gray-400 cursor-pointer"
                      />
                      <span>Select All ({filteredFarmers.length})</span>
                    </label>

                    <button
                      type="button"
                      disabled={selectedBatchFarmerIds.length === 0}
                      onClick={() => setIsBatchModalOpen(true)}
                      className={`px-4 py-2 text-xs font-black border flex items-center gap-2 cursor-pointer ${
                        selectedBatchFarmerIds.length > 0
                          ? 'bg-[#003618] text-white border-[#003618]'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                      <span>Batch Print A4 Grid ({selectedBatchFarmerIds.length})</span>
                    </button>
                  </div>
                </div>

                {/* Farmer List */}
                <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto overscroll-contain">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#003618] mx-auto" />
                      <p className="text-sm font-bold text-gray-500 mt-4">Loading Farmer Registry...</p>
                    </div>
                  ) : filteredFarmers.length === 0 ? (
                    <div className="text-center py-12">
                      <UserX className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-sm font-bold text-gray-500 mt-2">No registered farmers found.</p>
                    </div>
                  ) : (
                    filteredFarmers.map((f) => {
                      const fKey = f.id || f.registryId;
                      const isSelected = selectedFarmer?.id === f.id || selectedFarmer?.registryId === f.registryId;
                      const isChecked = selectedBatchFarmerIds.includes(fKey);
                      return (
                        <div
                          key={fKey}
                          className={`w-full p-4 transition-none flex items-center justify-between gap-4 border-l-4 my-2 border ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 border-t-emerald-600/0 border-b-emerald-600/0 border-r-emerald-600/0'
                              : 'bg-white border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedBatchFarmerIds(prev =>
                                  prev.includes(fKey) ? prev.filter(id => id !== fKey) : [...prev, fKey]
                                );
                              }}
                              className="w-4 h-4 rounded-none text-[#003618] border-gray-400 cursor-pointer shrink-0"
                            />
                            
                            <button
                              type="button"
                              onClick={() => setSelectedFarmer(f)}
                              className="flex items-center gap-4 text-left w-full cursor-pointer min-w-0"
                            >
                              <div className="w-10 h-10 bg-gray-100 text-[#003618] flex items-center justify-center font-black text-sm uppercase shrink-0 border border-gray-200">
                                {f.name?.[0] || 'F'}
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-black leading-tight text-gray-900 truncate">{f.name}</p>
                                <p className="text-xs font-mono text-gray-500 mt-1 truncate">
                                  RSBSA: {f.registryId}
                                </p>
                              </div>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedFarmer(f)}
                            className="p-2 text-gray-400 hover:text-[#003618] cursor-pointer shrink-0"
                            title="Preview individual card"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="p-6 bg-gray-50 border border-gray-300 text-sm space-y-3">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#003618]" />
                  <span>DA-LGU Accreditation Protocols</span>
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-xs font-medium">
                  <li>Verify official RSBSA Registration Slip with Barangay Agrarian Committee.</li>
                  <li>Ensure active cooperative affiliation (CDA) or agrarian reform beneficiary (ARB) status.</li>
                  <li>Barcodes generated on ID cards are directly scannable by machinery operators in the field.</li>
                </ul>
              </div>
            </div>

            {/* RIGHT: Live ID Card Preview & Print Action (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white p-6 md:p-8 border border-gray-300 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between no-print gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-amber-600" />
                      <span>Official Farmer Physical ID Slip</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Printable high-contrast card for cash-on-dike operations.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-[#003618] text-white text-sm font-black border border-[#003618] flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print Card (A4 / PVC)</span>
                  </button>
                </div>

                {selectedFarmer ? (
                  <FarmerIDCard
                    farmer={selectedFarmer}
                    farmerName={selectedFarmer.name}
                    rsbsaId={selectedFarmer.registryId}
                    coopName={coopName}
                    barangay={barangay}
                    emergencyContactName={emergencyContactName || `${selectedFarmer.name} (Family)`}
                    emergencyContactPhone={emergencyContactPhone}
                    barangayHotline={barangayHotline}
                    depotProviderName={depotProviderName}
                    depotProviderPhone={depotProviderPhone}
                    allowUpload={true}
                  />
                ) : (
                  <div className="p-12 text-center text-soil-slate">
                    <UserX className="w-10 h-10 text-soil-slate/30 mx-auto" />
                    <p className="text-sm font-bold mt-2">Select a farmer from the registry to view card.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FLEET CERTIFICATION & LISTINGS */}
        {/* ========================================================================= */}
        {adminTab === 'fleet_audit' && (
          <div className="bg-white p-6 md:p-8 border border-gray-300 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                  <span>Municipal Machinery Pool & Provider Accreditations</span>
                </h2>
                <p className="text-sm text-gray-600 mt-2">PhilMech and DA-RFO XI safety certifications for cooperative and private equipment pools.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIntakeTab('provider_asset');
                  setIsIntakeModalOpen(true);
                }}
                className="px-6 py-3 bg-amber-600 text-white text-sm font-black border border-amber-600 hover:bg-amber-700 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-5 h-5" />
                <span>+ Certify New Machinery</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(assetsList.length > 0 ? assetsList.map(a => ({
                id: a.id,
                name: a.name,
                depot: a.provider?.name || 'Registered Co-op Depot',
                type: a.type?.toUpperCase(),
                status: 'Certified & Active',
                engineNo: 'Verified Engine',
                lastInspection: 'Recent',
                rate: `₱${a.rate}/${a.unit}`
              })) : fleetAuditList).map((item) => (
                <div key={item.id} className="p-6 bg-gray-50 border border-gray-300 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold px-3 py-1 bg-white text-gray-600 border border-gray-300 inline-block mb-2">
                          {item.type}
                        </span>
                        <h3 className="font-black text-lg text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 font-bold">{item.depot}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#003618]/10 text-[#003618] border border-[#003618]/30 text-xs font-black">
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm font-mono bg-white p-4 border border-gray-300">
                      <div>
                        <span className="text-gray-500 block font-bold">Standard Rate:</span>
                        <span className="font-black text-gray-900">{item.rate || '₱2,500/ha'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block font-bold">Serial / Engine:</span>
                        <span className="font-black text-gray-900 truncate block">{item.engineNo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-300 mt-2">
                    <span className="text-gray-600 font-mono font-bold">Inspection: {item.lastInspection}</span>
                    <span className="text-[#003618] font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-[#003618]" />
                      Accredited
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AUDIT REPORTS & SETTLEMENT LOGS */}
        {/* ========================================================================= */}
        {adminTab === 'dispatch_logs' && (
          <div className="bg-white p-6 md:p-8 border border-gray-300 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-[#003618]" />
                  <span>Municipal Dispatch & Settlement Audit Records</span>
                </h2>
                <p className="text-sm text-gray-600 mt-2">Quarterly Agrarian Council records for Cash-on-Dike and Cooperative Passbook reconciliations.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      "Ticket,Farmer,Provider,Hectares,Amount,Settlement,Status\n" +
                      dispatchAuditLogs.map(e => `${e.ticketNo},${e.farmer},${e.provider},${e.hectares},${e.amount},${e.settlement},${e.status}`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "umakonekta_municipal_audit.csv");
                    document.body.appendChild(link);
                    link.click();
                  }}
                  className="px-6 py-3 bg-gray-50 border border-gray-300 text-gray-900 font-black text-sm hover:border-[#003618] flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-xs font-bold border-b border-gray-300">
                  <tr>
                    <th className="py-4 px-4 font-bold">Audit Ticket</th>
                    <th className="py-4 px-4 font-bold">Farmer Requestor</th>
                    <th className="py-4 px-4 font-bold">Provider Depot</th>
                    <th className="py-4 px-4 font-bold">Area (Hectares)</th>
                    <th className="py-4 px-4 font-bold">Total Amount</th>
                    <th className="py-4 px-4 font-bold">Settlement Protocol</th>
                    <th className="py-4 px-4 font-bold">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {dispatchAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-none">
                      <td className="py-4 px-4 font-mono font-black text-gray-900">{log.ticketNo}</td>
                      <td className="py-4 px-4 font-black text-gray-900">{log.farmer}</td>
                      <td className="py-4 px-4 text-gray-600 font-bold">{log.provider}</td>
                      <td className="py-4 px-4 font-mono font-black text-gray-900">{log.hectares} ha</td>
                      <td className="py-4 px-4 font-mono font-black text-gray-900 text-base">{log.amount}</td>
                      <td className="py-4 px-4 text-gray-600 font-bold">{log.settlement}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black uppercase">
                          <span className="w-2 h-2 bg-emerald-600" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DUAL-TAB INTAKE MODAL (FARMER REQUEST & PROVIDER EQUIPMENT REGISTRATION) */}
      {/* ========================================================================= */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="bg-white max-w-2xl w-full p-8 shadow-2xl border border-gray-300 animate-in fade-in duration-200 my-8">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="w-6 h-6 text-[#003618]" />
                  <span>Municipal Agrarian Intake Desk</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">Official assisted booking and machinery certification window.</p>
              </div>
              <button
                onClick={() => setIsIntakeModalOpen(false)}
                className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 cursor-pointer border border-gray-200 transition-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Tabs Selector */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 border border-gray-200 my-6">
              <button
                type="button"
                onClick={() => setIntakeTab('farmer_request')}
                className={`py-3 px-4 text-sm font-black flex items-center justify-center gap-2 transition-none cursor-pointer border ${
                  intakeTab === 'farmer_request'
                    ? 'bg-[#003618] text-white border-[#003618]'
                    : 'bg-white text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>1. Farmer Service Request</span>
              </button>

              <button
                type="button"
                onClick={() => setIntakeTab('provider_asset')}
                className={`py-3 px-4 text-sm font-black flex items-center justify-center gap-2 transition-none cursor-pointer border ${
                  intakeTab === 'provider_asset'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Tractor className="w-5 h-5" />
                <span>2. Certify Provider Machinery</span>
              </button>
            </div>

            {/* Success Alert */}
            {intakeSuccessMessage && (
              <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{intakeSuccessMessage}</span>
              </div>
            )}

            {/* FORM 1: FARMER REQUEST INTAKE */}
            {intakeTab === 'farmer_request' && (
              <form onSubmit={handleSubmitFarmerIntake} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <SmartSearchSelect
                      label="Select Registered Farmer (RSBSA)"
                      required
                      options={farmers.map(f => ({
                        value: f.registryId || f.id,
                        label: f.name,
                        subtitle: `RSBSA: ${f.registryId || 'Verified Member'}`,
                        icon: 'person',
                        badge: f.farmDetails?.commodity || 'Rice / Corn'
                      }))}
                      value={intakeFarmerId}
                      onChange={(val) => setIntakeFarmerId(val)}
                      placeholder="Search farmer by name or RSBSA ID..."
                      searchPlaceholder="Type farmer name or RSBSA #..."
                    />
                  </div>

                  <div>
                    <SmartSearchSelect
                      label="Machinery / Pool Unit"
                      required
                      options={assetsList.length > 0 ? assetsList.map(a => ({
                        value: a.id,
                        label: a.name,
                        subtitle: `Provider: ${a.provider?.name || 'Tagum FCA Depot'}`,
                        badge: `₱${(a.rate || 0).toLocaleString()}/${a.unit === 'per_ha' ? 'ha' : a.unit === 'per_day' ? 'day' : a.unit || 'unit'}`,
                        icon: a.type === 'harvester' ? 'agriculture' : a.type === 'drone' ? 'flight' : 'precision_manufacturing'
                      })) : MACHINERY_CATALOG_PRESETS}
                      value={intakeMachineId}
                      onChange={(val) => setIntakeMachineId(val)}
                      placeholder="Search equipment pool..."
                      searchPlaceholder="Type machinery name or model..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-600 mb-2">Parcel Hectares</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={intakeHectares}
                      onChange={(e) => setIntakeHectares(e.target.value)}
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-300 focus:border-[#003618] focus:outline-none transition-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-600 mb-2">Target Operation Date</label>
                    <input
                      type="date"
                      required
                      value={intakeDate}
                      onChange={(e) => setIntakeDate(e.target.value)}
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-300 focus:border-[#003618] focus:outline-none transition-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-600 mb-2">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={intakePhone}
                      onChange={(e) => setIntakePhone(e.target.value)}
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-300 focus:border-[#003618] focus:outline-none transition-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-600 mb-2">Barangay / Sector Location</label>
                    <input
                      type="text"
                      required
                      value={intakeSector}
                      onChange={(e) => setIntakeSector(e.target.value)}
                      placeholder="e.g., Purok 2 Sitio Balite"
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-300 focus:border-[#003618] focus:outline-none transition-none"
                    />
                  </div>

                  <div>
                    <SmartSearchSelect
                      label="Settlement Method"
                      required
                      options={SETTLEMENT_METHODS}
                      value={intakeSettlement}
                      onChange={(val) => setIntakeSettlement(val)}
                      placeholder="Select settlement terms..."
                      searchPlaceholder="Search settlement method..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Initial Status Moderation</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="initial_status"
                        checked={intakeInitialStatus === 'pending'}
                        onChange={() => setIntakeInitialStatus('pending')}
                      />
                      <span>Mark as Pending Review</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-primary">
                      <input
                        type="radio"
                        name="initial_status"
                        checked={intakeInitialStatus === 'approved'}
                        onChange={() => setIntakeInitialStatus('approved')}
                      />
                      <span>Directly Approve & Authorize Dispatch</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-soft flex items-center justify-between">
                  <div className="text-xs font-mono text-soil-slate">
                    Est. Total: <strong className="text-primary font-black text-sm">₱{(intakeHectares * (assetsList.find(a => a.id === intakeMachineId)?.rate || 2800)).toLocaleString()}</strong>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsIntakeModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-bold text-soil-slate hover:text-on-surface cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isIntakeSubmitting}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-container shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Encode & Save Request</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FORM 2: PROVIDER EQUIPMENT REGISTRATION */}
            {intakeTab === 'provider_asset' && (
              <form onSubmit={handleSubmitProviderAsset} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Cooperative Depot Provider ID</label>
                    <input
                      type="text"
                      required
                      value={assetProviderId}
                      onChange={(e) => setAssetProviderId(formatRegistryId(e.target.value, 'provider'))}
                      placeholder="e.g., provider-0-0-P0000"
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <SmartSearchSelect
                      label="Equipment Category"
                      required
                      options={MACHINERY_CATEGORIES}
                      value={assetType}
                      onChange={(val) => setAssetType(val)}
                      placeholder="Select equipment type..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Machinery Model & Brand</label>
                    <input
                      type="text"
                      required
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="e.g., Kubota DC-70 Plus"
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Engine Serial / Chassis No.</label>
                    <input
                      type="text"
                      required
                      value={assetEngineNo}
                      onChange={(e) => setAssetEngineNo(e.target.value)}
                      placeholder="e.g., V2403-CR-TE4"
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Rental Rate (PHP)</label>
                    <input
                      type="number"
                      required
                      value={assetRate}
                      onChange={(e) => setAssetRate(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <SmartSearchSelect
                      label="Billing Unit"
                      required
                      options={BILLING_UNITS}
                      value={assetUnit}
                      onChange={(val) => setAssetUnit(val)}
                      placeholder="Select billing metric..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Horsepower / Spec</label>
                    <input
                      type="text"
                      required
                      value={assetHorsepower}
                      onChange={(e) => setAssetHorsepower(e.target.value)}
                      placeholder="e.g., 70 HP Turbo"
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Depot Station Location</label>
                    <input
                      type="text"
                      required
                      value={assetLocation}
                      onChange={(e) => setAssetLocation(e.target.value)}
                      placeholder="e.g., Brgy. San Manuel, Tagum City"
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <SmartSearchSelect
                      label="Fuel Terms"
                      required
                      options={FUEL_POLICY_OPTIONS}
                      value={assetFuelTerms}
                      onChange={(val) => setAssetFuelTerms(val)}
                      placeholder="Select fuel policy..."
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border-soft flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIntakeModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-soil-slate hover:text-on-surface cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isIntakeSubmitting}
                    className="px-5 py-2.5 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Certify & Publish to Marketplace</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIT NOTE MODAL */}
      {/* ========================================================================= */}
      {selectedRequestForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-border-soft animate-in fade-in">
            <h3 className="text-base font-black text-on-surface flex items-center gap-2 mb-1">
              <FileEdit className="w-5 h-5 text-primary" />
              <span>Add MAO Audit Verification Note</span>
            </h3>
            <p className="text-xs text-soil-slate mb-3">
              Appends an official administrative note to Request {selectedRequestForNote.id}.
            </p>

            <textarea
              rows={3}
              value={auditNoteText}
              onChange={(e) => setAuditNoteText(e.target.value)}
              placeholder="e.g., Land title cross-referenced with NIA canal schedule. Fuel subsidy approved by Barangay Captain."
              className="w-full text-xs font-medium p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRequestForNote(null)}
                className="px-4 py-2 text-xs font-bold text-soil-slate hover:text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAuditNote}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container shadow-xs cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTER NEW FARMER MODAL (NO PRINT) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border-soft animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-black text-on-surface">Enroll Farmer in RSBSA Registry</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-soil-slate hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formSuccess ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-extrabold text-on-surface">Farmer Registered Successfully!</h4>
                <p className="text-xs text-soil-slate">Generating printable barcode card and updating masterlist...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateFarmer} className="space-y-4">
                {farmerFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{farmerFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-soil-slate mb-1">
                    Farmer Full Name (as registered with DA)
                  </label>
                  <input
                    id="admin-farmer-name"
                    type="text"
                    required
                    value={newFarmerName}
                    onChange={(e) => {
                      setNewFarmerName(e.target.value);
                      if (farmerFormError) setFarmerFormError('');
                    }}
                    placeholder="e.g., Farmer Name Jr."
                    className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-soil-slate mt-1">Letters and extensions only. Numbers are prohibited by DA.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-soil-slate">DA RSBSA Member ID</label>
                    <button
                      type="button"
                      onClick={() => setNewRegistryId(getRoleTemplate('farmer'))}
                      className="text-[11px] font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Template: {getRoleTemplate('farmer')}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newRegistryId}
                    onChange={(e) => setNewRegistryId(formatRegistryId(e.target.value, 'farmer'))}
                    placeholder={getRoleTemplate('farmer')}
                    className="w-full text-xs font-bold font-mono p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Barangay</label>
                    <input
                      type="text"
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-soil-slate mb-1">Cooperative</label>
                    <input
                      type="text"
                      value={coopName}
                      onChange={(e) => setCoopName(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase text-soil-slate mb-1">
                    Initial Account Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-soil-slate">
                      <Lock className="w-4 h-4 text-soil-slate" />
                    </span>
                    <input
                      type={showFarmerPassword ? 'text' : 'password'}
                      required
                      value={newFarmerPassword}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw.includes(' ')) {
                          setFarmerFormError('Password cannot contain spaces.');
                          setNewFarmerPassword(raw.replace(/\s/g, ''));
                        } else {
                          setNewFarmerPassword(raw);
                          if (farmerFormError) setFarmerFormError('');
                        }
                      }}
                      placeholder="Min. 8 chars with 1 special symbol"
                      className="w-full pl-9 pr-9 py-2.5 bg-surface-container-low text-xs font-mono font-bold rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFarmerPassword(!showFarmerPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-soil-slate hover:text-on-surface cursor-pointer"
                    >
                      {showFarmerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-soil-slate">
                      Confirm Password
                    </label>
                    {newFarmerConfirmPassword && newFarmerPassword === newFarmerConfirmPassword && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Passwords match</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-soil-slate">
                      <ShieldCheck className="w-4 h-4 text-soil-slate" />
                    </span>
                    <input
                      type={showFarmerConfirmPassword ? 'text' : 'password'}
                      required
                      value={newFarmerConfirmPassword}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw.includes(' ')) {
                          setFarmerFormError('Password cannot contain spaces.');
                          setNewFarmerConfirmPassword(raw.replace(/\s/g, ''));
                        } else {
                          setNewFarmerConfirmPassword(raw);
                          if (farmerFormError) setFarmerFormError('');
                        }
                      }}
                      placeholder="Re-enter to confirm password"
                      className="w-full pl-9 pr-9 py-2.5 bg-surface-container-low text-xs font-mono font-bold rounded-xl border border-border-soft focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFarmerConfirmPassword(!showFarmerConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-soil-slate hover:text-on-surface cursor-pointer"
                    >
                      {showFarmerConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Visual Password Strength Checklist */}
                <PasswordStrengthIndicator password={newFarmerPassword} showCriteria={true} />

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-soft">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setFarmerFormError('');
                    }}
                    className="px-4 py-2 text-xs font-bold text-soil-slate hover:text-on-surface cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-container shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Generate ID</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Error Dialog Modal: Numbers Not Allowed in Farmer Full Name */}
      {showNumberErrorModal && (
        <div 
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 no-print"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNumberErrorModal(false);
              const input = document.getElementById('admin-farmer-name');
              if (input) input.focus();
            }
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setShowNumberErrorModal(false);
                const input = document.getElementById('admin-farmer-name');
                if (input) input.focus();
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-soil-slate hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>DA-RSBSA Regulatory Validation</span>
            </div>

            <h3 className="text-xl font-black text-on-surface tracking-tight mb-2">
              Numbers Are Not Allowed
            </h3>

            <p className="text-sm text-soil-slate leading-relaxed mb-4">
              You entered a number into the <strong className="text-on-surface">Farmer Full Name</strong> field. 
              Under Department of Agriculture regulations, legal RSBSA records must consist of alphabetical characters and standard name extensions only (e.g. <em>Farmer Name Jr.</em>).
            </p>

            <div className="w-full p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left mb-5">
              <strong className="block font-bold text-amber-950 mb-1">Entering the Registry ID?</strong>
              Please enter identification codes in the <strong>DA RSBSA Member ID</strong> field below.
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNumberErrorModal(false);
                const input = document.getElementById('admin-farmer-name');
                if (input) input.focus();
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Correct Full Name
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* A4 BATCH FARMER ID PRINT GRID MODAL */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <BatchFarmerIDGrid
          farmers={farmers.filter(f => selectedBatchFarmerIds.includes(f.id || f.registryId))}
          customData={{
            coopName,
            barangay,
            emergencyContactPhone,
            barangayHotline,
            depotProviderName,
            depotProviderPhone,
          }}
          initialGridFormat="4up"
          initialSideMode="side_by_side"
          onClose={() => setIsBatchModalOpen(false)}
        />
      )}
    </div>
  );
}
