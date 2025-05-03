import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './app/db/schema.server.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
