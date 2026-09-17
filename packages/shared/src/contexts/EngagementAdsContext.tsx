import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type {
  EngagementCreative,
  EngagementPlacement,
  ResolvedCreative,
} from '../lib/engagementAds';
import {
  findCreativeForPlacement,
  findCreativeForTags,
  findCreativeForTool,
  parseCreatives,
  resolveCreative,
} from '../lib/engagementAds';
import { useIsLightTheme } from '../hooks/utils/useThemedAsset';
import { useAuthContext } from './AuthContext';
import { isProduction } from '../lib/constants';

interface EngagementAdsContextValue {
  /** All creatives from boot, theme-resolved */
  creatives: ResolvedCreative[];

  /** Find a creative matching specific tags (stateless lookup) */
  getCreativeForTags: (tags: string[]) => ResolvedCreative | null;

  /** Find a creative whose tools list includes the given tool name */
  getCreativeForTool: (toolName?: string | null) => ResolvedCreative | null;

  /** Find a creative that opted into a prominent placement (banner/strip) */
  getCreativeForPlacement: (
    placement: EngagementPlacement,
  ) => ResolvedCreative | null;
}

const defaultValue: EngagementAdsContextValue = {
  creatives: [],
  getCreativeForTags: () => null,
  getCreativeForTool: () => null,
  getCreativeForPlacement: () => null,
};

const EngagementAdsContext =
  createContext<EngagementAdsContextValue>(defaultValue);

export const useEngagementAdsContext = (): EngagementAdsContextValue =>
  useContext(EngagementAdsContext);

interface EngagementAdsProviderProps {
  children: ReactNode;
  rawCreatives?: EngagementCreative[];
}

export const EngagementAdsProvider = ({
  children,
  rawCreatives,
}: EngagementAdsProviderProps): ReactElement => {
  const isLight = useIsLightTheme();
  const { user } = useAuthContext();

  const resolvedCreatives = useMemo(() => {
    if (isProduction && user?.isPlus) {
      return [];
    }

    const parsed = parseCreatives(rawCreatives);
    const customized = parsed.map((c) => {
      if (c.gen_id === 'mock-engagement-gen-id') {
        return {
          ...c,
          promoted_name: 'devcore.tr',
          promoted_body: "Türkiye'nin en nitelikli geliştirici ekosistemi. Teknik makaleleri keşfet, deneyimlerini paylaş.",
          promoted_cta: 'Topluluğa Katıl',
          promoted_url: '/reklam',
          promoted_gradient_start: { dark: '#1e40af', light: '#2563eb' },
          promoted_gradient_end: { dark: '#0369a1', light: '#0284c7' },
          tools: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
          keywords: ['yazılım', 'geliştirici', 'topluluk', 'mühendislik'],
          tags: ['react', 'nextjs', 'typescript', 'backend', 'devops', 'ai', 'cloud'],
        };
      }
      return c;
    });

    return customized.map((c) => resolveCreative(c, isLight));
  }, [rawCreatives, isLight, user?.isPlus]);

  const getCreativeForTags = useCallback(
    (tags: string[]) => findCreativeForTags(resolvedCreatives, tags),
    [resolvedCreatives],
  );

  const getCreativeForTool = useCallback(
    (toolName?: string | null) =>
      findCreativeForTool(resolvedCreatives, toolName),
    [resolvedCreatives],
  );

  const getCreativeForPlacement = useCallback(
    (placement: EngagementPlacement) =>
      findCreativeForPlacement(resolvedCreatives, placement),
    [resolvedCreatives],
  );

  const contextValue = useMemo(
    () => ({
      creatives: resolvedCreatives,
      getCreativeForTags,
      getCreativeForTool,
      getCreativeForPlacement,
    }),
    [
      resolvedCreatives,
      getCreativeForTags,
      getCreativeForTool,
      getCreativeForPlacement,
    ],
  );

  return (
    <EngagementAdsContext.Provider value={contextValue}>
      {children}
    </EngagementAdsContext.Provider>
  );
};
