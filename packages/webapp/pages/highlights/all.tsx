import type { GetStaticPropsResult } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import {
  highlightsPageQueryOptions,
  postHighlightsFeedQueryOptions,
} from '@dailydotdev/shared/src/graphql/highlights';
import { HighlightsPage } from '@dailydotdev/shared/src/components/highlights/HighlightsPage';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const HIGHLIGHTS_TITLE = 'Tüm öne çıkanlar | daily.dev';
const HIGHLIGHTS_DESCRIPTION =
  'Geliştirici ekosistemindeki tüm öne çıkanlar tek bir yerde. Her kanaldan en yeni içerikleri keşfedin.';

const AllHighlightsPage = (): ReactElement => <HighlightsPage />;

const getHighlightsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

AllHighlightsPage.getLayout = getHighlightsLayout;
AllHighlightsPage.layoutProps = {
  screenCentered: false,
  seo: {
    title: HIGHLIGHTS_TITLE,
    description: HIGHLIGHTS_DESCRIPTION,
    canonical: 'https://daily.dev/highlights/all',
    openGraph: {
      ...defaultOpenGraph,
      title: HIGHLIGHTS_TITLE,
      description: HIGHLIGHTS_DESCRIPTION,
      url: 'https://daily.dev/highlights/all',
      type: 'website',
    },
    ...defaultSeo,
  },
};

export default AllHighlightsPage;

interface AllHighlightsPageProps {
  dehydratedState: DehydratedState;
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<AllHighlightsPageProps>
> {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(highlightsPageQueryOptions()),
    queryClient.prefetchQuery(postHighlightsFeedQueryOptions()),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
}
