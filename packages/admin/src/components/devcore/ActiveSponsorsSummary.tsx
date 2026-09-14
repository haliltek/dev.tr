"use client";

import React, { useEffect, useState } from "react";
import { AdItem } from "@/lib/data";

export default function ActiveSponsorsSummary() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAds = () => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        setAds(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadAds();
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Aktif Sponsorluk & Reklamlar
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Platformda yayınlanan sponsor afişleri
          </p>
        </div>
        <a
          href="/ads"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Reklamları Yönet &rarr;
        </a>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Yükleniyor...</div>
      ) : ads.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">Kayıtlı reklam bulunmuyor.</div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5 dark:border-gray-800 dark:bg-gray-800/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <img
                    src={ad.logo || "https://devcore.tr/favicon.ico"}
                    alt={ad.sponsor}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {ad.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="font-medium">{ad.sponsor}</span>
                    <span>&bull;</span>
                    <span>{ad.impressions} gösterim</span>
                    <span>&bull;</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {ad.clicks} tıklama
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleToggle(ad.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    ad.active
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {ad.active ? "Aktif" : "Durduruldu"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
