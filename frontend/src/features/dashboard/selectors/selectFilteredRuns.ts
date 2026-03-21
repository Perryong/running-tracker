import type { DashboardFilters } from '@/features/dashboard/filters/model';
import {
  sortDateFunc,
  titleForRun,
  type Activity,
} from '@/utils/utils';

const isAllToken = (value: string): boolean => value === 'all';

const matchesYear = (run: Activity, year: string): boolean => {
  if (isAllToken(year)) {
    return true;
  }

  return run.start_date_local.slice(0, 4) === year;
};

const matchesDateRange = (run: Activity, dateRange: string): boolean => {
  if (isAllToken(dateRange)) {
    return true;
  }

  if (/^\d{4}$/.test(dateRange)) {
    return run.start_date_local.slice(0, 4) === dateRange;
  }

  return run.start_date_local.slice(0, 10) === dateRange;
};

const matchesActivityType = (run: Activity, activityType: string): boolean => {
  if (isAllToken(activityType)) {
    return true;
  }

  const normalizeActivityType = (value: string): string => {
    const token = value.toLowerCase();
    if (token === 'run' || token === 'running') return 'running';
    if (token === 'walk' || token === 'walking') return 'walking';
    if (token === 'ride' || token === 'cycling') return 'cycling';
    return token;
  };

  return normalizeActivityType(run.type) === normalizeActivityType(activityType);
};

const matchesCity = (run: Activity, city: string): boolean => {
  if (isAllToken(city)) {
    return true;
  }

  return (run.location_country ?? '').includes(city);
};

const matchesTitle = (run: Activity, title: string): boolean => {
  if (isAllToken(title)) {
    return true;
  }

  return titleForRun(run) === title;
};

export const selectFilteredRuns = (
  activities: Activity[],
  filters: DashboardFilters
): Activity[] => {
  return activities
    .filter((run) => matchesDateRange(run, filters.dateRange))
    .filter((run) => matchesYear(run, filters.year))
    .filter((run) => matchesActivityType(run, filters.activityType))
    .filter((run) => matchesCity(run, filters.city))
    .filter((run) => matchesTitle(run, filters.title))
    .sort(sortDateFunc);
};
