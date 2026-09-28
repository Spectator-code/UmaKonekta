'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DailyDispatchRoster from '@/components/DailyDispatchRoster';

export default function DailyRosterPage() {
  const { data: session } = useSession();
  const backHref = session?.user?.role === 'admin' ? '/admin' : '/provider-dashboard';
  const backLabel = session?.user?.role === 'admin' ? 'Back to Admin Center' : 'Back to Provider Hub';

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface">
      {/* Top Bar for Standalone View */}
      <div className="no-print bg-primary text-white py-3 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={backHref}
              className="text-xs font-mono text-white/80 hover:text-white flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>{backLabel}</span>
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-xs font-mono font-bold text-white">Daily Dispatch Roster</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white font-bold">
              5:00 AM BRIEFING ROSTER
            </span>
          </div>
        </div>
      </div>

      <DailyDispatchRoster
        depotName={session?.user?.name || 'Tagum FCA Machinery Depot'}
        cdaReg={session?.user?.registryId || 'provider-1-23-A001'}
        isModal={false}
      />
    </div>
  );
}
