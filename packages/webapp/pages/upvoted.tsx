import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles('Geliştiriciler için en çok upvote alan postlar');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'daily.dev üzerinde en çok upvote alan geliştirici postlarını keşfedin. Dünyanın en büyük geliştirici ağından kodlama, eğitim ve teknoloji haberlerini takip edin.',
};

const Upvoted = (): ReactElement => <></>;

Upvoted.getLayout = getMainFeedLayout;
Upvoted.layoutProps = { ...mainFeedLayoutProps, seo };

export default Upvoted;
