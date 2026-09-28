import { prisma } from './prisma';

/**
 * Fire-and-forget SIEM Logger
 * Records security events to the database without blocking the main request thread.
 * 
 * @param {Object} params
 * @param {string} params.eventType - Categorized event string (e.g. 'FAILED_LOGIN')
 * @param {string} [params.ipAddress] - IP address of the requester if available
 * @param {string} [params.registryId] - Targeted or active Registry ID/Username
 * @param {string} [params.details] - Additional JSON or text context
 * @param {string} [params.severity] - 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
 */
export async function logSecurityEvent({ eventType, ipAddress, registryId, details, severity = 'LOW' }) {
  try {
    // Fire and forget - do not await in the critical path unless necessary, 
    // but here we are in a serverless environment so we should await to ensure execution.
    // The try/catch ensures it doesn't crash the parent function.
    await prisma.siemLog.create({
      data: {
        eventType,
        ipAddress: ipAddress || 'unknown',
        registryId: registryId || null,
        details: typeof details === 'object' ? JSON.stringify(details) : (details || null),
        severity
      }
    });
    console.log(`[SIEM] [${severity}] ${eventType} logged successfully.`);
  } catch (error) {
    // If the SIEM database goes down, we just log to stdout instead of breaking the app
    console.error('[SIEM_FAILURE] Failed to write security event to database:', error);
  }
}
