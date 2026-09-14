import { NextRequest, NextResponse } from 'next/server';
import { getAds, saveAds, AdItem } from '@/lib/data';

export async function GET() {
  try {
    const ads = await getAds();
    return NextResponse.json(ads);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const ads = await getAds();

    if (action === 'delete') {
      const { id } = body;
      const updated = ads.filter((a) => a.id !== id);
      await saveAds(updated);
      return NextResponse.json({ success: true, ads: updated });
    }

    if (action === 'toggle') {
      const { id } = body;
      const updated = ads.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
      await saveAds(updated);
      return NextResponse.json({ success: true, ads: updated });
    }

    // Default: Add or update ad
    const { title, sponsor, description, url, image, logo, targetTag } = body;
    if (!title || !sponsor) {
      return NextResponse.json({ error: 'Reklam başlığı ve sponsor adı zorunludur.' }, { status: 400 });
    }

    const newAd: AdItem = {
      id: `ad_${Date.now()}`,
      title,
      sponsor,
      description: description || '',
      url: url || '/reklam',
      image: image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      logo: logo || 'https://devcore.tr/favicon.ico',
      targetTag: targetTag || 'global',
      impressions: 0,
      clicks: 0,
      active: true,
    };

    ads.unshift(newAd);
    await saveAds(ads);
    return NextResponse.json({ success: true, ad: newAd, ads });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
