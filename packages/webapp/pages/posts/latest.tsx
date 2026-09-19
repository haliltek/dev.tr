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

const seoTitles = getPageSeoTitles('Tüm konularda en yeni geliştirici postları');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Dünya genelindeki geliştiricilerin en yeni postlarını keşfedin. Kodlama, geliştirici araçları, teknoloji trendleri ve daha fazlasıyla güncel kalın.',
};

const PostsLatest = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsLatest.getLayout = getMainFeedLayout;
PostsLatest.layoutProps = { ...mainFeedLayoutProps, seo };

export default PostsLatest;
