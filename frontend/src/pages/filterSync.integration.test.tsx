import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useState } from 'react';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from '@/features/dashboard/filters/useDashboardFilters';
import { selectFilteredRuns } from '@/features/dashboard/selectors/selectFilteredRuns';
import type { Activity } from '@/utils/utils';

const fixtureRuns: Activity[] = [
  {
    run_id: 1,
    name: 'Morning Run',
    distance: 10000,
    moving_time: '00:50:00',
    type: 'Run',
    subtype: '',
    start_date: '2024-06-01T00:00:00Z',
    start_date_local: '2024-06-01T06:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 150,
    elevation_gain: 100,
    average_speed: 3.3,
    streak: 1,
  },
  {
    run_id: 2,
    name: 'Lunch Walk',
    distance: 3000,
    moving_time: '00:30:00',
    type: 'walking',
    subtype: '',
    start_date: '2023-03-01T00:00:00Z',
    start_date_local: '2023-03-01T12:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 115,
    elevation_gain: 20,
    average_speed: 1.7,
    streak: 1,
  },
  {
    run_id: 3,
    name: 'Evening Ride',
    distance: 25000,
    moving_time: '01:00:00',
    type: 'cycling',
    subtype: '',
    start_date: '2024-08-01T00:00:00Z',
    start_date_local: '2024-08-01T18:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 130,
    elevation_gain: 80,
    average_speed: 6.9,
    streak: 1,
  },
];

const DashboardProbe = () => {
  const { filters } = useDashboardFilters();
  const count = selectFilteredRuns(fixtureRuns, filters).length;
  return <div data-testid="dashboard-count">{count}</div>;
};

const SummaryProbe = () => {
  const { filters } = useDashboardFilters();
  const count = selectFilteredRuns(fixtureRuns, filters).length;
  return <div data-testid="summary-count">{count}</div>;
};

const FilterControls = () => {
  const { setDateRange, setActivityType } = useDashboardFilters();
  return (
    <div>
      <button onClick={() => setDateRange('2024')}>set-2024</button>
      <button onClick={() => setDateRange('all')}>set-all</button>
      <button onClick={() => setActivityType('walking')}>set-walking</button>
      <button onClick={() => setActivityType('all')}>set-all-activity</button>
    </div>
  );
};

const RouteTransitionHarness = () => {
  const [view, setView] = useState<'dashboard' | 'summary'>('dashboard');
  return (
    <div>
      <button onClick={() => setView('dashboard')}>go-dashboard</button>
      <button onClick={() => setView('summary')}>go-summary</button>
      {view === 'dashboard' ? <DashboardProbe /> : <SummaryProbe />}
    </div>
  );
};

describe('shared filter synchronization across dashboard and summary datasets', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.localStorage.clear();
  });

  it('changes both datasets from one shared date/activity mutation', () => {
    render(
      <DashboardFiltersProvider>
        <FilterControls />
        <DashboardProbe />
        <SummaryProbe />
      </DashboardFiltersProvider>
    );

    expect(screen.getByTestId('dashboard-count').textContent).toBe('3');
    expect(screen.getByTestId('summary-count').textContent).toBe('3');

    fireEvent.click(screen.getByText('set-2024'));
    expect(screen.getByTestId('dashboard-count').textContent).toBe('2');
    expect(screen.getByTestId('summary-count').textContent).toBe('2');

    fireEvent.click(screen.getByText('set-walking'));
    expect(screen.getByTestId('dashboard-count').textContent).toBe('1');
    expect(screen.getByTestId('summary-count').textContent).toBe('1');
  });

  it('preserves shared continuity across popstate-style and route-style transitions', () => {
    render(
      <DashboardFiltersProvider>
        <FilterControls />
        <RouteTransitionHarness />
      </DashboardFiltersProvider>
    );

    fireEvent.click(screen.getByText('set-2024'));
    expect(window.location.search).toContain('dateRange=2024');
    expect(screen.getByTestId('dashboard-count').textContent).toBe('2');

    fireEvent.click(screen.getByText('go-summary'));
    expect(screen.getByTestId('summary-count').textContent).toBe('2');

    window.history.replaceState(null, '', '/?dateRange=all&activityType=walking');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(screen.getByTestId('summary-count').textContent).toBe('1');
  });
});

