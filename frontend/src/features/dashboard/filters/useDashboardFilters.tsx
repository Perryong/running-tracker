import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
} from './model';
import { dashboardFiltersReducer } from './reducer';
import {
  DASHBOARD_FILTERS_STORAGE_KEY,
  decodeFiltersFromUrl,
  encodeFiltersToUrl,
  hasEncodedFiltersChanged,
  hydrateFilters,
  withUpdatedSearch,
} from './serialize';

interface DashboardFiltersContextValue {
  filters: DashboardFilters;
  setDateRange: (dateRange: string) => void;
  setYear: (year: string) => void;
  setActivityType: (activityType: string) => void;
  setCity: (city: string) => void;
  setTitle: (title: string) => void;
  replaceFilters: (filters: Partial<DashboardFilters>) => void;
}

const DashboardFiltersContext = createContext<
  DashboardFiltersContextValue | undefined
>(undefined);

const getInitialFilters = (): DashboardFilters => {
  if (typeof window === 'undefined') {
    return DEFAULT_DASHBOARD_FILTERS;
  }

  const storageRaw = window.localStorage.getItem(DASHBOARD_FILTERS_STORAGE_KEY);
  return hydrateFilters({
    search: window.location.search,
    storageRaw,
  });
};

export const DashboardFiltersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [filters, dispatch] = useReducer(
    dashboardFiltersReducer,
    DEFAULT_DASHBOARD_FILTERS,
    getInitialFilters
  );

  useEffect(() => {
    window.localStorage.setItem(
      DASHBOARD_FILTERS_STORAGE_KEY,
      JSON.stringify(filters)
    );
  }, [filters]);

  useEffect(() => {
    if (!hasEncodedFiltersChanged(window.location.search, filters)) {
      return;
    }

    const nextSearch = encodeFiltersToUrl(filters);
    const nextUrl = withUpdatedSearch(window.location.href, nextSearch);
    window.history.pushState(null, '', nextUrl);
  }, [filters]);

  useEffect(() => {
    const handlePopState = () => {
      const fromUrl = decodeFiltersFromUrl(window.location.search);
      dispatch({ type: 'replaceFilters', payload: fromUrl });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = useMemo<DashboardFiltersContextValue>(
    () => ({
      filters,
      setDateRange: (dateRange: string) =>
        dispatch({ type: 'setDateRange', payload: dateRange }),
      setYear: (year: string) => dispatch({ type: 'setYear', payload: year }),
      setActivityType: (activityType: string) =>
        dispatch({ type: 'setActivityType', payload: activityType }),
      setCity: (city: string) => dispatch({ type: 'setCity', payload: city }),
      setTitle: (title: string) =>
        dispatch({ type: 'setTitle', payload: title }),
      replaceFilters: (nextFilters: Partial<DashboardFilters>) =>
        dispatch({ type: 'replaceFilters', payload: nextFilters }),
    }),
    [filters]
  );

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};

export const useDashboardFilters = (): DashboardFiltersContextValue => {
  const context = useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error(
      'useDashboardFilters must be used within DashboardFiltersProvider'
    );
  }
  return context;
};
