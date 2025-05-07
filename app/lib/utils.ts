import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ms from 'ms';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sec(value: Parameters<typeof ms>[0]) {
  return Math.round(ms(value) / 1000);
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

interface GetShortUrlArgs {
  shortCode: string;
  customAlias?: string | null;
}

export function getShortUrl({ shortCode, customAlias }: GetShortUrlArgs) {
  if (customAlias) {
    return `http://localhost:3000/${customAlias}`;
  }

  return `http://localhost:3000/s/${shortCode}`;
}

export function getCurrentWeekStartAndEnd() {
  const curr = new Date();
  const first = curr.getDate() - curr.getDay();
  const last = first + 6;

  const firstDate = new Date(curr);
  firstDate.setDate(first);

  const lastDate = new Date(curr);
  lastDate.setDate(last);

  return {
    start: firstDate,
    end: lastDate,
  };
}

export function getLastWeekStartAndEnd() {
  const now = new Date();
  const currentDay = now.getDay();

  const start = new Date(now);
  start.setDate(now.getDate() - currentDay - 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}

export function getCurrentMonthStartAndEnd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start,
    end,
  };
}

export function getLastMonthStartAndEnd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    start,
    end,
  };
}

export function getPercentageChange(
  oldValue: number,
  newValue: number,
): number | null {
  if (oldValue === 0 && newValue === 0) return 0;

  if (oldValue === 0) return null;

  const change = (Math.abs(newValue - oldValue) / oldValue) * 100;
  return parseFloat(change.toFixed(2));
}
