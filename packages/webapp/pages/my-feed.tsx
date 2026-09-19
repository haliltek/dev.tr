import type { NextSeoProps } from 'next-seo';
import type { ReactElement } from 'react';
import React from 'react';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo, noindexSeoProps } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Senin İçin (For You)',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

const MyFeed = (): ReactElement => <></>;

MyFeed.getLayout = getMainFeedLayout;
MyFeed.layoutProps = { ...mainFeedLayoutProps, seo };

export default MyFeed;
