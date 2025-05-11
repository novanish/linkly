import { and, asc, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '~/db';
import { clicks, links, linkSequence } from '~/db/schema.server';
import { PHISHING_STATUS } from '~/lib/consts';
import { getStartAndEndDates, toBase62 } from '~/lib/utils';

async function checkURLPhishingStatus(url: string) {
  console.log('Checking URL phishing status:', url);
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

export function getOriginalUrl(identifier: string, isShortCode: boolean) {
  return db.query.links.findFirst({
    columns: { id: true, originalUrl: true, phishingStatus: true },
    where: and(
      isShortCode
        ? eq(links.shortCode, identifier)
        : eq(links.customAlias, identifier),
      eq(links.isActive, true),
    ),
  });
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

export function deleteLinkById({
  userId,
  linkId,
}: Record<'userId' | 'linkId', string>) {
  return db
    .delete(links)
    .where(and(eq(links.userId, userId), eq(links.id, linkId)));
}

interface UpdateLinkActiveStatusParams {
  userId: string;
  linkId: string;
  isActive: boolean;
}

async function getLinksCount(userId: string, start: Date, end: Date) {
  const result = await db
    .select({ count: count() })
    .from(links)
    .where(
      and(
        eq(links.userId, userId),
        gte(links.createdAt, start),
        lte(links.createdAt, end),
      ),
    );
  return result[0].count;
}

async function getClicksCount(userId: string, start: Date, end: Date) {
  const result = await db
    .select({ count: count() })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        gte(clicks.clickedAt, start),
        lte(clicks.clickedAt, end),
      ),
    );
  return result[0].count;
}

export async function getUserStats(userId: string) {
  const {
    startOfThisMonth,
    endOfThisMonth,
    startOfLastMonth,
    endOfLastMonth,
    twentyFourHoursAgo,
    fortyEightHoursAgo,
    startOfCurrentWeek,
    startOfPreviousWeek,
    endOfPreviousWeek,
    now,
  } = getStartAndEndDates();

  const [
    newLinksThisMonth,
    newLinksLastMonth,
    clicksThisMonth,
    clicksLastMonth,
    clicksLast24Hours,
    clicksPrevious24Hours,
    clicksCurrentWeek,
    clicksPreviousWeek,
  ] = await Promise.all([
    getLinksCount(userId, startOfThisMonth, endOfThisMonth),
    getLinksCount(userId, startOfLastMonth, endOfLastMonth),
    getClicksCount(userId, startOfThisMonth, endOfThisMonth),
    getClicksCount(userId, startOfLastMonth, endOfLastMonth),
    getClicksCount(userId, twentyFourHoursAgo, now),
    getClicksCount(userId, fortyEightHoursAgo, twentyFourHoursAgo),
    getClicksCount(userId, startOfCurrentWeek, now),
    getClicksCount(userId, startOfPreviousWeek, endOfPreviousWeek),
  ]);

  return {
    newLinksThisMonth,
    newLinksLastMonth,
    clicksThisMonth,
    clicksLastMonth,
    clicksLast24Hours,
    clicksPrevious24Hours,
    clicksCurrentWeek,
    clicksPreviousWeek,
  };
}
