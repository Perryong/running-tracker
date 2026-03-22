import type { ApiHrPerRunAnalytics } from '@/api/types';
import { formatRunTime } from '@/utils/utils';

interface HeartRateZoneBreakdownProps {
  perRun: ApiHrPerRunAnalytics;
}

const zoneOrder = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'] as const;

const zoneColor = (zone: string): string => {
  switch (zone) {
    case 'Z1':
      return 'bg-blue-200';
    case 'Z2':
      return 'bg-green-200';
    case 'Z3':
      return 'bg-yellow-200';
    case 'Z4':
      return 'bg-orange-300';
    case 'Z5':
      return 'bg-red-400';
    default:
      return 'bg-gray-200';
  }
};

const formatDuration = (seconds: number): string => {
  if (seconds === 0) {
    return '0 min';
  }
  if (seconds % 60 === 0) {
    return `${seconds / 60} min`;
  }
  return formatRunTime(`00:${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`);
};

const percentLabel = (ratio: number): string => `${Math.round(ratio * 100)}%`;

export const HeartRateZoneBreakdown = ({ perRun }: HeartRateZoneBreakdownProps) => {
  const zones = zoneOrder.map((zone) => perRun.zones.find((row) => row.zone === zone)!);

  if (!perRun.has_hr_data) {
    return (
      <section
        className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
        data-testid="hr-zones-empty-state"
      >
        <h2 className="text-lg font-semibold text-[var(--color-brand)]">
          Heart Rate Zones
        </h2>
        <p className="mt-2 text-sm text-[var(--color-secondary)]">
          No heart-rate samples available for this run.
        </p>
        <p className="mt-1 text-xs text-[var(--color-secondary)]">Coverage: 0%</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
      data-testid="hr-zones-ready-state"
    >
      <h2 className="text-lg font-semibold text-[var(--color-brand)]">Heart Rate Zones</h2>

      <div
        className="mt-3 flex h-4 w-full overflow-hidden rounded"
        data-testid="hr-zones-stacked-bar"
      >
        {zones.map((zone) => (
          <div
            key={zone.zone}
            className={zoneColor(zone.zone)}
            data-testid={`hr-zone-segment-${zone.zone}`}
            style={{ width: `${zone.percentage * 100}%` }}
            title={`${zone.zone} ${percentLabel(zone.percentage)}`}
          />
        ))}
      </div>

      <p className="mt-3 text-sm text-[var(--color-secondary)]">
        Analyzed {formatDuration(perRun.analyzed_duration_seconds)} of{' '}
        {formatDuration(perRun.total_duration_seconds)}
      </p>
      <p className="text-xs text-[var(--color-secondary)]">
        Coverage: {percentLabel(perRun.coverage_ratio)}
      </p>
      {perRun.confidence_level === 'low' ? (
        <p className="mt-1 text-xs text-[var(--color-secondary)]">
          Low confidence: {perRun.confidence_reason}
        </p>
      ) : null}

      <table className="mt-4 w-full text-left text-sm" data-testid="hr-zones-table">
        <thead>
          <tr>
            <th className="py-1">Zone</th>
            <th className="py-1">Time</th>
            <th className="py-1">%</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.zone}>
              <td className="py-1" data-testid={`hr-zone-label-${zone.zone}`}>
                {zone.zone}
              </td>
              <td className="py-1">{formatDuration(zone.duration_seconds)}</td>
              <td className="py-1">{percentLabel(zone.percentage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
