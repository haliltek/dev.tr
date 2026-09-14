"use client";

import React, { useState, useEffect } from "react";

export default function CrawlerControlCard() {
  const [status, setStatus] = useState<{
    status: string;
    message: string;
    last_run?: string;
    output?: string;
  }>({
    status: "idle",
    message: "Beklemede",
  });
  const [running, setRunning] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/crawler");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.status === "running") {
          setRunning(true);
        } else {
          setRunning(false);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/crawler", { method: "POST" });
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getBadge = () => {
    if (status.status === "running") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          Taranıyor...
        </span>
      );
    }
    if (status.status === "done") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Tamamlandı
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        Hazır
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Türk Mühendislik Blogları Tarayıcısı (Crawler Engine)
            </h3>
            {getBadge()}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Trendyol, Hepsiburada, İyzico, Getir, Sahibinden vb. ekiplerin yeni içeriklerini çeker.
          </p>
        </div>

        <button
          onClick={handleTrigger}
          disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <svg className={`h-4 w-4 ${running ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {running ? "İçerikler Çekiliyor..." : "Şimdi Tara & Güncelle"}
        </button>
      </div>

      <div className="rounded-xl bg-gray-950 p-4 font-mono text-xs text-emerald-400 border border-gray-800 shadow-inner overflow-x-auto max-h-36">
        <div className="text-gray-500 mb-1"># Son Durum: {status.last_run || "Az önce"}</div>
        <div className="whitespace-pre-wrap">{status.output || status.message}</div>
      </div>
    </div>
  );
}
