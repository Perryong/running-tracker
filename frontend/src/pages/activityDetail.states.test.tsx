import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ActivityPage from './activity';

const useActivityDetailMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/activity-detail/hooks/useActivityDetail', () => ({
  useActivityDetail: useActivityDetailMock,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/RunMap/TemplateMap', () => ({
  default: () => <div>TemplateMap</div>,
}));

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/activity/123?dateRange=2024']}>
      <ActivityPage />
    </MemoryRouter>
  );
};

describe('activity detail page explicit states', () => {
  it('renders stable shell and loading skeleton', () => {
    useActivityDetailMock.mockReturnValue({
      activity: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByTestId('activity-detail-shell')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-header')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-content-shell')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-state-loading')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-skeleton-headline')).toBeTruthy();
  });

  it('renders not-found state and dashboard CTA inside stable shell', () => {
    useActivityDetailMock.mockReturnValue({
      activity: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByTestId('activity-detail-shell')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-header')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-content-shell')).toBeTruthy();
    expect(screen.getByText('Activity not found')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: 'Back to Dashboard' });
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('renders error state with retry and back controls inside stable shell', () => {
    const refetch = vi.fn();
    useActivityDetailMock.mockReturnValue({
      activity: null,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderPage();

    expect(screen.getByTestId('activity-detail-shell')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-header')).toBeTruthy();
    expect(screen.getByTestId('activity-detail-content-shell')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    const buttons = screen.getAllByRole('button', { name: 'Back to Dashboard' });
    expect(buttons.length).toBeGreaterThan(1);
  });
});
