#!/usr/bin/env python3
"""
Devcore Backoffice Internal API Daemon
Runs on 0.0.0.0:5005
Handles:
- /api/stats (Live counts from PostgreSQL)
- /api/sources (List and add sources)
- /api/posts (List, search, delete posts)
- /api/ads (List and create sponsor ads)
- /api/users (List users)
- /api/trigger-ingest (Trigger ingest_user_sources.py in background and report status)
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import urllib.parse
import os
import threading
import time
import uuid
import random
import re

INGEST_STATUS = {"status": "idle", "last_run": None, "message": "Hazır", "output": ""}

def run_psql_json(sql):
    cmd = ["docker", "exec", "devcore-postgres", "psql", "-U", "postgres", "-d", "api", "-t", "-A", "-c", sql]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    if res.returncode != 0:
        return {"error": res.stderr}
    try:
        return json.loads(res.stdout.strip())
    except:
        return {"raw": res.stdout.strip()}

def run_psql_lines(sql):
    cmd = ["docker", "exec", "devcore-postgres", "psql", "-U", "postgres", "-d", "api", "-t", "-A", "-c", sql]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    if res.returncode != 0:
        return []
    lines = [l.strip() for l in res.stdout.strip().split("\n") if l.strip()]
    results = []
    for l in lines:
        try:
            results.append(json.loads(l))
        except:
            results.append({"text": l})
    return results

def run_ingest_thread():
    global INGEST_STATUS
    INGEST_STATUS["status"] = "running"
    INGEST_STATUS["message"] = "Kaynaklar taranıyor ve yeni içerikler çekiliyor..."
    try:
        p = subprocess.run(["python3", "/root/ingest_user_sources.py"], capture_output=True, text=True, timeout=180)
        INGEST_STATUS["status"] = "done"
        INGEST_STATUS["last_run"] = time.strftime("%Y-%m-%d %H:%M:%S")
        INGEST_STATUS["message"] = "Tarama ve içerik aktarımı başarıyla tamamlandı!"
        INGEST_STATUS["output"] = p.stdout[-500:] if p.stdout else ""
    except Exception as e:
        INGEST_STATUS["status"] = "error"
        INGEST_STATUS["message"] = f"Hata: {str(e)}"

class BackofficeHandler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/api/stats":
            sql = """
            SELECT json_build_object(
                'posts', (SELECT count(*) FROM post),
                'sources', (SELECT count(*) FROM source),
                'keywords', (SELECT count(*) FROM keyword WHERE status='allow'),
                'users', (SELECT count(*) FROM "user"),
                'upvotes', (SELECT coalesce(sum(upvotes), 0) FROM post)
            );
            """
            data = run_psql_json(sql)
            self.send_json(data)

        elif path == "/api/sources":
            sql = """
            SELECT json_build_object(
                'id', id,
                'name', name,
                'handle', handle,
                'website', website,
                'description', description,
                'image', image,
                'postCount', (SELECT count(*) FROM post WHERE "sourceId" = source.id)
            ) FROM source ORDER BY name ASC;
            """
            sources = run_psql_lines(sql)
            self.send_json(sources)

        elif path == "/api/posts":
            q = query.get("q", [""])[0].replace("'", "''")
            limit = int(query.get("limit", [50])[0])
            offset = int(query.get("offset", [0])[0])
            filter_sql = ""
            if q:
                filter_sql = f"WHERE title ILIKE '%{q}%' OR \"tagsStr\" ILIKE '%{q}%'"
            
            sql = f"""
            SELECT json_build_object(
                'id', p.id,
                'title', p.title,
                'summary', p.summary,
                'tagsStr', p."tagsStr",
                'sourceId', p."sourceId",
                'sourceName', s.name,
                'publishedAt', p."publishedAt",
                'upvotes', p.upvotes,
                'views', p.views,
                'url', p.url,
                'image', p.image
            ) FROM post p
            LEFT JOIN source s ON p."sourceId" = s.id
            {filter_sql}
            ORDER BY p."publishedAt" DESC NULLS LAST
            LIMIT {limit} OFFSET {offset};
            """
            posts = run_psql_lines(sql)
            self.send_json(posts)

        elif path == "/api/users":
            sql = """
            SELECT json_build_object(
                'id', id,
                'name', name,
                'username', username,
                'image', image,
                'reputation', reputation,
                'createdAt', "createdAt"
            ) FROM "user" ORDER BY "createdAt" DESC LIMIT 50;
            """
            users = run_psql_lines(sql)
            self.send_json(users)

        elif path == "/api/ads":
            # Load stored custom ads from /root/custom_ads.json
            ads_file = "/root/custom_ads.json"
            if os.path.exists(ads_file):
                with open(ads_file, "r", encoding="utf-8") as f:
                    ads = json.load(f)
            else:
                ads = [
                    {
                        "id": "ad_1",
                        "title": "Devcore Partner Programı - Sponsor Olun",
                        "description": "Türkiye'nin en nitelikli yazılımcı ekosistemine doğrudan ulaşın.",
                        "sponsor": "devcore.tr",
                        "logo": "https://devcore.tr/favicon.ico",
                        "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
                        "url": "/reklam",
                        "targetTag": "global",
                        "impressions": 1420,
                        "clicks": 68,
                        "active": True
                    }
                ]
                with open(ads_file, "w", encoding="utf-8") as f:
                    json.dump(ads, f, ensure_ascii=False, indent=2)
            self.send_json(ads)

        elif path in ["/api/ad-feed", "/api/v1/a"] or path.startswith("/api/v1/a"):
            ads_file = "/root/custom_ads.json"
            ads = []
            if os.path.exists(ads_file):
                try:
                    with open(ads_file, "r", encoding="utf-8") as f:
                        ads = json.load(f)
                except:
                    pass
            active_ads = [a for a in ads if a.get("active", True)]
            if not active_ads:
                active_ads = [{
                    "id": "ad_default",
                    "title": "Devcore Partner Programı - Sponsor Olun",
                    "description": "Türkiye'nin en nitelikli yazılımcı ekosistemine doğrudan ulaşın.",
                    "sponsor": "devcore.tr",
                    "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
                    "url": "/reklam",
                    "targetTag": "global"
                }]
            chosen = random.choice(active_ads)
            
            # Increment impression
            for a in ads:
                if a.get("id") == chosen.get("id"):
                    a["impressions"] = a.get("impressions", 0) + 1
            try:
                with open(ads_file, "w", encoding="utf-8") as f:
                    json.dump(ads, f, ensure_ascii=False, indent=2)
            except:
                pass

            response_ad = {
                "tagLine": chosen.get("title", "Devcore Sponsorluk"),
                "description": chosen.get("description", "Geliştiricilere ulaşın"),
                "image": chosen.get("image", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"),
                "link": chosen.get("url", "/reklam"),
                "source": chosen.get("sponsor", "devcore.tr"),
                "company": chosen.get("sponsor", "devcore.tr"),
                "providerId": "devcore_custom",
                "id": chosen.get("id", "ad_1"),
                "placeholder": "",
                "ratio": 2,
                "backgroundColor": "#0d1117",
                "matchingTags": ["cicd", "devtools", "automation", "kubernetes", "infrastructure", "sre", "docker", "observability", "yapayzeka", "otomobil", "yazilim"],
                "adDomain": "devcore.tr"
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("x-generation-id", str(uuid.uuid4()))
            self.send_header("access-control-expose-headers", "x-generation-id")
            self.end_headers()
            self.wfile.write(json.dumps([response_ad], ensure_ascii=False).encode("utf-8"))

        elif path == "/api/ingest-status":
            self.send_json(INGEST_STATUS)

        else:
            self.send_json({"error": "Not Found"}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except:
            payload = {}

        if path == "/api/trigger-ingest":
            global INGEST_STATUS
            if INGEST_STATUS["status"] == "running":
                self.send_json({"status": "running", "message": "Zaten bir tarama devam ediyor."})
                return
            t = threading.Thread(target=run_ingest_thread)
            t.daemon = True
            t.start()
            self.send_json({"status": "started", "message": "İçerik taraması arka planda başlatıldı."})

        elif path == "/api/ads":
            ads_file = "/root/custom_ads.json"
            ads = []
            if os.path.exists(ads_file):
                with open(ads_file, "r", encoding="utf-8") as f:
                    ads = json.load(f)
            
            action = payload.get("action", "add")
            if action == "add":
                new_ad = {
                    "id": f"ad_{int(time.time())}",
                    "title": payload.get("title", ""),
                    "description": payload.get("description", ""),
                    "sponsor": payload.get("sponsor", ""),
                    "logo": payload.get("logo", "https://devcore.tr/favicon.ico"),
                    "image": payload.get("image", ""),
                    "url": payload.get("url", "/reklam"),
                    "targetTag": payload.get("targetTag", "global"),
                    "impressions": 0,
                    "clicks": 0,
                    "active": True
                }
                ads.insert(0, new_ad)
            elif action == "toggle":
                ad_id = payload.get("id")
                for ad in ads:
                    if ad.get("id") == ad_id:
                        ad["active"] = not ad.get("active", True)
            elif action == "delete":
                ad_id = payload.get("id")
                ads = [ad for ad in ads if ad.get("id") != ad_id]

            with open(ads_file, "w", encoding="utf-8") as f:
                json.dump(ads, f, ensure_ascii=False, indent=2)
            self.send_json({"success": True, "ads": ads})

        elif path == "/api/posts/delete":
            post_id = payload.get("id", "").replace("'", "''")
            if post_id:
                cmd = f"docker exec devcore-postgres psql -U postgres -d api -c \"DELETE FROM post WHERE id = '{post_id}';\""
                subprocess.run(cmd, shell=True)
                self.send_json({"success": True, "deleted": post_id})
            else:
                self.send_json({"error": "Missing post id"}, 400)

        elif path == "/api/sources/add":
            name = payload.get("name", "").strip()
            handle = payload.get("handle", "").strip()
            if not handle and name:
                handle = re.sub(r'[^a-zA-Z0-9_]', '', name.lower())[:30]
            if not handle:
                handle = f"source_{int(time.time())}"
            website = payload.get("website", "").strip() or "https://devcore.tr"
            description = payload.get("description", "").strip()
            image = payload.get("image", "").strip() or "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"
            feed_url = payload.get("feedUrl", "").strip()
            source_type = payload.get("type", "rss")

            src_id = f"src_{handle}"
            sql = f"""
            INSERT INTO source (id, name, handle, website, description, image, type, active, flags, "linkedSourceIds")
            VALUES ('{src_id}', '{name.replace("'", "''")}', '{handle}', '{website.replace("'", "''")}', '{description.replace("'", "''")}', '{image.replace("'", "''")}', 'machine', true, '{{}}'::jsonb, '{{}}'::text[])
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, website = EXCLUDED.website, description = EXCLUDED.description;
            """
            run_psql_lines(sql)

            # Also persist in /root/custom_sources.json
            cs_file = "/root/custom_sources.json"
            cs_list = []
            if os.path.exists(cs_file):
                try:
                    with open(cs_file, "r", encoding="utf-8") as f:
                        cs_list = json.load(f)
                except:
                    pass
            new_source_entry = {
                "id": src_id,
                "name": name,
                "handle": handle,
                "website": website,
                "description": description,
                "image": image,
                "feedUrl": feed_url,
                "type": source_type
            }
            cs_list.append(new_source_entry)
            with open(cs_file, "w", encoding="utf-8") as f:
                json.dump(cs_list, f, ensure_ascii=False, indent=2)

            self.send_json({"success": True, "source": new_source_entry})

        else:
            self.send_json({"error": "Not Found"}, 404)

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 5005), BackofficeHandler)
    print("Devcore Backoffice API Daemon listening on port 5005...")
    server.serve_forever()
