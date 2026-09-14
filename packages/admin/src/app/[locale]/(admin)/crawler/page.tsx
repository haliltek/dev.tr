"use client";

import React, { useState, useEffect } from "react";

export default function CrawlerManagementPage() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tarayıcı & Crawler Kontrol Merkezi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Türkçe blog ve Medium akışlarını otomatik tarayan crawler motorunu tetikleyin ve logları izleyin.
          </p>
        </div>

        <button
          onClick={handleTrigger}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${running ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {running ? "Tarama Yürütülüyor..." : "Taramayı Hemen Başlat"}
        </button>
      </div>

      {/* Status Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Motor Durumu</span>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${running ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
              <span className="font-bold text-gray-900 dark:text-white text-base">
                {status.status === "running" ? "Aktif Taranıyor" : "Beklemede / Hazır"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Son Çalışma Zamanı</span>
            <span className="font-bold text-gray-900 dark:text-white text-base">
              {status.last_run || "Bugün 08:30"}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Hedef Kaynak Sayısı</span>
            <span className="font-bold text-gray-900 dark:text-white text-base">
              24 Kaynak (Trendyol, Hepsiburada, İyzico...)
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Logs Viewer */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-2 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
              crawler_daemon.log (ingest_turkish_feeds.py)
            </span>
          </div>
          <span className="font-mono text-[11px] text-gray-400">Canlı Akış</span>
        </div>

        <div className="bg-gray-950 p-5 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto leading-relaxed">
          <p className="text-gray-500">[{status.last_run || "08:30:00"}] Daemon bağlandı. Dinleme başlatıldı.</p>
          <p className="text-blue-400 mt-1">&gt; python3 ingest_turkish_feeds.py --mode=cron</p>
          <pre className="mt-2 whitespace-pre-wrap font-mono">
            {status.output || status.message}
          </pre>
        </div>
      </div>
    </div>
  );
}
