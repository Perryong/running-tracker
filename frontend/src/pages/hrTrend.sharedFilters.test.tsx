import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMemo } from 'react';
import type { Activity } from '@/utils/utils';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from '@/features/dashboard/filters/useDashboardFilters';
import { selectFilteredRuns } from '@/features/dashboard/selectors/selectFilteredRuns';
import { HeartRateTrendPanel } from '@/features/dashboard/components/HeartRateTrendPanel';

const fixtureRuns: Activity[] = [
  {
    run_id: 101,
    name: 'Week one run',
    distance: 10000,
    moving_time: '00:52:00',
    type: 'Run',
    subtype: '',
    start_date: '2024-01-03T00:00:00Z',
    start_date_local: '2024-01-03T06:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 150,
    elevation_gain: 50,
    average_speed: 3.2,
    streak: 1,
  },
  {
    run_id: 102,
    name: 'Week one run two',
    distance: 8000,
    moving_time: '00:43:00',
    type: 'running',
    subtype: '',
    start_date: '2024-01-05T00:00:00Z',
    start_date_local: '2024-01-05T07:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 154,
    elevation_gain: 60,
    average_speed: 3.1,
    streak: 1,
  },
  {
    run_id: 103,
    name: 'Week two sparse run',
    distance: 9000,
    moving_time: '00:47:00',
    type: 'running',
    subtype: '',
    start_date: '2024-01-12T00:00:00Z',
    start_date_local: '2024-01-12T07:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: 166,
    elevation_gain: 80,
    average_speed: 3.1,
    streak: 1,
  },
  {
    run_id: 104,
    name: 'No HR walk',
    distance: 4000,
    moving_time: '00:41:00',
    type: 'walking',
    subtype: '',
    start_date: '2023-08-12T00:00:00Z',
    start_date_local: '2023-08-12T08:00:00Z',
    location_country: 'CN',
    summary_polyline: null,
    average_heartrate: null,
    elevation_gain: 10,
    average_speed: 1.8,
    streak: 1,
  },
];

const trendMethodology = {
  model: 'max_hr_percentage_5_zone' as const,
  zone_time_basis: 'estimated_from_average_hr' as const,
  max_hr_value: 190,
  max_hr_source: 'default_fallback' as const,
  estimated: true,
  zone_boundaries_pct: {
    z1: [50, 60] as [number, number],
    z2: [60, 70] as [number, number],
    z3: [70, 80] as [number, number],
    z4: [80, 90] as [number, number],
    z5: [90, 100] as [number, number],
  },
};

const TrendHarness = () => {
  const { filters, setDateRange, setActivityType } = useDashboardFilters();
  const filteredRuns = useMemo(
    () => selectFilteredRuns(fixtureRuns, filters),
    [filters]
  );

  return (
    <div>
      <button onClick={() => setDateRange('2024')}>set-2024</button>
      <button onClick={() => setDateRange('all')}>set-all-date</button>
      <button onClick={() => setDateRange('2022')}>set-2022</button>
      <button onClick={() => setActivityType('walking')}>set-walking</button>
      <button onClick={() => setActivityType('all')}>set-all-activity</button>
      <HeartRateTrendPanel
        runs={filteredRuns}
        methodology={trendMethodology}
        lowConfidenceSampleThreshold={2}
      />
    </div>
  );
};

describe('dashboard heart-rate trend shared filter behavior', () => {
  it('supports weekly/monthly periods and reflects shared filter changes', () => {
    render(
      <DashboardFiltersProvider>
        <TrendHarness />
      </DashboardFiltersProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Heart Rate Trend' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Weekly' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Monthly' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Daily' })).toBeNull();

    expect(screen.getByText('152 bpm')).toBeTruthy();
    expect(screen.getByText('2 samples')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }));
    expect(screen.getByText('157 bpm')).toBeTruthy();
    expect(screen.getByText('3 samples')).toBeTruthy();

    fireEvent.click(screen.getByText('set-walking'));
    expect(
      screen.getByText('No heart-rate trend data for the selected filters.')
    ).toBeTruthy();

    fireEvent.click(screen.getByText('set-all-activity'));
    fireEvent.click(screen.getByText('set-2024'));
    expect(screen.getByText('157 bpm')).toBeTruthy();
  });

  it('renders low-confidence marker/legend and explicit no-data state', () => {
    render(
      <DashboardFiltersProvider>
        <TrendHarness />
      </DashboardFiltersProvider>
    );

    expect(
      screen.getByText('⚠ Sparse sample count for this period.')
    ).toBeTruthy();
    expect(
      screen.getByText('⚠ Low confidence: sparse sample count for this period.')
    ).toBeTruthy();

    fireEvent.click(screen.getByText('set-2022'));
    expect(
      screen.getByText('No heart-rate trend data for the selected filters.')
    ).toBeTruthy();
  });
});
