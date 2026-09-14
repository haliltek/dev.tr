"use client";

import React, { useState, useEffect } from "react";
import { AdItem } from "@/lib/data";

export default function AdsManagementPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAd, setNewAd] = useState({
    title: "",
    sponsor: "",
    description: "",
    url: "/reklam",
    image: "",
    logo: "",
    targetTag: "global",
  });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
        );
      }
    } catch {}
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" reklamını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        setAds((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {}
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.title || !newAd.sponsor) return;
    setSaving(true);

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAd),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ad) {
          setAds((prev) => [data.ad, ...prev]);
        }
        setShowModal(false);
        setNewAd({
          title: "",
          sponsor: "",
          description: "",
          url: "/reklam",
          image: "",
          logo: "",
          targetTag: "global",
        });
      } else {
        alert("Reklam eklenirken hata oluştu.");
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reklam & Sponsorluk Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            devcore.tr akışında ve özel etiketlerde gösterilen sponsor tanıtımlarını ve istatistiklerini denetleyin.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Reklam Kampanyası
        </button>
      </div>

      {/* Ads List */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          Reklamlar yükleniyor...
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          Kayıtlı reklam kampanyası bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <img
                        src={ad.logo || "https://devcore.tr/favicon.ico"}
                        alt={ad.sponsor}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        {ad.sponsor}
                      </h3>
                      <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Hedef: #{ad.targetTag}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(ad.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      ad.active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {ad.active ? "Yayında" : "Durduruldu"}
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {ad.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {ad.description}
                  </p>
                </div>

                {ad.image && (
                  <div className="mb-4 h-32 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between dark:border-gray-800 text-xs">
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                  <span><strong>{ad.impressions || 0}</strong> Gösterim</span>
                  <span><strong>{ad.clicks || 0}</strong> Tıklama</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    %{ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0} CTR
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Bağlantıyı Test Et"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(ad.id, ad.title)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Kampanyayı Sil"
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

      {/* Modal: Create Ad */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Yeni Sponsor Reklamı Oluştur
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sponsor Marka / Şirket *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Trendyol Tech"
                    value={newAd.sponsor}
                    onChange={(e) => setNewAd({ ...newAd, sponsor: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hedef Etiket / Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="global, devops, react..."
                    value={newAd.targetTag}
                    onChange={(e) => setNewAd({ ...newAd, targetTag: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reklam Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Yazılımcılar için özel bulut çözümleri"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama Metni
                </label>
                <textarea
                  rows={2}
                  placeholder="Kısa ve ilgi çekici sponsorluk duyurusu..."
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Yönlendirme Linki (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... veya /reklam"
                    value={newAd.url}
                    onChange={(e) => setNewAd({ ...newAd, url: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sponsor Logo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={newAd.logo}
                    onChange={(e) => setNewAd({ ...newAd, logo: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Banner Görsel URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... veya banner görsel bağlantısı"
                  value={newAd.image}
                  onChange={(e) => setNewAd({ ...newAd, image: e.target.value })}
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
                  {saving ? "Oluşturuluyor..." : "Kampanyayı Başlat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
