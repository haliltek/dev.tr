"use client";

import React, { useEffect, useState } from "react";
import { PostItem } from "@/lib/data";

export default function RecentPostsSummary() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = () => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Son Eklenen İçerikler
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Platforma en son çekilen Türkçe teknik yazılar
          </p>
        </div>
        <a
          href="/posts"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Tümünü Gör &rarr;
        </a>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">Henüz içerik yok.</div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {posts.map((post) => (
            <div key={post.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 truncate block"
                >
                  {post.title}
                </a>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {post.sourceName || "Mühendislik Blogu"}
                  </span>
                  <span>&bull;</span>
                  <span>{post.views} görüntülenme</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    +{post.upvotes} beğeni
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(post.id)}
                  title="İçeriği Kaldır"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
