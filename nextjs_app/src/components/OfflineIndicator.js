'use client';

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // Set initial online status in browser
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check simulated local queued transactions
      try {
        const queued = localStorage.getItem('umakonekta_offline_queue');
        if (queued) {
          const items = JSON.parse(queued);
          setPendingSyncCount(items.length);
        }
      } catch (e) {
        // Fallback gracefully
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <aside aria-label="Network Connection and Offline Status" className="fixed bottom-4 right-4 z-40 no-print flex flex-col items-end gap-2">
      {/* Network Status Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold shadow-lg transition-all duration-300 border backdrop-blur-md ${
          isOnline
            ? 'bg-status-available-bg/95 text-status-available border-status-available/20'
            : 'bg-status-urgent-bg/95 text-status-urgent border-status-urgent/30 animate-bounce'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-status-available animate-pulse' : 'bg-status-urgent'
          }`}
        />
        <span>
          {isOnline ? 'Online • DA-LGU Sync Active' : 'Offline • Local SACCO Cache Active'}
        </span>
      </div>

      {/* Offline Queue Badge (if offline or pending items exist) */}
      {(!isOnline || pendingSyncCount > 0) && (
        <div className="bg-soil-slate text-cream-surface text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-md border border-soil-slate/40 flex items-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-harvest-amber">sync</span>
          <span>{pendingSyncCount > 0 ? `${pendingSyncCount} Ledger items queued` : 'Cash-on-Dike slips stored locally'}</span>
        </div>
      )}
    </aside>
  );
}
