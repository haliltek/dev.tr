import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import { USER_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import { cloudinaryCharmEmptyProfile } from '@dailydotdev/shared/src/lib/image';
import CommentFeed from '@dailydotdev/shared/src/components/CommentFeed';
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

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileCommentsPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement | null => {
  const { user: loggedUser } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const isSameUser = loggedUser?.id === user.id;
  const userId = user.id;

  const emptyScreen = isSameUser ? (
    <MyProfileEmptyScreen
      className="items-center px-4 py-6 text-center tablet:px-6"
      image={cloudinaryCharmEmptyProfile}
      imageAlt="Henüz yanıt verilmedi"
      text="Tüm testler ilk seferde geçti ve nedenini bilmiyor musun? Biraz mola ver. Feed'e göz at ve tartışmalara katıl!"
      cta="Postları keşfet"
      buttonProps={{ tag: 'a', href: '/' }}
    />
  ) : (
    <ProfileEmptyScreen
      image={cloudinaryCharmEmptyProfile}
      imageAlt="Henüz yanıt verilmedi"
      title={`${user?.name ?? 'Kullanıcı'} henüz hiçbir posta yanıt vermedi`}
      text="Yanıt verdiğinde, o yanıtlar burada görünecek."
    />
  );

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(
          `${user.name} (@${user.username}) yanıtları`,
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
          Yanıtlar
        </Typography>
      </GoBackHeaderMobile>
      <CommentFeed
        feedQueryKey={generateQueryKey(
          RequestKey.UserComments,
          undefined,
          userId,
        )}
        query={USER_COMMENTS_QUERY}
        logOrigin={Origin.Profile}
        variables={{ userId }}
        emptyScreen={emptyScreen}
        commentClassName={commentClassName}
      />
    </>
  );
};

ProfileCommentsPage.getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getProfileLayout(page, { ...props, pageHeaderTitle: 'Yanıtlar' });
export default ProfileCommentsPage;
