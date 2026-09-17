import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');

  try {
    const customAdsFile = path.join(process.cwd(), '..', 'admin', 'data', 'custom_ads.json');
    if (fs.existsSync(customAdsFile)) {
      const raw = fs.readFileSync(customAdsFile, 'utf-8');
      const ads = JSON.parse(raw);
      if (Array.isArray(ads) && ads.length > 0) {
        const activeAds = ads.filter((a: any) => a.active !== false);
        if (activeAds.length > 0) {
          const ad = activeAds[Math.floor(Math.random() * activeAds.length)];
          return res.status(200).json([
            {
              id: ad.id,
              title: ad.title,
              description: ad.description,
              sponsor: ad.sponsor,
              logo: ad.logo,
              image: ad.image,
              url: ad.url,
              active: true,
            },
          ]);
        }
      }
    }
  } catch {}

  // Fast empty response (0ms)
  return res.status(200).json([]);
}
