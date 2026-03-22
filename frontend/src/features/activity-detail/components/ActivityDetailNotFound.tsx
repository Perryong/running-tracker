interface ActivityDetailNotFoundProps {
  onBack: () => void;
}

export const ActivityDetailNotFound = ({
  onBack,
}: ActivityDetailNotFoundProps) => {
  return (
    <section
      className="rounded-md border border-dashed border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-6"
      data-testid="activity-detail-state-not-found"
    >
      <h2 className="text-2xl font-semibold text-[var(--color-brand)]">
        Activity not found
      </h2>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        We couldn&apos;t find an activity for this run ID.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-block rounded-md border border-[var(--color-hr-primary)] px-3 py-2 text-sm text-[var(--color-brand)]"
      >
        Back to Dashboard
      </button>
    </section>
  );
};
