import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ActivityPage from './activity';

const useActivityDetailMock = vi.hoisted(() => vi.fn());
const templateMapMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/activity-detail/hooks/useActivityDetail', () => ({
  useActivityDetail: useActivityDetailMock,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/RunMap/TemplateMap', () => ({
  default: (props: { title: string; geoData: unknown }) => {
    templateMapMock(props);
    return <div data-testid="activity-detail-template-map">TemplateMap</div>;
  },
}));

describe('activity detail route and ready content hierarchy', () => {
  it('renders on /activity/:runId and keeps ACT-01 metric order with map block', () => {
    useActivityDetailMock.mockReturnValue({
      activity: {
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
        average_heartrate: null,
        elevation_gain: 120,
        average_speed: 3.3,
        streak: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/activity/99?dateRange=2026']}>
        <Routes>
          <Route path="/activity/:runId" element={<ActivityPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('activity-detail-shell')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-content-shell')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Dashboard' })).toBeTruthy();

    const labels = screen.getAllByText(
      /Distance|Moving time|Average pace|Average heart rate/i
    );
    expect(labels.map((label) => label.textContent)).toEqual([
      'Distance',
      'Moving time',
      'Average pace',
      'Average heart rate',
    ]);

    expect(screen.getByTestId('activity-detail-secondary-metrics')).toBeTruthy();
    expect(screen.getByText('Elevation gain')).toBeTruthy();
    expect(screen.getByTestId('metric-average-heart-rate').textContent).toContain('—');
    expect(screen.getByText('No HR data')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-map')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-template-map')).toBeTruthy();
    expect(templateMapMock).toHaveBeenCalledTimes(1);
  });
});
