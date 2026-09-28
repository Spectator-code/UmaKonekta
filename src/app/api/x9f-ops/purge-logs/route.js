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
    await prisma.siemLog.deleteMany({}); // Purge all logs

    await logSecurityEvent({
      eventType: 'LOGS_PURGED',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      registryId: session.user.registryId,
      details: 'All historical SIEM telemetry was purged by SecOps.',
      severity: 'HIGH'
    });

    return NextResponse.json({ success: true, message: 'Logs purged successfully' });
  } catch (error) {
    console.error('Error purging logs:', error);
    return NextResponse.json({ error: 'Failed to purge logs.' }, { status: 500 });
  }
}
