export const ALL_TIME_FILTER = 'all' as const;

export interface DashboardFilters {
  dateRange: typeof ALL_TIME_FILTER;
  year: string;
  activityType: string;
  city: string;
  title: string;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  dateRange: ALL_TIME_FILTER,
  year: ALL_TIME_FILTER,
  activityType: ALL_TIME_FILTER,
  city: ALL_TIME_FILTER,
  title: ALL_TIME_FILTER,
};

const sanitizeFilterToken = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ALL_TIME_FILTER;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : ALL_TIME_FILTER;
};

const sanitizeYear = (value: unknown): string => {
  const normalized = sanitizeFilterToken(value);
  if (normalized === ALL_TIME_FILTER) {
    return ALL_TIME_FILTER;
  }

  return /^\d{4}$/.test(normalized) ? normalized : ALL_TIME_FILTER;
};

export const sanitizeDashboardFilters = (
  input: Partial<DashboardFilters> | null | undefined
): DashboardFilters => {
  return {
    dateRange: ALL_TIME_FILTER,
    year: sanitizeYear(input?.year),
    activityType: sanitizeFilterToken(input?.activityType),
    city: sanitizeFilterToken(input?.city),
    title: sanitizeFilterToken(input?.title),
  };
};
