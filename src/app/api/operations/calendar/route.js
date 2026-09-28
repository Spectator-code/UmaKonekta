import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/operations/calendar - Municipal fleet machinery operations & dispatch schedule
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};

    if (type && type !== 'all') {
      where.type = type.toLowerCase();
    }

    if (status && status !== 'all') {
      where.status = status.toLowerCase();
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { location: { contains: q } },
        { description: { contains: q } },
        { provider: { name: { contains: q } } }
      ];
    }

    // Fetch all municipal assets with provider and approved/in-progress requests
    const assets = await prisma.asset.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            registryId: true,
            role: true
          }
        },
        requests: {
          where: {
            status: { in: ['approved', 'in_progress', 'dispatched', 'completed'] }
          },
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                registryId: true
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: [
        { status: 'asc' },
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    // Summary calculations
    let inUseCount = 0;
    let scheduledCount = 0;
    let maintenanceCount = 0;
    let availableCount = 0;

    assets.forEach(asset => {
      const hasActive = asset.requests.some(r => r.status === 'in_progress' || r.status === 'dispatched');
      const hasScheduled = asset.requests.some(r => r.status === 'approved');

      if (asset.status === 'maintenance') {
        maintenanceCount++;
      } else if (asset.status === 'dispatched' || hasActive) {
        inUseCount++;
      } else if (hasScheduled) {
        scheduledCount++;
      } else {
        availableCount++;
      }
    });

    return NextResponse.json({
      success: true,
      totalCount: assets.length,
      stats: {
        total: assets.length,
        inUse: inUseCount,
        scheduled: scheduledCount,
        maintenance: maintenanceCount,
        available: availableCount
      },
      assets
    });
  } catch (error) {
    console.error('Error fetching operations calendar fleet:', error);
    return NextResponse.json(
      { error: 'Failed to load operations calendar data', details: error.message },
      { status: 500 }
    );
  }
}
