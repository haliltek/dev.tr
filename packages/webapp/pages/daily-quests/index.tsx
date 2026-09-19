import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import classNames from 'classnames';
import { QuestButton } from '@dailydotdev/shared/src/components/quest/QuestButton';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import {
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import ProtectedPage from '../../components/ProtectedPage';
import { defaultOpenGraph } from '../../next-seo';

const seoTitles = getPageSeoTitles("Günlük Quest'ler");
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    "Ödüller kazanmak, level atlamak ve serinizi devam ettirmek için günlük ve haftalık quest'lerinizi tamamlayın.",
  nofollow: true,
  noindex: true,
};

function DailyQuestsPage(): ReactElement {
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;

  return (
    <ProtectedPage>
      {isV2Laptop && <PageHeader title="Günlük Quest'ler" />}
      <div className="mx-auto w-full max-w-[42.5rem]">
        {!isV2Laptop && (
          <LayoutHeader
            className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
          >
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="flex-1"
            >
              Günlük Quest'ler
            </Typography>
          </LayoutHeader>
        )}
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pb-10">
          <QuestButton panelOnly />
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
}

const getDailyQuestsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DailyQuestsPage.getLayout = getDailyQuestsLayout;
DailyQuestsPage.layoutProps = { screenCentered: false, seo };

export default DailyQuestsPage;
