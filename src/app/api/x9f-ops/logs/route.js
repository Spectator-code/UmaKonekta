import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'secops') {
    return NextResponse.json({ error: 'Unauthorized: SecOps clearance required' }, { status: 401 });
  }

  try {
    const logs = await prisma.siemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs: logs
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching SIEM logs:', error);
    return NextResponse.json({ error: 'Failed to fetch security logs.' }, { status: 500 });
  }
}
