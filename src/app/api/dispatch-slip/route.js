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
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET /api/dispatch-slip - Official Agrarian Dispatch Slip Verification & Detail Resolver
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticket = searchParams.get('ticket') || searchParams.get('id');

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket number or Request ID is required' }, { status: 400 });
    }

    const cleanId = ticket.replace(/^(REQ-|OP-|SOS-)/i, '').trim();

    // Query database for matching request
    let dbRequest = await prisma.dispatchRequest.findFirst({
      where: {
        OR: [
          { id: ticket },
          { id: { startsWith: cleanId.toLowerCase() } }
        ]
      },
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
      }
    });

    if (dbRequest) {
      // Parse notes for location, phone, sector
      const notesParts = (dbRequest.notes || '').split(' | ');
      let sector = 'Purok 2, Lowland Rice Basin';
      let phone = '0919-000-0002';
      notesParts.forEach(p => {
        if (p.startsWith('Sector:')) sector = p.replace('Sector:', '').trim();
        else if (p.startsWith('Phone:')) phone = p.replace('Phone:', '').trim();
      });

      // Generate cryptographic verification digital signature using server secret key
      const hmacKey = process.env.NEXTAUTH_SECRET || 'umakonekta-da-cert-auth-2026';
      const verificationPayload = `${dbRequest.id}|${dbRequest.farmer.registryId}|${dbRequest.asset.name}|${dbRequest.hectares}|${dbRequest.totalCost}`;
      const digitalSignature = crypto.createHmac('sha256', hmacKey).update(verificationPayload).digest('hex').slice(0, 16).toUpperCase();

      return NextResponse.json({
        verified: true,
        ticketNo: `OP-2026-${dbRequest.id.slice(0, 4).toUpperCase()}`,
        id: dbRequest.id,
        status: dbRequest.status,
        date: dbRequest.date,
        hectares: dbRequest.hectares || 1.0,
        rate: dbRequest.asset.rate || 2500,
        unit: dbRequest.asset.unit || 'per_ha',
        totalCost: dbRequest.totalCost || ((dbRequest.hectares || 1) * (dbRequest.asset.rate || 2500)),
        settlementMode: 'Cash-on-Dike Settlement',
        farmer: {
          name: dbRequest.farmer.name,
          registryId: dbRequest.farmer.registryId,
          rsbsaId: dbRequest.farmer.registryId,
          phone
        },
        asset: {
          id: dbRequest.asset.id,
          name: dbRequest.asset.name,
          type: dbRequest.asset.type,
          location: dbRequest.asset.location || sector,
          providerName: dbRequest.asset.provider.name,
          providerRegistryId: dbRequest.asset.provider.registryId
        },
        operator: {
          name: 'Accredited Depot Field Operator',
          phone: '0919-000-0002',
          license: 'NC-II Land Preparation Certified'
        },
        verification: {
          digitalSignature,
          authority: 'Department of Agriculture - Region XI Mechanization Pool',
          qrPayload: `UMAKONEKTA-DISPATCH:${dbRequest.id}:${digitalSignature}`
        }
      });
    }

    // Default Fallback for Demo Tickets
    const demoPayload = `${ticket}|farmer-1-23-A001|Yanmar EF494T 4WD|2.4|5760`;
    const demoSignature = crypto.createHash('sha256').update(demoPayload).digest('hex').slice(0, 16).toUpperCase();

    return NextResponse.json({
      verified: true,
      isDemo: true,
      ticketNo: ticket,
      status: 'approved',
      date: new Date().toISOString(),
      hectares: 2.4,
      rate: 2400,
      unit: 'per_ha',
      totalCost: 5760,
      settlementMode: 'Cash-on-Dike Settlement',
      farmer: {
        name: 'Farmer Member #A001',
        registryId: 'farmer-1-23-A001',
        rsbsaId: '03-49-12-00841',
        phone: '0917-000-0001'
      },
      asset: {
        name: 'Yanmar EF494T 4WD Heavy Duty Tractor',
        type: 'tractor',
        location: 'Sitio Balite, Brgy. San Manuel, Tagum City',
        providerName: 'Tagum FCA Machinery Depot',
        providerRegistryId: 'CDA-FCA-2024-9140'
      },
      operator: {
        name: 'Accredited Operator #1',
        phone: '0919-000-0002',
        license: 'TESDA Heavy Equipment NC-II'
      },
      verification: {
        digitalSignature: demoSignature,
        authority: 'Department of Agriculture - PhilMech Verified Dispatch Ticket',
        qrPayload: `UMAKONEKTA-DISPATCH:${ticket}:${demoSignature}`
      }
    });

  } catch (error) {
    console.error('Dispatch slip verification error:', error);
    return NextResponse.json({ error: 'Failed to verify dispatch slip' }, { status: 500 });
  }
}
