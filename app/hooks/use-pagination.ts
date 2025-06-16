import { parseAsFloat, useQueryStates, type UrlKeys } from 'nuqs';
import { createSerializer, createLoader } from 'nuqs/server';
import { useLocation } from 'react-router';

const paginationParams = {
  page: parseAsFloat.withDefault(1),
  itemsPerPage: parseAsFloat.withDefault(7),
};

const paginationUrlKeys: UrlKeys<typeof paginationParams> = {
  page: 'p',
  itemsPerPage: 'pp',
};

export function usePagination() {
  const location = useLocation();
  const [pagination, setPagination] = useQueryStates(paginationParams, {
    urlKeys: paginationUrlKeys,
    shallow: false,
    scroll: false,
  });

  const serialize = createSerializer(paginationParams, {
    urlKeys: paginationUrlKeys,
  }).bind(null, location.search);

  return {
    pagination,
    setPagination,
    serialize,
  };
}

export const loadPaginationSearchParams = createLoader(paginationParams, {
  urlKeys: paginationUrlKeys,
});
