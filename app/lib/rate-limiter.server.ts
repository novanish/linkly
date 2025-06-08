import type Redis from 'ioredis';
import { redisClient } from '~/db/redis.server';

class FixedWindowRateLimiter implements RateLimiter {
  constructor(private readonly redis: Redis) {}

  async check(
    identifier: string,
    options: RateLimiterOptions,
  ): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier, options.name);
    const tx = this.redis.multi();
    tx.get(key);
    tx.ttl(key);
    const result = await tx.exec();

    if (!result) {
      throw new Error('Failed to get rate limit info');
    }
    const [countErr, count] = result[0];
    const [ttlErr, ttl] = result[1];
    if (countErr || ttlErr) {
      throw new Error('Failed to get rate limit info');
    }

    if (count == null) {
      return {
        isAllowed: true,
        remainingRequests: options.limit,
        retryAfter: options.duration,
      };
    }

    const parsedCount = Number(count);
    const parsedTTL = ttl ? Number(ttl) : 0;

    return {
      isAllowed: parsedCount <= options.limit,
      remainingRequests: Math.max(0, options.limit - parsedCount),
      retryAfter: parsedTTL,
    };
  }

  async consume(
    identifier: string,
    options: RateLimiterOptions,
  ): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier, options.name);
    const count = await this.redis.get(key);
    const parsedCount = count ? Number(count) : 0;
    const isAllowed = parsedCount <= options.limit;

    const tx = this.redis.multi();
    if (isAllowed) {
      tx.incr(key);
      tx.expire(key, options.duration, 'NX');
      await tx.exec();
    }

    return this.check(identifier, options);
  }

  private getKey(identifier: string, name: string) {
    return `rate-limiter:${identifier}:${name}`;
  }
}

export const rateLimiter = new FixedWindowRateLimiter(redisClient);

export interface RateLimiterResponse {
  isAllowed: boolean;
  remainingRequests: number;
  retryAfter?: number;
}

export interface RateLimiterOptions {
  limit: number;
  duration: number;
  name: string;
}

interface RateLimiter {
  check(
    identifier: string,
    options: RateLimiterOptions,
  ): Promise<RateLimiterResponse>;

  consume(
    identifier: string,
    options: RateLimiterOptions,
  ): Promise<RateLimiterResponse>;
}
