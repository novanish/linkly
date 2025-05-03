import { z } from 'zod';

const envSchema = z.object({
  ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  AUTH_SESSION_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_EMAIL_DOMAIN: z.string(),
});

export const env = envSchema.parse(process.env);
