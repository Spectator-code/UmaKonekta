'use client';

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial online status in browser
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Only display badge when device is truly offline
  if (isOnline) {
    return null;
  }

  return (
    <aside aria-label="Network Connection and Offline Status" className="fixed bottom-4 right-4 z-40 no-print flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono font-bold shadow-lg transition-all duration-300 border backdrop-blur-md bg-status-urgent-bg/95 text-status-urgent border-status-urgent/30">
        <span className="w-2 h-2 rounded-full bg-status-urgent animate-ping" />
        <span>Offline Mode Active</span>
      </div>
    </aside>
  );
}
