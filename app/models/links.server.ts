import { and, asc, count, desc, eq, gte, ilike, or, sql } from 'drizzle-orm';
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

export async function getLinksData(options: GetLinksDataOptions) {
  const { userId, limit = 10, page = 1, search = null } = options;

  const offset = (page - 1) * limit;
  const eqToUserId = eq(links.userId, userId);
  const searchTerm = search ? search.trim().replace(/\s+/g, '-') : null;
  const searchTermRegex = `%${searchTerm}%`;

  const whereCondition = search
    ? and(
        eqToUserId,
        or(
          ilike(links.originalUrl, searchTermRegex),
          ilike(links.customAlias, searchTermRegex),
        ),
      )
    : eqToUserId;

  const result = await Promise.all([
    db.query.links.findMany({
      where: whereCondition,
      orderBy: desc(links.createdAt),
      limit,
      offset,
    }),
    db
      .select({ totalLinks: count() })
      .from(links)
      .where(whereCondition)
      .then(([result]) => result.totalLinks),
  ]);

  return {
    links: result[0],
    totalLinks: result[1],
  };
}

export async function getUserStats(userId: string) {
  const [clickCounts, linkCounts] = await Promise.all([
    getClickStatistics(userId),
    getLinkStatistics(userId),
  ]);

  return {
    newLinksThisMonth: linkCounts.thisMonth || 0,
    newLinksLastMonth: linkCounts.lastMonth || 0,
    clicksThisMonth: clickCounts?.thisMonth || 0,
    clicksLastMonth: clickCounts?.lastMonth || 0,
    clicksLast24Hours: clickCounts?.last24Hours || 0,
    clicksPrevious24Hours: clickCounts?.previous24Hours || 0,
    clicksCurrentWeek: clickCounts?.thisWeek || 0,
    clicksPreviousWeek: clickCounts?.lastWeek || 0,
  };
}

async function getLinkStatistics(
  userId: string,
): Promise<Record<string, number>> {
  const time = getStartAndEndDates();

  const sum = (start: Date, end: Date) =>
    sql`SUM(CASE
      WHEN ${links.createdAt} >= ${start} AND ${links.createdAt} <= ${end}
        THEN 1 ELSE 0 END)`.mapWith(Number);

  const [{ lastMonth, thisMonth }] = await db
    .select({
      thisMonth: sum(time.startOfThisMonth, time.endOfThisMonth),
      lastMonth: sum(time.startOfLastMonth, time.endOfLastMonth),
    })
    .from(links)
    .where(
      and(
        eq(links.userId, userId),
        gte(links.createdAt, time.startOfLastMonth),
      ),
    );

  return { thisMonth, lastMonth };
}

async function getClickStatistics(
  userId: string,
): Promise<Record<string, number>> {
  const time = getStartAndEndDates();

  const sum = (start: Date, end: Date) =>
    sql`SUM(CASE
      WHEN ${clicks.clickedAt} >= ${start} AND ${clicks.clickedAt} <= ${end}
        THEN 1 ELSE 0 END)`.mapWith(Number);

  const result = await db
    .select({
      thisMonth: sum(time.startOfThisMonth, time.endOfThisMonth),
      lastMonth: sum(time.startOfLastMonth, time.endOfLastMonth),
      last24Hours: sum(time.twentyFourHoursAgo, time.now),
      previous24Hours: sum(time.fortyEightHoursAgo, time.twentyFourHoursAgo),
      thisWeek: sum(time.startOfCurrentWeek, time.now),
      lastWeek: sum(time.startOfPreviousWeek, time.endOfPreviousWeek),
    })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        gte(clicks.clickedAt, time.startOfLastMonth),
      ),
    );

  return result[0];
}

interface UpdateLinkActiveStatusParams {
  userId: string;
  linkId: string;
  isActive: boolean;
}

interface GetLinksDataOptions {
  userId: string;
  limit?: number;
  page?: number;
  search?: string | null;
}
