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

const seoTitles = getPageSeoTitles('Gizlilik Politikası');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description: 'devcore.tr Gizlilik ve Çerez Politikası.',
};

const PrivacyPolicyPage = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <div className="mx-auto max-w-4xl px-4 py-8 text-text-primary">
        <h1 className="mb-6 font-bold text-3xl">Gizlilik Politikası</h1>
        <div className="space-y-6 text-text-secondary leading-relaxed">
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">1. Toplanan Bilgiler</h2>
            <p>
              devcore.tr olarak kullanıcılarımızın gizliliğine önem veriyoruz. Google veya GitHub ile giriş yaptığınızda
              yalnızca temel profil bilgileriniz (ad, e-posta, profil fotoğrafı) hesabınızı oluşturmak amacıyla alınır.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">2. Çerezler ve Yerel Depolama</h2>
            <p>
              Platform, oturumunuzu açık tutmak, kullanıcı tercihlerinizi (tema vb.) saklamak ve deneyiminizi geliştirmek
              için çerezleri ve yerel tarayıcı depolamasını kullanır.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">3. Veri Güvenliği</h2>
            <p>
              Kişisel bilgileriniz üçüncü şahıslara satılmaz veya ticari amaçlarla paylaşılmaz. Verileriniz endüstri standardı
              güvenlik önlemleriyle korunmaktadır.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-xl text-text-primary">4. İletişim</h2>
            <p>
              Gizlilik politikamız ile ilgili her türlü soru veya veri talebiniz için destek kanallarımız üzerinden
              bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

PrivacyPolicyPage.getLayout = getMainFeedLayout;
PrivacyPolicyPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default PrivacyPolicyPage;
