import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import Head from 'next/head';
import { getLayout } from '../components/layouts/MainLayout';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph } from '../next-seo';

const seoTitles = getPageSeoTitles('Devcore.tr Reklam ve Sponsorluk Çözümleri');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    "Devcore.tr ile Türkiye'nin en nitelikli yazılımcı, mühendis ve teknoloji liderlerine ulaşın. Doğal akış içi reklamlar ve etiket sponsorlukları.",
};

const STATS = [
  { value: '10.000+', label: 'Aylık Geliştirici Etkileşimi', icon: '⚡' },
  { value: '%85+', label: 'Yazılım ve Teknoloji Profesyoneli', icon: '🎯' },
  { value: '1.200+', label: 'Aktif Teknoloji ve Mühendislik Konusu', icon: '🏷️' },
  { value: '%3.8', label: 'Ortalama Doğal Tıklanma Oranı (CTR)', icon: '📈' },
];

const FORMATS = [
  {
    id: 'feed',
    title: 'Akış İçi Sponsorlu Kart (Promoted Story)',
    tag: 'En Popüler',
    description:
      'Kullanıcıların günlük takip ettiği ana akış veya konu sayfalarında doğal içerik görünümünde yer alan, yüksek etkileşimli reklam kartı.',
    features: [
      'Görsel, başlık, açıklama ve doğrudan CTA butonu',
      'Etiket ve teknoloji bazlı hedefleme (Örn: #ai, #otomobil)',
      'Detaylı gösterim ve tıklama analitiği',
    ],
  },
  {
    id: 'tag',
    title: 'Konu ve Kategori Sponsorluğu (Tag Takeover)',
    tag: 'Yüksek Hedefleme',
    description:
      'Belirli bir teknoloji konusunun (örneğin #yapayzeka veya #donanim) en tepesinde markanıza özel kalıcı yerleşim.',
    features: [
      'Etiket sayfasında tepe banner ve sabit sponsor konumu',
      'Tam ilgili niş geliştirici kitlesine 100% odak',
      'Marka bilinirliği ve liderlik konumu',
    ],
  },
  {
    id: 'spotlight',
    title: 'Özel Spotlight & Bülten Yerleşimi',
    tag: 'Maksimum Erişim',
    description:
      'Geliştirici bültenlerinde, bildirimlerde ve platformun öne çıkan duyuru alanlarında markanızı veya ürün lansmanınızı duyurun.',
    features: [
      'Topluluk bülteninde öne çıkan sponsor bölümü',
      'Yeni ürün lansmanları ve işe alım (Hiring) kampanyaları',
      'Sosyal medya ve topluluk kanallarında çapraz tanıtım',
    ],
  },
];

const ReklamPage = (): ReactElement => {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    format: 'feed',
    budget: '5.000₺ - 15.000₺',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 text-text-primary laptop:px-8">
      <Head>
        <title>Reklam ve Sponsorluk | devcore.tr</title>
      </Head>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-surface-float via-surface-surface to-surface-ground p-8 laptop:p-14 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Devcore.tr Partner & Sponsorluk Programı
        </div>

        <h1 className="mt-6 font-extrabold tracking-tight typo-title1 text-3xl laptop:text-5xl max-w-3xl leading-tight">
          Türkiye&apos;nin En Nitelikli <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Yazılımcı ve Teknoloji</span> Ekosistemine Ulaşın.
        </h1>

        <p className="mt-5 text-base laptop:text-xl text-text-secondary max-w-2xl leading-relaxed">
          Geliştiriciler, mühendisler ve teknoloji liderlerinin her gün takip ettiği devcore.tr akışında markanızı, ürünlerinizi ve kariyer fırsatlarınızı doğrudan hedef kitlenize duyurun.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all duration-200"
          >
            Sponsorluk Başvurusu Yap
          </a>
          <a
            href="#formats"
            className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-float px-6 py-3.5 text-sm font-semibold text-text-primary hover:bg-surface-hover transition-all duration-200"
          >
            Reklam Formatlarını İncele
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-12 grid grid-cols-2 gap-4 laptop:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-subtle bg-surface-float p-6 shadow-sm hover:border-border-default transition-colors"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div className="mt-3 font-extrabold text-2xl laptop:text-3xl text-text-primary">
              {stat.value}
            </div>
            <div className="mt-1 text-xs laptop:text-sm text-text-secondary">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Formats Section */}
      <div id="formats" className="mt-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-extrabold text-2xl laptop:text-4xl">
            Hedefinize Uygun Sponsorluk Formatları
          </h2>
          <p className="mt-3 text-text-secondary text-sm laptop:text-base">
            Geleneksel banner reklamlar yerine geliştiricilerin doğal içerik olarak tükettiği modern yerleşimler sunuyoruz.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 laptop:grid-cols-3">
          {FORMATS.map((fmt) => (
            <div
              key={fmt.id}
              className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-float p-7 shadow-sm hover:border-primary/50 transition-all"
            >
              <div>
                <div className="inline-block rounded-md bg-surface-tertiary px-3 py-1 text-xs font-semibold text-primary">
                  {fmt.tag}
                </div>
                <h3 className="mt-4 font-bold text-lg text-text-primary">
                  {fmt.title}
                </h3>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  {fmt.description}
                </p>
                <ul className="mt-6 space-y-2.5 text-xs laptop:text-sm text-text-secondary">
                  {fmt.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border-subtle">
                <a
                  href="#contact"
                  onClick={() => setFormData((prev) => ({ ...prev, format: fmt.id }))}
                  className="block w-full text-center rounded-xl bg-surface-tertiary py-2.5 text-xs font-semibold text-text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Bu Format İçin Bilgi Al
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="contact" className="mt-20 rounded-3xl border border-border-subtle bg-surface-float p-8 laptop:p-12 shadow-xl">
        <div className="grid grid-cols-1 gap-10 laptop:grid-cols-2">
          <div>
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase">
              Birlikte Büyüyelim
            </div>
            <h2 className="mt-4 font-extrabold text-2xl laptop:text-4xl text-text-primary">
              Sponsorluk Teklifi ve Medya Kiti Alın
            </h2>
            <p className="mt-4 text-text-secondary text-sm laptop:text-base leading-relaxed">
              Markanız, API ürünleriniz, SaaS aracınız veya açık pozisyonlarınız için en uygun kampanya kurgusunu birlikte planlayalım. Formu doldurduktan sonra 24 saat içinde detaylı medya kiti ve teklifimizle size ulaşıyoruz.
            </p>

            <div className="mt-8 space-y-4 text-sm text-text-secondary">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-tertiary text-primary">📧</span>
                <span>sponsor@devcore.tr</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-tertiary text-primary">📍</span>
                <span>İstanbul, Türkiye · Global Dev Core</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-surface p-6 laptop:p-8">
            {isSubmitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl">
                  ✓
                </div>
                <h3 className="mt-4 text-xl font-bold text-text-primary">
                  Talebiniz Başarıyla Alındı!
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  En geç 24 saat içinde medya kiti ve sponsorluk detayları ile belirttiğiniz e-posta adresine dönüş yapacağız.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-xs text-primary underline"
                >
                  Yeni bir talep oluştur
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Şirket veya Proje Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Örn: Acme Tech A.Ş."
                    className="w-full rounded-xl border border-border-subtle bg-surface-float px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Yetkili Adı Soyadı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ad Soyad"
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      İş E-postası *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ad@sirketiniz.com"
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      İlgilendiğiniz Format
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="feed">Akış İçi Sponsorlu Kart</option>
                      <option value="tag">Konu & Etiket Sponsorluğu</option>
                      <option value="spotlight">Spotlight & Bülten</option>
                      <option value="all">Kapsamlı Paket / Özel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Tahmini Bütçe
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full rounded-xl border border-border-subtle bg-surface-float px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="5.000₺ - 15.000₺">5.000₺ - 15.000₺</option>
                      <option value="15.000₺ - 35.000₺">15.000₺ - 35.000₺</option>
                      <option value="35.000₺+">35.000₺+</option>
                      <option value="custom">Özel Bütçe / Konuşalım</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Mesajınız veya Kampanya Hedefiniz
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tanıtmak istediğiniz ürün, hedef kitle veya özel istekleriniz..."
                    className="w-full rounded-xl border border-border-subtle bg-surface-float px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {loading ? 'Gönderiliyor...' : 'Sponsorluk Başvurusunu Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ReklamPage.getLayout = getLayout;
ReklamPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default ReklamPage;
