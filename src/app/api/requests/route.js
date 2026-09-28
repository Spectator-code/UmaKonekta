import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

// Helper to synchronize asset availability based on active dispatch requests
async function syncAssetStatus(assetId) {
  if (!assetId) return;
  try {
    const activeRequests = await prisma.dispatchRequest.findMany({
      where: {
        assetId,
        status: { in: ['approved', 'in_progress', 'dispatched'] }
      }
    });

    const emergencyRequests = await prisma.dispatchRequest.findMany({
      where: {
        assetId,
        status: { in: ['emergency', 'breakdown', 'maintenance'] }
      }
    });

    let newStatus = 'available';
    if (emergencyRequests.length > 0) {
      newStatus = 'maintenance';
    } else if (activeRequests.length > 0) {
      newStatus = 'dispatched';
    }

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: newStatus }
    });
  } catch (err) {
    console.error('Failed to sync asset status:', err);
  }
}

// GET all requests for the logged-in user with query parameter filtering
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('status');
    const assetId = searchParams.get('assetId');
    const farmerIdParam = searchParams.get('farmerId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where = {};
    if (filterStatus && filterStatus !== 'all') {
      where.status = filterStatus.toLowerCase();
    }
    if (assetId) {
      where.assetId = assetId;
    }

    // Role-specific scoping
    if (session.user.role === 'farmer') {
      where.farmerId = session.user.id;
    } else if (session.user.role === 'provider') {
      where.asset = { providerId: session.user.id };
    } else if (session.user.role === 'mechanic') {
      // Mechanics see emergency breakdowns or maintenance-related requests
      if (!filterStatus) {
        where.OR = [
          { status: { in: ['emergency', 'maintenance', 'pending', 'in_progress'] } },
          { notes: { contains: 'SOS' } },
          { notes: { contains: 'Breakdown' } }
        ];
      }
    } else if (session.user.role === 'admin' || session.user.role === 'secops') {
      if (farmerIdParam) {
        where.farmerId = farmerIdParam;
      }
    }

    const requests = await prisma.dispatchRequest.findMany({
      where,
      include: {
        farmer: {
          select: { id: true, name: true, registryId: true, role: true }
        },
        asset: {
          include: {
            provider: {
              select: { id: true, name: true, registryId: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200)
    });

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST create a new farm machinery or emergency repair request
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      farmerUserId,
      assetId,
      machineName,
      hectares,
      scheduleDate,
      parcelSector,
      contactPhone,
      notes,
      isEmergency,
      status: requestedStatus
    } = body;

    // Find farmer user
    let farmer = null;
    const lookupId = (session.user.role === 'admin' && farmerUserId) 
      ? farmerUserId 
      : (session.user.id || farmerUserId);

    if (lookupId) {
      farmer = await prisma.user.findFirst({
        where: {
          OR: [
            { id: lookupId },
            { registryId: lookupId }
          ]
        }
      });
    }

    if (!farmer) {
      farmer = await prisma.user.findUnique({ where: { id: session.user.id } });
    }

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer account could not be identified' }, { status: 400 });
    }

    // Find target asset
    let targetAsset = null;
    if (assetId) {
      targetAsset = await prisma.asset.findUnique({ where: { id: assetId } });
    }
    if (!targetAsset && machineName) {
      targetAsset = await prisma.asset.findFirst({
        where: { name: { contains: machineName.split(' ')[0] } }
      });
    }
    if (!targetAsset) {
      // Pick first available machinery asset as fallback
      targetAsset = await prisma.asset.findFirst({
        where: { status: 'available' }
      });
    }
    if (!targetAsset) {
      targetAsset = await prisma.asset.findFirst();
    }

    if (!targetAsset) {
      return NextResponse.json({ error: 'No machinery asset found in registry to associate with request' }, { status: 400 });
    }

    const ha = Number(hectares) > 0 ? Number(hectares) : 1.0;
    const rate = targetAsset.rate || 2500;
    const totalCost = ha * rate;

    const initialStatus = isEmergency
      ? 'emergency'
      : (session.user.role === 'admin' && requestedStatus)
      ? requestedStatus
      : 'pending';

    const formattedNotes = [
      parcelSector ? `Sector: ${parcelSector}` : null,
      contactPhone ? `Phone: ${contactPhone}` : null,
      isEmergency ? `[EMERGENCY SOS BREAKDOWN REPORTED]` : null,
      notes ? notes.trim() : null
    ].filter(Boolean).join(' | ');

    const newRequest = await prisma.dispatchRequest.create({
      data: {
        farmerId: farmer.id,
        assetId: targetAsset.id,
        status: initialStatus,
        date: scheduleDate ? new Date(scheduleDate) : new Date(),
        hectares: ha,
        totalCost: totalCost,
        notes: formattedNotes,
      },
      include: {
        asset: {
          include: {
            provider: {
              select: { id: true, name: true, registryId: true }
            }
          }
        },
        farmer: {
          select: { id: true, name: true, registryId: true }
        }
      }
    });

    // If emergency, mark asset as maintenance
    if (isEmergency) {
      await prisma.asset.update({
        where: { id: targetAsset.id },
        data: { status: 'maintenance' }
      });
    } else if (initialStatus === 'dispatched' || initialStatus === 'in_progress') {
      await prisma.asset.update({
        where: { id: targetAsset.id },
        data: { status: 'dispatched' }
      });
    }

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: isEmergency 
        ? 'Emergency SOS alert broadcasted to field mechanics and cooperative dispatch.' 
        : 'Machinery dispatch booking successfully created.',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to create request in database' }, { status: 500 });
  }
}

// PATCH update request status, assigned operator, costs, or administrative verification notes
export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes, totalCost, hectares } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const existing = await prisma.dispatchRequest.findUnique({
      where: { id },
      include: { asset: true, farmer: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Request ticket not found' }, { status: 404 });
    }

    // Role authorization
    const isAdmin = session.user.role === 'admin';
    const isProvider = session.user.role === 'provider' && existing.asset?.providerId === session.user.id;
    const isFarmer = session.user.role === 'farmer' && existing.farmerId === session.user.id;
    const isMechanic = session.user.role === 'mechanic';

    if (!isAdmin && !isProvider && !isFarmer && !isMechanic) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to modify this ticket' }, { status: 403 });
    }

    // Farmers can only cancel their own pending/approved request
    if (isFarmer && !isAdmin && !isProvider) {
      if (status && status !== 'cancelled') {
        return NextResponse.json({ error: 'Farmers can only cancel their requests' }, { status: 403 });
      }
    }

    // Mechanics can update status to 'in_progress', 'completed', 'resolved', or 'maintenance'
    if (isMechanic && !isAdmin && !isProvider) {
      const allowedMech = ['in_progress', 'completed', 'resolved', 'maintenance'];
      if (status && !allowedMech.includes(status)) {
        return NextResponse.json({ error: 'Mechanics can only update repair progress or resolve issues' }, { status: 403 });
      }
    }

    const allowedStatuses = [
      'pending',
      'approved',
      'in_progress',
      'dispatched',
      'completed',
      'resolved',
      'cancelled',
      'emergency',
      'maintenance'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}. Allowed: ${allowedStatuses.join(', ')}` }, { status: 400 });
    }

    const updateData = {};
    if (status) {
      // Normalize 'dispatched' to 'in_progress' or retain standard
      updateData.status = (status === 'resolved') ? 'completed' : status;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (totalCost !== undefined) updateData.totalCost = parseFloat(totalCost);
    if (hectares !== undefined) updateData.hectares = parseFloat(hectares);

    const updated = await prisma.dispatchRequest.update({
      where: { id },
      data: updateData,
      include: {
        farmer: {
          select: { id: true, name: true, registryId: true }
        },
        asset: {
          include: {
            provider: {
              select: { id: true, name: true, registryId: true }
            }
          }
        }
      }
    });

    // Synchronize the asset's availability state
    if (existing.assetId) {
      await syncAssetStatus(existing.assetId);
    }

    return NextResponse.json({
      success: true,
      request: updated,
      message: `Request status updated to ${updated.status}`
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

// DELETE cancel or prune request
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
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const existing = await prisma.dispatchRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isOwnerFarmer = session.user.role === 'farmer' && existing.farmerId === session.user.id;

    if (!isAdmin && !isOwnerFarmer) {
      return NextResponse.json({ error: 'Forbidden: You cannot delete this request' }, { status: 403 });
    }

    // Only allow deletion of pending or cancelled requests unless admin
    if (!isAdmin && existing.status !== 'pending' && existing.status !== 'cancelled') {
      return NextResponse.json({ error: 'Only pending or cancelled requests may be deleted' }, { status: 400 });
    }

    const assetId = existing.assetId;
    await prisma.dispatchRequest.delete({
      where: { id }
    });

    if (assetId) {
      await syncAssetStatus(assetId);
    }

    return NextResponse.json({
      success: true,
      message: 'Request ticket has been cancelled and removed.'
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
