import { type DashboardFilters, sanitizeDashboardFilters } from './model';

export type DashboardFilterAction =
  | { type: 'setDateRange'; payload: string }
  | { type: 'setYear'; payload: string }
  | { type: 'setActivityType'; payload: string }
  | { type: 'setCity'; payload: string }
  | { type: 'setTitle'; payload: string }
  | { type: 'replaceFilters'; payload: Partial<DashboardFilters> };

export const dashboardFiltersReducer = (
  state: DashboardFilters,
  action: DashboardFilterAction
): DashboardFilters => {
  switch (action.type) {
    case 'setDateRange':
      return sanitizeDashboardFilters({ ...state, dateRange: action.payload });
    case 'setYear':
      return sanitizeDashboardFilters({ ...state, year: action.payload });
    case 'setActivityType':
      return sanitizeDashboardFilters({
        ...state,
        activityType: action.payload,
      });
    case 'setCity':
      return sanitizeDashboardFilters({ ...state, city: action.payload });
    case 'setTitle':
      return sanitizeDashboardFilters({ ...state, title: action.payload });
    case 'replaceFilters':
      return sanitizeDashboardFilters({ ...state, ...action.payload });
    default:
      return state;
  }
};
