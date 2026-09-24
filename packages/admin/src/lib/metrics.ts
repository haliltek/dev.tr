import { dbQuery } from './db';

export interface RealtimeMetrics {
  visitors: {
    total: number;
    today: number;
    yesterday: number;
    changePercent: number;
    thisWeek: number;
  };
  views: {
    total: number;
    postViewsTotal: number;
    pageviewsTotal: number;
    pageviewsToday: number;
    avgPerVisitor: number;
  };
  online: {
    current: number;
    peakToday: number;
    pulseStatus: 'active' | 'normal' | 'quiet';
  };
  users: {
    total: number;
    today: number;
    thisWeek: number;
    totalUpvotes: number;
    topMembers: Array<{
      id: string;
      name: string;
      username: string;
      image: string;
      reputation: number;
    }>;
  };
  sources: {
    total: number;
  };
  hourlyTimeline: {
    categories: string[];
    visitors: number[];
    pageviews: number[];
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
    desktopPercent: number;
    mobilePercent: number;
    tabletPercent: number;
  };
  browsers: Array<{
    name: string;
    count: number;
    percent: number;
  }>;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    visitors: number;
  }>;
  liveActivity: Array<{
    id: number;
    sessionId: string;
    path: string;
    title: string;
    device: string;
    browser: string;
    city: string;
    agoSeconds: number;
    timestamp: string;
  }>;
  updatedAt: string;
}

export async function getRealtimeMetrics(): Promise<RealtimeMetrics> {
  const now = new Date();

  try {
    // 1. Telemetry Aggregation
    const telemetryAgg = await dbQuery<{
      total_visitors: string;
      total_pageviews: string;
      today_visitors: string;
      today_pageviews: string;
      yesterday_visitors: string;
      online_now: string;
    }>(`
      SELECT 
        COUNT(DISTINCT session_id) as total_visitors,
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE) as today_visitors,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_pageviews,
        COUNT(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE) as yesterday_visitors,
        COUNT(DISTINCT session_id) FILTER (WHERE last_ping >= NOW() - INTERVAL '5 minutes') as online_now
      FROM site_telemetry;
    `);

    // 2. Post & Community Stats
    const statsAgg = await dbQuery<{
      total_users: string;
      today_users: string;
      this_week_users: string;
      total_post_views: string;
      total_upvotes: string;
      total_sources: string;
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM "user") as total_users,
        (SELECT COUNT(*) FROM "user" WHERE "createdAt" >= CURRENT_DATE) as today_users,
        (SELECT COUNT(*) FROM "user" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days') as this_week_users,
        (SELECT COALESCE(SUM(views), 0) FROM post WHERE deleted IS NOT TRUE) as total_post_views,
        (SELECT COALESCE(SUM(upvotes), 0) FROM post WHERE deleted IS NOT TRUE) as total_upvotes,
        (SELECT COUNT(*) FROM source WHERE active IS TRUE) as total_sources;
    `);

    // 3. Hourly Timeline (Last 24 Hours)
    const hourlyRows = await dbQuery<{
      hour_label: string;
      visitors: string;
      pageviews: string;
    }>(`
      SELECT 
        to_char(date_trunc('hour', created_at), 'HH24:00') as hour_label,
        COUNT(DISTINCT session_id) as visitors,
        COUNT(*) as pageviews
      FROM site_telemetry
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY date_trunc('hour', created_at)
      ORDER BY date_trunc('hour', created_at) ASC;
    `);

    // 4. Device Distribution
    const deviceRows = await dbQuery<{
      device_type: string;
      count: string;
    }>(`
      SELECT device_type, COUNT(*) as count 
      FROM site_telemetry 
      GROUP BY device_type;
    `);

    // 5. Browser Distribution
    const browserRows = await dbQuery<{
      browser: string;
      count: string;
    }>(`
      SELECT browser, COUNT(*) as count 
      FROM site_telemetry 
      GROUP BY browser 
      ORDER BY count DESC 
      LIMIT 4;
    `);

    // 6. Top Viewed Pages
    const topPagesRows = await dbQuery<{
      path: string;
      views: string;
      visitors: string;
    }>(`
      SELECT 
        path, 
        COUNT(*) as views, 
        COUNT(DISTINCT session_id) as visitors 
      FROM site_telemetry 
      GROUP BY path 
      ORDER BY views DESC 
      LIMIT 6;
    `);

    // 7. Live Activity Feed
    const activityRows = await dbQuery<{
      id: number;
      session_id: string;
      path: string;
      device_type: string;
      browser: string;
      city: string;
      created_at: Date;
      ago_seconds: string;
    }>(`
      SELECT 
        id, session_id, path, device_type, browser, city, created_at,
        ROUND(EXTRACT(EPOCH FROM (NOW() - created_at))) as ago_seconds
      FROM site_telemetry
      ORDER BY created_at DESC
      LIMIT 8;
    `);

    // 8. Top Members
    const topMembersRows = await dbQuery<{
      id: string;
      name: string | null;
      username: string;
      image: string | null;
      reputation: number | null;
    }>(`
      SELECT id, COALESCE(name, username) as name, username, image, reputation
      FROM "user"
      ORDER BY reputation DESC, "createdAt" DESC
      LIMIT 4;
    `);

    // Calculate aggregations & real values
    const t = telemetryAgg[0] || {
      total_visitors: '0',
      total_pageviews: '0',
      today_visitors: '0',
      today_pageviews: '0',
      yesterday_visitors: '0',
      online_now: '0',
    };

    const s = statsAgg[0] || {
      total_users: '0',
      today_users: '0',
      this_week_users: '0',
      total_post_views: '0',
      total_upvotes: '0',
      total_sources: '0',
    };

    const todayVis = Number(t.today_visitors) || 0;
    const yestVis = Number(t.yesterday_visitors) || 0;
    const changePercent = yestVis > 0 ? Math.round(((todayVis - yestVis) / yestVis) * 100) : 0;

    const totalPostViews = Number(s.total_post_views) || 0;
    const totalPageviews = Number(t.total_pageviews) || 0;
    const totalVisitors = Number(t.total_visitors) || 0;
    const avgPerVisitor = totalVisitors > 0 ? Number((totalPageviews / totalVisitors).toFixed(1)) : 0;

    // Devices
    let desktopCount = 0;
    let mobileCount = 0;
    let tabletCount = 0;
    for (const d of deviceRows) {
      const cnt = Number(d.count) || 0;
      if (d.device_type === 'desktop') desktopCount = cnt;
      else if (d.device_type === 'mobile') mobileCount = cnt;
      else if (d.device_type === 'tablet') tabletCount = cnt;
    }
    const devTotal = desktopCount + mobileCount + tabletCount;

    // Browsers
    const totalBrowsers = browserRows.reduce((acc, b) => acc + (Number(b.count) || 0), 0);
    const browsersList = browserRows.map((b) => ({
      name: b.browser,
      count: Number(b.count) || 0,
      percent: totalBrowsers > 0 ? Math.round(((Number(b.count) || 0) / totalBrowsers) * 100) : 0,
    }));

    // Top Pages with Friendly Labels
    const getPageTitle = (p: string) => {
      if (p === '/') return 'Ana Akış (Keşfet / Feed)';
      if (p === '/posts/discussed') return 'Tartışılanlar / Gündem';
      if (p === '/highlights') return 'Öne Çıkanlar (Highlights)';
      if (p === '/sources') return 'Mühendislik Kaynakları';
      if (p.startsWith('/tags/')) return `#${p.replace('/tags/', '')} Etiketi`;
      if (p.startsWith('/posts/')) return 'Teknoloji İçerik Detayı';
      return p;
    };

    const topPages = topPagesRows.map((p) => ({
      path: p.path,
      title: getPageTitle(p.path),
      views: Number(p.views) || 0,
      visitors: Number(p.visitors) || 0,
    }));

    // Format Timeline Categories - 24 hourly buckets up to current hour
    const hourMap = new Map<string, { visitors: number; pageviews: number }>();
    for (const h of hourlyRows) {
      hourMap.set(h.hour_label, {
        visitors: Number(h.visitors) || 0,
        pageviews: Number(h.pageviews) || 0,
      });
    }

    const categories: string[] = [];
    const timelineVisitors: number[] = [];
    const timelinePageviews: number[] = [];

    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = String(d.getHours()).padStart(2, '0') + ':00';
      categories.push(hourStr);
      const match = hourMap.get(hourStr);
      timelineVisitors.push(match ? match.visitors : 0);
      timelinePageviews.push(match ? match.pageviews : 0);
    }

    const onlineCount = Number(t.online_now) || 0;

    const liveActivity = activityRows.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      path: r.path,
      title: getPageTitle(r.path),
      device: r.device_type,
      browser: r.browser,
      city: r.city || 'Istanbul',
      agoSeconds: Math.max(1, Number(r.ago_seconds) || 1),
      timestamp: new Date(r.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    }));

    return {
      visitors: {
        total: totalVisitors,
        today: todayVis,
        yesterday: yestVis,
        changePercent,
        thisWeek: todayVis,
      },
      views: {
        total: totalPageviews,
        postViewsTotal: totalPostViews,
        pageviewsTotal: totalPageviews,
        pageviewsToday: Number(t.today_pageviews) || 0,
        avgPerVisitor,
      },
      online: {
        current: onlineCount,
        peakToday: onlineCount,
        pulseStatus: onlineCount > 25 ? 'active' : 'normal',
      },
      users: {
        total: Number(s.total_users) || 0,
        today: Number(s.today_users) || 0,
        thisWeek: Number(s.this_week_users) || 0,
        totalUpvotes: Number(s.total_upvotes) || 0,
        topMembers: topMembersRows.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          image: u.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
          reputation: Number(u.reputation) || 100,
        })),
      },
      sources: {
        total: Number(s.total_sources) || 0,
      },
      hourlyTimeline: {
        categories,
        visitors: timelineVisitors,
        pageviews: timelinePageviews,
      },
      devices: {
        desktop: desktopCount,
        mobile: mobileCount,
        tablet: tabletCount,
        desktopPercent: devTotal > 0 ? Math.round((desktopCount / devTotal) * 100) : 0,
        mobilePercent: devTotal > 0 ? Math.round((mobileCount / devTotal) * 100) : 0,
        tabletPercent: devTotal > 0 ? Math.round((tabletCount / devTotal) * 100) : 0,
      },
      browsers: browsersList,
      topPages,
      liveActivity,
      updatedAt: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  } catch (err) {
    console.error('[getRealtimeMetrics Error]', err);
    // Graceful zeroed fallback
    const categories: string[] = [];
    const timelineZero: number[] = [];
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      categories.push(String(d.getHours()).padStart(2, '0') + ':00');
      timelineZero.push(0);
    }

    return {
      visitors: {
        total: 0,
        today: 0,
        yesterday: 0,
        changePercent: 0,
        thisWeek: 0,
      },
      views: {
        total: 0,
        postViewsTotal: 0,
        pageviewsTotal: 0,
        pageviewsToday: 0,
        avgPerVisitor: 0,
      },
      online: {
        current: 0,
        peakToday: 0,
        pulseStatus: 'normal',
      },
      users: {
        total: 0,
        today: 0,
        thisWeek: 0,
        totalUpvotes: 0,
        topMembers: [],
      },
      sources: {
        total: 0,
      },
      hourlyTimeline: {
        categories,
        visitors: timelineZero,
        pageviews: timelineZero,
      },
      devices: {
        desktop: 0,
        mobile: 0,
        tablet: 0,
        desktopPercent: 0,
        mobilePercent: 0,
        tabletPercent: 0,
      },
      browsers: [],
      topPages: [],
      liveActivity: [],
      updatedAt: now.toLocaleTimeString('tr-TR'),
    };
  }
}
