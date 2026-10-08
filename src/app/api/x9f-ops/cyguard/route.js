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

  const config = await prisma.systemConfig.findUnique({
    where: { key: 'CYGUARD_ACTIVE' }
  });

  return NextResponse.json({ active: config?.value === 'true' });
}

export async function POST(req) {
  const auth = await authorizeSecOps();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { activate } = await req.json();
    const operator = auth.session.user.registryId;

    await prisma.systemConfig.upsert({
      where: { key: 'CYGUARD_ACTIVE' },
      update: { value: activate ? 'true' : 'false' },
      create: { key: 'CYGUARD_ACTIVE', value: activate ? 'true' : 'false' }
    });

    await logSecurityEvent({
      eventType: 'CYGUARD_STATE_CHANGED',
      registryId: operator,
      details: activate 
        ? 'CyGuard Autonomous Defense AI ARMED. Auto-mitigation protocols active.'
        : 'CyGuard Autonomous Defense AI DISARMED. Reverting to manual response.',
      severity: activate ? 'HIGH' : 'MEDIUM'
    });

    return NextResponse.json({ success: true, active: activate });
  } catch (error) {
    console.error('CyGuard API Error:', error);
    return NextResponse.json({ error: 'Failed to change CyGuard state.' }, { status: 500 });
  }
}
