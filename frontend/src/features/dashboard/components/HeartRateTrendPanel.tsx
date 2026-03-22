import { useMemo, useState } from 'react';
import type { ApiHrMethodology, ApiHrTrendPoint } from '@/api/types';
import type { Activity } from '@/utils/utils';
import { HeartRateMethodologyPanel } from '@/features/activity-detail/components/HeartRateMethodologyPanel';

type TrendPeriod = 'weekly' | 'monthly';

interface HeartRateTrendPanelProps {
  runs: Activity[];
  methodology: ApiHrMethodology;
  lowConfidenceSampleThreshold?: number;
}

interface TrendPoint {
  periodKey: string;
  periodLabel: string;
  averageHeartrate: number | null;
  sampleCount: number;
  isLowConfidence: boolean;
  hasData: boolean;
  confidenceReason: string;
  runIds: number[];
}

const DEFAULT_LOW_SAMPLE_THRESHOLD = 2;

const toWeekStart = (dateText: string): string => {
  const date = new Date(dateText.replace(' ', 'T'));
  const normalized = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = normalized.getUTCDay();
  const delta = day === 0 ? 6 : day - 1;
  normalized.setUTCDate(normalized.getUTCDate() - delta);
  return normalized.toISOString().slice(0, 10);
};

const toMonthKey = (dateText: string): string => {
  const date = new Date(dateText.replace(' ', 'T'));
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
};

const buildTrendPoints = (
  runs: Activity[],
  period: TrendPeriod,
  lowConfidenceSampleThreshold: number
): TrendPoint[] => {
  const grouped = new Map<
    string,
    { periodLabel: string; sampleValues: number[]; runIds: number[] }
  >();

  runs.forEach((run) => {
    const key =
      period === 'weekly' ? toWeekStart(run.start_date_local) : toMonthKey(run.start_date_local);
    const group = grouped.get(key) ?? {
      periodLabel: key,
      sampleValues: [],
      runIds: [],
    };
    group.runIds.push(run.run_id);
    if (run.average_heartrate !== null && run.average_heartrate !== undefined) {
      group.sampleValues.push(run.average_heartrate);
    }
    grouped.set(key, group);
  });

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([periodKey, group]) => {
      const sampleCount = group.sampleValues.length;
      const hasData = sampleCount > 0;
      const averageHeartrate = hasData
        ? group.sampleValues.reduce((sum, value) => sum + value, 0) / sampleCount
        : null;
      const isLowConfidence = sampleCount < lowConfidenceSampleThreshold;
      const confidenceReason = hasData
        ? isLowConfidence
          ? 'Sparse sample count for this period.'
          : 'Sufficient sample count for this period.'
        : 'No heart-rate samples are available for this period.';

      return {
        periodKey,
        periodLabel: group.periodLabel,
        averageHeartrate,
        sampleCount,
        isLowConfidence,
        hasData,
        confidenceReason,
        runIds: group.runIds,
      };
    });
};

const toApiTrendPoint = (point: TrendPoint): ApiHrTrendPoint => ({
  period_key: point.periodKey,
  period_label: point.periodLabel,
  average_heartrate: point.averageHeartrate,
  sample_count: point.sampleCount,
  is_low_confidence: point.isLowConfidence,
  has_data: point.hasData,
  confidence_reason: point.confidenceReason,
  run_ids: point.runIds,
});

export const HeartRateTrendPanel = ({
  runs,
  methodology,
  lowConfidenceSampleThreshold = DEFAULT_LOW_SAMPLE_THRESHOLD,
}: HeartRateTrendPanelProps) => {
  const [period, setPeriod] = useState<TrendPeriod>('weekly');

  const trend = useMemo(() => {
    return {
      weekly: buildTrendPoints(runs, 'weekly', lowConfidenceSampleThreshold),
      monthly: buildTrendPoints(runs, 'monthly', lowConfidenceSampleThreshold),
    };
  }, [runs, lowConfidenceSampleThreshold]);

  const points = period === 'weekly' ? trend.weekly : trend.monthly;
  const hasAnyData = points.some((point) => point.hasData);
  const lowConfidencePoints = points.filter((point) => point.isLowConfidence);

  return (
    <section
      className="my-6 rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
      data-testid="hr-trend-panel"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--color-brand)]">Heart Rate Trend</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            aria-pressed={period === 'weekly'}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            aria-pressed={period === 'monthly'}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      {!hasAnyData ? (
        <p
          className="mb-4 rounded bg-[var(--color-card-bg)] p-3 text-sm text-[var(--color-secondary)]"
          data-testid="hr-trend-no-data"
        >
          No heart-rate trend data for the selected filters.
        </p>
      ) : (
        <ul className="space-y-2" data-testid={`hr-trend-list-${period}`}>
          {points.map((point) => {
            const apiPoint = toApiTrendPoint(point);
            const rounded = apiPoint.average_heartrate
              ? Math.round(apiPoint.average_heartrate)
              : null;
            return (
              <li
                key={apiPoint.period_key}
                className="rounded border border-[var(--color-hr-primary)]/30 p-3"
                data-testid={`hr-trend-point-${apiPoint.period_key}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-brand)]">
                      {apiPoint.period_label}
                    </p>
                    <p className="text-sm text-[var(--color-secondary)]">
                      {rounded !== null ? `${rounded} bpm` : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--color-secondary)]">
                      {apiPoint.sample_count} sample
                      {apiPoint.sample_count === 1 ? '' : 's'}
                    </p>
                    {apiPoint.is_low_confidence ? (
                      <p
                        className="text-xs font-medium text-[var(--color-warning)]"
                        data-testid={`hr-trend-low-confidence-${apiPoint.period_key}`}
                      >
                        ⚠ {apiPoint.confidence_reason}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lowConfidencePoints.length > 0 ? (
        <p className="mt-3 text-xs text-[var(--color-warning)]">
          ⚠ Low confidence: sparse sample count for this period.
        </p>
      ) : null}

      <div className="mt-4">
        <HeartRateMethodologyPanel methodology={methodology} />
      </div>
    </section>
  );
};
