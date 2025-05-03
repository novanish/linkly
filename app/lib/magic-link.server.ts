import crypto from 'node:crypto';
import { redisClient } from '~/db/redis.server';
import { env } from '~/env/server';
import { MAGIC_LINK_EXPIRES_IN } from './consts';
import { sec } from './utils';

function getKey(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return `magic_link:${tokenHash}`;
}

export async function createMagicLinkToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const key = getKey(token);
  await redisClient.set(key, email, 'EX', sec(MAGIC_LINK_EXPIRES_IN));

  return token;
}

export async function generateMagicLink(email: string) {
  const token = await createMagicLinkToken(email);

  const url = new URL('/auth/verify-magic-link', env.ORIGIN);
  url.searchParams.set('token', token);

  return url.toString();
}

export async function verifyMagicLinkToken(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return { email: null, isValid: false };
  }

  const key = getKey(token);
  const storedEmail = await redisClient.getdel(key);
  if (!storedEmail) {
    return { email: null, isValid: false };
  }

  return { email: storedEmail, isValid: true };
}
