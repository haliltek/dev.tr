import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  AddUserIcon,
  BellIcon,
  EditIcon,
  DevCardIcon,
  EmbedIcon,
  DocsIcon,
  FeedbackIcon,
  AppIcon,
  PrivacyIcon,
  MegaphoneIcon,
  UserIcon,
  BlockIcon,
  CoinIcon,
  CreditCardIcon,
  HashtagIcon,
  HotIcon,
  InviteIcon,
  MagicIcon,
  MailIcon,
  EyeIcon,
  NewTabIcon,
  PhoneIcon,
  ReputationLightningIcon,
  ExitIcon,
  OrganizationIcon,
  TrendingIcon,
  JobIcon,
  TerminalIcon,
  TourIcon,
  FeatherIcon,
  JoystickIcon,
} from '../icons';
import { NavDrawer } from '../drawers/NavDrawer';
import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  reputation,
  settingsUrl,
  walletUrl,
  webappUrl,
} from '../../lib/constants';

import type {
  ProfileSectionItemProps,
  ProfileSectionItemPropsWithoutHref,
} from '../ProfileMenu/ProfileSectionItem';
import { ProfileSection } from '../ProfileMenu/ProfileSection';
import { LogoutReason } from '../../lib/user';
import { logout, useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { WithClassNameProps } from '../utilities';
import { HorizontalSeparator } from '../utilities';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { ProfileMenuHeader } from '../ProfileMenu/ProfileMenuHeader';
import { ProfileImageSize } from '../ProfilePicture';
import { useViewSize, ViewSize } from '../../hooks';
import { TypographyColor, TypographyType } from '../typography/Typography';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { VolunteeringIcon } from '../icons/Volunteering';
import { GraduationIcon } from '../icons/Graduation';
import { MedalBadgeIcon } from '../icons/MedalBadge';
import { MedalIcon } from '../icons/Medal';
import { useJobsFeature } from '../../hooks/useJobsFeature';

type MenuItems = Record<
  string,
  {
    title: string | null;
    items: Record<string, ProfileSectionItemProps>;
  }
>;

const defineMenuItems = <T extends MenuItems>(items: T): T => items;

const useAccountPageItems = ({ onClose }: { onClose?: () => void } = {}) => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { optOutAchievements, optOutLevelSystem, optOutQuestSystem } =
    useSettingsContext();
  const { isJobsEnabled } = useJobsFeature();
  const shouldHideGameCenter =
    optOutAchievements && optOutLevelSystem && optOutQuestSystem;

  const items = useMemo(
    () =>
      defineMenuItems({
        main: {
          title: null,
          items: {
            profile: {
              title: 'Profil ayrıntıları',
              icon: UserIcon,
              href: `${settingsUrl}/profile`,
            },
            account: {
              title: 'Hesap & Güvenlik',
              icon: MailIcon,
              href: `${settingsUrl}/security`,
            },
            notifications: {
              title: 'Bildirimler',
              icon: BellIcon,
              href: `${settingsUrl}/notifications`,
            },
            ...(isJobsEnabled
              ? {
                  'job-preferences': {
                    title: 'İş tercihleri',
                    icon: JobIcon,
                    href: `${settingsUrl}/job-preferences`,
                    onClick: () => {
                      logEvent({
                        event_name: LogEvent.ClickCandidatePreferences,
                        target_id: TargetId.ProfileSettingsMenu,
                      });
                    },
                  },
                }
              : {}),
            appearance: {
              title: 'Görünüm',
              icon: NewTabIcon,
              href: `${settingsUrl}/appearance`,
            },
            composition: {
              title: 'Post Paylaşımı',
              icon: FeatherIcon,
              href: `${settingsUrl}/composition`,
            },
            invite: {
              title: 'Arkadaşlarını Davet Et',
              icon: InviteIcon,
              href: `${settingsUrl}/invite`,
            },
          },
        },
        feed: {
          title: 'Feed ayarları',
          items: {
            general: {
              title: 'Genel',
              icon: EditIcon,
              href: `${settingsUrl}/feed/general`,
            },
            tags: {
              title: 'Etiketler',
              icon: HashtagIcon,
              href: `${settingsUrl}/feed/tags`,
            },
            sources: {
              title: 'İçerik kaynakları',
              icon: AddUserIcon,
              href: `${settingsUrl}/feed/sources`,
            },
            preferences: {
              title: 'İçerik tercihleri',
              icon: AppIcon,
              href: `${settingsUrl}/feed/preferences`,
            },
            ai: {
              title: 'Yapay zeka güçleri',
              icon: MagicIcon,
              href: `${settingsUrl}/feed/ai`,
            },
            blocked: {
              title: 'Engellenen içerikler',
              icon: BlockIcon,
              href: `${settingsUrl}/feed/blocked`,
            },
          },
        },
        career: {
          title: 'Kariyer',
          items: {
            work: {
              title: 'İş Deneyimi',
              icon: JobIcon,
              href: `${settingsUrl}/profile/experience/work`,
            },
            education: {
              title: 'Eğitim',
              icon: GraduationIcon,
              href: `${settingsUrl}/profile/experience/education`,
            },
            certification: {
              title: 'Sertifikalar',
              icon: MedalIcon,
              href: `${settingsUrl}/profile/experience/certification`,
            },
            openSource: {
              title: 'Open Source',
              icon: TerminalIcon,
              href: `${settingsUrl}/profile/experience/opensource`,
            },
            project: {
              title: 'Projeler & Yayınlar',
              icon: TourIcon,
              href: `${settingsUrl}/profile/experience/project`,
            },
            volunteering: {
              title: 'Gönüllülük',
              icon: VolunteeringIcon,
              href: `${settingsUrl}/profile/experience/volunteering`,
            },
          },
        },
        playground: {
          title: 'Oyunlaştırma',
          items: {
            ...(!shouldHideGameCenter && {
              gameCenter: {
                title: 'Game Center',
                icon: JoystickIcon,
                href: `${webappUrl}game-center`,
                external: true,
              },
            }),
            gamification: {
              title: 'Özellik görünürlüğü',
              icon: EyeIcon,
              href: `${settingsUrl}/customization/gamification`,
            },
            ...(!optOutAchievements && {
              achievements: {
                title: 'Başarımlar',
                icon: MedalBadgeIcon,
                href: `${webappUrl}${user?.username}/achievements`,
                external: true,
              },
            }),
            hotTakes: {
              title: 'Hot Takes',
              icon: HotIcon,
              href: `${webappUrl}?openModal=hottakes`,
              external: true,
              onClick: () => {
                logEvent({ event_name: LogEvent.OpenHotAndCold });
                onClose?.();
              },
            },
            devcard: {
              title: 'DevCard',
              icon: DevCardIcon,
              href: `${settingsUrl}/customization/devcard`,
            },
          },
        },
        customization: {
          title: 'Geliştiriciler',
          items: {
            api: {
              title: 'API Erişimi',
              icon: TerminalIcon,
              href: `${settingsUrl}/api`,
            },
            integrations: {
              title: 'Entegrasyonlar',
              icon: EmbedIcon,
              href: `${settingsUrl}/customization/integrations`,
            },
          },
        },
        billing: {
          title: 'Faturalandırma ve Kazanç',
          items: {
            subscription: {
              title: 'Abonelikler',
              icon: CreditCardIcon,
              href: `${settingsUrl}/subscription`,
            },
            organization: {
              title: 'Organizasyonlar',
              icon: OrganizationIcon,
              href: `${settingsUrl}/organization`,
            },
            coreWallet: {
              title: 'Core Wallet',
              icon: CoinIcon,
              href: walletUrl,
              external: true,
            },
            adsDashboard: {
              title: 'Reklam paneli',
              icon: TrendingIcon,
              onClick: () => openModal({ type: LazyModal.AdsDashboard }),
            } as ProfileSectionItemPropsWithoutHref,
          },
        },
        help: {
          title: 'Yardım merkezi',
          items: {
            feedback: {
              title: 'Geri Bildiriminiz',
              icon: FeedbackIcon,
              href: `${settingsUrl}/feedback`,
            },
            privacy: {
              title: 'Gizlilik',
              icon: PrivacyIcon,
              href: `${settingsUrl}/privacy`,
            },
            reputation: {
              title: 'Reputasyon',
              icon: ReputationLightningIcon,
              href: reputation,
              external: true,
            },
            docs: {
              title: 'Dokümanlar',
              icon: DocsIcon,
              href: docs,
              external: true,
            },
          },
        },
        logout: {
          title: null,
          items: {
            logout: {
              title: 'Çıkış yap',
              icon: ExitIcon,
              onClick: () => logout(LogoutReason.ManualLogout),
            },
          },
        },
      }),
    [
      logEvent,
      onClose,
      openModal,
      user?.username,
      optOutAchievements,
      shouldHideGameCenter,
      isJobsEnabled,
    ],
  );

  return { items };
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  shouldKeepOpen?: boolean;
}

export const InnerProfileSettingsMenu = ({
  className,
  onClose,
}: WithClassNameProps & { onClose?: () => void }) => {
  const { asPath } = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);
  const hasAccessToCores = useHasAccessToCores();
  const { items: accountPageItems } = useAccountPageItems({ onClose });

  return (
    <nav className={classNames('flex flex-col gap-2', className)}>
      {Object.entries(accountPageItems).map(([key, menuItem], index, arr) => {
        const lastItem = index === arr.length - 1;

        return (
          <ProfileSection
            key={key}
            withSeparator={!lastItem}
            title={menuItem.title ?? undefined}
            items={Object.entries(menuItem.items)
              .filter(([, item]) => {
                if (item.href === walletUrl && !hasAccessToCores) {
                  return false;
                }

                return true;
              })
              .map(([, item]: [string, ProfileSectionItemProps]) => {
                return {
                  ...item,
                  isActive: asPath === item.href,
                  ...(isMobile && {
                    typography: {
                      type: TypographyType.Body,
                      color: TypographyColor.Secondary,
                    },
                  }),
                };
              })}
          />
        );
      })}
    </nav>
  );
};

export function ProfileSettingsMenuMobile({
  isOpen,
  onClose,
  shouldKeepOpen,
}: ProfileSettingsMenuProps): ReactElement {
  return (
    <NavDrawer
      header="Ayarlar"
      shouldKeepOpen={shouldKeepOpen}
      drawerProps={{
        isOpen,
        onClose: onClose ?? (() => {}),
      }}
    >
      <InnerProfileSettingsMenu className="p-4" onClose={onClose} />
    </NavDrawer>
  );
}

export function ProfileSettingsMenuDesktop(): ReactElement | null {
  const { user } = useAuthContext();
  const featureTheme = useFeatureTheme();

  if (!user) {
    return null;
  }

  return (
    <aside
      className={classNames(
        'ml-auto flex min-h-full flex-col gap-2 self-start rounded-16 border border-border-subtlest-tertiary p-2 tablet:w-64',
        featureTheme ? 'bg-transparent' : undefined,
      )}
    >
      <ProfileMenuHeader
        className="rounded-10 px-1 hover:bg-theme-active"
        shouldOpenProfile
        profileImageSize={ProfileImageSize.Medium}
      />

      <HorizontalSeparator />

      <InnerProfileSettingsMenu />
    </aside>
  );
}
