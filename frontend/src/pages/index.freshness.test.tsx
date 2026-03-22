import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Index from './index';

const useActivitiesMock = vi.hoisted(() => vi.fn());
const useSiteMetadataMock = vi.hoisted(() => vi.fn());
const useThemeMock = vi.hoisted(() => vi.fn());
const getAnalyticsSummaryMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useActivities', () => ({
  default: useActivitiesMock,
}));

vi.mock('@/hooks/useSiteMetadata', () => ({
  default: useSiteMetadataMock,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: useThemeMock,
}));

vi.mock('@/api/analytics', () => ({
  getAnalyticsSummary: getAnalyticsSummaryMock,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/LocationStat', () => ({
  default: () => <div>LocationStat</div>,
}));

vi.mock('@/components/RunMap/TemplateMap', () => ({
  default: () => <div>TemplateMap</div>,
}));

vi.mock('@/components/RunTable', () => ({
  default: () => <div>RunTable</div>,
}));

vi.mock('@/components/SVGStat', () => ({
  default: () => <div>SVGStat</div>,
}));

vi.mock('@/components/YearsStat', () => ({
  default: () => <div>YearsStat</div>,
}));

vi.mock('@/components/RunMap/RunMapButtons', () => ({
  default: () => <div>RunMapButtons</div>,
}));

vi.mock('@/features/dashboard/components/HeartRateTrendPanel', () => ({
  HeartRateTrendPanel: () => <div>HeartRateTrendPanel</div>,
}));

vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
}));

describe('Index freshness wiring', () => {
  it('renders trust signal messaging from useActivities freshness data', () => {
    useActivitiesMock.mockReturnValue({
      activities: [],
      years: ['2026'],
      countries: [],
      provinces: [],
      cities: {},
      runPeriod: {},
      thisYear: '2026',
      freshness: {
        completeness: 'partial',
        last_sync_at: '2026-03-21T10:28:00Z',
      },
    });
    useSiteMetadataMock.mockReturnValue({
      siteTitle: 'Running Tracker',
      siteUrl: 'https://example.com',
      description: 'desc',
    });
    useThemeMock.mockReturnValue({ theme: 'light' });
    getAnalyticsSummaryMock.mockResolvedValue({
      summary: {
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
        },
      },
    });

    render(<Index />);

    expect(screen.getByText(/Data may be incomplete/i)).toBeTruthy();
    expect(screen.getByText(/Last synced: 2026-03-21T10:28:00Z/i)).toBeTruthy();
  });
});
