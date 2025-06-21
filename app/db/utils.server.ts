import { sql, type GetColumnData } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

export function orderByEnum<T extends PgColumn>(
  column: T,
  order: ExtractEnumType<T>[],
  direction: 'asc' | 'desc' = 'asc',
) {
  if (order.length === 0) {
    throw new Error('Order array cannot be empty');
  }

  let caseStatement = 'CASE';

  order.forEach((value, index) => {
    caseStatement += ` WHEN ${column.name} = '${value}' THEN ${index}`;
  });

  caseStatement += ` ELSE ${order.length} END`;

  if (direction === 'desc') {
    caseStatement += ' DESC';
  }

  return sql.raw(caseStatement);
}

export function countEq<T extends PgColumn>(
  column: T,
  value: GetColumnData<T, 'raw'>,
) {
  return sql`COUNT(CASE WHEN ${column} = ${value} THEN 1 END)`;
}

type ExtractEnumType<T> =
  T extends PgColumn<infer Config>
    ? Config extends { enumValues: readonly (infer U)[] }
      ? U
      : never
    : never;
