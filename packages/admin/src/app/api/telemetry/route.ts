import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = (body.sessionId || req.headers.get('x-session-id') || 'sess_anon').slice(0, 64);
    const path = (body.path || '/').slice(0, 255);
    const referrer = (body.referrer || req.headers.get('referer') || '').slice(0, 255);
    const userAgent = req.headers.get('user-agent') || body.userAgent || '';
    
    // Detect basic device type from UA
    const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : (body.deviceType || 'desktop');

    // Detect browser
    let browser = 'Chrome';
    if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
    else if (/Edg/i.test(userAgent)) browser = 'Edge';

    const city = body.city || 'Istanbul';

    // Insert new ping record
    await dbQuery(
      `INSERT INTO site_telemetry (session_id, path, referrer, user_agent, device_type, browser, country, city, created_at, last_ping)
       VALUES ($1, $2, $3, $4, $5, $6, 'TR', $7, NOW(), NOW())`,
      [sessionId, path, referrer, userAgent.slice(0, 500), deviceType, browser, city]
    );

    return NextResponse.json({ ok: true, timestamp: Date.now() });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'devcore-telemetry', timestamp: Date.now() });
}
