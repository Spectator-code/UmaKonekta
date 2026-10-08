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
  if (!session || session.user?.role !== 'secops') {
    return { error: 'Unauthorized: SecOps clearance required', status: 403 };
  }
  return { session };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { path, publicIp, securityEvent } = body;
    
    // Secure extraction: Cloudflare, Vercel, standard forwarded, then fallback to client-reported
    const headerIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const ip = headerIp || publicIp || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Record in Traffic Log
    await prisma.trafficLog.create({
      data: {
        ipAddress: ip,
        userAgent: userAgent.substring(0, 200), // Cap length
        path: path || '/'
      }
    });

    // 2. Record Security Event in SIEM if passed from Edge middleware or security filters
    if (securityEvent && securityEvent.eventType) {
      await logSecurityEvent({
        eventType: securityEvent.eventType,
        ipAddress: ip,
        registryId: securityEvent.registryId || null,
        details: securityEvent.details || `Triggered from path: ${path || '/'}`,
        severity: securityEvent.severity || 'HIGH'
      });
    }

    // Auto-cleanup old logs (keep last 1000)
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

    return NextResponse.json({ success: true });
  } catch (error) {
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
