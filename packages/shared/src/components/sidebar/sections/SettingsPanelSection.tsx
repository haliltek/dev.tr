import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  AddUserIcon,
  AppIcon,
  BellIcon,
  BlockIcon,
  CreditCardIcon,
  EditIcon,
  EmbedIcon,
  EyeIcon,
  FeatherIcon,
  HashtagIcon,
  InviteIcon,
  JobIcon,
  MagicIcon,
  MailIcon,
  NewTabIcon,
  OrganizationIcon,
  TerminalIcon,
  TourIcon,
  TrendingIcon,
  UserIcon,
} from '../../icons';
import { GraduationIcon } from '../../icons/Graduation';
import { MedalIcon } from '../../icons/Medal';
import { VolunteeringIcon } from '../../icons/Volunteering';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { settingsUrl } from '../../../lib/constants';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';
import { useJobsFeature } from '../../../hooks/useJobsFeature';

const settingsDefaultPath = `${settingsUrl}/profile`;

type SettingsGroup = {
  key: string;
  title?: string;
  items: SidebarMenuItem[];
};

export const SettingsPanelSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { isJobsEnabled } = useJobsFeature();

  const groups: SettingsGroup[] = useMemo(
    () => [
      {
        key: 'main',
        items: [
          {
            title: 'Profil detayları',
            path: settingsDefaultPath,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <UserIcon secondary={active} />} />
            ),
          },
          {
            title: 'Hesap ve Güvenlik',
            path: `${settingsUrl}/security`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MailIcon secondary={active} />} />
            ),
          },
          {
            title: 'Bildirimler',
            path: `${settingsUrl}/notifications`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <BellIcon secondary={active} />} />
            ),
          },
          ...(isJobsEnabled
            ? [
                {
                  title: 'Job preferences',
                  path: `${settingsUrl}/job-preferences`,
                  icon: (active: boolean) => (
                    <ListIcon Icon={() => <JobIcon secondary={active} />} />
                  ),
                  action: () =>
                    logEvent({
                      event_name: LogEvent.ClickCandidatePreferences,
                      target_id: TargetId.ProfileSettingsMenu,
                    }),
                },
              ]
            : []),
          {
            title: 'Görünüm',
            path: `${settingsUrl}/appearance`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <NewTabIcon secondary={active} />} />
            ),
          },
          {
            title: 'Paylaşım',
            path: `${settingsUrl}/composition`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <FeatherIcon secondary={active} />} />
            ),
          },
          {
            title: 'Arkadaşlarını Davet Et',
            path: `${settingsUrl}/invite`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <InviteIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'feed',
        title: 'Akış ayarları',
        items: [
          {
            title: 'Genel',
            path: `${settingsUrl}/feed/general`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <EditIcon secondary={active} />} />
            ),
          },
          {
            title: 'Etiketler',
            path: `${settingsUrl}/feed/tags`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
            ),
          },
          {
            title: 'İçerik kaynakları',
            path: `${settingsUrl}/feed/sources`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <AddUserIcon secondary={active} />} />
            ),
          },
          {
            title: 'İçerik tercihleri',
            path: `${settingsUrl}/feed/preferences`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <AppIcon secondary={active} />} />
            ),
          },
          {
            title: 'Yapay zeka özellikleri',
            path: `${settingsUrl}/feed/ai`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MagicIcon secondary={active} />} />
            ),
          },
          {
            title: 'Engellenen içerikler',
            path: `${settingsUrl}/feed/blocked`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <BlockIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'career',
        title: 'Kariyer',
        items: [
          {
            title: 'İş Deneyimi',
            path: `${settingsUrl}/profile/experience/work`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <JobIcon secondary={active} />} />
            ),
          },
          {
            title: 'Eğitim',
            path: `${settingsUrl}/profile/experience/education`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <GraduationIcon secondary={active} />} />
            ),
          },
          {
            title: 'Sertifikalar',
            path: `${settingsUrl}/profile/experience/certification`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MedalIcon secondary={active} />} />
            ),
          },
          {
            title: 'Açık Kaynak',
            path: `${settingsUrl}/profile/experience/opensource`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TerminalIcon secondary={active} />} />
            ),
          },
          {
            title: 'Projeler & Yayınlar',
            path: `${settingsUrl}/profile/experience/project`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TourIcon secondary={active} />} />
            ),
          },
          {
            title: 'Gönüllülük',
            path: `${settingsUrl}/profile/experience/volunteering`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <VolunteeringIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'gamification',
        title: 'Oyunlaştırma',
        items: [
          {
            // The streak settings live on this same combined page, so there's
            // no separate "Streaks" entry.
            title: 'Özellik görünürlüğü',
            path: `${settingsUrl}/customization/gamification`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <EyeIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'developers',
        title: 'Geliştiriciler',
        items: [
          {
            title: 'API Erişimi',
            path: `${settingsUrl}/api`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TerminalIcon secondary={active} />} />
            ),
          },
          {
            title: 'Entegrasyonlar',
            path: `${settingsUrl}/customization/integrations`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <EmbedIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'billing',
        title: 'Abonelik ve Ödemeler',
        items: [
          {
            title: 'Abonelikler',
            path: `${settingsUrl}/subscription`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <CreditCardIcon secondary={active} />} />
            ),
          },
          {
            title: 'Organizasyonlar',
            path: `${settingsUrl}/organization`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <OrganizationIcon secondary={active} />} />
            ),
          },
          {
            title: 'Ads dashboard',
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TrendingIcon secondary={active} />} />
            ),
            action: () => openModal({ type: LazyModal.AdsDashboard }),
          },
        ],
      },
    ],
    [isJobsEnabled, logEvent, openModal],
  );

  return (
    <>
      {groups.map((group) => (
        <Section
          {...defaultRenderSectionProps}
          key={group.key}
          title={group.title}
          items={group.items}
          isItemsButton={isItemsButton}
        />
      ))}
    </>
  );
};
