import { describe, expect, it } from 'vitest';
import { DEFAULT_DASHBOARD_FILTERS } from './model';
import {
  DASHBOARD_FILTERS_STORAGE_KEY,
  decodeFiltersFromUrl,
  encodeFiltersToUrl,
  hasEncodedFiltersChanged,
  hydrateFilters,
  withUpdatedSearch,
} from './serialize';

describe('dashboard filter persistence semantics', () => {
  it('uses a versioned localStorage key', () => {
    expect(DASHBOARD_FILTERS_STORAGE_KEY).toBe('dashboard.filters.v1');
  });

  it('encodes and decodes deterministic url params', () => {
    const encoded = encodeFiltersToUrl({
      ...DEFAULT_DASHBOARD_FILTERS,
      year: '2025',
      activityType: 'Run',
      city: 'Shanghai',
      title: 'Morning Run',
    });

    expect(decodeFiltersFromUrl(encoded)).toEqual({
      dateRange: 'all',
      year: '2025',
      activityType: 'Run',
      city: 'Shanghai',
      title: 'Morning Run',
    });
  });

  it('prefers url values over localStorage when url carries filter keys', () => {
    const hydrated = hydrateFilters({
      search: '?year=2024&activityType=walking',
      storageRaw: JSON.stringify({
        year: '2020',
        activityType: 'cycling',
        city: 'Boston',
        title: 'Evening Run',
      }),
    });

    expect(hydrated).toEqual({
      dateRange: 'all',
      year: '2024',
      activityType: 'walking',
      city: 'all',
      title: 'all',
    });
  });

  it('falls back to localStorage when url has no filter keys', () => {
    const hydrated = hydrateFilters({
      search: '',
      storageRaw: JSON.stringify({
        year: '2023',
        activityType: 'Run',
        city: 'Beijing',
        title: 'Lunch Run',
      }),
    });

    expect(hydrated).toEqual({
      dateRange: 'all',
      year: '2023',
      activityType: 'Run',
      city: 'Beijing',
      title: 'Lunch Run',
    });
  });

  it('sanitizes invalid url and storage values without throwing', () => {
    expect(() =>
      hydrateFilters({
        search: '?year=invalid&city=',
        storageRaw: 'not-json',
      })
    ).not.toThrow();

    expect(
      hydrateFilters({
        search: '?year=invalid&city=',
        storageRaw: 'not-json',
      })
    ).toEqual(DEFAULT_DASHBOARD_FILTERS);
  });

  it('deterministically replays back-forward states from url', () => {
    const first = decodeFiltersFromUrl('?year=2022&title=First');
    const second = decodeFiltersFromUrl('?year=2025&title=Second');
    const replayed = decodeFiltersFromUrl('?year=2022&title=First');

    expect(first).not.toEqual(second);
    expect(replayed).toEqual(first);
  });

  it('has an equality guard to avoid unnecessary url sync loops', () => {
    expect(
      hasEncodedFiltersChanged('?year=2024', {
        ...DEFAULT_DASHBOARD_FILTERS,
        year: '2024',
      })
    ).toBe(false);

    expect(
      hasEncodedFiltersChanged('?year=2025', {
        ...DEFAULT_DASHBOARD_FILTERS,
        year: '2024',
      })
    ).toBe(true);
  });

  it('preserves hash while updating search unless explicitly cleared', () => {
    expect(withUpdatedSearch('/?year=2024#run_12', '?year=2025')).toBe(
      '/?year=2025#run_12'
    );
    expect(
      withUpdatedSearch('/?year=2024#run_12', '?year=2025', { clearHash: true })
    ).toBe('/?year=2025');
  });
});
