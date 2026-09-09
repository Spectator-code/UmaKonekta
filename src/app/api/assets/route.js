import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
<<<<<<< HEAD
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
=======
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364

export async function GET(request) {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        provider: {
<<<<<<< HEAD
          select: { name: true, registryId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
=======
          select: { name: true }
        }
      }
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
    });
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}
<<<<<<< HEAD

export async function POST(request) {
  const session = await getServerSession(authOptions);

  try {
    const body = await request.json();
    const { name, type, description, rate, unit, location, providerId } = body;

    const targetProviderId = session?.user?.id || providerId;

    if (!targetProviderId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    const newAsset = await prisma.asset.create({
      data: {
        providerId: targetProviderId,
        name: name || 'Tractor / Machine',
        type: type || 'tractor',
        description: description || 'Available for farm service and land preparation.',
        rate: parseFloat(rate) || 2000,
        unit: unit || 'per_ha',
        status: 'available',
        location: location || 'Tagum City, Davao del Norte'
      }
    });

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error) {
    console.error('Error adding asset:', error);
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 });
  }
}

=======
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
