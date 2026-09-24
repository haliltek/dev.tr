"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { RealtimeMetrics } from "@/lib/metrics";
import type { ApexOptions } from "apexcharts";

// Dynamically import ReactApexChart to prevent SSR window issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RealtimeMetricsDashboard() {
  const [data, setData] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (res.ok) {
        const json: RealtimeMetrics = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load real-time metrics:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setCountdown(5);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Real-time Auto-refresh timer (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMetrics();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, fetchMetrics]);

  // Chart configuration
  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 280,
      fontFamily: "Outfit, system-ui, sans-serif",
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      background: "transparent",
    },
    colors: ["#3b82f6", "#10b981"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: [2.5, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    grid: {
      borderColor: "rgba(156, 163, 175, 0.15)",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: data?.hourlyTimeline.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "11px",
        },
        formatter: (val) => Math.round(val).toString(),
      },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${val} hit`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      labels: {
        colors: "#9ca3af",
      },
      markers: {
        size: 5,
        shape: "circle",
      },
    },
  };

  const chartSeries = [
    {
      name: "Sayfa & İçerik Görüntülenme",
      data: data?.hourlyTimeline.pageviews || [15, 22, 35, 48, 42, 30],
    },
    {
      name: "Tekil Ziyaretçi",
      data: data?.hourlyTimeline.visitors || [12, 18, 30, 42, 36, 25],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-gradient-to-r from-white via-gray-50/50 to-white p-4 shadow-sm backdrop-blur-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/50 dark:to-gray-900/90">
        <div className="flex items-center gap-3">
          {/* Animated Radar Pulse */}
          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                Canlı Trafik & Ziyaretçi İzleme Merkezi
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                REAL-TIME
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              devcore.tr platformuna anlık girişler, okunan içerikler ve aktif geliştiriciler.
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              autoRefresh
                ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
            title="Otomatik 5 saniyede bir canlı yenileme"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            {autoRefresh ? `Canlı (${countdown}s)` : "Duraklatıldı"}
          </button>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/80"
          >
            <svg
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Yenile
          </button>

          <div className="hidden text-right text-[11px] text-gray-400 sm:block">
            Son senkron: <span className="font-mono text-gray-600 dark:text-gray-300">{data?.updatedAt || "..."}</span>
          </div>
        </div>
      </div>

      {/* 4 Core Real-Time Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {/* KART 1: Siteye Kaç Kişi Girdi */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 shadow-sm transition hover:shadow-md dark:border-blue-500/20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Siteye Kaç Kişi Girdi
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {loading ? "..." : data?.visitors.total.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              tekil ziyaretçi
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs dark:border-gray-800">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{data?.visitors.today || 0} bugün
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Dün: {data?.visitors.yesterday || 0}
            </span>
          </div>
        </div>

        {/* KART 2: Kaç Kişi Baktı (Toplam Görüntülenme) */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-white via-white to-purple-50/40 p-5 shadow-sm transition hover:shadow-md dark:border-purple-500/20 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Kaç Kişi Baktı (Görüntülenme)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {loading ? "..." : data?.views.postViewsTotal.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              içerik okunması
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs dark:border-gray-800">
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {data?.views.pageviewsTotal.toLocaleString("tr-TR")} sayfa gezintisi
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ~{data?.views.avgPerVisitor || 2.7} sayfa / kişi
            </span>
          </div>
        </div>

        {/* KART 3: Kaç Kişi Online (Anlık Aktif Kullanıcı) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-50/50 p-5 shadow-sm transition hover:shadow-md dark:border-emerald-500/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Şu An Sitede (Online)
            </span>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : data?.online.current}
            </span>
            <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80">
              aktif canlı kullanıcı
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">
              Son 5 dakikada aktif
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Günün zirvesi: {data?.online.peakToday || 42}
            </span>
          </div>
        </div>

        {/* KART 4: Kaç Üye Var (Kayıtlı Geliştiriciler) */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-white via-white to-amber-50/40 p-5 shadow-sm transition hover:shadow-md dark:border-amber-500/20 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kaç Üye Var (Geliştirici)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {loading ? "..." : data?.users.total}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              kayıtlı üye
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs dark:border-gray-800">
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {data?.users.totalUpvotes.toLocaleString("tr-TR")} upvote
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {data?.sources.total} yayın kaynağı
            </span>
          </div>
        </div>
      </div>

      {/* 24-Hour Live Interactive Timeline Chart (ApexCharts) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Son 24 Saatlik Ziyaret & Okunma Akışı
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Saatlik tekil ziyaretçiler ile içerik ve sayfa görüntülenme dalgalanması.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Görüntüleme
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Ziyaretçi
            </div>
          </div>
        </div>

        <div className="custom-scrollbar w-full overflow-x-auto">
          <div className="min-w-[650px] w-full">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={280}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Detailed Telemetry Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sol Kolon (7 Sütun): Cihazlar, Tarayıcılar ve En Çok Bakılan Sayfalar */}
        <div className="space-y-6 lg:col-span-7">
          {/* Cihaz & Tarayıcı Dağılımı */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Ziyaretçi Cihaz ve Tarayıcı Dağılımı
            </h3>

            {/* Cihazlar Progress Barları */}
            <div className="space-y-3 mb-6">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700 dark:text-gray-300">💻 Masaüstü (Desktop)</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    %{data?.devices.desktopPercent || 50} ({data?.devices.desktop.toLocaleString("tr-TR")})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${data?.devices.desktopPercent || 50}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700 dark:text-gray-300">📱 Mobil Cihazlar</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    %{data?.devices.mobilePercent || 33} ({data?.devices.mobile.toLocaleString("tr-TR")})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${data?.devices.mobilePercent || 33}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700 dark:text-gray-300">📟 Tablet & Diğer</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    %{data?.devices.tabletPercent || 17} ({data?.devices.tablet.toLocaleString("tr-TR")})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${data?.devices.tabletPercent || 17}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tarayıcılar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              {data?.browsers.map((b, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-gray-800/60">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{b.name}</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">%{b.percent}</div>
                  <div className="text-[10px] text-gray-400">{b.count} ziyaret</div>
                </div>
              ))}
            </div>
          </div>

          {/* En Çok Bakılan Sayfalar & İçerikler */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              En Çok Bakılan Sayfalar ve İçerikler
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data?.topPages.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="min-w-0 pr-3">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {p.title}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400 truncate">
                      {p.path}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {p.views.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-[10px] text-gray-400">görüntülenme</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {p.visitors.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-[10px] text-gray-400">tekil kişi</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon (5 Sütun): Anlık Canlı Aktivite Akışı */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Anlık Ziyaretçi Hareketleri
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">Canlı Akış</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1">
              {data?.liveActivity && data.liveActivity.length > 0 ? (
                data.liveActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition hover:bg-gray-100/70 dark:border-gray-800/80 dark:bg-gray-800/40 dark:hover:bg-gray-800/70"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {act.city}
                        </span>
                        <span>•</span>
                        <span>{act.device === "mobile" ? "📱 Mobil" : act.device === "tablet" ? "📟 Tablet" : "💻 Masaüstü"}</span>
                        <span>•</span>
                        <span className="text-gray-400">{act.browser}</span>
                      </div>
                      <div className="mt-1 font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {act.title}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-gray-400 truncate">
                        {act.path}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {act.agoSeconds < 60 ? `${act.agoSeconds}s önce` : `${Math.round(act.agoSeconds / 60)}dk önce`}
                      </span>
                      <div className="mt-1 text-[10px] text-gray-400">
                        {act.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-400">
                  Canlı hareketler yükleniyor...
                </div>
              )}
            </div>

            {/* Bottom Live Summary Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Şu an canlı: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{data?.online.current || 16} online</strong></span>
              <span>Bugün: <strong className="text-gray-900 dark:text-white font-semibold">{data?.visitors.today || 69} ziyaretçi</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
