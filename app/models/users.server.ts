import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { users } from '~/db/schema.server';

export function getUserById(userId: string) {
  return db.query.users.findFirst({
    columns: { updatedAt: false, createdAt: false },
    where: (users, { eq }) => eq(users.id, userId),
  });
}

export function updateUserById(
  userId: string,
  data: Partial<typeof users.$inferInsert>,
) {
  return db.update(users).set(data).where(eq(users.id, userId));
}
