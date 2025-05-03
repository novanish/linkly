import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ms from 'ms';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sec(value: Parameters<typeof ms>[0]) {
  return Math.round(ms(value) / 1000);
}
