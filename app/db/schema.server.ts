import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const AUTH_PROVIDER = {
  GOOGLE: 'google',
  MAGIC_LINK: 'magic_link',
} as const;

export const authProviderEnum = pgEnum('auth_provider', [
  AUTH_PROVIDER.GOOGLE,
  AUTH_PROVIDER.MAGIC_LINK,
]);

const id = text('id').primaryKey().notNull().$defaultFn(createId);
const createdAt = timestamp('created_at').notNull().defaultNow();
const updatedAt = timestamp('updated_at')
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
  identity: many(identities),
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
  (table) => [unique().on(table.provider, table.providerId)],
);

export const identitiesRelations = relations(identities, ({ one }) => ({
  user: one(users, {
    fields: [identities.userId],
    references: [users.id],
  }),
}));
