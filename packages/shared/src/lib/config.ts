export const isLocalhost =
  process.env.NEXT_PUBLIC_DOMAIN === 'localhost' ||
  process.env.NEXT_PUBLIC_API_URL !== 'https://api.daily.dev';

// In browser environments (window !== 'undefined'), use the proxy rewrite (/api)
// whenever not connecting directly to official daily.dev production API.
// This prevents browsers from failing to resolve internal Docker hostnames (e.g. http://daily-api:5000)
// when accessed via domain names, IPs, or local/remote network setups.
const isOfficialProductionApi =
  process.env.NEXT_PUBLIC_API_URL === 'https://api.daily.dev';

const shouldCallProxyRewrite =
  typeof window !== 'undefined' && !isOfficialProductionApi;

export const apiUrl = shouldCallProxyRewrite
  ? '/api'
  : process.env.NEXT_PUBLIC_API_URL;

export const graphqlUrl = `${apiUrl}/graphql`;

export const fallbackImages = {
  avatar:
    'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
  company:
    'https://media.daily.dev/image/upload/s--9Eda7mil--/t_logo,f_auto/v1766043047/placeholders/Image_noOrg',
};

export const MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP = 3;
export const MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE = 1;
