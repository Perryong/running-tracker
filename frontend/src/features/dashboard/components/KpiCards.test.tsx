import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCards } from './KpiCards';
import { EmptyKpiState } from './EmptyKpiState';

describe('KpiCards', () => {
  it('renders four KPI cards in required order with value-only content', () => {
    render(
      <KpiCards
        kpis={{
          totalDistance: 42195,
          totalDurationSec: 7265,
          runCount: 7,
          averageHeartRate: 154,
        }}
      />
    );

    const labels = screen
      .getAllByTestId(/^kpi-label-/)
      .map((node) => node.textContent);
    expect(labels).toEqual([
      'Distance',
      'Duration',
      'Runs',
      'Average heart rate',
    ]);

    expect(screen.getByTestId('kpi-value-distance').textContent).toContain('km');
    expect(screen.getByTestId('kpi-value-duration').textContent).toContain('h');
    expect(screen.getByTestId('kpi-value-runs').textContent).toBe('7');
    expect(screen.getByTestId('kpi-value-avg-hr').textContent).toContain('bpm');
    expect(screen.queryByText(/trend|delta|sparkline|%/i)).toBeNull();
  });

  it('uses locked responsive layout classes for desktop and mobile density', () => {
    render(
      <KpiCards
        kpis={{
          totalDistance: 1000,
          totalDurationSec: 600,
          runCount: 1,
          averageHeartRate: null,
        }}
      />
    );

    const container = screen.getByTestId('kpi-cards-grid');
    expect(container.className).toContain('grid-cols-2');
    expect(container.className).toContain('lg:grid-cols-4');
  });
});

describe('EmptyKpiState', () => {
  it('renders explicit zero-results copy without altering filters', () => {
    render(<EmptyKpiState />);

    expect(screen.getByText(/no runs match your current filters/i)).toBeTruthy();
    expect(
      screen.getByText(/adjust year, activity type, city, or title/i)
    ).toBeTruthy();
  });
});
