import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// In-memory Rate Limiter (Basic Edge protection)
const rateLimitMap = new Map();
const MAX_REQUESTS = 5; // 5 requests
const WINDOW_MS = 60000; // per 1 minute
export async function POST(request) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    // 0. Rate Limiting Check
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };
    if (now - rateData.lastReset > WINDOW_MS) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    // 1. IP Firewall
    const blacklistedIp = await prisma.ipBlacklist.findUnique({
      where: { ipAddress: ip }
    });
    if (blacklistedIp) return NextResponse.json({ error: 'Connection refused.' }, { status: 403 });

    // 2. Geo-Fence & VPN Ban (Bypass for local development and private networks)
    const isLocalIp = !ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1') || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('fe80:') || ip.startsWith('::ffff:');
    if (!isLocalIp) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,proxy,hosting`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(2000)
        });
        const geo = await geoRes.json();
        if (geo.status === 'success' && (geo.proxy || geo.hosting || (geo.countryCode && geo.countryCode !== 'PH'))) {
          const { logSecurityEvent } = await import('@/lib/siem');
          await logSecurityEvent({ eventType: 'VPN_TOR_BLOCKED_REG', ipAddress: ip, details: `Blocked proxy/foreign registration.`, severity: 'HIGH' });

          // CyGuard Auto-Mitigation
          const cyguardConfig = await prisma.systemConfig.findUnique({ where: { key: 'CYGUARD_ACTIVE' } });
          if (cyguardConfig?.value === 'true') {
            await prisma.ipBlacklist.upsert({
              where: { ipAddress: ip },
              update: {},
              create: { ipAddress: ip, reason: 'CyGuard: Auto-firewalled due to VPN/Geo anomaly during registration.' }
            });
            await logSecurityEvent({ eventType: 'CYGUARD_INTERVENTION', ipAddress: ip, details: `Autonomously firewalled malicious IP.`, severity: 'CRITICAL' });
          }

          return NextResponse.json({ error: 'Access Denied: Must originate from a Philippine residential network.' }, { status: 403 });
        }
      } catch (e) { }
    }

    const body = await request.json();
    const { name = '', registryId = '', password = '', role = 'farmer' } = body;

    const trimmedRegistryId = (registryId || '').trim();
    const trimmedName = (name || '').trim();

    // Validation
    if (!trimmedName || !trimmedRegistryId || !password) {
      return NextResponse.json(
        { error: 'Full Name, Registry ID, and Password/PIN are required.' },
        { status: 400 }
      );
    }

    // Name validation: numbers are not allowed for individuals (farmer, mechanic) registered with DA
    if (role !== 'provider' && /\d/.test(trimmedName)) {
      return NextResponse.json(
        { error: 'Full Name (as registered with DA) cannot contain numbers. Please enter your legal name.' },
        { status: 400 }
      );
    }

    // Password validation: no spaces allowed
    if (/\s/.test(password)) {
      return NextResponse.json(
        { error: 'Password must not contain any spaces.' },
        { status: 400 }
      );
    }

    // Strong password validation with special characters
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasMinLength) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (!hasSpecialChar) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character (e.g., @, $, !, %, *, ?, &, #).' },
        { status: 400 }
      );
    }

    // Prevent unauthorized public admin registration
    const allowedRoles = ['farmer', 'provider', 'mechanic'];

    if (!allowedRoles.includes(role)) {
      const { logSecurityEvent } = await import('@/lib/siem');
      await logSecurityEvent({
        eventType: 'ROLE_BYPASS_ATTEMPT',
        ipAddress: ip,
        registryId: trimmedRegistryId,
        details: `Attempted to register with unauthorized role: ${role}`,
        severity: 'HIGH'
      });

      // CyGuard Auto-Mitigation
      const cyguardConfig = await prisma.systemConfig.findUnique({ where: { key: 'CYGUARD_ACTIVE' } });
      if (cyguardConfig?.value === 'true') {
        await prisma.ipBlacklist.upsert({
          where: { ipAddress: ip },
          update: {},
          create: { ipAddress: ip, reason: 'CyGuard: Auto-firewalled due to Role Bypass attempt during registration.' }
        });
        await logSecurityEvent({ eventType: 'CYGUARD_INTERVENTION', ipAddress: ip, details: `Autonomously firewalled IP for Role Bypass attempt.`, severity: 'CRITICAL' });
        return NextResponse.json({ error: 'Connection refused.' }, { status: 403 });
      }
    }

    const assignedRole = allowedRoles.includes(role) ? role : 'farmer';

    // ID Format Validation: (user role-month-day register-F0000), e.g., farmer-0-0-F0000
    const idPattern = /^(farmer|provider|mechanic|admin)-\d{1,2}-\d{1,2}-[A-Za-z]\d{3,4}$/i;
    if (!idPattern.test(trimmedRegistryId)) {
      const d = new Date();
      const exampleInitial = assignedRole === 'farmer' ? 'F' : assignedRole === 'provider' ? 'P' : assignedRole === 'mechanic' ? 'M' : 'A';
      return NextResponse.json(
        { error: `ID must follow the format (user role-month-day register-F0000), e.g., ${assignedRole}-${d.getMonth() + 1}-${d.getDate()}-${exampleInitial}0000.` },
        { status: 400 }
      );
    }

    if (!trimmedRegistryId.toLowerCase().startsWith(assignedRole.toLowerCase() + '-')) {
      const d = new Date();
      const exampleInitial = assignedRole === 'farmer' ? 'F' : assignedRole === 'provider' ? 'P' : assignedRole === 'mechanic' ? 'M' : 'A';
      return NextResponse.json(
        { error: `Registry ID for ${assignedRole} must start with "${assignedRole}-", e.g., ${assignedRole}-${d.getMonth() + 1}-${d.getDate()}-${exampleInitial}0000.` },
        { status: 400 }
      );
    }

    // Check if registry ID already exists (case-insensitive for SQLite)
    let existingUser = null;
    try {
      const rawUsers = await prisma.$queryRaw`SELECT id FROM User WHERE LOWER(registryId) = LOWER(${trimmedRegistryId}) LIMIT 1`;
      if (rawUsers && rawUsers.length > 0) {
        existingUser = rawUsers[0];
      }
    } catch {
      existingUser = await prisma.user.findUnique({
        where: { registryId: trimmedRegistryId }
      });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: `An account with ID "${trimmedRegistryId}" is already registered. Please sign in instead.` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        registryId: trimmedRegistryId,
        passwordHash,
        role: assignedRole
      },
      select: {
        id: true,
        name: true,
        registryId: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Account successfully registered!'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
