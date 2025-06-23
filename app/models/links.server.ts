import { endOfDay } from 'date-fns';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  SQL,
  sql,
} from 'drizzle-orm';
import { db } from '~/db';
import { isUniqueViolationError } from '~/db/errors.server';
import { clicks, links, linkSequence } from '~/db/schema.server';
import { orderByEnum } from '~/db/utils.server';
import { PHISHING_STATUS } from '~/lib/consts';
import { getStartAndEndDates, toBase62 } from '~/lib/utils';
import type { UpdateLinkSchema } from '~/validations/link.schema';

async function getURLPhishingStatus(url: string) {
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
  const phishingStatus = await getURLPhishingStatus(data.originalUrl);

  return db
    .insert(links)
    .values({ ...data, shortCode, phishingStatus })
    .returning({ id: links.id })
    .then(([result]) => result.id);
}

export async function updateLink(
  userId: string,
  linkId: string,
  data: UpdateLinkSchema,
) {
  const dataToUpdate = {
    ...data,
    phishingStatus: data.originalUrl
      ? await getURLPhishingStatus(data.originalUrl)
      : undefined,
  } satisfies Partial<typeof links.$inferInsert>;

  return db
    .update(links)
    .set(dataToUpdate)
    .where(and(eq(links.userId, userId), eq(links.id, linkId)));
}

export function getLinkForEdit({
  userId,
  linkId,
}: Record<'userId' | 'linkId', string>) {
  return db.query.links.findFirst({
    columns: {
      isActive: true,
      originalUrl: true,
      customAlias: true,
      trackClicks: true,
    },
    where: and(eq(links.userId, userId), eq(links.id, linkId)),
  });
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
    columns: {
      id: true,
      originalUrl: true,
      phishingStatus: true,
      trackClicks: true,
    },
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
  const {
    to,
    from,
    userId,
    search,
    isActive,
    page = 1,
    limit = 10,
    phishingStatus,
    orderBy = 'createdAt',
    orderDirection = 'desc',
  } = options;

  const conditions: Array<SQL | undefined> = [eq(links.userId, userId)];
  const offset = (page - 1) * limit;

  if (search) {
    const searchTerm = search ? search.trim().replace(/\s+/g, '-') : null;
    const searchTermRegex = `%${searchTerm}%`;
    conditions.push(
      or(
        ilike(links.originalUrl, searchTermRegex),
        ilike(links.customAlias, searchTermRegex),
      ),
    );
  }

  if (isActive && isActive.length > 0) {
    conditions.push(inArray(links.isActive, isActive));
  }

  if (phishingStatus && phishingStatus.length > 0) {
    conditions.push(inArray(links.phishingStatus, phishingStatus));
  }

  if (from && to) {
    conditions.push(
      and(gte(links.createdAt, from), lte(links.createdAt, endOfDay(to))),
    );
  } else if (from) {
    conditions.push(gte(links.createdAt, from));
  } else if (to) {
    conditions.push(lte(links.createdAt, endOfDay(to)));
  }

  const orderByPhishingStatus = orderByEnum(
    links.phishingStatus,
    [
      PHISHING_STATUS.SAFE,
      PHISHING_STATUS.SUSPICIOUS,
      PHISHING_STATUS.PHISHING,
    ],
    orderDirection,
  );

  const where = and(...conditions);
  const orderByClause =
    orderBy === 'phishingStatus'
      ? orderByPhishingStatus
      : orderDirection === 'asc'
        ? asc(links[orderBy])
        : desc(links[orderBy]);

  const result = await Promise.all([
    db.query.links.findMany({
      columns: { userId: false, updatedAt: false },
      where,
      orderBy: orderByClause,
      limit,
      offset,
    }),

    db
      .select({ totalLinks: count() })
      .from(links)
      .where(where)
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

export function isDuplicateCustomAliasError(error: unknown) {
  return isUniqueViolationError(error, 'idx_custom_alias');
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
  orderBy?: 'createdAt' | 'clicksCount' | 'isActive' | 'phishingStatus';
  orderDirection?: 'asc' | 'desc';
  phishingStatus?: Array<ValueOf<typeof PHISHING_STATUS>> | null;
  from?: Date | null;
  to?: Date | null;
  isActive?: Array<boolean> | null;
}

type ValueOf<T> = T[keyof T];
