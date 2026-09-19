import type { ComponentType } from 'react';
import classed from '../../lib/classed';
import type { IconProps } from '../Icon';
import {
  BellIcon,
  CommunityPicksIcon,
  DailyIcon,
  DiscussIcon,
  EyeIcon,
  UpvoteIcon,
  BlockIcon,
  UserIcon,
  StarIcon,
  DevCardIcon,
  ReadingStreakIcon,
  TimerIcon,
  CoreIcon,
  AnalyticsIcon,
  JobIcon,
  MagicIcon,
  AtIcon,
  AddUserIcon,
  SquadIcon,
  MegaphoneIcon,
  WorldIcon,
} from '../icons';
import type { NotificationPromptSource } from '../../lib/log';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { AgentIcon } from '../icons/Agent';
import type { NotificationPreferenceStatus } from '../../graphql/notifications';
import type {
  NotificationChannel,
  NotificationGroup,
} from '../../hooks/notifications/useNotificationSettings';
import { briefButtonBg } from '../../styles/custom';

// Compact inverting "chip": `invert` makes the contents (text, status icon)
// resolve against the chip background, which is the opposite of the page — so
// they stay readable on both a dark chip (light page) and a light chip (dark
// page). Single row, medium-weight message, theme-matching surface.
export const NotifContainer = classed(
  'div',
  'fixed left-1/2 invert flex flex-row items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 pl-3 pr-2 shadow-3',
);
export const NotifMessage = classed(
  'div',
  'min-w-0 flex-1 typo-subhead font-medium text-text-primary',
);

export enum NotificationType {
  System = 'system',
  ArticleNewComment = 'article_new_comment',
  SquadNewComment = 'squad_new_comment',
  CommentReply = 'comment_reply',
  SquadPostAdded = 'squad_post_added',
  SquadMemberJoined = 'squad_member_joined',
  SquadReply = 'squad_reply',
  SquadBlocked = 'squad_blocked',
  PromotedToAdmin = 'promoted_to_admin',
  PromotedToModerator = 'promoted_to_moderator',
  DemotedToMember = 'demoted_to_member',
  SquadSubscribeNotification = 'squad_subscribe_to_notification',
  CollectionUpdated = 'collection_updated',
  SourcePostAdded = 'source_post_added',
  SquadPublicApproved = 'squad_public_approved',
  UserPostAdded = 'user_post_added',
  UserTopReaderBadge = 'user_given_top_reader',
  UserReceivedAward = 'user_received_award',
  UserAwardThanks = 'user_award_thanks',
  BriefingReady = 'briefing_ready',
  DigestReady = 'digest_ready',
  InterestContentAvailable = 'interest_content_available',
  InterestContentBatch = 'interest_content_batch',
  UserFollow = 'user_follow',
  ArticleUpvoteMilestone = 'article_upvote_milestone',
  CommentUpvoteMilestone = 'comment_upvote_milestone',
  ArticleReportApproved = 'article_report_approved',
  PostBookmarkReminder = 'post_bookmark_reminder',
  StreakReminder = 'streak_reminder',
  StreakResetRestore = 'streak_reset_restore',
  StreakFreezeUsed = 'streak_freeze_used',
  StreakFreezeDepleted = 'streak_freeze_depleted',
  SourcePostApproved = 'source_post_approved',
  DevCardUnlocked = 'dev_card_unlocked',
  PostMention = 'post_mention',
  CommentMention = 'comment_mention',
  SourceApproved = 'source_approved',
  SourceRejected = 'source_rejected',
  SourcePostRejected = 'source_post_rejected',
  ArticlePicked = 'article_picked',
  ArticleAnalytics = 'article_analytics',
  SourcePostSubmitted = 'source_post_submitted',
  SquadFeatured = 'squad_featured',
  Marketing = 'marketing',
  Announcements = 'announcements',
  NewUserWelcome = 'new_user_welcome',
  InAppPurchases = 'in_app_purchases',
  PostAnalytics = 'post_analytics',
  PollResult = 'poll_result',
  PollResultAuthor = 'poll_result_author',
  NewOpportunityMatch = 'new_opportunity_match',
  WarmIntro = 'warm_intro',
  ExperienceCompanyEnriched = 'experience_company_enriched',
  WorldDistrictLevelUp = 'world_district_level_up',
}

export enum NotificationIconType {
  DailyDev = 'DailyDev',
  CommunityPicks = 'CommunityPicks',
  Comment = 'Comment',
  Upvote = 'Upvote',
  Bell = 'Bell',
  View = 'View',
  Block = 'Block',
  User = 'User',
  Star = 'Star',
  DevCard = 'DevCard',
  BookmarkReminder = 'BookmarkReminder',
  Streak = 'Streak',
  TopReaderBadge = 'TopReaderBadge',
  Timer = 'Timer',
  Core = 'Core',
  Analytics = 'Analytics',
  Opportunity = 'Opportunity',
  World = 'World',
}

export const notificationIcon: Record<
  NotificationIconType,
  ComponentType<IconProps>
> = {
  [NotificationIconType.DailyDev]: DailyIcon,
  [NotificationIconType.CommunityPicks]: CommunityPicksIcon,
  [NotificationIconType.Comment]: DiscussIcon,
  [NotificationIconType.Upvote]: UpvoteIcon,
  [NotificationIconType.Bell]: BellIcon,
  [NotificationIconType.View]: EyeIcon,
  [NotificationIconType.Block]: BlockIcon,
  [NotificationIconType.User]: UserIcon,
  [NotificationIconType.Star]: StarIcon,
  [NotificationIconType.DevCard]: DevCardIcon,
  [NotificationIconType.BookmarkReminder]: BookmarkReminderIcon,
  [NotificationIconType.Streak]: ReadingStreakIcon,
  [NotificationIconType.TopReaderBadge]: BellIcon,
  [NotificationIconType.Timer]: TimerIcon,
  [NotificationIconType.Core]: CoreIcon,
  [NotificationIconType.Analytics]: AnalyticsIcon,
  [NotificationIconType.Opportunity]: JobIcon,
  [NotificationIconType.World]: WorldIcon,
};

export const notificationIconAsPrimary: NotificationIconType[] = [
  NotificationIconType.Core,
  NotificationIconType.Opportunity,
];

export const notificationIconTypeTheme: Record<NotificationIconType, string> = {
  [NotificationIconType.DailyDev]: '',
  [NotificationIconType.CommunityPicks]: '',
  [NotificationIconType.Comment]: 'text-accent-blueCheese-default',
  [NotificationIconType.Upvote]: 'text-accent-avocado-default',
  [NotificationIconType.Bell]: '',
  [NotificationIconType.View]: 'text-accent-blueCheese-default',
  [NotificationIconType.Star]: '',
  [NotificationIconType.Block]: '',
  [NotificationIconType.User]: '',
  [NotificationIconType.DevCard]: '',
  [NotificationIconType.BookmarkReminder]: 'text-accent-bun-default',
  [NotificationIconType.Streak]: '',
  [NotificationIconType.TopReaderBadge]: 'text-brand-default',
  [NotificationIconType.Timer]: 'text-brand-default',
  [NotificationIconType.Core]: '',
  [NotificationIconType.Analytics]: 'text-brand-default',
  [NotificationIconType.Opportunity]: 'text-black',
  [NotificationIconType.World]: 'text-brand-default',
};

export const notificationIconStyle: Record<
  NotificationIconType,
  Record<string, string> | null
> = {
  [NotificationIconType.DailyDev]: null,
  [NotificationIconType.CommunityPicks]: null,
  [NotificationIconType.Comment]: null,
  [NotificationIconType.Upvote]: null,
  [NotificationIconType.Bell]: null,
  [NotificationIconType.View]: null,
  [NotificationIconType.Block]: null,
  [NotificationIconType.User]: null,
  [NotificationIconType.Star]: null,
  [NotificationIconType.DevCard]: null,
  [NotificationIconType.BookmarkReminder]: null,
  [NotificationIconType.Streak]: null,
  [NotificationIconType.TopReaderBadge]: null,
  [NotificationIconType.Timer]: null,
  [NotificationIconType.Core]: null,
  [NotificationIconType.Analytics]: null,
  [NotificationIconType.Opportunity]: { background: briefButtonBg },
  [NotificationIconType.World]: null,
};

export const notificationTypeTheme: Partial<Record<NotificationType, string>> =
  {
    [NotificationType.System]: '',
    [NotificationType.SquadPostAdded]: 'text-brand-default',
    [NotificationType.SquadMemberJoined]: 'text-brand-default',
    [NotificationType.DemotedToMember]: 'text-brand-default',
    [NotificationType.PromotedToModerator]: 'text-brand-default',
    [NotificationType.PromotedToAdmin]: 'text-brand-default',
    [NotificationType.SquadBlocked]: 'text-brand-default',
    [NotificationType.SquadSubscribeNotification]: 'text-brand-default',
    [NotificationType.CollectionUpdated]: 'text-brand-default',
    [NotificationType.SourcePostAdded]: 'text-brand-default',
    [NotificationType.SquadPublicApproved]: 'text-brand-default',
    [NotificationType.UserPostAdded]: 'text-brand-default',
    [NotificationType.UserTopReaderBadge]: 'text-brand-default',
    [NotificationType.UserReceivedAward]: 'text-brand-default',
    [NotificationType.UserAwardThanks]: 'text-brand-default',
    [NotificationType.BriefingReady]: 'text-brand-default',
    [NotificationType.DigestReady]: 'text-brand-default',
    [NotificationType.InterestContentBatch]: 'text-brand-default',
    [NotificationType.UserFollow]: 'text-brand-default',
  };

export const contentArrivalNotificationTypes = new Set<NotificationType>([
  NotificationType.SourcePostAdded,
  NotificationType.SquadPostAdded,
  NotificationType.UserPostAdded,
]);

export const notificationTypeNotClickable: Partial<
  Record<NotificationType, boolean>
> = {
  [NotificationType.WarmIntro]: true,
};

export const descriptionIcon: Partial<
  Record<NotificationType, ComponentType<IconProps>>
> = {
  [NotificationType.NewOpportunityMatch]: MagicIcon,
};

export const notificationsUrl = `/notifications`;

const MAX_UNREAD_DISPLAY = 20;

export const getUnreadText = (unread: number): string =>
  unread > MAX_UNREAD_DISPLAY ? `${MAX_UNREAD_DISPLAY}+` : unread.toString();

interface ActionCopy {
  mute: string;
  unmute: string;
}

export const notificationMutingCopy: Partial<
  Record<NotificationType, ActionCopy>
> = {
  [NotificationType.ArticleNewComment]: {
    mute: 'Bu posttan gelen bildirimleri kapat',
    unmute: 'Bu posttan gelen bildirimleri aç',
  },
  [NotificationType.SquadNewComment]: {
    mute: 'Bu posttan gelen bildirimleri kapat',
    unmute: 'Bu posttan gelen bildirimleri aç',
  },
  [NotificationType.CommentReply]: {
    mute: 'Bu konuşmayı sessize al',
    unmute: 'Bu konuşmanın sesini aç',
  },
  [NotificationType.SquadReply]: {
    mute: 'Bu konuşmayı sessize al',
    unmute: 'Bu konuşmanın sesini aç',
  },
  [NotificationType.UserPostAdded]: {
    mute: 'Bildirimleri sessize al',
    unmute: 'Bildirimlerin sesini aç',
  },
  [NotificationType.SquadMemberJoined]: {
    mute: 'Yeni üye bildirimlerini sessize al',
    unmute: 'Yeni üye bildirimlerinin sesini aç',
  },
};

export type SubscriptionCallback = (
  isSubscribed: boolean,
  source?: NotificationPromptSource,
  existing_permission?: boolean,
) => unknown;

export const FOLLOWING_KEYS = [
  NotificationType.SourcePostAdded,
  NotificationType.UserPostAdded,
  NotificationType.CollectionUpdated,
  NotificationType.PostBookmarkReminder,
  NotificationType.PollResult,
  NotificationType.PollResultAuthor,
];

export const FOLLOWING_EMAIL_KEYS = [
  NotificationType.SourcePostAdded,
  NotificationType.UserPostAdded,
  NotificationType.CollectionUpdated,
  NotificationType.SquadPostAdded,
  NotificationType.PollResult,
  NotificationType.PollResultAuthor,
];

export const ACHIEVEMENT_KEYS = [
  NotificationType.UserTopReaderBadge,
  NotificationType.DevCardUnlocked,
  NotificationType.ArticleAnalytics,
];
// Its own group rather than one of the achievement keys. Sharing that toggle
// would mean the only way to stop hearing about a world is to also stop
// hearing about badges, under a label that never mentions worlds.
export const WORLD_KEYS = [NotificationType.WorldDistrictLevelUp];
export const MENTION_KEYS = [
  NotificationType.PostMention,
  NotificationType.CommentMention,
];
export const STREAK_KEYS = [
  NotificationType.StreakReminder,
  NotificationType.StreakResetRestore,
  NotificationType.StreakFreezeUsed,
  NotificationType.StreakFreezeDepleted,
];
export const SQUAD_ROLE_KEYS = [
  NotificationType.PromotedToAdmin,
  NotificationType.PromotedToModerator,
  NotificationType.SquadBlocked,
  NotificationType.DemotedToMember,
];

export const SOURCE_SUBMISSION_KEYS = [
  NotificationType.SourceApproved,
  NotificationType.SourceRejected,
];

export const SQUAD_MODERATION_KEYS = [
  NotificationType.SourcePostSubmitted,
  NotificationType.SquadMemberJoined,
  NotificationType.SquadFeatured,
];

export const SQUAD_POST_REVIEW_KEYS = [
  NotificationType.SourcePostApproved,
  NotificationType.SourcePostRejected,
  NotificationType.ArticlePicked,
];

export const SQUAD_KEYS = [
  NotificationType.SquadPostAdded,
  NotificationType.SquadMemberJoined,
  NotificationType.SourcePostSubmitted,
];

export const COMMENT_KEYS = [
  NotificationType.ArticleNewComment,
  NotificationType.SquadNewComment,
  NotificationType.SquadReply,
];

export const CREATOR_UPDATES_EMAIL_KEYS = [
  NotificationType.SourcePostApproved,
  NotificationType.ArticlePicked,
];

export const POLL_RESULT_KEYS = [
  NotificationType.PollResult,
  NotificationType.PollResultAuthor,
];

export const OPPORTUNITY_KEYS = [NotificationType.NewOpportunityMatch];

// Human-friendly buckets used to filter the notifications page. Each raw
// NotificationType maps to exactly one category; anything not listed below
// falls back to `Updates` so new backend types never disappear from the feed.
export enum NotificationFilterCategory {
  Upvotes = 'upvotes',
  Mentions = 'mentions',
  Comments = 'comments',
  Followers = 'followers',
  Squads = 'squads',
  Agents = 'agents',
  Updates = 'updates',
}

export const notificationCategoryToTypes: Record<
  NotificationFilterCategory,
  NotificationType[]
> = {
  [NotificationFilterCategory.Upvotes]: [
    NotificationType.ArticleUpvoteMilestone,
    NotificationType.CommentUpvoteMilestone,
  ],
  [NotificationFilterCategory.Mentions]: [
    NotificationType.PostMention,
    NotificationType.CommentMention,
  ],
  [NotificationFilterCategory.Comments]: [
    NotificationType.ArticleNewComment,
    NotificationType.SquadNewComment,
    NotificationType.CommentReply,
    NotificationType.SquadReply,
  ],
  [NotificationFilterCategory.Followers]: [NotificationType.UserFollow],
  [NotificationFilterCategory.Squads]: [
    NotificationType.SquadPostAdded,
    NotificationType.SquadMemberJoined,
    NotificationType.SquadBlocked,
    NotificationType.PromotedToAdmin,
    NotificationType.PromotedToModerator,
    NotificationType.DemotedToMember,
    NotificationType.SquadPublicApproved,
    NotificationType.SquadFeatured,
    NotificationType.SquadSubscribeNotification,
    NotificationType.SourcePostSubmitted,
    NotificationType.SourcePostApproved,
    NotificationType.SourcePostRejected,
    NotificationType.ArticlePicked,
  ],
  [NotificationFilterCategory.Agents]: [
    NotificationType.InterestContentAvailable,
    NotificationType.InterestContentBatch,
  ],
  [NotificationFilterCategory.Updates]: [
    NotificationType.System,
    NotificationType.SourcePostAdded,
    NotificationType.UserPostAdded,
    NotificationType.CollectionUpdated,
    NotificationType.PostBookmarkReminder,
    NotificationType.PollResult,
    NotificationType.PollResultAuthor,
    NotificationType.UserReceivedAward,
    NotificationType.UserAwardThanks,
    NotificationType.UserTopReaderBadge,
    NotificationType.DevCardUnlocked,
    NotificationType.ArticleReportApproved,
    NotificationType.ArticleAnalytics,
    NotificationType.PostAnalytics,
    NotificationType.SourceApproved,
    NotificationType.SourceRejected,
    NotificationType.BriefingReady,
    NotificationType.DigestReady,
    NotificationType.StreakReminder,
    NotificationType.StreakResetRestore,
    NotificationType.StreakFreezeUsed,
    NotificationType.StreakFreezeDepleted,
    NotificationType.Marketing,
    NotificationType.Announcements,
    NotificationType.NewUserWelcome,
    NotificationType.InAppPurchases,
    NotificationType.NewOpportunityMatch,
    NotificationType.WarmIntro,
    NotificationType.ExperienceCompanyEnriched,
    NotificationType.WorldDistrictLevelUp,
  ],
};

// Order the chips appear in the filter bar.
export const notificationFilterCategoryList: NotificationFilterCategory[] = [
  NotificationFilterCategory.Upvotes,
  NotificationFilterCategory.Mentions,
  NotificationFilterCategory.Comments,
  NotificationFilterCategory.Followers,
  NotificationFilterCategory.Squads,
  NotificationFilterCategory.Agents,
  NotificationFilterCategory.Updates,
];

export const notificationFilterCategoryLabel: Record<
  NotificationFilterCategory,
  string
> = {
  [NotificationFilterCategory.Upvotes]: 'Upvote',
  [NotificationFilterCategory.Mentions]: 'Bahsetmeler',
  [NotificationFilterCategory.Comments]: 'Yorumlar',
  [NotificationFilterCategory.Followers]: 'Takipçiler',
  [NotificationFilterCategory.Squads]: "Squad'lar",
  [NotificationFilterCategory.Agents]: 'Agentlar',
  [NotificationFilterCategory.Updates]: 'Güncellemeler',
};

const notificationTypeToCategory = Object.entries(
  notificationCategoryToTypes,
).reduce((acc, [category, types]) => {
  types.forEach((type) => {
    acc[type] = category as NotificationFilterCategory;
  });
  return acc;
}, {} as Partial<Record<NotificationType, NotificationFilterCategory>>);

export const getNotificationCategory = (
  type: NotificationType,
): NotificationFilterCategory =>
  notificationTypeToCategory[type] ?? NotificationFilterCategory.Updates;

// Eye-catching colored type badge overlaid on the avatar (Instagram/Facebook/
// TikTok pattern): a solid accent circle + glyph that signals the notification
// type at a glance.
//
// `fg` is chosen for contrast against the badge fill, not for decoration: the
// food-palette accents split into bright (avocado green, blueCheese cyan, bun
// orange) where a white glyph washes out, and dark (cabbage/onion purples)
// where white reads. Bright fills get a dark glyph, dark fills get white — so
// the icon stays legible in both light and dark themes (the fill hue barely
// shifts between themes, so a fixed per-badge `fg` is enough).
export const notificationCategoryBadge: Record<
  NotificationFilterCategory,
  { bg: string; fg: string; Icon: ComponentType<IconProps> }
> = {
  [NotificationFilterCategory.Upvotes]: {
    bg: 'bg-accent-avocado-default',
    fg: 'text-black',
    Icon: UpvoteIcon,
  },
  [NotificationFilterCategory.Mentions]: {
    bg: 'bg-accent-cabbage-default',
    fg: 'text-white',
    Icon: AtIcon,
  },
  [NotificationFilterCategory.Comments]: {
    bg: 'bg-accent-blueCheese-default',
    fg: 'text-black',
    Icon: DiscussIcon,
  },
  [NotificationFilterCategory.Followers]: {
    bg: 'bg-accent-onion-default',
    fg: 'text-white',
    Icon: AddUserIcon,
  },
  // Squads shares the Followers purple — the cheese yellow read poorly and a
  // white glyph on yellow had almost no contrast.
  [NotificationFilterCategory.Squads]: {
    bg: 'bg-accent-onion-default',
    fg: 'text-white',
    Icon: SquadIcon,
  },
  [NotificationFilterCategory.Agents]: {
    bg: 'bg-accent-water-default',
    fg: 'text-white',
    Icon: AgentIcon,
  },
  [NotificationFilterCategory.Updates]: {
    bg: 'bg-accent-bun-default',
    fg: 'text-black',
    Icon: MegaphoneIcon,
  },
};

export const NotificationContainer = classed('div', 'flex flex-col gap-6');

export const NotificationSection = classed(
  'section',
  'flex flex-col gap-6 px-4',
);

export interface NotificationChannelSetting {
  email: NotificationPreferenceStatus;
  inApp: NotificationPreferenceStatus;
}

export interface NotificationSettings {
  [key: string]: NotificationChannelSetting;
}

type NotificationItem =
  | {
      id: NotificationGroup;
      label: string;
      description?: string;
      group: true;
      type?: 'switch' | 'checkbox';
    }
  | {
      id: string;
      label: string;
      description?: string;
      group: false;
    };

export const ACTIVITY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'comments',
    label: 'Postlarınıza gelen yorumlar',
    group: true,
  },
  {
    id: NotificationType.CommentReply,
    label: 'Yorumunuza gelen yanıtlar',
    group: false,
  },
  {
    id: NotificationType.ArticleUpvoteMilestone,
    label: 'Postunuza gelen Upvote’lar',
    group: false,
  },
  {
    id: NotificationType.CommentUpvoteMilestone,
    label: 'Yorumunuza gelen Upvote’lar',
    group: false,
  },
  {
    id: 'mentions',
    label: 'Kullanıcı adınızdan bahsetmeler',
    group: true,
  },
  {
    id: NotificationType.UserReceivedAward,
    label: 'Aldığınız Core ve Ödüller',
    group: false,
  },
  {
    id: NotificationType.ArticleReportApproved,
    label: 'Rapor güncellemeleri',
    group: false,
  },
  {
    id: NotificationType.UserFollow,
    label: 'Yeni takipçiler',
    group: false,
  },
];

export const FOLLOWING_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'following',
    label: 'Takip Edilenler',
    description:
      'Takip ettiğiniz kaynaklar, kullanıcılar, koleksiyonlar veya başlıklar güncellendiğinde bildirim alın. Aşağıdan her birini yönetebilirsiniz.',
    group: true,
  },
  {
    id: NotificationType.SourcePostAdded,
    label: 'Kaynaktan yeni post',
    group: false,
  },
  {
    id: NotificationType.SquadPostAdded,
    label: "Squad'dan yeni post",
    group: false,
  },
  {
    id: NotificationType.UserPostAdded,
    label: 'Kullanıcıdan yeni postlar',
    group: false,
  },
  {
    id: NotificationType.CollectionUpdated,
    label: 'Takip ettiğiniz koleksiyonlar',
    group: false,
  },
  {
    id: NotificationType.PostBookmarkReminder,
    label: 'Daha sonra oku',
    group: false,
  },
  {
    id: 'pollResult',
    label: 'Anket Sonuçları',
    group: true,
    type: 'checkbox',
  },
];

export const STREAK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'streaks',
    label: 'Streak',
    description:
      'Okuma serinizi koruyun ve hiçbir günü kaçırmayın. Streak serinizi korumak veya kırıldığında geri getirmek için hatırlatıcılar alın.',
    group: true,
  },
  {
    id: NotificationType.StreakReminder,
    label: 'Streak serim sona ermeden önce bana bildir',
    group: false,
  },
  {
    id: NotificationType.StreakResetRestore,
    label: 'Bozulan seriyi geri yükle',
    group: false,
  },
  {
    id: NotificationType.StreakFreezeUsed,
    label: 'Streak dondurucu kullanıldı',
    group: false,
  },
  {
    id: NotificationType.StreakFreezeDepleted,
    label: 'Streak dondurucular tükendi',
    group: false,
  },
];

export const CREATORS_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'sourceSubmission',
    label: 'Kaynak önerileri',
    description:
      'İnceleme süreci ve sonuçları dahil olmak üzere önerilen kaynaklarla ilgili bildirimler alın.',
    group: true,
  },
  {
    id: 'squadPostReview',
    label: 'Gönderilen post incelemesi',
    description:
      'Gönderdiğiniz post bir Squad moderatörü tarafından incelendiğinde bildirim alın.',
    group: true,
  },
  {
    id: 'squadRoles',
    label: 'Squad rolleri',
    description:
      'Moderatör veya admin olmak gibi Squad rolünüz değiştiğinde bildirim alın.',
    group: true,
  },
  {
    id: NotificationType.PostAnalytics,
    label: 'Post analitiği',
    description: 'Postlarınızın performansı hakkında güncellemeler alın.',
    group: false,
  },
];

export const DAILY_DEV_NOTIFICATIONS: NotificationItem[] = [
  {
    id: NotificationType.NewUserWelcome,
    label: 'Yeni kullanıcı karşılama',
    description:
      'Platformu kullanmaya başlarken faydalı ipuçları ve rehberlik alın.',
    group: false,
  },
  {
    id: NotificationType.Announcements,
    label: 'Önemli duyurular',
    description:
      'Büyük ürün değişiklikleri, lansmanlar ve önemli şirket haberleri hakkında bilgi alın.',
    group: false,
  },
  {
    id: NotificationType.Marketing,
    label: 'Topluluk & Pazarlama',
    description:
      'Ürün haberleri, etkinlikler, çekilişler ve topluluk özetleri hakkında bildirimler alın.',
    group: false,
  },
];

export const BILLING_NOTIFICATIONS: NotificationItem[] = [
  {
    id: NotificationType.InAppPurchases,
    label: 'Uygulama içi satın alımlar',
    group: false,
  },
];
export const isMutingDigestCompletely = (
  ns: NotificationSettings,
  currentChannel: NotificationChannel,
  notificationType: NotificationType = NotificationType.BriefingReady,
) => {
  const currentChannelStatus = ns[notificationType]?.[currentChannel];
  const otherChannelStatus =
    ns[notificationType]?.[currentChannel === 'inApp' ? 'email' : 'inApp'];

  return (
    otherChannelStatus === 'muted' && currentChannelStatus === 'subscribed'
  );
};
