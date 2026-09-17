import { dbQuery } from './db';
import crypto from 'crypto';

export interface CrawlerSource {
  id: string;
  name: string;
  feedUrl: string;
  website: string;
  image: string;
  defaultTags: string[];
}

export const TURKISH_FEEDS: CrawlerSource[] = [
  {
    id: 'trendyol-tech',
    name: 'Trendyol Tech',
    feedUrl: 'https://medium.com/feed/trendyol-tech',
    website: 'https://medium.com/trendyol-tech',
    image: 'https://unavatar.io/trendyol.com',
    defaultTags: ['microservices', 'architecture', 'ecommerce', 'trendyol'],
  },
  {
    id: 'hepsiburada-tech',
    name: 'Hepsiburada Tech',
    feedUrl: 'https://medium.com/feed/hepsiburadatech',
    website: 'https://medium.com/hepsiburadatech',
    image: 'https://unavatar.io/hepsiburada.com',
    defaultTags: ['scalability', 'datascience', 'backend', 'hepsiburada'],
  },
  {
    id: 'iyzico-engineering',
    name: 'İyzico Engineering',
    feedUrl: 'https://medium.com/feed/iyzico-engineering',
    website: 'https://medium.com/iyzico-engineering',
    image: 'https://unavatar.io/iyzico.com',
    defaultTags: ['fintech', 'payment', 'security', 'iyzico'],
  },
  {
    id: 'getir-tech',
    name: 'Getir Tech',
    feedUrl: 'https://medium.com/feed/getir',
    website: 'https://medium.com/getir',
    image: 'https://unavatar.io/getir.com',
    defaultTags: ['realtime', 'mobile', 'devops', 'getir'],
  },
  {
    id: 'sahibinden-tech',
    name: 'Sahibinden Teknoloji',
    feedUrl: 'https://medium.com/feed/sahibinden-technology',
    website: 'https://medium.com/sahibinden-technology',
    image: 'https://unavatar.io/x/sahibindencom',
    defaultTags: ['bigdata', 'search', 'database', 'sahibinden'],
  },
  {
    id: 'insider-engineering',
    name: 'Insider Engineering',
    feedUrl: 'https://medium.com/feed/insiderengineering',
    website: 'https://medium.com/insiderengineering',
    image: 'https://unavatar.io/useinsider.com',
    defaultTags: ['saas', 'ai', 'martech', 'cloud', 'insider'],
  },
  {
    id: 'dogus-teknoloji',
    name: 'Doğuş Teknoloji',
    feedUrl: 'https://medium.com/feed/dogus-teknoloji',
    website: 'https://medium.com/dogus-teknoloji',
    image: 'https://unavatar.io/x/dteknoloji',
    defaultTags: ['cloud', 'enterprise', 'devops', 'dogus'],
  },
  {
    id: 'yemeksepeti-tech',
    name: 'Yemeksepeti Teknoloji',
    feedUrl: 'https://medium.com/feed/yemeksepeti-teknoloji',
    website: 'https://medium.com/yemeksepeti-teknoloji',
    image: 'https://unavatar.io/yemeksepeti.com',
    defaultTags: ['delivery', 'algorithms', 'frontend', 'yemeksepeti'],
  },
  {
    id: 'github-engineering',
    name: 'GitHub Engineering',
    feedUrl: 'https://github.blog/engineering/feed/',
    website: 'https://github.blog/engineering',
    image: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
    defaultTags: ['github', 'git', 'copilot', 'devops', 'engineering'],
  },
];

export interface CrawlerState {
  status: 'idle' | 'running' | 'done' | 'error';
  message: string;
  last_run: string;
  output: string;
  total_added: number;
}

let crawlerState: CrawlerState = {
  status: 'idle',
  message: 'Hazır - Beklemede',
  last_run: 'Henüz çalıştırılmadı',
  output: 'Son tarama bekleniyor. "Taramayı Başlat" butonuna tıklayarak Türk mühendislik kaynaklarını güncelleyebilirsiniz.',
  total_added: 0,
};

export function getCrawlerState(): CrawlerState {
  return crawlerState;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(content: string): string {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800';
}

export async function runCrawlerTask(): Promise<CrawlerState> {
  if (crawlerState.status === 'running') {
    return crawlerState;
  }

  crawlerState = {
    status: 'running',
    message: 'Türk Teknoloji Kaynakları taranıyor...',
    last_run: new Date().toLocaleTimeString('tr-TR'),
    output: `[BAŞLATILDI] ${TURKISH_FEEDS.length} kaynak için RSS taraması başlatıldı...\n`,
    total_added: 0,
  };

  // Run asynchronously
  (async () => {
    let logs: string[] = [];
    let addedCount = 0;

    for (const source of TURKISH_FEEDS) {
      try {
        logs.push(`[KAYNAK] ${source.name} taranıyor (${source.feedUrl})...`);

        // Ensure source exists in DB
        try {
          await dbQuery(
            `INSERT INTO source (id, name, website, image, active, handle, "createdAt", type)
             VALUES ($1, $2, $3, $4, true, $5, NOW(), 'blog')
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, active = true`,
            [source.id, source.name, source.website, source.image, source.id]
          );
        } catch (dbErr) {
          console.error(`Source upsert failed for ${source.id}:`, dbErr);
        }

        const res = await fetch(source.feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DevcoreCrawler/1.0; +https://devcore.tr)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          logs.push(`  [UYARI] HTTP ${res.status}: ${source.name} yanıt vermedi.`);
          continue;
        }

        const xmlText = await res.text();
        const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

        let sourceAdded = 0;

        for (const itemXml of itemMatches.slice(0, 10)) {
          const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/i);
          const title = cleanHtml(titleMatch ? titleMatch[1] || titleMatch[2] || '' : '');

          const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/link>/i);
          let link = (linkMatch ? linkMatch[1] || linkMatch[2] || '' : '').trim();
          if (link.includes('?')) {
            link = link.split('?')[0];
          }

          if (!title || !link) continue;

          // Check if post already exists
          const existing = await dbQuery<{ id: string }>(
            'SELECT id FROM post WHERE url = $1 LIMIT 1',
            [link]
          );

          if (existing && existing.length > 0) {
            continue;
          }

          const descMatch = itemXml.match(/<(?:description|content:encoded)>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/(?:description|content:encoded)>/i);
          const rawDesc = descMatch ? descMatch[1] || descMatch[2] || '' : '';
          const summary = cleanHtml(rawDesc).slice(0, 280);
          const image = extractImage(rawDesc);

          const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
          const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

          // Collect tags
          const tagMatches = itemXml.match(/<category>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/category>/gi) || [];
          const categories = tagMatches
            .map((t) => {
              const m = t.match(/<category>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/category>/i);
              return m ? cleanHtml(m[1] || m[2] || '') : '';
            })
            .filter(Boolean)
            .map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''))
            .filter((c) => c.length > 2);

          const allTags = Array.from(new Set([...source.defaultTags, ...categories])).slice(0, 5);
          const tagsStr = allTags.join(', ');

          const idHash = crypto.createHash('md5').update(link).digest('hex');
          const postId = `tr_${idHash.slice(0, 16)}`;
          const shortId = idHash.slice(0, 14);

          await dbQuery(
            `INSERT INTO post (
              id, "shortId", title, summary, url, "canonicalUrl", image, "tagsStr",
              "sourceId", "publishedAt", "createdAt", score, views, upvotes, comments,
              deleted, visible, type, "showOnFeed"
            ) VALUES (
              $1, $2, $3, $4, $5, $5, $6, $7,
              $8, $9, NOW(), 120, 1, 0, 0,
              false, true, 'article', true
            ) ON CONFLICT (id) DO NOTHING`,
            [postId, shortId, title, summary, link, image, tagsStr, source.id, publishedAt]
          );

          // Add keywords
          for (const tag of allTags.slice(0, 3)) {
            try {
              await dbQuery(
                `INSERT INTO keyword (value, "createdAt", "updatedAt", status)
                 VALUES ($1, NOW(), NOW(), 'allow')
                 ON CONFLICT (value) DO NOTHING`,
                [tag]
              );
              await dbQuery(
                `INSERT INTO post_keyword ("postId", keyword, status)
                 VALUES ($1, $2, 'allow')
                 ON CONFLICT DO NOTHING`,
                [postId, tag]
              );
            } catch {}
          }

          sourceAdded++;
          addedCount++;
        }

        logs.push(`  -> ${source.name}: ${sourceAdded} yeni içerik veritabanına kaydedildi.`);
      } catch (err: any) {
        logs.push(`  [HATA] ${source.name} taranırken hata: ${err?.message || err}`);
      }
    }

    logs.push(`\n[TAMAMLANDI] Toplam ${addedCount} yeni makale veritabanına başarıyla aktarıldı!`);

    crawlerState = {
      status: 'done',
      message: `Tarama başarıyla tamamlandı! ${addedCount} yeni içerik eklendi.`,
      last_run: new Date().toLocaleTimeString('tr-TR'),
      output: logs.join('\n'),
      total_added: addedCount,
    };
  })().catch((err) => {
    crawlerState = {
      status: 'error',
      message: 'Tarama sırasında beklenmeyen hata oluştu.',
      last_run: new Date().toLocaleTimeString('tr-TR'),
      output: `Kritik Hata: ${err?.message || err}`,
      total_added: 0,
    };
  });

  return crawlerState;
}
