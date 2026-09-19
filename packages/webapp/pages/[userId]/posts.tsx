import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import { link } from '@dailydotdev/shared/src/lib/links';
import { AUTHOR_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import type { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import { cloudinaryCharmNoPosts } from '@dailydotdev/shared/src/lib/image';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePostsPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement | null => {
  const { user: loggedUser } = useContext(AuthContext);
  const { shouldUseListFeedLayout } = useFeedLayout();

  if (!user) {
    return null;
  }

  const isSameUser = loggedUser?.id === user.id;
  const userId = user.id;
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', userId],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        image={cloudinaryCharmNoPosts}
        imageAlt="Henüz post paylaşılmadı"
        text="Bir developer olmanın en zor kısmı ne mi? Nereden başlasak... Haydi, düşüncelerini veya deneyimlerini toplulukla paylaş."
        cta="Yeni post"
        buttonProps={{ tag: 'a', href: link.post.create }}
      />
    ) : (
      <ProfileEmptyScreen
        image={cloudinaryCharmNoPosts}
        imageAlt="Henüz post paylaşılmadı"
        title={`${user?.name ?? 'Kullanıcı'} henüz bir post paylaşmadı`}
        text="Paylaşım yaptığında, o postlar burada görünecek."
      />
    ),
  };

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(`${user.name} (@${user.username}) postları`),
        noindex: true,
        nofollow: true,
      },
      noindex,
    ),
  };

  return (
    <>
      <NextSeo {...seo} />
      <GoBackHeaderMobile>
        <Typography bold type={TypographyType.Body}>
          Postlar
        </Typography>
      </GoBackHeaderMobile>
      <Feed
        {...feedProps}
        className={classNames('py-6', !shouldUseListFeedLayout && 'px-4')}
      />
    </>
  );
};

ProfilePostsPage.getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode => getProfileLayout(page, { ...props, pageHeaderTitle: 'Postlar' });
export default ProfilePostsPage;
