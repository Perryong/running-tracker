import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ApiHrTrendAnalytics } from '@/api/types';
import { HeartRateTrendPanel } from '@/features/dashboard/components/HeartRateTrendPanel';

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

const trendFixture: ApiHrTrendAnalytics = {
  default_period: 'weekly',
  low_sample_threshold: 2,
  periods: {
    weekly: [
      {
        period_key: '2024-W01',
        period_label: 'Week 1',
        average_heartrate: 191.7,
        sample_count: 1,
        is_low_confidence: true,
        has_data: true,
        confidence_reason: 'Backend confidence reason: single chest-strap sample.',
        run_ids: [101, 102],
      },
      {
        period_key: '2024-W02',
        period_label: 'Week 2',
        average_heartrate: null,
        sample_count: 0,
        is_low_confidence: true,
        has_data: false,
        confidence_reason: 'Backend says no wearable samples for this week.',
        run_ids: [103],
      },
    ],
    monthly: [
      {
        period_key: '2024-01',
        period_label: 'January 2024',
        average_heartrate: 142.2,
        sample_count: 9,
        is_low_confidence: false,
        has_data: true,
        confidence_reason: 'Backend confidence reason: dense month coverage.',
        run_ids: [101, 102, 103],
      },
    ],
  },
};

const TrendHarness = () => {
  return (
    <HeartRateTrendPanel trend={trendFixture} methodology={trendMethodology} />
  );
};

describe('dashboard heart-rate trend backend contract behavior', () => {
  it('renders weekly/monthly period arrays from backend trend payload', () => {
    render(<TrendHarness />);

    expect(
      screen.getByRole('heading', { name: 'Heart Rate Trend' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Weekly' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Monthly' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Daily' })).toBeNull();

    expect(screen.getByText('192 bpm')).toBeTruthy();
    expect(screen.getByText('1 sample')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }));
    expect(screen.getByText('142 bpm')).toBeTruthy();
    expect(screen.getByText('9 samples')).toBeTruthy();
  });

  it('uses backend confidence_reason and has_data semantics directly', () => {
    render(<TrendHarness />);

    expect(
      screen.getByText('⚠ Backend confidence reason: single chest-strap sample.')
    ).toBeTruthy();
    expect(
      screen.getByText('⚠ Backend says no wearable samples for this week.')
    ).toBeTruthy();
    expect(
      screen.getByText('⚠ Low confidence: sparse sample count for this period.')
    ).toBeTruthy();
    expect(screen.getByTestId('hr-trend-point-2024-W02')).toHaveTextContent('—');
  });
});
