import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
  // Return empty ads array to prevent ad cards in feed
  return res.status(200).json([]);
}
