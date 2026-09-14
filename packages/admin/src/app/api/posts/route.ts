import { NextRequest, NextResponse } from 'next/server';
import { getPosts, deletePost } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const posts = await getPosts(q);
    return NextResponse.json(posts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Post ID gereklidir.' }, { status: 400 });
    }
    await deletePost(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
