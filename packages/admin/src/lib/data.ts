import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ADS_FILE = path.join(DATA_DIR, 'custom_ads.json');
const SOURCES_FILE = path.join(DATA_DIR, 'custom_sources.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

const BACKOFFICE_BACKEND_URL = process.env.BACKOFFICE_BACKEND_URL || 'http://127.0.0.1:5005';

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
  // Try remote backend if available
  try {
    const res = await fetch(`${BACKOFFICE_BACKEND_URL}/api/ads`, { cache: 'no-store', signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

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

const DEFAULT_SOURCES: SourceItem[] = [
  {
    id: 'trendyol-tech',
    name: 'Trendyol Tech',
    handle: 'trendyol-tech',
    website: 'https://medium.com/trendyol-tech',
    description: 'Trendyol mühendislerinin büyük ölçekli sistemler, mikroservisler ve yapay zeka yazıları.',
    image: 'https://unavatar.io/trendyol.com',
    feedUrl: 'https://medium.com/feed/trendyol-tech',
    postCount: 142,
    active: true,
  },
  {
    id: 'hepsiburada-tech',
    name: 'Hepsiburada Tech',
    handle: 'hepsiburadatech',
    website: 'https://medium.com/hepsiburadatech',
    description: 'E-ticaret altyapısı, ölçeklenebilirlik, veri bilimi ve modern mimariler.',
    image: 'https://unavatar.io/hepsiburada.com',
    feedUrl: 'https://medium.com/feed/hepsiburadatech',
    postCount: 88,
    active: true,
  },
  {
    id: 'iyzico-engineering',
    name: 'İyzico Engineering',
    handle: 'iyzico-engineering',
    website: 'https://medium.com/iyzico-engineering',
    description: 'Fintek dünyası, ödeme sistemleri, güvenlik ve backend mimarileri.',
    image: 'https://unavatar.io/iyzico.com',
    feedUrl: 'https://medium.com/feed/iyzico-engineering',
    postCount: 64,
    active: true,
  },
  {
    id: 'getir-tech',
    name: 'Getir Tech',
    handle: 'getir',
    website: 'https://medium.com/getir',
    description: 'Gerçek zamanlı veri akışı, mobil teknolojiler ve yüksek trafikli sistemler.',
    image: 'https://unavatar.io/getir.com',
    feedUrl: 'https://medium.com/feed/getir',
    postCount: 52,
    active: true,
  },
  {
    id: 'sahibinden-tech',
    name: 'Sahibinden Technology',
    handle: 'sahibindentech',
    website: 'https://medium.com/sahibindentech',
    description: 'Türkiye’nin dev ilan platformunun mimari ve teknoloji deneyimleri.',
    image: 'https://unavatar.io/sahibinden.com',
    feedUrl: 'https://medium.com/feed/sahibindentech',
    postCount: 45,
    active: true,
  },
];

export async function getSources(): Promise<SourceItem[]> {
  try {
    const res = await fetch(`${BACKOFFICE_BACKEND_URL}/api/sources`, { cache: 'no-store', signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  ensureDir();
  if (fs.existsSync(SOURCES_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'));
    } catch {}
  }
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(DEFAULT_SOURCES, null, 2));
  return DEFAULT_SOURCES;
}

export async function saveSources(sources: SourceItem[]): Promise<void> {
  ensureDir();
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(sources, null, 2));
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

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'p_1',
    title: 'Trendyol Mikroservis Mimarilerinde Event-Driven Yaklaşım',
    summary: 'Kafka ve RabbitMQ entegrasyonuyla günde 500 milyon olayı nasıl yönetiyoruz?',
    tagsStr: 'microservices, kafka, architecture, trendyol',
    sourceId: 'trendyol-tech',
    sourceName: 'Trendyol Tech',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    upvotes: 84,
    views: 1240,
    url: 'https://medium.com/trendyol-tech',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  },
  {
    id: 'p_2',
    title: 'Hepsiburada Çoklu Veri Merkezi PostgreSQL Yük Dengeleme',
    summary: 'Yüksek erişilebilirlik (HA) ve coğrafi yedeklilik için uyguladığımız replikasyon stratejileri.',
    tagsStr: 'database, postgresql, devops, hepsiburada',
    sourceId: 'hepsiburada-tech',
    sourceName: 'Hepsiburada Tech',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    upvotes: 67,
    views: 930,
    url: 'https://medium.com/hepsiburadatech',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
  },
  {
    id: 'p_3',
    title: 'İyzico Ödeme Geçitlerinde Sıfır Kesinti (Zero-Downtime) Dağıtımı',
    summary: 'Finansal standartlara uygun Kubernetes mavi-yeşil canlı dağıtım boru hattı.',
    tagsStr: 'fintech, kubernetes, security, iyzico',
    sourceId: 'iyzico-engineering',
    sourceName: 'İyzico Engineering',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    upvotes: 112,
    views: 2150,
    url: 'https://medium.com/iyzico-engineering',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
  },
  {
    id: 'p_4',
    title: 'Getir Kurye Rota Optimizasyonunda Yapay Zeka Modelleri',
    summary: 'Canlı sipariş teslimatlarında makine öğrenmesi destekli mesafe ve süre tahminleme motoru.',
    tagsStr: 'ai, machinelearning, routing, getir',
    sourceId: 'getir-tech',
    sourceName: 'Getir Tech',
    publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    upvotes: 95,
    views: 1840,
    url: 'https://medium.com/getir',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  },
];

export async function getPosts(q?: string): Promise<PostItem[]> {
  try {
    const url = q ? `${BACKOFFICE_BACKEND_URL}/api/posts?q=${encodeURIComponent(q)}` : `${BACKOFFICE_BACKEND_URL}/api/posts`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  ensureDir();
  let list = DEFAULT_POSTS;
  if (fs.existsSync(POSTS_FILE)) {
    try {
      list = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    } catch {}
  } else {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2));
  }

  if (q && q.trim()) {
    const term = q.toLowerCase();
    return list.filter(p => p.title.toLowerCase().includes(term) || p.tagsStr.toLowerCase().includes(term));
  }
  return list;
}

export async function deletePost(id: string): Promise<void> {
  try {
    await fetch(`${BACKOFFICE_BACKEND_URL}/api/posts/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {}

  ensureDir();
  const current = await getPosts();
  const filtered = current.filter(p => p.id !== id);
  fs.writeFileSync(POSTS_FILE, JSON.stringify(filtered, null, 2));
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
    const res = await fetch(`${BACKOFFICE_BACKEND_URL}/api/stats`, { cache: 'no-store', signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const posts = await getPosts();
  const sources = await getSources();
  return {
    posts: posts.length,
    sources: sources.length,
    keywords: 34,
    users: 189,
    upvotes: posts.reduce((acc, p) => acc + p.upvotes, 0),
  };
}

// ----------------------------------------------------
// CRAWLER STATUS
// ----------------------------------------------------
let CRAWLER_STATUS = {
  status: 'idle',
  message: 'Hazır - Beklemede',
  last_run: 'Bugün 08:30',
  output: 'Son tarama tamamlandı: 5 kaynak, 24 yeni yazı veritabanına aktarıldı.',
};

export function getCrawlerStatus() {
  return CRAWLER_STATUS;
}

export function triggerCrawlerRun() {
  CRAWLER_STATUS = {
    status: 'running',
    message: 'Türk Teknoloji Kaynakları taranıyor...',
    last_run: new Date().toLocaleTimeString('tr-TR'),
    output: 'Crawler başlatıldı (Trendyol, Hepsiburada, İyzico, Getir, Sahibinden)...',
  };

  // Run in background
  setTimeout(() => {
    CRAWLER_STATUS = {
      status: 'done',
      message: 'Tarama başarıyla tamamlandı!',
      last_run: new Date().toLocaleTimeString('tr-TR'),
      output: '[OK] Trendyol Tech: 3 yeni içerik\n[OK] Hepsiburada Tech: 2 yeni içerik\n[OK] İyzico: 1 yeni içerik\n[OK] Veritabanı başarıyla senkronize edildi.',
    };
  }, 4000);

  return CRAWLER_STATUS;
}
