/**
 * @file route.js
 * @description API endpoint for telemetry tracking and edge SIEM security event dispatch.
 * @module route
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/siem';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

async function authorizeSecOps() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'secops' && session.user?.role !== 'admin')) {
    return { error: 'Unauthorized: SecOps clearance required', status: 403 };
  }
  return { session };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { path, publicIp, securityEvent } = body;
    
    // Secure extraction: client/edge reported IP takes precedence if supplied, fallback to headers
    const headerIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const ip = publicIp || headerIp || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Record in Traffic Log
    await prisma.trafficLog.create({
      data: {
        ipAddress: ip,
        userAgent: userAgent.substring(0, 200),
        path: path || '/'
      }
    });

    // 2. Record Security Event in SIEM if passed from Edge middleware or security filters
    if (securityEvent && securityEvent.eventType) {
      await logSecurityEvent({
        eventType: securityEvent.eventType,
        ipAddress: ip,
        registryId: securityEvent.registryId || 'CYGUARD_INTERCEPT',
        details: securityEvent.details || `Triggered from path: ${path || '/'}`,
        severity: securityEvent.severity || 'HIGH'
      });
    }

    // Auto-cleanup old logs (safely isolated)
    try {
      const count = await prisma.trafficLog.count();
      if (count > 1000) {
        const oldest = await prisma.trafficLog.findMany({
          orderBy: { timestamp: 'desc' },
          skip: 1000,
          take: 1
        });
        if (oldest.length > 0) {
          await prisma.trafficLog.deleteMany({
            where: { timestamp: { lt: oldest[0].timestamp } }
          });
        }
      }
    } catch (cleanupErr) {
      console.warn('Traffic cleanup skipped:', cleanupErr?.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json({ error: 'Failed to log traffic' }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await authorizeSecOps();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const traffic = await prisma.trafficLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    return NextResponse.json({ traffic });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch traffic logs' }, { status: 500 });
  }
}
