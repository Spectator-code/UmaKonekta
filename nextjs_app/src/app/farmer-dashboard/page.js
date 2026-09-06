'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FarmerDashboardPage() {
  const [activeTab, setActiveTab] = useState('bookings');

  const farmerProfile = {
    name: 'Juan Dela Cruz',
    rsbsaNumber: 'RSBSA-03-49-12-00481',
    cooperative: 'San Manuel Agrarian Beneficiaries Co-op (SMABC)',
    parcelLocation: 'Sitio Balite, Brgy. San Manuel, Tarlac',
    totalArea: '3.2 Hectares (Irrigated Lowland Palay)',
    coopPassbookNumber: 'PB-2026-08841',
  };

  const passbookBalance = {
    cashCredit: 14250.0,
    palaySacksReserve: 38,
    fertilizerVoucherCredit: 3000.0,
    activeBookingsCount: 2,
  };

  const activeBookings = [
    {
      id: 'BK-2026-904',
      machine: 'Yanmar EF494T 4WD Heavy Duty Tractor',
      service: 'Land Preparation & Rotary Tilling (1.5 ha)',
      operator: 'Mang Danilo Ramos',
      scheduledDate: 'Tomorrow, Oct 12 • 06:00 AM',
      settlementType: 'Cash-on-Dike',
      totalCost: 3600.0,
      status: 'Operator Dispatched',
      statusColor: 'bg-status-available-bg text-status-available',
    },
    {
      id: 'BK-2026-882',
      machine: 'Kubota DC-70 Plus Combine Harvester',
      service: 'Mechanical Palay Harvesting & Threshing (1.7 ha)',
      operator: 'Ka Nestor Panganiban',
      scheduledDate: 'Oct 18, 2026 • 07:30 AM',
      settlementType: 'SACCO 8% Palay Split',
      totalCost: 4760.0,
      status: 'Confirmed by Co-op',
      statusColor: 'bg-harvest-amber/20 text-field-ochre',
    },
  ];

  const transactionLedger = [
    {
      date: 'Oct 08, 2026',
      desc: 'Palay Harvest SACCO Scale Weigh-in (#ST-7712)',
      type: 'Credit (Palay Grain)',
      amount: '+ 42 Sacks (2,100 kg)',
      method: 'SACCO Scale Ticket',
      balance: '38 Sacks remaining',
    },
    {
      date: 'Oct 04, 2026',
      desc: 'Rotary Tiller Field Service Settlement',
      type: 'Debit (Cash Paid on Dike)',
      amount: '- ₱2,400.00',
      method: 'Cash-on-Dike (Rec. #6601)',
      balance: '₱14,250.00',
    },
    {
      date: 'Sep 28, 2026',
      desc: 'DA-LGU Hybrid Palay Seed Subsidy Release',
      type: 'Co-op Credit',
      amount: '+ ₱4,000.00',
      method: 'Passbook Dividend',
      balance: '₱16,650.00',
    },
    {
      date: 'Sep 15, 2026',
      desc: 'Urea Fertilizer 46-0-0 Cooperative Advance (3 bags)',
      type: 'Debit (Passbook Advance)',
      amount: '- ₱5,400.00',
      method: 'Passbook Loan Deduction',
      balance: '₱12,650.00',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Title */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs font-mono text-soil-slate mb-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-primary font-bold">Farmer Dashboard</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">
              Farmer Member Ledger & Passbook
            </h1>
            <p className="text-sm text-soil-slate mt-1">
              Agrarian beneficiary record, cooperative savings, and field job schedules.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-border-soft text-soil-slate text-xs font-bold hover:text-primary hover:border-primary transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Passbook</span>
            </button>
            <Link
              href="/marketplace"
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Machine Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-border-soft shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 md:col-span-2">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-2xl shadow-sm">
              JD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-on-surface">{farmerProfile.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-status-available-bg text-status-available text-[10px] font-mono font-bold">
                  Verified RSBSA
                </span>
              </div>
              <p className="text-xs font-mono text-soil-slate mt-0.5">{farmerProfile.rsbsaNumber}</p>
              <p className="text-xs text-soil-slate mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-field-ochre">holiday_village</span>
                {farmerProfile.cooperative}
              </p>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-border-soft/80 pt-4 md:pt-0 md:pl-6 text-xs space-y-1">
            <p className="text-soil-slate font-mono uppercase text-[10px]">Registered Parcel</p>
            <p className="font-bold text-on-surface">{farmerProfile.parcelLocation}</p>
            <p className="text-soil-slate font-semibold">{farmerProfile.totalArea}</p>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-border-soft/80 pt-4 md:pt-0 md:pl-6 text-xs space-y-1">
            <p className="text-soil-slate font-mono uppercase text-[10px]">Passbook Account</p>
            <p className="font-mono font-bold text-primary text-sm">{farmerProfile.coopPassbookNumber}</p>
            <span className="inline-block px-2 py-0.5 rounded bg-surface-container text-soil-slate text-[10px] font-mono">
              Zero Transaction Fee
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Balance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-border-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-soil-slate uppercase">Co-op Cash Balance</span>
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
          </div>
          <p className="text-2xl font-black text-primary font-mono">
            ₱{passbookBalance.cashCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-soil-slate mt-1">Available for machinery offset</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-border-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-soil-slate uppercase">Palay Grain Share</span>
            <span className="material-symbols-outlined text-field-ochre text-[20px]">grass</span>
          </div>
          <p className="text-2xl font-black text-field-ochre font-mono">
            {passbookBalance.palaySacksReserve} Sacks
          </p>
          <p className="text-[11px] text-soil-slate mt-1">Grade A Clean & Dry in SACCO Bodega</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-border-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-soil-slate uppercase">DA Fuel Voucher</span>
            <span className="material-symbols-outlined text-leaf-green text-[20px]">local_gas_station</span>
          </div>
          <p className="text-2xl font-black text-leaf-green font-mono">
            ₱{passbookBalance.fertilizerVoucherCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-soil-slate mt-1">Applicable to tractor diesel runs</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-border-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-soil-slate uppercase">Active Machinery</span>
            <span className="material-symbols-outlined text-soil-slate text-[20px]">precision_manufacturing</span>
          </div>
          <p className="text-2xl font-black text-on-surface font-mono">
            {passbookBalance.activeBookingsCount} Field Jobs
          </p>
          <p className="text-[11px] text-soil-slate mt-1">Scheduled within next 7 days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-soft mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-primary text-primary'
              : 'border-transparent text-soil-slate hover:text-on-surface'
          }`}
        >
          Active Field Requests ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'ledger'
              ? 'border-primary text-primary'
              : 'border-transparent text-soil-slate hover:text-on-surface'
          }`}
        >
          Co-op Passbook History ({transactionLedger.length})
        </button>
      </div>

      {/* Tab 1: Active Field Requests */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-5 rounded-2xl border border-border-soft shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-soil-slate">{booking.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${booking.statusColor}`}>
                    {booking.status}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">{booking.machine}</h3>
                <p className="text-xs text-soil-slate font-medium">{booking.service}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-soil-slate pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                    {booking.operator}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-field-ochre">event</span>
                    {booking.scheduledDate}
                  </span>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-border-soft/60">
                <div className="text-right">
                  <span className="text-[11px] font-mono text-soil-slate uppercase block">Field Due</span>
                  <span className="text-xl font-black text-primary font-mono">
                    ₱{booking.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] font-semibold text-field-ochre block">
                    {booking.settlementType}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link
                    href="/dispatch-slip"
                    className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-border-soft text-soil-slate text-xs font-bold hover:text-primary hover:border-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>View Slip</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Co-op Passbook History */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-border-soft overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-border-soft text-soil-slate font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount / Palay</th>
                  <th className="py-3 px-4">Settlement Protocol</th>
                  <th className="py-3 px-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60 font-medium">
                {transactionLedger.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="py-3 px-4 font-mono text-soil-slate whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-4 font-bold text-on-surface">{tx.desc}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          tx.type.includes('Credit')
                            ? 'bg-status-available-bg text-status-available'
                            : 'bg-status-maintenance-bg text-status-maintenance'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-on-surface">{tx.amount}</td>
                    <td className="py-3 px-4 text-soil-slate">{tx.method}</td>
                    <td className="py-3 px-4 font-mono text-right text-soil-slate">{tx.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
