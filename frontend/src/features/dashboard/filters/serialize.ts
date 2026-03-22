import {
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
  sanitizeDashboardFilters,
} from './model';

export const DASHBOARD_FILTERS_STORAGE_KEY = 'dashboard.filters.v1';

const FILTER_PARAM_KEYS = [
  'dateRange',
  'year',
  'activityType',
  'city',
  'title',
] as const;

type FilterParamKey = (typeof FILTER_PARAM_KEYS)[number];

const isKnownFilterKey = (key: string): key is FilterParamKey => {
  return FILTER_PARAM_KEYS.includes(key as FilterParamKey);
};

const normalizeSearch = (search: string): string => {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search.slice(1) : search;
};

const toPartialFilters = (
  params: URLSearchParams
): Partial<DashboardFilters> => {
  const result: Partial<DashboardFilters> = {};
  for (const key of FILTER_PARAM_KEYS) {
    const value = params.get(key);
    if (value !== null) {
      result[key] = value;
    }
  }
  return result;
};

export const decodeFiltersFromUrl = (search: string): DashboardFilters => {
  const params = new URLSearchParams(normalizeSearch(search));
  return sanitizeDashboardFilters(toPartialFilters(params));
};

export const encodeFiltersToUrl = (filters: DashboardFilters): string => {
  const sanitized = sanitizeDashboardFilters(filters);
  const params = new URLSearchParams();

  for (const key of FILTER_PARAM_KEYS) {
    const value = sanitized[key];
    if (value !== DEFAULT_DASHBOARD_FILTERS[key]) {
      params.set(key, value);
    }
  }

  const encoded = params.toString();
  return encoded.length > 0 ? `?${encoded}` : '';
};

const hasAnyFilterParams = (search: string): boolean => {
  const params = new URLSearchParams(normalizeSearch(search));
  for (const key of params.keys()) {
    if (isKnownFilterKey(key)) {
      return true;
    }
  }
  return false;
};

const decodeFiltersFromStorage = (
  storageRaw: string | null
): DashboardFilters => {
  if (!storageRaw) {
    return DEFAULT_DASHBOARD_FILTERS;
  }

  try {
    const parsed = JSON.parse(storageRaw) as Partial<DashboardFilters>;
    return sanitizeDashboardFilters(parsed);
  } catch {
    return DEFAULT_DASHBOARD_FILTERS;
  }
};

export const hydrateFilters = ({
  search,
  storageRaw,
}: {
  search: string;
  storageRaw: string | null;
}): DashboardFilters => {
  if (hasAnyFilterParams(search)) {
    return decodeFiltersFromUrl(search);
  }
  return decodeFiltersFromStorage(storageRaw);
};

export const hasEncodedFiltersChanged = (
  currentSearch: string,
  nextFilters: DashboardFilters
): boolean => {
  const current = encodeFiltersToUrl(decodeFiltersFromUrl(currentSearch));
  const next = encodeFiltersToUrl(nextFilters);
  return current !== next;
};

export const withUpdatedSearch = (
  currentHref: string,
  nextSearch: string,
  options?: { clearHash?: boolean }
): string => {
  const url = new URL(currentHref, 'https://dashboard.local');
  url.search = normalizeSearch(nextSearch);

  if (options?.clearHash) {
    url.hash = '';
  }

  return `${url.pathname}${url.search}${url.hash}`;
};
