import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from './useDashboardFilters';

const ConsumerA = () => {
  const { filters, setYear, setDateRange, setActivityType } =
    useDashboardFilters();
  return (
    <div>
      <span data-testid="consumer-a-year">{filters.year}</span>
      <span data-testid="consumer-a-date-range">{filters.dateRange}</span>
      <span data-testid="consumer-a-activity-type">{filters.activityType}</span>
      <button onClick={() => setYear('2024')}>set-year-2024</button>
      <button onClick={() => setDateRange('2023')}>set-date-2023</button>
      <button onClick={() => setActivityType('walking')}>
        set-activity-walking
      </button>
    </div>
  );
};

const ConsumerB = () => {
  const { filters } = useDashboardFilters();
  return (
    <div>
      <span data-testid="consumer-b-year">{filters.year}</span>
      <span data-testid="consumer-b-date-range">{filters.dateRange}</span>
      <span data-testid="consumer-b-activity-type">{filters.activityType}</span>
    </div>
  );
};

const renderWithProvider = (children: ReactNode) => {
  return render(
    <DashboardFiltersProvider>{children}</DashboardFiltersProvider>
  );
};

describe('shared dashboard filter provider', () => {
  it('keeps multiple consumers synchronized through one shared state', () => {
    window.history.replaceState(null, '', '/');
    localStorage.clear();

    renderWithProvider(
      <>
        <ConsumerA />
        <ConsumerB />
      </>
    );

    fireEvent.click(screen.getByText('set-year-2024'));

    expect(screen.getByTestId('consumer-a-year').textContent).toBe('2024');
    expect(screen.getByTestId('consumer-b-year').textContent).toBe('2024');
  });

  it('writes deterministic filter query keys on updates', () => {
    window.history.replaceState(null, '', '/');
    localStorage.clear();

    renderWithProvider(<ConsumerA />);
    fireEvent.click(screen.getByText('set-year-2024'));

    expect(window.location.search).toContain('year=2024');
  });

  it('shares dateRange and activityType updates across consumers', () => {
    window.history.replaceState(null, '', '/');
    localStorage.clear();

    renderWithProvider(
      <>
        <ConsumerA />
        <ConsumerB />
      </>
    );

    fireEvent.click(screen.getByText('set-date-2023'));
    fireEvent.click(screen.getByText('set-activity-walking'));

    expect(screen.getByTestId('consumer-a-date-range').textContent).toBe(
      '2023'
    );
    expect(screen.getByTestId('consumer-b-date-range').textContent).toBe(
      '2023'
    );
    expect(screen.getByTestId('consumer-a-activity-type').textContent).toBe(
      'walking'
    );
    expect(screen.getByTestId('consumer-b-activity-type').textContent).toBe(
      'walking'
    );
    expect(window.location.search).toContain('dateRange=2023');
    expect(window.location.search).toContain('activityType=walking');
  });

  it('rehydrates from popstate URL replay without local drift', () => {
    window.history.replaceState(null, '', '/?year=2021');
    localStorage.clear();

    renderWithProvider(<ConsumerB />);
    expect(screen.getByTestId('consumer-b-year').textContent).toBe('2021');

    act(() => {
      window.history.replaceState(null, '', '/?year=2022');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    return waitFor(() => {
      expect(screen.getByTestId('consumer-b-year').textContent).toBe('2022');
    });
  });
});
