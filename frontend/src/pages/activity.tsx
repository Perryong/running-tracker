import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import TemplateMap from '@/components/RunMap/TemplateMap';
import { ActivityDetailSkeleton } from '@/features/activity-detail/components/ActivityDetailSkeleton';
import { ActivityDetailError } from '@/features/activity-detail/components/ActivityDetailError';
import { ActivityDetailNotFound } from '@/features/activity-detail/components/ActivityDetailNotFound';
import { HeartRateMethodologyPanel } from '@/features/activity-detail/components/HeartRateMethodologyPanel';
import { HeartRateZoneBreakdown } from '@/features/activity-detail/components/HeartRateZoneBreakdown';
import { useActivityDetail } from '@/features/activity-detail/hooks/useActivityDetail';
import { getAnalyticsSummary } from '@/api/analytics';
import type { ApiAnalyticsSummary } from '@/api/types';
import { formatPace, formatRunTime, geoJsonForRuns, titleForRun } from '@/utils/utils';

const formatDistance = (distanceMeters: number): string => `${(distanceMeters / 1000).toFixed(2)} km`;

const formatHeartRate = (heartRate: number | null | undefined): { value: string; helper: string | null } => {
  if (heartRate === null || heartRate === undefined) {
    return { value: '—', helper: 'No HR data' };
  }
  return { value: `${Math.round(heartRate)} bpm`, helper: null };
};

const formatElevation = (elevationGain: number | null): string => {
  if (elevationGain === null) {
    return '—';
  }
  return `${Math.round(elevationGain)} m`;
};

const ActivityPage = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const parsedRunId = runId && /^\d+$/.test(runId) ? Number(runId) : null;
  const fromDashboard = Boolean((location.state as { fromDashboard?: boolean } | null)?.fromDashboard);

  const { activity, isLoading, isError, refetch } = useActivityDetail(parsedRunId);
  const [hrSummary, setHrSummary] = useState<ApiAnalyticsSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (parsedRunId === null) {
      setHrSummary(null);
      return () => {
        cancelled = true;
      };
    }
    void getAnalyticsSummary()
      .then((response) => {
        if (!cancelled) {
          setHrSummary(response.summary);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHrSummary(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [parsedRunId]);
  const handleBack = () => {
    if (fromDashboard) {
      navigate(-1);
      return;
    }
    navigate({
      pathname: '/',
      search: location.search,
    });
  };

  let state: 'loading' | 'error' | 'not-found' | 'ready' = 'ready';
  if (isLoading) {
    state = 'loading';
  } else if (isError) {
    state = 'error';
  } else if (!activity) {
    state = 'not-found';
  }
  const hrSectionEnabled = state === 'ready' && activity !== null;

  const heartRate = formatHeartRate(activity?.average_heartrate ?? null);
  const perRunHr =
    parsedRunId !== null
      ? hrSummary?.heart_rate.per_run.find((entry) => entry.run_id === parsedRunId) ?? null
      : null;

  return (
    <Layout>
      <main className="w-full" data-testid="activity-detail-shell">
        <header className="mb-6" data-testid="activity-detail-header">
          <button
            type="button"
            onClick={handleBack}
            className="inline-block text-sm font-medium text-[var(--color-brand)] underline"
          >
            Back to Dashboard
          </button>
        </header>

        <section className="w-full space-y-6" data-testid="activity-detail-content-shell">
          {state === 'loading' && <ActivityDetailSkeleton />}

          {state === 'error' && (
            <ActivityDetailError onBack={handleBack} onRetry={() => void refetch()} />
          )}

          {state === 'not-found' && <ActivityDetailNotFound onBack={handleBack} />}

          {state === 'ready' && activity && (
            <div className="space-y-6" data-testid="activity-detail-state-ready">
              <section
                className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
                data-testid="activity-detail-headline"
              >
                <h1 className="mb-4 text-2xl font-semibold text-[var(--color-brand)]">
                  {titleForRun(activity)}
                </h1>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <article data-testid="metric-distance">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">
                      Distance
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-brand)]">
                      {formatDistance(activity.distance)}
                    </p>
                  </article>
                  <article data-testid="metric-moving-time">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">
                      Moving time
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-brand)]">
                      {formatRunTime(activity.moving_time)}
                    </p>
                  </article>
                  <article data-testid="metric-average-pace">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">
                      Average pace
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-brand)]">
                      {formatPace(activity.average_speed)} /km
                    </p>
                  </article>
                  <article data-testid="metric-average-heart-rate">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">
                      Average heart rate
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-brand)]">
                      {heartRate.value}
                    </p>
                    {heartRate.helper ? (
                      <p className="mt-1 text-xs text-[var(--color-secondary)]">
                        {heartRate.helper}
                      </p>
                    ) : null}
                  </article>
                </div>
              </section>

              <section
                className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
                data-testid="activity-detail-secondary-metrics"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">
                  Elevation gain
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-brand)]">
                  {formatElevation(activity.elevation_gain)}
                </p>
              </section>

              {hrSectionEnabled && perRunHr ? (
                <HeartRateZoneBreakdown perRun={perRunHr} />
              ) : null}

              {hrSectionEnabled && hrSummary?.heart_rate.methodology ? (
                <HeartRateMethodologyPanel
                  methodology={hrSummary.heart_rate.methodology}
                />
              ) : null}

              <section
                className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
                data-testid="activity-detail-map"
              >
                <TemplateMap title={titleForRun(activity)} geoData={geoJsonForRuns([activity])} />
              </section>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default ActivityPage;
