import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

// GET all requests for the logged-in user (farmer, provider, admin)
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (session.user.role === 'farmer') {
      const requests = await prisma.dispatchRequest.findMany({
        where: { farmerId: session.user.id },
        include: { asset: { include: { provider: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ requests });
    }

    if (session.user.role === 'provider') {
      const requests = await prisma.dispatchRequest.findMany({
        where: { asset: { providerId: session.user.id } },
        include: { farmer: true, asset: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ requests });
    }

    if (session.user.role === 'admin') {
      const requests = await prisma.dispatchRequest.findMany({
        include: { farmer: true, asset: { include: { provider: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ requests });
    }

    return NextResponse.json({ requests: [] });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST create a new farm machinery request
export async function POST(request) {
  const session = await getServerSession(authOptions);

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
    } = body;

    // Find farmer user if logged in or by registry ID
    let farmer = null;
    if (session?.user?.id) {
      farmer = await prisma.user.findUnique({ where: { id: session.user.id } });
    } else if (farmerUserId) {
      farmer = await prisma.user.findFirst({
        where: {
          OR: [
            { registryId: farmerUserId },
            { id: farmerUserId }
          ]
        }
      });
    }

    // Default to first farmer if unauthenticated test demo
    if (!farmer) {
      farmer = await prisma.user.findFirst({ where: { role: 'farmer' } });
    }

    // Find or link an asset
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
      targetAsset = await prisma.asset.findFirst();
    }

    if (!farmer || !targetAsset) {
      return NextResponse.json({ error: 'Farmer or Asset not found' }, { status: 400 });
    }

    const ha = Number(hectares) || 1.0;
    const rate = targetAsset.rate || 2800;
    const totalCost = ha * rate;

    const newRequest = await prisma.dispatchRequest.create({
      data: {
        farmerId: farmer.id,
        assetId: targetAsset.id,
        status: 'pending',
        date: scheduleDate ? new Date(scheduleDate) : new Date(),
        hectares: ha,
        totalCost: totalCost,
        notes: `Sector: ${parcelSector || 'Purok 2'} | Phone: ${contactPhone || 'N/A'}${notes ? ` | ${notes}` : ''}`,
      },
      include: {
        asset: { include: { provider: true } },
        farmer: true,
      }
    });

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Machinery request created and saved to database.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
