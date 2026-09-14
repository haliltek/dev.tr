import type { Metadata } from "next";
import DevcoreMetrics from "@/components/devcore/DevcoreMetrics";
import CrawlerControlCard from "@/components/devcore/CrawlerControlCard";
import RecentPostsSummary from "@/components/devcore/RecentPostsSummary";
import ActiveSponsorsSummary from "@/components/devcore/ActiveSponsorsSummary";

export const metadata: Metadata = {
  title: "devcore.tr Yönetim Merkezi | Gösterge Paneli",
  description: "Türkiye Geliştirici Ekosistemi yönetim ve denetim paneli.",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sistem Gösterge Paneli
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            devcore.tr içerik akışı, Türk teknoloji kaynakları ve sponsorluk performansı.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sources"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            + Yeni Kaynak
          </a>
          <a
            href="/ads"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700"
          >
            + Reklam Ekle
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <DevcoreMetrics />

      {/* Crawler Engine Control */}
      <CrawlerControlCard />

      {/* Live Content & Sponsorship Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPostsSummary />
        <ActiveSponsorsSummary />
      </div>
    </div>
  );
}
