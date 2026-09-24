import type { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_URL = process.env.ADMIN_URL || 'http://devcore-admin:5003';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, status: 'ready' });
  }

  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

    const payload = {
      ...req.body,
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers['referer'] || req.body?.referrer || '',
      ip,
    };

    const adminResponse = await fetch(`${ADMIN_URL}/api/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (adminResponse.ok) {
      const data = await adminResponse.json();
      return res.status(200).json(data);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Non-blocking telemetry
    return res.status(200).json({ ok: true, fallback: true });
  }
}
