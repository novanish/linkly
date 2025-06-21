import { DrizzleQueryError } from 'drizzle-orm/errors';

export const POSTGRES_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
} as const;

export function isUniqueViolationError(error: unknown, constraint: string) {
  return (
    error instanceof DrizzleQueryError &&
    error.cause &&
    'code' in error.cause &&
    error.cause.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION &&
    'constraint' in error.cause &&
    error.cause.constraint === constraint
  );
}
