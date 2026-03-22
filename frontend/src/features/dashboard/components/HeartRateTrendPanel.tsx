import { useMemo, useState } from 'react';
import type { ApiHrMethodology, ApiHrTrendAnalytics, ApiHrTrendPoint } from '@/api/types';
import { HeartRateMethodologyPanel } from '@/features/activity-detail/components/HeartRateMethodologyPanel';

type TrendPeriod = 'weekly' | 'monthly';

interface HeartRateTrendPanelProps {
  trend: ApiHrTrendAnalytics;
  methodology: ApiHrMethodology;
}

export const HeartRateTrendPanel = ({ trend, methodology }: HeartRateTrendPanelProps) => {
  const [period, setPeriod] = useState<TrendPeriod>(trend.default_period);

  const points: ApiHrTrendPoint[] = useMemo(() => trend.periods[period] ?? [], [period, trend]);
  const hasAnyData = points.some((point) => point.has_data);
  const lowConfidencePoints = points.filter((point) => point.is_low_confidence);

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
            const rounded = point.average_heartrate ? Math.round(point.average_heartrate) : null;
            return (
              <li
                key={point.period_key}
                className="rounded border border-[var(--color-hr-primary)]/30 p-3"
                data-testid={`hr-trend-point-${point.period_key}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-brand)]">
                      {point.period_label}
                    </p>
                    <p className="text-sm text-[var(--color-secondary)]">
                      {rounded !== null ? `${rounded} bpm` : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--color-secondary)]">
                      {point.sample_count} sample
                      {point.sample_count === 1 ? '' : 's'}
                    </p>
                    {point.is_low_confidence ? (
                      <p
                        className="text-xs font-medium text-[var(--color-warning)]"
                        data-testid={`hr-trend-low-confidence-${point.period_key}`}
                      >
                        ⚠ {point.confidence_reason}
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
