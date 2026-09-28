import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logSecurityEvent } from '@/lib/siem';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'secops') {
    return NextResponse.json({ error: 'Unauthorized: SecOps clearance required' }, { status: 401 });
  }

  try {
    const { registryId, ban } = await request.json();

    if (!registryId) {
      return NextResponse.json({ error: 'Registry ID required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { registryId },
      data: { isBanned: ban }
    });

    await logSecurityEvent({
      eventType: ban ? 'USER_BANNED' : 'USER_UNBANNED',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      registryId: session.user.registryId, // The secops doing the banning
      details: `Target: ${registryId}`,
      severity: 'CRITICAL'
    });

    return NextResponse.json({ success: true, user: { registryId: user.registryId, isBanned: user.isBanned } });

  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json({ error: 'Failed to update user ban status.' }, { status: 500 });
  }
}
