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
    const { ipAddress } = await req.json();
    if (!ipAddress) return NextResponse.json({ error: 'Missing IP' }, { status: 400 });

    // Gather intel
    const trafficLogs = await prisma.trafficLog.findMany({
      where: { ipAddress },
      orderBy: { timestamp: 'desc' }
    });

    const siemLogs = await prisma.siemLog.findMany({
      where: { ipAddress },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate score
    let score = 0;
    const vectors = new Set();
    const accountsTargeted = new Set();
    
    // Base score from traffic frequency
    if (trafficLogs.length > 50) score += 20;
    if (trafficLogs.length > 200) score += 30;

    // Anomalies
    siemLogs.forEach(log => {
      if (log.severity === 'CRITICAL') score += 40;
      if (log.severity === 'HIGH') score += 20;
      if (log.severity === 'MEDIUM') score += 10;
      
      vectors.add(log.eventType);
      if (log.registryId) accountsTargeted.add(log.registryId);
    });

    if (score > 100) score = 100;

    let designation = 'BENIGN';
    if (score > 30) designation = 'SUSPICIOUS';
    if (score > 70) designation = 'HOSTILE_ACTOR';
    if (score === 100) designation = 'CRITICAL_THREAT';

    return NextResponse.json({
      ipAddress,
      threatScore: score,
      designation,
      totalRequests: trafficLogs.length,
      firstSeen: trafficLogs[trafficLogs.length - 1]?.timestamp || 'Unknown',
      lastSeen: trafficLogs[0]?.timestamp || 'Unknown',
      attackVectors: Array.from(vectors),
      accountsTargeted: Array.from(accountsTargeted),
      userAgents: Array.from(new Set(trafficLogs.map(t => t.userAgent).filter(Boolean)))
    });

  } catch (error) {
    console.error('Analyze API Error:', error);
    return NextResponse.json({ error: 'Intel gathering failed.' }, { status: 500 });
  }
}
