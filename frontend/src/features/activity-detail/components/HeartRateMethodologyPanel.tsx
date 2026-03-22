import type { ApiHrMethodology } from '@/api/types';

interface HeartRateMethodologyPanelProps {
  methodology: ApiHrMethodology;
}

const zoneOrder: Array<keyof ApiHrMethodology['zone_boundaries_pct']> = [
  'z1',
  'z2',
  'z3',
  'z4',
  'z5',
];

export const HeartRateMethodologyPanel = ({
  methodology,
}: HeartRateMethodologyPanelProps) => {
  return (
    <section
      className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
      data-testid="hr-methodology-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-brand)]">
          Methodology &amp; Provenance
        </h2>
        {methodology.estimated ? (
          <span className="rounded bg-[var(--color-hr-primary)] px-2 py-1 text-xs font-medium text-white">
            Estimated zones
          </span>
        ) : null}
      </div>

      <p className="text-sm text-[var(--color-secondary)]">
        Model: {methodology.model}
      </p>
      <p className="text-sm text-[var(--color-secondary)]">
        Zone basis: {methodology.zone_time_basis}
      </p>
      <p className="text-sm text-[var(--color-secondary)]">
        Max HR source: {methodology.max_hr_source}
      </p>
      <p className="text-sm text-[var(--color-secondary)]">
        Max HR value: {methodology.max_hr_value} bpm
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
        {zoneOrder.map((zoneKey, idx) => {
          const [lower, upper] = methodology.zone_boundaries_pct[zoneKey];
          return (
            <div
              key={zoneKey}
              className="rounded border border-[var(--color-hr-primary)]/30 p-2 text-sm"
            >
              <p className="font-medium text-[var(--color-brand)]">Z{idx + 1}</p>
              <p className="text-[var(--color-secondary)]">
                {lower}–{upper}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
