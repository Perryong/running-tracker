import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ApiHrPerRunAnalytics } from '@/api/types';
import { HeartRateTrendPanel } from '@/features/dashboard/components/HeartRateTrendPanel';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
}

const perRunAnalyticsFixture: ApiHrPerRunAnalytics[] = [
  {
    analyzed_duration_seconds: 1800,
    confidence_level: 'high',
    confidence_reason: 'Complete chest strap coverage',
    coverage_ratio: 0.96,
    has_hr_data: true,
    run_id: 101,
    total_duration_seconds: 1850,
    zones: [
      { zone: 'Z1', duration_seconds: 180, percentage: 10 },
      { zone: 'Z2', duration_seconds: 540, percentage: 30 },
      { zone: 'Z3', duration_seconds: 540, percentage: 30 },
      { zone: 'Z4', duration_seconds: 360, percentage: 20 },
      { zone: 'Z5', duration_seconds: 180, percentage: 10 },
    ],
  },
  {
    analyzed_duration_seconds: 2400,
    confidence_level: 'high',
    confidence_reason: 'Good wearable data',
    coverage_ratio: 0.92,
    has_hr_data: true,
    run_id: 102,
    total_duration_seconds: 2450,
    zones: [
      { zone: 'Z1', duration_seconds: 240, percentage: 10 },
      { zone: 'Z2', duration_seconds: 960, percentage: 40 },
      { zone: 'Z3', duration_seconds: 720, percentage: 30 },
      { zone: 'Z4', duration_seconds: 360, percentage: 15 },
      { zone: 'Z5', duration_seconds: 120, percentage: 5 },
    ],
  },
];

const TrendHarness = () => {
  return <HeartRateTrendPanel perRunAnalytics={perRunAnalyticsFixture} />;
};

describe('dashboard heart-rate trend backend contract behavior', () => {
  it('renders zone chart and zone breakdown only', () => {
    render(<TrendHarness />);

    expect(
      screen.getByRole('heading', { name: 'Heart Rate Trend' })
    ).toBeTruthy();
    expect(screen.getByText('Training Zone Distribution')).toBeTruthy();
    expect(screen.getByTestId('hr-zone-chart')).toBeTruthy();
    expect(screen.getByTestId('hr-zone-breakdown')).toBeTruthy();

    expect(screen.getByText('Z1')).toBeTruthy();
    expect(screen.getByText('Z2')).toBeTruthy();
    expect(screen.getByText('Z3')).toBeTruthy();
    expect(screen.getByText('Z4')).toBeTruthy();
    expect(screen.getByText('Z5')).toBeTruthy();

    expect(screen.queryByRole('button', { name: 'Weekly' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Monthly' })).toBeNull();
    expect(screen.queryByText('Training Insights:')).toBeNull();
  });

  it('supports collapse/expand for zone panel content', () => {
    render(<TrendHarness />);

    const toggleButton = screen.getByRole('button', {
      name: 'Collapse Heart Rate Trend',
    });
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('hr-zone-chart')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand Heart Rate Trend' })
    );
    expect(screen.getByTestId('hr-zone-chart')).toBeTruthy();
  });
});
