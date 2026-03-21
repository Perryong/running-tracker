import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import activities from '@data/activities.json';
import useActivities from './useActivities';

vi.mock('@/api/activities', () => ({
  getActivities: vi.fn(),
}));

const getActivitiesMock = vi.hoisted(() => vi.fn());

vi.mock('@/api/activities', () => ({
  getActivities: getActivitiesMock,
}));

describe('useActivities', () => {
  it('falls back to static activities json when api request fails', async () => {
    getActivitiesMock.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useActivities());

    await waitFor(() => {
      expect(result.current.activities.length).toBeGreaterThan(0);
    });

    expect(result.current.activities).toEqual(activities);
    expect(result.current.freshness.completeness).toBe('unavailable');
  });
});
