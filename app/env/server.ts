import { z } from 'zod';

const envSchema = z.object({
  ORIGIN: z.url(),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  AUTH_SESSION_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_EMAIL_DOMAIN: z.string(),
  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.url(),
  PHISHING_API_URL: z.url(),
  PHISHING_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
