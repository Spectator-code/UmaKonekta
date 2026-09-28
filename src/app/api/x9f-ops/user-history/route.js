import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function authorizeSecOps() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'secops') {
    return { error: 'Unauthorized', status: 403 };
  }
  return { session };
}

export async function POST(req) {
  const auth = await authorizeSecOps();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { registryId } = await req.json();
    if (!registryId) return NextResponse.json({ error: 'Missing Registry ID' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { registryId }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const history = await prisma.siemLog.findMany({
      where: { registryId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 events for performance
    });

    return NextResponse.json({
      user: {
        registryId: user.registryId,
        name: user.name,
        role: user.role,
        isBanned: user.isBanned
      },
      history
    });
  } catch (error) {
    console.error('User History API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user history' }, { status: 500 });
  }
}
