#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
devcore.tr - Turkish Tech Feeds Ingestion Engine
Crawls top Turkish Engineering Blogs, Medium Publications, and Tech Teams,
generates a bulk SQL transaction, and imports them directly into PostgreSQL.
"""

import sys
import os
import re
import html
import time
import json
import hashlib
import random
import subprocess
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

SOURCES_CONFIG = [
    {
        "id": "trendyol-tech",
        "name": "Trendyol Tech",
        "website": "https://medium.com/trendyol-tech",
        "feed_url": "https://medium.com/feed/trendyol-tech",
        "image": "https://unavatar.io/trendyol.com",
        "description": "Trendyol mühendislerinin büyük ölçekli sistemler, mikroservisler ve yapay zeka üzerine teknik yazıları.",
        "default_tags": ["ecommerce", "microservices", "architecture", "trendyol"]
    },
    {
        "id": "hepsiburada-tech",
        "name": "Hepsiburada Tech",
        "website": "https://medium.com/hepsiburadatech",
        "feed_url": "https://medium.com/feed/hepsiburadatech",
        "image": "https://unavatar.io/hepsiburada.com",
        "description": "E-ticaret altyapısı, ölçeklenebilirlik, veri bilimi ve modern yazılım mimarileri.",
        "default_tags": ["ecommerce", "scalability", "datascience", "hepsiburada"]
    },
    {
        "id": "iyzico-engineering",
        "name": "İyzico Engineering",
        "website": "https://medium.com/iyzico-engineering",
        "feed_url": "https://medium.com/feed/iyzico-engineering",
        "image": "https://unavatar.io/iyzico.com",
        "description": "Fintek dünyası, ödeme sistemleri, güvenlik ve backend mimarileri.",
        "default_tags": ["fintech", "payment", "security", "backend", "iyzico"]
    },
    {
        "id": "getir-tech",
        "name": "Getir Tech",
        "website": "https://medium.com/getir",
        "feed_url": "https://medium.com/feed/getir",
        "image": "https://unavatar.io/getir.com",
        "description": "Gerçek zamanlı veri akışı, mobil teknolojiler ve yüksek trafikli sistemler.",
        "default_tags": ["realtime", "mobile", "distributed-systems", "getir"]
    },
    {
        "id": "sahibinden-tech",
        "name": "Sahibinden Teknoloji",
        "website": "https://medium.com/sahibinden-technology",
        "feed_url": "https://medium.com/feed/sahibinden-technology",
        "image": "https://unavatar.io/x/sahibindencom",
        "description": "Büyük veri, arama motorları, sistem optimizasyonu ve yüksek erişilebilirlik.",
        "default_tags": ["bigdata", "search", "database", "sahibinden"]
    },
    {
        "id": "insider-engineering",
        "name": "Insider Engineering",
        "website": "https://medium.com/insiderengineering",
        "feed_url": "https://medium.com/feed/insiderengineering",
        "image": "https://unavatar.io/useinsider.com",
        "description": "Global SaaS altyapısı, yapay zeka, martech ve veri işleme mimarileri.",
        "default_tags": ["saas", "ai", "martech", "cloud", "insider"]
    },
    {
        "id": "dogus-teknoloji",
        "name": "Doğuş Teknoloji",
        "website": "https://medium.com/dogus-teknoloji",
        "feed_url": "https://medium.com/feed/dogus-teknoloji",
        "image": "https://unavatar.io/x/dteknoloji",
        "description": "Kurumsal yazılım çözümleri, bulut dönüşümü ve veri analitiği.",
        "default_tags": ["cloud", "enterprise", "devops", "dogus"]
    },
    {
        "id": "github-engineering",
        "name": "GitHub Engineering",
        "website": "https://github.blog/engineering",
        "feed_url": "https://github.blog/engineering/feed/",
        "image": "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
        "description": "GitHub mühendislik ekibinin mimari, yapay zeka, Git iç mekanizmaları ve altyapı makaleleri.",
        "default_tags": ["github", "git", "copilot", "devops", "engineering"]
    },
    {
        "id": "yemeksepeti-tech",
        "name": "Yemeksepeti Teknoloji",
        "website": "https://medium.com/yemeksepeti-teknoloji",
        "feed_url": "https://medium.com/feed/yemeksepeti-teknoloji",
        "image": "https://unavatar.io/yemeksepeti.com",
        "description": "Yemeksepeti mühendislik ekibinin teslimat mimarisi, yüksek erişilebilirlik ve mikroservis yazıları.",
        "default_tags": ["microservices", "delivery", "architecture", "yemeksepeti"]
    },
    {
        "id": "ciceksepeti-tech",
        "name": "Çiçeksepeti Tech",
        "website": "https://medium.com/@ciceksepetitech",
        "feed_url": "https://medium.com/feed/@ciceksepetitech",
        "image": "https://unavatar.io/ciceksepeti.com",
        "description": "Çiçeksepeti teknoloji ekibinden e-ticaret altyapısı, test otomasyonu ve mobil deneyimler.",
        "default_tags": ["ecommerce", "testing", "mobile", "ciceksepeti"]
    },
    {
        "id": "turkcell-tech",
        "name": "Turkcell Teknoloji",
        "website": "https://medium.com/turkcell-teknoloji",
        "feed_url": "https://medium.com/feed/turkcell-teknoloji",
        "image": "https://unavatar.io/turkcell.com.tr",
        "description": "Telekomünikasyon altyapıları, büyük veri, yapay zeka ve bulut bilişim çözümleri.",
        "default_tags": ["telecom", "bigdata", "cloud", "turkcell"]
    },
    {
        "id": "devops-turkey",
        "name": "DevOps Türkiye",
        "website": "https://medium.com/devopstr",
        "feed_url": "https://medium.com/feed/devopstr",
        "image": "https://unavatar.io/github/devopstr",
        "description": "Türkiye DevOps topluluğu makaleleri: Kubernetes, CI/CD, Docker ve Cloud Native.",
        "default_tags": ["devops", "kubernetes", "docker", "cloudnative", "turkce"]
    },
    {
        "id": "medium-turkce-yazilim",
        "name": "Medium Türkçe Yazılım",
        "website": "https://medium.com/tag/yazilim",
        "feed_url": "https://medium.com/feed/tag/yazilim",
        "image": "https://unavatar.io/medium.com",
        "description": "Türk yazılımcıların teknik makaleleri, rehberleri ve mimari deneyimleri.",
        "default_tags": ["yazilim", "turkce", "rehber", "kod"]
    },
    {
        "id": "devto-turkce",
        "name": "Dev.to Türkçe",
        "website": "https://dev.to/t/turkish",
        "feed_url": "https://dev.to/feed/tag/turkish",
        "image": "https://unavatar.io/dev.to",
        "description": "Dev.to topluluğundaki yerli geliştiricilerin paylaştığı teknik içerikler.",
        "default_tags": ["devto", "turkce", "webdev", "programlama"]
    },
    {
        "id": "mendebur-lemur",
        "name": "Mendebur Lemur",
        "website": "https://www.youtube.com/@mendeburlemur",
        "feed_url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCnPUB-DTfgIO-p-xOPhV9jw",
        "image": "https://yt3.googleusercontent.com/ytc/AIdro_kiVagQE6lffbuQ42kX9CT4AoYokqf2W054pwpORsTLqKE=s900-c-k-c0x00ffffff-no-rj",
        "description": "Teknoloji incelemeleri, ilginç donanımlar, robotik ve akıllı ev aletleri.",
        "default_tags": ["teknoloji", "donanim", "inceleme", "youtube"],
        "type": "youtube"
    },
    {
        "id": "siyar-aslan",
        "name": "Şiyar Aslan",
        "website": "https://www.youtube.com/@siyaraslan",
        "feed_url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCMtdhT9LI_ZtrRfZl7tWyzA",
        "image": "https://yt3.googleusercontent.com/ytc/AIdro_nqiI69h0_qQtU4jS_9hSQ52CtLcHdVzl4TIkpDMhNh9RujPbBlgp4xk6Zd-lYWvG8wTfs=s900-c-k-c0x00ffffff-no-rj",
        "description": "Yazılım mimarisi, yapay zeka araçları, kariyer ve modern geliştirme pratikleri.",
        "default_tags": ["yazilim", "yapayzeka", "kariyer", "youtube"],
        "type": "youtube"
    },
    {
        "id": "erdi-ozuag",
        "name": "Erdi Özüağ",
        "website": "https://www.youtube.com/@Erdiozuag",
        "feed_url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCVng7gtEhqivb2fO9ZlKghA",
        "image": "https://yt3.googleusercontent.com/p0pAd9evWkMF8_sx7jDzwGMbU43cJPKu0tvDGRScl2x_ugN8Jz0-rqA1cgjUH5-Fw51vPJxa=s900-c-k-c0x00ffffff-no-rj",
        "description": "Yarıiletken endüstrisi, CPU & GPU mimarileri, yapay zeka çipleri ve derin teknoloji.",
        "default_tags": ["donanim", "cpu", "gpu", "teknoloji", "chip", "youtube"],
        "type": "youtube"
    },
    {
        "id": "shiftdelete-net-yt",
        "name": "ShiftDelete.Net",
        "website": "https://www.youtube.com/@ShiftDeleteNet",
        "feed_url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCzNu79N8Lq1wUY52MkhWKSA",
        "image": "https://yt3.googleusercontent.com/ytc/AIdro_kmFA149gbErGWs3flz7eXWwN2l5P0V8mRNIkyMGONAWEE4=s900-c-k-c0x00ffffff-no-rj",
        "description": "Güncel teknoloji haberleri, akıllı telefonlar, elektrikli araçlar ve ürün incelemeleri.",
        "default_tags": ["teknoloji", "haber", "mobil", "otomotiv", "youtube"],
        "type": "youtube"
    },
    {
        "id": "baris-ozcan",
        "name": "Barış Özcan",
        "website": "https://www.youtube.com/@barisozcan",
        "feed_url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCv6jcPwFujuTIwFQ11jt1Yw",
        "image": "https://yt3.googleusercontent.com/ytc/AIdro_mdtLLPQnErbtjn6tO4tKFLvOEE-jYjYRbhNvzrcFJZh8xd=s900-c-k-c0x00ffffff-no-rj",
        "description": "Sanat, tasarım, teknoloji ve gelecek vizyonu üzerine derin araştırmalar ve hikayeler.",
        "default_tags": ["teknoloji", "bilim", "yapayzeka", "tasarim", "youtube"],
        "type": "youtube"
    }
]

FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80"
]

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = html.unescape(clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def extract_first_image(raw_html):
    if not raw_html:
        return None
    m = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', raw_html, re.IGNORECASE)
    if m:
        url = m.group(1)
        if not re.search(r'stat\?|pixel|tracking|beacon', url, re.IGNORECASE):
            return url
    return None

def slugify(text):
    text = text.lower()
    replacements = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
    }
    for tr, en in replacements.items():
        text = text.replace(tr, en)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')[:80]

def quote(val):
    if val is None:
        return "NULL"
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def fetch_feed_items(feed_url):
    req = urllib.request.Request(
        feed_url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            content = response.read()
    except Exception as e:
        print(f"  [FETCH FAILED] {feed_url}: {e}")
        return []

    try:
        root = ET.fromstring(content)
    except Exception as e:
        print(f"  [XML PARSE ERROR] {feed_url}: {e}")
        return []

    items = []
    namespaces = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'dc': 'http://purl.org/dc/elements/1.1/'
    }

    channel = root.find('channel')
    if channel is None:
        channel = root

    for item_elem in channel.findall('item'):
        title = item_elem.findtext('title') or ""
        link = item_elem.findtext('link') or ""
        pubDate = item_elem.findtext('pubDate') or ""
        
        content_elem = item_elem.find('content:encoded', namespaces)
        raw_content = content_elem.text if content_elem is not None else (item_elem.findtext('description') or "")
        
        tags = []
        for cat in item_elem.findall('category'):
            if cat.text:
                tags.append(slugify(cat.text))

        creator_elem = item_elem.find('dc:creator', namespaces)
        author = creator_elem.text if creator_elem is not None else (item_elem.findtext('author') or "")

        img = extract_first_image(raw_content)
        summary = clean_html(raw_content)[:280]

        items.append({
            "title": clean_html(title),
            "link": link.strip(),
            "pubDate": pubDate,
            "raw_content": raw_content,
            "summary": summary,
            "image": img,
            "tags": tags,
            "author": author.strip()
        })

    return items

def fetch_youtube_feed_items(feed_url):
    req = urllib.request.Request(
        feed_url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/atom+xml, application/xml, text/xml, */*"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            content = response.read()
    except Exception as e:
        print(f"  [FETCH FAILED] {feed_url}: {e}")
        return []

    try:
        root = ET.fromstring(content)
    except Exception as e:
        print(f"  [XML PARSE ERROR] {feed_url}: {e}")
        return []

    ns = {
        'atom': 'http://www.w3.org/2005/Atom',
        'yt': 'http://www.youtube.com/xml/schemas/2015',
        'media': 'http://search.yahoo.com/mrss/'
    }

    items = []
    for entry in root.findall('atom:entry', ns):
        video_id = entry.findtext('yt:videoId', namespaces=ns)
        if not video_id:
            continue
        title = entry.findtext('atom:title', namespaces=ns) or ""
        link_elem = entry.find('atom:link', namespaces=ns)
        link = link_elem.attrib.get('href') if link_elem is not None else f"https://www.youtube.com/watch?v={video_id}"
        pub_date = entry.findtext('atom:published', namespaces=ns) or ""
        
        media_grp = entry.find('media:group', ns)
        description = ""
        thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        if media_grp is not None:
            description = media_grp.findtext('media:description', namespaces=ns) or ""
            thumb_elem = media_grp.find('media:thumbnail', ns)
            if thumb_elem is not None and thumb_elem.attrib.get('url'):
                thumbnail = thumb_elem.attrib.get('url')

        summary = clean_html(description)[:280] if description else title

        items.append({
            "title": clean_html(title),
            "link": link.strip(),
            "pubDate": pub_date,
            "raw_content": description,
            "summary": summary,
            "image": thumbnail,
            "tags": ["youtube", "video"],
            "author": "",
            "type": "video:youtube",
            "video_id": video_id,
            "read_time": random.randint(8, 25)
        })

    return items

def main():
    print("==================================================")
    print("  devcore.tr - Turkish Tech Feeds Ingestion Engine")
    print("==================================================")

    sql_statements = ["BEGIN;"]
    total_posts = 0

    for src in SOURCES_CONFIG:
        print(f"\n[Source] {src['name']} ({src['feed_url']})...")
        
        # 1. Upsert Source in PostgreSQL
        src_sql = f"""
        INSERT INTO source (
            id, handle, name, website, image, description, type, active, "createdAt"
        ) VALUES (
            {quote(src['id'])},
            {quote(src['id'])},
            {quote(src['name'])},
            {quote(src['website'])},
            {quote(src['image'])},
            {quote(src['description'])},
            'machine',
            true,
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            handle = EXCLUDED.handle,
            name = EXCLUDED.name,
            image = EXCLUDED.image,
            description = EXCLUDED.description,
            active = true;
        """
        sql_statements.append(src_sql)

        # 2. Fetch items
        if src.get('type') == 'youtube':
            items = fetch_youtube_feed_items(src['feed_url'])
        else:
            items = fetch_feed_items(src['feed_url'])
        print(f"  Bulunan içerik sayısı: {len(items)}")

        for item in items[:15]:
            if not item['title'] or not item['link']:
                continue

            url_hash = hashlib.sha1(item['link'].encode('utf-8')).hexdigest()[:12]
            post_id = f"tr_{url_hash}"
            short_id = url_hash[:8]

            cover_img = item['image'] or random.choice(FALLBACK_IMAGES)
            all_tags = list(set(src['default_tags'] + item['tags']))
            tags_str = ",".join(all_tags[:6])

            upvotes = random.randint(45, 260)
            comments = random.randint(4, 48)
            views = upvotes * random.randint(14, 38)
            score = 65000000 + random.randint(10000, 999999)
            
            is_video = item.get('type') == 'video:youtube'
            post_type = 'video:youtube' if is_video else 'article'
            video_id_sql = quote(item['video_id']) if is_video and item.get('video_id') else "NULL"
            read_time = item.get('read_time', 12) if is_video else max(2, len(item['summary'].split()) // 30 or 5)

            author_name = item.get('author', '').strip()
            author_id_sql = "NULL"
            if author_name:
                author_slug = slugify(author_name)
                author_id = f"usr_{author_slug[:30]}"
                author_avatar = f"https://ui-avatars.com/api/?name={urllib.parse.quote(author_name)}&background=22272e&color=adbac7&size=128&bold=true"
                author_user_sql = f"""
                INSERT INTO "user" (
                    id, name, username, image, reputation, "createdAt"
                ) VALUES (
                    {quote(author_id)},
                    {quote(author_name)},
                    {quote(author_slug[:36])},
                    {quote(author_avatar)},
                    50,
                    now()
                )
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    image = EXCLUDED.image;
                """
                sql_statements.append(author_user_sql)
                author_id_sql = quote(author_id)

            # Insert Post (slug is generated by Postgres, so omit slug!)
            post_sql = f"""
            INSERT INTO post (
                id, "shortId", title, summary, description,
                url, "canonicalUrl", "sourceId", image, "publishedAt",
                "createdAt", "readTime", "tagsStr", type, "videoId", "authorId", upvotes,
                comments, views, score, trending, visible, deleted,
                banned, "showOnFeed", flags, language, "statsUpdatedAt",
                "contentCuration"
            ) VALUES (
                {quote(post_id)},
                {quote(short_id)},
                {quote(item['title'])},
                {quote(item['summary'])},
                {quote(item['summary'])},
                {quote(item['link'])},
                {quote(item['link'])},
                {quote(src['id'])},
                {quote(cover_img)},
                now() - INTERVAL '{random.randint(1, 24)} hours',
                now(),
                {read_time},
                {quote(tags_str)},
                {quote(post_type)},
                {video_id_sql},
                {author_id_sql},
                {upvotes},
                {comments},
                {views},
                {score},
                100,
                true,
                false,
                false,
                true,
                '{{"visible": true, "showOnFeed": true, "sentAnalyticsReport": true}}'::jsonb,
                'tr',
                now(),
                ARRAY['story']::text[]
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                summary = EXCLUDED.summary,
                image = EXCLUDED.image,
                score = EXCLUDED.score,
                "tagsStr" = EXCLUDED."tagsStr",
                type = EXCLUDED.type,
                "videoId" = EXCLUDED."videoId",
                "authorId" = EXCLUDED."authorId",
                upvotes = EXCLUDED.upvotes,
                comments = EXCLUDED.comments,
                views = EXCLUDED.views,
                "contentCuration" = ARRAY['story']::text[],
                "statsUpdatedAt" = now();
            """
            sql_statements.append(post_sql)
            total_posts += 1

            for tag in all_tags[:4]:
                kw_sql = f"""
                INSERT INTO keyword (value, "createdAt", "updatedAt", status)
                VALUES ({quote(tag)}, now(), now(), 'allow')
                ON CONFLICT (value) DO NOTHING;

                INSERT INTO post_keyword ("postId", keyword, status)
                VALUES ({quote(post_id)}, {quote(tag)}, 'allow')
                ON CONFLICT DO NOTHING;
                """
                sql_statements.append(kw_sql)

    sql_statements.append("COMMIT;")

    # Write SQL to file
    sql_file_path = "/root/turkish_posts.sql" if os.name != "nt" else "turkish_posts.sql"
    with open(sql_file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements))

    print(f"\n[SQL OLUŞTURULDU] {total_posts} makale için SQL scripti hazırlandı: {sql_file_path}")

    # Execute SQL in Postgres
    if os.name != "nt":
        print("[YÜKLENİYOR] PostgreSQL veritabanına aktarılıyor...")
        cmd = f"docker exec -i devcore-postgres psql -U postgres -d api < {sql_file_path}"
        res = os.system(cmd)
        if res == 0:
            print(f"[BAŞARILI] {total_posts} Türkçe makale ve kaynaklar devcore.tr veritabanına aktarıldı!")
        else:
            print(f"[HATA] SQL çalıştırma başarısız oldu (kod: {res})")

if __name__ == "__main__":
    main()
