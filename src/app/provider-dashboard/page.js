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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SmartSearchSelect from '@/components/SmartSearchSelect';
import SmartCalendar from '@/components/SmartCalendar';
import { MACHINERY_CATEGORIES, BILLING_UNITS, formatRegistryId } from '@/lib/formatters';
import {
  Tractor,
  Wrench,
  Users,
  Radio,
  FileText,
  Calendar,
  PlusCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  PhoneCall,
  Award,
  ShieldCheck,
  AlertCircle,
  Fuel,
  Search,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  X,
  Plus,
  ClipboardList,
  HardHat,
  Check,
  Phone,
  Layers,
  Activity,
  Wheat
} from 'lucide-react';

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState({ assets: [], requests: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('machinery'); // 'machinery', 'farmer_needs', 'dispatches', 'rotation'

  // Certified Operators Directory (Adhering to Philippine Agrarian Privacy RA 10173)
  const certifiedOperators = [
    {
      id: 'op-01',
      name: 'Accredited Operator #1',
      cert: 'TESDA NC-II / DA-PhilMech Cert #819',
      phone: '0919-000-0002',
      rating: '4.9',
      specialty: 'Combine Harvester & Heavy 4WD',
      status: 'Available'
    },
    {
      id: 'op-02',
      name: 'Accredited Operator #2',
      cert: 'TESDA NC-II / DA-PhilMech Cert #402',
      phone: '0928-000-0003',
      rating: '4.8',
      specialty: '4WD Tillage, Disc Plow & Harrow',
      status: 'On-Field'
    },
    {
      id: 'op-03',
      name: 'Accredited Operator #3',
      cert: 'DA Machinery Operator Cert #511',
      phone: '0917-000-0004',
      rating: '4.7',
      specialty: 'Mechanical Rice Transplanter',
      status: 'Available'
    },
    {
      id: 'op-04',
      name: 'Licensed Drone Pilot #1',
      cert: 'CAAP Remote Pilot #RP-2024 / DA Precision Agri',
      phone: '0908-000-0004',
      rating: '5.0',
      specialty: 'DJI Agras Precision Crop Sprayer',
      status: 'Available'
    },
    {
      id: 'op-05',
      name: 'Accredited Transplanter Operator #1',
      cert: 'PhilMech Certified Operator #TR-102',
      phone: '0918-000-0005',
      rating: '4.9',
      specialty: 'Riding & Walk-behind Transplanters',
      status: 'Available'
    },
    {
      id: 'op-06',
      name: 'Cooperative Silo Technician #1',
      cert: 'PhilMech Post-Harvest Specialist',
      phone: '0921-000-0006',
      rating: '4.8',
      specialty: 'Batch Recirculating Grain Dryer',
      status: 'At Depot Silo'
    }
  ];

  // PhilMech Standard Rate Presets
  const philmechPresets = [
    {
      crop: 'Rice / Palay',
      name: 'Kubota DC-70 Plus Combine Harvester',
      category: 'harvester',
      rate: 2800,
      unit: 'per_ha',
      hp: '70 HP Turbo Tracked',
      fuelTerms: 'Farmer supplies 18L Diesel/ha',
      description: 'Tracked palay combine harvester, mechanical thresher and bagging chute.',
      icon: 'agriculture',
      badge: '₱2,800/ha'
    },
    {
      crop: 'Palay / Corn',
      name: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      category: 'tractor',
      rate: 2400,
      unit: 'per_ha',
      hp: '49 HP 4WD',
      fuelTerms: 'Farmer supplies 18L Diesel/ha',
      description: 'Heavy tillage with 2.2m rotavator, disc plow and puddle leveler.',
      icon: 'forklift',
      badge: '₱2,400/ha'
    },
    {
      crop: 'All Crops',
      name: 'DJI Agras T40 Precision Crop Sprayer',
      category: 'drone',
      rate: 950,
      unit: 'per_ha',
      hp: 'Centrifugal Twin-Atomizing Spray',
      fuelTerms: 'Solar Battery Charged (Zero Diesel)',
      description: 'Ultra-low volume aerial foliar nutrient and organic bio-pest spray.',
      icon: 'flight',
      badge: '₱950/ha'
    },
    {
      crop: 'Harvested Grain',
      name: 'Buhler 5-Ton Grain Recirculating Dryer',
      category: 'dryer',
      rate: 45,
      unit: 'per_bag',
      hp: 'Biomass Husk / Diesel Fired',
      fuelTerms: 'Husk biomass fuel included',
      description: 'Standardized 14.0% moisture content reduction with certified scale ticket.',
      icon: 'grain',
      badge: '₱45/bag'
    },
    {
      crop: 'Wetland Rice',
      name: 'Kubota SPV-6MD Riding Transplanter',
      category: 'transplanter',
      rate: 3200,
      unit: 'per_ha',
      hp: '19.6 HP Gas Multi-Row',
      fuelTerms: 'Farmer supplies 15L Gas/ha',
      description: 'High-density uniform 6-row rice seedling planting on puddled fields.',
      icon: 'grass',
      badge: '₱3,200/ha'
    },
    {
      crop: 'Irrigation',
      name: 'Daishin 6-Inch Axial Flow Irrigation Pump',
      category: 'pump',
      rate: 850,
      unit: 'per_day',
      hp: '10 HP Diesel Yanmar Engine',
      fuelTerms: 'Farmer supplies diesel',
      description: 'High discharge canal lifting pump for low-lying rice paddies.',
      icon: 'solar_power',
      badge: '₱850/day'
    }
  ];

  // Post Machine Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [fuelMode, setFuelMode] = useState('farmer_fuel'); // 'farmer_fuel', 'depot_fuel'
  const [newMachine, setNewMachine] = useState({
    name: 'Kubota M7040 4WD Heavy Tractor',
    type: 'tractor',
    horsepower: '70 HP Turbo',
    rate: 2400,
    unit: 'per_ha',
    location: 'Tagum City, Davao del Norte',
    description: 'Heavy duty disc plowing and rotavator service. Includes certified operator.',
    fuelTerms: 'Farmer supplies 18L Diesel/ha'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState('');


  // Assign Operator Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignContext, setAssignContext] = useState(null); // 'need' or 'request'
  const [assignTargetItem, setAssignTargetItem] = useState(null);
  const [assignedOperatorName, setAssignedOperatorName] = useState('Accredited Operator #1');
  const [assignedOperatorPhone, setAssignedOperatorPhone] = useState('0919-000-0002');
  const [assignedOperatorCert, setAssignedOperatorCert] = useState('TESDA NC-II / DA-PhilMech Cert #819');
  const [assignedMachineName, setAssignedMachineName] = useState('Kubota DC-70 Plus Combine Harvester');
  const [assignDispatchDate, setAssignDispatchDate] = useState('2026-10-14');
  const [assignTimeSlot, setAssignTimeSlot] = useState('06:00 AM – 01:00 PM');
  const [assignFuelOption, setAssignFuelOption] = useState('Farmer supplies 18L Diesel/ha');

  // Cropping Block Reservations (Seasonal Availability Calendar)
  const [reservedBlocks, setReservedBlocks] = useState([]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [newBlockSector, setNewBlockSector] = useState('Purok 4 Mankilam Rice Basin');
  const [newBlockMachine, setNewBlockMachine] = useState('Kubota DC-70 Plus Combine Harvester');
  const [newBlockDates, setNewBlockDates] = useState('Oct 20 – Oct 23, 2026');
  const [newBlockHectares, setNewBlockHectares] = useState(18.0);

  // Machinery Local State with demo fallback
  const [localAssets, setLocalAssets] = useState([]);

  // Farmer Needs Feed
  const [farmerNeeds, setFarmerNeeds] = useState([]);

  // Dispatch requests state
  const [requestsList, setRequestsList] = useState([]);

  // Announcements
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=provider');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'provider' && session?.user?.role !== 'admin') {
        const portal = session?.user?.role === 'farmer'
          ? '/farmer-dashboard'
          : session?.user?.role === 'mechanic'
          ? '/mechanic-dashboard'
          : session?.user?.role === 'secops'
          ? '/x9f-telemetry-vault-8812'
          : '/admin';
        router.push(portal);
        return;
      }
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(d => {
          if (d.assets && d.assets.length > 0) {
            setLocalAssets(d.assets.map(a => ({
              id: a.id,
              name: a.name,
              type: a.type,
              horsepower: a.description?.split('•')[0]?.trim() || a.description || 'Verified Spec',
              location: a.location || 'Depot Station',
              rate: a.rate,
              unit: a.unit,
              status: a.status || 'available',
              fuelTerms: a.description?.toLowerCase().includes('diesel') ? 'Farmer supplies diesel / Custom agreement' : 'Standard Co-op Agreement',
              operator: session?.user?.name || 'Depot Operator'
            })));
          }
          if (d.requests && Array.isArray(d.requests) && d.requests.length > 0) {
            const mappedDbRequests = d.requests.map(r => ({
              id: r.id.startsWith('REQ-') ? r.id : `REQ-${r.id.slice(0, 8).toUpperCase()}`,
              dbId: r.id,
              farmerName: r.farmer?.name || 'Farmer Beneficiary',
              rsbsaId: r.farmer?.registryId || 'RSBSA-PENDING',
              machine: r.asset?.name || 'Machinery Asset',
              hectares: r.hectares || 1.0,
              rate: r.asset?.rate || 2500,
              date: r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
              location: r.asset?.location || 'Tagum City',
              totalEstimated: `₱${(r.totalCost || ((r.hectares || 1) * 2500)).toLocaleString()}`,
              operatorName: 'Depot Assigned Operator',
              operatorPhone: '0919-000-0002',
              operatorCert: 'TESDA Heavy Equipment NC-II',
              fuelTerms: 'Standard Co-op Agreement',
              settlementType: 'Cash-on-Dike Settlement',
              status: r.status || 'pending'
            }));
            setRequestsList(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newItems = mappedDbRequests.filter(m => !existingIds.has(m.id));
              return [...newItems, ...prev];
            });
          }
          setData(d);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));

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
  }, [status, session, router]);

  // Synchronize hash in URL to active tabs (#fleet, #queue, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#fleet' || hash === '#machinery') {
        setActiveTab('machinery');
      } else if (hash === '#queue' || hash === '#dispatches' || hash === '#requests') {
        setActiveTab('dispatches');
      } else if (hash === '#needs' || hash === '#farmer_needs') {
        setActiveTab('farmer_needs');
      } else if (hash === '#rotation' || hash === '#calendar') {
        setActiveTab('rotation');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Handle Preset Click
  const handleApplyPreset = (preset) => {
    const isInclusive = fuelMode === 'depot_fuel';
    const rateAdjustment = isInclusive ? 400 : 0;
    const finalRate = preset.rate + (preset.unit === 'per_ha' ? rateAdjustment : 0);

    setNewMachine({
      name: preset.name,
      type: preset.category,
      horsepower: preset.hp,
      rate: finalRate,
      unit: preset.unit,
      location: 'Tagum City, Davao del Norte',
      description: preset.description,
      fuelTerms: isInclusive ? 'Fuel Inclusive (+₱400/ha Depot Diesel)' : preset.fuelTerms
    });
  };

  // Handle Fuel Mode Toggle
  const handleFuelModeToggle = (mode) => {
    setFuelMode(mode);
    if (mode === 'depot_fuel') {
      setNewMachine(prev => ({
        ...prev,
        rate: prev.unit === 'per_ha' ? prev.rate + 400 : prev.rate,
        fuelTerms: 'Fuel Inclusive (Depot Diesel absorbed at pump variance)'
      }));
    } else {
      setNewMachine(prev => ({
        ...prev,
        rate: prev.unit === 'per_ha' ? Math.max(100, prev.rate - 400) : prev.rate,
        fuelTerms: 'Farmer supplies 18L Diesel/ha (Standard work)'
      }));
    }
  };

  // Open Operator Assignment Modal for a Farmer Need
  const handleOpenAssignModalForNeed = (need) => {
    setAssignContext('need');
    setAssignTargetItem(need);
    setAssignedMachineName(need.machineType.includes('Harvester') ? 'Kubota DC-70 Plus Combine Harvester' : need.machineType.includes('Tractor') ? 'Yanmar EF494T 4WD Heavy Duty Tractor' : 'DJI Agras T40 Precision Crop Sprayer');
    
    // Suggest relevant operator
    if (need.machineType.includes('Drone') || need.machineType.includes('Sprayer')) {
      setAssignedOperatorName('Licensed Drone Pilot #1');
      setAssignedOperatorPhone('0908-000-0004');
      setAssignedOperatorCert('CAAP Remote Pilot #RP-2024 / DA Precision Agri');
    } else if (need.machineType.includes('Tractor')) {
      setAssignedOperatorName('Accredited Operator #2');
      setAssignedOperatorPhone('0928-000-0003');
      setAssignedOperatorCert('TESDA NC-II / DA-PhilMech Cert #402');
    } else {
      setAssignedOperatorName('Accredited Operator #1');
      setAssignedOperatorPhone('0919-000-0002');
      setAssignedOperatorCert('TESDA NC-II / DA-PhilMech Cert #819');
    }

    setAssignDispatchDate(need.targetDate.includes('2026') ? need.targetDate : '2026-10-14');
    setIsAssignModalOpen(true);
  };

  // Open Operator Assignment Modal for a Request Ticket (Reassign)
  const handleOpenAssignModalForRequest = (req) => {
    setAssignContext('request');
    setAssignTargetItem(req);
    setAssignedMachineName(req.machine);
    setAssignedOperatorName(req.operatorName || 'Accredited Operator #1');
    setAssignedOperatorPhone(req.operatorPhone || '0919-000-0002');
    setAssignedOperatorCert(req.operatorCert || 'TESDA NC-II / DA-PhilMech Cert #819');
    setAssignDispatchDate(req.date || '2026-10-14');
    setIsAssignModalOpen(true);
  };

  // Confirm Operator Assignment
  const handleConfirmAssignment = (e) => {
    e.preventDefault();

    if (assignContext === 'need' && assignTargetItem) {
      // Mark need as accepted
      setFarmerNeeds(prev => prev.map(n => n.id === assignTargetItem.id ? { ...n, status: 'accepted' } : n));

      // Calculate cost
      const ha = assignTargetItem.hectares || 2.0;
      const ratePerHa = assignTargetItem.machineType.includes('Harvester') ? 2800 : assignTargetItem.machineType.includes('Tractor') ? 2400 : 950;
      const totalCost = ha * ratePerHa;

      // Add to requestsList
      const newReq = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        farmerName: assignTargetItem.farmerName,
        rsbsaId: assignTargetItem.rsbsaId,
        machine: assignedMachineName,
        hectares: ha,
        rate: ratePerHa,
        date: assignDispatchDate,
        location: assignTargetItem.location,
        totalEstimated: `₱${totalCost.toLocaleString()}`,
        operatorName: assignedOperatorName,
        operatorPhone: assignedOperatorPhone,
        operatorCert: assignedOperatorCert,
        fuelTerms: assignFuelOption,
        settlementType: 'Cash-on-Dike Settlement',
        status: 'dispatched'
      };

      setRequestsList([newReq, ...requestsList]);
      setPostSuccessMessage(`Assigned ${assignedOperatorName} to ${assignTargetItem.farmerName}! Dispatch Ticket created.`);
    } else if (assignContext === 'request' && assignTargetItem) {
      // Reassign on existing request
      setRequestsList(prev => prev.map(r => r.id === assignTargetItem.id ? {
        ...r,
        operatorName: assignedOperatorName,
        operatorPhone: assignedOperatorPhone,
        operatorCert: assignedOperatorCert,
        machine: assignedMachineName,
        fuelTerms: assignFuelOption,
        status: 'dispatched'
      } : r));
      setPostSuccessMessage(`Successfully updated assigned operator to ${assignedOperatorName} for ticket ${assignTargetItem.id}.`);

      const targetDbId = assignTargetItem.dbId || assignTargetItem.id;
      fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetDbId,
          status: 'dispatched',
          notes: `Assigned: ${assignedOperatorName} (${assignedOperatorPhone}) | Machine: ${assignedMachineName} | Fuel: ${assignFuelOption}`
        })
      }).catch(console.error);
    }

    setIsAssignModalOpen(false);
    setTimeout(() => setPostSuccessMessage(''), 5000);
  };

  // Handle Post New Machine
  const handlePostMachine = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMachine.name,
          type: newMachine.type,
          rate: newMachine.rate,
          unit: newMachine.unit,
          location: newMachine.location,
          description: `${newMachine.description} (${newMachine.fuelTerms})`,
          providerId: session?.user?.id
        })
      });

      const newAssetItem = {
        id: `ast-${Date.now()}`,
        name: newMachine.name,
        type: newMachine.type,
        horsepower: newMachine.horsepower,
        location: newMachine.location,
        rate: parseFloat(newMachine.rate),
        unit: newMachine.unit,
        status: 'available',
        fuelTerms: newMachine.fuelTerms,
        operator: 'Accredited Depot Operator'
      };

      setLocalAssets([newAssetItem, ...localAssets]);
      setPostSuccessMessage(`Successfully registered ${newMachine.name} with PhilMech rate ₱${newMachine.rate}! Now active in Marketplace.`);
      setIsPostModalOpen(false);

      setTimeout(() => {
        setPostSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Cropping Block Reservation
  const handleAddCroppingBlock = (e) => {
    e.preventDefault();
    const newBlock = {
      id: `BLK-${Date.now().toString().slice(-2)}`,
      sector: newBlockSector,
      machine: newBlockMachine,
      operator: 'Accredited Operator #1',
      dateRange: newBlockDates,
      hectares: parseFloat(newBlockHectares) || 10.0,
      status: 'Reserved / Locked'
    };
    setReservedBlocks([newBlock, ...reservedBlocks]);
    setIsBlockModalOpen(false);
    setPostSuccessMessage(`Cropping Block locked for ${newBlockSector} (${newBlockDates}). Double-booking locked.`);
    setTimeout(() => setPostSuccessMessage(''), 5000);
  };

  const handleRequestStatus = async (id, newStatus) => {
    setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const targetItem = requestsList.find(r => r.id === id);
    const dbId = targetItem?.dbId || id;
    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dbId,
          status: newStatus
        })
      });
    } catch (err) {
      console.error('Failed to sync status to backend:', err);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-surface">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
          <p className="text-sm font-mono text-soil-slate">Loading Provider Depot & Fleet Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-16">
      
      {/* ============================================================================
          1. HEADER SECTION
          Description: Displays provider profile, registry status, and global actions
          Style: Clean flat background, airy padding, sharp borders, prominent green accent
          ============================================================================ */}
      <div className="bg-white border-b-4 border-[#005426] text-gray-900 py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Tractor className="w-4 h-4 text-[#005426]" />
                <span>MACHINERY PROVIDER & SACCO DEPOT</span>
              </span>
              <span className="text-xs text-gray-500 font-mono font-bold">DA-PhilMech Regional Station</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900">
              {session?.user?.name || 'Tagum Agrarian Reform Beneficiaries Co-op (TARBCO)'}
            </h1>
            
            <p className="text-gray-600 font-mono text-sm mt-3 flex flex-wrap items-center gap-x-2">
              <span>Registry: <strong className="text-gray-900">{session?.user?.registryId || 'provider-1-23-A001'}</strong></span>
              <span className="text-gray-300">•</span>
              <span>Depot Station: Tagum City Corridors ({localAssets.length} Active Fleet Units)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Unified Daily Dispatch Roster Link */}
            <Link
              href="/daily-roster"
              className="px-6 py-3 bg-white text-[#005426] text-sm font-black border-2 border-[#005426] flex items-center gap-2"
              title="Open and print daily 5:00 AM dispatch briefing roster"
            >
              <ClipboardList className="w-5 h-5 text-[#005426]" />
              <span>Daily Dispatch Roster</span>
              <ArrowUpRight className="w-4 h-4 text-[#005426]" />
            </Link>

            {/* Post Tractor */}
            <button
              type="button"
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-3 bg-[#005426] text-white text-sm font-black flex items-center gap-2 cursor-pointer border border-[#005426]"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>+ Post Machinery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {postSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#005426] text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{postSuccessMessage}</span>
            </div>
            <button onClick={() => setPostSuccessMessage('')} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        
        {/* ============================================================================
            PATALASTAS NG BARANGGAY (ANNOUNCEMENTS)
            ============================================================================ */}
        {announcements.length > 0 && (
          <div className="mb-10">
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
                    <Users className="w-4 h-4" />
                    <span>Posted by {ann.author?.name || 'Admin'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================
            2. TOP METRIC CARDS
            Description: High-level overview of active fleet, operators, and dispatches
            Style: Sharp cards, prominent padding
            ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Active Fleet</span>
              <div className="w-12 h-12 bg-emerald-50 text-[#005426] flex items-center justify-center border border-emerald-200">
                <Tractor className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 text-4xl font-black text-gray-900 font-mono">{localAssets.length} Units</div>
            <span className="text-sm text-gray-500 mt-2 block">Tractors, Harvesters & Dryers</span>
          </div>

          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Certified Operators</span>
              <div className="w-12 h-12 bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <HardHat className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 text-4xl font-black text-amber-700 font-mono">{certifiedOperators.length} Active</div>
            <span className="text-sm text-gray-500 mt-2 block">DA & TESDA Certified</span>
          </div>

          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Farmer Needs Feed</span>
              <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <Radio className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 text-4xl font-black text-red-600 font-mono">{farmerNeeds.filter(n => n.status === 'open').length} Open</div>
            <span className="text-sm text-gray-500 mt-2 block">Live Barangay Broadcasts</span>
          </div>

          <div className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono uppercase text-gray-500 font-bold">Active Dispatches</span>
              <div className="w-12 h-12 bg-emerald-50 text-[#005426] flex items-center justify-center border border-emerald-200">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 text-4xl font-black text-[#005426] font-mono">{requestsList.length} Slips</div>
            <span className="text-sm text-gray-500 mt-2 block">Cash-on-Dike & SACCO</span>
          </div>
        </div>

        {/* ============================================================================
            3. TAB SWITCHER
            Description: Navigation between Fleet, Needs, Dispatches, and Rotation
            ============================================================================ */}
        <div className="flex border-b-2 border-gray-200 mb-8 gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('machinery')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${
              activeTab === 'machinery'
                ? 'border-[#005426] text-[#005426] font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tractor className="w-5 h-5" />
            <span>Depot Fleet ({localAssets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('farmer_needs')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${
              activeTab === 'farmer_needs'
                ? 'border-amber-600 text-amber-700 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Radio className="w-5 h-5 text-red-500" />
            <span>Farmer Needs Feed ({farmerNeeds.filter(n => n.status === 'open').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dispatches')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${
              activeTab === 'dispatches'
                ? 'border-[#005426] text-[#005426] font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Equipment Dispatches & Operators ({requestsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rotation')}
            className={`pb-4 px-6 text-sm sm:text-base font-bold flex items-center gap-3 border-b-4 cursor-pointer whitespace-nowrap ${
              activeTab === 'rotation'
                ? 'border-[#005426] text-[#005426] font-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Harvest Rotation & Availability</span>
          </button>
        </div>

        {/* ============================================================================
            4. TAB 1: MACHINERY FLEET
            ============================================================================ */}
        {activeTab === 'machinery' && (
          <div id="fleet">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Registered Machinery Fleet</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Municipal co-op depot units with verified PhilMech rates and assigned institutional operators.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(true)}
                  className="px-6 py-3 bg-[#005426] text-white text-sm font-black border border-[#005426] flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>Post New Equipment</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localAssets.map((asset) => (
                <div key={asset.id} className="bg-white p-8 border border-gray-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono uppercase px-3 py-1 bg-gray-100 font-bold text-gray-900 border border-gray-300">
                        {asset.type}
                      </span>
                      <span className={`text-xs font-mono px-3 py-1 font-bold uppercase border ${
                        asset.status === 'available'
                          ? 'bg-emerald-50 text-[#005426] border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}>
                        {asset.status}
                      </span>
                    </div>

                    <h3 className="font-black text-xl text-gray-900 leading-tight">{asset.name}</h3>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-mono">
                      <MapPin className="w-4 h-4 text-[#005426]" />
                      <span>{asset.location}</span>
                    </p>

                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 space-y-2 text-sm">
                      <p className="text-gray-700 flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="truncate"><strong>Assigned:</strong> {asset.operator}</span>
                      </p>
                      {asset.fuelTerms && (
                        <p className="text-gray-600 text-xs flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="truncate">{asset.fuelTerms}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-gray-500 uppercase block font-bold">Service Rate</span>
                      <span className="text-2xl font-black text-amber-800 font-mono">
                        ₱{asset.rate?.toLocaleString()} <span className="text-sm font-normal text-gray-600">/ {asset.unit === 'per_ha' ? 'ha' : asset.unit === 'per_bag' ? 'bag' : 'day'}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/dispatch-slip?machine=${encodeURIComponent(asset.name)}&operator=${encodeURIComponent(asset.operator)}&rate=${asset.rate}`}
                        className="px-5 py-3 bg-gray-100 hover:bg-[#005426] hover:text-white hover:border-[#005426] text-sm font-bold text-gray-900 transition-none flex items-center gap-2 border border-gray-300"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Dispatch Slip</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================
            5. TAB 2: FARMER NEEDS FEED
            ============================================================================ */}
        {activeTab === 'farmer_needs' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span>Farmer Machinery Needs & Service Requests</span>
                <span className="text-xs font-mono px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                  Live Barangay Broadcast
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Broadcasted requests from RSBSA-verified farmers in your agrarian corridor. Accept to assign your accredited operator and issue an official dispatch ticket.
              </p>
            </div>

            <div className="space-y-6">
              {farmerNeeds.map((need) => (
                <div
                  key={need.id}
                  className={`bg-white p-6 md:p-8 border transition-none ${
                    need.status === 'accepted'
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-[#005426]">{need.id}</span>
                        <span className={`text-xs font-mono uppercase px-3 py-1 font-bold border ${need.urgencyBadge}`}>
                          {need.urgency}
                        </span>
                      </div>
                      <h3 className="font-black text-xl text-gray-900 mt-2">{need.serviceNeeded}</h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono text-gray-500 uppercase block font-bold">Target Schedule Date</span>
                      <span className="font-black text-sm text-gray-900 font-mono mt-1 block">{need.targetDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs font-mono uppercase block font-bold">Farmer & Location</span>
                      <strong className="text-gray-900 block mt-1">{need.farmerName}</strong>
                      <p className="text-gray-600 font-mono text-xs mt-1">{need.location}</p>
                    </div>

                    <div>
                      <span className="text-gray-500 text-xs font-mono uppercase block font-bold">Land Parcel Size</span>
                      <strong className="text-gray-900 block mt-1">{need.hectares} Hectares</strong>
                      <p className="text-gray-600 text-xs mt-1">Category: {need.machineType}</p>
                    </div>

                    <div>
                      <span className="text-gray-500 text-xs font-mono uppercase block font-bold">Offered Budget</span>
                      <strong className="text-amber-800 text-lg block mt-1">{need.offeredBudget}</strong>
                      <p className="text-gray-600 text-xs mt-1">Settlement on dike</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 text-sm text-gray-700 mb-6">
                    <strong className="text-gray-900">Farmer Field Notes: </strong>
                    {need.notes}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <span className="text-xs font-mono text-gray-500 font-bold">
                      RSBSA: {need.rsbsaId} • Guaranteed by Barangay MAO Desk
                    </span>

                    {need.status === 'accepted' ? (
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Accepted! Operator assigned & ticket active</span>
                        <Link
                          href={`/dispatch-slip?farmer=${encodeURIComponent(need.farmerName)}&rsbsa=${encodeURIComponent(need.rsbsaId)}&location=${encodeURIComponent(need.location)}&hectares=${need.hectares}`}
                          className="ml-4 underline text-[#005426] hover:text-[#003618]"
                        >
                          Open Dispatch Slip
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModalForNeed(need)}
                        className="px-6 py-3 bg-[#005426] text-white text-sm font-black flex items-center gap-2 cursor-pointer border border-[#005426]"
                      >
                        <HardHat className="w-5 h-5 text-amber-300" />
                        <span>Assign Operator & Dispatch Machinery</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================
            6. TAB 3: DISPATCH TICKETS & OPERATORS
            ============================================================================ */}
        {activeTab === 'dispatches' && (
          <div id="queue">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Field Job Tickets & Operator Dispatches</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Active movement slips with mapped accredited drivers, contact protocols, and settlement verification.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(true)}
                  className="px-6 py-3 bg-white border border-gray-300 hover:border-[#005426] text-sm font-black text-gray-900 flex items-center gap-2 cursor-pointer transition-none"
                >
                  <ClipboardList className="w-5 h-5 text-[#005426]" />
                  <span>Daily Roster (A4 / Thermal)</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {requestsList.map((req) => (
                <div key={req.id} className="bg-white p-6 md:p-8 border border-gray-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-[#005426] transition-none">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-black text-[#005426]">{req.id}</span>
                      <span className={`text-xs font-mono uppercase px-3 py-1 font-bold border ${
                        req.status === 'dispatched'
                          ? 'bg-emerald-50 text-[#005426] border-emerald-300'
                          : req.status === 'completed'
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs font-mono text-gray-500 font-bold">
                        • {req.date}
                      </span>
                    </div>

                    <h3 className="font-black text-xl text-gray-900">{req.machine}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mt-4">
                      <p>
                        Client: <strong className="text-gray-900">{req.farmerName}</strong> ({req.rsbsaId})
                      </p>
                      <p>
                        Parcel: <span className="font-bold text-gray-900">{req.location}</span> ({req.hectares} ha)
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <HardHat className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Operator: <strong className="text-gray-900">{req.operatorName}</strong></span>
                        <a href={`tel:${req.operatorPhone}`} className="font-mono font-bold text-[#005426] hover:underline ml-1">
                          ({req.operatorPhone})
                        </a>
                      </div>
                      <p className="mt-2">
                        Fuel: <span className="font-mono text-xs text-gray-600 font-bold">{req.fuelTerms}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-200">
                    <div className="text-left lg:text-right">
                      <span className="text-xs font-mono text-gray-500 uppercase block font-bold">Settlement Value</span>
                      <span className="text-xl font-black text-[#005426] font-mono">{req.totalEstimated}</span>
                      <span className="text-xs text-gray-600 block">{req.settlementType}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {req.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleRequestStatus(req.id, 'dispatched')}
                          className="px-6 py-3 bg-[#005426] hover:bg-[#003618] text-white text-sm font-black cursor-pointer transition-none border border-[#005426]"
                        >
                          Approve
                        </button>
                      )}

                      {/* Reassign Operator */}
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModalForRequest(req)}
                        className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 text-sm font-black cursor-pointer flex items-center gap-2 transition-none border border-gray-300"
                        title="Change assigned driver"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Reassign Driver</span>
                      </button>

                      {/* Print A4 Slip */}
                      <Link
                        href={`/dispatch-slip?ticket=${encodeURIComponent(req.id)}&machine=${encodeURIComponent(req.machine)}&operator=${encodeURIComponent(req.operatorName)}&phone=${encodeURIComponent(req.operatorPhone)}&farmer=${encodeURIComponent(req.farmerName)}&rsbsa=${encodeURIComponent(req.rsbsaId)}&location=${encodeURIComponent(req.location)}&hectares=${req.hectares}&rate=${req.rate}&settlement=${encodeURIComponent(req.settlementType)}`}
                        className="px-6 py-3 bg-gray-100 text-gray-900 text-sm font-black hover:bg-[#005426] hover:text-white flex items-center gap-2 transition-none border border-gray-300"
                      >
                        <FileText className="w-4 h-4" />
                        <span>A4 Slip</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================
            7. TAB 4: HARVEST ROTATION & CALENDAR
            ============================================================================ */}
        {activeTab === 'rotation' && (
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 border border-gray-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-amber-700" />
                    <h2 className="text-xl font-black text-gray-900">
                      Cropping Block Reservations (Harvest Rotation Lock)
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Locks fleet units to geographic blocks during peak harvest season, preventing double-booking across the 10 depots.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(true)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 text-sm font-black flex items-center gap-2 cursor-pointer border border-amber-600 transition-none"
                >
                  <Plus className="w-5 h-5" />
                  <span>Reserve Cropping Block</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {reservedBlocks.map((blk) => (
                  <div key={blk.id} className="p-6 bg-gray-50 border border-gray-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black text-amber-800">{blk.id}</span>
                        <span className="px-3 py-1 text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          {blk.status}
                        </span>
                      </div>
                      <h4 className="font-black text-lg text-gray-900 mt-3">{blk.sector}</h4>
                      <p className="text-sm text-gray-600 mt-1">{blk.machine} • {blk.operator}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300 flex items-center justify-between text-sm font-mono">
                      <span className="text-gray-500 font-bold">{blk.dateRange}</span>
                      <strong className="text-[#005426] font-black">{blk.hectares} ha total</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Agrarian Operations Calendar */}
            <div className="bg-white p-2 border border-gray-300">
              <SmartCalendar />
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ASSIGN OPERATOR & DISPATCH */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#DDE3DA] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#005426] flex items-center justify-center border border-emerald-100">
                  <HardHat className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-lg font-black text-gray-950">
                  {assignContext === 'need' ? 'Assign Operator & Dispatch Machinery' : 'Reassign Driver & Machinery'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-3.5 text-xs">
              {assignTargetItem && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-400 uppercase font-semibold">Recipient Farmer</span>
                    <span className="font-mono font-bold text-[#005426] text-xs">{assignTargetItem.rsbsaId || assignTargetItem.id}</span>
                  </div>
                  <div className="font-bold text-gray-900">{assignTargetItem.farmerName}</div>
                  <div className="text-[11px] text-gray-500">{assignTargetItem.location} ({assignTargetItem.hectares} ha)</div>
                </div>
              )}

              {/* Machinery Unit Selection */}
              <div>
                <SmartSearchSelect
                  label="Select Depot Fleet Unit"
                  options={localAssets.map(a => ({
                    value: a.name,
                    label: a.name,
                    subtitle: `${a.horsepower} • Rate: ₱${a.rate}/${a.unit === 'per_ha' ? 'ha' : a.unit === 'per_bag' ? 'bag' : 'day'}`,
                    icon: a.type === 'harvester' ? 'agriculture' : a.type === 'tractor' ? 'forklift' : 'precision_manufacturing'
                  }))}
                  value={assignedMachineName}
                  onChange={(val) => setAssignedMachineName(val)}
                  placeholder="Select fleet unit..."
                  searchPlaceholder="Filter machinery..."
                  icon="agriculture"
                  required
                />
              </div>

              {/* Certified Operator Selection */}
              <div>
                <SmartSearchSelect
                  label="Assign Certified Driver / Operator"
                  options={certifiedOperators.map(op => ({
                    value: op.name,
                    label: op.name,
                    subtitle: `${op.cert} • Hotline: ${op.phone} (${op.rating})`,
                    icon: 'engineering'
                  }))}
                  value={assignedOperatorName}
                  onChange={(val) => {
                    setAssignedOperatorName(val);
                    const found = certifiedOperators.find(o => o.name === val);
                    if (found) {
                      setAssignedOperatorPhone(found.phone);
                      setAssignedOperatorCert(found.cert);
                    }
                  }}
                  placeholder="Search accredited operator..."
                  searchPlaceholder="Search operator name or cert..."
                  icon="engineering"
                  allowCustom={true}
                  required
                />
              </div>

              {/* Operator Phone Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Driver Hotline</label>
                  <input
                    type="text"
                    value={assignedOperatorPhone}
                    onChange={(e) => setAssignedOperatorPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-xs text-gray-900 focus:outline-none focus:border-[#005426]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dispatch Schedule Date</label>
                  <input
                    type="date"
                    value={assignDispatchDate}
                    onChange={(e) => setAssignDispatchDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-xs text-gray-900 focus:outline-none focus:border-[#005426]"
                    required
                  />
                </div>
              </div>

              {/* Time Slot & Fuel Arrangement */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Field Time Slot</label>
                  <input
                    type="text"
                    value={assignTimeSlot}
                    onChange={(e) => setAssignTimeSlot(e.target.value)}
                    placeholder="e.g. 06:00 AM – 01:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 focus:outline-none focus:border-[#005426]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fuel Allocation</label>
                  <select
                    value={assignFuelOption}
                    onChange={(e) => setAssignFuelOption(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 font-medium cursor-pointer focus:outline-none focus:border-[#005426]"
                  >
                    <option value="Farmer supplies 18L Diesel/ha">Farmer supplies 18L Diesel/ha</option>
                    <option value="Fuel Inclusive (Depot Diesel)">Fuel Inclusive (Depot Diesel)</option>
                    <option value="Solar Battery Charged (Zero Fuel)">Solar Battery Charged (Zero Fuel)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#005426] hover:bg-[#004720] text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Dispatch & Generate Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: POST TRACTOR / MACHINERY WITH PHILMECH PRESETS */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#DDE3DA] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#005426] flex items-center justify-center border border-emerald-100">
                  <Tractor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-950">Post Machinery with PhilMech Presets</h3>
                  <p className="text-[11px] text-gray-500">Standardized pricing by crop type to prevent price gouging.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PhilMech Presets Bar */}
            <div>
              <label className="block font-bold text-gray-600 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                PhilMech Standard Presets (Click to Auto-Fill):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {philmechPresets.map((pr) => (
                  <button
                    key={pr.name}
                    type="button"
                    onClick={() => handleApplyPreset(pr)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#005426] hover:bg-emerald-50/50 text-xs text-left transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Tractor className="w-3.5 h-3.5 text-[#005426]" />
                    <span className="font-bold text-gray-900">{pr.name.split(' ')[0]} {pr.name.split(' ')[1]}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 font-mono font-bold text-[10px]">
                      {pr.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Policy Switcher */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-gray-600 uppercase">Fuel Policy Switcher:</span>
                <span className="text-[10px] font-mono text-[#005426] font-bold">
                  {fuelMode === 'farmer_fuel' ? 'Farmer supplies diesel' : 'Depot supplies diesel (+₱400/ha)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFuelModeToggle('farmer_fuel')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    fuelMode === 'farmer_fuel'
                      ? 'bg-[#005426] text-white border-[#005426] shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span>Farmer Diesel (18L/ha)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFuelModeToggle('depot_fuel')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    fuelMode === 'depot_fuel'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:text-gray-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fuel Inclusive (+₱400/ha)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handlePostMachine} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Equipment Name & Model</label>
                <input
                  type="text"
                  required
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  placeholder="e.g. Kubota M7040 4WD Heavy Tractor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm text-gray-900 focus:outline-none focus:border-[#005426]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SmartSearchSelect
                    label="Category Type"
                    options={MACHINERY_CATEGORIES}
                    value={newMachine.type}
                    onChange={(val) => setNewMachine({ ...newMachine, type: val })}
                    placeholder="Search category..."
                    searchPlaceholder="Filter category..."
                    icon="category"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Horsepower / Rating</label>
                  <input
                    type="text"
                    value={newMachine.horsepower}
                    onChange={(e) => setNewMachine({ ...newMachine, horsepower: e.target.value })}
                    placeholder="e.g. 70 HP Turbo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#005426]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Custom Rate (₱ PHP)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    step="10"
                    value={newMachine.rate}
                    onChange={(e) => setNewMachine({ ...newMachine, rate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-sm text-[#005426] focus:outline-none focus:border-[#005426]"
                  />
                </div>

                <div>
                  <SmartSearchSelect
                    label="Billing Unit"
                    options={BILLING_UNITS}
                    value={newMachine.unit}
                    onChange={(val) => setNewMachine({ ...newMachine, unit: val })}
                    placeholder="Select unit..."
                    icon="attach_money"
                  />
                </div>
              </div>

              <div>
                <SmartSearchSelect
                  label="Depot / Barangay Location"
                  options={[
                    { value: 'Brgy. San Manuel, Tagum City', label: 'Brgy. San Manuel, Tagum City', subtitle: 'Central Agrarian Hub', icon: 'location_on' },
                    { value: 'Brgy. Apokon, Tagum City', label: 'Brgy. Apokon, Tagum City', subtitle: 'Apokon FCA Depot Station', icon: 'location_on' },
                    { value: 'Brgy. Mankilam, Tagum City', label: 'Brgy. Mankilam, Tagum City', subtitle: 'Mankilam Lowland Station', icon: 'location_on' },
                    { value: 'Brgy. Pagsabangan, Tagum City', label: 'Brgy. Pagsabangan, Tagum City', subtitle: 'Irrigation Lateral Silo', icon: 'location_on' },
                    { value: 'Brgy. Magugpo East, Tagum City', label: 'Brgy. Magugpo East, Tagum City', subtitle: 'Provincial Trade Depot', icon: 'location_on' },
                  ]}
                  value={newMachine.location}
                  onChange={(val) => setNewMachine({ ...newMachine, location: val })}
                  placeholder="Select depot location..."
                  searchPlaceholder="Search barangay..."
                  icon="location_on"
                  allowCustom={true}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Fuel Terms & Operator Details</label>
                <input
                  type="text"
                  value={newMachine.fuelTerms}
                  onChange={(e) => setNewMachine({ ...newMachine, fuelTerms: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 focus:outline-none focus:border-[#005426]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#005426] hover:bg-[#004720] text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Machinery Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* MODAL 4: RESERVE CROPPING BLOCK */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#DDE3DA] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Calendar className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-lg font-black text-gray-950">Reserve Cropping Block</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCroppingBlock} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cropping Sector / Block Name</label>
                <input
                  type="text"
                  required
                  value={newBlockSector}
                  onChange={(e) => setNewBlockSector(e.target.value)}
                  placeholder="e.g. Purok 4 Mankilam Rice Basin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-gray-900 focus:outline-none focus:border-[#005426]"
                />
              </div>

              <div>
                <SmartSearchSelect
                  label="Reserved Machinery Unit"
                  options={localAssets.map(a => ({
                    value: a.name,
                    label: a.name,
                    subtitle: `Rate: ₱${a.rate}/${a.unit}`,
                    icon: 'agriculture'
                  }))}
                  value={newBlockMachine}
                  onChange={(val) => setNewBlockMachine(val)}
                  placeholder="Select machine..."
                  icon="agriculture"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reserved Date Range</label>
                  <input
                    type="text"
                    required
                    value={newBlockDates}
                    onChange={(e) => setNewBlockDates(e.target.value)}
                    placeholder="e.g. Oct 20 – Oct 23, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#005426]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Hectares</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBlockHectares}
                    onChange={(e) => setNewBlockHectares(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-[#005426] focus:outline-none focus:border-[#005426]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-black cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-[0.98] transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock Block Reservation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
