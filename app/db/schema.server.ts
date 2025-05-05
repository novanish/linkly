import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const AUTH_PROVIDER = {
  GOOGLE: 'google',
  MAGIC_LINK: 'magic_link',
} as const;

export const PHISHING_STATUS = {
  SAFE: 'safe',
  PHISHING: 'phishing',
  SUSPICIOUS: 'suspicious',
} as const;

export const TRAFFIC_SOURCE = {
  DIRECT: 'direct',
  SOCIAL: 'social',
  EMAIL: 'email',
} as const;

export const authProviderEnum = pgEnum('auth_provider', [
  AUTH_PROVIDER.GOOGLE,
  AUTH_PROVIDER.MAGIC_LINK,
]);

export const phishingStatusEnum = pgEnum('phishing_status', [
  PHISHING_STATUS.SAFE,
  PHISHING_STATUS.PHISHING,
  PHISHING_STATUS.SUSPICIOUS,
]);

export const trafficSourceEnum = pgEnum('traffic_source', [
  TRAFFIC_SOURCE.DIRECT,
  TRAFFIC_SOURCE.SOCIAL,
  TRAFFIC_SOURCE.EMAIL,
]);

const id = text('id').primaryKey().notNull().$defaultFn(createId);
const createdAt = timestamp('created_at', { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = timestamp('updated_at', { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const users = pgTable('users', {
  id,
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),

  createdAt,
  updatedAt,
});

export const usersRelations = relations(users, ({ many }) => ({
  identities: many(identities),
  links: many(links),
}));

export const identities = pgTable(
  'identities',
  {
    id,
    userId: text('user_id').references(() => users.id),
    provider: authProviderEnum('provider').notNull(),
    providerId: text('provider_id').notNull(),

    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('idx_user_id_provider').on(table.userId, table.provider),
  ],
);

export const identitiesRelations = relations(identities, ({ one }) => ({
  user: one(users, {
    fields: [identities.userId],
    references: [users.id],
  }),
}));

export const links = pgTable(
  'links',
  {
    id,
    userId: text('user_id').references(() => users.id),

    shortCode: text('short_code').notNull(),
    originalUrl: text('original_url').notNull(),
    customAlias: text('custom_alias'),

    isActive: boolean('is_active').default(true).notNull(),
    phishingStatus: phishingStatusEnum('phishing_status').notNull(),

    createdAt,
    updatedAt,
  },
  (table) => [
    index('idx_user_id').on(table.userId),
    index('idx_is_active').on(table.isActive),
    uniqueIndex('idx_short_code').on(table.shortCode),
    uniqueIndex('idx_custom_alias')
      .on(table.customAlias)
      .where(sql`${table.customAlias} IS NOT NULL`),
  ],
);

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
  clicks: many(clicks),
}));

export const clicks = pgTable(
  'clicks',
  {
    id,
    linkId: text('link_id').references(() => links.id),

    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    referrer: text('referrer'),
    trafficSource: trafficSourceEnum('traffic_source').notNull(),

    clickedAt: timestamp('clicked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_link_id').on(table.linkId),
    index('idx_traffic_source').on(table.trafficSource),
    index('idx_clicked_at').on(table.clickedAt),
  ],
);

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, {
    fields: [clicks.linkId],
    references: [links.id],
  }),
}));
