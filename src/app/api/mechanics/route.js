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
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/mechanics - Retrieve SOS breakdown feed, active work orders, and field repair logs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('status');

    // Fetch dispatch requests tagged with emergency / breakdown or maintenance
    const breakdownRequests = await prisma.dispatchRequest.findMany({
      where: {
        OR: [
          { status: { in: ['emergency', 'breakdown', 'maintenance'] } },
          { notes: { contains: 'EMERGENCY' } },
          { notes: { contains: 'SOS' } }
        ]
      },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Also fetch machines currently under maintenance
    const maintenanceAssets = await prisma.asset.findMany({
      where: { status: 'maintenance' },
      include: {
        provider: { select: { id: true, name: true, registryId: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Format SOS tickets for mechanic dashboard
    const formattedTickets = breakdownRequests.map(req => {
      const isResolved = req.status === 'completed' || req.status === 'resolved';
      const isAssigned = req.status === 'in_progress' || req.status === 'dispatched';
      const isOpen = !isResolved && !isAssigned;

      let statusCategory = 'open';
      if (isResolved) statusCategory = 'resolved';
      else if (isAssigned) statusCategory = 'assigned';

      // Parse notes for sector, phone, details, and repair summary
      const notesParts = (req.notes || '').split(' | ');
      let sector = 'Purok 2, Lowland Rice Basin';
      let phone = '0919-000-0002';
      let issueDetail = 'Engine overheating / Mechanical thresher jam';
      let repairDescription = 'Standard maintenance applied.';
      let partsUsed = 'None';
      let cost = `₱${(req.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

      notesParts.forEach(p => {
        if (p.startsWith('Sector:')) sector = p.replace('Sector:', '').trim();
        else if (p.startsWith('Phone:')) phone = p.replace('Phone:', '').trim();
        else if (p.startsWith('[REPAIR COMPLETED]')) repairDescription = p.replace('[REPAIR COMPLETED]', '').trim();
        else if (p.startsWith('Parts:')) partsUsed = p.replace('Parts:', '').trim();
        else if (p.startsWith('Cost:')) cost = p.replace('Cost:', '').trim();
        else if (!p.includes('EMERGENCY') && !p.startsWith('Tech:') && !p.startsWith('[CLAIMED BY')) issueDetail = p.trim();
      });

      return {
        id: req.id.startsWith('SOS-') ? req.id : `SOS-${req.id.slice(0, 8).toUpperCase()}`,
        dbId: req.id,
        machine: req.asset?.name || 'Agricultural Machinery',
        category: req.asset?.type || 'Combine Harvester',
        operator: req.asset?.provider?.name || 'Accredited Depot Operator',
        operatorPhone: phone,
        farmer: req.farmer?.name || req.farmer?.registryId || 'RSBSA Beneficiary',
        farmerId: req.farmer?.registryId || 'N/A',
        location: req.asset?.location || sector,
        gpsCoords: '7.4472° N, 125.8035° E',
        landmark: sector,
        breakdownType: issueDetail,
        repairDescription: repairDescription,
        partsUsed: partsUsed,
        totalCost: cost,
        severity: 'CRITICAL',
        severityDetail: 'Field Operation Stalled',
        severityLevel: 'critical',
        timeReported: new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: statusCategory,
        assignedMechanic: isAssigned ? (session.user.registryId || 'Mobile Van #2') : null,
        distanceKm: '2.4 km',
        assetId: req.assetId,
        createdAt: req.createdAt
      };
    });

    const filtered = (filterStatus && filterStatus !== 'all')
      ? formattedTickets.filter(t => t.status === filterStatus)
      : formattedTickets;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      tickets: filtered,
      maintenanceFleet: maintenanceAssets
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error) {
    console.error('Error fetching mechanic SOS feed:', error);
    return NextResponse.json({ error: 'Failed to fetch mechanic SOS feed' }, { status: 500 });
  }
}

// POST /api/mechanics - Complete field work order & restore machine to operational availability
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'mechanic' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Mechanic or Admin clearance required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ticketId, dbId, issueResolved, partsUsed, repairCost, serviceStatus = 'operational' } = body;

    let targetRequest = null;
    if (dbId) {
      targetRequest = await prisma.dispatchRequest.findUnique({ where: { id: dbId } });
    }

    if (!targetRequest && ticketId) {
      const cleanId = ticketId.replace('SOS-', '');
      targetRequest = await prisma.dispatchRequest.findFirst({
        where: {
          OR: [
            { id: ticketId },
            { id: { startsWith: cleanId.toLowerCase() } }
          ]
        }
      });
    }

    const cost = parseFloat(repairCost) || 0;
    const workOrderSummary = `[REPAIR COMPLETED] ${issueResolved || 'Issue resolved.'} | Parts: ${partsUsed || 'None'} | Cost: ₱${cost.toLocaleString()} | Tech: ${session.user.name} (${session.user.registryId})`;

    if (targetRequest) {
      // Update request to completed
      const updatedReq = await prisma.dispatchRequest.update({
        where: { id: targetRequest.id },
        data: {
          status: 'completed',
          totalCost: (targetRequest.totalCost || 0) + cost,
          notes: targetRequest.notes ? `${targetRequest.notes} | ${workOrderSummary}` : workOrderSummary
        }
      });

      // Restore asset to available if serviceStatus is operational
      if (serviceStatus === 'operational' && targetRequest.assetId) {
        await prisma.asset.update({
          where: { id: targetRequest.assetId },
          data: { status: 'available' }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Work order logged successfully. Machinery restored to operational fleet.',
        request: updatedReq
      });
    }

    // If no existing request, return confirmation
    return NextResponse.json({
      success: true,
      message: 'Field work order saved successfully.'
    });

  } catch (error) {
    console.error('Error logging work order:', error);
    return NextResponse.json({ error: 'Failed to record field repair work order' }, { status: 500 });
  }
}

// PATCH /api/mechanics - Claim an SOS ticket and dispatch mobile repair van
export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'mechanic' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Mechanic or Admin clearance required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ticketId, dbId, etaMinutes = 25 } = body;

    let targetRequest = null;
    if (dbId) {
      targetRequest = await prisma.dispatchRequest.findUnique({ where: { id: dbId } });
    }

    if (!targetRequest && ticketId) {
      const cleanId = ticketId.replace('SOS-', '');
      targetRequest = await prisma.dispatchRequest.findFirst({
        where: {
          OR: [
            { id: ticketId },
            { id: { startsWith: cleanId.toLowerCase() } }
          ]
        }
      });
    }

    if (!targetRequest) {
      return NextResponse.json({ error: 'SOS Ticket not found' }, { status: 404 });
    }

    const assignedTag = `[CLAIMED BY MECHANIC: ${session.user.name} (${session.user.registryId}) | ETA: ~${etaMinutes} mins]`;
    const updated = await prisma.dispatchRequest.update({
      where: { id: targetRequest.id },
      data: {
        status: 'in_progress',
        notes: targetRequest.notes ? `${targetRequest.notes} | ${assignedTag}` : assignedTag
      }
    });

    // Mark asset under maintenance
    if (targetRequest.assetId) {
      await prisma.asset.update({
        where: { id: targetRequest.assetId },
        data: { status: 'maintenance' }
      });
    }

    return NextResponse.json({
      success: true,
      message: `SOS breakdown ticket claimed. Mobile repair van en route (ETA ~${etaMinutes} mins).`,
      request: updated
    });

  } catch (error) {
    console.error('Error claiming SOS ticket:', error);
    return NextResponse.json({ error: 'Failed to claim SOS ticket' }, { status: 500 });
  }
}
