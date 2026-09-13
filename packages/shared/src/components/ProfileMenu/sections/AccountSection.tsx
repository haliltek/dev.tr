import React from 'react';
import type { ReactElement } from 'react';
import { ProfileSection } from '../ProfileSection';
import {
  CreditCardIcon,
  InviteIcon,
  SettingsIcon,
  TrendingIcon,
  OrganizationIcon,
} from '../../icons';
import { settingsUrl } from '../../../lib/constants';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useCanPurchaseCores } from '../../../hooks/useCoresFeature';
import type { ProfileSectionItemProps } from '../ProfileSectionItem';

export const AccountSection = (): ReactElement => {
  const { openModal } = useLazyModal();
  const canBuy = useCanPurchaseCores();

  const items: ProfileSectionItemProps[] = [
    {
      title: 'Ayarlar',
      href: `${settingsUrl}/profile`,
      icon: SettingsIcon,
    },
    {
      title: 'Abonelikler',
      href: `${settingsUrl}/subscription`,
      icon: CreditCardIcon,
    },
    {
      title: 'Organizasyonlar',
      href: `${settingsUrl}/organization`,
      icon: OrganizationIcon,
    },
    {
      title: 'Arkadaşlarını davet et',
      href: `${settingsUrl}/invite`,
      icon: InviteIcon,
    },
  ];

  if (canBuy) {
    items.push({
      title: 'Ads dashboard',
      icon: TrendingIcon,
      onClick: () => {
        openModal({ type: LazyModal.AdsDashboard });
      },
    });
  }

  return <ProfileSection items={items} />;
};
