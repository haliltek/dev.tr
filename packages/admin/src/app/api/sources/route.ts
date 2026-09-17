import { NextRequest, NextResponse } from 'next/server';
import { getSources, saveSources, SourceItem, slugifyTurkish, crawlSingleSource } from '@/lib/data';

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

    const cleanSlug = slugifyTurkish(name);
    const rawHandle = (handle ? slugifyTurkish(handle) : cleanSlug) || `src-${Date.now()}`;
    const id = rawHandle;

    let postCount = 0;

    // If feedUrl is provided, crawl immediately!
    const trimmedFeed = feedUrl ? feedUrl.trim() : undefined;
    if (trimmedFeed) {
      try {
        const crawlResult = await crawlSingleSource({
          id,
          name,
          feedUrl: trimmedFeed,
          website: website || 'https://devcore.tr',
          image: image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
          defaultTags: [rawHandle, 'devcore', 'tech'],
        });
        postCount = crawlResult.added;
      } catch (crawlErr) {
        console.error('Initial crawl error:', crawlErr);
      }
    }

    const newSource: SourceItem = {
      id,
      name,
      handle: rawHandle,
      website: website || 'https://devcore.tr',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      feedUrl: trimmedFeed,
      postCount,
      active: true,
    };

    const updated = [newSource, ...sources.filter((s) => s.id !== id)];
    await saveSources(updated);

    return NextResponse.json({ success: true, source: newSource, sources: updated, addedPosts: postCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
