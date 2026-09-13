import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import {
  DocsIcon,
  FeedbackIcon,
  MegaphoneIcon,
  TerminalIcon,
} from '../../icons';
import {
  businessWebsiteUrl,
  docs,
  feedback,
  webappUrl,
} from '../../../lib/constants';

export const ResourceSection = (): ReactElement => {
  return (
    <ProfileSection
      items={[
        {
          title: 'Değişiklik Günlüğü',
          icon: TerminalIcon,
          href: `${webappUrl}sources/daily_updates`,
        },
        {
          title: 'Reklam',
          icon: MegaphoneIcon,
          href: businessWebsiteUrl,
          external: true,
        },
        {
          title: 'Dokümantasyon',
          icon: DocsIcon,
          href: docs,
          external: true,
        },
        {
          title: 'Destek',
          icon: FeedbackIcon,
          href: feedback,
          external: true,
        },
      ]}
    />
  );
};
