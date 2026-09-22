import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles('Kullanım Koşulları');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description: 'devcore.tr Kullanım Koşulları ve Hizmet Şartları.',
};

const TermsOfServicePage = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <div className="mx-auto max-w-4xl px-4 py-8 text-text-primary">
        <h1 className="mb-6 font-bold text-3xl">Kullanım Koşulları</h1>
        <div className="space-y-6 text-text-secondary leading-relaxed">
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">1. Hizmet Şartlarının Kabulü</h2>
            <p>
              devcore.tr platformuna erişerek veya kullanarak, bu Kullanım Koşulları'nı ve Gizlilik Politikamızı
              kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız lütfen platformu kullanmayınız.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">2. Platformun Amacı ve İçerik</h2>
            <p>
              devcore.tr, Türk yazılımcı ve geliştirici topluluğuna yönelik içerik paylaşımı, teknik tartışmalar ve
              geliştirici akışını bir araya getiren bir platformdur. Kullanıcılar paylaştıkları içeriklerin doğruluğundan
              ve telif haklarına uygunluğundan kendileri sorumludur.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">3. Hesap Güvenliği</h2>
            <p>
              Platforma Google, GitHub veya e-posta ile kayıt olabilirsiniz. Hesabınızın güvenliğini sağlamak sizin
              sorumluluğunuzdadır.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">4. İletişim</h2>
            <p>
              Kullanım koşullarıyla ilgili sorularınız için iletişim sayfamızdan bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

TermsOfServicePage.getLayout = getMainFeedLayout;
TermsOfServicePage.layoutProps = { ...mainFeedLayoutProps, seo };

export default TermsOfServicePage;
