import type { DashboardKpis } from '@/features/dashboard/selectors/selectKpis';

const formatDistanceKm = (distanceMeters: number): string => {
  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

const formatDuration = (totalDurationSec: number): string => {
  const hours = Math.floor(totalDurationSec / 3600);
  const minutes = Math.floor((totalDurationSec % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const formatAvgHeartRate = (averageHeartRate: number | null): string => {
  if (averageHeartRate === null) {
    return 'N/A';
  }
  return `${averageHeartRate} bpm`;
};

export const KpiCards = ({ kpis }: { kpis: DashboardKpis }) => {
  const cards = [
    { key: 'distance', label: 'Distance', value: formatDistanceKm(kpis.totalDistance) },
    { key: 'duration', label: 'Duration', value: formatDuration(kpis.totalDurationSec) },
    { key: 'runs', label: 'Runs', value: String(kpis.runCount) },
    {
      key: 'avg-hr',
      label: 'Average heart rate',
      value: formatAvgHeartRate(kpis.averageHeartRate),
    },
  ];

  return (
    <section
      className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
      data-testid="kpi-cards-grid"
    >
      {cards.map((card) => (
        <article
          key={card.key}
          className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] px-4 py-3"
        >
          <p
            className="text-xs uppercase tracking-wide text-[var(--color-secondary)]"
            data-testid={`kpi-label-${card.key}`}
          >
            {card.label}
          </p>
          <p
            className="mt-2 text-2xl font-semibold text-[var(--color-brand)]"
            data-testid={`kpi-value-${card.key}`}
          >
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
};
