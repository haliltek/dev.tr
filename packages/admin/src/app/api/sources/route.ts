import { NextRequest, NextResponse } from 'next/server';
import { getSources, saveSources, SourceItem } from '@/lib/data';

export async function GET() {
  try {
    const sources = await getSources();
    return NextResponse.json(sources);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const sources = await getSources();

    if (action === 'delete') {
      const { id } = body;
      const updated = sources.filter((s) => s.id !== id);
      await saveSources(updated);
      return NextResponse.json({ success: true, sources: updated });
    }

    if (action === 'toggle') {
      const { id } = body;
      const updated = sources.map((s) =>
        s.id === id ? { ...s, active: !(s.active ?? true) } : s
      );
      await saveSources(updated);
      return NextResponse.json({ success: true, sources: updated });
    }

    // Default: Add source
    const { name, handle, website, description, image, feedUrl } = body;
    if (!name) {
      return NextResponse.json({ error: 'Kaynak adı zorunludur.' }, { status: 400 });
    }

    const newSource: SourceItem = {
      id: handle || `src_${Date.now()}`,
      name,
      handle: handle || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      website: website || 'https://devcore.tr',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      feedUrl,
      postCount: 0,
      active: true,
    };

    sources.unshift(newSource);
    await saveSources(sources);
    return NextResponse.json({ success: true, source: newSource, sources });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
