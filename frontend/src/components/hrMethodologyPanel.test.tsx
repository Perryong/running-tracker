import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeartRateMethodologyPanel } from '@/features/activity-detail/components/HeartRateMethodologyPanel';

describe('HeartRateMethodologyPanel', () => {
  it('shows formula, boundaries, max-HR source, and estimated badge when fallback applies', () => {
    render(
      <HeartRateMethodologyPanel
        methodology={{
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
        }}
      />
    );

    expect(screen.getByText('Methodology & Provenance')).toBeTruthy();
    expect(screen.getByText('Model: max_hr_percentage_5_zone')).toBeTruthy();
    expect(screen.getByText('Z1')).toBeTruthy();
    expect(screen.getByText('50–60%')).toBeTruthy();
    expect(screen.getByText('Z5')).toBeTruthy();
    expect(screen.getByText('90–100%')).toBeTruthy();
    expect(screen.getByText('Max HR source: default_fallback')).toBeTruthy();
    expect(screen.getByText('Estimated zones')).toBeTruthy();
  });

  it('does not show estimated badge when values are user-configured and not estimated', () => {
    render(
      <HeartRateMethodologyPanel
        methodology={{
          model: 'max_hr_percentage_5_zone',
          zone_time_basis: 'hr_samples',
          max_hr_value: 188,
          max_hr_source: 'user_configured',
          estimated: false,
          zone_boundaries_pct: {
            z1: [50, 60],
            z2: [60, 70],
            z3: [70, 80],
            z4: [80, 90],
            z5: [90, 100],
          },
        }}
      />
    );

    expect(screen.queryByText('Estimated zones')).toBeNull();
    expect(screen.getByText('Max HR source: user_configured')).toBeTruthy();
  });

  it('is reusable in trend context with same trust language', () => {
    render(
      <div>
        <p>Trend context</p>
        <HeartRateMethodologyPanel
          methodology={{
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
          }}
        />
      </div>
    );

    expect(screen.getByText('Trend context')).toBeTruthy();
    expect(screen.getByText('Methodology & Provenance')).toBeTruthy();
    expect(
      screen.getByText('Zone basis: estimated_from_average_hr')
    ).toBeTruthy();
    expect(screen.getByText('Estimated zones')).toBeTruthy();
  });
});
