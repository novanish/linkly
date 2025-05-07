import { db } from '~/db';

export function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
}
