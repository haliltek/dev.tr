"use client";

import React, { useState, useEffect } from "react";
import { SourceItem } from "@/lib/data";

export default function SourcesManagementPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newSource, setNewSource] = useState({
    name: "",
    handle: "",
    website: "",
    description: "",
    image: "",
    feedUrl: "",
  });

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      });
      if (res.ok) {
        setSources((prev) =>
          prev.map((s) => (s.id === id ? { ...s, active: !(s.active ?? true) } : s))
        );
      }
    } catch {}
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kaynağını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        setSources((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {}
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name) return;
    setSaving(true);

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSource),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.source) {
          setSources((prev) => [data.source, ...prev]);
        }
        setShowModal(false);
        setNewSource({
          name: "",
          handle: "",
          website: "",
          description: "",
          image: "",
          feedUrl: "",
        });
      } else {
        alert("Kaynak eklenirken bir sorun oluştu.");
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Kaynak & RSS / Medium Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Otomatik olarak taranan Türk mühendislik ekiplerini ve bağımsız teknoloji bloglarını yönetin.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kaynak Ekle
        </button>
      </div>

      {/* Grid of Sources */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          Kaynaklar yükleniyor...
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          Kayıtlı kaynak bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800 p-1">
                      <img
                        src={src.image || "https://unavatar.io/trendyol.com"}
                        alt={src.name}
                        className="h-full w-full object-contain rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        {src.name}
                      </h3>
                      <span className="text-[11px] font-mono text-gray-400">
                        @{src.handle}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(src.id)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                      src.active !== false
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {src.active !== false ? "Aktif" : "Pasif"}
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {src.description || "Açıklama girilmedi."}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between dark:border-gray-800 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {src.postCount || 0} içerik
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={src.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Siteyi Aç"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(src.id, src.name)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Kaynağı Sil"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Source */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Yeni Teknoloji Kaynağı Ekle
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kaynak / Ekip Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Trendyol Tech"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Handle (Kısa Kod)
                  </label>
                  <input
                    type="text"
                    placeholder="trendyol-tech"
                    value={newSource.handle}
                    onChange={(e) => setNewSource({ ...newSource, handle: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Web Sitesi
                  </label>
                  <input
                    type="url"
                    placeholder="https://medium.com/trendyol-tech"
                    value={newSource.website}
                    onChange={(e) => setNewSource({ ...newSource, website: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  RSS / Feed / Medium URL
                </label>
                <input
                  type="url"
                  placeholder="https://medium.com/feed/trendyol-tech"
                  value={newSource.feedUrl}
                  onChange={(e) => setNewSource({ ...newSource, feedUrl: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Logo Görsel Bağlantısı
                </label>
                <input
                  type="url"
                  placeholder="https://unavatar.io/trendyol.com"
                  value={newSource.image}
                  onChange={(e) => setNewSource({ ...newSource, image: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={2}
                  placeholder="Mühendislik ekibi, odaklanılan teknolojiler..."
                  value={newSource.description}
                  onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet & Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
