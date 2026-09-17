import { NextResponse } from 'next/server';
import { getCrawlerStatus, triggerCrawlerRun } from '@/lib/data';

export async function GET() {
  const status = getCrawlerStatus();
  return NextResponse.json(status);
}

export async function POST() {
  const status = await triggerCrawlerRun();
  return NextResponse.json({ success: true, message: 'Tarayıcı başlatıldı.', status });
}
