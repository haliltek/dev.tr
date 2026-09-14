"use client";

import React, { useState, useEffect } from "react";
import { PostItem } from "@/lib/data";

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = async (query?: string) => {
    setLoading(true);
    try {
      const url = query ? `/api/posts?q=${encodeURIComponent(query)}` : "/api/posts";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(searchQuery);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" başlıklı içeriği kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Silme işlemi başarısız.");
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            İçerik & Yazı Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Türk teknoloji bloglarından taranan yazıları inceleyin, filtreleyin veya yayından kaldırın.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Başlık veya etikete göre ara..."
            className="w-64 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Ara
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchPosts();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Temizle
            </button>
          )}
        </form>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">İçerik Başlığı</th>
                <th className="px-6 py-4 font-semibold">Kaynak</th>
                <th className="px-6 py-4 font-semibold">Etiketler</th>
                <th className="px-6 py-4 font-semibold">Görüntülenme / Beğeni</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    İçerikler yükleniyor...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Kriterlere uygun içerik bulunamadı.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50/70 transition dark:hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          <img
                            src={post.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 line-clamp-1"
                          >
                            {post.title}
                          </a>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                            {post.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {post.sourceName || "Blog"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {post.tagsStr?.split(",").slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        {post.views} görüntülenme
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        +{post.upvotes} beğeni
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                          title="Yazıyı Oku"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          title="İçeriği Sil"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
