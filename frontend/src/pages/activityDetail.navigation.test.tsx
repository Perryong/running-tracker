import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ActivityPage from './activity';

const useActivityDetailMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());
const locationMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/activity-detail/hooks/useActivityDetail', () => ({
  useActivityDetail: useActivityDetailMock,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/RunMap/TemplateMap', () => ({
  default: () => <div data-testid="activity-detail-template-map">TemplateMap</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationMock(),
  };
});

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
    <MemoryRouter initialEntries={['/activity/99?dateRange=all&year=2025']}>
      <Routes>
        <Route path="/activity/:runId" element={<ActivityPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('activity detail navigation behavior', () => {
  it('dashboard-origin navigation entry uses history back from header', () => {
    useActivityDetailMock.mockReturnValue({
      activity: readyActivity,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    locationMock.mockReturnValue({
      search: '?dateRange=all&year=2025',
      state: { fromDashboard: true },
    });

    renderActivityPage();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Dashboard' }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('direct-entry back falls back to dashboard with query continuity', () => {
    useActivityDetailMock.mockReturnValue({
      activity: readyActivity,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    locationMock.mockReturnValue({
      search: '?dateRange=all&year=2025&activityType=Run',
      state: null,
    });

    renderActivityPage();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Dashboard' }));
    expect(navigateMock).toHaveBeenCalledWith({
      pathname: '/',
      search: '?dateRange=all&year=2025&activityType=Run',
    });
  });

  it('not-found state back control uses same fallback behavior', () => {
    useActivityDetailMock.mockReturnValue({
      activity: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    locationMock.mockReturnValue({
      search: '?dateRange=all&city=Boston',
      state: null,
    });

    renderActivityPage();

    const buttons = screen.getAllByRole('button', { name: 'Back to Dashboard' });
    fireEvent.click(buttons[1]);
    expect(navigateMock).toHaveBeenCalledWith({
      pathname: '/',
      search: '?dateRange=all&city=Boston',
    });
  });

  it('error state back control uses dashboard-origin history and retry keeps query context', () => {
    const refetch = vi.fn();
    useActivityDetailMock.mockReturnValue({
      activity: null,
      isLoading: false,
      isError: true,
      refetch,
    });
    locationMock.mockReturnValue({
      search: '?dateRange=all&title=Tempo',
      state: { fromDashboard: true },
    });

    renderActivityPage();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(locationMock).toHaveBeenCalled();

    const buttons = screen.getAllByRole('button', { name: 'Back to Dashboard' });
    fireEvent.click(buttons[1]);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
