import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, noindexSeoProps } from '../next-seo';
import ProtectedPage from '../components/ProtectedPage';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles('Takip ettiklerinize göre postları keşfedin');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Takip ettiğiniz kaynaklar, Squad\'lar ve kullanıcılardan gelen postları içeren kişiselleştirilmiş bir feed keşfedin. daily.dev ile ilgi alanlarınıza uygun içeriklerle güncel kalın.',
  ...noindexSeoProps,
};

const FollowingFeed = (): ReactElement => (
  <ProtectedPage>
    <></>
  </ProtectedPage>
);

FollowingFeed.getLayout = getMainFeedLayout;
FollowingFeed.layoutProps = { ...mainFeedLayoutProps, seo };

export default FollowingFeed;
