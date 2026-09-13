import type { NextApiRequest, NextApiResponse } from 'next';

const BACKOFFICE_BACKEND_URL =
  process.env.BACKOFFICE_BACKEND_URL || 'http://172.25.0.1:5005';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { slug } = req.query;
  const endpoint = Array.isArray(slug) ? slug.join('/') : slug || '';
  
  // Forward query string
  const queryStr = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const targetUrl = `${BACKOFFICE_BACKEND_URL}/api/${endpoint}${queryStr}`;

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Backoffice API proxy error', details: message });
  }
}
