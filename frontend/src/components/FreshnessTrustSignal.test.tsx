import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ApiFreshness } from '@/api/types';
import { FreshnessTrustSignal } from './FreshnessTrustSignal';

const buildFreshness = (
  overrides: Partial<ApiFreshness> = {}
): ApiFreshness => ({
  completeness: 'complete',
  last_sync_at: '2026-03-21T10:28:00Z',
  ...overrides,
});

describe('FreshnessTrustSignal', () => {
  it('renders complete message and last sync text', () => {
    render(<FreshnessTrustSignal freshness={buildFreshness()} />);

    expect(screen.getByText(/Data is up to date/i)).toBeTruthy();
    expect(screen.getByText(/Last synced: 2026-03-21T10:28:00Z/i)).toBeTruthy();
  });

  it('renders partial-data warning and last sync text', () => {
    render(
      <FreshnessTrustSignal
        freshness={buildFreshness({ completeness: 'partial' })}
      />
    );

    expect(screen.getByText(/Data may be incomplete/i)).toBeTruthy();
    expect(screen.getByText(/Last synced: 2026-03-21T10:28:00Z/i)).toBeTruthy();
  });

  it('renders unavailable copy and timestamp fallback', () => {
    render(
      <FreshnessTrustSignal
        freshness={buildFreshness({
          completeness: 'unavailable',
          last_sync_at: '',
        })}
      />
    );

    expect(
      screen.getByText(/Data freshness is currently unavailable/i)
    ).toBeTruthy();
    expect(screen.getByText(/Last synced: unavailable/i)).toBeTruthy();
  });
});
