/**
 * @file route.js
 * @description Utility / Helper module for route.js. Contains business logic or API handlers.
 * @module route
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/siem';

// Ensure the caller is authenticated as secops
async function authorizeSecOps() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'secops') {
    return { error: 'Unauthorized', status: 403 };
  }
  return { session };
}

export async function GET(req) {
  const auth = await authorizeSecOps();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const blacklist = await prisma.ipBlacklist.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ blacklist });
}

export async function POST(req) {
  const auth = await authorizeSecOps();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { ipAddress, action, reason } = await req.json();
    const operator = auth.session.user.registryId;

    if (action === 'BLOCK') {
      const existing = await prisma.ipBlacklist.findUnique({ where: { ipAddress } });
      if (!existing) {
        await prisma.ipBlacklist.create({
          data: { ipAddress, reason: reason || 'Blocked by operator' }
        });
        await logSecurityEvent({
          eventType: 'FIREWALL_RULE_ADDED',
          registryId: operator,
          details: `IP ${ipAddress} blocked. Reason: ${reason}`,
          severity: 'HIGH'
        });
      }
      return NextResponse.json({ success: true, message: `IP ${ipAddress} blocked.` });
    } 
    
    if (action === 'UNBLOCK') {
      await prisma.ipBlacklist.deleteMany({
        where: { ipAddress }
      });
      await logSecurityEvent({
        eventType: 'FIREWALL_RULE_REMOVED',
        registryId: operator,
        details: `IP ${ipAddress} unblocked.`,
        severity: 'MEDIUM'
      });
      return NextResponse.json({ success: true, message: `IP ${ipAddress} unblocked.` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Firewall API Error:', error);
    return NextResponse.json({ error: 'Failed to manage firewall rules.' }, { status: 500 });
  }
}
