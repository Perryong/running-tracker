import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ActivityPage from './activity';

const useActivityDetailMock = vi.hoisted(() => vi.fn());
const getAnalyticsSummaryMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/activity-detail/hooks/useActivityDetail', () => ({
  useActivityDetail: useActivityDetailMock,
}));

vi.mock('@/api/analytics', () => ({
  getAnalyticsSummary: getAnalyticsSummaryMock,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/RunMap/TemplateMap', () => ({
  default: () => <div data-testid="activity-detail-template-map">TemplateMap</div>,
}));

const readyActivity = {
  run_id: 99,
  name: 'Morning Run',
  distance: 10000,
  moving_time: '00:50:00',
  type: 'Run',
  subtype: 'generic',
  start_date: '2026-01-01T00:00:00Z',
  start_date_local: '2026-01-01 06:00:00',
  location_country: null,
  summary_polyline: null,
  average_heartrate: 152,
  elevation_gain: 120,
  average_speed: 3.3,
  streak: 1,
};

const renderActivityPage = () =>
  render(
    <MemoryRouter initialEntries={['/activity/99']}>
      <Routes>
        <Route path="/activity/:runId" element={<ActivityPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('activity detail heart-rate zones', () => {
  it('renders per-run zones ordered Z1 to Z5 with duration and percentage', async () => {
    useActivityDetailMock.mockReturnValue({
      activity: readyActivity,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    getAnalyticsSummaryMock.mockResolvedValue({
      freshness: { last_sync_at: '2026-01-01T00:00:00Z', completeness: 'complete' },
      summary: {
        total_activities: 1,
        total_distance: 10000,
        total_moving_time_seconds: 3000,
        average_heartrate: 152,
        heart_rate: {
          methodology: {
            model: 'max_hr_percentage_5_zone',
            zone_time_basis: 'estimated_from_average_hr',
            max_hr_value: 190,
            max_hr_source: 'default_fallback',
            estimated: true,
            zone_boundaries_pct: {
              z1: [50, 60],
              z2: [60, 70],
              z3: [70, 80],
              z4: [80, 90],
              z5: [90, 100],
            },
          },
          confidence: { level: 'medium', reason: 'Estimated from average HR.' },
          coverage: {
            activities_with_hr: 1,
            total_activities: 1,
            coverage_ratio: 1,
            has_enough_data: true,
          },
          per_run: [
            {
              run_id: 99,
              total_duration_seconds: 3000,
              analyzed_duration_seconds: 3000,
              coverage_ratio: 1,
              confidence_level: 'medium',
              confidence_reason: 'Estimated from average HR.',
              has_hr_data: true,
              zones: [
                { zone: 'Z3', duration_seconds: 3000, percentage: 1 },
                { zone: 'Z1', duration_seconds: 0, percentage: 0 },
                { zone: 'Z5', duration_seconds: 0, percentage: 0 },
                { zone: 'Z2', duration_seconds: 0, percentage: 0 },
                { zone: 'Z4', duration_seconds: 0, percentage: 0 },
              ],
            },
          ],
        },
      },
    });

    renderActivityPage();

    const table = await screen.findByTestId('hr-zones-table');
    expect(table).toBeTruthy();

    const zoneCells = screen.getAllByTestId(/^hr-zone-label-/).map((node) => node.textContent);
    expect(zoneCells).toEqual(['Z1', 'Z2', 'Z3', 'Z4', 'Z5']);
    expect(screen.getByText('50 min')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('renders explicit empty state when run has no heart-rate samples', async () => {
    useActivityDetailMock.mockReturnValue({
      activity: readyActivity,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    getAnalyticsSummaryMock.mockResolvedValue({
      freshness: { last_sync_at: '2026-01-01T00:00:00Z', completeness: 'complete' },
      summary: {
        total_activities: 1,
        total_distance: 10000,
        total_moving_time_seconds: 3000,
        average_heartrate: null,
        heart_rate: {
          methodology: {
            model: 'max_hr_percentage_5_zone',
            zone_time_basis: 'unavailable',
            max_hr_value: 190,
            max_hr_source: 'default_fallback',
            estimated: false,
            zone_boundaries_pct: {
              z1: [50, 60],
              z2: [60, 70],
              z3: [70, 80],
              z4: [80, 90],
              z5: [90, 100],
            },
          },
          confidence: { level: 'none', reason: 'No heart-rate samples.' },
          coverage: {
            activities_with_hr: 0,
            total_activities: 1,
            coverage_ratio: 0,
            has_enough_data: false,
          },
          per_run: [
            {
              run_id: 99,
              total_duration_seconds: 3000,
              analyzed_duration_seconds: 0,
              coverage_ratio: 0,
              confidence_level: 'none',
              confidence_reason: 'No heart-rate samples.',
              has_hr_data: false,
              zones: [
                { zone: 'Z1', duration_seconds: 0, percentage: 0 },
                { zone: 'Z2', duration_seconds: 0, percentage: 0 },
                { zone: 'Z3', duration_seconds: 0, percentage: 0 },
                { zone: 'Z4', duration_seconds: 0, percentage: 0 },
                { zone: 'Z5', duration_seconds: 0, percentage: 0 },
              ],
            },
          ],
        },
      },
    });

    renderActivityPage();

    expect(
      await screen.findByText('No heart-rate samples available for this run.')
    ).toBeTruthy();
    expect(screen.getByText('Coverage: 0%')).toBeTruthy();
  });

  it('renders sparse coverage warning with analyzed duration details', async () => {
    useActivityDetailMock.mockReturnValue({
      activity: {
        ...readyActivity,
        moving_time: '00:20:00',
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    getAnalyticsSummaryMock.mockResolvedValue({
      freshness: { last_sync_at: '2026-01-01T00:00:00Z', completeness: 'complete' },
      summary: {
        total_activities: 1,
        total_distance: 10000,
        total_moving_time_seconds: 1200,
        average_heartrate: 152,
        heart_rate: {
          methodology: {
            model: 'max_hr_percentage_5_zone',
            zone_time_basis: 'estimated_from_average_hr',
            max_hr_value: 190,
            max_hr_source: 'default_fallback',
            estimated: true,
            zone_boundaries_pct: {
              z1: [50, 60],
              z2: [60, 70],
              z3: [70, 80],
              z4: [80, 90],
              z5: [90, 100],
            },
          },
          confidence: { level: 'low', reason: 'Sparse sampling.' },
          coverage: {
            activities_with_hr: 1,
            total_activities: 1,
            coverage_ratio: 0.35,
            has_enough_data: false,
          },
          per_run: [
            {
              run_id: 99,
              total_duration_seconds: 1200,
              analyzed_duration_seconds: 420,
              coverage_ratio: 0.35,
              confidence_level: 'low',
              confidence_reason: 'Sparse sampling.',
              has_hr_data: true,
              zones: [
                { zone: 'Z1', duration_seconds: 0, percentage: 0 },
                { zone: 'Z2', duration_seconds: 0, percentage: 0 },
                { zone: 'Z3', duration_seconds: 420, percentage: 1 },
                { zone: 'Z4', duration_seconds: 0, percentage: 0 },
                { zone: 'Z5', duration_seconds: 0, percentage: 0 },
              ],
            },
          ],
        },
      },
    });

    renderActivityPage();

    expect(await screen.findByText('Analyzed 7 min of 20 min')).toBeTruthy();
    expect(screen.getByText('Coverage: 35%')).toBeTruthy();
    expect(screen.getByText('Low confidence: Sparse sampling.')).toBeTruthy();
  });
});
