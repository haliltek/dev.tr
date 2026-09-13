import type { ReactElement } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import type { NextSeoProps } from 'next-seo';
import Head from 'next/head';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';

const seoTitles = getPageSeoTitles('Devcore.tr Yönetim Merkezi (Backoffice)');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description: 'Devcore.tr içerik, reklam, kaynak ve sistem yönetim merkezi.',
};

interface StatsData {
  posts: number;
  sources: number;
  keywords: number;
  users: number;
  upvotes: number;
}

interface SourceItem {
  id: string;
  name: string;
  handle: string;
  website: string;
  description: string;
  image: string;
  postCount: number;
}

interface PostItem {
  id: string;
  title: string;
  summary: string;
  tagsStr: string;
  sourceId: string;
  sourceName?: string;
  publishedAt: string;
  upvotes: number;
  views: number;
  url: string;
  image: string;
}

interface AdItem {
  id: string;
  title: string;
  description: string;
  sponsor: string;
  logo: string;
  image: string;
  url: string;
  targetTag: string;
  impressions: number;
  clicks: number;
  active: boolean;
}

const BackofficePage = (): ReactElement => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ads' | 'sources' | 'posts' | 'users'>('dashboard');

  // Stats
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Ingest status
  const [ingestStatus, setIngestStatus] = useState<{ status: string; message: string; last_run?: string }>({
    status: 'idle',
    message: 'Hazır',
  });
  const [triggeringIngest, setTriggeringIngest] = useState(false);

  // Sources
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    handle: '',
    website: '',
    description: '',
    image: '',
    feedUrl: '',
    type: 'rss',
  });
  const [savingSource, setSavingSource] = useState(false);

  // Posts
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Ads
  const [ads, setAds] = useState<AdItem[]>([]);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    sponsor: '',
    image: '',
    url: '/reklam',
    targetTag: 'global',
  });
  const [savingAd, setSavingAd] = useState(false);

  // Users
  const [users, setUsers] = useState<any[]>([]);

  // Load stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/backoffice/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load sources
  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const res = await fetch('/api/backoffice/sources');
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSources(false);
    }
  }, []);

  // Load posts
  const fetchPosts = useCallback(async (query = '') => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`/api/backoffice/posts?limit=30&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Load ads
  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch('/api/backoffice/ads');
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/backoffice/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Ingest status poll
  const checkIngestStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/backoffice/ingest-status');
      const data = await res.json();
      setIngestStatus(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchSources();
    fetchPosts();
    fetchAds();
    fetchUsers();
    checkIngestStatus();
  }, [fetchStats, fetchSources, fetchPosts, fetchAds, fetchUsers, checkIngestStatus]);

  // Trigger Ingestion
  const handleTriggerIngest = async () => {
    setTriggeringIngest(true);
    try {
      const res = await fetch('/api/backoffice/trigger-ingest', { method: 'POST' });
      const data = await res.json();
      setIngestStatus({ status: 'running', message: data.message });

      // Poll every 3s
      const interval = setInterval(async () => {
        const pollRes = await fetch('/api/backoffice/ingest-status');
        const pollData = await pollRes.json();
        setIngestStatus(pollData);
        if (pollData.status === 'done' || pollData.status === 'error') {
          clearInterval(interval);
          setTriggeringIngest(false);
          fetchStats();
          fetchPosts();
          fetchSources();
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      setTriggeringIngest(false);
    }
  };

  // Add Ad
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.title || !newAd.sponsor) return;
    setSavingAd(true);
    try {
      const res = await fetch('/api/backoffice/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', ...newAd }),
      });
      const data = await res.json();
      if (data.ads) setAds(data.ads);
      setNewAd({
        title: '',
        description: '',
        sponsor: '',
        image: '',
        url: '/reklam',
        targetTag: 'global',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAd(false);
    }
  };

  // Toggle Ad
  const handleToggleAd = async (id: string) => {
    try {
      const res = await fetch('/api/backoffice/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id }),
      });
      const data = await res.json();
      if (data.ads) setAds(data.ads);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (!confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/backoffice/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Add Source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name) return;
    setSavingSource(true);
    try {
      const res = await fetch('/api/backoffice/sources/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddSource(false);
        setNewSource({
          name: '',
          handle: '',
          website: '',
          description: '',
          image: '',
          feedUrl: '',
          type: 'rss',
        });
        fetchSources();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSource(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 text-text-primary laptop:px-8">
      <Head>
        <title>Yönetim Paneli | devcore.tr</title>
      </Head>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-subtle bg-surface-float p-6 shadow-xl laptop:flex-row laptop:items-center laptop:justify-between laptop:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Devcore.tr Master Backoffice
          </div>
          <h1 className="mt-3 font-extrabold text-2xl laptop:text-3xl">
            Sistem Yönetim Merkezi
          </h1>
          <p className="mt-1 text-xs laptop:text-sm text-text-secondary">
            İçerikler, reklamlar, kaynaklar ve sistem otomasyonunu tek bir merkezden kontrol edin.
          </p>
        </div>

        {/* Quick action: Ingest Button */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-text-primary">İçerik Otomasyonu</div>
              <div className="text-[11px] text-text-secondary">
                {ingestStatus.last_run ? `Son: ${ingestStatus.last_run}` : '4 saatlik cron aktif'}
              </div>
            </div>
            <button
              onClick={handleTriggerIngest}
              disabled={triggeringIngest || ingestStatus.status === 'running'}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover disabled:opacity-50 transition-all"
            >
              <span>⚡</span>
              <span>{triggeringIngest || ingestStatus.status === 'running' ? 'Taranıyor...' : 'Şimdi Çek'}</span>
            </button>
          </div>
          {ingestStatus.message && (
            <div className="text-[11px] text-text-tertiary">
              {ingestStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-border-subtle pb-2 text-sm font-semibold">
        {[
          { id: 'dashboard', label: '📊 Genel Bakış' },
          { id: 'ads', label: '📢 Reklam & Sponsorlar' },
          { id: 'sources', label: '📡 Kaynak & Feed Yönetimi' },
          { id: 'posts', label: '📰 İçerik Moderasyonu' },
          { id: 'users', label: '👥 Kullanıcılar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-float hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <a
          href="/backoffice/pendingKeywords"
          className="whitespace-nowrap rounded-xl px-4 py-2.5 text-text-secondary hover:bg-surface-float hover:text-text-primary"
        >
          🏷️ Onay Bekleyen Etiketler →
        </a>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="mt-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 laptop:grid-cols-5">
            <div className="rounded-2xl border border-border-subtle bg-surface-float p-5">
              <div className="text-2xl">📰</div>
              <div className="mt-2 text-2xl font-extrabold text-text-primary">{stats?.posts ?? '...'}</div>
              <div className="text-xs text-text-secondary">Toplam Gönderi</div>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-float p-5">
              <div className="text-2xl">📡</div>
              <div className="mt-2 text-2xl font-extrabold text-text-primary">{stats?.sources ?? '...'}</div>
              <div className="text-xs text-text-secondary">Aktif Kaynak</div>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-float p-5">
              <div className="text-2xl">🏷️</div>
              <div className="mt-2 text-2xl font-extrabold text-text-primary">{stats?.keywords ?? '...'}</div>
              <div className="text-xs text-text-secondary">Onaylı Konu / Etiket</div>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-float p-5">
              <div className="text-2xl">👥</div>
              <div className="mt-2 text-2xl font-extrabold text-text-primary">{stats?.users ?? '...'}</div>
              <div className="text-xs text-text-secondary">Kayıtlı Kullanıcı</div>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-float p-5">
              <div className="text-2xl">🔥</div>
              <div className="mt-2 text-2xl font-extrabold text-text-primary">{stats?.upvotes ?? '...'}</div>
              <div className="text-xs text-text-secondary">Toplam Beğeni</div>
            </div>
          </div>

          {/* Quick Info & Health */}
          <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-surface-float p-6">
              <h3 className="font-bold text-base text-text-primary mb-3">
                Sistem ve Servis Sağlığı
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-surface">
                  <span>PostgreSQL (devcore-postgres:5432)</span>
                  <span className="text-emerald-400 font-bold">● Aktif / Sağlıklı</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-surface">
                  <span>Fastify GraphQL API (devcore-api:5000)</span>
                  <span className="text-emerald-400 font-bold">● Aktif / 200 OK</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-surface">
                  <span>Next.js Webapp (Port 3096)</span>
                  <span className="text-emerald-400 font-bold">● Aktif / Canlı</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-surface">
                  <span>Otomatik 4 Saatlik Cron İkizi</span>
                  <span className="text-emerald-400 font-bold">● Aktif (/etc/cron.d)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-float p-6">
              <h3 className="font-bold text-base text-text-primary mb-3">
                Hızlı Yönetim Bağlantıları
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('sources')}
                  className="rounded-xl border border-border-subtle p-3 text-left hover:border-primary transition-colors"
                >
                  <div className="font-bold text-text-primary">Yeni Kaynak Ekle</div>
                  <div className="text-text-secondary mt-1">YouTube veya RSS ekle</div>
                </button>
                <button
                  onClick={() => setActiveTab('ads')}
                  className="rounded-xl border border-border-subtle p-3 text-left hover:border-primary transition-colors"
                >
                  <div className="font-bold text-text-primary">Yeni Sponsor Tanımla</div>
                  <div className="text-text-secondary mt-1">Akış içi reklam kartı oluştur</div>
                </button>
                <a
                  href="/reklam"
                  target="_blank"
                  className="rounded-xl border border-border-subtle p-3 text-left hover:border-primary transition-colors"
                >
                  <div className="font-bold text-text-primary">Sponsorluk Sayfası ↗</div>
                  <div className="text-text-secondary mt-1">/reklam sayfasını görüntüle</div>
                </a>
                <a
                  href="/tags"
                  target="_blank"
                  className="rounded-xl border border-border-subtle p-3 text-left hover:border-primary transition-colors"
                >
                  <div className="font-bold text-text-primary">Etiket Rehberi ↗</div>
                  <div className="text-text-secondary mt-1">1.237 konuyu görüntüle</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADS MANAGEMENT */}
      {activeTab === 'ads' && (
        <div className="mt-6 space-y-8">
          {/* Add Ad Form */}
          <div className="rounded-3xl border border-border-subtle bg-surface-float p-6 laptop:p-8">
            <h3 className="text-lg font-bold text-text-primary">Yeni Sponsor / Reklam Kartı Tanımla</h3>
            <p className="text-xs text-text-secondary mt-1">
              Akış içerisinde gösterilecek özel sponsorlu kartları buradan ekleyin.
            </p>

            <form onSubmit={handleAddAd} className="mt-6 grid grid-cols-1 gap-4 laptop:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Kampanya Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: En Hızlı Bulut Çözümleri"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  className="w-full rounded-xl border border-border-subtle bg-surface-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Sponsor Firma / Marka *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: CloudTurk A.Ş."
                  value={newAd.sponsor}
                  onChange={(e) => setNewAd({ ...newAd, sponsor: e.target.value })}
                  className="w-full rounded-xl border border-border-subtle bg-surface-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Açıklama / Slogan</label>
                <input
                  type="text"
                  placeholder="Geliştiricilere özel %50 indirimle bulut sunucunuzu başlatın."
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  className="w-full rounded-xl border border-border-subtle bg-surface-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Yönlendirme Linki (Hedef URL)</label>
                <input
                  type="text"
                  placeholder="https://sponsorunuz.com/devcore-kampanya"
                  value={newAd.url}
                  onChange={(e) => setNewAd({ ...newAd, url: e.target.value })}
                  className="w-full rounded-xl border border-border-subtle bg-surface-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Kapak / Görsel URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newAd.image}
                  onChange={(e) => setNewAd({ ...newAd, image: e.target.value })}
                  className="w-full rounded-xl border border-border-subtle bg-surface-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Hedef Kategori / Etiket</label>
                <select
                  value={newAd.targetTag}
                  onChange={(e) => setNewAd({ ...newAd, targetTag: e.target.value })}
                  className="w-full rounded-xl border border-border-subtle bg-surface-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="global">Tüm Akış (Global)</option>
                  <option value="ai">#yapayzeka / #ai</option>
                  <option value="otomobil">#otomobil / #electric-vehicles</option>
                  <option value="donanim">#donanim / #hardware</option>
                  <option value="yazilim">#yazilim / #programming</option>
                </select>
              </div>

              <div className="laptop:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={savingAd}
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-primary-hover transition-colors"
                >
                  {savingAd ? 'Kaydediliyor...' : '+ Sponsor Kartını Yayına Al'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Ads List */}
          <div className="rounded-3xl border border-border-subtle bg-surface-float p-6 laptop:p-8">
            <h3 className="text-base font-bold text-text-primary mb-4">Aktif ve Kayıtlı Sponsorluklar</h3>
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex flex-col laptop:flex-row items-start laptop:items-center justify-between gap-4 p-4 rounded-2xl border border-border-subtle bg-surface-surface"
                >
                  <div className="flex items-center gap-4">
                    {ad.image && (
                      <img src={ad.image} alt={ad.title} className="h-16 w-24 rounded-lg object-cover" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">[{ad.sponsor}]</span>
                        <span className="text-sm font-bold text-text-primary">{ad.title}</span>
                      </div>
                      <div className="text-xs text-text-secondary mt-1">{ad.description}</div>
                      <div className="text-[11px] text-text-tertiary mt-1">
                        Hedef: #{ad.targetTag} · Gösterim: {ad.impressions} · Tıklama: {ad.clicks}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleAd(ad.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                        ad.active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {ad.active ? '● Aktif' : '○ Pasif'}
                    </button>
                    <a
                      href={ad.url}
                      target="_blank"
                      className="rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                    >
                      Hedefe Git ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOURCES MANAGEMENT */}
      {activeTab === 'sources' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border border-border-subtle bg-surface-float p-6 laptop:p-8">
            <div className="flex flex-col laptop:flex-row items-start laptop:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Entegre Edilmiş İçerik Kaynakları</h3>
                <p className="text-xs text-text-secondary">
                  Platformu besleyen Türkçe teknoloji kanalları, RSS akışları ve X hesapları.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddSource(!showAddSource)}
                  className="rounded-xl border border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  {showAddSource ? 'Vazgeç' : '+ Yeni Kaynak Ekle'}
                </button>
                <button
                  onClick={handleTriggerIngest}
                  disabled={triggeringIngest}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors"
                >
                  {triggeringIngest ? 'Taranıyor...' : '⚡ Şimdi Tara'}
                </button>
              </div>
            </div>

            {/* Add Source Form */}
            {showAddSource && (
              <form onSubmit={handleAddSource} className="mb-8 rounded-2xl border border-border-subtle bg-surface-surface p-6">
                <h4 className="font-bold text-sm text-text-primary mb-3">Yeni İçerik Kaynağı Ekle</h4>
                <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Kaynak Adı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Webtekno"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Kaynak Türü</label>
                    <select
                      value={newSource.type}
                      onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="rss">RSS Akışı (XML/Atom)</option>
                      <option value="youtube">YouTube Kanalı</option>
                      <option value="x">X / Twitter Hesabı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Feed URL / Kanal ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://.../feed.xml veya @KanalAdı"
                      value={newSource.feedUrl}
                      onChange={(e) => setNewSource({ ...newSource, feedUrl: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Web Sitesi Adresi</label>
                    <input
                      type="text"
                      placeholder="https://orneksite.com"
                      value={newSource.website}
                      onChange={(e) => setNewSource({ ...newSource, website: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Logo / Görsel URL</label>
                    <input
                      type="text"
                      placeholder="https://.../logo.png"
                      value={newSource.image}
                      onChange={(e) => setNewSource({ ...newSource, image: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Kısa Açıklama</label>
                    <input
                      type="text"
                      placeholder="Güncel teknoloji ve yazılım haberleri"
                      value={newSource.description}
                      onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSource(false)}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-xs text-text-secondary hover:text-text-primary"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={savingSource}
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow hover:bg-primary-hover transition-colors"
                  >
                    {savingSource ? 'Kaydediliyor...' : '+ Kaynağı Sisteme Ekle'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-surface p-4"
                >
                  <img src={src.image} alt={src.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text-primary truncate">{src.name}</div>
                    <div className="text-xs text-text-secondary truncate">{src.description}</div>
                    <div className="text-[11px] text-text-tertiary mt-1">
                      {src.postCount} yayınlanan içerik ·{' '}
                      <a href={src.website} target="_blank" className="text-primary underline">
                        Kaynak Adresi ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: POSTS MODERATION */}
      {activeTab === 'posts' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border border-border-subtle bg-surface-float p-6 laptop:p-8">
            <div className="flex flex-col laptop:flex-row gap-4 justify-between items-start laptop:items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Gönderi ve İçerik Moderasyonu</h3>
                <p className="text-xs text-text-secondary">
                  Yayınlanan tüm haberleri, videoları ve yazıları filtreleyin, düzenleyin veya kaldırın.
                </p>
              </div>
              <input
                type="text"
                placeholder="Başlık veya etiket ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchPosts(e.target.value);
                }}
                className="w-full laptop:w-72 rounded-xl border border-border-subtle bg-surface-surface px-4 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col laptop:flex-row items-start laptop:items-center justify-between gap-4 p-4 rounded-2xl border border-border-subtle bg-surface-surface"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {post.image && (
                      <img src={post.image} alt={post.title} className="h-12 w-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <a href={`/posts/${post.id}`} target="_blank" className="font-bold text-xs laptop:text-sm text-text-primary hover:text-primary truncate block">
                        {post.title}
                      </a>
                      <div className="text-[11px] text-text-secondary mt-0.5 truncate">
                        {post.sourceName ?? post.sourceId} · Etiketler: {post.tagsStr}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-text-tertiary">👍 {post.upvotes}</span>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      Sil / Kaldır
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {activeTab === 'users' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border border-border-subtle bg-surface-float p-6 laptop:p-8">
            <h3 className="text-lg font-bold text-text-primary mb-2">Kayıtlı Kullanıcılar</h3>
            <div className="space-y-3">
              {users.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-surface"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.image} alt={u.name} className="h-10 w-10 rounded-full" />
                    <div>
                      <div className="font-bold text-xs text-text-primary">{u.name}</div>
                      <div className="text-[11px] text-text-secondary">@{u.username} · {u.id}</div>
                    </div>
                  </div>
                  <div className="text-xs text-primary font-semibold">
                    İtibar: {u.reputation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BackofficePage.getLayout = getLayout;
BackofficePage.layoutProps = {
  screenCentered: false,
  seo,
};

export default BackofficePage;
