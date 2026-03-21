export const EmptyKpiState = () => {
  return (
    <section
      className="mb-6 rounded-md border border-dashed border-[var(--color-hr-primary)] bg-[var(--color-bg)] px-4 py-5"
      data-testid="kpi-empty-state"
    >
      <h2 className="text-lg font-semibold text-[var(--color-brand)]">
        No runs match your current filters.
      </h2>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Adjust year, activity type, city, or title to see results while keeping
        your current filter context.
      </p>
    </section>
  );
};
