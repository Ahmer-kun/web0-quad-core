import type { IncomingMessage } from 'node:http';

export interface ParsedClientNetwork {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  language: string;
}

export interface ResolvedGeo {
  city: string;
  region: string;
  country: string;
  isp: string;
  protocol: 'IPv6' | 'IPv4' | 'Internal Loopback';
  locationFormatted: string;
}

export function extractClientIp(req: IncomingMessage): string {
  // If behind a trusted reverse proxy (e.g., Cloud Run, Nginx),
  // x-forwarded-for will contain a comma-separated list of IPs.
  // The first IP is the original client.
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const rawIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    const cleaned = rawIp.trim();
    if (cleaned) {
      // Remove IPv6-mapped IPv4 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
      return cleaned.replace(/^::ffff:/, '');
    }
  }

  // Next check x-real-ip
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp.trim().replace(/^::ffff:/, '');
  }

  // Socket remote address fallback
  const socketIp = req.socket?.remoteAddress || '127.0.0.1';
  return socketIp.replace(/^::ffff:/, '');
}

export async function resolveIpGeo(rawIp: string, fallbackTimezone?: string): Promise<ResolvedGeo> {
  const ip = rawIp.trim();
  const isIPv6 = ip.includes(':');
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === 'localhost';

  const protocol: 'IPv6' | 'IPv4' | 'Internal Loopback' = isLocal
    ? 'Internal Loopback'
    : isIPv6
    ? 'IPv6'
    : 'IPv4';

  // Fallback defaults from timezone if provided (e.g. "Asia/Karachi" -> City: Karachi, Region: Asia)
  let city = 'Unspecified City';
  let region = 'Regional Grid';
  let country = 'Earth (Terran Zone)';
  let isp = 'Terrestrial Carrier Network';

  if (fallbackTimezone && fallbackTimezone.includes('/')) {
    const parts = fallbackTimezone.split('/');
    region = parts[0].replace('_', ' ');
    city = parts[1].replace('_', ' ');
    country = `Zone (${parts[0]})`;
  }

  if (isLocal) {
    return {
      city: city !== 'Unspecified City' ? city : 'Localhost Station',
      region: region !== 'Regional Grid' ? region : 'Loopback Subnet',
      country: 'Virtual Terminal',
      isp: 'Internal Loopback Interface',
      protocol,
      locationFormatted: city !== 'Unspecified City' ? `${city}, ${region} (Local Host)` : 'Localhost / Loopback Node',
    };
  }

  // For public IPs, attempt fast lookup with 1.8s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,org,as,query`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        const foundCity = data.city || city;
        const foundRegion = data.regionName || region;
        const foundCountry = data.country || country;
        const foundIsp = data.isp || data.org || data.as || isp;

        return {
          city: foundCity,
          region: foundRegion,
          country: foundCountry,
          isp: foundIsp,
          protocol,
          locationFormatted: `${foundCity}, ${foundRegion}, ${foundCountry}`,
        };
      }
    }
  } catch {
    // Graceful fallback to timezone-inferred location if external lookup is blocked or times out
  }

  return {
    city,
    region,
    country,
    isp,
    protocol,
    locationFormatted: `${city}, ${country}`,
  };
}

export function parseUserAgent(uaString: string = ''): { browser: string; os: string } {
  const ua = uaString.toLowerCase();
  
  let browser = 'Unknown Browser';
  if (ua.includes('edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('chrome/') && !ua.includes('chromium')) {
    browser = 'Google Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Apple Safari';
  } else if (ua.includes('firefox/')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
  }

  let os = 'Unknown OS';
  if (ua.includes('win')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  return { browser, os };
}
