import Redis from 'ioredis';
import { env } from '~/env/server';

export const redisClient = new Redis(env.REDIS_URL);
