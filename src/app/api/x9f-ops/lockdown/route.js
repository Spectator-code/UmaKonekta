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
    where: { key: 'GLOBAL_LOCKDOWN' }
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
      where: { key: 'GLOBAL_LOCKDOWN' },
      update: { value: activate ? 'true' : 'false' },
      create: { key: 'GLOBAL_LOCKDOWN', value: activate ? 'true' : 'false' }
    });

    await logSecurityEvent({
      eventType: activate ? 'DEFCON_1_ACTIVATED' : 'DEFCON_1_DEACTIVATED',
      registryId: operator,
      details: activate 
        ? 'Operator activated global lockdown. All authentications suspended.'
        : 'Operator deactivated global lockdown. Normal operations resumed.',
      severity: 'CRITICAL'
    });

    return NextResponse.json({ success: true, active: activate });
  } catch (error) {
    console.error('Lockdown API Error:', error);
    return NextResponse.json({ error: 'Failed to change lockdown state.' }, { status: 500 });
  }
}
