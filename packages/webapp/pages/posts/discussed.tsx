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

const seoTitles = getPageSeoTitles('En çok tartışılan geliştirici postları');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'En çok tartışılan postlarla sohbete katılın. Geliştiriciler arasındaki en hararetli tartışmaları ve fikir paylaşımlarını görün.',
};

const PostsDiscussed = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsDiscussed.getLayout = getMainFeedLayout;
PostsDiscussed.layoutProps = { ...mainFeedLayoutProps, seo };

export default PostsDiscussed;
