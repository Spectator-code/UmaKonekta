import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  const role = session.user.role;
  const userId = session.user.id;

  try {
    // 1. ADMIN DASHBOARD AGGREGATES
    if (role === 'admin') {
      const [
        totalUsers,
        farmersCount,
        providersCount,
        mechanicsCount,
        secopsCount,
        totalAssets,
        availableAssets,
        dispatchedAssets,
        maintenanceAssets,
        totalRequests,
        pendingRequests,
        activeRequests,
        completedRequests,
        emergencyRequests,
        hectaresAgg,
        revenueAgg,
        recentRequests,
        securityAlertsCount
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'farmer' } }),
        prisma.user.count({ where: { role: 'provider' } }),
        prisma.user.count({ where: { role: 'mechanic' } }),
        prisma.user.count({ where: { role: 'secops' } }),
        prisma.asset.count(),
        prisma.asset.count({ where: { status: 'available' } }),
        prisma.asset.count({ where: { status: 'dispatched' } }),
        prisma.asset.count({ where: { status: 'maintenance' } }),
        prisma.dispatchRequest.count(),
        prisma.dispatchRequest.count({ where: { status: 'pending' } }),
        prisma.dispatchRequest.count({ where: { status: { in: ['approved', 'in_progress', 'dispatched'] } } }),
        prisma.dispatchRequest.count({ where: { status: 'completed' } }),
        prisma.dispatchRequest.count({ where: { status: { in: ['emergency', 'breakdown'] } } }),
        prisma.dispatchRequest.aggregate({
          where: { status: { not: 'cancelled' } },
          _sum: { hectares: true }
        }),
        prisma.dispatchRequest.aggregate({
          where: { status: { not: 'cancelled' } },
          _sum: { totalCost: true }
        }),
        prisma.dispatchRequest.findMany({
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            farmer: { select: { id: true, name: true, registryId: true } },
            asset: { select: { id: true, name: true, type: true, rate: true, location: true } }
          }
        }),
        prisma.siemLog.count({ where: { severity: { in: ['HIGH', 'CRITICAL'] } } })
      ]);

      return NextResponse.json({
        role: 'admin',
        summary: {
          users: {
            total: totalUsers,
            farmers: farmersCount,
            providers: providersCount,
            mechanics: mechanicsCount,
            secops: secopsCount
          },
          assets: {
            total: totalAssets,
            available: availableAssets,
            dispatched: dispatchedAssets,
            maintenance: maintenanceAssets
          },
          requests: {
            total: totalRequests,
            pending: pendingRequests,
            active: activeRequests,
            completed: completedRequests,
            emergency: emergencyRequests
          },
          metrics: {
            totalHectaresCultivated: hectaresAgg._sum.hectares || 0,
            totalTransactionVolume: revenueAgg._sum.totalCost || 0,
            criticalSecurityAlerts: securityAlertsCount
          }
        },
        recentRequests
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // 2. PROVIDER DASHBOARD AGGREGATES
    if (role === 'provider') {
      const assets = await prisma.asset.findMany({
        where: { providerId: userId },
        orderBy: { createdAt: 'desc' }
      });

      const requests = await prisma.dispatchRequest.findMany({
        where: { asset: { providerId: userId } },
        include: {
          farmer: { select: { id: true, name: true, registryId: true } },
          asset: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const totalFleet = assets.length;
      const availableUnits = assets.filter(a => a.status === 'available').length;
      const dispatchedUnits = assets.filter(a => a.status === 'dispatched').length;
      const maintenanceUnits = assets.filter(a => a.status === 'maintenance').length;

      const pendingOrders = requests.filter(r => r.status === 'pending').length;
      const activeJobs = requests.filter(r => ['approved', 'in_progress', 'dispatched'].includes(r.status)).length;
      const completedJobs = requests.filter(r => r.status === 'completed').length;

      const totalEarned = requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.totalCost || 0), 0);

      const pendingRevenue = requests
        .filter(r => ['pending', 'approved', 'in_progress', 'dispatched'].includes(r.status))
        .reduce((sum, r) => sum + (r.totalCost || 0), 0);

      const totalHectaresServiced = requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.hectares || 0), 0);

      return NextResponse.json({
        role: 'provider',
        summary: {
          fleet: {
            total: totalFleet,
            available: availableUnits,
            dispatched: dispatchedUnits,
            maintenance: maintenanceUnits
          },
          orders: {
            pending: pendingOrders,
            active: activeJobs,
            completed: completedJobs
          },
          financials: {
            totalEarned,
            pendingRevenue,
            totalHectaresServiced
          }
        },
        assets,
        requests
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // 3. FARMER DASHBOARD AGGREGATES
    if (role === 'farmer') {
      const [requests, availablePoolCount, totalCoopsCount] = await Promise.all([
        prisma.dispatchRequest.findMany({
          where: { farmerId: userId },
          include: {
            asset: {
              include: {
                provider: {
                  select: { id: true, name: true, registryId: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.asset.count({ where: { status: 'available' } }),
        prisma.user.count({ where: { role: 'provider' } })
      ]);

      const pendingCount = requests.filter(r => r.status === 'pending').length;
      const activeCount = requests.filter(r => ['approved', 'in_progress', 'dispatched'].includes(r.status)).length;
      const completedCount = requests.filter(r => r.status === 'completed').length;

      const totalHectares = requests
        .filter(r => r.status !== 'cancelled')
        .reduce((sum, r) => sum + (r.hectares || 0), 0);

      const totalSpent = requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.totalCost || 0), 0);

      return NextResponse.json({
        role: 'farmer',
        summary: {
          requests: {
            total: requests.length,
            pending: pendingCount,
            active: activeCount,
            completed: completedCount
          },
          metrics: {
            totalHectaresBooked: totalHectares,
            totalCompletedCost: totalSpent
          },
          cooperativeNetwork: {
            availableMachines: availablePoolCount,
            accreditedCoops: totalCoopsCount
          }
        },
        requests
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // 4. MECHANIC DASHBOARD AGGREGATES
    if (role === 'mechanic') {
      const [
        emergencyRequests,
        maintenanceAssets,
        activeRepairsCount,
        resolvedRepairsCount
      ] = await Promise.all([
        prisma.dispatchRequest.findMany({
          where: {
            OR: [
              { status: { in: ['emergency', 'breakdown', 'maintenance'] } },
              { notes: { contains: 'EMERGENCY' } },
              { notes: { contains: 'SOS' } }
            ]
          },
          include: {
            farmer: { select: { id: true, name: true, registryId: true } },
            asset: { include: { provider: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.asset.findMany({
          where: { status: 'maintenance' },
          include: { provider: true }
        }),
        prisma.dispatchRequest.count({
          where: { status: { in: ['in_progress', 'dispatched'] } }
        }),
        prisma.dispatchRequest.count({
          where: { status: { in: ['completed', 'resolved'] } }
        })
      ]);

      return NextResponse.json({
        role: 'mechanic',
        summary: {
          openEmergencyAlerts: emergencyRequests.length,
          fleetInMaintenance: maintenanceAssets.length,
          activeRepairsInProgress: activeRepairsCount,
          completedWorkOrders: resolvedRepairsCount
        },
        emergencyAlerts: emergencyRequests,
        maintenanceFleet: maintenanceAssets
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // 5. SECOPS DASHBOARD AGGREGATES
    if (role === 'secops') {
      const [
        totalSiemLogs,
        criticalThreats,
        highThreats,
        mediumThreats,
        lowThreats,
        bannedIpsCount,
        bannedUsersCount,
        trafficLogsCount,
        lockdownConfig,
        cyguardConfig
      ] = await Promise.all([
        prisma.siemLog.count(),
        prisma.siemLog.count({ where: { severity: 'CRITICAL' } }),
        prisma.siemLog.count({ where: { severity: 'HIGH' } }),
        prisma.siemLog.count({ where: { severity: 'MEDIUM' } }),
        prisma.siemLog.count({ where: { severity: 'LOW' } }),
        prisma.ipBlacklist.count(),
        prisma.user.count({ where: { isBanned: true } }),
        prisma.trafficLog.count(),
        prisma.systemConfig.findUnique({ where: { key: 'GLOBAL_LOCKDOWN' } }),
        prisma.systemConfig.findUnique({ where: { key: 'CYGUARD_ACTIVE' } })
      ]);

      return NextResponse.json({
        role: 'secops',
        summary: {
          siem: {
            total: totalSiemLogs,
            critical: criticalThreats,
            high: highThreats,
            medium: mediumThreats,
            low: lowThreats
          },
          perimeter: {
            bannedIps: bannedIpsCount,
            bannedUsers: bannedUsersCount,
            totalTrafficHits: trafficLogsCount
          },
          defcon: {
            lockdownActive: lockdownConfig?.value === 'true',
            cyguardActive: cyguardConfig?.value === 'true'
          }
        }
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    return NextResponse.json({ role, message: 'Authenticated user session active.' });

  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    return NextResponse.json({ error: 'Failed to aggregate dashboard analytics' }, { status: 500 });
  }
}
