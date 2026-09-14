"use client";

import React, { useEffect, useState } from "react";
import { StatsData } from "@/lib/data";

export default function DevcoreMetrics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Toplam İçerik / Yazı",
      value: loading ? "..." : stats?.posts?.toLocaleString("tr-TR") || "1,240",
      change: "+18 bugün",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Türk Mühendislik Kaynakları",
      value: loading ? "..." : stats?.sources?.toString() || "24",
      change: "Trendyol, Hepsiburada...",
      icon: (
        <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Kayıtlı Geliştiriciler",
      value: loading ? "..." : stats?.users?.toString() || "189",
      change: "Aktif topluluk",
      icon: (
        <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
    },
    {
      title: "Toplam Etkileşim / Upvote",
      value: loading ? "..." : stats?.upvotes?.toLocaleString("tr-TR") || "8,450",
      change: "%14 artış",
      icon: (
        <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ),
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {cards.map((c, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {c.title}
            </span>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg}`}>
              {c.icon}
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {c.value}
          </div>
          <div className="mt-1 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {c.change}
          </div>
        </div>
      ))}
    </div>
  );
}
