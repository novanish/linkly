import { createLoader, createParser, useQueryStates } from 'nuqs';
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsStringEnum,
  type UrlKeys,
} from 'nuqs/server';
import { format } from 'date-fns';
import { PHISHING_STATUS } from '~/lib/consts';

const parseAsDate = createParser({
  parse: (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }
    return date;
  },

  serialize: (date: Date) => format(date, 'yyyy-MM-dd'),
});

const phishingStatus = [
  PHISHING_STATUS.PHISHING,
  PHISHING_STATUS.SUSPICIOUS,
  PHISHING_STATUS.SAFE,
];

const filterParams = {
  from: parseAsDate,
  to: parseAsDate,
  phishingStatus: parseAsArrayOf(parseAsStringEnum(phishingStatus), ':'),
  isActive: parseAsArrayOf(parseAsBoolean, ':'),
};

const urlKeys: UrlKeys<typeof filterParams> = {
  from: 'f',
  to: 't',
  phishingStatus: 'ps',
  isActive: 'a',
};

export function useLinkFilters() {
  return useQueryStates(filterParams, {
    shallow: false,
    scroll: false,
    history: 'replace',
    urlKeys,
  });
}

export const loadLinkFiltersSearchParams = createLoader(filterParams, {
  urlKeys,
});
