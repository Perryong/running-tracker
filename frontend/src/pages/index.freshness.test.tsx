import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Index from './index';

const useActivitiesMock = vi.hoisted(() => vi.fn());
const useSiteMetadataMock = vi.hoisted(() => vi.fn());
const useThemeMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useActivities', () => ({
  default: useActivitiesMock,
}));

vi.mock('@/hooks/useSiteMetadata', () => ({
  default: useSiteMetadataMock,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: useThemeMock,
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

    render(<Index />);

    expect(screen.getByText(/Data may be incomplete/i)).toBeTruthy();
    expect(screen.getByText(/Last synced: 2026-03-21T10:28:00Z/i)).toBeTruthy();
  });
});
