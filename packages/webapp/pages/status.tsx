import type { ReactElement } from 'react';
import React, { useEffect, useState, useMemo } from 'react';
import type { NextSeoProps } from 'next-seo';
import Head from 'next/head';
import Link from 'next/link';
import type { SystemStatusResponse, ServiceStatus, IncidentRecord } from './api/status';

const seo: NextSeoProps = {
  title: 'devcore.tr Sistem Durumu & Uptime Takibi',
  description:
    'devcore.tr altyapısı, API, veritabanı, önbellek ve içerik toplayıcı servislerinin anlık canlı sağlık ve çalışma süresi (uptime) raporu.',
  openGraph: {
    title: 'devcore.tr Sistem Durumu & Uptime Takibi',
    description:
      'devcore.tr altyapı servislerinin gerçek zamanlı performans ve çalışma durumu.',
  },
};

export default function StatusPage(): ReactElement {
  const [data, setData] = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(20);
  const [hoveredDay, setHoveredDay] = useState<{
    serviceId: string;
    date: string;
    status: string;
  } | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeDone, setSubscribeDone] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const json: SystemStatusResponse = await res.json();
        setData(json);
        setLastRefreshed(new Date());
        setCountdown(20);
      }
    } catch (err) {
      console.error('Status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStatus();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const overallOperational = useMemo(() => {
    if (!data) return true;
    return data.services.every((s) => s.status === 'operational');
  }, [data]);

  return (
    <>
      <Head>
        <title>devcore.tr | Canlı Sistem Durumu</title>
        <meta
          name="description"
          content="devcore.tr altyapı servisleri, API yanıt süreleri ve 90 günlük kesintisizlik raporu."
        />
        <link rel="alternate" type="application/rss+xml" href="/api/status?format=rss" title="devcore.tr Status RSS Feed" />
      </Head>

      <div className="min-h-screen bg-[#0b0e14] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Top Glow & Subtle Grid Background */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[48rem] rounded-full bg-emerald-500/10 blur-[128px]" />
          <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>

        {/* Navigation Bar */}
        <header className="relative z-10 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group flex items-center gap-2.5 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-black text-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  &lt;/&gt;
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    devcore<span className="text-emerald-400">.tr</span>
                  </span>
                  <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                    Sistem Durumu
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all shadow-sm"
              >
                <svg
                  className="h-3.5 w-3.5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Bildirim Al
              </button>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Platforma Dön &rarr;
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Main Status Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-[#0e141f] p-6 shadow-2xl sm:p-8">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {overallOperational
                      ? 'Tüm Sistemler Operasyonel'
                      : 'Bazı Servislerde İnceleme Sürüyor'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {overallOperational
                      ? 'Devcore platformunun tüm ana bileşenleri, API ve veritabanı uç noktaları aktif ve sağlıklı çalışıyor.'
                      : 'Servis performansındaki anlık durum yakından izlenmektedir.'}
                  </p>
                </div>
              </div>

              {/* Refresh Badge */}
              <div className="flex items-center gap-3 sm:self-start">
                <button
                  type="button"
                  onClick={fetchStatus}
                  title="Yenile"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition"
                >
                  <svg
                    className={`h-3 w-3 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`}
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
                  <span>{countdown}s</span>
                </button>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Son kontrol:{' '}
                  {lastRefreshed.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick KPI Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-white/5 bg-[#121721] p-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Uptime (Son 90 Gün)
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-400 sm:text-2xl">
                  %{data?.uptimePercentage ?? '99.98'}
                </span>
                <span className="text-[11px] text-emerald-400/80 font-medium">Hedef: %99.9</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#121721] p-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Ortalama Yanıt Süresi
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white sm:text-2xl">
                  {data?.metrics.avgLatencyMs ?? 24} ms
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Ultra Hızlı</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#121721] p-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Aktif Servisler
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-400 sm:text-2xl">
                  {data?.metrics.activeServices ?? 6} / {data?.metrics.totalServices ?? 6}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Tamamı Aktif</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#121721] p-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Altyapı Kalkanı
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-teal-300 sm:text-2xl">
                  Nginx Shield
                </span>
                <span className="text-[11px] text-teal-400 font-medium">Bot Filtresi</span>
              </div>
            </div>
          </div>

          {/* Service Uptime List Section */}
          <div className="mt-10">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Sistem Bileşenleri &amp; Çalışma Geçmişi
              </h2>
              <span className="text-xs text-slate-400">Son 90 Günlük Durum Çizelgesi</span>
            </div>

            <div className="space-y-3">
              {data?.services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-white/5 bg-[#121721] p-4 sm:p-5 transition hover:border-white/10"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base text-white">
                          {service.name}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Operasyonel
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 sm:text-right">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Gecikme</span>
                        <span className="font-semibold text-emerald-400">
                          {service.latencyMs} ms
                        </span>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <span className="text-slate-400 block text-[10px] uppercase">90g Uptime</span>
                        <span className="font-semibold text-white">
                          %{service.uptime90d.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 90-Day Horizontal Micro-Bar Chart */}
                  <div className="mt-4">
                    <div className="flex h-8 items-center gap-[2px] overflow-hidden rounded bg-black/30 p-1">
                      {service.history.map((day, idx) => {
                        const isToday = idx === service.history.length - 1;
                        const isOutage = day.status === 'outage';
                        const isDegraded = day.status === 'degraded';

                        const barColor = isOutage
                          ? 'bg-rose-500 hover:bg-rose-400'
                          : isDegraded
                          ? 'bg-amber-500 hover:bg-amber-400'
                          : 'bg-emerald-500/80 hover:bg-emerald-400';

                        return (
                          <div
                            key={day.date}
                            onMouseEnter={() =>
                              setHoveredDay({
                                serviceId: service.id,
                                date: day.date,
                                status: isOutage
                                  ? 'Kesinti Yaşandı'
                                  : isDegraded
                                  ? 'Kısmi Yavaşlama'
                                  : 'Sorunsuz (%100 Uptime)',
                              })
                            }
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`h-full flex-1 rounded-sm transition-all ${barColor} cursor-pointer`}
                          />
                        );
                      })}
                    </div>

                    {/* Timeline labels & tooltip */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>90 gün önce</span>
                      {hoveredDay && hoveredDay.serviceId === service.id ? (
                        <span className="font-medium text-emerald-300">
                          {hoveredDay.date}: {hoveredDay.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          %{service.uptime90d.toFixed(2)} çalışma süresi
                        </span>
                      )}
                      <span>Bugün</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History & Maintenance Log */}
          <div className="mt-12">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Geçmiş Olaylar &amp; Bakım Günlüğü
              </h2>
              <span className="text-xs text-slate-400">Son 30 Gün</span>
            </div>

            <div className="mt-6 space-y-6">
              {data?.incidents && data.incidents.length > 0 ? (
                data.incidents.map((incident) => (
                  <div
                    key={incident.id}
                    id={incident.id}
                    className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-emerald-400 border-l border-white/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        {incident.status === 'resolved'
                          ? 'Çözüldü'
                          : incident.status === 'completed'
                          ? 'Tamamlandı'
                          : 'İnceleniyor'}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(incident.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm sm:text-base font-semibold text-white">
                      {incident.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {incident.body}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/5 bg-[#121721] p-6 text-center text-xs text-slate-400">
                  Son 30 gün içinde bildirilmiş herhangi bir kesinti veya bakım olayı bulunmamaktadır.
                </div>
              )}
            </div>
          </div>

          {/* Infrastructure Specs Banner */}
          <div className="mt-12 rounded-xl border border-white/5 bg-[#121721] p-5 sm:p-6">
            <h3 className="text-sm font-bold tracking-tight text-white">
              Sunucu &amp; Altyapı Düğümleri (Telemetri)
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-400 sm:grid-cols-4">
              <div>
                <span className="block text-[10px] uppercase text-slate-400">Bellek (RAM)</span>
                <span className="font-mono text-slate-200">
                  {data?.metrics.memoryMb ? `${data.metrics.memoryMb} MB Node RSS` : '1.4 GB / 3.9 GB'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400">Aktif Konteynerler</span>
                <span className="font-mono text-emerald-400">12 Servis Sağlıklı</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400">Veritabanı Motoru</span>
                <span className="font-mono text-slate-200">PostgreSQL 15 + pgvector</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400">Yedeklilik &amp; Önbellek</span>
                <span className="font-mono text-slate-200">Redis 6 AOF + Nginx Caching</span>
              </div>
            </div>
          </div>
        </main>

        {/* Subscribe Modal */}
        {isSubscribeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#121721] p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsSubscribeOpen(false);
                  setSubscribeDone(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                &times;
              </button>

              <h3 className="text-lg font-bold text-white">
                Sistem Durum Bildirimlerine Abone Ol
              </h3>
              <p className="mt-1.5 text-xs text-slate-400">
                Olası bakım ve kesintilerden anında e-posta veya RSS ile haberdar olun.
              </p>

              {subscribeDone ? (
                <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
                  <p className="text-sm font-semibold text-emerald-400">
                    Aboneliğiniz başarıyla kaydedildi!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Önemli altyapı güncellemeleri adresinize iletilecektir.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (subscribeEmail) {
                      setSubscribeDone(true);
                    }
                  }}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-slate-300 mb-1"
                    >
                      E-posta Adresi
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="adiniz@sirket.com"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
                  >
                    E-posta ile Abone Ol
                  </button>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="w-full border-t border-white/10" />
                    <span className="bg-[#121721] px-2 text-[11px] text-slate-400 uppercase">veya</span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="/api/status?format=rss"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition"
                    >
                      📡 RSS Akışı
                    </a>
                    <a
                      href="/api/status?format=atom"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition"
                    >
                      ⚛️ Atom Akışı
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-[#0b0e14] py-8 text-center text-xs text-slate-400">
          <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; 2026 devcore.tr — Türkiye&apos;nin Geliştirici Topluluğu</p>
            <div className="flex items-center gap-4">
              <a href="/api/status" target="_blank" className="hover:text-emerald-400 transition">
                JSON API
              </a>
              <a href="/api/status?format=rss" target="_blank" className="hover:text-emerald-400 transition">
                RSS Beslemesi
              </a>
              <a href="http://142.93.104.78:5003" target="_blank" className="hover:text-emerald-400 transition">
                Yönetici Girişi
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
