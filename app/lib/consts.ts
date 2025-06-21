import type ms from 'ms';

export const MAGIC_LINK_EXPIRES_IN = '10 minutes' satisfies ms.StringValue;

export const APP_NAME = 'Linkly';
export const APP_DESCRIPTION = `${APP_NAME} is a URL shortener that allows you to create short links easily and quickly. It is simple, fast, and free to use.`;

export const PHISHING_STATUS = {
  SAFE: 'safe',
  PHISHING: 'phishing',
  SUSPICIOUS: 'suspicious',
} as const;

export const ACTION_NAME = '__a';

export const DEVICE_TYPE = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  UNKNOWN: 'unknown',
} as const;
