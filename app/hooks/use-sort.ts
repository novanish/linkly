import { useQueryStates } from 'nuqs';
import { createLoader, parseAsStringLiteral, type UrlKeys } from 'nuqs/server';

const sortParams = {
  orderBy: parseAsStringLiteral([
    'createdAt',
    'clicksCount',
    'isActive',
    'phishingStatus',
  ]).withDefault('createdAt'),
  orderDirection: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
};

const sortUrlKeys: UrlKeys<typeof sortParams> = {
  orderBy: 'ob',
  orderDirection: 'od',
};

export function useSort() {
  return useQueryStates(sortParams, {
    urlKeys: sortUrlKeys,
    shallow: false,
    scroll: false,
    history: 'replace',
  });
}

export const loadSortSearchParams = createLoader(sortParams, {
  urlKeys: sortUrlKeys,
});
