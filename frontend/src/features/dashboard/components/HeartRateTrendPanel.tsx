import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ApiHrPerRunAnalytics } from '@/api/types';

interface HeartRateTrendPanelProps {
  perRunAnalytics: ApiHrPerRunAnalytics[] | null;
}

export const HeartRateTrendPanel = ({ perRunAnalytics }: HeartRateTrendPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const zoneData = useMemo(() => {
    if (!perRunAnalytics || perRunAnalytics.length === 0) return null;

    const zoneAggregates: Record<string, { duration: number; percentage: number }> = {
      Z1: { duration: 0, percentage: 0 },
      Z2: { duration: 0, percentage: 0 },
      Z3: { duration: 0, percentage: 0 },
      Z4: { duration: 0, percentage: 0 },
      Z5: { duration: 0, percentage: 0 },
    };

    let totalDuration = 0;
    perRunAnalytics.forEach((run) => {
      run.zones.forEach((zone) => {
        zoneAggregates[zone.zone].duration += zone.duration_seconds;
        totalDuration += zone.duration_seconds;
      });
    });

    Object.keys(zoneAggregates).forEach((zone) => {
      zoneAggregates[zone].percentage = totalDuration > 0 ? (zoneAggregates[zone].duration / totalDuration) * 100 : 0;
    });

    return Object.entries(zoneAggregates).map(([zone, data]) => ({
      name: zone,
      duration: Math.round(data.duration / 60),
      percentage: parseFloat(data.percentage.toFixed(1)),
    }));
  }, [perRunAnalytics]);

  const ZONE_COLORS: Record<string, string> = {
    Z1: '#64b5f6',
    Z2: '#81c784',
    Z3: '#ffb74d',
    Z4: '#e57373',
    Z5: '#ba68c8',
  };

  return (
    <section
      className="my-6 rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
      data-testid="hr-trend-panel"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--color-card-bg)] transition-colors"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand Heart Rate Trend' : 'Collapse Heart Rate Trend'}
          >
            <span className="text-lg">
              {isCollapsed ? '▶' : '▼'}
            </span>
          </button>
          <h2 className="text-xl font-semibold text-[var(--color-brand)]">Heart Rate Trend</h2>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {!zoneData ? (
            <p
              className="mb-4 rounded bg-[var(--color-card-bg)] p-3 text-sm text-[var(--color-secondary)]"
              data-testid="hr-trend-no-data"
            >
              No training zone data for the selected filters.
            </p>
          ) : (
            <div className="mb-2 rounded bg-[var(--color-card-bg)] p-4">
              <h3 className="mb-4 text-lg font-semibold text-[var(--color-brand)]">Training Zone Distribution</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex justify-center" data-testid="hr-zone-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={zoneData}
                        dataKey="percentage"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {zoneData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={ZONE_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div data-testid="hr-zone-breakdown">
                  <h4 className="mb-3 font-semibold text-[var(--color-brand)]">Zone Breakdown</h4>
                  <div className="space-y-2">
                    {zoneData.map((zone) => (
                      <div key={zone.name} className="flex items-center justify-between rounded bg-[var(--color-bg)] p-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: ZONE_COLORS[zone.name] }}
                          />
                          <div>
                            <p className="font-semibold text-[var(--color-brand)]">{zone.name}</p>
                            <p className="text-xs text-[var(--color-secondary)]">{zone.duration} mins</p>
                          </div>
                        </div>
                        <p className="font-semibold text-[var(--color-brand)]">{zone.percentage}%</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1 border-t border-[var(--color-hr-primary)]/20 pt-3 text-xs text-[var(--color-secondary)]">
                    <p><strong>Z1:</strong> 50-60% max HR - Recovery/Easy pace</p>
                    <p><strong>Z2:</strong> 60-70% max HR - Aerobic endurance</p>
                    <p><strong>Z3:</strong> 70-80% max HR - Tempo/Threshold</p>
                    <p><strong>Z4:</strong> 80-90% max HR - Hard intervals</p>
                    <p><strong>Z5:</strong> 90-100% max HR - Maximum effort</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
