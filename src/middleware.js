/**
 * @file middleware.js
 * @description Global Edge WAF, Security clearance, and Authentication Guard with SIEM telemetry dispatch.
 * @module middleware
 */

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const rolePortalMap = {
  farmer: "/farmer-dashboard",
  provider: "/provider-dashboard",
  mechanic: "/mechanic-dashboard",
  admin: "/admin",
  secops: "/x9f-telemetry-vault-8812",
};

/**
 * Robust Edge-to-SIEM telemetry dispatcher.
 * Handles Next.js Edge runtime constraints and ensures DB write completes.
 */
async function dispatchSiemTelemetry(req, event, eventData) {
  try {
    const trackUrl = new URL('/api/x9f-ops/track', req.url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const promise = fetch(trackUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-siem-dispatch': 'true'
      },
      body: JSON.stringify(eventData),
      signal: controller.signal
    }).catch(err => {
      console.error('[EDGE_SIEM] Dispatch fetch failed:', err?.message || err);
    }).finally(() => {
      clearTimeout(timeoutId);
    });

    if (event && typeof event.waitUntil === 'function') {
      event.waitUntil(promise);
    }

    // Await up to 800ms so database persistence finishes before edge response returns
    await Promise.race([
      promise,
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
  } catch (err) {
    console.error('[EDGE_SIEM] Dispatch exception:', err?.message || err);
  }
}

// Global Edge WAF and Authentication Guard
export async function middleware(req, event) {
  const { pathname } = req.nextUrl;

  // 0. EXEMPT INTERNAL TELEMETRY INGESTION FROM GEO-BLOCKING AND SCRAPER CHECKS
  // Crucial: Prevents internal telemetry fetch calls from being blocked by the geo-fence
  if (pathname === '/api/x9f-ops/track' || req.headers.get('x-internal-siem-dispatch') === 'true') {
    return NextResponse.next();
  }

  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  // 1. GLOBAL ANTI-SCRAPER
  const blockedScrapers = ['curl', 'wget', 'python', 'scrapy', 'bot', 'headlesschrome', 'puppeteer'];
  if (blockedScrapers.some(scraper => userAgent.includes(scraper))) {
    await dispatchSiemTelemetry(req, event, {
      path: pathname,
      publicIp: clientIp,
      securityEvent: {
        eventType: 'SCRAPER_BLOCKED',
        severity: 'MEDIUM',
        registryId: 'CYGUARD_WAF',
        details: `Edge WAF blocked automated scraper user-agent: ${userAgent.substring(0, 120)}`
      }
    });

    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. GEO-FENCE & FOREIGN / VPN PROXY BLOCK
  if (country && country !== 'PH') {
    await dispatchSiemTelemetry(req, event, {
      path: pathname,
      publicIp: clientIp,
      securityEvent: {
        eventType: 'VPN_GEO_BLOCKED',
        severity: 'HIGH',
        registryId: 'CYGUARD_INTERCEPT',
        details: `CyGuard blocked foreign/VPN connection. Country: ${country}. Path: ${pathname}`
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied - UmaKonekta</title>
        <style>
          body {
            background-color: #991b1b;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            padding: 20px;
          }
          svg {
            width: 120px;
            height: 120px;
            margin-bottom: 24px;
            stroke: #fecaca;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 16px;
            font-weight: 900;
          }
          p {
            font-size: 1.25rem;
            max-width: 600px;
            line-height: 1.6;
            color: #fee2e2;
          }
        </style>
      </head>
      <body>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <line x1="9" y1="9" x2="15" y2="15"></line>
          <line x1="15" y1="9" x2="9" y2="15"></line>
        </svg>
        <h1>Access Denied</h1>
        <p>UmaKonekta is exclusively available within the Philippines. Connections originating from foreign networks, proxies, or VPNs are blocked by CyGuard.</p>
      </body>
      </html>
    `;
    return new NextResponse(htmlContent, { 
      status: 403,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // 3. API Route Guard for SecOps Internal Endpoints (Except public POST /api/x9f-ops/track)
  if (pathname.startsWith('/api/x9f-ops') && !(pathname === '/api/x9f-ops/track' && req.method === 'POST')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || (token.role !== 'secops' && token.role !== 'admin')) {
      console.warn(JSON.stringify({ 
        event: 'SECOPS_UNAUTHORIZED_ACCESS', 
        path: pathname, 
        ip: clientIp,
        role: token?.role || 'anonymous'
      }));

      await dispatchSiemTelemetry(req, event, {
        path: pathname,
        publicIp: clientIp,
        securityEvent: {
          eventType: 'SECOPS_UNAUTHORIZED_ACCESS',
          severity: 'HIGH',
          registryId: token?.registryId || token?.sub || 'UNAUTHORIZED_ACTOR',
          details: `Unauthorized attempt to access SecOps endpoint: ${pathname}. Requester Role: ${token?.role || 'unauthenticated'}.`
        }
      });

      return NextResponse.json({ error: 'Unauthorized: SecOps clearance required' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // 4. Route Guard for Private Portals
  const privateRoutes = [
    '/farmer-dashboard',
    '/provider-dashboard',
    '/admin',
    '/mechanics',
    '/mechanic-dashboard',
    '/daily-roster',
    '/dispatch-slip',
    '/sacco-receipt',
    '/x9f-telemetry-vault-8812'
  ];
  
  if (privateRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role;
    const redirectToHomePortal = () => {
      const targetUrl = rolePortalMap[role] || "/login";
      return NextResponse.redirect(new URL(targetUrl, req.url));
    };

    if (pathname.startsWith("/mechanics")) {
      return NextResponse.redirect(new URL("/mechanic-dashboard", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "admin") return redirectToHomePortal();
    if (pathname.startsWith("/farmer-dashboard") && role !== "farmer" && role !== "admin") return redirectToHomePortal();
    if (pathname.startsWith("/provider-dashboard") && role !== "provider" && role !== "admin") return redirectToHomePortal();
    if (pathname.startsWith("/daily-roster") && role !== "provider" && role !== "admin") return redirectToHomePortal();
    if (pathname.startsWith("/mechanic-dashboard") && role !== "mechanic" && role !== "admin") return redirectToHomePortal();

    // SecOps Vault Portal Guard: Only 'secops' and 'admin' roles are permitted.
    if (pathname.startsWith("/x9f-telemetry-vault-8812") && role !== "secops" && role !== "admin") {
      await dispatchSiemTelemetry(req, event, {
        path: pathname,
        publicIp: clientIp,
        securityEvent: {
          eventType: 'SECOPS_UNAUTHORIZED_ACCESS',
          severity: 'HIGH',
          registryId: token?.registryId || token?.sub || role || 'INSUFFICIENT_CLEARANCE',
          details: `Unauthorized attempt to access SecOps Telemetry Vault UI: ${pathname}. Requester Role: ${role}.`
        }
      });
      return redirectToHomePortal();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for static files and next internals
    '/((?!_next/static|_next/image|favicon.ico|background|logo).*)',
  ],
};
