import { convertMovingTime2Sec, type Activity } from '@/utils/utils';

export interface DashboardKpis {
  totalDistance: number;
  totalDurationSec: number;
  runCount: number;
  averageHeartRate: number | null;
}

export const selectKpis = (runs: Activity[]): DashboardKpis => {
  const totals = runs.reduce(
    (acc, run) => {
      acc.totalDistance += run.distance;
      acc.totalDurationSec += convertMovingTime2Sec(run.moving_time);
      if (typeof run.average_heartrate === 'number') {
        acc.heartRateTotal += run.average_heartrate;
        acc.heartRateCount += 1;
      }
      return acc;
    },
    {
      totalDistance: 0,
      totalDurationSec: 0,
      heartRateTotal: 0,
      heartRateCount: 0,
    }
  );

  return {
    totalDistance: totals.totalDistance,
    totalDurationSec: totals.totalDurationSec,
    runCount: runs.length,
    averageHeartRate:
      totals.heartRateCount > 0
        ? Math.round(totals.heartRateTotal / totals.heartRateCount)
        : null,
  };
};
