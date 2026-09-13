import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileSectionItem';
import {
  AnalyticsIcon,
  CoinIcon,
  DevCardIcon,
  MedalBadgeIcon,
  UserIcon,
} from '../../icons';
import { settingsUrl, walletUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';

export const MainSection = (): ReactElement => {
  const hasAccessToCores = useHasAccessToCores();
  const { user } = useAuthContext();

  const items: ProfileSectionItemProps[] = [
    {
      title: 'Profiliniz',
      href: `${webappUrl}${user?.username}`,
      icon: UserIcon,
    },
    ...(hasAccessToCores
      ? [
          {
            title: 'Core cüzdanı',
            href: walletUrl,
            icon: CoinIcon,
          } satisfies ProfileSectionItemProps,
        ]
      : []),
    {
      title: 'Başarımlar',
      href: `${webappUrl}${user?.username}/achievements`,
      icon: MedalBadgeIcon,
    },
    {
      title: 'DevCard',
      href: `${settingsUrl}/customization/devcard`,
      icon: DevCardIcon,
    },
    {
      title: 'Analitik',
      href: `${webappUrl}analytics`,
      icon: AnalyticsIcon,
    },
  ];

  return <ProfileSection items={items} />;
};
