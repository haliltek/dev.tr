#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
devcore.tr - Comprehensive Community Ingestion Script:
1. Hamdi Kellecioğlu (@hkellecioglu) - X akışı
2. Mesut Çevik (mesutcevik.com + YouTube @MesutCevik)
3. Kantan.News (kantan.news) - Güncel teknoloji haberleri
4. Ozan Öğretmenoğlu (@oznogretmenoglu / 3 Şerit) - #otomobil
5. NuvemMag (nuvemmag.com) - Güncel teknoloji ve inovasyon haberleri
6. Çiçek ile Teknoloji (@cicekileteknoloji) - Yapay zeka ve teknoloji videoları
"""

import os
import sys
import re
import html
import json
import random
import hashlib
import urllib.request
import urllib.parse
from datetime import datetime, timedelta, timezone
import xml.etree.ElementTree as ET

FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80"
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
    text = str(text).lower()
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

def parse_relative_time_to_sql(rel_text):
    now = datetime.now(timezone.utc)
    if not rel_text:
        return f"'{now.strftime('%Y-%m-%d %H:%M:%S+00:00')}'::timestamptz"
    
    m = re.search(r'(\d+)\s*(dakika|saat|gün|hafta|ay|yıl|sa\.)', str(rel_text).lower())
    if not m:
        return f"'{now.strftime('%Y-%m-%d %H:%M:%S+00:00')}'::timestamptz"
    
    val = int(m.group(1))
    unit = m.group(2)
    dt = now
    if 'dakika' in unit:
        dt = now - timedelta(minutes=val)
    elif 'saat' in unit or 'sa.' in unit:
        dt = now - timedelta(hours=val)
    elif 'gün' in unit:
        dt = now - timedelta(days=val)
    elif 'hafta' in unit:
        dt = now - timedelta(weeks=val)
    elif 'ay' in unit:
        dt = now - timedelta(days=val * 30)
    elif 'yıl' in unit:
        dt = now - timedelta(days=val * 365)
    return f"'{dt.strftime('%Y-%m-%d %H:%M:%S+00:00')}'::timestamptz"

def parse_date_to_sql(date_str):
    if not date_str:
        return "now()"
    if any(unit in str(date_str) for unit in ['önce', 'gün', 'ay', 'hafta', 'saat', 'sa.']):
        return parse_relative_time_to_sql(date_str)
    if "T" in str(date_str):
        clean_date = str(date_str).replace("Z", "+00:00")
        return f"'{clean_date}'::timestamptz"
    try:
        dt = datetime.strptime(str(date_str)[:25], "%a, %d %b %Y %H:%M:%S")
        return f"'{dt.strftime('%Y-%m-%d %H:%M:%S')}'::timestamptz"
    except Exception:
        pass
    try:
        dt = datetime.strptime(str(date_str), "%a %b %d %H:%M:%S %z %Y")
        return f"'{dt.strftime('%Y-%m-%d %H:%M:%S%z')}'::timestamptz"
    except Exception:
        pass
    return "now()"

def parse_duration_to_minutes(dur_str):
    if not dur_str:
        return 15
    parts = str(dur_str).strip().split(":")
    if len(parts) == 2:
        try:
            return max(3, int(parts[0]))
        except:
            return 15
    elif len(parts) == 3:
        try:
            return max(3, int(parts[0]) * 60 + int(parts[1]))
        except:
            return 30
    return 15

# -------------------------------------------------------------
# 1. Mesut Çevik (Web + YouTube)
# -------------------------------------------------------------
def fetch_mesutcevik():
    print("[1/6] Mesut Çevik (Web RSS + YouTube) çekiliyor...")
    items = []
    
    # 1. Web RSS
    try:
        url = "https://www.mesutcevik.com/feed/"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "application/rss+xml, application/xml, text/xml, */*"
            }
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            content = resp.read()
        root = ET.fromstring(content)
        channel = root.find("channel")
        if channel is None: channel = root
        for item_elem in channel.findall("item"):
            title = item_elem.findtext("title") or ""
            link = item_elem.findtext("link") or ""
            pub_date = item_elem.findtext("pubDate") or ""
            desc = item_elem.findtext("description") or ""
            content_encoded = None
            for child in item_elem:
                if child.tag.endswith("encoded"):
                    content_encoded = child.text
                    break
            raw_content = content_encoded or desc
            img = extract_first_image(raw_content)
            tags = [slugify(cat.text) for cat in item_elem.findall("category") if cat.text]

            items.append({
                "title": clean_html(title),
                "link": link.strip(),
                "pubDate": pub_date,
                "summary": clean_html(desc or raw_content)[:280],
                "image": img,
                "tags": tags or ["teknoloji", "donanim", "mobil"],
                "author": "Mesut Çevik",
                "type": "article",
                "videoId": None
            })
        print(f"  Mesut Çevik Blog: {len(items)} makale alındı.")
    except Exception as e:
        print(f"  Mesut Çevik Blog hata: {e}")

    # 2. YouTube Channel @MesutCevik
    yt_videos = []
    try:
        yt_url = "https://www.youtube.com/@MesutCevik/videos"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8"
        }
        req = urllib.request.Request(yt_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')

        m = re.search(r'var ytInitialData = (\{.*?\});</script>', html_text)
        if not m:
            m = re.search(r'window\["ytInitialData"\] = (\{.*?\});</script>', html_text)

        if m:
            data = json.loads(m.group(1))
            def search_lockups(obj):
                if isinstance(obj, dict):
                    if 'lockupViewModel' in obj:
                        lvm = obj['lockupViewModel']
                        vid_id = lvm.get('contentId')
                        meta = lvm.get('metadata', {}).get('lockupMetadataViewModel', {})
                        title = meta.get('title', {}).get('content', '')
                        rows = meta.get('metadata', {}).get('contentMetadataViewModel', {}).get('metadataRows', [])
                        date_text = ''
                        for r in rows:
                            for p in r.get('metadataParts', []):
                                t = p.get('text', {}).get('content', '')
                                if 'önce' in t: date_text = t
                        sources = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('image', {}).get('sources', [])
                        thumb = sources[-1].get('url', '') if sources else f"https://i.ytimg.com/vi/{vid_id}/maxresdefault.jpg"
                        duration = '15:00'
                        overlays = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('overlays', [])
                        for ov in overlays:
                            badges = ov.get('thumbnailBottomOverlayViewModel', {}).get('badges', [])
                            for b in badges:
                                dur = b.get('thumbnailBadgeViewModel', {}).get('text', '')
                                if dur: duration = dur; break
                            if duration != '15:00': break

                        if vid_id and title:
                            yt_videos.append({
                                'videoId': vid_id,
                                'title': title,
                                'date_text': date_text,
                                'duration': duration,
                                'thumbnail': thumb
                            })
                    else:
                        for v in obj.values(): search_lockups(v)
                elif isinstance(obj, list):
                    for item in obj: search_lockups(item)
            search_lockups(data)
            print(f"  Mesut Çevik Canlı YouTube: {len(yt_videos)} video çekildi.")
    except Exception as e:
        print(f"  Mesut Çevik YouTube canlı çekim hatası ({e}), yedek kontrol ediliyor...")

    if not yt_videos:
        for p in ["/root/mesut_yt_videos.json", os.path.join(os.path.dirname(__file__), "mesut_yt_videos.json")]:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    yt_videos = json.load(f)
                print(f"  Mesut Çevik YouTube yedek dosyasından {len(yt_videos)} video yüklendi.")
                break

    for v in yt_videos:
        vid_id = v['videoId']
        title = v['title']
        link = f"https://www.youtube.com/watch?v={vid_id}"
        dur_mins = parse_duration_to_minutes(v.get('duration', '15:00'))
        summary = f"{title}. Mesut Çevik YouTube kanalından güncel teknoloji değerlendirmesi ({v.get('duration', '')})."
        tags = ["teknoloji", "donanim", "youtube", "inceleme", "turkce"]
        if "otomobil" in title.lower() or "togg" in title.lower():
            tags.append("otomobil")

        items.append({
            "title": title,
            "link": link,
            "pubDate": v.get('date_text', ''),
            "summary": summary,
            "image": v['thumbnail'] or f"https://i.ytimg.com/vi/{vid_id}/maxresdefault.jpg",
            "tags": tags,
            "author": "Mesut Çevik",
            "type": "video:youtube",
            "videoId": vid_id,
            "readTime": dur_mins
        })

    print(f"  Mesut Çevik Toplam: {len(items)} içerik hazırlandı.")
    return items

# -------------------------------------------------------------
# 2. Kantan.News
# -------------------------------------------------------------
def fetch_kantan_news():
    print("[2/6] Kantan.News API çekiliyor...")
    url = "https://kantan.news/api/news?limit=25"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    items = []
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        for article in data.get("data", []):
            title = article.get("title") or ""
            slug = article.get("slug") or ""
            link = f"https://kantan.news/haber/{slug}" if slug else ""
            summary = article.get("social_summary") or article.get("excerpt") or ""
            img = article.get("image_url")
            if img and not img.startswith("http"):
                img = "https://kantan.news" + ("/" if not img.startswith("/") else "") + img
            tags = []
            if article.get("category"): tags.append(slugify(article.get("category")))
            for t in (article.get("tags") or "").split(","):
                if t.strip(): tags.append(slugify(t.strip()))

            items.append({
                "title": clean_html(title),
                "link": link,
                "pubDate": article.get("published_at") or article.get("created_at"),
                "summary": clean_html(summary)[:280],
                "image": img,
                "tags": tags[:6] or ["teknoloji", "yapayzeka", "haber"],
                "author": article.get("author_name") or "Kantan.News",
                "type": "article",
                "videoId": None
            })
    except Exception as e:
        print(f"  Kantan.News hata: {e}")
    print(f"  Kantan.News: {len(items)} haber alındı.")
    return items

# -------------------------------------------------------------
# 3. Hamdi Kellecioğlu (X / Twitter)
# -------------------------------------------------------------
def fetch_hkellecioglu():
    print("[3/6] Hamdi Kellecioğlu X akışı çekiliyor...")
    tweets = []
    try:
        url = "https://syndication.twitter.com/srv/timeline-profile/screen-name/hkellecioglu"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://platform.twitter.com/"
            }
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            html_text = resp.read().decode("utf-8")
        m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html_text, re.DOTALL)
        if m:
            data = json.loads(m.group(1))
            entries = data.get("props", {}).get("pageProps", {}).get("timeline", {}).get("entries", [])
            for e in entries:
                t = e.get("content", {}).get("tweet")
                if t: tweets.append(t)
            print(f"  Live X: {len(tweets)} tweet çekildi.")
    except Exception as e:
        print(f"  Live X ({e}), kayıtlı veri kontrol ediliyor...")

    if not tweets:
        for p in ["/root/hkellecioglu_tweets.json", os.path.join(os.path.dirname(__file__), "hkellecioglu_tweets.json")]:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    tweets = json.load(f)
                print(f"  Kayıtlı veri kaynağından {len(tweets)} tweet yüklendi.")
                break

    items = []
    for t in tweets:
        text = t.get("full_text") or t.get("text") or ""
        if not text: continue
        id_str = t.get("id_str")
        permalink = t.get("permalink") or (f"/hkellecioglu/status/{id_str}" if id_str else "")
        link = f"https://x.com{permalink}" if permalink.startswith("/") else permalink
        
        image = None
        media_list = t.get("entities", {}).get("media", [])
        if media_list: image = media_list[0].get("media_url_https")
        if not image:
            card_vals = t.get("card", {}).get("binding_values", {})
            for key in ["player_image_large", "photo_image_full_size_large", "thumbnail_image_large", "summary_photo_image_large"]:
                card_img = card_vals.get(key, {}).get("image_value", {}).get("url")
                if card_img: image = card_img; break
        
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        title = lines[0] if lines else "Hamdi Kellecioğlu Paylaşımı"
        title = re.sub(r'https?://\S+', '', title).strip()
        if len(title) > 90: title = title[:87] + "..."
        if not title: title = "Hamdi Kellecioğlu X Paylaşımı"

        items.append({
            "title": title,
            "link": link,
            "pubDate": t.get("created_at"),
            "summary": clean_html(text)[:280],
            "image": image or "https://pbs.twimg.com/profile_images/1271167857926299651/r5fzkC-p_normal.jpg",
            "tags": ["bilim", "teknoloji", "yapayzeka", "uzay", "x"],
            "author": "Hamdi Kellecioğlu",
            "type": "article",
            "videoId": None
        })

    print(f"  Hamdi Kellecioğlu: {len(items)} içerik hazırlandı.")
    return items

# -------------------------------------------------------------
# 4. Ozan Öğretmenoğlu (@oznogretmenoglu / 3 Şerit) [#otomobil]
# -------------------------------------------------------------
def fetch_ozan_ogretmenoglu():
    print("[4/6] Ozan Öğretmenoğlu (@oznogretmenoglu / 3 Şerit) içerikleri alınıyor...")
    videos = []

    try:
        url = "https://www.youtube.com/@3serit/videos"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8"
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')

        m = re.search(r'var ytInitialData = (\{.*?\});</script>', html_text)
        if not m:
            m = re.search(r'window\["ytInitialData"\] = (\{.*?\});</script>', html_text)

        if m:
            data = json.loads(m.group(1))
            def search_lockups(obj):
                if isinstance(obj, dict):
                    if 'lockupViewModel' in obj:
                        lvm = obj['lockupViewModel']
                        vid_id = lvm.get('contentId')
                        meta = lvm.get('metadata', {}).get('lockupMetadataViewModel', {})
                        title = meta.get('title', {}).get('content', '')
                        rows = meta.get('metadata', {}).get('contentMetadataViewModel', {}).get('metadataRows', [])
                        date_text = ''
                        for r in rows:
                            for p in r.get('metadataParts', []):
                                t = p.get('text', {}).get('content', '')
                                if 'önce' in t: date_text = t
                        sources = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('image', {}).get('sources', [])
                        thumb = sources[-1].get('url', '') if sources else f"https://i.ytimg.com/vi/{vid_id}/maxresdefault.jpg"
                        duration = '15:00'
                        overlays = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('overlays', [])
                        for ov in overlays:
                            badges = ov.get('thumbnailBottomOverlayViewModel', {}).get('badges', [])
                            for b in badges:
                                dur = b.get('thumbnailBadgeViewModel', {}).get('text', '')
                                if dur: duration = dur; break
                            if duration != '15:00': break

                        if vid_id and title:
                            videos.append({
                                'videoId': vid_id,
                                'title': title,
                                'date_text': date_text,
                                'duration': duration,
                                'thumbnail': thumb
                            })
                    else:
                        for v in obj.values(): search_lockups(v)
                elif isinstance(obj, list):
                    for item in obj: search_lockups(item)
            search_lockups(data)
            print(f"  Live YouTube: {len(videos)} video bulundu.")
    except Exception as e:
        print(f"  Live YouTube ({e}), yerel yedek kontrol ediliyor...")

    if not videos:
        for p in ["/root/ozan_videos_clean.json", os.path.join(os.path.dirname(__file__), "ozan_videos_clean.json")]:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    for s in saved:
                        videos.append({
                            'videoId': s['videoId'],
                            'title': s['title'],
                            'date_text': s.get('meta', ''),
                            'duration': s.get('duration', '15:00'),
                            'thumbnail': s.get('thumbnail')
                        })
                print(f"  Yedek dosyadan {len(videos)} video yüklendi.")
                break

    items = []
    for v in videos:
        vid_id = v['videoId']
        title = v['title']
        link = f"https://www.youtube.com/watch?v={vid_id}"
        dur_mins = parse_duration_to_minutes(v.get('duration', '15:00'))
        summary = f"{title}. Ozan Öğretmenoğlu (3 Şerit) detaylı test sürüşü ve otomobil incelemesi ({v.get('duration', '')})."
        
        items.append({
            "title": title,
            "link": link,
            "pubDate": v.get('date_text', ''),
            "summary": summary,
            "image": v['thumbnail'] or f"https://i.ytimg.com/vi/{vid_id}/maxresdefault.jpg",
            "tags": ["otomobil", "araba", "inceleme", "turkce", "youtube"],
            "author": "Ozan Öğretmenoğlu",
            "type": "video:youtube",
            "videoId": vid_id,
            "readTime": dur_mins
        })

    print(f"  Ozan Öğretmenoğlu: {len(items)} otomobil içeriği hazırlandı.")
    return items

# -------------------------------------------------------------
# 5. NuvemMag (nuvemmag.com)
# -------------------------------------------------------------
def fetch_nuvemmag():
    print("[5/6] NuvemMag (nuvemmag.com) içerikleri çekiliyor...")
    items = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }

    for page in range(1, 4):
        feed_url = f"https://nuvemmag.com/feed/?paged={page}"
        try:
            req = urllib.request.Request(feed_url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                content = resp.read()
            root = ET.fromstring(content)
            channel = root.find("channel")
            if channel is None: channel = root
            
            page_items = channel.findall("item")
            for item in page_items:
                title = clean_html(item.findtext("title") or "")
                link = (item.findtext("link") or "").strip()
                if not title or not link: continue
                
                pub_date = item.findtext("pubDate") or ""
                creator = item.findtext("{http://purl.org/dc/elements/1.1/}creator") or "NuvemMag"
                
                categories = []
                for cat in item.findall("category"):
                    if cat.text:
                        s = slugify(cat.text)
                        if s and len(s) < 25:
                            categories.append(s)
                
                content_enc = item.findtext("{http://purl.org/rss/1.0/modules/content/}encoded") or ""
                desc = item.findtext("description") or ""
                raw_body = content_enc or desc
                
                img = extract_first_image(raw_body)
                if not img:
                    try:
                        r = urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0"})
                        with urllib.request.urlopen(r, timeout=4) as article_resp:
                            art_html = article_resp.read().decode('utf-8', errors='ignore')
                            m_og = re.search(r'<meta property="og:image" content="([^"]+)"', art_html)
                            if m_og:
                                img = m_og.group(1)
                    except Exception:
                        pass
                
                tags = list(dict.fromkeys(["teknoloji", "haber", "yapayzeka", "bilim", "inovasyon"] + categories))
                summary = clean_html(desc or raw_body)[:280]

                items.append({
                    "title": title,
                    "link": link,
                    "pubDate": pub_date,
                    "summary": summary,
                    "image": img or "https://nuvemmag.com/wp-content/uploads/2025/12/logo.png",
                    "tags": tags[:6],
                    "author": creator,
                    "type": "article",
                    "videoId": None
                })
        except Exception as e:
            print(f"  NuvemMag sayfa {page} çekim hatası: {e}")
            break

    print(f"  NuvemMag: {len(items)} haber/içerik hazırlandı.")
    return items

# -------------------------------------------------------------
# 6. Çiçek ile Teknoloji (@cicekileteknoloji)
# -------------------------------------------------------------
def fetch_cicek_ile_teknoloji():
    print("[6/6] Çiçek ile Teknoloji (@cicekileteknoloji) içerikleri alınıyor...")
    videos = []

    try:
        url = "https://www.youtube.com/@cicekileteknoloji/videos"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8"
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')

        m = re.search(r'var ytInitialData = (\{.*?\});</script>', html_text)
        if not m:
            m = re.search(r'window\["ytInitialData"\] = (\{.*?\});</script>', html_text)

        if m:
            data = json.loads(m.group(1))
            def search_lockups(obj):
                if isinstance(obj, dict):
                    if 'lockupViewModel' in obj:
                        lvm = obj['lockupViewModel']
                        vid_id = lvm.get('contentId')
                        meta = lvm.get('metadata', {}).get('lockupMetadataViewModel', {})
                        title = meta.get('title', {}).get('content', '')
                        rows = meta.get('metadata', {}).get('contentMetadataViewModel', {}).get('metadataRows', [])
                        date_text = ''
                        for r in rows:
                            for p in r.get('metadataParts', []):
                                t = p.get('text', {}).get('content', '')
                                if 'önce' in t: date_text = t
                        sources = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('image', {}).get('sources', [])
                        thumb = sources[-1].get('url', '') if sources else f"https://i.ytimg.com/vi/{vid_id}/maxresdefault.jpg"
                        duration = '15:00'
                        overlays = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('overlays', [])
                        for ov in overlays:
                            badges = ov.get('thumbnailBottomOverlayViewModel', {}).get('badges', [])
                            for b in badges:
                                dur = b.get('thumbnailBadgeViewModel', {}).get('text', '')
                                if dur: duration = dur; break
                            if duration != '15:00': break

                        if vid_id and title:
                            videos.append({
                                'videoId': vid_id,
                                'title': title,
                                'date_text': date_text,
                                'duration': duration,
                                'thumbnail': thumb
                            })
                    else:
                        for v in obj.values(): search_lockups(v)
                elif isinstance(obj, list):
                    for item in obj: search_lockups(item)
            search_lockups(data)
            print(f"  Çiçek Canlı YouTube: {len(videos)} video bulundu.")
    except Exception as e:
        print(f"  Çiçek Canlı YouTube ({e}), yerel yedek kontrol ediliyor...")

    if not videos:
        for p in ["/root/cicek_yt_videos.json", os.path.join(os.path.dirname(__file__), "cicek_yt_videos.json")]:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    for s in saved:
                        videos.append({
                            'videoId': s['videoId'],
                            'title': s['title'],
                            'date_text': s.get('date_text', ''),
                            'duration': s.get('duration', '15:00'),
                            'thumbnail': s.get('thumbnail')
                        })
                print(f"  Çiçek Yedek dosyadan {len(videos)} video yüklendi.")
                break

    items = []
    for v in videos:
        vid_id = v['videoId']
        title = v['title']
        link = f"https://www.youtube.com/watch?v={vid_id}"
        dur_mins = parse_duration_to_minutes(v.get('duration', '15:00'))
        summary = f"{title}. Çiçek ile Teknoloji YouTube kanalından yapay zeka, yeni nesil yazılım araçları ve teknoloji incelemesi ({v.get('duration', '')})."
        
        items.append({
            "title": title,
            "link": link,
            "pubDate": v.get('date_text', ''),
            "summary": summary,
            "image": v['thumbnail'] or f"https://i.ytimg.com/vi/{vid_id}/maxresdefault.jpg",
            "tags": ["yapayzeka", "teknoloji", "yazilim", "youtube", "turkce"],
            "author": "Çiçek ile Teknoloji",
            "type": "video:youtube",
            "videoId": vid_id,
            "readTime": dur_mins
        })

    print(f"  Çiçek ile Teknoloji: {len(items)} video içeriği hazırlandı.")
    return items

# -------------------------------------------------------------
# SQL Generator & Database Importer
# -------------------------------------------------------------
def generate_sql():
    sources = [
        {
            "id": "hamdi-kellecioglu",
            "handle": "hkellecioglu",
            "name": "Hamdi Kellecioğlu",
            "website": "https://x.com/hkellecioglu",
            "image": "https://pbs.twimg.com/profile_images/1271167857926299651/r5fzkC-p_normal.jpg",
            "description": "Hamdi Kellecioğlu (@hkellecioglu) - Bilim, teknoloji, uzay, yapay zeka ve girişimcilik paylaşımları.",
            "default_tags": ["bilim", "teknoloji", "yapayzeka", "uzay", "x"],
            "items": fetch_hkellecioglu()
        },
        {
            "id": "mesut-cevik",
            "handle": "mesut-cevik",
            "name": "Mesut Çevik",
            "website": "https://www.mesutcevik.com",
            "image": "https://unavatar.io/twitter/mesutcevik",
            "description": "Mesut Çevik - Teknoloji ve hayata dair güncel incelemeler, donanım, mobil dünya ve YouTube yayınları.",
            "default_tags": ["teknoloji", "donanim", "mobil", "inceleme", "youtube", "haber"],
            "items": fetch_mesutcevik()
        },
        {
            "id": "kantan-news",
            "handle": "kantan-news",
            "name": "Kantan.News",
            "website": "https://kantan.news",
            "image": "https://kantan.news/icon-180.png",
            "description": "Kantan.News - Yapay zeka destekli teknoloji, siber güvenlik, yazılım ve güncel bilim haberleri.",
            "default_tags": ["yapayzeka", "teknoloji", "guvenlik", "haber", "bilim"],
            "items": fetch_kantan_news()
        },
        {
            "id": "ozan-ogretmenoglu",
            "handle": "oznogretmenoglu",
            "name": "Ozan Öğretmenoğlu",
            "website": "https://x.com/oznogretmenoglu",
            "image": "https://pbs.twimg.com/profile_images/1845476702312374286/IhZtKwqq_400x400.jpg",
            "description": "Ozan Öğretmenoğlu (@oznogretmenoglu / 3 Şerit) - Otomobil, elektrikli araç test sürüşleri, detaylı incelemeler ve otomotiv dünyası.",
            "default_tags": ["otomobil", "araba", "inceleme", "turkce", "youtube"],
            "items": fetch_ozan_ogretmenoglu()
        },
        {
            "id": "nuvemmag",
            "handle": "nuvemmag",
            "name": "NuvemMag",
            "website": "https://nuvemmag.com",
            "image": "https://nuvemmag.com/wp-content/uploads/2025/12/cropped-logo-192x192.png",
            "description": "NuvemMag - Güncel teknoloji haberleri, yapay zeka, donanım, bilim ve inovasyon dünyası.",
            "default_tags": ["teknoloji", "yapayzeka", "haber", "inovasyon", "bilim", "turkce"],
            "items": fetch_nuvemmag()
        },
        {
            "id": "cicek-ile-teknoloji",
            "handle": "cicekileteknoloji",
            "name": "Çiçek ile Teknoloji",
            "website": "https://www.youtube.com/@cicekileteknoloji",
            "image": "https://yt3.googleusercontent.com/rWr3noTeOBuCIGLFttjtbqNW5eEyhOp7IbvXbi1BahZHLXHYNOwVEvzUdUsGISJQRe7AvcvzWw=s900-c-k-c0x00ffffff-no-rj",
            "description": "Çiçek ile Teknoloji (@cicekileteknoloji) - Yapay zeka, yeni nesil yazılım araçları, robotik ve teknoloji dünyası.",
            "default_tags": ["yapayzeka", "teknoloji", "yazilim", "youtube", "turkce"],
            "items": fetch_cicek_ile_teknoloji()
        }
    ]

    sql_statements = ["BEGIN;"]
    
    # User settings default row safety
    sql_statements.append("""
    INSERT INTO settings ("userId", flags)
    VALUES ('usr_halil', '{}'::jsonb)
    ON CONFLICT ("userId") DO NOTHING;
    """)

    # Key tags with localized titles in flags
    key_tags = [
        ("teknoloji", "Teknoloji"),
        ("donanim", "Donanım"),
        ("yapayzeka", "Yapay Zeka"),
        ("bilim", "Bilim"),
        ("inovasyon", "İnovasyon"),
        ("yazilim", "Yazılım"),
        ("haber", "Haber"),
        ("mobil", "Mobil"),
        ("guvenlik", "Güvenlik"),
        ("uzay", "Uzay"),
        ("otomobil", "Otomobil"),
        ("araba", "Araba"),
        ("inceleme", "İnceleme"),
        ("turkce", "Türkçe"),
        ("youtube", "YouTube"),
        ("x", "X")
    ]
    for tag, title in key_tags:
        kw_sql = f"""
        INSERT INTO keyword (value, status, occurrences, flags, "createdAt", "updatedAt")
        VALUES ({quote(tag)}, 'allow', 10, '{{"title": "{title}"}}'::jsonb, now(), now())
        ON CONFLICT (value) DO UPDATE SET
            status = 'allow',
            flags = jsonb_set(keyword.flags, '{{title}}', '"{title}"');
        """
        sql_statements.append(kw_sql)

    total_posts = 0

    # 1. Kaynak tanımlarını veritabanına kaydet
    for src in sources:
        print(f"\n[PostgreSQL Hazırlığı] Kaynak Tanımı: {src['name']}")
        src_sql = f"""
        INSERT INTO source (
            id, handle, name, website, image, description, type, active, "createdAt"
        ) VALUES (
            {quote(src['id'])},
            {quote(src['handle'])},
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

    # 2. Tüm kaynaklardan gelen içerikleri topla ve homojen (karışık) şekilde harmanla
    source_items_map = {}
    for src in sources:
        valid_items = [it for it in src.get("items", []) if it.get("title") and it.get("link")]
        if valid_items:
            source_items_map[src["id"]] = [(src, it) for it in valid_items]

    interleaved_items = []
    src_ids = list(source_items_map.keys())
    max_count = max((len(v) for v in source_items_map.values()), default=0)

    for r in range(max_count):
        # Her turda başlangıç kaynağını kaydırarak arka arkaya aynı kaynağın gelmesini engelle
        rotated_ids = src_ids[r % len(src_ids):] + src_ids[:r % len(src_ids)]
        for sid in rotated_ids:
            queue = source_items_map[sid]
            if r < len(queue):
                interleaved_items.append(queue[r])

    print(f"\n[Akış Mikseri] Toplam {len(interleaved_items)} içerik {len(src_ids)} farklı kaynaktan homojen/karışık olarak harmanlandı.")

    now = datetime.now(timezone.utc)
    for i, (src, item) in enumerate(interleaved_items):
        url_hash = hashlib.sha1(item["link"].encode("utf-8")).hexdigest()[:12]
        post_id = f"tr_{url_hash}"
        short_id = url_hash[:8]

        # Akışta arka arkaya sıralanmaması ve zaman sıralamasında (ORDER BY publishedAt/createdAt)
        # doğal olarak homojen karışık görünmesi için zaman damgalarını geriye doğru kademelendir
        stagger_mins = i * 15 + random.randint(1, 6)
        staggered_dt = now - timedelta(minutes=stagger_mins)
        staggered_sql = f"'{staggered_dt.strftime('%Y-%m-%d %H:%M:%S+00:00')}'::timestamptz"

        cover_img = item["image"] or random.choice(FALLBACK_IMAGES)
        assigned_tags = set(src["default_tags"] + item.get("tags", []))
        assigned_tags.add("turkce")
        assigned_tags.add("teknoloji")
        
        text = f"{item['title']} {item.get('summary', '')}".lower()
        if any(w in text for w in ["araba", "otomobil", "araç", "sürüş", "tesla", "togg", "byd", "elektrikli", "hibrid", "suv", "sedan", "motor", "batarya", "menzil", "şarj", "otonom", "bmw", "mercedes", "audi", "chery", "şerit"]):
            assigned_tags.update(["otomobil", "electric-vehicles", "automotive", "araba"])
        if any(w in text for w in ["yapay zeka", "yapay zekâ", "ai", "makine öğrenimi", "machine learning", "llm", "chatgpt", "openai", "claude", "gemini", "deepseek", "anthropic", "gpt-4", "prompt", "model", "agent"]):
            assigned_tags.update(["ai", "machine-learning", "llm", "generative-ai", "yapayzeka"])
        if any(w in text for w in ["yazılım", "kod", "programlama", "developer", "mühendislik", "software", "engineering", "github", "git", "open source"]):
            assigned_tags.update(["software-engineering", "programming", "open-source", "yazilim"])
        if any(w in text for w in ["react", "vue", "angular", "nextjs", "javascript", "typescript", "css", "html", "tailwind", "frontend"]):
            assigned_tags.update(["frontend", "web-development", "javascript"])
            if "react" in text: assigned_tags.add("react")
            if "next" in text: assigned_tags.add("nextjs")
            if "typescript" in text: assigned_tags.add("typescript")
        if any(w in text for w in ["backend", "node", "nodejs", "python", "golang", "rust", "java", "api", "graphql", "sql", "postgres", "database"]):
            assigned_tags.update(["backend", "database"])
            if "python" in text: assigned_tags.add("python")
            if "node" in text: assigned_tags.add("nodejs")
            if "sql" in text: assigned_tags.add("sql")
        if any(w in text for w in ["cloud", "bulut", "aws", "azure", "docker", "kubernetes", "devops", "linux"]):
            assigned_tags.update(["cloud", "devops"])
            if "docker" in text: assigned_tags.add("docker")
            if "kubernetes" in text: assigned_tags.add("kubernetes")
            if "linux" in text: assigned_tags.add("linux")
        if any(w in text for w in ["güvenlik", "siber", "hacker", "malware", "virüs", "fidye", "zafiyet", "security", "cybersecurity"]):
            assigned_tags.update(["security", "cybersecurity", "guvenlik"])
        if any(w in text for w in ["donanım", "işlemci", "ekran kartı", "gpu", "cpu", "ram", "intel", "amd", "nvidia", "rtx", "çip", "bilgisayar"]):
            assigned_tags.update(["hardware", "donanim", "chips"])
            if "gpu" in text or "ekran kartı" in text or "nvidia" in text: assigned_tags.add("gpu")
        if any(w in text for w in ["telefon", "akıllı telefon", "smartphone", "iphone", "apple", "samsung", "xiaomi", "android", "ios"]):
            assigned_tags.update(["smartphones", "mobile"])
            if "apple" in text or "iphone" in text or "ios" in text: assigned_tags.add("apple")
            if "android" in text: assigned_tags.add("android")
        if any(w in text for w in ["oyun", "gaming", "playstation", "ps5", "xbox", "steam"]):
            assigned_tags.update(["gaming", "game-development"])
        if any(w in text for w in ["uzay", "roket", "spacex", "nasa", "astronomi", "bilim", "science"]):
            assigned_tags.update(["space", "science", "uzay", "bilim"])
        if any(w in text for w in ["fintech", "kripto", "crypto", "bitcoin", "ethereum", "finans", "startup"]):
            assigned_tags.update(["fintech", "startups", "finance"])
        if src["id"] in ["mesutcevik-yt", "oznogretmenoglu-yt", "cicekileteknoloji-yt"]:
            assigned_tags.add("inceleme")

        all_tags = list(dict.fromkeys(assigned_tags))
        tags_str = ",".join(all_tags[:6])

        upvotes = random.randint(35, 240)
        comments = random.randint(3, 42)
        views = upvotes * random.randint(12, 35)
        score = 65000000 + random.randint(10000, 999999)
        
        author_name = item.get("author", src["name"]).strip()
        author_slug = slugify(author_name)
        author_id = f"usr_{author_slug[:30]}"
        author_avatar = src["image"] if author_name == src["name"] else f"https://ui-avatars.com/api/?name={urllib.parse.quote(author_name)}&background=22272e&color=adbac7&size=128&bold=true"
        
        author_sql = f"""
        INSERT INTO "user" (
            id, name, username, image, reputation, "createdAt"
        ) VALUES (
            {quote(author_id)},
            {quote(author_name)},
            {quote(author_slug[:36])},
            {quote(author_avatar)},
            100,
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            image = EXCLUDED.image;
        """
        sql_statements.append(author_sql)

        pub_date_sql = parse_date_to_sql(item["pubDate"])
        post_type = item.get("type", "article")
        vid_id = item.get("videoId")
        read_time = item.get("readTime", max(2, len(item['summary'].split()) // 25 or 3))

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
            {staggered_sql},
            {staggered_sql},
            {read_time},
            {quote(tags_str)},
            {quote(post_type)},
            {quote(vid_id)},
            {quote(author_id)},
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
            "publishedAt" = EXCLUDED."publishedAt",
            "createdAt" = EXCLUDED."createdAt",
            "contentCuration" = ARRAY['story']::text[],
            "statsUpdatedAt" = now();
        """
        sql_statements.append(post_sql)
        total_posts += 1

        for tag in all_tags[:6]:
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

    sql_file = "/root/user_sources.sql" if os.name != "nt" else "user_sources.sql"
    with open(sql_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements))

    print(f"\n[TAMAMLANDI] {total_posts} yeni içerik hazırlandı ve {sql_file} dosyasına yazıldı.")

    if os.name != "nt":
        print("[YÜKLENİYOR] PostgreSQL'e aktarılıyor...")
        cmd = f"docker exec -i devcore-postgres psql -U postgres -d api < {sql_file}"
        res = os.system(cmd)
        if res == 0:
            print(f"[BAŞARILI] {total_posts} yeni içerik devcore.tr veritabanına başarıyla aktarıldı!")
            print("[GÜNCELLENİYOR] Trend ve Popüler görünümler yenileniyor...")
            mv_cmd = "docker exec devcore-postgres psql -U postgres -d api -c 'REFRESH MATERIALIZED VIEW trending_post; REFRESH MATERIALIZED VIEW popular_post; REFRESH MATERIALIZED VIEW trending_tag; REFRESH MATERIALIZED VIEW popular_tag;'"
            os.system(mv_cmd)
            print("[HAZIR] Görünümler başarıyla yenilendi.")
        else:
            print(f"[HATA] SQL aktarımı başarısız oldu (kod: {res})")

if __name__ == "__main__":
    generate_sql()
