import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from './useDashboardFilters';

const ConsumerA = () => {
  const { filters, setYear } = useDashboardFilters();
  return (
    <div>
      <span data-testid="consumer-a-year">{filters.year}</span>
      <button onClick={() => setYear('2024')}>set-year-2024</button>
    </div>
  );
};

const ConsumerB = () => {
  const { filters } = useDashboardFilters();
  return <span data-testid="consumer-b-year">{filters.year}</span>;
};

const renderWithProvider = (children: ReactNode) => {
  return render(<DashboardFiltersProvider>{children}</DashboardFiltersProvider>);
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

  it('rehydrates from popstate URL replay without local drift', () => {
    window.history.replaceState(null, '', '/?year=2021');
    localStorage.clear();

    renderWithProvider(<ConsumerB />);
    expect(screen.getByTestId('consumer-b-year').textContent).toBe('2021');

    window.history.pushState(null, '', '/?year=2022');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(screen.getByTestId('consumer-b-year').textContent).toBe('2022');
  });
});
