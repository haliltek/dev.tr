import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Trend geliştirici postlarını keşfedin');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Web genelindeki en popüler geliştirici postlarını keşfedin. Güncel tartışmalar ve derlenmiş içeriklerle devcore üzerinde daima önde olun.',
};

const Posts = (): ReactElement => {
  return <NextSeo {...seo} />;
};

Posts.getLayout = getMainFeedLayout;
Posts.layoutProps = { ...mainFeedLayoutProps, seo };

export default Posts;
