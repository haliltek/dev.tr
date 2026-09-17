import fs from 'fs';
import path from 'path';
import { dbQuery } from './db';
import { getCrawlerState, runCrawlerTask } from './crawler';

const DATA_DIR = path.join(process.cwd(), 'data');
const ADS_FILE = path.join(DATA_DIR, 'custom_ads.json');
const SOURCES_FILE = path.join(DATA_DIR, 'custom_sources.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ----------------------------------------------------
// ADS
// ----------------------------------------------------
export interface AdItem {
  id: string;
  title: string;
  description: string;
  sponsor: string;
  logo: string;
  image: string;
  url: string;
  targetTag: string;
  impressions: number;
  clicks: number;
  active: boolean;
}

const DEFAULT_ADS: AdItem[] = [
  {
    id: 'ad_1',
    title: 'Devcore Partner Programı - Sponsor Olun',
    description: "Türkiye'nin en nitelikli yazılımcı ekosistemine doğrudan ulaşın.",
    sponsor: 'devcore.tr',
    logo: 'https://devcore.tr/favicon.ico',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    url: '/reklam',
    targetTag: 'global',
    impressions: 1420,
    clicks: 68,
    active: true,
  },
  {
    id: 'ad_2',
    title: 'Trendyol Tech Buluşmaları 2026',
    description: 'Büyük ölçekli sistemler ve mikroservis mimarileri üzerine online webinar serisi.',
    sponsor: 'Trendyol Tech',
    logo: 'https://unavatar.io/trendyol.com',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    url: 'https://medium.com/trendyol-tech',
    targetTag: 'microservices',
    impressions: 2840,
    clicks: 194,
    active: true,
  },
];

export async function getAds(): Promise<AdItem[]> {
  ensureDir();
  if (fs.existsSync(ADS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ADS_FILE, 'utf-8'));
    } catch {}
  }
  fs.writeFileSync(ADS_FILE, JSON.stringify(DEFAULT_ADS, null, 2));
  return DEFAULT_ADS;
}

export async function saveAds(ads: AdItem[]): Promise<void> {
  ensureDir();
  fs.writeFileSync(ADS_FILE, JSON.stringify(ads, null, 2));
}

// ----------------------------------------------------
// SOURCES
// ----------------------------------------------------
export interface SourceItem {
  id: string;
  name: string;
  handle: string;
  website: string;
  description: string;
  image: string;
  feedUrl?: string;
  postCount: number;
  active?: boolean;
}

export async function getSources(): Promise<SourceItem[]> {
  ensureDir();
  let jsonSources: SourceItem[] = [];
  if (fs.existsSync(SOURCES_FILE)) {
    try {
      jsonSources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'));
    } catch {}
  }
  const jsonMap = new Map<string, SourceItem>(jsonSources.map((s) => [s.id, s]));

  try {
    const rows = await dbQuery<{
      id: string;
      name: string;
      handle: string | null;
      website: string | null;
      description: string | null;
      image: string | null;
      active: boolean | null;
      post_count: string | number;
    }>(
      `SELECT 
        s.id,
        s.name,
        COALESCE(s.handle, s.id) as handle,
        COALESCE(s.website, '') as website,
        COALESCE(s.description, '') as description,
        COALESCE(s.image, '') as image,
        COALESCE(s.active, true) as active,
        COUNT(p.id) as post_count
      FROM source s
      LEFT JOIN post p ON p."sourceId" = s.id AND p.deleted IS NOT TRUE
      GROUP BY s.id, s.name, s.handle, s.website, s.description, s.image, s.active
      ORDER BY post_count DESC, s.name ASC
      LIMIT 200`
    );

    if (rows && rows.length > 0) {
      const dbSources: SourceItem[] = rows.map((r) => {
        const fromJson = jsonMap.get(r.id);
        return {
          id: r.id,
          name: r.name,
          handle: r.handle || r.id,
          website: r.website || '',
          description: r.description || '',
          image: r.image || '',
          feedUrl: fromJson?.feedUrl,
          postCount: Number(r.post_count) || 0,
          active: r.active !== false,
        };
      });

      // Also include any JSON sources not present in PostgreSQL yet
      for (const [id, s] of jsonMap) {
        if (!dbSources.some((item) => item.id === id)) {
          dbSources.unshift(s);
        }
      }

      return dbSources;
    }
  } catch (err) {
    console.warn('[getSources] Fallback to JSON file:', err);
  }

  return jsonSources;
}

export async function saveSources(sources: SourceItem[]): Promise<void> {
  ensureDir();
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(sources, null, 2));

  // Sync to PostgreSQL with proper UPSERT
  for (const s of sources) {
    try {
      const handle = (s.handle || s.id).slice(0, 36);
      const image = s.image || 'https://media.daily.dev/image/upload/s--LrHsyt2T--/f_auto/v1692632054/squad_placeholder_sfwkmj';
      await dbQuery(
        `INSERT INTO source (id, name, handle, website, description, image, active, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'machine')
         ON CONFLICT (id) DO UPDATE 
         SET active = EXCLUDED.active, 
             name = EXCLUDED.name, 
             handle = EXCLUDED.handle,
             website = EXCLUDED.website, 
             description = EXCLUDED.description, 
             image = EXCLUDED.image`,
        [s.id, s.name, handle, s.website || '', s.description || '', image, s.active !== false]
      );
    } catch (err) {
      console.warn(`[saveSources] Failed to upsert DB for ${s.id}:`, err);
    }
  }
}

// ----------------------------------------------------
// POSTS
// ----------------------------------------------------
export interface PostItem {
  id: string;
  title: string;
  summary: string;
  tagsStr: string;
  sourceId: string;
  sourceName?: string;
  publishedAt: string;
  upvotes: number;
  views: number;
  url: string;
  image: string;
}

export async function getPosts(q?: string): Promise<PostItem[]> {
  try {
    let sql = `
      SELECT 
        p.id,
        p.title,
        COALESCE(p.summary, p.description, '') as summary,
        COALESCE(p."tagsStr", '') as "tagsStr",
        p."sourceId",
        COALESCE(s.name, p."sourceId") as "sourceName",
        COALESCE(p."publishedAt", p."createdAt") as "publishedAt",
        COALESCE(p.upvotes, 0) as upvotes,
        COALESCE(p.views, 0) as views,
        COALESCE(p.url, '') as url,
        COALESCE(p.image, '') as image
      FROM post p
      LEFT JOIN source s ON p."sourceId" = s.id
      WHERE p.deleted IS NOT TRUE
    `;

    const params: any[] = [];
    if (q && q.trim()) {
      params.push(`%${q.trim()}%`);
      sql += ` AND (p.title ILIKE $1 OR p."tagsStr" ILIKE $1 OR s.name ILIKE $1)`;
    }

    sql += ` ORDER BY COALESCE(p."publishedAt", p."createdAt") DESC LIMIT 100`;

    const rows = await dbQuery<any>(sql, params);
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary || '',
        tagsStr: r.tagsStr || '',
        sourceId: r.sourceId,
        sourceName: r.sourceName || r.sourceId,
        publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : new Date().toISOString(),
        upvotes: Number(r.upvotes) || 0,
        views: Number(r.views) || 0,
        url: r.url || '',
        image: r.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      }));
    }
  } catch (err) {
    console.warn('[getPosts] Fallback to JSON:', err);
  }

  // Fallback
  ensureDir();
  let list: PostItem[] = [];
  if (fs.existsSync(POSTS_FILE)) {
    try {
      list = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    } catch {}
  }
  if (q && q.trim()) {
    const term = q.toLowerCase();
    return list.filter((p) => p.title.toLowerCase().includes(term) || p.tagsStr.toLowerCase().includes(term));
  }
  return list;
}

export async function deletePost(id: string): Promise<void> {
  try {
    await dbQuery(
      `UPDATE post SET deleted = true, visible = false WHERE id = $1`,
      [id]
    );
  } catch (err) {
    console.error(`[deletePost] Failed to update post in DB for ${id}:`, err);
  }

  ensureDir();
  if (fs.existsSync(POSTS_FILE)) {
    try {
      const current = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8')) as PostItem[];
      const filtered = current.filter((p) => p.id !== id);
      fs.writeFileSync(POSTS_FILE, JSON.stringify(filtered, null, 2));
    } catch {}
  }
}

// ----------------------------------------------------
// STATS
// ----------------------------------------------------
export interface StatsData {
  posts: number;
  sources: number;
  keywords: number;
  users: number;
  upvotes: number;
}

export async function getStats(): Promise<StatsData> {
  try {
    const [postsRes, sourcesRes, usersRes, upvotesRes, keywordsRes] = await Promise.all([
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM post WHERE deleted IS NOT TRUE'),
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM source WHERE active IS TRUE'),
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM "user"'),
      dbQuery<{ sum: string }>('SELECT COALESCE(SUM(upvotes), 0) as sum FROM post WHERE deleted IS NOT TRUE'),
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM keyword'),
    ]);

    return {
      posts: Number(postsRes[0]?.count) || 0,
      sources: Number(sourcesRes[0]?.count) || 0,
      users: Number(usersRes[0]?.count) || 0,
      upvotes: Number(upvotesRes[0]?.sum) || 0,
      keywords: Number(keywordsRes[0]?.count) || 0,
    };
  } catch (err) {
    console.warn('[getStats] Fallback stats:', err);
    return {
      posts: 576,
      sources: 150,
      keywords: 85,
      users: 14,
      upvotes: 820,
    };
  }
}

// ----------------------------------------------------
// USERS
// ----------------------------------------------------
export interface UserItem {
  id: string;
  name: string;
  username: string;
  image: string;
  reputation: number;
  role?: string;
  createdAt: string;
}

export async function getUsers(): Promise<UserItem[]> {
  try {
    const rows = await dbQuery<{
      id: string;
      name: string | null;
      username: string;
      image: string | null;
      reputation: number | null;
      createdAt: string | Date;
    }>(
      `SELECT 
        id,
        COALESCE(name, username) as name,
        username,
        COALESCE(image, '') as image,
        COALESCE(reputation, 0) as reputation,
        "createdAt"
      FROM "user"
      ORDER BY reputation DESC, "createdAt" DESC
      LIMIT 50`
    );

    if (rows && rows.length > 0) {
      return rows.map((u) => ({
        id: u.id,
        name: u.name || u.username,
        username: u.username,
        image: u.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        reputation: Number(u.reputation) || 0,
        role: u.reputation && u.reputation > 2000 ? 'Admin / Lead' : 'Geliştirici',
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('[getUsers] Fallback users:', err);
  }

  return [
    {
      id: 'usr_1',
      name: 'Halil TEK',
      username: 'haliltek',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      reputation: 4280,
      role: 'Admin / Lead',
      createdAt: '2026-01-15T10:20:00Z',
    },
  ];
}

// ----------------------------------------------------
// CRAWLER
// ----------------------------------------------------
export function getCrawlerStatus() {
  return getCrawlerState();
}

export function triggerCrawlerRun() {
  return runCrawlerTask();
}
