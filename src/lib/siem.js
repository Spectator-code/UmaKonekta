/**
 * @file siem.js
 * @description Enterprise SIEM Logger module with automated fallback persistence.
 * @module siem
 */

import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

/**
 * Fire-and-forget SIEM Logger
 * Records security events to the database with a resilient local file fallback.
 * 
 * @param {Object} params
 * @param {string} params.eventType - Categorized event string (e.g. 'FAILED_LOGIN')
 * @param {string} [params.ipAddress] - IP address of the requester if available
 * @param {string} [params.registryId] - Targeted or active Registry ID/Username
 * @param {string} [params.details] - Additional JSON or text context
 * @param {string} [params.severity] - 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
 */
export async function logSecurityEvent({ eventType, ipAddress, registryId, details, severity = 'LOW' }) {
  const formattedDetails = typeof details === 'object' ? JSON.stringify(details) : (details || null);

  try {
    await prisma.siemLog.create({
      data: {
        eventType,
        ipAddress: ipAddress || 'unknown',
        registryId: registryId || null,
        details: formattedDetails,
        severity
      }
    });
    console.log(`[SIEM] [${severity}] ${eventType} logged successfully.`);
  } catch (error) {
    // If the database is unreachable, safely fall back to local disk logging
    console.error('[SIEM_FAILURE] Failed to write security event to database. Writing to fallback log:', error?.message || error);
    try {
      const fallbackPath = path.join(process.cwd(), 'siem-fallback.log');
      const logRecord = {
        timestamp: new Date().toISOString(),
        severity,
        eventType,
        ipAddress: ipAddress || 'unknown',
        registryId: registryId || null,
        details: formattedDetails
      };
      fs.appendFileSync(fallbackPath, JSON.stringify(logRecord) + '\n', 'utf8');
    } catch (fsError) {
      console.error('[SIEM_FATAL] Failed to write to fallback log file:', fsError);
    }
  }
}
