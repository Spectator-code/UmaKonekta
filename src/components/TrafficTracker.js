'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const track = async () => {
      try {
        let publicIp = null;
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          if (ipRes.ok) publicIp = (await ipRes.json()).ip;
        } catch (e) {}

        await fetch('/api/x9f-ops/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname, publicIp })
        });
      } catch (e) {}
    };
    track();
  }, [pathname]);

  return null; // Invisible component
}
