/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  GdprConsentKey,
  otherGdprConsents,
} from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { useConsentCookie } from '@dailydotdev/shared/src/hooks/useCookieConsent';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { requiresCertifiedCmp } from '@dailydotdev/shared/src/lib/geo';
import { iubendaLocalizedPolicyIds } from '@dailydotdev/shared/src/lib/iubenda';
import { startTcfSubscription } from '@dailydotdev/shared/src/lib/tcf';
import { enhanceIubendaBannerNow, watchIubendaBanner } from './iubendaBanner';

/**
 * Loads the iubenda Cookie Solution (IAB TCF mode) for every visitor outside
 * the funnel and the iOS native wrapper; `countryDetection` +
 * `gdprAppliesGlobally:false` let iubenda decide which consent regime (if
 * any) applies, exactly like the marketing sites — where none does, no
 * banner shows. Whatever iubenda decides is mirrored into the first-party
 * `ilikecookies*` cookies so all existing gating (Pixels, settings, ad
 * consent fallback) keeps working.
 *
 * The configuration mirrors the marketing sites' embed (recruiter-landing,
 * custom-scripts/head.html) — same account, same policy, same first layer
 * (applyStyles:false + styles/iubenda.css + iubendaBanner.ts) —
 * so every daily.dev property shows one consent card. Deliberate deviations:
 * `localConsentDomain` (consent shared across *.daily.dev),
 * `invalidateConsentWithoutLog`, and no floating preferences badge —
 * settings/privacy is the in-app withdrawal entry point.
 */

type IubendaPreference = {
  // TCF banners answer per purpose; LGPD/USPR report one verdict for the
  // whole banner in `consent`
  consent?: boolean;
  purposes?: Record<string, boolean>;
};

type IubendaWindow = typeof globalThis & {
  _iub?: {
    csConfiguration?: Record<string, unknown>;
    csLangConfiguration?: Record<string, { cookiePolicyId: number }>;
    cs?: {
      api?: { openPreferences?: () => void; isConsentGiven?: () => boolean };
    };
  };
};

// TCF purpose 5 is "personalised advertising", the one `ilikecookies_marketing`
// stands for. Outside TCF the banner records a single verdict instead, so read
// that, and fall back to asking the CMP what it stored — never leave an
// expressed preference unclassified, or consent granted in the CMP and the
// consent our own gating sees drift apart.
const readMarketingConsent = (pref: IubendaPreference): boolean => {
  if (pref.purposes) {
    return pref.purposes['5'] === true;
  }

  if (typeof pref.consent === 'boolean') {
    return pref.consent;
  }

  const api = (globalThis as IubendaWindow)._iub?.cs?.api;

  return api?.isConsentGiven?.() === true;
};

// The consent-sync call comes first and the TCF stub before anything that
// could query `window.__tcfapi`, mirroring iubenda's dashboard snippet.
//
// The TCF pair loads only for GDPR-covered visitors: Google's ad tags hold
// every ad request on any page where `__tcfapi` exists until the CMP delivers
// a terminal answer, which iubenda only does once the banner is actioned — so
// a worldwide stub gated ads on consent in countries where no consent is
// required (and where Google itself requires no CMP). Outside GDPR scope the
// banner still shows and records preferences; ads just don't wait for it.
// The GPP stub is scoped the same way for the same reason: `window.__gpp` is
// another consent API Google's tags can wait on, and the US state laws it
// carries (enableUspr) apply to US visitors only.
const getIubendaScripts = (
  siteId: string,
  withTcf: boolean,
  withGpp: boolean,
): string[] => [
  `https://cs.iubenda.com/sync/${siteId}.js`,
  ...(withTcf
    ? [
        'https://cdn.iubenda.com/cs/tcf/stub-v2.js',
        'https://cdn.iubenda.com/cs/tcf/safe-tcf-v2.js',
      ]
    : []),
  ...(withGpp ? ['https://cdn.iubenda.com/cs/gpp/stub.js'] : []),
  'https://cdn.iubenda.com/cs/iubenda_cs.js',
];

export const openIubendaPreferences = (): boolean => {
  const api = (globalThis as IubendaWindow)._iub?.cs?.api;

  if (!api?.openPreferences) {
    return false;
  }

  api.openPreferences();
  return true;
};

export const Iubenda = (): ReactElement | null => {
  return null;
};

