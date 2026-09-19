import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type {
  UserReadHistory,
  UserStreak,
  MostReadTag,
} from '../../../../graphql/users';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import { CalendarHeatmap } from '../../../../components/CalendarHeatmap';
import { migrateUserToStreaks } from '../../../../lib/constants';
import { ClickableText } from '../../../../components/buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  ReadingStreaksSection,
  ReadingTagsSection,
  HeatmapLegend,
  ReadingOverviewSkeleton,
} from './ReadingOverviewComponents';
import { anchorDefaultRel, pluralize } from '../../../../lib/strings';
import { largeNumberFormat } from '../../../../lib';

// Utility functions
const readHistoryToValue = (value: UserReadHistory): number => value.reads;

const readHistoryToTooltip = (
  value: UserReadHistory,
  date: Date,
): ReactNode => {
  const formattedDate = date.toLocaleString('tr-TR', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  if (!value?.reads) {
    return `${formattedDate} tarihinde okunan post yok`;
  }
  return (
    <>
      <strong>
        {value.reads} post okundu
      </strong>
      &nbsp;({formattedDate})
    </>
  );
};

export interface ReadingOverviewProps {
  readHistory?: UserReadHistory[];
  before: Date;
  after: Date;
  streak?: UserStreak;
  mostReadTags?: MostReadTag[];
  isLoading?: boolean;
}

export function ReadingOverview({
  readHistory,
  before,
  after,
  streak,
  mostReadTags,
  isLoading = false,
}: ReadingOverviewProps): ReactElement {
  const totalReads = useMemo(() => {
    if (!readHistory?.length) {
      return 0;
    }
    return readHistory.reduce((acc, val) => {
      const reads = val?.reads || 0;
      return acc + (typeof reads === 'number' && reads >= 0 ? reads : 0);
    }, 0);
  }, [readHistory]);

  if (isLoading) {
    return <ReadingOverviewSkeleton />;
  }

  return (
    <ActivityContainer>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center"
      >
        Okuma Özeti
      </Typography>
      <ClickableText
        tag="a"
        target="_blank"
        href={migrateUserToStreaks}
        rel={anchorDefaultRel}
      >
        Daha fazla bilgi
      </ClickableText>

      {!!streak && <ReadingStreaksSection streak={streak} />}
      {mostReadTags && mostReadTags?.length > 0 && (
        <ReadingTagsSection mostReadTags={mostReadTags} />
      )}
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
        className="mb-3"
      >
        Son aylarda okunan postlar
        {totalReads >= 0 && ` (${largeNumberFormat(totalReads)})`}
      </Typography>
      {Array.isArray(readHistory) && (
        <CalendarHeatmap
          startDate={after}
          endDate={before}
          values={readHistory}
          valueToCount={readHistoryToValue}
          valueToTooltip={readHistoryToTooltip}
        />
      )}
      <HeatmapLegend />
    </ActivityContainer>
  );
}
