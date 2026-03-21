import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './total';

const useDashboardFiltersMock = vi.fn(() => ({
  filters: {
    dateRange: 'all',
    year: '2024',
    activityType: 'Run',
    city: 'all',
    title: 'all',
  },
}));

vi.mock('@/components/ActivityList', () => ({
  default: () => <div data-testid="activity-list" />,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

vi.mock('@/features/dashboard/filters/useDashboardFilters', () => ({
  useDashboardFilters: () => useDashboardFiltersMock(),
}));

describe('/summary shared filter continuity', () => {
  it('consumes shared dashboard filter state on mount', () => {
    render(
      <HelmetProvider>
        <HomePage />
      </HelmetProvider>
    );

    expect(useDashboardFiltersMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('summary-route')).toHaveAttribute(
      'data-current-filter-year',
      '2024'
    );
    expect(screen.getByTestId('activity-list')).toBeTruthy();
  });
});
