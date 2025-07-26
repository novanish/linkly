import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ms from 'ms';
import { redirect } from 'react-router';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sec(value: ms.StringValue) {
  return Math.round(ms(value) / 1000);
}

export function clamp({
  min,
  value,
  max,
}: Record<'min' | 'value' | 'max', number>) {
  return Math.max(min, Math.min(max, value));
}

export function toBase62(num: number): string {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (num === 0) return chars[0];

  let result = '';
  while (num > 0) {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  }

  return result;
}

export function getShortUrl({ shortCode, customAlias }: GetShortUrlArgs) {
  if (customAlias) {
    return `http://localhost:3000/${customAlias}`;
  }

  return `http://localhost:3000/s/${shortCode}`;
}

export function getStartAndEndDates() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - now.getDay());
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const startOfPreviousWeek = new Date(startOfCurrentWeek);
  startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

  const endOfPreviousWeek = new Date(startOfCurrentWeek);
  endOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 1);
  endOfPreviousWeek.setHours(23, 59, 59, 999);

  return {
    now,
    startOfThisMonth,
    endOfThisMonth,
    startOfLastMonth,
    endOfLastMonth,
    twentyFourHoursAgo,
    fortyEightHoursAgo,
    startOfCurrentWeek,
    startOfPreviousWeek,
    endOfPreviousWeek,
  };
}

const formatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
});

export function formatNumber(num: number) {
  return formatter.format(num);
}

const isSafeUrl = (url: string) =>
  url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');

export function safeRedirect(url: string, init?: number | ResponseInit) {
  const defaultRedirect = '/';
  const safeRedirectUrl = isSafeUrl(url) ? url : defaultRedirect;
  return redirect(safeRedirectUrl, init);
}

export function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function retry(cb: () => Promise<void>, options: RetryOptions) {
  const { attempts = 0 } = options;

  try {
    await cb();
  } catch (error) {
    if (attempts <= 0) throw error;
    if (options.retryAfter) await wait(options.retryAfter);

    await retry(cb, { ...options, attempts: attempts - 1 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
) {
  let canCall = true;

  return function (...args: Parameters<T>) {
    if (canCall) {
      func(...args);
      canCall = false;
      setTimeout(() => {
        canCall = true;
      }, delay);
    }
  };
}

interface GetShortUrlArgs {
  shortCode: string;
  customAlias?: string | null;
}

export interface RetryOptions {
  attempts?: number;
  retryAfter?: number;
}
