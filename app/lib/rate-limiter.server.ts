import type Redis from 'ioredis';
import { redisClient } from '~/db/redis.server';

class FixedWindowRateLimiter implements RateLimiter {
  constructor(private readonly redis: Redis) {}

  async check(
    identifier: string,
    options: RateLimiterOptions,
  ): Promise<RateLimiterResponse> {
    return this.getRateLimitInfo(identifier, options, false);
  }

  async consume(
    identifier: string,
    options: RateLimiterOptions,
  ): Promise<RateLimiterResponse> {
    return this.getRateLimitInfo(identifier, options, true);
  }

  private async getRateLimitInfo(
    identifier: string,
    options: RateLimiterOptions,
    shouldConsume = false,
  ): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier, options.name);
    const result = await this.redis
      .multi()
      .set(key, options.limit, 'EX', options.duration, 'NX')
      .get(key)
      .ttl(key)
      .exec();

    if (!result) throw new Error('Failed to get rate limit data');

    const [getErr, value] = result[1];
    const [ttlErr, ttl] = result[2];

    if (getErr || ttlErr) {
      throw new Error('Failed to get rate limit data');
    }

    let remainingRequests = this.parseNumber(value, 0);
    let parsedTtl = this.parseNumber(ttl, -2);

    if (parsedTtl === -2) {
      await this.redis.set(key, options.limit, 'EX', options.duration);
      remainingRequests = options.limit;
      parsedTtl = options.duration;
    }

    if (shouldConsume && remainingRequests > 0) {
      remainingRequests -= 1;
      await this.redis.decr(key);
    }

    return {
      canRequest: remainingRequests > 0,
      remainingRequests,
      retryAfter: parsedTtl,
    };
  }

  private getKey(identifier: string, name: string) {
    return `rate-limiter:${identifier}:${name}`;
  }

  private parseNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && !isNaN(parseInt(value, 10))) {
      return parseInt(value, 10);
    }
    return fallback;
  }
}

export const rateLimiter = new FixedWindowRateLimiter(redisClient);

export interface RateLimiterResponse {
  canRequest: boolean;
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
