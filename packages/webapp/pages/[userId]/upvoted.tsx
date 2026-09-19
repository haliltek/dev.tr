import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import type { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { USER_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import { cloudinaryCharmEmptyProfile } from '@dailydotdev/shared/src/lib/image';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileUpvotedPage = ({
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
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', userId],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        image={cloudinaryCharmEmptyProfile}
        imageAlt="Henüz upvote verilmedi"
        text="Bitmek bilmeyen toplantılarda mısın? Zamanı iyi değerlendir: Beğendiğin postları keşfet ve upvote ver!"
        cta="Postları keşfet"
        buttonProps={{ tag: 'a', href: '/' }}
      />
    ) : (
      <ProfileEmptyScreen
        image={cloudinaryCharmEmptyProfile}
        imageAlt="Henüz upvote verilmedi"
        title={`${user?.name ?? 'Kullanıcı'} henüz bir posta upvote vermedi`}
        text="Upvote verdiğinde, o postlar burada görünecek."
      />
    ),
  };

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(
          `${user.name} (@${user.username}) tarafından upvote verilen postlar`,
        ),
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
          Upvote verilen postlar
        </Typography>
      </GoBackHeaderMobile>
      <Feed
        {...feedProps}
        className={classNames('py-6', !shouldUseListFeedLayout && 'px-4')}
      />
    </>
  );
};

ProfileUpvotedPage.getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getProfileLayout(page, { ...props, pageHeaderTitle: 'Upvote verilen postlar' });
export default ProfileUpvotedPage;
