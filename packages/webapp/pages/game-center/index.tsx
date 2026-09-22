import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { QuestCompletionStats } from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  HIGHEST_REPUTATION_QUERY,
  LeaderboardType,
  MOST_QUESTS_COMPLETED_QUERY,
  QUEST_COMPLETION_STATS_QUERY,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  ProductType,
  userProductSummaryQueryOptions,
} from '@dailydotdev/shared/src/graphql/njord';
import type { QuestType } from '@dailydotdev/shared/src/graphql/quests';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '@dailydotdev/shared/src/hooks/profile/useTrackedAchievement';
import { useClaimQuestReward } from '@dailydotdev/shared/src/hooks/useClaimQuestReward';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import { shouldShowAchievementTracker } from '@dailydotdev/shared/src/lib/achievements';
import { gameCenterMilestoneSectionId } from '@dailydotdev/shared/src/lib/constants';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import { achievementTrackingWidgetFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { fetchTopReaders } from '@dailydotdev/shared/src/lib/topReader';
import { getFirstName } from '@dailydotdev/shared/src/lib/user';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import {
  Divider,
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { AchievementCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementCard';
import { TopReaderBadge } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import {
  QuestLevelProgressCircle,
  getQuestLevelProgress,
} from '@dailydotdev/shared/src/components/quest/QuestLevelProgressCircle';
import { QuestSection } from '@dailydotdev/shared/src/components/quest/QuestButton';
import type { QuestDestination } from '@dailydotdev/shared/src/components/quest/QuestButton';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArrowIcon,
  CoreIcon,
  MedalBadgeIcon,
  PinIcon,
} from '@dailydotdev/shared/src/components/icons';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import ProtectedPage from '../../components/ProtectedPage';
import { defaultOpenGraph } from '../../next-seo';
import {
  getAchievementSummary,
  getAwardSummary,
  getBadgeSummary,
  getMostProgressedQuest,
  getTopReaderTopicLabel,
} from '../../lib/gameCenter';

type GameCenterPageProps = {
  highestReputation: UserLeaderboard[];
  mostQuestsCompleted: UserLeaderboard[];
  questCompletionStats: QuestCompletionStats | null;
};

type SectionProps = {
  title: string;
  description: string;
  action?: ReactElement;
};

const dividerClassName = 'bg-border-subtlest-tertiary';
const leaderboardLimit = 3;

const isQuestCompletionStatsSchemaMissing = (error: GraphQLError): boolean => {
  return (
    error?.response?.errors?.some(({ message }) =>
      message?.includes('Cannot query field "questCompletionStats"'),
    ) ?? false
  );
};

const formatQuestCompletionCount = (count: number): string => {
  return count === 1 ? '1 tamamlama' : `${count.toLocaleString()} tamamlama`;
};

const SectionHeader = ({
  title,
  description,
  action,
}: SectionProps): ReactElement => {
  return (
    <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
      <div className="flex flex-col gap-1">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </div>
      {action}
    </div>
  );
};

const EmptyStateCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement => {
  return (
    <div className="rounded-16 border border-dashed border-border-subtlest-tertiary bg-background-subtle p-5">
      <Typography type={TypographyType.Callout} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        {description}
      </Typography>
    </div>
  );
};

const StatPill = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="bg-background-default/70 rounded-14 border border-border-subtlest-tertiary px-4 py-3 backdrop-blur-sm">
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
    <Typography type={TypographyType.Callout} bold className="mt-1">
      {value}
    </Typography>
  </div>
);

const TrophyCard = ({
  name,
  image,
  count,
}: {
  name: string;
  image: string;
  count: number;
}): ReactElement => {
  return (
    <Tooltip content={name} side="top">
      <div
        role="listitem"
        className="hover:bg-background-default/70 flex flex-col items-center justify-center rounded-16 px-2 py-1 transition"
      >
        <LazyImage
          imgSrc={image}
          imgAlt={name}
          fit="contain"
          className="size-12 shrink-0"
        />
        <Typography type={TypographyType.Body} bold className="mt-2">
          x{count.toLocaleString()}
        </Typography>
      </div>
    </Tooltip>
  );
};

const seoTitles = getPageSeoTitles('Game Center');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Questlerinizi, XP, başarımlarınızı, badge, ödül ve topluluk sıralamanızı tek bir yerden takip edin.',
  nofollow: true,
  noindex: true,
};

function GameCenterPage({
  highestReputation,
  mostQuestsCompleted,
  questCompletionStats,
}: GameCenterPageProps): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    optOutLevelSystem,
    optOutQuestSystem,
    optOutAchievements,
    loadedSettings,
  } = useSettingsContext();
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
  const isGameCenterEmpty =
    optOutLevelSystem && optOutQuestSystem && optOutAchievements;

  useEffect(() => {
    if (loadedSettings && isGameCenterEmpty) {
      router.replace('/');
    }
  }, [loadedSettings, isGameCenterEmpty, router]);
  const { value: isAchievementTrackingEnabled } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: !!user,
  });
  const { data: questDashboard, isPending: isQuestPending } =
    useQuestDashboard();
  const {
    mutate: claimQuestReward,
    isPending: isClaimQuestPending,
    variables: claimQuestVariables,
  } = useClaimQuestReward();
  const {
    achievements,
    unlockedCount,
    totalCount,
    isPending: isAchievementsPending,
  } = useProfileAchievements(user);
  const shouldTrackAchievements = shouldShowAchievementTracker({
    isExperimentEnabled: isAchievementTrackingEnabled === true,
    unlockedCount,
    totalCount,
  });
  const trackedAchievementState = useTrackedAchievement(
    undefined,
    shouldTrackAchievements,
  );
  const achievementSummary = useMemo(
    () =>
      getAchievementSummary(
        achievements,
        trackedAchievementState.trackedAchievement,
      ),
    [achievements, trackedAchievementState.trackedAchievement],
  );
  const hasCoresAccess = useHasAccessToCores();
  const showLevelSystem = !optOutLevelSystem;
  const showAchievements = !optOutAchievements;
  const milestoneQuests = useMemo(
    () => questDashboard?.milestone ?? [],
    [questDashboard?.milestone],
  );
  const claimableMilestoneCount = useMemo(
    () => milestoneQuests.filter((quest) => quest.claimable).length,
    [milestoneQuests],
  );
  const claimingMilestoneQuestId = isClaimQuestPending
    ? claimQuestVariables?.userQuestId
    : undefined;
  const emptyQuestAnimationState = useMemo(() => new Set<string>(), []);

  const topReaderQueryKey = generateQueryKey(
    RequestKey.TopReaderBadge,
    user,
    'game-center:100',
  );
  const { data: topReaderBadges = [], isPending: isBadgesPending } = useQuery({
    queryKey: topReaderQueryKey,
    queryFn: () => {
      if (!user?.id) {
        throw new Error('Cannot load top reader badges without a user id.');
      }

      return fetchTopReaders(100, user.id);
    },
    staleTime: StaleTime.OneHour,
    enabled: !!user?.id,
  });
  const badgeCaseBadges = useMemo(
    () => topReaderBadges.slice(0, 3),
    [topReaderBadges],
  );
  const badgeSummary = useMemo(
    () => getBadgeSummary(topReaderBadges),
    [topReaderBadges],
  );
  const {
    data: awardProducts = [],
    isPending: isAwardsPending,
    error: awardsError,
  } = useQuery({
    ...userProductSummaryQueryOptions({
      userId: user?.id ?? '',
      limit: 100,
      type: ProductType.Award,
    }),
    enabled: !!user?.id && hasCoresAccess,
  });
  const awardSummary = useMemo(
    () => getAwardSummary(awardProducts),
    [awardProducts],
  );

  const levelProgress = questDashboard
    ? getQuestLevelProgress(questDashboard.level)
    : 0;
  const firstName = user?.name ? getFirstName(user.name) : 'there';
  const { featuredAchievements } = achievementSummary;
  const [featuredAchievement] = featuredAchievements;
  const upcomingMilestoneQuest = useMemo(
    () => getMostProgressedQuest(milestoneQuests),
    [milestoneQuests],
  );
  const hasCommunityLeaderboards =
    highestReputation.length > 0 || mostQuestsCompleted.length > 0;
  const milestoneHash = `#${gameCenterMilestoneSectionId}`;
  let mostEarnedBadgeSubtitle =
    'Favorinizi görmek için bir konuyu birden fazla kez okuyun';

  if (badgeSummary.mostEarnedBadge) {
    mostEarnedBadgeSubtitle =
      badgeSummary.mostEarnedBadgeCount === 1
        ? '1 kez kazanıldı'
        : `${badgeSummary.mostEarnedBadgeCount.toLocaleString()} kez kazanıldı`;
  }

  const isFeaturedAchievementTrackable =
    shouldTrackAchievements &&
    !!featuredAchievement &&
    !featuredAchievement.unlockedAt;
  const isFeaturedAchievementTracked =
    isFeaturedAchievementTrackable &&
    trackedAchievementState.trackedAchievement?.achievement.id ===
      featuredAchievement.achievement.id;
  const isFeaturedAchievementTrackingPending =
    trackedAchievementState.isPending ||
    trackedAchievementState.isTrackPending ||
    trackedAchievementState.isUntrackPending;

  const handleFeaturedAchievementTracking = async () => {
    if (!isFeaturedAchievementTrackable || !featuredAchievement) {
      return;
    }

    if (isFeaturedAchievementTracked) {
      await trackedAchievementState.untrackAchievement();
      return;
    }

    await trackedAchievementState.trackAchievement(
      featuredAchievement.achievement.id,
    );
  };
  const handleMilestoneDestinationClick = useCallback(
    async (destination: QuestDestination) => {
      if ('href' in destination) {
        if (destination.openInNewTab) {
          window.open(destination.href!, '_blank', 'noopener,noreferrer');
          return;
        }
        window.location.assign(destination.href!);
        return;
      }
      await router.push(destination.path);
    },
    [router],
  );
  const handleMilestoneClaim = useCallback(
    (userQuestId: string, questId: string, questType: QuestType) => {
      claimQuestReward({
        userQuestId,
        questId,
        questType,
      });
    },
    [claimQuestReward],
  );

  useEffect(() => {
    if (!router.isReady || claimableMilestoneCount === 0) {
      return;
    }

    if (!router.asPath?.includes(milestoneHash)) {
      return;
    }

    document
      .getElementById(gameCenterMilestoneSectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [claimableMilestoneCount, milestoneHash, router.asPath, router.isReady]);

  let milestoneQuestContent: ReactElement;

  if (isQuestPending) {
    milestoneQuestContent = (
      <EmptyStateCard
        title="Milestone questleri yükleniyor"
        description="Uzun süreli quest ilerlemeniz yükleniyor."
      />
    );
  } else if (milestoneQuests.length > 0) {
    milestoneQuestContent = (
      <QuestSection
        title="Milestone'lar"
        quests={milestoneQuests}
        layout="grid"
        showLevelSystem={showLevelSystem}
        onDestinationClick={handleMilestoneDestinationClick}
        claimingQuestId={claimingMilestoneQuestId}
        animatingClaimRotationIds={emptyQuestAnimationState}
        claimedStampRotationIds={emptyQuestAnimationState}
        animatingClaimedStampRotationIds={emptyQuestAnimationState}
        deferredClaimedStampRotationIds={emptyQuestAnimationState}
        onClaim={handleMilestoneClaim}
      />
    );
  } else {
    milestoneQuestContent = (
      <EmptyStateCard
        title="Henüz milestone questi yok"
        description="Milestone questleri erişilebilir olduğunda ilerleme ve claim aksiyonlarıyla birlikte burada görünecek."
      />
    );
  }

  let achievementShelfContent: ReactElement;

  if (isAchievementsPending) {
    achievementShelfContent = (
      <EmptyStateCard
        title="Başarımlar yükleniyor"
        description="Kilit açma geçmişiniz hazırlanıyor."
      />
    );
  } else if (featuredAchievements.length > 0) {
    achievementShelfContent = (
      <div className="grid gap-4 laptop:grid-cols-3">
        {featuredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.achievement.id}
            userAchievement={achievement}
            isOwner
            isTracked={
              trackedAchievementState.trackedAchievement?.achievement.id ===
              achievement.achievement.id
            }
            isTrackPending={trackedAchievementState.isTrackPending}
            isUntrackPending={trackedAchievementState.isUntrackPending}
            onTrack={
              shouldTrackAchievements
                ? trackedAchievementState.trackAchievement
                : undefined
            }
            onUntrack={
              shouldTrackAchievements
                ? trackedAchievementState.untrackAchievement
                : undefined
            }
          />
        ))}
      </div>
    );
  } else {
    achievementShelfContent = (
      <EmptyStateCard
        title="Henüz gösterilecek başarım yok"
        description="Profil başarımlarınız yüklendiğinde en nadir ve tamamlanmaya en yakın milestone'larınız burada vurgulanacak."
      />
    );
  }

  let badgeCaseContent: ReactElement;

  if (isBadgesPending) {
    badgeCaseContent = (
      <EmptyStateCard
        title="Badge'ler yükleniyor"
        description="En son top-reader başarılarınız getiriliyor."
      />
    );
  } else if (topReaderBadges.length > 0) {
    badgeCaseContent = (
      <>
        <div className="grid gap-4 tablet:grid-cols-3">
          <DataTile
            label="Son badge"
            value={
              badgeSummary.latestBadge
                ? getTopReaderTopicLabel(badgeSummary.latestBadge)
                : 'Henüz badge yok'
            }
            valueClassName="truncate"
            info="En son kazandığınız top-reader badge'i."
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {badgeSummary.latestBadge
                  ? formatDate({
                      value: badgeSummary.latestBadge.issuedAt,
                      type: TimeFormatType.TopReaderBadge,
                    })
                  : "İlk badge'inizi kazanmak için derinlemesine okuma yapın"}
              </Typography>
            }
          />
          <DataTile
            label="Uzmanlaşılan konular"
            value={badgeSummary.uniqueTopics}
            info="Top-reader badge'i kazandığınız farklı konular."
            icon={
              <MedalBadgeIcon
                size={IconSize.Small}
                className="text-text-tertiary"
              />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                uzmanlık genişliği
              </Typography>
            }
          />
          <DataTile
            label="En çok kazanılan badge"
            value={
              badgeSummary.mostEarnedBadge
                ? getTopReaderTopicLabel(badgeSummary.mostEarnedBadge)
                : 'Henüz badge yok'
            }
            valueClassName="truncate"
            info="Koleksiyonunuzda en sık yer alan badge konusu."
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {mostEarnedBadgeSubtitle}
              </Typography>
            }
          />
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto flex w-max gap-4">
            {badgeCaseBadges.map((badge) => (
              <div key={badge.id} className="shrink-0">
                <TopReaderBadge
                  user={badge.user}
                  issuedAt={badge.issuedAt}
                  keyword={badge.keyword}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  } else {
    badgeCaseContent = (
      <EmptyStateCard
        title="Henüz badge yok"
        description="Bir konuda derinlemesine okuma yaptıkça ilk top-reader badge'iniz burada görünecektir."
      />
    );
  }

  let trophyCaseContent: ReactElement;

  if (!hasCoresAccess) {
    trophyCaseContent = (
      <EmptyStateCard
        title="Ödüller bu hesapta henüz aktif değil"
        description="Hesabınız için Cores erişimi açıldığında kazandığınız ödüller burada listelenecektir."
      />
    );
  } else if (isAwardsPending) {
    trophyCaseContent = (
      <EmptyStateCard
        title="Ödüller yükleniyor"
        description="Şimdiye kadar kazandığınız tüm ödüller toplanıyor."
      />
    );
  } else if (awardsError) {
    trophyCaseContent = (
      <EmptyStateCard
        title="Ödüllere şu anda ulaşılamıyor"
        description="Kupa dolabınız yüklenemedi. Lütfen biraz sonra tekrar deneyin."
      />
    );
  } else if (awardSummary.awards.length > 0) {
    trophyCaseContent = (
      <>
        <div className="grid gap-4 tablet:grid-cols-3">
          <DataTile
            label="Toplam ödüller"
            value={awardSummary.totalAwards}
            info="Tüm ödül türlerinde kazandığınız her bir ödül."
            icon={
              <CoreIcon size={IconSize.Small} className="text-text-tertiary" />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                tüm zamanlar koleksiyonu
              </Typography>
            }
          />
          <DataTile
            label="Ödül çeşitleri"
            value={awardSummary.uniqueAwards}
            info="Koleksiyonunuzdaki farklı ödül tasarımlarının sayısı."
            icon={
              <MedalBadgeIcon
                size={IconSize.Small}
                className="text-text-tertiary"
              />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                kazanılan benzersiz kupalar
              </Typography>
            }
          />
          <DataTile
            label="En çok kazanılan"
            value={awardSummary.favoriteAward?.count ?? 0}
            info="En çok topladığınız ödül türü."
            icon={
              <Image
                src={awardSummary.favoriteAward?.image ?? featuredAwardImage}
                alt={awardSummary.favoriteAward?.name ?? 'Ödül'}
                fallbackSrc={featuredAwardImage}
                className="size-6 shrink-0 object-contain"
              />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {awardSummary.favoriteAward?.name ?? 'Henüz ödül yok'}
              </Typography>
            }
          />
        </div>
        <div className="rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-5">
          <div
            className="grid grid-cols-4 gap-x-4 gap-y-6 tablet:grid-cols-5 laptop:grid-cols-6"
            role="list"
            aria-label="Ödül koleksiyonu"
          >
            {awardSummary.awards.map((award) => (
              <TrophyCard
                key={award.id}
                name={award.name}
                image={award.image}
                count={award.count}
              />
            ))}
          </div>
        </div>
      </>
    );
  } else {
    trophyCaseContent = (
      <EmptyStateCard
        title="Henüz ödül yok"
        description="Diğer developer'lar çalışmalarınıza ödül verdikçe tüm kupalar ve adetleri burada birikecektir."
      />
    );
  }

  return (
    <ProtectedPage>
      {isV2Laptop && <PageHeader title="Game Center" />}
      <div className="mx-auto w-full max-w-[72rem]">
        {!isV2Laptop && (
          <LayoutHeader
            className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
          >
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="flex-1"
            >
              Game Center
            </Typography>
          </LayoutHeader>
        )}
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pb-10">
          <section className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="bg-accent-cabbage-default/10 absolute -left-8 top-0 size-40 rounded-full blur-3xl" />
              <div className="bg-accent-blueCheese-default/10 absolute bottom-0 right-0 size-48 rounded-full blur-3xl" />
            </div>
            <div className="relative grid gap-6 laptop:grid-cols-[minmax(0,1.5fr)_auto]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    bold
                  >
                    İlerleme özeti
                  </Typography>
                  <Typography
                    tag={TypographyTag.H1}
                    type={TypographyType.Title1}
                    bold
                  >
                    {firstName}, işte son durumun.
                  </Typography>
                  <Typography
                    type={TypographyType.Body}
                    color={TypographyColor.Tertiary}
                  >
                    Game Center; quest ilerlemenizi, başarım milestone&apos;larınızı,
                    son badge&apos;lerinizi, creator ödüllerinizi ve topluluk sıralamasını
                    tek bir yerde toplayarak gelişiminizi bir bakışta görmenizi sağlar.
                  </Typography>
                </div>

                <div className="grid grid-cols-2 gap-3 tablet:max-w-[calc(75%-0.1875rem)] tablet:grid-cols-3">
                  <StatPill
                    label="Toplam XP"
                    value={(
                      questDashboard?.level.totalXp ?? 0
                    ).toLocaleString()}
                  />
                  <StatPill
                    label="Mevcut quest serisi"
                    value={
                      isQuestPending
                        ? '...'
                        : `${
                            questDashboard?.currentStreak?.toLocaleString() ?? 0
                          } gün`
                    }
                  />
                  <StatPill
                    label="En uzun quest serisi"
                    value={
                      isQuestPending
                        ? '...'
                        : `${
                            questDashboard?.longestStreak?.toLocaleString() ?? 0
                          } gün`
                    }
                  />
                </div>

                <div className="grid gap-3 tablet:grid-cols-2">
                  <div className="bg-background-default/70 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-sm">
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      bold
                    >
                      Yaklaşan milestone
                    </Typography>
                    <Typography
                      type={TypographyType.Callout}
                      bold
                      className="mt-1"
                    >
                      {upcomingMilestoneQuest?.quest.name ??
                        'Henüz yaklaşan milestone yok'}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="mt-1"
                    >
                      {upcomingMilestoneQuest
                        ? `${Math.min(
                            upcomingMilestoneQuest.progress,
                            upcomingMilestoneQuest.quest.targetCount,
                          )}/${
                            upcomingMilestoneQuest.quest.targetCount
                          } ilerleme`
                        : "Bir sonraki milestone'unuz burada görünecektir."}
                    </Typography>
                  </div>

                  {showAchievements && (
                    <div className="bg-background-default/70 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-sm">
                      <div className="flex items-start justify-between gap-3">
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                          bold
                        >
                          En yakın başarım
                        </Typography>
                        {isFeaturedAchievementTrackable && (
                          <Tooltip
                            content={
                              isFeaturedAchievementTracked
                                ? 'Başarımı takibi bırak'
                                : 'Başarımı takip et'
                            }
                            side="top"
                          >
                            <Button
                              variant={ButtonVariant.Subtle}
                              size={ButtonSize.Small}
                              icon={
                                <PinIcon
                                  secondary={isFeaturedAchievementTracked}
                                />
                              }
                              pressed={isFeaturedAchievementTracked}
                              disabled={isFeaturedAchievementTrackingPending}
                              onClick={handleFeaturedAchievementTracking}
                              aria-label={
                                isFeaturedAchievementTracked
                                  ? `${featuredAchievement.achievement.name} takibini bırak`
                                  : `${featuredAchievement.achievement.name} takip et`
                              }
                            />
                          </Tooltip>
                        )}
                      </div>
                      <div className="mt-3 flex items-start gap-3">
                        {featuredAchievement && (
                          <LazyImage
                            imgSrc={featuredAchievement.achievement.image}
                            imgAlt={featuredAchievement.achievement.name}
                            className="size-14 shrink-0 rounded-12 border border-border-subtlest-tertiary bg-background-subtle"
                            fallbackSrc="https://devcore.tr/default-achievement.png"
                          />
                        )}
                        <div className="min-w-0">
                          <Typography
                            type={TypographyType.Callout}
                            bold
                            className={classNames(
                              'line-clamp-2',
                              !featuredAchievement && 'mt-1',
                            )}
                          >
                            {featuredAchievement?.achievement.name ??
                              'Takip edilen başarım yok'}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                            className="mt-1"
                          >
                            {featuredAchievement
                              ? `${
                                  featuredAchievement.progress
                                }/${getTargetCount(
                                  featuredAchievement.achievement,
                                )} ilerleme`
                              : 'Başarımlar yüklendiğinde en yakın milestone burada listelenecektir.'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background-default/70 flex min-w-[14rem] flex-col items-start justify-center gap-4 rounded-20 border border-border-subtlest-tertiary p-5 backdrop-blur-sm">
                {questDashboard ? (
                  <>
                    <div className="flex items-center gap-4">
                      <QuestLevelProgressCircle
                        level={questDashboard.level.level}
                        progress={levelProgress}
                        className="scale-125"
                        levelClassName="text-base"
                      />
                      <div>
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          Mevcut seviye
                        </Typography>
                        <Typography type={TypographyType.Title2} bold>
                          Seviye {questDashboard.level.level}
                        </Typography>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                        >
                          Sonraki seviyeye kalan XP
                        </Typography>
                        <Typography type={TypographyType.Footnote} bold>
                          {questDashboard.level.xpToNextLevel.toLocaleString()}
                        </Typography>
                      </div>
                      <ProgressBar
                        percentage={levelProgress}
                        shouldShowBg
                        className={{
                          wrapper: 'h-2 rounded-14',
                          bar: 'h-full rounded-14',
                        }}
                      />
                    </div>
                  </>
                ) : (
                  showAchievements && (
                    <>
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Kişisel öne çıkanlar
                      </Typography>
                      <Typography type={TypographyType.Title2} bold>
                        {achievementSummary.unlockedCount}/
                        {achievementSummary.totalCount}
                      </Typography>
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                      >
                        şimdiye kadar açılan başarımlar
                      </Typography>
                    </>
                  )
                )}
              </div>
            </div>
          </section>

          <Divider className={dividerClassName} />

          <section
            id={gameCenterMilestoneSectionId}
            className="flex scroll-mt-16 flex-col gap-4"
          >
            <SectionHeader
              title="Milestone questleri"
              description="Tamamlanıp ödülü alınana kadar ilerlemenizi kaydeden uzun vadeli hedefler."
            />

            {milestoneQuestContent}
          </section>

          <Divider className={dividerClassName} />

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Topluluk nabzı"
              description="Topluluk genelinde öne çıkan aktivitelere hızlı bir bakış"
              action={
                <Link href="/users" passHref>
                  <a className="inline-flex items-center gap-1 font-bold text-accent-cabbage-default typo-footnote">
                    Tüm leaderboard&apos;u gör
                    <ArrowIcon className="rotate-90" />
                  </a>
                </Link>
              }
            />
            {questCompletionStats && (
              <div className="grid gap-4 tablet:grid-cols-3">
                <DataTile
                  label="Tüm zamanların en çok tamamlananı"
                  value={
                    questCompletionStats.allTimeLeader?.questName ??
                    'Henüz quest verisi yok'
                  }
                  valueClassName="max-w-full truncate !text-lg !leading-6"
                  info="Tüm topluluk genelinde en çok tamamlanan veya claim edilen quest."
                  subtitle={
                    <div className="mt-1 flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                        className="truncate"
                      >
                        {questCompletionStats.allTimeLeader?.questDescription ??
                          'İlk quest tamamlandığında kriterler görünecektir'}
                      </Typography>
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                      >
                        {questCompletionStats.allTimeLeader
                          ? formatQuestCompletionCount(
                              questCompletionStats.allTimeLeader.count,
                            )
                          : 'İlk tamamlama bekleniyor'}
                      </Typography>
                    </div>
                  }
                />
                <DataTile
                  label="Bu hafta en çok tamamlanan"
                  value={
                    questCompletionStats.weeklyLeader?.questName ??
                    'Henüz quest verisi yok'
                  }
                  valueClassName="max-w-full truncate !text-lg !leading-6"
                  info="Bu hafta başlangıcından itibaren toplulukta lider olan quest."
                  subtitle={
                    <div className="mt-1 flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                        className="truncate"
                      >
                        {questCompletionStats.weeklyLeader?.questDescription ??
                          'Bu hafta bir quest tamamlandığında kriterler görünecektir'}
                      </Typography>
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                      >
                        {questCompletionStats.weeklyLeader
                          ? formatQuestCompletionCount(
                              questCompletionStats.weeklyLeader.count,
                            )
                          : 'Bu hafta henüz tamamlanan quest yok'}
                      </Typography>
                    </div>
                  }
                />
                <DataTile
                  label="Toplam tamamlanan quest"
                  value={questCompletionStats.totalCount}
                  info="Topluluk genelinde tamamlanan veya claim edilen tüm questler."
                  subtitle={
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      tüm zamanlar topluluk toplamı
                    </Typography>
                  }
                />
              </div>
            )}
            {hasCommunityLeaderboards ? (
              <div className="grid gap-4 tablet:grid-cols-2">
                {highestReputation.length > 0 && (
                  <UserTopList
                    containerProps={{
                      title: 'En yüksek repütasyon',
                      titleHref: `/users/${LeaderboardType.HighestReputation}`,
                    }}
                    items={highestReputation}
                    isLoading={false}
                  />
                )}
                {mostQuestsCompleted.length > 0 && (
                  <UserTopList
                    containerProps={{
                      title: 'En çok quest tamamlayanlar',
                      titleHref: `/users/${LeaderboardType.MostQuestsCompleted}`,
                    }}
                    items={mostQuestsCompleted}
                    isLoading={false}
                  />
                )}
              </div>
            ) : (
              <EmptyStateCard
                title="Topluluk istatistiklerine şu anda ulaşılamıyor"
                description="Global leaderboard bu derleme için yüklenemedi ancak kişisel Game Center verileriniz canlı aktiftir."
              />
            )}
          </section>

          {showAchievements && (
            <>
              <Divider className={dividerClassName} />

              <section className="flex flex-col gap-4">
                <SectionHeader
                  title="Başarım vitrini"
                  description="Yeni açtıklarınız, nadir başarımlar ve tamamlanmaya en yakın olanların karması."
                  action={
                    user?.username ? (
                      <Link href={`/${user.username}/achievements`} passHref>
                        <a className="inline-flex items-center gap-1 font-bold text-accent-cabbage-default typo-footnote">
                          Tüm başarımları gör
                          <ArrowIcon className="rotate-90" />
                        </a>
                      </Link>
                    ) : undefined
                  }
                />

                {achievementShelfContent}
              </section>
            </>
          )}

          <Divider className={dividerClassName} />

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Badge vitrini"
              description="Son kazandığınız top-reader badge'leri ve en çok derinleştiğiniz konular."
            />

            {badgeCaseContent}
          </section>

          <Divider className={dividerClassName} />

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Kupa vitrini"
              description="Kazandığınız tüm ödüller"
            />

            {trophyCaseContent}
          </section>
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
}

const getGameCenterLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

GameCenterPage.getLayout = getGameCenterLayout;
GameCenterPage.layoutProps = { screenCentered: false, seo };

export default GameCenterPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<GameCenterPageProps>
> {
  try {
    const [highestReputationRes, mostQuestsCompletedRes] = await Promise.all([
      gqlClient.request<{
        highestReputation: UserLeaderboard[];
      }>(HIGHEST_REPUTATION_QUERY, { limit: leaderboardLimit }),
      gqlClient.request<{
        mostQuestsCompleted: UserLeaderboard[];
      }>(MOST_QUESTS_COMPLETED_QUERY, { limit: leaderboardLimit }),
    ]);
    let questCompletionStats: QuestCompletionStats | null = null;

    try {
      const statsRes = await gqlClient.request<{
        questCompletionStats: QuestCompletionStats | null;
      }>(QUEST_COMPLETION_STATS_QUERY);

      questCompletionStats = statsRes.questCompletionStats ?? null;
    } catch (statsError: unknown) {
      const error = statsError as GraphQLError;

      if (isQuestCompletionStatsSchemaMissing(error)) {
        questCompletionStats = null;
      }
    }

    return {
      props: {
        highestReputation: highestReputationRes.highestReputation ?? [],
        mostQuestsCompleted: mostQuestsCompletedRes.mostQuestsCompleted ?? [],
        questCompletionStats,
      },
      revalidate: 3600,
    };
  } catch (err: unknown) {
    const error = err as {
      response?: {
        errors?: Array<{
          extensions?: {
            code?: ApiError;
          };
        }>;
      };
    };
    const errorCode = error?.response?.errors?.[0]?.extensions?.code;

    if (
      errorCode &&
      [ApiError.NotFound, ApiError.Forbidden].includes(errorCode)
    ) {
      return {
        props: {
          highestReputation: [],
          mostQuestsCompleted: [],
          questCompletionStats: null,
        },
        revalidate: 300,
      };
    }

    return {
      props: {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      },
      revalidate: 300,
    };
  }
}
