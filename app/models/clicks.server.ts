import { createId } from '@paralleldrive/cuid2';
import { and, eq, gte, sql } from 'drizzle-orm';
import ms from 'ms';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import { UAParser } from 'ua-parser-js';
import { db } from '~/db';
import { clicks, links, TRAFFIC_SOURCE } from '~/db/schema.server';
import { DEVICE_TYPE } from '~/lib/consts';
import { retry, type RetryOptions } from '~/lib/utils';

export async function recordClickAnalytics(request: Request, linkId: string) {
  try {
    const headers = request.headers;
    const referrer = headers.get('referer') || null;
    const ua = headers.get('user-agent') || 'unknown';

    const ipAddress = getClientIPAddress(request) || 'unknown';
    const trafficSource = determineTrafficSource(request);
    const parsedUA = UAParser(ua);

    const data = {
      id: createId(),
      linkId,
      ipAddress,
      referrer,
      trafficSource,
      deviceType: getDeviceType(parsedUA),
      clickedAt: new Date(),
    } satisfies typeof clicks.$inferInsert;

    const insertClickAndIncrementCount = async () => {
      await db.transaction(async (tx) => {
        await tx.insert(clicks).values(data);

        await tx
          .update(links)
          .set({ clicksCount: sql`${links.clicksCount} + 1` })
          .where(eq(links.id, linkId));
      });
    };

    const retryOptions: RetryOptions = {
      attempts: 4,
      retryAfter: ms('3 seconds'),
    };

    retry(insertClickAndIncrementCount, retryOptions);
  } catch (error) {
    console.error('Error recording click analytics:', error);
  }
}

export async function calculateTrafficSourcePercentages(userId: string) {
  const countByTrafficSource = (source: string) =>
    sql`COUNT(CASE WHEN traffic_source = ${source} THEN 1 END)`.mapWith(Number);

  const [result] = await db
    .select({
      direct: countByTrafficSource(TRAFFIC_SOURCE.DIRECT),
      social: countByTrafficSource(TRAFFIC_SOURCE.SOCIAL),
      email: countByTrafficSource(TRAFFIC_SOURCE.EMAIL),
    })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(eq(links.userId, userId));

  const totalClicks = Object.values(result).reduce(
    (acc, count) => acc + count,
    0,
  );
  const directPercentage = (result[TRAFFIC_SOURCE.DIRECT] / totalClicks) * 100;
  const socialPercentage = (result[TRAFFIC_SOURCE.SOCIAL] / totalClicks) * 100;
  const emailPercentage = (result[TRAFFIC_SOURCE.EMAIL] / totalClicks) * 100;

  return {
    [TRAFFIC_SOURCE.DIRECT]: directPercentage.toFixed(2),
    [TRAFFIC_SOURCE.SOCIAL]: socialPercentage.toFixed(2),
    [TRAFFIC_SOURCE.EMAIL]: emailPercentage.toFixed(2),
  };
}

export async function getClickActivityLast7Days(userId: string) {
  const last7Days = new Date(Date.now() - ms('7d'));

  const result = await db
    .select({
      date: sql`DATE(clicked_at)`.mapWith((date) => new Date(date)),
      clicks: sql`COUNT(*)`.mapWith(Number),
    })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(and(eq(links.userId, userId), gte(clicks.clickedAt, last7Days)))
    .groupBy(sql`DATE(clicked_at)`)
    .orderBy(sql`DATE(clicked_at)`);

  const NUMBER_OF_DAYS = 7;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();

  return Array.from({ length: NUMBER_OF_DAYS }).map((_, index) => {
    date.setDate(date.getDate() - index);
    const formattedDate = date.toISOString().split('T')[0];

    const clickData = result.find((item) => {
      const itemDate = item.date.toISOString().split('T')[0];
      return itemDate === formattedDate;
    });

    return {
      name: days[date.getDay()],
      clicks: clickData ? clickData.clicks : 0,
    };
  });
}

export async function getClickActivityByHour(userId: string) {
  const last24Hours = new Date(Date.now() - ms('24h'));

  const clickData = await db
    .select({
      hour: sql`EXTRACT(HOUR FROM clicked_at)`.mapWith(Number),
      clicks: sql`COUNT(*)`.mapWith(Number),
    })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(and(eq(links.userId, userId), gte(clicks.clickedAt, last24Hours)))
    .groupBy(sql`EXTRACT(HOUR FROM clicked_at)`);

  const clicksByHour = new Map();
  clickData.forEach((item) => {
    clicksByHour.set(item.hour, item.clicks);
  });

  const intervalSize = 3;
  const result = [];

  for (
    let intervalStart = 0;
    intervalStart < 24;
    intervalStart += intervalSize
  ) {
    let maxClicks = 0;
    let maxHour = intervalStart;

    for (
      let hour = intervalStart;
      hour < intervalStart + intervalSize;
      hour++
    ) {
      const hourMod24 = hour % 24;
      const clicks = clicksByHour.get(hourMod24) || 0;

      if (clicks > maxClicks) {
        maxClicks = clicks;
        maxHour = hourMod24;
      }
    }

    const formattedHour = maxHour % 12 || 12;
    const amPm = maxHour < 12 ? 'AM' : 'PM';

    result.push({
      hour: `${formattedHour} ${amPm}`,
      clicks: maxClicks,
    });
  }

  return result;
}

function determineTrafficSource(request: Request) {
  const referer = request.headers.get('referer');

  if (!referer) {
    return TRAFFIC_SOURCE.DIRECT;
  }

  const socialDomains = [
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'linkedin.com',
    't.co',
    'fb.me',
    'reddit.com',
    'x.com',
  ];
  if (socialDomains.some((domain) => referer.includes(domain))) {
    return TRAFFIC_SOURCE.SOCIAL;
  }

  const emailDomains = [
    'mail.google.com',
    'outlook.com',
    'yahoo.mail',
    'mail.yahoo.com',
  ];
  if (emailDomains.some((domain) => referer.includes(domain))) {
    return TRAFFIC_SOURCE.EMAIL;
  }

  return TRAFFIC_SOURCE.DIRECT;
}

function getDeviceType({ device, os }: UAParser.IResult) {
  switch (device.type) {
    case 'mobile':
      return DEVICE_TYPE.MOBILE;
    case 'tablet':
      return DEVICE_TYPE.TABLET;
  }

  if (device.type == null && os.name && isDesktopOS(os.name)) {
    return DEVICE_TYPE.DESKTOP;
  }

  return DEVICE_TYPE.UNKNOWN;
}

function isDesktopOS(osName: string) {
  const desktopOSNames = [
    'Windows',
    'Mac OS',
    'macOS',
    'Linux',
    'Ubuntu',
    'Debian',
    'Fedora',
    'CentOS',
    'Red Hat',
    'Chrome OS',
  ];

  return desktopOSNames.some((desktop) =>
    osName.toLowerCase().includes(desktop.toLowerCase()),
  );
}
