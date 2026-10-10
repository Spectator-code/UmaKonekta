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
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logSecurityEvent } from '@/lib/siem';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    await logSecurityEvent({
      eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      registryId: session?.user?.registryId || 'unauthenticated',
      details: 'Attempted to access /api/admin/farmers without admin privileges.',
      severity: 'HIGH'
    });
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const whereClause = { role: 'farmer' };
    if (session.user.baranggay) {
      whereClause.baranggay = session.user.baranggay;
    }

    const farmers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        registryId: true,
        role: true,
        baranggay: true,
        createdAt: true,
        _count: {
          select: { requests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const farmersCount = await prisma.user.count({ where: whereClause });
    
    // Also scope provider/mechanic counts to baranggay if needed
    const providerWhere = { role: 'provider' };
    const mechanicWhere = { role: 'mechanic' };
    if (session.user.baranggay) {
      providerWhere.baranggay = session.user.baranggay;
      mechanicWhere.baranggay = session.user.baranggay;
    }
    const providersCount = await prisma.user.count({ where: providerWhere });
    const mechanicsCount = await prisma.user.count({ where: mechanicWhere });

    return NextResponse.json({ 
      farmers, 
      stats: { farmersCount, providersCount, mechanicsCount } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch farmers' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, registryId, password, baranggay } = body;

    const trimmedName = (name || '').trim();
    const trimmedRegistryId = (registryId || '').trim();
    const finalBaranggay = baranggay || session.user.baranggay || 'San Manuel';

    if (!trimmedName || !trimmedRegistryId) {
      return NextResponse.json({ error: 'Name and Registry ID are required.' }, { status: 400 });
    }

    // Name validation: individuals registered with DA should not have digits
    if (/\d/.test(trimmedName)) {
      return NextResponse.json({ error: 'Full legal name cannot contain numbers.' }, { status: 400 });
    }

    let finalPassword = password ? password.trim() : '';
    let generatedTempPassword = null;

    if (!finalPassword) {
      // Generate a secure temporary password if none provided
      generatedTempPassword = `DA-${crypto.randomBytes(4).toString('hex').toUpperCase()}!${Math.floor(10 + Math.random() * 90)}`;
      finalPassword = generatedTempPassword;
    } else {
      // Validate provided password strictly
      if (/\s/.test(finalPassword)) {
        return NextResponse.json({ error: 'Password must not contain spaces.' }, { status: 400 });
      }
      if (finalPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
      }
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(finalPassword);
      if (!hasSpecialChar) {
        return NextResponse.json({ error: 'Password must contain at least one special character.' }, { status: 400 });
      }
    }

    // Check if registry ID already exists (case-insensitive for SQLite)
    let existing = null;
    try {
      const rawMatch = await prisma.$queryRaw`SELECT id FROM User WHERE LOWER(registryId) = LOWER(${trimmedRegistryId}) LIMIT 1`;
      if (rawMatch && rawMatch.length > 0) existing = rawMatch[0];
    } catch {
      existing = await prisma.user.findUnique({
        where: { registryId: trimmedRegistryId }
      });
    }

    if (existing) {
      return NextResponse.json({ error: `Farmer with Registry ID "${trimmedRegistryId}" already exists.` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(finalPassword, 10);
    const newFarmer = await prisma.user.create({
      data: {
        name: trimmedName,
        registryId: trimmedRegistryId,
        passwordHash,
        role: 'farmer',
        baranggay: finalBaranggay
      },
      select: {
        id: true,
        name: true,
        registryId: true,
        role: true,
        baranggay: true,
        createdAt: true
      }
    });

    await logSecurityEvent({
      eventType: 'ADMIN_CREATED_FARMER',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      registryId: session.user.registryId,
      details: `Admin enrolled new farmer: ${trimmedName} (${trimmedRegistryId})`,
      severity: 'LOW'
    });

    return NextResponse.json({
      success: true,
      farmer: newFarmer,
      temporaryPassword: generatedTempPassword,
      message: 'Farmer account created and certified successfully.'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to register farmer:', error);
    return NextResponse.json({ error: 'Failed to register farmer in database.' }, { status: 500 });
  }
}
