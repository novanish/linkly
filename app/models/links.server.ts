import { and, asc, count, desc, eq, gte, lte, sql, sum } from 'drizzle-orm';
import { db } from '~/db';
import { clicks, links, linkSequence } from '~/db/schema.server';
import { PHISHING_STATUS } from '~/lib/consts';
import {
  getCurrentMonthStartAndEnd,
  getCurrentWeekStartAndEnd,
  getLastMonthStartAndEnd,
  getLastWeekStartAndEnd,
  toBase62,
} from '~/lib/utils';

async function checkURLPhishingStatus(url: string) {
  const status = [
    PHISHING_STATUS.SAFE,
    PHISHING_STATUS.PHISHING,
    PHISHING_STATUS.SUSPICIOUS,
  ];
  const randomIndex = Math.floor(Math.random() * status.length);

  return status[randomIndex];
}

export async function createLink(
  data: Omit<typeof links.$inferInsert, 'shortCode' | 'phishingStatus'>,
) {
  const result = await db.execute<Record<'nextval', string>>(
    sql`SELECT NEXTVAL(${linkSequence.seqName})`,
  );
  const shortCode = toBase62(Number(result.rows[0].nextval));
  const phishingStatus = await checkURLPhishingStatus(data.originalUrl);

  return db
    .insert(links)
    .values({ ...data, shortCode, phishingStatus })
    .returning({ id: links.id })
    .then(([result]) => result.id);
}

export function getTopLinks(userId: string, limit = 7) {
  return db.query.links.findMany({
    where: eq(links.userId, userId),
    orderBy: [desc(links.clicksCount), desc(links.createdAt), asc(links.id)],
    limit,
  });
}

export async function getWeeklyLinkStatsByUser(userId: string) {
  const thisWeekRange = getCurrentWeekStartAndEnd();
  const lastWeekRange = getLastWeekStartAndEnd();

  const [[thisWeekStats], [lastWeekStats]] = await Promise.all([
    db
      .select({ totalLinks: count() })
      .from(links)
      .where(
        and(
          eq(links.userId, userId),
          gte(links.createdAt, thisWeekRange.start),
          lte(links.createdAt, thisWeekRange.end),
        ),
      ),

    db
      .select({ totalLinks: count() })
      .from(links)
      .where(
        and(
          eq(links.userId, userId),
          gte(links.createdAt, lastWeekRange.start),
          lte(links.createdAt, lastWeekRange.end),
        ),
      ),
  ]);

  return {
    thisWeek: thisWeekStats.totalLinks,
    lastWeek: lastWeekStats.totalLinks,
  };
}

export function getOriginalUrlAndPhishingStatus(shortCode: string) {
  return db.query.links.findFirst({
    columns: { originalUrl: true, phishingStatus: true },
    where: and(eq(links.shortCode, shortCode), eq(links.isActive, true)),
  });
}

export async function getLinkClickCountStats(userId: string) {
  const thisMonthRange = getCurrentMonthStartAndEnd();
  const lastMonthRange = getLastMonthStartAndEnd();

  const [[thisMonthStats], [lastMonthStats]] = await Promise.all([
    db
      .select({ totalClicks: count() })
      .from(links)
      .where(
        and(
          eq(links.userId, userId),
          gte(clicks.clickedAt, thisMonthRange.start),
          lte(clicks.clickedAt, thisMonthRange.end),
        ),
      )
      .leftJoin(clicks, eq(links.id, clicks.linkId)),

    db
      .select({ totalClicks: count() })
      .from(links)
      .where(
        and(
          eq(links.userId, userId),
          gte(clicks.clickedAt, lastMonthRange.start),
          lte(clicks.clickedAt, lastMonthRange.end),
        ),
      )
      .leftJoin(clicks, eq(links.id, clicks.linkId)),
  ]);

  return {
    thisMonth: thisMonthStats.totalClicks,
    lastMonth: lastMonthStats.totalClicks,
  };
}

export function getTotalClicksInLast24Hours(userId: string) {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return db
    .select({ totalLinks: count() })
    .from(links)
    .where(and(eq(links.userId, userId), gte(clicks.clickedAt, last24Hours)))
    .leftJoin(clicks, eq(links.id, clicks.linkId))
    .then(([result]) => result.totalLinks);
}

export function getTotalLinksCount(userId: string) {
  return db
    .select({ totalLinks: count() })
    .from(links)
    .where(eq(links.userId, userId))
    .then(([result]) => result.totalLinks);
}

export function getLinks(userId: string, limit = 10, page = 1) {
  const offset = (page - 1) * limit;

  return db.query.links.findMany({
    where: eq(links.userId, userId),
    orderBy: desc(links.createdAt),
    limit,
    offset,
  });
}

export function updateLinkActiveStatus({
  userId,
  linkId,
  isActive,
}: UpdateLinkActiveStatusParams) {
  return db
    .update(links)
    .set({ isActive })
    .where(and(eq(links.userId, userId), eq(links.id, linkId)));
}

interface UpdateLinkActiveStatusParams {
  userId: string;
  linkId: string;
  isActive: boolean;
}
