import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'farmer' },
      select: {
        id: true,
        name: true,
        registryId: true,
        role: true,
        createdAt: true,
        _count: {
          select: { requests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ farmers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch farmers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, registryId, password = '4092' } = body;

    if (!name || !registryId) {
      return NextResponse.json({ error: 'Name and Registry ID are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { registryId }
    });

    if (existing) {
      return NextResponse.json({ error: 'Farmer with this RSBSA Registry ID already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newFarmer = await prisma.user.create({
      data: {
        name,
        registryId,
        passwordHash,
        role: 'farmer'
      }
    });

    return NextResponse.json({ success: true, farmer: newFarmer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register farmer' }, { status: 500 });
  }
}
