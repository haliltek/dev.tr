import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type {
  LoggedUser,
  PublicProfile,
  UserShortProfile,
} from '../../lib/user';
import {
  BlockIcon,
  FlagIcon,
  GiftIcon,
  MedalBadgeIcon,
  MenuIcon as DotsIcon,
} from '../icons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { ReferralCampaignKey } from '../../lib';
import { FollowButton } from '../contentPreference/FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import CustomFeedOptionsMenu from '../CustomFeedOptionsMenu';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { MenuIcon } from '../MenuIcon';
import { AwardButton } from '../award/AwardButton';
import { Tooltip } from '../tooltip/Tooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import type { MenuItemProps } from '../dropdown/common';

export interface HeaderProps {
  user: PublicProfile;
  isPreviewMode?: boolean;
}

const ProfileActions = ({ user, isPreviewMode }: HeaderProps): ReactElement => {
  const { user: loggedUser } = useAuthContext();
  const { openModal } = useLazyModal();
  const { follow, unfollow } = useContentPreference();
  const router = useRouter();
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
  });
  const { unblock, block } = useContentPreference();
  const { logSubscriptionEvent } = usePlusSubscription();
  const canAward = useCanAwardUser({
    sendingUser: loggedUser,
    receivingUser: user as LoggedUser,
  });

  const onReportUser = React.useCallback(
    (defaultBlocked = false) => {
      openModal({
        type: LazyModal.ReportUser,
        props: {
          offendingUser: {
            id: user.id,
            username: user.username,
          },
          defaultBlockUser: defaultBlocked,
        },
      });
    },
    [user, openModal],
  );

  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;

  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={BlockIcon} />,
      label: `${blocked ? 'Engeli Kaldır' : 'Engelle'} ${user.username}`,
      action: () =>
        blocked
          ? unblock({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username,
            })
          : block({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username,
            }),
    },
    {
      icon: <MenuIcon Icon={FlagIcon} />,
      label: 'Bildir',
      action: () => onReportUser(),
    },
  ];

  if (!blocked && !user.isPlus) {
    options.push({
      icon: <MenuIcon Icon={GiftIcon} />,
      label: 'daily.dev Plus hediye et',
      action: () => {
        logSubscriptionEvent({
          event_name: LogEvent.GiftSubscription,
          target_id: TargetId.ProfilePage,
        });
        openModal({
          type: LazyModal.GiftPlus,
          props: { preselected: user as UserShortProfile },
        });
      },
    });
  }

  if (isPreviewMode) {
    return (
      <div className="flex h-12 items-center">
        <Tooltip content="Yalnızca önizleme amaçlıdır" delayDuration={0}>
          <div className="flex flex-row gap-2">
            <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
              Takip Et
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              color={ButtonColor.Cabbage}
              icon={<MedalBadgeIcon secondary />}
            >
              Ödül Ver
            </Button>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<DotsIcon />}
              aria-label="Seçenekler"
            />
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex h-12 items-center">
      <div className="flex flex-row gap-2">
        {!blocked && (
          <FollowButton
            entityId={user.id}
            variant={ButtonVariant.Primary}
            type={ContentPreferenceType.User}
            status={contentPreference?.status}
            entityName={`@${user.username}`}
            className="flex-row-reverse"
            alwaysShow
          />
        )}
        {canAward && (
          <AwardButton
            type="USER"
            copy="Ödül Ver"
            entity={{
              id: user.id,
              receiver: user,
            }}
            variant={ButtonVariant.Secondary}
          />
        )}
        <CustomFeedOptionsMenu
          buttonVariant={ButtonVariant.Tertiary}
          onAdd={(feedId) =>
            follow({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username,
              feedId,
            })
          }
          onUndo={(feedId) =>
            unfollow({
              id: user.id,
              entity: ContentPreferenceType.User,
              entityName: user.username,
              feedId,
            })
          }
          onCreateNewFeed={() =>
            router.push(
              `/feeds/new?entityId=${user.id}&entityType=${ContentPreferenceType.User}`,
            )
          }
          shareProps={{
            text: `${user.name} kullanıcısının daily.dev profiline göz at`,
            link: user.permalink,
            cid: ReferralCampaignKey.ShareProfile,
            logObject: () => ({
              event_name: LogEvent.ShareProfile,
              target_id: user.id,
            }),
          }}
          additionalOptions={options}
        />
      </div>
    </div>
  );
};

export default ProfileActions;
