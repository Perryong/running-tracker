import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './total';
import { DashboardFiltersProvider } from '@/features/dashboard/filters/useDashboardFilters';

const fixtureActivities = [
  {
    run_id: 1,
    name: 'Morning Run',
    distance: 5000,
    moving_time: '00:25:00',
    type: 'running',
    subtype: '',
    start_date: '2024-05-01T00:00:00Z',
    start_date_local: '2024-05-01T06:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 150,
    elevation_gain: 40,
    average_speed: 3.2,
    streak: 1,
  },
  {
    run_id: 2,
    name: 'Lunch Walk',
    distance: 4000,
    moving_time: '00:40:00',
    type: 'walking',
    subtype: '',
    start_date: '2023-08-01T00:00:00Z',
    start_date_local: '2023-08-01T12:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 120,
    elevation_gain: 10,
    average_speed: 1.7,
    streak: 1,
  },
];

vi.mock('@/hooks/useActivities', () => ({
  default: () => ({
    activities: fixtureActivities,
    years: ['2024', '2023'],
    cities: {},
    runPeriod: {},
    thisYear: '2024',
    freshness: { last_sync_at: '', completeness: 'complete' },
  }),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

describe('/summary shared filter continuity', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/summary');
    window.localStorage.clear();
  });

  it('updates summary dataset when shared date/activity filters change', () => {
    render(
      <MemoryRouter>
        <HelmetProvider>
          <DashboardFiltersProvider>
            <HomePage />
          </DashboardFiltersProvider>
        </HelmetProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('summary-filtered-run-count').textContent).toBe(
      '2'
    );

    fireEvent.change(screen.getByLabelText('summary-activity-type'), {
      target: { value: 'running' },
    });
    expect(screen.getByTestId('summary-filtered-run-count').textContent).toBe(
      '1'
    );

    fireEvent.change(screen.getByLabelText('summary-date-range'), {
      target: { value: '2023' },
    });
    expect(screen.getByTestId('summary-filtered-run-count').textContent).toBe(
      '1'
    );
  });
});
