export const ActivityDetailSkeleton = () => {
  return (
    <div className="space-y-6" data-testid="activity-detail-state-loading">
      <section
        className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
        data-testid="activity-detail-skeleton-headline"
      >
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-[var(--color-secondary)]/20" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-md border border-[var(--color-hr-primary)] p-3">
              <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-secondary)]/20" />
              <div className="mt-2 h-6 w-24 animate-pulse rounded bg-[var(--color-secondary)]/20" />
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
        data-testid="activity-detail-skeleton-secondary"
      >
        <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-secondary)]/20" />
        <div className="mt-3 h-6 w-28 animate-pulse rounded bg-[var(--color-secondary)]/20" />
      </section>

      <section
        className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-4"
        data-testid="activity-detail-skeleton-map"
      >
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-secondary)]/20" />
        <div className="mt-3 h-52 animate-pulse rounded bg-[var(--color-secondary)]/20" />
      </section>
    </div>
  );
};
