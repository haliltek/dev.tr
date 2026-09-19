// Generic "{Company} News" SERPs are consumer-news territory and collide with
// real products (Google News, Apple News), so company tags target the
// dev-scoped query instead.
const COMPANY_TAGS = new Set([
  'google',
  'microsoft',
  'apple',
  'amazon',
  'openai',
  'nvidia',
  'intel',
  'anthropic',
  'samsung',
  'netflix',
  'tesla',
]);

// Wins over a backend-set keyword title on purpose: "Tech News" is the highest
// impressions tag page and the default template would stutter into
// "Tech News News & Updates".
const HAND_SET_TITLES: Record<string, string> = {
  'tech-news': 'Teknoloji Haberleri: En Son Gelişmeler',
};

// Variant rules match the slug rather than the display title, since the display
// title comes from backend-editable keyword flags. The stutter check is the
// exception: it guards the rendered string.
export const getTagSeoTitle = (tag: string, tagTitle: string): string => {
  // Tag slugs are lowercase, but the route param keeps the casing of the URL.
  const slug = tag.toLowerCase();

  const handSet = HAND_SET_TITLES[slug];
  if (handSet) {
    return handSet;
  }

  if (/\bnews\b/i.test(tagTitle)) {
    return `${tagTitle}: En Son Güncellemeler ve Tartışmalar`;
  }

  if (COMPANY_TAGS.has(slug)) {
    return `${tagTitle} Geliştirici Haberleri ve Güncellemeleri`;
  }

  return `${tagTitle} Haberleri ve Güncellemeleri`;
};
