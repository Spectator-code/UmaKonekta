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
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/assets - Query & filter agricultural machinery
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const providerId = searchParams.get('providerId');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where = {};

    if (type && type !== 'all') {
      where.type = type.toLowerCase();
    }

    if (status && status !== 'all') {
      where.status = status.toLowerCase();
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (location && location !== 'all') {
      where.location = { contains: location };
    }

    if (minRate || maxRate) {
      where.rate = {};
      if (minRate) where.rate.gte = parseFloat(minRate);
      if (maxRate) where.rate.lte = parseFloat(maxRate);
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } }
      ];
    }

    const [totalCount, assets] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        include: {
          provider: {
            select: { id: true, name: true, registryId: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
        skip: offset
      })
    ]);

    return NextResponse.json(assets, {
      headers: {
        'x-total-count': totalCount.toString(),
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

// POST /api/assets - Register new equipment listing
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'provider' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Provider or Admin role required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, type, description, rate, unit, location, providerId, status } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Equipment name is required and must be at least 2 characters.' }, { status: 400 });
    }

    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      return NextResponse.json({ error: 'Valid rental/service rate is required (must be greater than 0).' }, { status: 400 });
    }

    const targetProviderId = (session?.user?.role === 'admin' && providerId) 
      ? providerId 
      : (session?.user?.id || providerId);

    let finalProviderId = targetProviderId;
    if (targetProviderId) {
      const providerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetProviderId },
            { registryId: targetProviderId }
          ]
        }
      });
      if (providerUser) {
        finalProviderId = providerUser.id;
      }
    }

    if (!finalProviderId) {
      return NextResponse.json({ error: 'Valid Provider account is required.' }, { status: 400 });
    }

    const allowedStatuses = ['available', 'dispatched', 'maintenance'];
    const assetStatus = (status && allowedStatuses.includes(status.toLowerCase())) 
      ? status.toLowerCase() 
      : 'available';

    const newAsset = await prisma.asset.create({
      data: {
        providerId: finalProviderId,
        name: name.trim(),
        type: (type || 'tractor').toLowerCase(),
        description: (description || 'Available for farm service and land preparation.').trim(),
        rate: parsedRate,
        unit: unit || 'per_ha',
        status: assetStatus,
        location: (location || 'Tagum City, Davao del Norte').trim()
      },
      include: {
        provider: {
          select: { id: true, name: true, registryId: true }
        }
      }
    });

    return NextResponse.json({ success: true, asset: newAsset }, { status: 201 });
  } catch (error) {
    console.error('Error adding asset:', error);
    return NextResponse.json({ error: 'Failed to add asset to fleet database' }, { status: 500 });
  }
}

// PATCH /api/assets - Update equipment rates, status, specs or location
export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, type, description, rate, unit, location, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required for updates' }, { status: 400 });
    }

    const existingAsset = await prisma.asset.findUnique({
      where: { id },
      include: { provider: true }
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isOwner = session.user.role === 'provider' && existingAsset.providerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You do not own this equipment listing' }, { status: 403 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type.toLowerCase().trim();
    if (description !== undefined) updateData.description = description.trim();
    if (rate !== undefined) {
      const parsedRate = parseFloat(rate);
      if (isNaN(parsedRate) || parsedRate <= 0) {
        return NextResponse.json({ error: 'Rate must be a positive number' }, { status: 400 });
      }
      updateData.rate = parsedRate;
    }
    if (unit !== undefined) updateData.unit = unit.trim();
    if (location !== undefined) updateData.location = location.trim();
    
    if (status !== undefined) {
      const allowed = ['available', 'dispatched', 'maintenance'];
      if (!allowed.includes(status.toLowerCase())) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` }, { status: 400 });
      }
      updateData.status = status.toLowerCase();
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: { id: true, name: true, registryId: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      asset: updated,
      message: `Asset ${updated.name} updated successfully.`
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Failed to update asset specifications' }, { status: 500 });
  }
}

// DELETE /api/assets - Decommission or remove equipment listing
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required for deletion' }, { status: 400 });
    }

    const existingAsset = await prisma.asset.findUnique({
      where: { id },
      include: {
        requests: {
          where: {
            status: { in: ['pending', 'approved', 'in_progress'] }
          }
        }
      }
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isOwner = session.user.role === 'provider' && existingAsset.providerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You do not own this equipment listing' }, { status: 403 });
    }

    // Safety check: Prevent deletion if actively involved in pending/active dispatches
    if (existingAsset.requests && existingAsset.requests.length > 0) {
      return NextResponse.json({
        error: `Cannot delete machine: it currently has ${existingAsset.requests.length} active or pending dispatch request(s). Please complete or cancel those requests first, or set status to 'maintenance'.`
      }, { status: 409 });
    }

    await prisma.asset.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `Equipment listing "${existingAsset.name}" has been decommissioned.`
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete equipment listing' }, { status: 500 });
  }
}
