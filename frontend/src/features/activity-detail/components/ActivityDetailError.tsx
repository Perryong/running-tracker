import { Link } from 'react-router-dom';

interface ActivityDetailErrorProps {
  backHref: string;
  onRetry: () => void;
}

export const ActivityDetailError = ({ backHref, onRetry }: ActivityDetailErrorProps) => {
  return (
    <section
      className="rounded-md border border-[var(--color-hr-primary)] bg-[var(--color-bg)] p-6"
      data-testid="activity-detail-state-error"
    >
      <h2 className="text-2xl font-semibold text-[var(--color-brand)]">
        Unable to load activity
      </h2>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        There was a network problem loading this activity.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-[var(--color-hr-primary)] px-3 py-2 text-sm text-[var(--color-brand)]"
        >
          Retry
        </button>
        <Link
          to={backHref}
          className="rounded-md border border-[var(--color-hr-primary)] px-3 py-2 text-sm text-[var(--color-brand)]"
        >
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
};
