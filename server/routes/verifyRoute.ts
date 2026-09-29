import type { Request, Response } from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extractClientIp, parseUserAgent, resolveIpGeo } from '../services/networkService.ts';
import { verificationStore } from '../storage/verificationStore.ts';

function sendJson(res: Response | ServerResponse, statusCode: number, data: unknown): void {
  const expressRes = res as Response;
  if (typeof expressRes.status === 'function' && typeof expressRes.json === 'function') {
    expressRes.status(statusCode).json(data);
    return;
  }
  // Standard Node.js ServerResponse fallback
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function parseRequestBody(req: Request | IncomingMessage): Promise<Record<string, unknown>> {
  const expressReq = req as Request;
  if (expressReq.body && typeof expressReq.body === 'object' && Object.keys(expressReq.body).length > 0) {
    return expressReq.body;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

export async function handleVerify(req: Request | IncomingMessage, res: Response | ServerResponse): Promise<void> {
  try {
    const rawIp = extractClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || 'Undisclosed Agent';
    const acceptLanguage = (req.headers['accept-language'] as string) || 'unknown';
    const { browser, os } = parseUserAgent(userAgent);

    const body = await parseRequestBody(req);
    const screenWidth = Number(body.screenWidth) || 0;
    const screenHeight = Number(body.screenHeight) || 0;
    const timezone = typeof body.timezone === 'string' ? body.timezone : 'UTC';
    const interactionCount = Number(body.interactionCount) || 0;
    const discoveredSecrets = Array.isArray(body.discoveredSecrets)
      ? body.discoveredSecrets.filter((s: unknown) => typeof s === 'string')
      : [];

    // Hardware and client power metrics
    const cpuCores = body.cpuCores ? `${body.cpuCores} Logic Cores` : 'Undisclosed Processor';
    const deviceMemory = body.deviceMemory ? `${body.deviceMemory} GB RAM` : 'Standard Allocation';
    const batteryStatus = typeof body.batteryStatus === 'string' ? body.batteryStatus : 'Direct Power / Unknown';
    const connectionType = typeof body.connectionType === 'string' ? body.connectionType : 'Broadband / Unknown';
    const inputMechanism = typeof body.inputMechanism === 'string' ? body.inputMechanism : 'Precision Pointer';

    // Server-side Geolocation & ISP resolution
    const geo = await resolveIpGeo(rawIp, timezone);

    // Store record
    const saved = verificationStore.save({
      ipAddress: rawIp,
      userAgent,
      browser,
      os,
      language: acceptLanguage.split(',')[0],
      timezone,
      screenWidth,
      screenHeight,
      interactionCount,
      discoveredSecrets,
    });

    // Theatrical evaluations based on actual interaction metrics
    const biologicalNotes = [
      'Cellular homeostasis somehow holding together.',
      'Specimen is actively observing the observation device.',
      'Mitochondrial output: adequate for persistent clicking.',
      'DNA replication errors: standard mammalian tolerance.'
    ];

    const mechanicalNotes = [
      'Engine diagnostic: RPM detected. Brakes: hopeful.',
      'Internal combustion: unnecessary for web browsing, yet appreciated.',
      'Driver judgment index: consistently unconventional.',
      'Chassis alignment: emotionally uncertain.'
    ];

    const bikeNotes = [
      'Two wheels assumed. Stability is now your problem.',
      'Chain tension: acceptable. Common sense: pending review.',
      'Leaning angle: questionable.',
      'Balance algorithm: operating on sheer willpower.'
    ];

    const bioNote = biologicalNotes[interactionCount % biologicalNotes.length];
    const mechNote = mechanicalNotes[(interactionCount + 1) % mechanicalNotes.length];
    const bikeNote = bikeNotes[(interactionCount + 2) % bikeNotes.length];

    sendJson(res, 200, {
      success: true,
      verificationId: saved.id,
      timestamp: saved.createdAt,
      network: {
        ipAddress: rawIp,
        protocol: geo.protocol,
        source: 'server-observed',
        userAgent,
        browser,
        os,
        language: saved.language,
        location: geo.locationFormatted,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        isp: geo.isp,
      },
      clientData: {
        viewport: screenWidth > 0 && screenHeight > 0 ? `${screenWidth} × ${screenHeight}` : 'Unknown',
        timezone,
        interactionCount,
        discoveredSecretsCount: discoveredSecrets.length,
      },
      hardware: {
        cpuCores,
        deviceMemory,
        batteryStatus,
        connectionType,
        inputMechanism,
      },
      theatricalDiagnostics: {
        biological: {
          label: 'BIOLOGICAL INTEGRITY',
          status: 'Suspiciously alive',
          detail: bioNote,
        },
        mechanical: {
          label: 'VEHICLE / ENGINE INTEGRITY',
          status: 'Operational',
          detail: mechNote,
        },
        bike: {
          label: 'TWO-WHEEL SYSTEM',
          status: 'Two wheels assumed',
          detail: bikeNote,
        },
        macAddress: {
          label: 'HARDWARE MAC ADDRESS',
          status: 'ACCESS DENIED',
          detail: 'Web browsers intentionally forbid physical MAC reading. Nice try.',
        },
        commonSense: {
          label: 'COMMON SENSE DETECTION',
          status: 'Not detected',
          detail: 'Specimen reached the end of this diagnostic anyway.',
        }
      },
      punchline: {
        primary: 'DATA ACQUISITION COMPLETE.',
        secondary: 'Don’t worry.',
        tertiary: 'We have absolutely no idea what to do with it.',
        closing: 'Thank you for participating in this extremely unnecessary scientific experiment.',
      }
    });
  } catch (error) {
    console.error('Error during verification handling:', error);
    sendJson(res, 500, {
      success: false,
      error: 'Diagnostic acquisition failure.',
    });
  }
}

export async function handleForwardToOwner(req: Request | IncomingMessage, res: Response | ServerResponse): Promise<void> {
  try {
    const body = await parseRequestBody(req);
    const triggerButton = (body.triggerButton as 'submit' | 'close' | 'repeat') || 'submit';
    const verificationId = (body.verificationId as string) || `anon-${Date.now()}`;
    const dossier = (body.dossier as Record<string, unknown>) || {};

    const dispatch = verificationStore.dispatchToOwner(triggerButton, verificationId, dossier);

    sendJson(res, 200, {
      success: true,
      message: 'Evaluation dossier successfully forwarded to site owner.',
      dispatchId: dispatch.dispatchId,
      ownerRecipient: dispatch.ownerRecipient,
      status: dispatch.status,
    });
  } catch (error) {
    console.error('Error forwarding to owner:', error);
    sendJson(res, 500, {
      success: false,
      error: 'Dispatch routing failure.',
    });
  }
}


