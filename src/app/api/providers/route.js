import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET /api/providers - Directory of accredited agrarian cooperatives & equipment pools
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const id = searchParams.get('id');

    // Individual Provider Detail
    if (id) {
      const provider = await prisma.user.findFirst({
        where: {
          role: 'provider',
          OR: [
            { id },
            { registryId: id }
          ]
        },
        select: {
          id: true,
          name: true,
          registryId: true,
          role: true,
          createdAt: true,
          assets: {
            select: {
              id: true,
              name: true,
              type: true,
              rate: true,
              unit: true,
              status: true,
              location: true,
              description: true
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { assets: true }
          }
        }
      });

      if (!provider) {
        return NextResponse.json({ error: 'Provider cooperative not found' }, { status: 404 });
      }

      return NextResponse.json({ provider });
    }

    const where = { role: 'provider' };

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { registryId: { contains: q } }
      ];
    }

    const providers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        registryId: true,
        role: true,
        createdAt: true,
        assets: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            location: true,
            rate: true,
            unit: true
          }
        },
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Compute active & available fleet units per provider
    const formattedProviders = providers.map(p => {
      const availableCount = p.assets.filter(a => a.status === 'available').length;
      const dispatchedCount = p.assets.filter(a => a.status === 'dispatched').length;
      const maintenanceCount = p.assets.filter(a => a.status === 'maintenance').length;
      
      // Determine dominant municipality/location
      const locations = p.assets.map(a => a.location).filter(Boolean);
      const primaryLocation = locations.length > 0 ? locations[0] : 'Davao del Norte';

      return {
        id: p.id,
        name: p.name,
        registryId: p.registryId,
        role: p.role,
        primaryLocation,
        memberSince: p.createdAt,
        totalFleetCount: p._count.assets,
        availableUnitsCount: availableCount,
        dispatchedUnitsCount: dispatchedCount,
        maintenanceUnitsCount: maintenanceCount,
        // Include machines if requested or user is authenticated
        featuredAssets: p.assets.slice(0, 5)
      };
    });

    // Optional location filter on primary location
    const filtered = location && location !== 'all'
      ? formattedProviders.filter(p => p.primaryLocation.toLowerCase().includes(location.toLowerCase()))
      : formattedProviders;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      providers: filtered
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('Failed to fetch providers directory:', error);
    return NextResponse.json({ error: 'Failed to retrieve accredited providers directory' }, { status: 500 });
  }
}
