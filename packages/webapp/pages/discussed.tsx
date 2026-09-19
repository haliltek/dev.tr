import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles(
  'Geliştirici topluluğunda gerçek zamanlı tartışmalar',
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'daily.dev üzerindeki gerçek zamanlı geliştirici tartışmalarını takip edin. Şu anda süren sohbetlere katılın ve en aktif topluluk üyeleriyle etkileşime geçin.',
};

const Discussed = (): ReactElement => <></>;

Discussed.getLayout = getMainFeedLayout;
Discussed.layoutProps = { ...mainFeedLayoutProps, seo };

export default Discussed;
