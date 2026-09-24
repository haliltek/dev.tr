import { NextResponse } from 'next/server';
import { getRealtimeMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getRealtimeMetrics();
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching metrics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
