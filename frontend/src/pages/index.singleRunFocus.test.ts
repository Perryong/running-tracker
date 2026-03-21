import { describe, expect, it } from 'vitest';
import { shouldExitSingleRunFocus } from './index';
import type { Activity } from '@/utils/utils';

const buildRun = (run_id: number): Activity =>
  ({
    run_id,
    name: `Run ${run_id}`,
    distance: 1000,
    moving_time: '00:10:00',
    type: 'Run',
    subtype: 'generic',
    start_date: '2026-01-01',
    start_date_local: '2026-01-01 10:00:00',
    location_country: null,
    average_heartrate: 150,
    elevation_gain: 20,
    average_speed: 3,
    streak: 1,
  }) as Activity;

describe('shouldExitSingleRunFocus', () => {
  it('returns true when focused run is excluded by filtered runs', () => {
    expect(shouldExitSingleRunFocus(42, [buildRun(1), buildRun(2)])).toBe(true);
  });

  it('returns false when focused run remains in filtered runs', () => {
    expect(shouldExitSingleRunFocus(2, [buildRun(1), buildRun(2)])).toBe(false);
  });

  it('returns false when there is no single-run focus', () => {
    expect(shouldExitSingleRunFocus(null, [buildRun(1)])).toBe(false);
  });
});
