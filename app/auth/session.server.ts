import { createId } from '@paralleldrive/cuid2';
import {
  createSessionStorage,
  redirect,
  type CookieOptions,
} from 'react-router';
import { z } from 'zod';
import { redisClient } from '~/db/redis.server';
import { env } from '~/env/server';
import { APP_NAME } from '~/lib/consts';
import { sec } from '~/lib/utils';
import { getUserById } from '~/models/users.server';

const SessionDataSchema = z.object({
  userId: z.string(),
  createdAt: z.string(),
  extra: z.record(z.unknown()).optional(),
});

export type SessionData = z.infer<typeof SessionDataSchema>;

interface RedisSessionStorageOptions {
  cookie: Omit<CookieOptions, 'maxAge' | 'expires'> & Record<'name', string>;
  ttl: number; // in seconds
}

function createRedisSessionStorage(options: RedisSessionStorageOptions) {
  const { ttl, cookie } = options;

  const getSessionKey = (id: string) => `session:${id}`;
  const getSessionIndexKey = (id: string) => `session_user:${id}`;
  const getUserSessionsKey = (userId: string) => `user_sessions:${userId}`;

  return createSessionStorage({
    cookie,

    async createData(data) {
      const parsed = SessionDataSchema.safeParse({
        ...data,
        createdAt: data.createdAt ?? new Date().toISOString(),
      });
      if (!parsed.success) {
        throw new Error('Invalid session data');
      }

      const sessionData = parsed.data;
      const id = createId();
      const sessionKey = getSessionKey(id);
      const sessionIndexKey = getSessionIndexKey(id);
      const userSessionsKey = getUserSessionsKey(sessionData.userId);

      const pipeline = redisClient.pipeline();
      pipeline.set(sessionKey, JSON.stringify(sessionData));
      pipeline.expire(sessionKey, ttl);
      pipeline.set(sessionIndexKey, sessionData.userId);
      pipeline.expire(sessionIndexKey, ttl);
      pipeline.sadd(userSessionsKey, id);
      await pipeline.exec();

      return id;
    },

    async readData(id) {
      const sessionKey = getSessionKey(id);
      const rawData = await redisClient.get(sessionKey);

      if (!rawData) return null;

      // Implement sliding expiration
      const ttlRemaining = await redisClient.ttl(sessionKey);
      if (ttlRemaining > 0 && ttlRemaining < ttl / 2) {
        const pipeline = redisClient.pipeline();
        pipeline.expire(sessionKey, ttl);
        pipeline.expire(getSessionIndexKey(id), ttl);
        await pipeline.exec();
      }

      try {
        return JSON.parse(rawData) as SessionData;
      } catch {
        return null;
      }
    },

    async updateData(id, data) {
      const sessionKey = getSessionKey(id);
      const currentData = await redisClient.get(sessionKey);

      if (!currentData) return;

      const parsed = SessionDataSchema.safeParse(data);
      if (!parsed.success) return;

      let createdAt;
      try {
        const current = JSON.parse(currentData);
        createdAt = current.createdAt || new Date().toISOString();
      } catch {
        createdAt = new Date().toISOString();
      }

      const updatedData = {
        ...parsed.data,
        createdAt,
      };

      await redisClient.set(sessionKey, JSON.stringify(updatedData));
      await redisClient.expire(sessionKey, ttl);
    },

    async deleteData(id) {
      const userId = await redisClient.get(getSessionIndexKey(id));
      if (!userId) return;

      const pipeline = redisClient.pipeline();
      pipeline.del(getSessionKey(id));
      pipeline.del(getSessionIndexKey(id));
      pipeline.srem(getUserSessionsKey(userId), id);
      await pipeline.exec();
    },
  });
}

const { commitSession, getSession, destroySession } = createRedisSessionStorage(
  {
    cookie: {
      name: `__${APP_NAME}_session`,
      secrets: [env.AUTH_SESSION_SECRET],
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
    },
    ttl: sec('7 days'),
  },
);

async function createUserSession({
  userId,
  extraData,
}: {
  userId: string;
  extraData?: Record<string, unknown>;
}) {
  const session = await getSession();
  session.set('userId', userId);
  if (extraData) {
    session.set('extra', extraData);
  }

  return commitSession(session);
}

async function getUserSession(request: Request) {
  return getSession(request.headers.get('Cookie'));
}

async function getLoggedInUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') return null;

  return userId;
}

async function getLoggedInUser(request: Request) {
  const userId = await getLoggedInUserId(request);
  if (userId == null) return null;

  return getUserById(userId);
}

async function requireAuth(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const user = await getLoggedInUser(request);
  if (!user) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  return user;
}

async function destroyUserSession(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return destroySession(session);
}

async function destroyAllSessionsForUser(userId: string) {
  const userSessionsKey = `user_sessions:${userId}`;
  const sessionIds = await redisClient.smembers(userSessionsKey);
  if (sessionIds.length === 0) return;

  const pipeline = redisClient.pipeline();
  for (const sessionId of sessionIds) {
    pipeline.del(`session:${sessionId}`);
    pipeline.del(`session_user:${sessionId}`);
  }
  pipeline.del(userSessionsKey);
  await pipeline.exec();
}

async function redirectIfLoggedIn(request: Request) {
  const userId = await getLoggedInUserId(request);
  if (userId !== null) throw redirect('/dashboard/overview');
}

export const authSession = {
  create: createUserSession,
  get: getUserSession,
  getUserId: getLoggedInUserId,
  getUser: getLoggedInUser,
  require: requireAuth,
  destroy: destroyUserSession,
  destroyAllForUser: destroyAllSessionsForUser,
  redirectIfLoggedIn,
};
