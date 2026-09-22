import type { RadioItemProps } from '../components/fields/RadioItem';

declare const navigator: Navigator & { brave?: { isBrave: unknown } };

// All links point to internal devcore.tr routes
export const stateOfTrust = '/state-of-trust';
export const faq = '/faq';
export const feedback = '/feedback';
export const termsOfService = '/tos';
export const privacyPolicy = '/privacy-policy';
export const cookiePolicy = '/cookie-policy';
export const reputation = '/reputation';
export const ownershipGuide = '/claim';
export const contentGuidelines = '/content-guidelines';
export const companionExplainerVideo = '/companion-overview';
export const companionPermissionGrantedLink = '/try-the-companion';
export const recruiterScheduleUrl = '/recruiter';
export const initialDataKey = 'initial';
export const install = '/apps';
export const uninstall = '/feedback';
export const sharingBookmarks = '/bookmarks';
export const devCard = '/devcard';
export const docs = '/docs';
export const plusPublicApiDocs = '/docs/plus/public-api';
export const plusOverviewDocs = '/plus';
export const trustpilotReviews = '/reviews';
export const chipsDocs = '/chips';
export const markdownGuide = '/markdown-guide';
export const careers = '/careers';
export const firstNotificationLink = '/notifications';
export const reportSquadMember = '/report';
export const squadFeedback = '/feedback';
export const downloadBrowserExtension = '/apps';
export const twitter = 'https://twitter.com/devcoretr';
export const slackIntegration = '/slack';
export const statusPage = '/status';
export const businessWebsiteUrl = '/';
export const appsUrl = 'https://devcore.tr/apps';
export const appStoreUrl = 'https://devcore.tr/apps';
export const playStoreUrl = 'https://devcore.tr/apps';
export const timezoneSettingsUrl = '/settings';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProductionAPI =
  process.env.NEXT_PUBLIC_API_URL === 'https://api.daily.dev';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting =
  process.env.NODE_ENV === 'test' || (!isDevelopment && !isProduction);
export const isGBDevMode = process.env.NEXT_PUBLIC_GB_DEV_MODE === 'true';

export const isBrave = (): boolean => {
  if (typeof window === 'undefined' || !window.Promise) {
    return false;
  }
  return typeof navigator.brave?.isBrave === 'function';
};
export const isChrome = (): boolean =>
  /Chrome/.test(globalThis?.navigator?.userAgent) &&
  /Google Inc/.test(globalThis?.navigator?.vendor);

export const webappUrl = (process.env.NEXT_PUBLIC_WEBAPP_URL || '/').replace(
  /\/?$/,
  '/',
);
export const gameCenterMilestoneSectionId = 'milestone-quests';
export const onboardingUrl = `${webappUrl}onboarding`;
export const plusUrl = `${webappUrl}plus`;
export const managePlusUrl = '/plus';
export const plusDetailsUrl = '/plus';
export const plusSuccessUrl = `${plusUrl}/success`;
export const walletUrl = `${webappUrl}wallet`;
export const settingsUrl = `${webappUrl}settings`;
export const briefingUrl = `${webappUrl}briefing`;
export const scheduledPostsUrl = `${webappUrl}scheduled`;
export const opportunityUrl = `${webappUrl}jobs`;
export const recruiterUrl = `${webappUrl}recruiter`;
export const watercoolerUrl = `${webappUrl}watercooler`;
// The squad backing the /watercooler feed. This is the single point of
// configuration for the feature: swapping it repoints the feed, the posting
// gate and the join-on-post flow at a different squad, no other change needed.
// The source query resolves either an id or a handle, so both work here.
export const watercoolerSquadId = 'fd062672-63b7-4a10-87bd-96dcd10e9613';
export const boostOpportunityLink = '/boost';

export const migrateUserToStreaks = '/streaks';
export const topReaderBadgeDocs = '/badges';
export const plusOrganizationInfo = '/organizations';

export const squadCategoriesPaths = {
  'My Squads': '/squads/discover/my',
  discover: '/squads/discover',
  featured: '/squads/discover/featured',
};

export const AD_PLACEHOLDER_SOURCE_ID = '__dailydotdev_app_ad_placeholder__';

export const emojiOptions = [
  '',
  '🐹',
  '🐍',
  '☕️',
  '🔥',
  '📦',
  '⚙️',
  '🐙',
  '🐳',
  '💡',
  '📜',
  '🚀',
];

export enum FeedOrder {
  Recommended = 'recommended',
  Date = 'date',
  Upvotes = 'upvotes',
  Downvotes = 'downvotes',
  Comments = 'comments',
  Clicks = 'clicks',
}

export const feedRangeFilters: RadioItemProps[] = [
  {
    label: 'All time',
    value: 'all',
  },
  {
    label: 'Past 24 hours',
    value: '1',
  },
  {
    label: 'Past week',
    value: '7',
  },
  {
    label: 'Past month',
    value: '30',
  },
];

/*
  The list below must match the Confluence page attached
  https://dailydotdev.atlassian.net/wiki/spaces/HAN/pages/1571946510/Restricted+countries+for+business+activities+aka+sanctioned+countries#Restricted-Countries-and-Regions
*/
export const invalidPlusRegions = [
  'AF', // Afghanistan
  'AQ', // Antarctica
  'BY', // Belarus
  'MM', // Burma (Myanmar)
  'CF', // Central African Republic
  'UA-43', // Crimea (Region of Ukraine)
  'CU', // Cuba
  'CD', // Democratic Republic of Congo
  'UA-14', // Donetsk (Region of Ukraine)
  'HT', // Haiti
  'IR', // Iran
  'IQ', // Iraq
  'UA-65', // Kherson (Region of Ukraine)
  'LB', // Lebanon
  'LY', // Libya
  'UA-09', // Luhansk (Region of Ukraine)
  'ML', // Mali
  'AN', // Netherlands Antilles
  'NI', // Nicaragua
  'KP', // North Korea
  'RU', // Russia
  'SO', // Somalia
  'SS', // South Sudan
  'SD', // Sudan
  'SY', // Syria
  'VE', // Venezuela
  'YE', // Yemen
  'UA-23', // Zaporizhzhia (Region of Ukraine)
  'ZW', // Zimbabwe
];

export const DeletedPostId = '404';

export const BROADCAST_CHANNEL_NAME = 'dailydev_broadcast';
export const broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

export const coresDocsLink = '/cores';

export const webFunnelPrefix = '/helloworld';

export const creatorsTermsOfService = '/tos';

export const boostDocsLink = '/boost';

export const recruiterBookLink = '/recruiter';
